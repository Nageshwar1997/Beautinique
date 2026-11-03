import {
  decryptField,
  encryptField,
  newTotpSecret,
  totpUri,
  verifyTotp,
} from '@beautinique/backend-server-crypto';
import { AppError, type Passport } from '@beautinique/backend-server-kit';
import { type ClientSession, withTransaction } from '@beautinique/backend-server-mongo';
import { writeEvent } from '@beautinique/backend-server-queue';
import {
  type AUTHENTICATOR_CHANGES,
  authenticatorChanged,
  STEP_UP_SECONDS,
  TOTP_REQUIRED_APPS,
} from '@beautinique/shared-contracts';

import { CREDENTIALS, type Credentials, totpContext } from './credentials.ts';
import {
  authenticatorExists,
  authenticatorRequired,
  authenticatorRequiredByRole,
  authenticatorSetupExpired,
  passwordInvalid,
  passwordRequired,
  stepUpLocked,
  totpInvalid,
} from './errors.ts';
import { clearFailures, isLocked, recordFailure } from './lockout.ts';
import {
  ENROLL_TTL_MS,
  inRedis,
  LOGIN_MAX_TRIES,
  type LoginDeps,
  newRecoveryCodes,
  oneMoreTry,
  TOTP_ISSUER,
} from './login.ts';
import { verifyPassword } from './password.ts';
import { activeAt, type GrantRecord, GRANTS } from './rbac/grants.ts';
import { type RoleRecord, ROLES } from './rbac/sync.ts';
import { type Session, sessionExpired, SESSIONS } from './sessions.ts';
import { type User, USERS } from './users.ts';

/**
 * The authenticator from the account's own settings, signed in (ARCHITECTURE §9.2, owner
 * 2026-10-31): set it up or replace it (a new phone), new recovery codes, turn it off. Every change
 * emails the person (identity.authenticator.changed); their sessions stay.
 */

type Change = (typeof AUTHENTICATOR_CHANGES)[number];

/** A set-up waiting for its first code, per session, in Redis (ENROLL_TTL_MS, LOGIN_MAX_TRIES). */
export const setupKey = (sessionId: string): string => `bq:id:totp-setup:${sessionId}`;
const setupContext = (sessionId: string): string => `identity.totp-setup:${sessionId}`;

interface Setup {
  /** The new secret, sealed (setupContext) */
  secret: string;
  /** '1' when it replaces the account's authenticator (asked after a step-up) */
  replace: string;
  attempts: string;
}

const credentialsOf = (deps: LoginDeps) => deps.mongo.db.collection<Credentials>(CREDENTIALS);

/** This session (not ended) and its account, or SESSION_EXPIRED. */
async function signedInAs(deps: LoginDeps, passport: Passport) {
  const session = await deps.mongo.db
    .collection<Session>(SESSIONS)
    .findOne({ _id: passport.sessionId, userId: passport.userId, revokedAt: null });
  const user = await deps.mongo.db
    .collection<User>(USERS)
    .findOne({ _id: passport.userId }, { projection: { email: 1 } });
  if (!session || !user) throw sessionExpired();
  return { session, email: user.email };
}

/** The session stepped up in the last STEP_UP_SECONDS (the gateway checks the token's `su` too). */
const steppedUp = (session: Session, now: number): boolean =>
  session.stepUpAt instanceof Date && now - session.stepUpAt.getTime() <= STEP_UP_SECONDS * 1000;

const stepUpRequired = (): AppError =>
  new AppError('STEP_UP_REQUIRED', 'Please confirm with your authenticator code to continue.');

/** The change, for notify to email (in the transaction that made it). */
function changed(
  deps: LoginDeps,
  session: ClientSession,
  {
    passport,
    email,
    device,
    change,
    requestId,
    at,
  }: {
    passport: Passport;
    email: string;
    device: string;
    change: Change;
    requestId: string;
    at: Date;
  },
) {
  return writeEvent(deps.mongo, session, authenticatorChanged, {
    aggregate: { type: 'user', id: passport.userId },
    actor: { type: 'user', id: passport.userId },
    correlationId: requestId,
    data: {
      userId: passport.userId,
      email,
      change,
      app: passport.app,
      device: device.slice(0, 120),
      changedAt: at.toISOString(),
    },
  });
}

/**
 * POST /auth/authenticator/enroll: a new secret waits sealed for its first code (asking again
 * starts over). The account needs a password (it is asked at the confirm); one that has an
 * authenticator replaces it only after a step-up.
 */
export async function enrollAuthenticator(
  deps: LoginDeps,
  passport: Passport,
): Promise<{ secret: string; uri: string }> {
  const { session, email } = await signedInAs(deps, passport);
  const credentials = await credentialsOf(deps).findOne(
    { _id: passport.userId },
    { projection: { password: 1, totp: 1 } },
  );
  if (!credentials?.password) throw passwordRequired();
  const replace = credentials.totp !== undefined;
  if (replace && !steppedUp(session, Date.now())) throw stepUpRequired();
  const secret = newTotpSecret();
  const key = setupKey(session._id);
  await inRedis(() =>
    deps.redis
      .multi()
      .del(key)
      .hset(key, {
        secret: encryptField(deps.keys, secret, setupContext(session._id)),
        replace: replace ? '1' : '0',
        attempts: '0',
      } satisfies Setup)
      .pexpire(key, ENROLL_TTL_MS)
      .exec(),
  );
  return { secret, uri: totpUri({ secret, issuer: TOTP_ISSUER, account: email }) };
}

/** A wrong password or code at the confirm: counts toward the lock; the last try ends the set-up. */
async function wrongTry(
  deps: LoginDeps,
  { key, email, tries, error }: { key: string; email: string; tries: number; error: AppError },
): Promise<never> {
  await recordFailure(deps.redis, deps.keys, email);
  if (tries >= LOGIN_MAX_TRIES) {
    await inRedis(() => deps.redis.del(key));
    throw authenticatorSetupExpired();
  }
  throw error;
}

/**
 * POST /auth/authenticator/confirm: the account's password and the first code save the
 * authenticator (sealed for this account) with 10 new recovery codes, shown once; only their
 * hashes are kept. One that came meanwhile is never overwritten unless this set-up replaces.
 */
export async function confirmAuthenticator(
  deps: LoginDeps,
  passport: Passport,
  { code, password, requestId }: { code: string; password: string; requestId: string },
): Promise<{ recoveryCodes: string[] }> {
  const { session, email } = await signedInAs(deps, passport);
  const key = setupKey(session._id);
  const setup = (await inRedis(() => deps.redis.hgetall(key))) as Partial<Setup>;
  if (setup.secret === undefined) throw authenticatorSetupExpired();
  const tries = await oneMoreTry(deps, key);
  if (tries === -1) throw authenticatorSetupExpired();
  if (tries > LOGIN_MAX_TRIES || (await isLocked(deps.redis, deps.keys, email))) {
    await inRedis(() => deps.redis.del(key));
    throw tries > LOGIN_MAX_TRIES ? authenticatorSetupExpired() : stepUpLocked();
  }
  const credentials = await credentialsOf(deps).findOne(
    { _id: passport.userId },
    { projection: { password: 1 } },
  );
  if (!credentials?.password) throw passwordRequired();
  if (!(await verifyPassword(credentials.password.hash, password))) {
    return wrongTry(deps, { key, email, tries, error: passwordInvalid() });
  }
  const secret = decryptField(deps.keys, setup.secret, setupContext(session._id));
  const step = verifyTotp(secret, code);
  if (step === null) {
    return wrongTry(deps, { key, email, tries, error: totpInvalid(LOGIN_MAX_TRIES - tries) });
  }
  // only the request that deletes the set-up goes on (a code works once)
  if ((await inRedis(() => deps.redis.del(key))) === 0) throw authenticatorSetupExpired();
  const replace = setup.replace === '1';
  const recovery = newRecoveryCodes(deps, passport.userId);
  const at = new Date();
  await withTransaction(deps.mongo, async (tx) => {
    const saved = await credentialsOf(deps).updateOne(
      replace
        ? { _id: passport.userId, totp: { $exists: true } }
        : { _id: passport.userId, totp: { $exists: false } },
      {
        $set: {
          totp: {
            secret: encryptField(deps.keys, secret, totpContext(passport.userId)),
            enrolledAt: at,
            lastStep: step,
          },
          recoveryCodes: recovery.stored,
          updatedAt: at,
        },
      },
      { session: tx },
    );
    // not replace: one was saved meanwhile; replace: it was reset meanwhile, so start over
    if (saved.modifiedCount !== 1)
      throw replace ? authenticatorSetupExpired() : authenticatorExists();
    await changed(deps, tx, {
      passport,
      email,
      device: session.device,
      change: replace ? 'replaced' : 'enabled',
      requestId,
      at,
    });
  });
  await clearFailures(deps.redis, deps.keys, email);
  deps.logger.info(
    { userId: passport.userId, app: passport.app, replace },
    replace ? 'authenticator replaced' : 'authenticator set up',
  );
  return { recoveryCodes: recovery.codes };
}

/** POST /auth/authenticator/recovery-codes (step-up): 10 new codes, the old ones stop working. */
export async function renewRecoveryCodes(
  deps: LoginDeps,
  passport: Passport,
  requestId: string,
): Promise<{ recoveryCodes: string[] }> {
  const { session, email } = await signedInAs(deps, passport);
  if (!steppedUp(session, Date.now())) throw stepUpRequired();
  const recovery = newRecoveryCodes(deps, passport.userId);
  const at = new Date();
  await withTransaction(deps.mongo, async (tx) => {
    const saved = await credentialsOf(deps).updateOne(
      { _id: passport.userId, totp: { $exists: true } },
      { $set: { recoveryCodes: recovery.stored, updatedAt: at } },
      { session: tx },
    );
    if (saved.modifiedCount !== 1) throw authenticatorRequired();
    await changed(deps, tx, {
      passport,
      email,
      device: session.device,
      change: 'recovery-codes',
      requestId,
      at,
    });
  });
  deps.logger.info({ userId: passport.userId, app: passport.app }, 'new recovery codes');
  return { recoveryCodes: recovery.codes };
}

/**
 * The roles of the account's active grants that need an authenticator: every role of the 7
 * internal apps (TOTP_REQUIRED_APPS), and roles that ask one themselves (Seller Account Owner,
 * Seller Finance ...). A retired role no longer counts, as at sign-in.
 */
export async function rolesNeedingAuthenticator(
  deps: LoginDeps,
  userId: string,
  now = new Date(),
): Promise<{ name: string; app: string }[]> {
  const grants = await deps.mongo.db
    .collection<GrantRecord>(GRANTS)
    .find({ userId, ...activeAt(now) }, { projection: { role: 1 } })
    .toArray();
  if (grants.length === 0) return [];
  const roles = await deps.mongo.db
    .collection<RoleRecord>(ROLES)
    .find(
      {
        _id: { $in: [...new Set(grants.map((grant) => grant.role))] },
        retired: false,
        $or: [{ app: { $in: [...TOTP_REQUIRED_APPS] } }, { mfaRequired: true }],
      },
      { projection: { name: 1, app: 1 } },
    )
    .sort({ app: 1, name: 1 })
    .toArray();
  return roles.map((role) => ({ name: role.name, app: role.app }));
}

/**
 * DELETE /auth/authenticator (step-up): the authenticator and its recovery codes go, never while
 * a role needs one (the roles are named). A grant given just after this check still asks for a
 * new authenticator at its next sign-in. Without one: nothing changes.
 */
export async function disableAuthenticator(
  deps: LoginDeps,
  passport: Passport,
  requestId: string,
): Promise<{ disabled: boolean }> {
  const { session, email } = await signedInAs(deps, passport);
  if (!steppedUp(session, Date.now())) throw stepUpRequired();
  const roles = await rolesNeedingAuthenticator(deps, passport.userId);
  if (roles.length > 0) throw authenticatorRequiredByRole(roles);
  const at = new Date();
  const disabled = await withTransaction(deps.mongo, async (tx) => {
    const removed = await credentialsOf(deps).updateOne(
      { _id: passport.userId, totp: { $exists: true } },
      { $unset: { totp: '', recoveryCodes: '' }, $set: { updatedAt: at } },
      { session: tx },
    );
    if (removed.modifiedCount !== 1) return false;
    await changed(deps, tx, {
      passport,
      email,
      device: session.device,
      change: 'disabled',
      requestId,
      at,
    });
    return true;
  });
  deps.logger.info({ userId: passport.userId, app: passport.app, disabled }, 'authenticator off');
  return { disabled };
}
