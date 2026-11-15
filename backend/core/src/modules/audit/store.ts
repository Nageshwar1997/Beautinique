import { createHash } from 'node:crypto';

import {
  type ClientSession,
  type Collection,
  type IndexSpec,
  type Mongo,
  ObjectId,
} from '@beautinique/backend-server-mongo';
import {
  type AppId,
  AUDIT_RETENTION_DAYS,
  type AuditResult,
  type Deployable,
  maskForAudit,
  type ScopeType,
} from '@beautinique/shared-contracts';

/**
 * The audit log's store (ARCHITECTURE §3, §6.5; TASKS T4.1 PR C). Entries live in their own
 * database (`bq_audit`), where core's user may only insert and read (owner, 2026-11-15): nothing
 * here updates or deletes one. Each UTC day is one hash chain: an entry's hash covers the one
 * before it, so a changed, missing or added entry breaks the day's chain. The day's head (its
 * length and last hash) lives in core's own database, where it can be updated, and two writers of
 * one day meet there: their transactions conflict and one runs again, so the chain stays a line.
 */
export const AUDIT_ENTRIES = 'audit_entries';
/** In core's database: each day's chain length and last hash. */
export const AUDIT_HEADS = 'audit_chain_heads';
/** In core's database: the daily task's check of each day. */
export const AUDIT_CHECKS = 'audit_chain_checks';

/** A before/after bigger than this (as JSON text) is kept as its size only: an entry stays small. */
export const AUDIT_CHANGE_MAX_CHARS = 8000;

export interface AuditActor {
  /** null when the system did it */
  userId: ObjectId | null;
  app: AppId | null;
  sessionId: ObjectId | null;
  /** The actor's role keys in `app` at that moment */
  roles: string[];
  /** Which part of the system acted, when no person did */
  system: string | null;
}

/** A scope as stored: a state by its code, any other place or party by its ObjectId. */
export interface AuditScope {
  type: ScopeType;
  ids: (ObjectId | string)[];
}

export interface AuditEntry {
  _id: ObjectId;
  /** The UTC day of its chain: the day it was written (a late event joins today's chain) */
  day: string;
  /** Its place in the day's chain, from 1 */
  seq: number;
  /** The hash of the entry before it (the day's start value for the first) */
  prevHash: string;
  hash: string;
  /** When it happened (the producer's time) */
  at: Date;
  /** Which deployable it came from */
  source: Deployable;
  action: string;
  actor: AuditActor;
  /** What it was done to: an ObjectId when it names a document, else its text */
  resource: { type: string; id: ObjectId | string | null };
  scope: AuditScope | null;
  /**
   * What changed, as JSON text with personal data half hidden (maskForAudit): a copy of a
   * message, not core's data (RULES §4.17), so its ids stay text.
   */
  before: string | null;
  after: string | null;
  reason: string | null;
  result: AuditResult;
  ip: string | null;
  userAgent: string | null;
  requestId: string | null;
  /** The event that brought it (identity's), null for core's own */
  eventId: ObjectId | null;
}

export interface ChainHead {
  _id: ObjectId;
  day: string;
  /** Entries in the day's chain */
  seq: number;
  lastHash: string;
  updatedAt: Date;
}

export interface ChainCheck {
  _id: ObjectId;
  day: string;
  ok: boolean;
  /** Entries found in the day's chain when checked */
  entries: number;
  /** The first place where the chain did not follow */
  brokenAtSeq: number | null;
  checkedAt: Date;
}

/** What a writer gives: who did what to which thing, and what changed. */
export interface NewAuditEntry {
  action: string;
  actor: AuditActor;
  resource: { type: string; id: ObjectId | string | null };
  scope?: AuditScope | null;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  reason?: string | null;
  /** default `success` */
  result?: AuditResult;
  ip?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
  /** default now */
  at?: Date;
  /** default `core` */
  source?: Deployable;
  eventId?: ObjectId | null;
}

/** The read side of the entries: find, count and distinct, nothing that changes one (§3). */
export type AuditEntriesReader = Pick<
  Collection<AuditEntry>,
  'find' | 'countDocuments' | 'distinct'
>;

export interface AuditStore {
  /** The audit database's name (`bq_audit`; a test has its own) */
  dbName: string;
  /**
   * Appends one entry to today's chain, inside the caller's transaction: it is in the log exactly
   * when the change it tells of is.
   */
  write(session: ClientSession, entry: NewAuditEntry): Promise<ObjectId>;
  entries: AuditEntriesReader;
  heads: Collection<ChainHead>;
  checks: Collection<ChainCheck>;
}

/** The entries' indexes, in the audit database (a release step makes them: auditIndexesStep). */
export const AUDIT_ENTRY_INDEXES: readonly IndexSpec[] = [
  { collection: AUDIT_ENTRIES, name: 'day_seq_unique', key: { day: 1, seq: 1 }, unique: true },
  {
    collection: AUDIT_ENTRIES,
    name: 'at_ttl',
    key: { at: 1 },
    expireAfterSeconds: AUDIT_RETENTION_DAYS * 24 * 60 * 60,
  },
  // the viewer pages newest first by _id (the order written), by who, what and which thing; a
  // time range uses at_ttl
  { collection: AUDIT_ENTRIES, name: 'actor_id', key: { 'actor.userId': 1, _id: -1 } },
  { collection: AUDIT_ENTRIES, name: 'action_id', key: { action: 1, _id: -1 } },
  { collection: AUDIT_ENTRIES, name: 'result_id', key: { result: 1, _id: -1 } },
  {
    collection: AUDIT_ENTRIES,
    name: 'resource_id',
    key: { 'resource.type': 1, 'resource.id': 1, _id: -1 },
  },
];

/** The heads' and checks' indexes, in core's database (with the module's other indexes). */
export const AUDIT_CHAIN_INDEXES: readonly IndexSpec[] = [
  { collection: AUDIT_HEADS, name: 'day_unique', key: { day: 1 }, unique: true },
  { collection: AUDIT_CHECKS, name: 'day_unique', key: { day: 1 }, unique: true },
];

const sha256 = (text: string) => createHash('sha256').update(text).digest('hex');

const ROLE_KEY = /^[a-z]+\.[a-z][a-z0-9_]*$/;
const cut = (text: string | null | undefined, max: number): string | null =>
  text === null || text === undefined ? null : text.slice(0, max);

/**
 * An entry kept inside the limits the viewer reads it with (contracts auditRecordZod): one that
 * broke them could never be changed again, and every page holding it would fail (review, T4.1
 * PR C). Text is cut, a role that is no role key dropped.
 */
function withinLimits(input: NewAuditEntry): NewAuditEntry {
  const { resource, scope } = input;
  return {
    ...input,
    action: input.action.slice(0, 100) || 'unknown',
    actor: {
      ...input.actor,
      roles: input.actor.roles
        .filter((role) => role.length <= 80 && ROLE_KEY.test(role))
        .slice(0, 50),
      system: cut(input.actor.system, 40),
    },
    resource: {
      type: resource.type.slice(0, 40) || 'unknown',
      id: typeof resource.id === 'string' ? resource.id.slice(0, 100) || null : resource.id,
    },
    scope:
      scope === null || scope === undefined
        ? null
        : {
            type: scope.type,
            ids: scope.ids
              .slice(0, 50)
              .map((id) => (typeof id === 'string' ? id.slice(0, 64) : id))
              .filter((id) => id !== ''),
          },
    reason: cut(input.reason, 500),
    ip: cut(input.ip, 64),
    userAgent: cut(input.userAgent, 300),
    requestId: cut(input.requestId, 100),
  };
}

/** The value a day's chain starts from: its first entry's prevHash. */
export const chainStartOf = (day: string): string => sha256(`bq-audit:${day}`);

/** The UTC day of a moment, `2026-11-15`. */
export const dayOf = (at: Date): string => at.toISOString().slice(0, 10);

/** One canonical text for a value: ids as hex, dates as ISO, every object's keys sorted. */
function canonical(value: unknown): string {
  if (value instanceof ObjectId) return JSON.stringify(value.toHexString());
  if (value instanceof Date) return JSON.stringify(value.toISOString());
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    const pairs = Object.entries(value as Record<string, unknown>)
      .filter(([, inner]) => inner !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return `{${pairs.map(([key, inner]) => `${JSON.stringify(key)}:${canonical(inner)}`).join(',')}}`;
  }
  return value === undefined ? 'null' : JSON.stringify(value);
}

/** An entry's hash: the one before it, then all of the entry but its own hash. */
export function hashOf(entry: Omit<AuditEntry, 'hash'> & { hash?: string }): string {
  const { hash: _hash, ...rest } = entry;
  return sha256(`${entry.prevHash}\n${canonical(rest)}`);
}

/** A before/after as stored: masked JSON text, or its size alone when too big. */
function changeText(value: Record<string, unknown> | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const text = JSON.stringify(maskForAudit(value));
  return text.length > AUDIT_CHANGE_MAX_CHARS ? JSON.stringify({ tooLarge: text.length }) : text;
}

/** The audit store on `auditDbName` (entries) and core's own database (heads, checks). */
export function auditStore(mongo: Mongo, auditDbName: string): AuditStore {
  const entries = mongo.client.db(auditDbName).collection<AuditEntry>(AUDIT_ENTRIES);
  const heads = mongo.db.collection<ChainHead>(AUDIT_HEADS);
  const checks = mongo.db.collection<ChainCheck>(AUDIT_CHECKS);
  return {
    dbName: auditDbName,
    entries,
    heads,
    checks,
    async write(session, given) {
      const input = withinLimits(given);
      const writtenAt = new Date();
      const day = dayOf(writtenAt);
      // the day's head first: a second writer of the day conflicts here, and runs again after
      const head = await heads.findOneAndUpdate(
        { day },
        {
          $inc: { seq: 1 },
          $set: { updatedAt: writtenAt },
          $setOnInsert: { _id: new ObjectId(), lastHash: chainStartOf(day) },
        },
        { upsert: true, returnDocument: 'after', session },
      );
      if (!head) throw new Error(`The audit chain head of ${day} was not there after its upsert`);
      const entry: Omit<AuditEntry, 'hash'> = {
        _id: new ObjectId(),
        day,
        seq: head.seq,
        prevHash: head.lastHash,
        at: input.at ?? writtenAt,
        source: input.source ?? 'core',
        action: input.action,
        actor: input.actor,
        resource: input.resource,
        scope: input.scope ?? null,
        before: changeText(input.before),
        after: changeText(input.after),
        reason: input.reason ?? null,
        result: input.result ?? 'success',
        ip: input.ip ?? null,
        userAgent: input.userAgent ?? null,
        requestId: input.requestId ?? null,
        eventId: input.eventId ?? null,
      };
      const hash = hashOf(entry);
      await entries.insertOne({ ...entry, hash }, { session });
      await heads.updateOne({ _id: head._id }, { $set: { lastHash: hash } }, { session });
      return entry._id;
    },
  };
}
