import {
  array,
  boolean,
  enum as zodEnum,
  isoDateTimeZod,
  isoDateZod,
  number,
  object,
  objectIdZod,
  record,
  string,
  unknown,
} from '@beautinique/shared-zod';

import { defineEvent } from '../events';
import { cursorPage, cursorQuery } from '../http';
import { definePermission } from '../permissions';
import { APPS, DEPLOYABLES } from '../platform';
import { csvFileZod, defineRoute } from '../routes';
import { roleKeyZod, scopeZod } from './rbac';

/**
 * The audit log (ARCHITECTURE §6.5, TASKS T4.1): append-only, one hash chain a day (UTC), kept 400
 * days. Core writes it in the transaction of its own changes; identity sends its staff and
 * security actions as `identity.audit.recorded` events (owner, 2026-11-15). Read in the Master app
 * by Master and the Internal Auditor.
 */

export const auditRead = definePermission({
  key: 'audit.entry.read',
  description: 'Read the audit log',
  scopeTypes: ['global'],
  risk: 'high',
  mfa: false,
  secondSignature: false,
});

/**
 * Download the audit log as a CSV file (T4.1 PR D): Master and the Internal Auditor, each time
 * with a step-up (owner, 2026-11-15); every export is an audit entry of its own.
 */
export const auditExport = definePermission({
  key: 'audit.entry.export',
  description: 'Download the audit log as a CSV file',
  scopeTypes: ['global'],
  risk: 'high',
  mfa: true,
  secondSignature: false,
});

export const AUDIT_PERMISSIONS = [auditRead, auditExport] as const;

/** How the action ended: done, refused by a rule, or broken on the way. */
export const AUDIT_RESULTS = ['success', 'denied', 'failed'] as const;
export type AuditResult = (typeof AUDIT_RESULTS)[number];

/** The days an audit entry is kept (a TTL index; ARCHITECTURE §6.5). */
export const AUDIT_RETENTION_DAYS = 400;

/**
 * The most entries one CSV export holds (ARCHITECTURE §6.5): more matching the filters is a 422
 * (`EXPORT_TOO_LARGE`), never a file cut short (owner, 2026-11-15).
 */
export const AUDIT_EXPORT_MAX_ROWS = 50_000;

/** What each action is called in the viewer and the CSV; one not named yet shows as its key. */
export const AUDIT_ACTION_NAMES: Readonly<Record<string, string>> = {
  'iam.grants.give': 'Role given',
  'iam.grants.end': 'Role ended',
  'iam.roles.create': 'Sub-role made',
  'iam.roles.update': 'Sub-role changed',
  'iam.invitations.create': 'Invitation sent',
  'iam.invitations.revoke': 'Invitation taken back',
  'iam.invitations.accept': 'Invitation accepted',
  'iam.users.resetAuthenticator': 'Authenticator reset',
  'iam.users.endSessions': 'Sessions ended',
  'identity.session.signedIn': 'Signed in',
  'identity.session.reuseDetected': 'Copied session stopped',
  'audit.entries.export': 'Audit log downloaded',
};

/** The most days one look at the chain checks covers (`GET /audit/days`). */
export const AUDIT_DAYS_MAX = 92;

/** Who did it: a signed-in person (with the roles they held in that app), or the system. */
export const auditActorZod = object({
  /** null when the system did it */
  userId: objectIdZod.nullable(),
  app: zodEnum(APPS).nullable(),
  sessionId: objectIdZod.nullable(),
  /** The actor's role keys in `app` at that moment */
  roles: array(roleKeyZod).max(50),
  /** Which part of the system acted, when no person did (`identity`, `core.audit` ...) */
  system: string().min(1).max(40).nullable(),
});

/**
 * One audit record as its producer sends it. `before` and `after` are what changed, with personal
 * data half hidden (maskForAudit; owner, 2026-11-15); the IP and the actor's id stay whole, for a
 * security look later.
 */
export const auditRecordZod = object({
  /** A permission key (`iam.grant.give`) or a named event (`identity.session.signedIn`) */
  action: string().min(1).max(100),
  actor: auditActorZod,
  /** What it was done to: a type and its id (an ObjectId as text, a state code ...) */
  resource: object({ type: string().min(1).max(40), id: string().min(1).max(100).nullable() }),
  scope: scopeZod.nullable(),
  before: record(string(), unknown()).nullable(),
  after: record(string(), unknown()).nullable(),
  reason: string().max(500).nullable(),
  result: zodEnum(AUDIT_RESULTS),
  ip: string().max(64).nullable(),
  userAgent: string().max(300).nullable(),
  requestId: string().max(100).nullable(),
  at: isoDateTimeZod,
});

/** Identity's staff and security actions for the audit log (TASKS T4.1 PR C). */
export const auditRecorded = defineEvent({
  type: 'identity.audit.recorded',
  version: 1,
  producer: 'identity',
  description:
    'Identity did something the audit log keeps (a grant, a role, an invitation, an authenticator reset, an internal sign-in)',
  data: auditRecordZod,
});

/** One audit entry as the viewer reads it. */
export const auditEntryViewZod = auditRecordZod.extend({
  entryId: objectIdZod,
  /** Its chain: the UTC day and its place in that day's chain, and its hash */
  day: isoDateZod,
  seq: number().int().min(1),
  hash: string(),
  /** Which deployable wrote it */
  source: zodEnum(DEPLOYABLES),
  actor: auditActorZod.extend({
    /** The actor's email, half hidden (maskForAudit), from core's copy of the account */
    email: string().nullable(),
  }),
});

/** Which entries a list or an export holds: by time, who, what, which thing and how it ended. */
export const auditFiltersZod = object({
  from: isoDateTimeZod.optional(),
  to: isoDateTimeZod.optional(),
  actorId: objectIdZod.optional(),
  action: string().min(1).max(100).optional(),
  resourceType: string().min(1).max(40).optional(),
  resourceId: string().min(1).max(100).optional(),
  result: zodEnum(AUDIT_RESULTS).optional(),
});

export const listAuditEntries = defineRoute({
  id: 'audit.entries.list',
  method: 'GET',
  path: '/audit/entries',
  summary: 'The audit log, newest first',
  apps: ['master'],
  access: { type: 'permission', permission: auditRead.key },
  rateLimit: 'read',
  idempotency: false,
  stepUp: auditRead.mfa,
  owner: 'core',
  input: { query: cursorQuery.extend(auditFiltersZod.shape) },
  output: cursorPage(auditEntryViewZod),
});

/**
 * The log as a CSV file (T4.1 PR D): the list's filters, newest first, at most
 * AUDIT_EXPORT_MAX_ROWS entries, each with what changed (personal data half hidden, as stored),
 * named `beautinique-audit-log-<today in India>.csv`.
 */
export const exportAuditEntries = defineRoute({
  id: 'audit.entries.export',
  method: 'GET',
  path: '/audit/entries/export',
  summary: 'The audit log as a CSV file, by the same filters as the list',
  apps: ['master'],
  access: { type: 'permission', permission: auditExport.key },
  rateLimit: 'search',
  idempotency: false,
  stepUp: auditExport.mfa,
  owner: 'core',
  download: 'csv',
  input: { query: auditFiltersZod },
  output: csvFileZod,
});

/** A day's chain check: the daily task counts the day's entries again and follows its hashes. */
export const auditDayCheckZod = object({
  ok: boolean(),
  entries: number().int().min(0),
  /** The first entry whose hash did not follow, when the chain is broken */
  brokenAtSeq: number().int().min(1).nullable(),
  checkedAt: isoDateTimeZod,
});

export const listAuditDays = defineRoute({
  id: 'audit.days.list',
  method: 'GET',
  path: '/audit/days',
  summary: 'Each day of the audit log, with its hash chain check',
  apps: ['master'],
  access: { type: 'permission', permission: auditRead.key },
  rateLimit: 'read',
  idempotency: false,
  stepUp: auditRead.mfa,
  owner: 'core',
  input: { query: object({ from: isoDateZod, to: isoDateZod }) },
  output: object({
    items: array(
      object({
        day: isoDateZod,
        /** Entries written that day (the chain's length) */
        entries: number().int().min(0),
        /** null: not checked yet (today, or the task has not run) */
        check: auditDayCheckZod.nullable(),
      }),
    ),
  }),
});

export const AUDIT_ROUTES = [listAuditEntries, exportAuditEntries, listAuditDays] as const;
export const AUDIT_EVENTS = [auditRecorded] as const;

const EMAIL = /^([^\s@])[^\s@]*(@[^\s@]+\.[^\s@]+)$/;
const PHONE_KEYS = /^(phone|mobile|phoneNumber|mobileNumber|contactNumber|whatsapp)$/i;
/** Names, addresses and identity documents: hidden whole (owner, 2026-11-15). */
const HIDDEN_KEYS =
  /^(fullName|firstName|lastName|middleName|displayName|personName|legalName|address|addressLine\d*|line\d|street|landmark|pan|panNumber|aadhaar\w*|bankAccount\w*|accountNumber|ifsc|dob|dateOfBirth|birthDate)$/i;
const HIDDEN = '[hidden]';

/** `nagesh@gmail.com` → `n•••@gmail.com` (the first letter and the domain). */
export function maskEmail(email: string): string {
  const match = EMAIL.exec(email);
  return match ? `${match[1] ?? ''}•••${match[2] ?? ''}` : email;
}

/** `+91 98765 43210` → `••••••3210` (the last 4 digits). */
export function maskPhone(phone: string): string {
  // already masked: as it is, so masking twice changes nothing
  if (/^•+\d{0,4}$/.test(phone)) return phone;
  const digits = phone.replace(/\D/g, '');
  return digits.length <= 4 ? '••••' : `••••••${digits.slice(-4)}`;
}

/**
 * Personal data in an audit record's before/after, half hidden (owner, 2026-11-15): every email
 * anywhere keeps its first letter and domain, a phone its last 4 digits, and a name, an address or
 * an identity document goes whole. Safe to run again on its own result.
 */
export function maskForAudit(value: unknown, key = ''): unknown {
  if (HIDDEN_KEYS.test(key)) return value === null || value === undefined ? value : HIDDEN;
  if (typeof value === 'string') {
    if (PHONE_KEYS.test(key)) return maskPhone(value);
    return EMAIL.test(value) ? maskEmail(value) : value;
  }
  if (Array.isArray(value)) return value.map((item) => maskForAudit(item, key));
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([inner, item]) => [
        inner,
        maskForAudit(item, inner),
      ]),
    );
  }
  return value;
}
