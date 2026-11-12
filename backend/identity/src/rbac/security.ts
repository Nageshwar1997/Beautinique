import type { Passport } from '@beautinique/backend-server-kit';
import { type ObjectId, toObjectId, withTransaction } from '@beautinique/backend-server-mongo';
import { writeEvent } from '@beautinique/backend-server-queue';
import { authenticatorReset, sessionRevoke, totpReset } from '@beautinique/shared-contracts';

import { CREDENTIALS, type Credentials } from '../credentials.ts';
import type { OtpDeps } from '../otp.ts';
import { type User, USERS } from '../users.ts';
import { callerGrants, forbidden, requirePermission } from './authority.ts';
import { activeAt, type GrantRecord, GRANTS } from './grants.ts';
import { notFound, roleByKey } from './manage.ts';
import { MASTER_ROLE } from './roles.ts';

/** The account a Security Officer acts on: it exists, and it is never their own. */
async function targetOf(deps: OtpDeps, passport: Passport, userId: string, permission: string) {
  const caller = await callerGrants(deps.mongo, {
    userId: toObjectId(passport.userId),
    app: passport.app,
  });
  const isMaster = caller.some(({ role }) => role.key === MASTER_ROLE);
  requirePermission(caller, permission);
  if (userId === passport.userId) throw forbidden('Use My Devices and your own settings for this.');
  const user = await deps.mongo.db
    .collection<User>(USERS)
    .findOne(
      { _id: toObjectId(userId, { notFound: 'Account not found.' }) },
      { projection: { email: 1 } },
    );
  if (!user) throw notFound('Account');
  return { user, isMaster };
}

/** Does the account hold Master now? */
async function holdsMaster(deps: OtpDeps, userId: ObjectId): Promise<boolean> {
  const master = await roleByKey(deps.mongo, MASTER_ROLE);
  if (!master) return false;
  const grant = await deps.mongo.db
    .collection<GrantRecord>(GRANTS)
    .findOne({ userId, roleId: master._id, ...activeAt(new Date()) }, { projection: { _id: 1 } });
  return grant !== null;
}

/**
 * POST /iam/users/:userId/authenticator/reset (ARCHITECTURE §7.1, a lost phone): the
 * authenticator and its recovery codes go and the person is emailed (event in the same
 * transaction), then every session of the account ends. The next sign-in where an authenticator
 * is required sets up a new one. An account without one: nothing changes.
 */
export async function resetAuthenticator(
  deps: OtpDeps,
  passport: Passport,
  userId: string,
  requestId: string,
) {
  const { user, isMaster } = await targetOf(deps, passport, userId, totpReset.key);
  // a Master's second factor is the last door to everything: only the other Master opens it, so
  // a Security Officer and a leaked Master password together are not enough (QA DR-007)
  if (!isMaster && (await holdsMaster(deps, user._id))) {
    throw forbidden("Only another Master can reset a Master's authenticator.");
  }
  const now = new Date();
  const reset = await withTransaction(deps.mongo, async (session) => {
    const changed = await deps.mongo.db
      .collection<Credentials>(CREDENTIALS)
      .updateOne(
        { _id: user._id, totp: { $exists: true } },
        { $unset: { totp: '', recoveryCodes: '' }, $set: { updatedAt: now } },
        { session },
      );
    if (changed.modifiedCount !== 1) return false;
    await writeEvent(deps.mongo, session, authenticatorReset, {
      aggregate: { type: 'user', id: userId },
      actor: { type: 'user', id: passport.userId },
      correlationId: requestId,
      data: { userId, email: user.email, resetAt: now.toISOString() },
    });
    return true;
  });
  const sessionsEnded = reset ? await deps.sessions.endAll(user._id, 'authenticator-reset') : 0;
  deps.logger.info(
    { userId, by: passport.userId, reset, sessionsEnded },
    'authenticator reset by a Security Officer',
  );
  return { reset, sessionsEnded };
}

/** POST /iam/users/:userId/sessions/end (ARCHITECTURE §7.2): every session of the account ends. */
export async function endUserSessions(deps: OtpDeps, passport: Passport, userId: string) {
  const { user } = await targetOf(deps, passport, userId, sessionRevoke.key);
  const ended = await deps.sessions.endAll(user._id, 'security-officer');
  deps.logger.info({ userId, by: passport.userId, ended }, 'sessions ended by a Security Officer');
  return { ended };
}
