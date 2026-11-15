import { AppError, type Logger, type Passport } from '@beautinique/backend-server-kit';
import {
  type ClientSession,
  type Mongo,
  ObjectId,
  withTransaction,
} from '@beautinique/backend-server-mongo';
import { writeEvent } from '@beautinique/backend-server-queue';
import {
  type AppId,
  auditRecorded,
  type AuditResult,
  maskForAudit,
  type ScopeType,
} from '@beautinique/shared-contracts';

import { appAccess } from './rbac/grants.ts';
import type { Client } from './sessions.ts';

/**
 * Identity's side of the audit log (ARCHITECTURE §6.5, TASKS T4.1 PR C): its staff and security
 * actions go out as `identity.audit.recorded`, in the transaction of the change, and core writes
 * them into the log (owner, 2026-11-15: grants, roles, invitations, authenticator resets, a copied
 * session, internal sign-ins; never a customer's, seller's or creator's sign-in).
 */

/** Who acted, as a route knows them: the passport, the client and the request id. */
export type AuditCaller = Passport & { client?: Client; requestId?: string };

/** Who acted, at least: a person and the app they acted in (a session, when there is one). */
export interface AuditActorRef {
  userId: string;
  app: AppId;
  sessionId?: string | null;
  client?: Client;
  requestId?: string;
}

export interface AuditInput {
  /** A permission key (`iam.grant.give`) or a named event (`identity.session.signedIn`) */
  action: string;
  /** null: identity itself */
  caller: AuditActorRef | null;
  resource: { type: string; id: string | null };
  scope?: { type: ScopeType; ids: string[] } | null;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  reason?: string | null;
  result?: AuditResult;
  /** The client of a record without a caller (a sign-in) */
  client?: Client;
  requestId?: string;
}

const SYSTEM = 'identity';

/** Sends one audit record, inside `session` (the change's transaction). */
export async function writeAudit(
  mongo: Mongo,
  session: ClientSession,
  input: AuditInput,
): Promise<void> {
  const { caller } = input;
  // the roles the caller holds in their app now: what the record says they acted as
  const roles =
    caller === null
      ? []
      : (await appAccess(mongo, { userId: new ObjectId(caller.userId), app: caller.app })).roles
          .map((held) => held.role)
          .filter((role, at, all) => all.indexOf(role) === at);
  const client = caller?.client ?? input.client;
  const requestId = caller?.requestId ?? input.requestId ?? null;
  const mask = (value: Record<string, unknown> | null | undefined) =>
    value === null || value === undefined ? null : (maskForAudit(value) as Record<string, unknown>);
  await writeEvent(mongo, session, auditRecorded, {
    aggregate: { type: input.resource.type, id: input.resource.id ?? SYSTEM },
    actor: caller === null ? { type: 'system', id: SYSTEM } : { type: 'user', id: caller.userId },
    correlationId: requestId ?? new ObjectId().toHexString(),
    data: {
      action: input.action,
      actor: {
        userId: caller?.userId ?? null,
        app: caller?.app ?? null,
        sessionId: caller?.sessionId ?? null,
        roles,
        system: caller === null ? SYSTEM : null,
      },
      resource: input.resource,
      scope: input.scope ?? null,
      // personal data half hidden before it leaves identity (core hides it again on the way in)
      before: mask(input.before),
      after: mask(input.after),
      reason: input.reason ?? null,
      result: input.result ?? 'success',
      ip: client?.ip ?? null,
      userAgent: client?.userAgent.slice(0, 300) ?? null,
      requestId,
      at: new Date().toISOString(),
    },
  });
}

/**
 * Runs a staff action; when identity refuses it (a 403: giving oneself a role, outside one's
 * scope ...), the refusal goes into the audit log too, `denied` with its message as the reason
 * (owner, 2026-11-15), in a transaction of its own, and the 403 goes on to the caller. A record
 * that cannot be written is an error in the logs (Sentry), never a 500 in place of the 403.
 */
export async function auditRefusal<T>(
  mongo: Mongo,
  logger: Logger,
  input: Omit<AuditInput, 'result' | 'reason'>,
  run: () => Promise<T>,
): Promise<T> {
  try {
    return await run();
  } catch (error) {
    if (error instanceof AppError && error.status === 403) {
      try {
        await withTransaction(mongo, (session) =>
          writeAudit(mongo, session, { ...input, result: 'denied', reason: error.message }),
        );
      } catch (failed) {
        logger.error(
          { err: failed, action: input.action },
          'audit record of a refusal not written',
        );
      }
    }
    throw error;
  }
}
