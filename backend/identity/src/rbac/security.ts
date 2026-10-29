import type { Passport } from '@beautinique/backend-server-kit';
import { withTransaction } from '@beautinique/backend-server-mongo';
import { writeEvent } from '@beautinique/backend-server-queue';
import { authenticatorReset, sessionRevoke, totpReset } from '@beautinique/shared-contracts';

import { CREDENTIALS, type Credentials } from '../credentials.ts';
import type { OtpDeps } from '../otp.ts';
import { type User, USERS } from '../users.ts';
import { callerGrants, forbidden, requirePermission } from './authority.ts';
import { notFound } from './manage.ts';

/** The account a Security Officer acts on: it exists, and it is never their own. */
async function targetOf(deps: OtpDeps, passport: Passport, userId: string, permission: string) {
  const caller = await callerGrants(deps.mongo, { userId: passport.userId, app: passport.app });
  requirePermission(caller, permission);
  if (userId === passport.userId) throw forbidden('Use My Devices and your own settings for this.');
  const user = await deps.mongo.db
    .collection<User>(USERS)
    .findOne({ _id: userId }, { projection: { email: 1 } });
  if (!user) throw notFound('Account');
  return user;
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
  const user = await targetOf(deps, passport, userId, totpReset.key);
  const now = new Date();
  const reset = await withTransaction(deps.mongo, async (session) => {
    const changed = await deps.mongo.db
      .collection<Credentials>(CREDENTIALS)
      .updateOne(
        { _id: userId, totp: { $exists: true } },
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
  const sessionsEnded = reset ? await deps.sessions.endAll(userId, 'authenticator-reset') : 0;
  deps.logger.info(
    { userId, by: passport.userId, reset, sessionsEnded },
    'authenticator reset by a Security Officer',
  );
  return { reset, sessionsEnded };
}

/** POST /iam/users/:userId/sessions/end (ARCHITECTURE §7.2): every session of the account ends. */
export async function endUserSessions(deps: OtpDeps, passport: Passport, userId: string) {
  await targetOf(deps, passport, userId, sessionRevoke.key);
  const ended = await deps.sessions.endAll(userId, 'security-officer');
  deps.logger.info({ userId, by: passport.userId, ended }, 'sessions ended by a Security Officer');
  return { ended };
}
