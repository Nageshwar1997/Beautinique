import { randomBytes } from 'node:crypto';

import {
  blindIndex,
  decryptField,
  encodeBase32,
  encryptField,
  newTotpSecret,
  totpUri,
  verifyTotp,
} from '@beautinique/backend-server-crypto';
import { AppError } from '@beautinique/backend-server-kit';
import { type AppId, TOTP_REQUIRED_APPS } from '@beautinique/shared-contracts';
import { uuidv7 } from '@beautinique/shared-utils';

import {
  AUTH_PROVIDERS,
  type AuthProvider,
  CREDENTIALS,
  type Credentials,
  totpContext,
} from './credentials.ts';
import {
  invalidCredentials,
  loginExpired,
  recoveryCodeInvalid,
  signInUnavailable,
  totpInvalid,
} from './errors.ts';
import { clearFailures, isLocked, recordFailure } from './lockout.ts';
import type { OtpDeps } from './otp.ts';
import { dummyHash, hashPassword, needsRehash, verifyPassword } from './password.ts';
import type { AuthMethod } from './sessions.ts';
import { type User, USERS } from './users.ts';

/** A sign-in waits 5 minutes for its second step, 10 while an authenticator is set up. */
export const LOGIN_TTL_MS = 5 * 60_000;
export const ENROLL_TTL_MS = 10 * 60_000;
/** Tries per sign-in at its second step; they count toward the account's lock too. */
export const LOGIN_MAX_TRIES = 5;
export const RECOVERY_CODE_COUNT = 10;
/** The name an authenticator app shows: one authenticator for the account, every app. */
const TOTP_ISSUER = 'Beautinique';

export const loginKey = (loginId: string): string => `bq:id:login:${loginId}`;

/** A sign-in between its password and its second step, in Redis. */
interface Login {
  userId: string;
  email: string;
  app: AppId;
  stage: 'totp' | 'enroll';
  attempts: string;
  /** While setting up: the new secret, sealed (enrollContext) */
  pending?: string;
}

const enrollContext = (loginId: string): string => `identity.totp-enroll:${loginId}`;

export type LoginDeps = OtpDeps;

export type LoginStep =
  | { next: 'totp' | 'totp-enroll'; loginId: string }
  | { next: 'signed-in'; user: { userId: string; email: string } };

async function inRedis<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw signInUnavailable(error);
  }
}

const credentialsOf = (deps: LoginDeps) => deps.mongo.db.collection<Credentials>(CREDENTIALS);

const signIn = (
  deps: LoginDeps,
  user: { userId: string; email: string; app: AppId },
  methods: AuthMethod[],
) => deps.sessions.issue({ ...user, methods });

async function startLogin(deps: LoginDeps, login: Omit<Login, 'attempts'>): Promise<string> {
  const loginId = uuidv7();
  const key = loginKey(loginId);
  const ttl = login.stage === 'enroll' ? ENROLL_TTL_MS : LOGIN_TTL_MS;
  await inRedis(() =>
    deps.redis
      .multi()
      .hset(key, { ...login, attempts: '0' })
      .pexpire(key, ttl)
      .exec(),
  );
  return loginId;
}

/**
 * POST /auth/login, every app (owner, 2026-10-27). The password is always checked, against a
 * stand-in hash for an email without one and for a locked account too, so a wrong email, a wrong
 * password and a lock answer alike, in the same time. Then the authenticator if the account has
 * one (every app asks), setting one up if the app needs it, or signed in.
 */
export async function passwordLogin(
  deps: LoginDeps,
  { app, email, password }: { app: AppId; email: string; password: string },
): Promise<LoginStep> {
  const locked = await isLocked(deps.redis, deps.keys, email);
  const user = await deps.mongo.db.collection<User>(USERS).findOne({ email });
  const credentials = user ? await credentialsOf(deps).findOne({ _id: user._id }) : null;
  const hash = credentials?.password?.hash;
  const right = await verifyPassword(hash ?? (await dummyHash()), password);
  if (locked || !right || !user || !credentials || hash === undefined) {
    await recordFailure(deps.redis, deps.keys, email);
    throw invalidCredentials();
  }
  const now = new Date();
  if (needsRehash(hash)) {
    // the stored hash is from older settings: keep the same password, with today's
    await credentialsOf(deps).updateOne(
      { _id: user._id, 'password.hash': hash },
      { $set: { 'password.hash': await hashPassword(password), updatedAt: now } },
    );
  }
  await deps.mongo.db
    .collection<AuthProvider>(AUTH_PROVIDERS)
    .updateOne({ userId: user._id, provider: 'password' }, { $set: { lastUsedAt: now } });
  const who = { userId: user._id, email: user.email, app };
  if (credentials.totp) {
    return { next: 'totp', loginId: await startLogin(deps, { ...who, stage: 'totp' }) };
  }
  if ((TOTP_REQUIRED_APPS as readonly string[]).includes(app)) {
    return { next: 'totp-enroll', loginId: await startLogin(deps, { ...who, stage: 'enroll' }) };
  }
  // the count starts again only after a whole sign-in: a right password alone must not give a
  // second step new tries
  await clearFailures(deps.redis, deps.keys, email);
  return { next: 'signed-in', user: await signIn(deps, who, ['password']) };
}

/** One more try on a sign-in that is still there: -1 when it is gone (never makes a key). */
const TRY = `
if redis.call('EXISTS', KEYS[1]) == 0 then return -1 end
return redis.call('HINCRBY', KEYS[1], 'attempts', 1)
`;

/**
 * The sign-in at its second step, with one more try counted: gone, finished, from another app, at
 * another stage, out of tries or its account locked = LOGIN_EXPIRED.
 */
async function loginAt(
  deps: LoginDeps,
  { app, loginId, stage }: { app: AppId; loginId: string; stage: Login['stage'] },
): Promise<{ login: Login; tries: number }> {
  const key = loginKey(loginId);
  const login = (await inRedis(() => deps.redis.hgetall(key))) as Partial<Login>;
  if (
    login.userId === undefined ||
    login.email === undefined ||
    login.app !== app ||
    login.stage !== stage
  ) {
    throw loginExpired();
  }
  const tries = Number(await inRedis(() => deps.redis.eval(TRY, 1, key)));
  if (tries === -1) throw loginExpired();
  if (tries > LOGIN_MAX_TRIES || (await isLocked(deps.redis, deps.keys, login.email))) {
    await inRedis(() => deps.redis.del(key));
    throw loginExpired();
  }
  return { login: login as Login, tries };
}

/** A wrong second step: counts toward the lock; the last try ends the sign-in. */
async function wrongTry(
  deps: LoginDeps,
  loginId: string,
  login: Login,
  tries: number,
  error: (left: number) => AppError,
): Promise<never> {
  await recordFailure(deps.redis, deps.keys, login.email);
  if (tries >= LOGIN_MAX_TRIES) {
    await inRedis(() => deps.redis.del(loginKey(loginId)));
    throw loginExpired();
  }
  throw error(LOGIN_MAX_TRIES - tries);
}

/** Ends the sign-in: only the request that deletes it goes on (a second step works once). */
async function finish(deps: LoginDeps, loginId: string): Promise<void> {
  if ((await inRedis(() => deps.redis.del(loginKey(loginId)))) === 0) throw loginExpired();
}

/**
 * POST /auth/login/:loginId/totp. A right code that was not used before: its time step is stored,
 * and it and every older one never work again (a code seen over a shoulder is spent).
 */
export async function loginWithTotp(
  deps: LoginDeps,
  { app, loginId, code }: { app: AppId; loginId: string; code: string },
): Promise<{ user: { userId: string; email: string } }> {
  const { login, tries } = await loginAt(deps, { app, loginId, stage: 'totp' });
  const credentials = await credentialsOf(deps).findOne({ _id: login.userId });
  if (!credentials?.totp) throw loginExpired();
  const secret = decryptField(deps.keys, credentials.totp.secret, totpContext(login.userId));
  const step = verifyTotp(secret, code);
  const fresh =
    step !== null &&
    (
      await credentialsOf(deps).updateOne(
        { _id: login.userId, 'totp.lastStep': { $lt: step } },
        { $set: { 'totp.lastStep': step } },
      )
    ).modifiedCount === 1;
  if (!fresh) return wrongTry(deps, loginId, login, tries, totpInvalid);
  await finish(deps, loginId);
  await clearFailures(deps.redis, deps.keys, login.email);
  return { user: await signIn(deps, login, ['password', 'totp']) };
}

const recoveryHash = (deps: LoginDeps, userId: string, code: string): string =>
  blindIndex(deps.keys, `recovery:${userId}`, code.replace('-', ''));

/** POST /auth/login/:loginId/recovery: one of the 10 codes, each works once. */
export async function loginWithRecoveryCode(
  deps: LoginDeps,
  { app, loginId, code }: { app: AppId; loginId: string; code: string },
): Promise<{ user: { userId: string; email: string }; recoveryCodesLeft: number }> {
  const { login, tries } = await loginAt(deps, { app, loginId, stage: 'totp' });
  const hash = recoveryHash(deps, login.userId, code);
  const used = await credentialsOf(deps).findOneAndUpdate(
    { _id: login.userId, recoveryCodes: { $elemMatch: { hash, usedAt: null } } },
    { $set: { 'recoveryCodes.$.usedAt': new Date() } },
    { returnDocument: 'after', projection: { recoveryCodes: 1 } },
  );
  if (!used) return wrongTry(deps, loginId, login, tries, recoveryCodeInvalid);
  await finish(deps, loginId);
  await clearFailures(deps.redis, deps.keys, login.email);
  deps.logger.info({ userId: login.userId, app }, 'signed in with a recovery code');
  const recoveryCodesLeft = (used.recoveryCodes ?? []).filter((c) => c.usedAt === null).length;
  return {
    user: await signIn(deps, login, ['password', 'recovery-code']),
    recoveryCodesLeft,
  };
}

/**
 * POST /auth/login/:loginId/totp/enroll: a new secret for this sign-in (asking again replaces it).
 * The secret waits sealed in the sign-in until its first code confirms it.
 */
export async function startTotpEnroll(
  deps: LoginDeps,
  { app, loginId }: { app: AppId; loginId: string },
): Promise<{ secret: string; uri: string }> {
  const { login } = await loginAt(deps, { app, loginId, stage: 'enroll' });
  const secret = newTotpSecret();
  await inRedis(() =>
    deps.redis.hset(loginKey(loginId), {
      pending: encryptField(deps.keys, secret, enrollContext(loginId)),
    }),
  );
  return { secret, uri: totpUri({ secret, issuer: TOTP_ISSUER, account: login.email }) };
}

/** 10 codes like `ABCDE-FGH23`: 50 random bits each. */
const newRecoveryCodes = (): string[] =>
  Array.from({ length: RECOVERY_CODE_COUNT }, () => {
    const code = encodeBase32(randomBytes(7)).slice(0, 10);
    return `${code.slice(0, 5)}-${code.slice(5)}`;
  });

/**
 * POST /auth/login/:loginId/totp/confirm: the first right code saves the authenticator (sealed
 * for this account) with 10 recovery codes (only their hashes are kept; the codes are shown once),
 * then signs in.
 */
export async function confirmTotpEnroll(
  deps: LoginDeps,
  { app, loginId, code }: { app: AppId; loginId: string; code: string },
): Promise<{ user: { userId: string; email: string }; recoveryCodes: string[] }> {
  const { login, tries } = await loginAt(deps, { app, loginId, stage: 'enroll' });
  if (login.pending === undefined) throw loginExpired();
  const secret = decryptField(deps.keys, login.pending, enrollContext(loginId));
  const step = verifyTotp(secret, code);
  if (step === null) return wrongTry(deps, loginId, login, tries, totpInvalid);
  await finish(deps, loginId);
  const now = new Date();
  const recoveryCodes = newRecoveryCodes();
  const saved = await credentialsOf(deps).updateOne(
    // never over an authenticator set up meanwhile (another sign-in)
    { _id: login.userId, totp: { $exists: false } },
    {
      $set: {
        totp: {
          secret: encryptField(deps.keys, secret, totpContext(login.userId)),
          enrolledAt: now,
          lastStep: step,
        },
        recoveryCodes: recoveryCodes.map((c) => ({
          hash: recoveryHash(deps, login.userId, c),
          usedAt: null,
        })),
        updatedAt: now,
      },
    },
  );
  if (saved.modifiedCount !== 1) throw loginExpired();
  await clearFailures(deps.redis, deps.keys, login.email);
  deps.logger.info({ userId: login.userId, app }, 'authenticator set up');
  return { user: await signIn(deps, login, ['password', 'totp']), recoveryCodes };
}
