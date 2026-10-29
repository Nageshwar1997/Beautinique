import { randomInt, timingSafeEqual } from 'node:crypto';
import { setTimeout as sleep } from 'node:timers/promises';

import {
  blindIndex,
  type CryptoKeys,
  encryptField,
  type SealingKeys,
} from '@beautinique/backend-server-crypto';
import { AppError, type Logger, type Passport } from '@beautinique/backend-server-kit';
import { type Mongo, withTransaction } from '@beautinique/backend-server-mongo';
import { writeEvent } from '@beautinique/backend-server-queue';
import {
  type AppId,
  consentProblems,
  type OTP_OUTCOMES,
  otpRequested,
  otpSealContext,
} from '@beautinique/shared-contracts';
import { uuidv7 } from '@beautinique/shared-utils';
import type { Request } from 'express';
import type { Redis } from 'ioredis';

import {
  otpEmailLimit,
  otpExpired,
  otpInvalid,
  otpResendLimit,
  otpResendTooSoon,
  otpUnavailable,
  passwordBreached,
} from './errors.ts';
import { clearFailures } from './lockout.ts';
import { type BreachCheck, hashPassword } from './password.ts';
import { publishAuthzVersions } from './rbac/grants.ts';
import { acceptableInvitations, acceptInvitations, hasInvitation } from './rbac/invitations.ts';
import type { Client, IssuedSession, Sessions } from './sessions.ts';
import {
  accountWithCode,
  passwordWithCode,
  setPasswordWithCode,
  signUpWithCode,
  USERS,
} from './users.ts';

/** ARCHITECTURE §7.1: a code works 10 minutes, takes 5 tries, and up to 3 new codes a minute apart. */
export const OTP_TTL_MS = 10 * 60_000;
export const OTP_MAX_TRIES = 5;
export const OTP_MAX_RESENDS = 3;
export const OTP_RESEND_AFTER_MS = 60_000;
const EMAIL_WINDOW_MS = 60 * 60_000;
/**
 * A code request or resend answers no sooner than this, whether a code went out or not: sending
 * one writes to the outbox, and without the wait an unknown email in an app without sign-up
 * answered faster, so the time told who has an account. Above the outbox write's usual time.
 */
export const OTP_MIN_ANSWER_MS = 400;

/** Redis keys (`bq:id:*`, ARCHITECTURE §6.6), each with a TTL. The email is never in a key. */
export const challengeKey = (challengeId: string): string => `bq:id:otp:${challengeId}`;
const emailCountKey = (index: string): string => `bq:id:otp-email:${index}`;

/**
 * Why the code is sent: to make an account, to set a password (ARCHITECTURE §7.1), or to accept
 * an invitation (TASKS T3.3).
 */
export type CodePurpose = 'sign-up' | 'password' | 'invite';

/**
 * A challenge in Redis. `send` is 0 for a password code to an email without an account: it
 * answers like any other but no code goes out, and no code ever fits it.
 */
interface Challenge {
  email: string;
  app: AppId;
  purpose: CodePurpose;
  codeHash: string;
  send: '0' | '1';
  terms: '0' | '1';
  adult: '0' | '1';
  attempts: string;
  resends: string;
  expiresAt: string;
  resendAfter: string;
}

export interface OtpDeps {
  mongo: Mongo;
  redis: Redis;
  /** identity's field and blind-index keys: the code hash and the email counters */
  keys: CryptoKeys;
  /** seal the code for notify */
  otpKeys: SealingKeys;
  logger: Logger;
  emailLimitPerHour: number;
  legalVersion: string;
  /** Have I Been Pwned (fail-open) */
  breached: BreachCheck;
  /** The last step of a sign-in, and the sessions of My Devices */
  sessions: Sessions;
  /** Who signed in, from the gateway's passport (signed-in routes) */
  passport: (req: Request) => Promise<Passport>;
}

/** What the app sees of a challenge (contracts otpChallengeZod). */
export interface ChallengeView {
  challengeId: string;
  expiresAt: string;
  resendAfter: string;
  resendsLeft: number;
}

const newCode = (): string => randomInt(0, 1_000_000).toString().padStart(6, '0');
const hashOf = (keys: CryptoKeys, challengeId: string, code: string): string =>
  blindIndex(keys, `otp:${challengeId}`, code);

/** Redis away means no code can be kept: refuse with 503, never send a code we cannot check. */
async function inRedis<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw otpUnavailable(error);
  }
}

/** Runs the work, then waits out the rest of OTP_MIN_ANSWER_MS, on an error too. */
async function evenly<T>(work: () => Promise<T>): Promise<T> {
  const until = performance.now() + OTP_MIN_ANSWER_MS;
  try {
    return await work();
  } finally {
    const left = until - performance.now();
    if (left > 0) await sleep(left);
  }
}

/** Counts a code for this email in the last hour (resends too); over the limit refuses. */
async function countEmail(deps: OtpDeps, email: string): Promise<void> {
  const key = emailCountKey(blindIndex(deps.keys, 'otp-email', email));
  const count = await inRedis(async () => {
    const [[, value]] = (await deps.redis
      .multi()
      .incr(key)
      .pexpire(key, EMAIL_WINDOW_MS, 'NX')
      .exec()) as [[Error | null, number], [Error | null, number]];
    return value;
  });
  if (count > deps.emailLimitPerHour) throw otpEmailLimit();
}

/** The code goes to notify in an event, sealed, in identity's outbox (ARCHITECTURE §7.1). */
async function emitCode(
  deps: OtpDeps,
  challengeId: string,
  challenge: Pick<Challenge, 'email' | 'app' | 'purpose'>,
  code: string,
  expiresAt: number,
  requestId: string,
): Promise<void> {
  await withTransaction(deps.mongo, async (session) => {
    await writeEvent(deps.mongo, session, otpRequested, {
      aggregate: { type: 'otpChallenge', id: challengeId },
      actor: { type: 'system', id: 'identity.otp' },
      correlationId: requestId,
      data: {
        challengeId,
        email: challenge.email,
        app: challenge.app,
        purpose: challenge.purpose,
        sealedCode: encryptField(deps.otpKeys, code, otpSealContext(challengeId)),
        expiresAt: new Date(expiresAt).toISOString(),
      },
    });
  });
}

const viewOf = (challengeId: string, expiresAt: number, resendAfter: number, resends: number) => ({
  challengeId,
  expiresAt: new Date(expiresAt).toISOString(),
  resendAfter: new Date(resendAfter).toISOString(),
  resendsLeft: OTP_MAX_RESENDS - resends,
});

export interface RequestCodeInput {
  app: AppId;
  email: string;
  purpose: CodePurpose;
  consent?: { terms?: true; adult?: true } | undefined;
  requestId: string;
}

/**
 * POST /auth/sign-up/code, /auth/password/code and /auth/invitations/code. The same answer for
 * every email, in the same time (OTP_MIN_ANSWER_MS): a sign-up code goes to every email (an
 * account there already learns it only after its code); a password code only to an email with
 * an account, an invitation code only to an email with an invitation waiting in this app, and
 * nothing fits the others.
 */
export const requestCode = (deps: OtpDeps, input: RequestCodeInput): Promise<ChallengeView> =>
  evenly(() => requestCodeNow(deps, input));

async function requestCodeNow(
  deps: OtpDeps,
  { app, email, purpose, consent, requestId }: RequestCodeInput,
): Promise<ChallengeView> {
  const signUp = purpose === 'sign-up';
  // an invitation into a sign-up app asks that app's consent too, as its sign-up does
  const asksConsent = signUp || purpose === 'invite';
  const problems = asksConsent ? consentProblems(app, consent) : [];
  if (problems.length > 0) {
    throw new AppError('VALIDATION_FAILED', 'Please check the highlighted fields.', {
      details: problems,
    });
  }
  await countEmail(deps, email);
  const send =
    signUp ||
    (purpose === 'invite'
      ? await hasInvitation(deps.mongo, { email, app })
      : (await deps.mongo.db
          .collection<{ email: string }>(USERS)
          .countDocuments({ email }, { limit: 1 })) > 0);
  const challengeId = uuidv7();
  const code = newCode();
  const now = Date.now();
  const expiresAt = now + OTP_TTL_MS;
  const resendAfter = now + OTP_RESEND_AFTER_MS;
  const challenge: Challenge = {
    email,
    app,
    purpose,
    // nothing fits a challenge that sends no code
    codeHash: send
      ? hashOf(deps.keys, challengeId, code)
      : hashOf(deps.keys, challengeId, uuidv7()),
    send: send ? '1' : '0',
    terms: asksConsent && consent?.terms ? '1' : '0',
    // 18 or older is the customer app's rule (PRD §2): another app's answer is not a declaration
    adult: asksConsent && app === 'customer' && consent?.adult ? '1' : '0',
    attempts: '0',
    resends: '0',
    expiresAt: String(expiresAt),
    resendAfter: String(resendAfter),
  };
  const key = challengeKey(challengeId);
  await inRedis(() => deps.redis.multi().hset(key, challenge).pexpire(key, OTP_TTL_MS).exec());
  if (send) await emitCode(deps, challengeId, challenge, code, expiresAt, requestId);
  return viewOf(challengeId, expiresAt, resendAfter, 0);
}

/**
 * A new code in place of the old one, atomically: the challenge must still be there, have resends
 * left and be past its wait. -1 gone, -2 no resends left, -3 too soon, else the resends so far.
 */
const RESEND = `
if redis.call('EXISTS', KEYS[1]) == 0 then return -1 end
local resends = tonumber(redis.call('HGET', KEYS[1], 'resends'))
if resends >= tonumber(ARGV[4]) then return -2 end
if tonumber(redis.call('HGET', KEYS[1], 'resendAfter')) > tonumber(ARGV[5]) then return -3 end
redis.call('HSET', KEYS[1], 'codeHash', ARGV[1], 'attempts', 0, 'resends', resends + 1, 'expiresAt', ARGV[2], 'resendAfter', ARGV[3])
redis.call('PEXPIRE', KEYS[1], ARGV[6])
return resends + 1
`;

interface ResendCodeInput {
  app: AppId;
  challengeId: string;
  requestId: string;
}

/** POST /auth/otp/:challengeId/resend: a new code, the old one stops working (OTP_MIN_ANSWER_MS). */
export const resendCode = (deps: OtpDeps, input: ResendCodeInput): Promise<ChallengeView> =>
  evenly(() => resendCodeNow(deps, input));

async function resendCodeNow(
  deps: OtpDeps,
  { app, challengeId, requestId }: ResendCodeInput,
): Promise<ChallengeView> {
  const key = challengeKey(challengeId);
  const challenge = (await inRedis(() => deps.redis.hgetall(key))) as Partial<Challenge>;
  if (challenge.email === undefined || challenge.app !== app) throw otpExpired();
  const now = Date.now();
  // a refused resend must not use up the email's hourly codes; the script checks again atomically
  if (Number(challenge.resends) >= OTP_MAX_RESENDS) throw otpResendLimit();
  if (Number(challenge.resendAfter) > now) throw otpResendTooSoon();
  await countEmail(deps, challenge.email);
  const code = newCode();
  const expiresAt = now + OTP_TTL_MS;
  const resendAfter = now + OTP_RESEND_AFTER_MS;
  const send = challenge.send === '1';
  const codeHash = hashOf(deps.keys, challengeId, send ? code : uuidv7());
  const result = Number(
    await inRedis(() =>
      deps.redis.eval(
        RESEND,
        1,
        key,
        codeHash,
        String(expiresAt),
        String(resendAfter),
        String(OTP_MAX_RESENDS),
        String(now),
        String(OTP_TTL_MS),
      ),
    ),
  );
  if (result === -1) throw otpExpired();
  if (result === -2) throw otpResendLimit();
  if (result === -3) throw otpResendTooSoon();
  if (send) {
    await emitCode(
      deps,
      challengeId,
      { email: challenge.email, app, purpose: challenge.purpose ?? 'sign-up' },
      code,
      expiresAt,
      requestId,
    );
  }
  return viewOf(challengeId, expiresAt, resendAfter, result);
}

/** One more try on a challenge that is still there: -1 when it is gone (never makes a key). */
const TRY = `
if redis.call('EXISTS', KEYS[1]) == 0 then return -1 end
return redis.call('HINCRBY', KEYS[1], 'attempts', 1)
`;

const sameHash = (a: string, b: string): boolean => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};

export interface VerifyCodeInput {
  app: AppId;
  challengeId: string;
  code: string;
  /** The new password (passwordZod: trimmed, 12 to 128) */
  password: string;
  client: Client;
}

export interface VerifiedCode {
  userId: string;
  email: string;
  outcome: (typeof OTP_OUTCOMES)[number];
  signedIn: boolean;
  /** A new account's session (the route sets its cookies) */
  session?: IssuedSession;
}

/**
 * POST /auth/otp/:challengeId/verify. Five tries; a right code works once (the challenge is
 * deleted, and only the request that deleted it goes on). A breached password is refused before
 * that, so the same code works with another password. Then a sign-up code makes the account
 * (signed in) or adds the password to one without; a password code sets the password and lifts a
 * lock. A challenge from before sign-in by password (`sign-in`) no longer works.
 */
export async function verifyCode(
  deps: OtpDeps,
  { app, challengeId, code, password, client }: VerifyCodeInput,
): Promise<VerifiedCode> {
  const key = challengeKey(challengeId);
  const challenge = (await inRedis(() => deps.redis.hgetall(key))) as Partial<Challenge>;
  if (
    challenge.email === undefined ||
    challenge.codeHash === undefined ||
    challenge.app !== app ||
    (challenge.purpose !== 'sign-up' &&
      challenge.purpose !== 'password' &&
      challenge.purpose !== 'invite')
  ) {
    throw otpExpired();
  }
  const { email, purpose } = challenge;
  const tries = Number(await inRedis(() => deps.redis.eval(TRY, 1, key)));
  if (tries === -1) throw otpExpired();
  if (tries > OTP_MAX_TRIES) {
    await inRedis(() => deps.redis.del(key));
    throw otpExpired();
  }
  const right =
    challenge.send === '1' && sameHash(hashOf(deps.keys, challengeId, code), challenge.codeHash);
  if (!right) {
    if (tries >= OTP_MAX_TRIES) {
      await inRedis(() => deps.redis.del(key));
      throw otpExpired();
    }
    throw otpInvalid(OTP_MAX_TRIES - tries);
  }
  if (await deps.breached(password)) throw passwordBreached();
  const passwordHash = await hashPassword(password);
  // a code works once: of two requests with it, only the one that deletes it goes on
  if ((await inRedis(() => deps.redis.del(key))) === 0) throw otpExpired();

  if (purpose === 'password') {
    const user = await setPasswordWithCode(deps.mongo, { email, passwordHash });
    if (!user) throw otpExpired();
    await clearFailures(deps.redis, deps.keys, email, { unlock: true });
    await deps.sessions.endAll(user._id, 'password-changed');
    deps.logger.info({ userId: user._id, app }, 'password set with an email code');
    return { userId: user._id, email: user.email, outcome: 'password-set', signedIn: false };
  }

  const consent = { terms: challenge.terms === '1', adult: challenge.adult === '1' };
  if (purpose === 'invite') {
    return acceptWithCode(deps, { email, app, consent, ip: client.ip, passwordHash });
  }

  const { user, outcome } = await signUpWithCode(deps.mongo, {
    email,
    app,
    consent,
    legalVersion: deps.legalVersion,
    ip: client.ip,
    passwordHash,
  });
  deps.logger.info({ userId: user._id, app, outcome }, 'sign-up code used');
  if (outcome === 'password-set') {
    await clearFailures(deps.redis, deps.keys, email, { unlock: true });
    await deps.sessions.endAll(user._id, 'password-changed');
  }
  if (outcome !== 'account-made') {
    return { userId: user._id, email: user.email, outcome, signedIn: false };
  }
  const session = await deps.sessions.issue({
    userId: user._id,
    email: user.email,
    app,
    methods: ['email-code', 'password'],
    client,
  });
  return { ...session.user, outcome, signedIn: true, session };
}

/**
 * A right invitation code (TASKS T3.3): the email is proven, so the roles of its invitations in
 * this app are given; a new account gets the password, an account that has one keeps it (one
 * password for every app), an account without one (made with Google) gets it and its sessions
 * end. Never signed in here: the app's own sign-in comes next, with its authenticator. No
 * invitation left by now (taken back, run out, the inviter's right gone): like a used code.
 */
async function acceptWithCode(
  deps: OtpDeps,
  {
    email,
    app,
    consent,
    ip,
    passwordHash,
  }: {
    email: string;
    app: AppId;
    consent: { terms: boolean; adult: boolean };
    ip: string;
    passwordHash: string;
  },
): Promise<VerifiedCode> {
  const accepted = await withTransaction(deps.mongo, async (session) => {
    const now = new Date();
    const invitations = await acceptableInvitations(deps.mongo, session, { email, app, now });
    if (invitations.length === 0) return null;
    const { user, isNewUser } = await accountWithCode(deps.mongo, session, {
      email,
      app,
      consent,
      legalVersion: deps.legalVersion,
      ip,
      now,
    });
    const password = await passwordWithCode(deps.mongo, session, {
      user,
      isNewUser,
      passwordHash,
      now,
    });
    await acceptInvitations(deps.mongo, session, { userId: user._id, accepted: invitations, now });
    return { user, password, roles: invitations.map((invitation) => invitation.role) };
  });
  if (!accepted) throw otpExpired();
  const { user, password, roles } = accepted;
  if (password === 'password-set') {
    await clearFailures(deps.redis, deps.keys, email, { unlock: true });
    await deps.sessions.endAll(user._id, 'password-changed');
  }
  await publishAuthzVersions(deps.mongo, deps.redis, [user._id]);
  deps.logger.info({ userId: user._id, app, roles, password }, 'invitation accepted');
  return { userId: user._id, email: user.email, outcome: 'invite-accepted', signedIn: false };
}
