import { AppError } from '@beautinique/backend-server-kit';
import { ObjectId, toObjectId } from '@beautinique/backend-server-mongo';
import {
  AUDIT_DAYS_MAX,
  auditRead,
  listAuditDays,
  listAuditEntries,
  maskEmail,
  type RouteOutput,
} from '@beautinique/shared-contracts';
import { Router } from 'express';

import {
  accessOf,
  authorize,
  type IdempotencyDeps,
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
      // an id names a thing only with its type (and the index has both)
      if (query.resourceId !== undefined && query.resourceType === undefined) {
        throw new AppError('VALIDATION_FAILED', 'Please check the highlighted fields.', {
          details: [{ path: ['query', 'resourceType'], message: 'Pick what kind of thing it is.' }],
        });
      }
      const cursor =
        query.cursor === undefined ? undefined : toObjectId(query.cursor, { field: 'cursor' });
      const at = {
        ...(query.from === undefined ? {} : { $gte: new Date(query.from) }),
        ...(query.to === undefined ? {} : { $lte: new Date(query.to) }),
      };
      const page = await audit.entries
        .find({
          ...(Object.keys(at).length === 0 ? {} : { at }),
          ...(query.actorId === undefined
            ? {}
            : { 'actor.userId': toObjectId(query.actorId, { field: 'actorId' }) }),
          ...(query.action === undefined ? {} : { action: query.action }),
          ...(query.resourceType === undefined ? {} : { 'resource.type': query.resourceType }),
          ...(query.resourceId === undefined ? {} : { 'resource.id': storedId(query.resourceId) }),
          ...(query.result === undefined ? {} : { result: query.result }),
          ...(cursor === undefined ? {} : { _id: { $lt: cursor } }),
        })
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
