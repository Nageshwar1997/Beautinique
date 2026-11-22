import { createHash } from 'node:crypto';

import type { Logger } from '@beautinique/backend-server-kit';
import {
  type ClientSession,
  type IndexSpec,
  ObjectId,
  syncIndexes,
} from '@beautinique/backend-server-mongo';
import { subscribe, type Subscription, type Task } from '@beautinique/backend-server-queue';
import type { ReleaseStep } from '@beautinique/backend-server-release';
import { auditRecorded, CODE_SCOPE_TYPES } from '@beautinique/shared-contracts';
import type { Router } from 'express';

import { type AuditRouteDeps, auditRouter } from './routes.ts';
import {
  AUDIT_CHAIN_INDEXES,
  AUDIT_ENTRY_INDEXES,
  type AuditStore,
  type NewAuditEntry,
} from './store.ts';
import { verifyTask } from './verify.ts';

/**
 * The audit module (ARCHITECTURE §4, §6.5; TASKS T4.1 PR C): the append-only, hash-chained audit
 * log of every app. Another module writes its entry with writeAudit in the transaction of its
 * change; identity's staff and security actions come as `identity.audit.recorded` events.
 */
export {
  AUDIT_CHANGE_MAX_CHARS,
  AUDIT_CHECKS,
  AUDIT_ENTRIES,
  AUDIT_HEADS,
  type AuditActor,
  type AuditEntry,
  type AuditStore,
  auditStore,
  type ChainCheck,
  type ChainHead,
  chainStartOf,
  dayOf,
  hashOf,
  type NewAuditEntry,
} from './store.ts';
export {
  VERIFY_LOOKBACK_DAYS,
  VERIFY_SCHEDULE,
  VERIFY_TASK,
  verifyChains,
  verifyDay,
} from './verify.ts';

/** The subscriber that writes identity's audit records. */
export const IDENTITY_AUDIT = 'core.identityAudit';

/** Writes one audit entry in the caller's transaction (always inside the change it tells of). */
export const writeAudit = (
  audit: AuditStore,
  session: ClientSession,
  entry: NewAuditEntry,
): Promise<ObjectId> => audit.write(session, entry);

export const routerOf = (deps: AuditRouteDeps): Router => auditRouter(deps);

/** The module's indexes in core's database (the entries' own are in the audit database). */
export const indexes: readonly IndexSpec[] = [...AUDIT_CHAIN_INDEXES];

const oidOrNull = (id: string | null): ObjectId | null => (id === null ? null : new ObjectId(id));

/**
 * An id as stored: an ObjectId when it is one's hex, else its text. A refused request's scope comes
 * as the caller sent it, never checked (review, T4.1 PR C): it must never stop the record.
 */
const storedIdOf = (id: string): ObjectId | string =>
  /^[0-9a-f]{24}$/.test(id) ? new ObjectId(id) : id;

/** identity's audit records into the log: in the inbox's transaction, so each is written once. */
export function subscriptionsOf({ audit }: { audit: AuditStore }): Subscription[] {
  return [
    subscribe(IDENTITY_AUDIT, auditRecorded, async (event, session) => {
      const { data } = event;
      await audit.write(session, {
        action: data.action,
        actor: {
          userId: oidOrNull(data.actor.userId),
          app: data.actor.app,
          sessionId: oidOrNull(data.actor.sessionId),
          roles: data.actor.roles,
          system: data.actor.system,
        },
        resource: {
          type: data.resource.type,
          id: data.resource.id === null ? null : storedIdOf(data.resource.id),
        },
        scope:
          data.scope === null
            ? null
            : {
                type: data.scope.type,
                // a state by its code, anything else by its ObjectId (RULES §4.17)
                ids: CODE_SCOPE_TYPES.has(data.scope.type)
                  ? [...data.scope.ids]
                  : data.scope.ids.map(storedIdOf),
              },
        before: data.before,
        after: data.after,
        reason: data.reason,
        result: data.result,
        ip: data.ip,
        userAgent: data.userAgent,
        requestId: data.requestId,
        at: new Date(data.at),
        source: 'identity',
        eventId: new ObjectId(event.eventId),
      });
    }),
  ];
}

/** The module's scheduled tasks: the daily chain check. */
export const tasksOf = ({ audit, logger }: { audit: AuditStore; logger: Logger }): Task[] => [
  verifyTask(audit, logger),
];

/**
 * A release step that makes the entries' indexes in the audit database (core's other indexes go
 * to core's own): sync only makes what is missing, never drops, so core's user there needs no
 * more than createIndex and listIndexes besides insert and find (owner, 2026-11-15).
 */
export function auditIndexesStep(auditDbName: string): ReleaseStep {
  return {
    name: 'audit-indexes',
    fingerprint: createHash('sha256')
      .update(JSON.stringify({ db: auditDbName, indexes: AUDIT_ENTRY_INDEXES }))
      .digest('hex'),
    async run({ mongo }) {
      // the same connection, pointed at the audit database: syncIndexes reads only `db`
      await syncIndexes({ ...mongo, db: mongo.client.db(auditDbName) }, AUDIT_ENTRY_INDEXES);
    },
  };
}
