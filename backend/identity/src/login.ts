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
import {
  type AppId,
  type SocialProvider,
  type StepUpAction,
  TOTP_REQUIRED_APPS,
} from '@beautinique/shared-contracts';
import { uuidv7 } from '@beautinique/shared-utils';

import {
  AUTH_PROVIDERS,
  type AuthProvider,
  CREDENTIALS,
  type Credentials,
  totpContext,
} from './credentials.ts';
import {
  authenticatorRequired,
  invalidCredentials,
  loginExpired,
  passwordResetRequired,
  recoveryCodeInvalid,
  signInUnavailable,
  stepUpCodeInvalid,
  stepUpLocked,
  stepUpRecoveryInvalid,
  totpInvalid,
} from './errors.ts';
import { clearFailures, isLocked, recordFailure } from './lockout.ts';
import type { OtpDeps } from './otp.ts';
import { dummyHash, hashPassword, needsRehash, verifyPassword } from './password.ts';
import { signInAccess } from './rbac/grants.ts';
import { type AuthMethod, type Client, type IssuedSession, sessionExpired } from './sessions.ts';
import { type User, USERS } from './users.ts';

/** A sign-in waits 5 minutes for its second step, 10 while an authenticator is set up. */
export const LOGIN_TTL_MS = 5 * 60_000;
export const ENROLL_TTL_MS = 10 * 60_000;
/** Tries per sign-in at its second step; they count toward the account's lock too. */
export const LOGIN_MAX_TRIES = 5;
export const RECOVERY_CODE_COUNT = 10;
/** The name an authenticator app shows: one authenticator for the account, every app. */
export const TOTP_ISSUER = 'Beautinique';

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
  /** The first step: `password` (missing in older sign-ins), or the provider (social sign-in) */
  first?: 'password' | SocialProvider;
}

const enrollContext = (loginId: string): string => `identity.totp-enroll:${loginId}`;

export type LoginDeps = OtpDeps;

export type LoginStep =
  | { next: 'totp' | 'totp-enroll'; loginId: string; session?: undefined }
  | { next: 'signed-in'; user: { userId: string; email: string }; session: IssuedSession };

export async function inRedis<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw signInUnavailable(error);
  }
}

const credentialsOf = (deps: LoginDeps) => deps.mongo.db.collection<Credentials>(CREDENTIALS);

/** The last step: a session for the app (cookies), as `{ user, session }`. */
async function signIn(
  deps: LoginDeps,
  { userId, email, app }: { userId: string; email: string; app: AppId },
  methods: AuthMethod[],
  client: Client,
): Promise<{ user: { userId: string; email: string }; session: IssuedSession }> {
  const session = await deps.sessions.issue({ userId, email, app, methods, client });
  return { user: session.user, session };
}

export async function startLogin(deps: LoginDeps, login: Omit<Login, 'attempts'>): Promise<string> {
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
 * POST /auth/login, every app (owner, 2026-10-27). The lock first, without a hash (owner,
 * 2026-11-12, QA DR-004): a locked email answers like a wrong password at once, so hammering it
 * costs no hashing; locks are per email, made-up ones too, so the quicker answer says nothing about
 * an account. Then one hash from the budget of every IP together, the password checked against a
 * stand-in hash for an email without one, so a wrong email and a wrong password answer alike, in
 * the same time. The grant comes after the hash, so the time never tells who works where. Then
 * the authenticator if the account has one (every app asks), setting one up if the app needs it,
 * or signed in.
 */
export async function passwordLogin(
  deps: LoginDeps,
  { app, email, password, client }: { app: AppId; email: string; password: string; client: Client },
): Promise<LoginStep> {
  if (await isLocked(deps.redis, deps.keys, email, client.ip)) {
    await recordFailure(deps.redis, deps.keys, email, client.ip);
    throw invalidCredentials();
  }
  await deps.loginHashes();
  const user = await deps.mongo.db.collection<User>(USERS).findOne({ email });
  const credentials = user ? await credentialsOf(deps).findOne({ _id: user._id }) : null;
  const hash = credentials?.password?.hash;
  const right = await verifyPassword(hash ?? (await dummyHash()), password);
  if (!right || !user || !credentials || hash === undefined) {
    await recordFailure(deps.redis, deps.keys, email, client.ip);
    throw invalidCredentials();
  }
  // sign-in only where the account holds a grant (ARCHITECTURE §7.1); the same answer as a wrong
  // password, so an app does not tell who works where. Not a failure: the password was right.
  const access = await signInAccess(deps.mongo, { userId: user._id, app });
  if (!access.allowed) throw invalidCredentials();
  const now = new Date();
  await checkedLater(deps, user._id, credentials.password, password, now);
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
  if ((TOTP_REQUIRED_APPS as readonly string[]).includes(app) || access.mfaRequired) {
    return { next: 'totp-enroll', loginId: await startLogin(deps, { ...who, stage: 'enroll' }) };
  }
  // the count starts again only after a whole sign-in: a right password alone must not give a
  // second step new tries
  await clearFailures(deps.redis, deps.keys, email, { ip: client.ip });
  return { next: 'signed-in', ...(await signIn(deps, who, ['password'], client)) };
}

/** One more try on a step that is still there: -1 when it is gone (never makes a key). */
const TRY = `
if redis.call('EXISTS', KEYS[1]) == 0 then return -1 end
return redis.call('HINCRBY', KEYS[1], 'attempts', 1)
`;

/** Counts one more try at the Redis hash `key` (its `attempts`): -1 when it is gone. */
/**
 * A password set while the breach check could not answer is checked at sign-in (owner 2026-11-09,
 * QA DR-002). Leaked: no sign-in with it until a new one is set with an email code, and that is
 * kept, so a later outage does not let it back in. Clean: the mark goes. Still no answer: the
 * sign-in goes on, and the next one asks again. After the grant, so it never tells who works where.
 */
async function checkedLater(
  deps: LoginDeps,
  userId: string,
  stored: Credentials['password'],
  password: string,
  now: Date,
): Promise<void> {
  if (stored?.breachedAt) throw passwordResetRequired();
  if (stored?.hibpPending !== true) return;
  const answer = await deps.breached(password);
  if (answer === 'unknown') return;
  // only this password: a new one set meanwhile has its own mark
  const thisPassword = { _id: userId, 'password.hash': stored.hash };
  if (answer === 'clean') {
    await credentialsOf(deps).updateOne(thisPassword, {
      $unset: { 'password.hibpPending': '' },
      $set: { updatedAt: now },
    });
    return;
  }
  await credentialsOf(deps).updateOne(thisPassword, {
    $unset: { 'password.hibpPending': '' },
    $set: { 'password.breachedAt': now, updatedAt: now },
  });
  deps.logger.warn(
    { userId },
    'a password set while the breach check was away is leaked; sign-in refused',
  );
  throw passwordResetRequired();
}

export const oneMoreTry = async (deps: LoginDeps, key: string): Promise<number> =>
  Number(await inRedis(() => deps.redis.eval(TRY, 1, key)));

/**
 * The sign-in at its second step, with one more try counted: gone, finished, from another app, at
 * another stage, out of tries or its account locked = LOGIN_EXPIRED.
 */
async function loginAt(
  deps: LoginDeps,
  { app, loginId, stage, ip }: { app: AppId; loginId: string; stage: Login['stage']; ip: string },
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
  const tries = await oneMoreTry(deps, key);
  if (tries === -1) throw loginExpired();
  if (tries > LOGIN_MAX_TRIES || (await isLocked(deps.redis, deps.keys, login.email, ip))) {
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
  ip: string,
  error: (left: number) => AppError,
): Promise<never> {
  await recordFailure(deps.redis, deps.keys, login.email, ip);
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
  { app, loginId, code, client }: { app: AppId; loginId: string; code: string; client: Client },
): Promise<{ user: { userId: string; email: string }; session: IssuedSession }> {
  const { login, tries } = await loginAt(deps, { app, loginId, stage: 'totp', ip: client.ip });
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
  if (!fresh) return wrongTry(deps, loginId, login, tries, client.ip, totpInvalid);
  await finish(deps, loginId);
  await clearFailures(deps.redis, deps.keys, login.email, { ip: client.ip });
  return signIn(deps, login, [login.first ?? 'password', 'totp'], client);
}

const recoveryHash = (deps: LoginDeps, userId: string, code: string): string =>
  blindIndex(deps.keys, `recovery:${userId}`, code.replace('-', ''));

/** The recovery codes not used yet; null without any (no authenticator). */
export const recoveryCodesLeft = (codes: Credentials['recoveryCodes']): number | null =>
  codes === undefined ? null : codes.filter((c) => c.usedAt === null).length;

/** Spends one recovery code of the account: how many are left, or null when it is wrong or used. */
async function useRecoveryCode(
  deps: LoginDeps,
  userId: string,
  code: string,
): Promise<number | null> {
  const hash = recoveryHash(deps, userId, code);
  const used = await credentialsOf(deps).findOneAndUpdate(
    { _id: userId, recoveryCodes: { $elemMatch: { hash, usedAt: null } } },
    { $set: { 'recoveryCodes.$.usedAt': new Date() } },
    { returnDocument: 'after', projection: { recoveryCodes: 1 } },
  );
  return used ? (recoveryCodesLeft(used.recoveryCodes) ?? 0) : null;
}

/** POST /auth/login/:loginId/recovery: one of the 10 codes, each works once. */
export async function loginWithRecoveryCode(
  deps: LoginDeps,
  { app, loginId, code, client }: { app: AppId; loginId: string; code: string; client: Client },
): Promise<{
  user: { userId: string; email: string };
  session: IssuedSession;
  recoveryCodesLeft: number;
}> {
  const { login, tries } = await loginAt(deps, { app, loginId, stage: 'totp', ip: client.ip });
  const left = await useRecoveryCode(deps, login.userId, code);
  if (left === null) return wrongTry(deps, loginId, login, tries, client.ip, recoveryCodeInvalid);
  await finish(deps, loginId);
  await clearFailures(deps.redis, deps.keys, login.email, { ip: client.ip });
  deps.logger.info({ userId: login.userId, app }, 'signed in with a recovery code');
  return {
    ...(await signIn(deps, login, [login.first ?? 'password', 'recovery-code'], client)),
    recoveryCodesLeft: left,
  };
}

/**
 * POST /auth/login/:loginId/totp/enroll: a new secret for this sign-in (asking again replaces it).
 * The secret waits sealed in the sign-in until its first code confirms it.
 */
export async function startTotpEnroll(
  deps: LoginDeps,
  { app, loginId, ip }: { app: AppId; loginId: string; ip: string },
): Promise<{ secret: string; uri: string }> {
  const { login } = await loginAt(deps, { app, loginId, stage: 'enroll', ip });
  const secret = newTotpSecret();
  await inRedis(() =>
    deps.redis.hset(loginKey(loginId), {
      pending: encryptField(deps.keys, secret, enrollContext(loginId)),
    }),
  );
  return { secret, uri: totpUri({ secret, issuer: TOTP_ISSUER, account: login.email }) };
}

/**
 * 10 new codes like `ABCDE-FGH23` (50 random bits each), shown once, and what is stored of them:
 * their keyed hashes only.
 */
export function newRecoveryCodes(
  deps: LoginDeps,
  userId: string,
): { codes: string[]; stored: NonNullable<Credentials['recoveryCodes']> } {
  const codes = Array.from({ length: RECOVERY_CODE_COUNT }, () => {
    const code = encodeBase32(randomBytes(7)).slice(0, 10);
    return `${code.slice(0, 5)}-${code.slice(5)}`;
  });
  return {
    codes,
    stored: codes.map((c) => ({ hash: recoveryHash(deps, userId, c), usedAt: null })),
  };
}

/**
 * POST /auth/login/:loginId/totp/confirm: the first right code saves the authenticator (sealed
 * for this account) with 10 recovery codes (only their hashes are kept; the codes are shown once),
 * then signs in.
 */
export async function confirmTotpEnroll(
  deps: LoginDeps,
  { app, loginId, code, client }: { app: AppId; loginId: string; code: string; client: Client },
): Promise<{
  user: { userId: string; email: string };
  session: IssuedSession;
  recoveryCodes: string[];
}> {
  const { login, tries } = await loginAt(deps, { app, loginId, stage: 'enroll', ip: client.ip });
  if (login.pending === undefined) throw loginExpired();
  const secret = decryptField(deps.keys, login.pending, enrollContext(loginId));
  const step = verifyTotp(secret, code);
  if (step === null) return wrongTry(deps, loginId, login, tries, client.ip, totpInvalid);
  await finish(deps, loginId);
  const now = new Date();
  const recovery = newRecoveryCodes(deps, login.userId);
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
        recoveryCodes: recovery.stored,
        updatedAt: now,
      },
    },
  );
  if (saved.modifiedCount !== 1) throw loginExpired();
  await clearFailures(deps.redis, deps.keys, login.email, { ip: client.ip });
  deps.logger.info({ userId: login.userId, app }, 'authenticator set up');
  return {
    ...(await signIn(deps, login, ['password', 'totp'], client)),
    recoveryCodes: recovery.codes,
  };
}

/** A step-up's proof: the authenticator code, or (a lost phone) one recovery code. */
/** The code, or a recovery code; `for` when the step-up is for one change alone (QA DR-010). */
export type StepUpProof = ({ code: string } | { recoveryCode: string }) & { for?: StepUpAction };

/**
 * POST /auth/step-up (ARCHITECTURE §7.1, §9.2): the authenticator code again, or one recovery
 * code (spent), for a high-risk action in the next STEP_UP_SECONDS. A wrong one counts toward the
 * account's lock like a sign-in, a locked account is refused, and a code used before never works
 * again. An account without an authenticator: AUTHENTICATOR_REQUIRED.
 */
export async function stepUpWithTotp(
  deps: LoginDeps,
  {
    userId,
    sessionId,
    proof,
    ip,
  }: { userId: string; sessionId: string; proof: StepUpProof; ip: string },
): Promise<{
  app: AppId;
  accessToken: string;
  stepUpAt: Date;
  /** After a recovery code: how many are left */
  recoveryCodesLeft: number | null;
}> {
  const user = await deps.mongo.db
    .collection<User>(USERS)
    .findOne({ _id: userId }, { projection: { email: 1 } });
  if (!user) throw sessionExpired();
  const credentials = await credentialsOf(deps).findOne({ _id: userId });
  if (!credentials?.totp) throw authenticatorRequired();
  if (await isLocked(deps.redis, deps.keys, user.email, ip)) throw stepUpLocked();
  let left: number | null = null;
  let right: boolean;
  if ('recoveryCode' in proof) {
    left = await useRecoveryCode(deps, userId, proof.recoveryCode);
    right = left !== null;
  } else {
    const secret = decryptField(deps.keys, credentials.totp.secret, totpContext(userId));
    const step = verifyTotp(secret, proof.code);
    right =
      step !== null &&
      (
        await credentialsOf(deps).updateOne(
          { _id: userId, 'totp.lastStep': { $lt: step } },
          { $set: { 'totp.lastStep': step } },
        )
      ).modifiedCount === 1;
  }
  if (!right) {
    await recordFailure(deps.redis, deps.keys, user.email, ip);
    throw 'recoveryCode' in proof ? stepUpRecoveryInvalid() : stepUpCodeInvalid();
  }
  await clearFailures(deps.redis, deps.keys, user.email, { ip });
  if (left !== null) deps.logger.info({ userId }, 'stepped up with a recovery code');
  return {
    ...(await deps.sessions.stepUp({
      userId,
      sessionId,
      ...(proof.for === undefined ? {} : { for: proof.for }),
    })),
    recoveryCodesLeft: left,
  };
}
