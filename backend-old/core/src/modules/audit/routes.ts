import { AppError } from '@beautinique/backend-server-kit';
import {
  type Collection,
  ObjectId,
  toObjectId,
  withTransaction,
} from '@beautinique/backend-server-mongo';
import {
  AUDIT_ACTION_NAMES,
  AUDIT_DAYS_MAX,
  AUDIT_EXPORT_MAX_ROWS,
  auditExport,
  auditRead,
  exportAuditEntries,
  HEADERS,
  listAuditDays,
  listAuditEntries,
  maskEmail,
  type RouteInput,
  type RouteOutput,
} from '@beautinique/shared-contracts';
import { IST, istDateKey } from '@beautinique/shared-utils';
import { Router } from 'express';

import {
  accessOf,
  authorize,
  type CallerAccess,
  type CsvColumn,
  type IdempotencyDeps,
  mountCoreDownload,
  mountCoreRoute,
  USER_COPIES,
  type UserCopy,
} from '../platform/index.ts';
import type { AuditEntry, AuditStore } from './store.ts';

export interface AuditRouteDeps extends IdempotencyDeps {
  audit: AuditStore;
}

type EntryView = RouteOutput<typeof listAuditEntries>['items'][number];

const hexOf = (id: ObjectId | null): string | null => id?.toHexString() ?? null;
const textOf = (id: ObjectId | string | null): string | null =>
  id instanceof ObjectId ? id.toHexString() : id;
const changeOf = (text: string | null): Record<string, unknown> | null =>
  text === null ? null : (JSON.parse(text) as Record<string, unknown>);

/** A resource id as stored: an ObjectId when it names a document, else its text. */
const storedId = (id: string): ObjectId | string =>
  ObjectId.isValid(id) && /^[0-9a-f]{24}$/.test(id) ? new ObjectId(id) : id;

type Filters = RouteInput<typeof exportAuditEntries>['query'];

/** The entries a list or an export holds (contracts auditFiltersZod), on the viewer's indexes. */
function filterOf(query: Filters): Record<string, unknown> {
  // an id names a thing only with its type (and the index has both)
  if (query.resourceId !== undefined && query.resourceType === undefined) {
    throw new AppError('VALIDATION_FAILED', 'Please check the highlighted fields.', {
      details: [{ path: ['query', 'resourceType'], message: 'Pick what kind of thing it is.' }],
    });
  }
  const at = {
    ...(query.from === undefined ? {} : { $gte: new Date(query.from) }),
    ...(query.to === undefined ? {} : { $lte: new Date(query.to) }),
  };
  return {
    ...(Object.keys(at).length === 0 ? {} : { at }),
    ...(query.actorId === undefined
      ? {}
      : { 'actor.userId': toObjectId(query.actorId, { field: 'actorId' }) }),
    ...(query.action === undefined ? {} : { action: query.action }),
    ...(query.resourceType === undefined ? {} : { 'resource.type': query.resourceType }),
    ...(query.resourceId === undefined ? {} : { 'resource.id': storedId(query.resourceId) }),
    ...(query.result === undefined ? {} : { result: query.result }),
  };
}

/** The masked emails of the entries' actors, from core's copy of the accounts, into `emails`. */
async function nameActors(
  users: Collection<UserCopy>,
  entries: readonly AuditEntry[],
  emails: Map<string, string | null>,
): Promise<void> {
  const missing = new Map<string, ObjectId>();
  for (const entry of entries) {
    const id = entry.actor.userId;
    if (id !== null && !emails.has(id.toHexString())) missing.set(id.toHexString(), id);
  }
  if (missing.size === 0) return;
  for (const id of missing.keys()) emails.set(id, null);
  for await (const user of users.find(
    { _id: { $in: [...missing.values()] } },
    { projection: { email: 1 } },
  )) {
    emails.set(user._id.toHexString(), maskEmail(user.email));
  }
}

/** Entries a cursor gives, each with its actor's masked email, looked up a batch at a time. */
async function* withEmails(
  entries: AsyncIterable<AuditEntry>,
  users: Collection<UserCopy>,
): AsyncGenerator<ExportRow> {
  // the actors are few (staff, the system): each is looked up once per export
  const emails = new Map<string, string | null>();
  let batch: AuditEntry[] = [];
  const named = async (): Promise<ExportRow[]> => {
    await nameActors(users, batch, emails);
    const rows = batch.map((entry) => ({
      entry,
      email:
        entry.actor.userId === null ? null : (emails.get(entry.actor.userId.toHexString()) ?? null),
    }));
    batch = [];
    return rows;
  };
  for await (const entry of entries) {
    batch.push(entry);
    if (batch.length >= EMAIL_BATCH) yield* await named();
  }
  if (batch.length > 0) yield* await named();
}

/** Entries looked up together for their actors' emails. */
const EMAIL_BATCH = 500;

interface ExportRow {
  entry: AuditEntry;
  email: string | null;
}

const CLOCK = new Intl.DateTimeFormat('en-IN', {
  timeZone: IST,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

/** A moment in India time, sortable in a spreadsheet: `2026-11-15 10:30:05`. */
export const indiaTime = (at: Date): string => `${istDateKey(at)} ${CLOCK.format(at)}`;

/** What each action is called: its name, or its key when it has none yet. */
const actionName = (action: string): string =>
  Object.hasOwn(AUDIT_ACTION_NAMES, action) ? (AUDIT_ACTION_NAMES[action] ?? action) : action;

/**
 * The CSV's columns (owner, 2026-11-15): what the viewer shows of an entry, what changed with
 * personal data half hidden as stored, and its place in the day's chain.
 */
export const AUDIT_CSV_COLUMNS: readonly CsvColumn<ExportRow>[] = [
  { header: 'Time (IST)', value: ({ entry }) => indiaTime(entry.at) },
  { header: 'Action', value: ({ entry }) => entry.action },
  { header: 'Action name', value: ({ entry }) => actionName(entry.action) },
  { header: 'Result', value: ({ entry }) => entry.result },
  {
    header: 'Actor',
    value: ({ entry, email }) => {
      if (entry.actor.userId === null) {
        return entry.actor.system === null ? 'System' : `System (${entry.actor.system})`;
      }
      return email ?? entry.actor.userId.toHexString();
    },
  },
  { header: 'Actor ID', value: ({ entry }) => hexOf(entry.actor.userId) },
  { header: 'App', value: ({ entry }) => entry.actor.app },
  { header: 'Roles', value: ({ entry }) => entry.actor.roles.join(' ') },
  { header: 'Resource type', value: ({ entry }) => entry.resource.type },
  { header: 'Resource ID', value: ({ entry }) => textOf(entry.resource.id) },
  {
    header: 'Scope',
    value: ({ entry }) => {
      const { scope } = entry;
      if (scope === null) return null;
      const ids = scope.ids.map((id) => textOf(id) ?? '').join(' ');
      return ids === '' ? scope.type : `${scope.type}: ${ids}`;
    },
  },
  { header: 'Reason', value: ({ entry }) => entry.reason },
  { header: 'Before', value: ({ entry }) => entry.before },
  { header: 'After', value: ({ entry }) => entry.after },
  { header: 'IP', value: ({ entry }) => entry.ip },
  { header: 'User agent', value: ({ entry }) => entry.userAgent },
  { header: 'Request ID', value: ({ entry }) => entry.requestId },
  { header: 'Source', value: ({ entry }) => entry.source },
  { header: 'Day', value: ({ entry }) => entry.day },
  { header: 'Seq', value: ({ entry }) => entry.seq },
  { header: 'Hash', value: ({ entry }) => entry.hash },
];

/** The caller's role keys in their app, once each: what the export's entry says they acted as. */
const rolesOf = (access: CallerAccess): string[] => [
  ...new Set(access.grants.map((grant) => grant.role)),
];

function viewOf(entry: AuditEntry, emails: ReadonlyMap<string, string>): EntryView {
  const userId = hexOf(entry.actor.userId);
  return {
    entryId: entry._id.toHexString(),
    day: entry.day,
    seq: entry.seq,
    hash: entry.hash,
    source: entry.source,
    action: entry.action,
    actor: {
      userId,
      app: entry.actor.app,
      sessionId: hexOf(entry.actor.sessionId),
      roles: entry.actor.roles,
      system: entry.actor.system,
      email: userId === null ? null : (emails.get(userId) ?? null),
    },
    resource: { type: entry.resource.type, id: textOf(entry.resource.id) },
    scope:
      entry.scope === null
        ? null
        : { type: entry.scope.type, ids: entry.scope.ids.map((id) => textOf(id) ?? '') },
    before: changeOf(entry.before),
    after: changeOf(entry.after),
    reason: entry.reason,
    result: entry.result,
    ip: entry.ip,
    userAgent: entry.userAgent,
    requestId: entry.requestId,
    at: entry.at.toISOString(),
  };
}

/** The audit viewer's routes (Master app): Master and the Internal Auditor read, nobody writes. */
export function auditRouter(deps: AuditRouteDeps): Router {
  const { mongo, audit } = deps;
  const router = Router();
  const users = mongo.db.collection<UserCopy>(USER_COPIES);

  mountCoreRoute(
    router,
    listAuditEntries,
    async ({ query }, { req }) => {
      authorize(await accessOf(mongo, await deps.passport(req)), auditRead.key);
      const filter = filterOf(query);
      const cursor =
        query.cursor === undefined ? undefined : toObjectId(query.cursor, { field: 'cursor' });
      const page = await audit.entries
        .find({ ...filter, ...(cursor === undefined ? {} : { _id: { $lt: cursor } }) })
        .sort({ _id: -1 })
        .limit(query.limit + 1)
        .toArray();
      const items = page.slice(0, query.limit);
      const actorIds = [
        ...new Map(
          items.flatMap((entry) =>
            entry.actor.userId === null
              ? []
              : [[entry.actor.userId.toHexString(), entry.actor.userId] as const],
          ),
        ).values(),
      ];
      const emails = new Map<string, string>();
      if (actorIds.length > 0) {
        for await (const user of users.find(
          { _id: { $in: actorIds } },
          { projection: { email: 1 } },
        )) {
          emails.set(user._id.toHexString(), maskEmail(user.email));
        }
      }
      return {
        items: items.map((entry) => viewOf(entry, emails)),
        nextCursor: page.length > query.limit ? (items.at(-1)?._id.toHexString() ?? null) : null,
      };
    },
    deps,
  );

  mountCoreDownload(
    router,
    exportAuditEntries,
    async ({ query }, { req, requestId }) => {
      const passport = await deps.passport(req);
      const access = await accessOf(mongo, passport);
      authorize(access, auditExport.key);
      // the file holds what was written before this moment: never the export's own entry, nor
      // what comes in while it streams, so its rows are the ones counted
      const filter = { ...filterOf(query), _id: { $lt: new ObjectId() } };
      const rows = await audit.entries.countDocuments(filter, { limit: AUDIT_EXPORT_MAX_ROWS + 1 });
      if (rows > AUDIT_EXPORT_MAX_ROWS) {
        throw new AppError(
          'EXPORT_TOO_LARGE',
          `More than ${AUDIT_EXPORT_MAX_ROWS.toLocaleString('en-IN')} entries match. Narrow the dates or filters.`,
        );
      }
      // the export is an entry of its own, in the log before its first row goes out
      await withTransaction(mongo, async (session) => {
        await audit.write(session, {
          action: exportAuditEntries.id,
          actor: {
            userId: toObjectId(passport.userId),
            app: passport.app,
            sessionId: toObjectId(passport.sessionId),
            roles: rolesOf(access),
            system: null,
          },
          resource: { type: 'audit_log', id: null },
          after: { filters: query, rows },
          ip: req.get(HEADERS.clientIp) ?? null,
          userAgent: req.get('user-agent') ?? null,
          requestId,
        });
      });
      const entries = audit.entries
        .find(filter, { batchSize: 1000 })
        .sort({ _id: -1 })
        .limit(AUDIT_EXPORT_MAX_ROWS);
      return {
        fileName: `beautinique-audit-log-${istDateKey(new Date())}.csv`,
        columns: AUDIT_CSV_COLUMNS,
        rows: withEmails(entries, users),
      };
    },
    deps,
  );

  mountCoreRoute(
    router,
    listAuditDays,
    async ({ query }, { req }) => {
      authorize(await accessOf(mongo, await deps.passport(req)), auditRead.key);
      const span = (Date.parse(query.to) - Date.parse(query.from)) / (24 * 60 * 60_000);
      if (span < 0 || span >= AUDIT_DAYS_MAX) {
        throw new AppError('VALIDATION_FAILED', 'Please check the highlighted fields.', {
          details: [
            {
              path: ['query', 'to'],
              message: `Pick a range of 1 to ${String(AUDIT_DAYS_MAX)} days, from before to.`,
            },
          ],
        });
      }
      const range = { day: { $gte: query.from, $lte: query.to } };
      const checks = new Map(
        (await audit.checks.find(range).toArray()).map((check) => [check.day, check] as const),
      );
      const heads = new Map(
        (await audit.heads.find(range).toArray()).map((head) => [head.day, head] as const),
      );
      // a day with a check but no head (it was lost) still shows, with its check
      const days = [...new Set([...heads.keys(), ...checks.keys()])].sort().reverse();
      return {
        items: days.map((day) => {
          const check = checks.get(day);
          return {
            day,
            entries: heads.get(day)?.seq ?? check?.entries ?? 0,
            check:
              check === undefined
                ? null
                : {
                    ok: check.ok,
                    entries: check.entries,
                    brokenAtSeq: check.brokenAtSeq,
                    checkedAt: check.checkedAt.toISOString(),
                  },
          };
        }),
      };
    },
    deps,
  );

  return router;
}
