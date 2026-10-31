import {
  array,
  boolean,
  emailZod,
  enum as zodEnum,
  isoDateTimeZod,
  literal,
  number,
  object,
  otpZod,
  passwordZod,
  string,
  uuidv7Zod,
} from '@beautinique/shared-zod';

import { defineEvent } from '../events';
import { type AppId, APPS } from '../platform';
import { defineRoute } from '../routes';

/**
 * Apps where an unknown email makes a new account (email code + password). A delivery partner is
 * onboarded by a hub, staff by their admins: they never sign up. The consent each of them asks for
 * is in `consentProblems`.
 */
export const SIGN_UP_APPS = ['customer', 'seller', 'creator'] as const;

/**
 * Apps where every sign-in also asks for the authenticator code, and that make a person set one up
 * at the first sign-in (ARCHITECTURE §7.1). Elsewhere it is the person's choice; once set up, every
 * app asks for it.
 */
export const TOTP_REQUIRED_APPS = [
  'admin',
  'superadmin',
  'master',
  'support',
  'finance',
  'logistics',
  'growth',
] as const satisfies readonly AppId[];

/**
 * Error codes of sign-in (RULES §4.15: codes in contracts, the text in one place). None of them
 * tells whether an email has an account before the person proved the email is theirs.
 */
export const IDENTITY_ERROR_CODES = {
  /** Wrong code; the challenge still takes tries */
  OTP_INVALID: 400,
  /** No such challenge any more: expired, used, or out of tries. Ask for a new code. */
  OTP_EXPIRED: 400,
  /** A new code was asked for too soon after the last one */
  OTP_RESEND_TOO_SOON: 429,
  /** This challenge has sent all the codes it may */
  OTP_RESEND_LIMIT: 429,
  /** Too many codes for this email in the last hour */
  OTP_EMAIL_LIMIT: 429,
  /** Wrong email or password, or too many wrong tries: the same answer for all three */
  INVALID_CREDENTIALS: 401,
  /** The password is in a known data breach (Have I Been Pwned): choose another */
  PASSWORD_BREACHED: 400,
  /** No such sign-in step any more: it expired, finished, or ran out of tries. Sign in again. */
  LOGIN_EXPIRED: 400,
  /** Wrong authenticator code, or one already used */
  TOTP_INVALID: 400,
  /** No session to refresh: no cookie, ended, expired, or an unknown token. Sign in again. */
  SESSION_EXPIRED: 401,
  /** Another request refreshed this session a moment ago: try again with the new cookie */
  REFRESH_IN_PROGRESS: 409,
  /** Wrong recovery code, or one already used */
  RECOVERY_CODE_INVALID: 400,
  /** A step-up needs the account's authenticator, and it has none: set one up first */
  AUTHENTICATOR_REQUIRED: 400,
  /** An authenticator was saved meanwhile (another tab): replace it after a step-up */
  AUTHENTICATOR_EXISTS: 409,
  /** No authenticator set-up waiting: it expired (10 minutes), finished or ran out of tries */
  AUTHENTICATOR_SETUP_EXPIRED: 400,
  /** A role the account holds needs an authenticator, so it stays on (the roles in `details`) */
  AUTHENTICATOR_REQUIRED_BY_ROLE: 409,
  /** The account has no password yet (made with Google ...): set one first */
  PASSWORD_REQUIRED: 400,
  /** Wrong password while signed in (a lock counts it like a sign-in) */
  PASSWORD_INVALID: 400,
} as const satisfies Record<string, number>;

/**
 * Why an email code was sent: to make an account (sign-up), to set a password (the first one, or a
 * forgotten one), or to accept an invitation (TASKS T3.3: the email proven, then the password, as
 * ARCHITECTURE §7.1 asks). Every app signs in with email + password, never with a code (owner,
 * 2026-10-27, ARCHITECTURE §7.1); `sign-in` stays only so events already in an outbox still read.
 */
export const OTP_PURPOSES = ['sign-in', 'sign-up', 'password', 'invite'] as const;

/**
 * The associated data that binds a sealed code to its challenge: a code sealed for one challenge
 * does not open for another. identity seals with it, notify opens with it.
 */
export const otpSealContext = (challengeId: string): string => `identity.otp:${challengeId}`;

/**
 * An email code was asked for, and notify emails it at once (the OTP fast lane, ARCHITECTURE §7.1).
 * The code travels sealed (AES-256-GCM, a key only identity and notify hold), so the outbox, Redis
 * and logs never see it; identity itself keeps only its hash.
 */
export const otpRequested = defineEvent({
  type: 'identity.otp.requested',
  version: 1,
  producer: 'identity',
  description: 'An email code was asked for; notify emails it (the code is sealed for notify only)',
  data: object({
    challengeId: uuidv7Zod,
    email: emailZod,
    app: zodEnum(APPS),
    purpose: zodEnum(OTP_PURPOSES),
    /** `v1.<keyId>.<iv>.<data>.<tag>` from @beautinique/backend-server-crypto */
    sealedCode: string()
      .max(200)
      .regex(/^v1\.[a-z][a-z0-9]*(?:\.[\w-]+){3}$/, 'Not a sealed value'),
    /** After this the code no longer works, so an email still waiting is not sent. */
    expiresAt: isoDateTimeZod,
  }),
});

/**
 * What a sign-up app asks with every code request: the terms and privacy notice, and in the
 * customer app that the person is 18 or older (PRD §2). Every request asks it, account or not, so
 * the answer never tells which emails have an account.
 */
export const otpConsentZod = object({
  terms: literal(true),
  adult: literal(true).optional(),
});

/** The consent `app` needs before a sign-up code goes out; empty when it is complete. */
export function consentProblems(
  app: AppId,
  consent: { terms?: true; adult?: true } | undefined,
): { path: string[]; message: string }[] {
  if (!(SIGN_UP_APPS as readonly string[]).includes(app)) return [];
  const problems: { path: string[]; message: string }[] = [];
  if (consent?.terms !== true) {
    problems.push({ path: ['consent', 'terms'], message: 'Accept the terms and privacy notice' });
  }
  if (app === 'customer' && consent?.adult !== true) {
    problems.push({ path: ['consent', 'adult'], message: 'Confirm that you are 18 or older' });
  }
  return problems;
}

/** A code on its way: when it stops working, and when another may be asked for. */
export const otpChallengeZod = object({
  challengeId: uuidv7Zod,
  expiresAt: isoDateTimeZod,
  resendAfter: isoDateTimeZod,
  resendsLeft: number().int().min(0),
});

const challengeParams = object({ challengeId: uuidv7Zod });

/**
 * Sign-up, step 1: an email code to prove the email, with the consent of the sign-up app. The same
 * answer for every email; an account that is there already is told so only after its code.
 */
export const requestSignUpCode = defineRoute({
  id: 'auth.signUp.code',
  method: 'POST',
  path: '/auth/sign-up/code',
  summary: 'Email a code to make an account (the same answer for every email)',
  apps: SIGN_UP_APPS,
  access: { type: 'public' },
  rateLimit: 'otp',
  idempotency: false,
  stepUp: false,
  owner: 'identity',
  input: { body: object({ email: emailZod, consent: otpConsentZod.optional() }) },
  output: otpChallengeZod,
});

/**
 * An email code to set a password: the first one (an account made with Google, a rider or a staff
 * account) or a forgotten one. Any app; an email without an account gets no email, and the same
 * answer in the same time.
 */
export const requestPasswordCode = defineRoute({
  id: 'auth.password.code',
  method: 'POST',
  path: '/auth/password/code',
  summary: 'Email a code to set a password (the same answer for every email)',
  apps: APPS,
  access: { type: 'public' },
  rateLimit: 'otp',
  idempotency: false,
  stepUp: false,
  owner: 'identity',
  input: { body: object({ email: emailZod }) },
  output: otpChallengeZod,
});

/** A new code for the same challenge: at most 3, a minute apart; the old code stops working. */
export const resendOtp = defineRoute({
  id: 'auth.otp.resend',
  method: 'POST',
  path: '/auth/otp/:challengeId/resend',
  summary: 'Email a new code for the same challenge',
  apps: APPS,
  access: { type: 'public' },
  rateLimit: 'otp',
  idempotency: false,
  stepUp: false,
  owner: 'identity',
  input: { params: challengeParams },
  output: otpChallengeZod,
});

/** Who signed in. The session (cookies) comes with T3.2. */
export const signedInZod = object({ userId: uuidv7Zod, email: emailZod });

/**
 * What a right code did. `account-made`: a new account, signed in. `password-set`: the password
 * of an account (a password code; or a sign-up code for an account without one, made with
 * Google). `password-kept`: a sign-up code for an account that has a password already; the app's
 * consent is recorded, the password is not changed: sign in with it, or reset it.
 * `invite-accepted`: an invitation code; the invited roles are given (a new account gets the
 * password, an account that has one keeps it). Never signed in: the app's sign-in comes next, with
 * its authenticator (TASKS T3.3).
 */
export const OTP_OUTCOMES = [
  'account-made',
  'password-set',
  'password-kept',
  'invite-accepted',
] as const;

/**
 * Checks an email code together with the new password: 5 tries per challenge, each code works
 * once (OTP_OUTCOMES). A breached password is refused before the code is used up.
 */
export const verifyOtp = defineRoute({
  id: 'auth.otp.verify',
  method: 'POST',
  path: '/auth/otp/:challengeId/verify',
  summary: 'Check an email code and set the password; a sign-up code makes the account',
  apps: APPS,
  access: { type: 'public' },
  rateLimit: 'auth',
  idempotency: false,
  stepUp: false,
  owner: 'identity',
  input: { params: challengeParams, body: object({ code: otpZod, password: passwordZod }) },
  output: object({
    userId: uuidv7Zod,
    email: emailZod,
    outcome: zodEnum(OTP_OUTCOMES),
    /** true only for a new account; after setting a password, sign in with it */
    signedIn: boolean(),
  }),
});

/** Where a sign-in goes next: the authenticator, setting one up, or signed in. */
export const LOGIN_NEXT = ['totp', 'totp-enroll', 'signed-in'] as const;

const loginParams = object({ loginId: uuidv7Zod });

/**
 * The password the account has, to check it (trimmed like a new one). Not passwordZod: the length
 * rules are for new ones.
 */
const currentPasswordZod = string('Password is required')
  .trim()
  .nonempty('Enter your password')
  .max(128, 'Use at most 128 characters');

/**
 * Sign-in in every app: email + password. A wrong email, a wrong password and a locked account (10
 * wrong tries in 15 minutes lock it for an hour) all answer INVALID_CREDENTIALS, in the same time.
 */
export const passwordLogin = defineRoute({
  id: 'auth.login.password',
  method: 'POST',
  path: '/auth/login',
  summary: 'Sign in with email and password',
  apps: APPS,
  access: { type: 'public' },
  rateLimit: 'auth',
  idempotency: false,
  stepUp: false,
  owner: 'identity',
  input: { body: object({ email: emailZod, password: currentPasswordZod }) },
  output: object({
    next: zodEnum(LOGIN_NEXT),
    /** The sign-in in progress, for the next step (5 minutes; 10 to set up an authenticator) */
    loginId: uuidv7Zod.optional(),
    user: signedInZod.optional(),
  }),
});

/** Sign-in, second step: the authenticator code (each code works once). */
export const loginTotp = defineRoute({
  id: 'auth.login.totp',
  method: 'POST',
  path: '/auth/login/:loginId/totp',
  summary: 'Finish a sign-in with the authenticator code',
  apps: APPS,
  access: { type: 'public' },
  rateLimit: 'auth',
  idempotency: false,
  stepUp: false,
  owner: 'identity',
  input: { params: loginParams, body: object({ code: otpZod }) },
  output: object({ user: signedInZod }),
});

/** A recovery code: `ABCDE-FGHIJ` (base32, any case, the hyphen optional). */
export const recoveryCodeZod = string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z2-7]{5}-?[A-Z2-7]{5}$/, 'Enter a recovery code like ABCDE-FGHIJ');

/** Sign-in, second step without the phone: one of the 10 recovery codes (each works once). */
export const loginRecovery = defineRoute({
  id: 'auth.login.recovery',
  method: 'POST',
  path: '/auth/login/:loginId/recovery',
  summary: 'Finish a sign-in with a recovery code',
  apps: APPS,
  access: { type: 'public' },
  rateLimit: 'auth',
  idempotency: false,
  stepUp: false,
  owner: 'identity',
  input: { params: loginParams, body: object({ code: recoveryCodeZod }) },
  output: object({ user: signedInZod, recoveryCodesLeft: number().int().min(0) }),
});

/**
 * Sets up the authenticator during a sign-in that needs one: the secret to type in, and the
 * otpauth link for the QR code (drawn in the browser, never by another site).
 */
export const startTotpEnroll = defineRoute({
  id: 'auth.login.totpEnroll',
  method: 'POST',
  path: '/auth/login/:loginId/totp/enroll',
  summary: 'Start setting up the authenticator',
  apps: APPS,
  access: { type: 'public' },
  rateLimit: 'auth',
  idempotency: false,
  stepUp: false,
  owner: 'identity',
  input: { params: loginParams },
  output: object({ secret: string(), uri: string() }),
});

/** The first authenticator code saves it: 10 recovery codes (shown once), and signed in. */
export const confirmTotpEnroll = defineRoute({
  id: 'auth.login.totpConfirm',
  method: 'POST',
  path: '/auth/login/:loginId/totp/confirm',
  summary: 'Finish setting up the authenticator and get the recovery codes',
  apps: APPS,
  access: { type: 'public' },
  rateLimit: 'auth',
  idempotency: false,
  stepUp: false,
  owner: 'identity',
  input: { params: loginParams, body: object({ code: otpZod }) },
  output: object({ user: signedInZod, recoveryCodes: array(string()).length(10) }),
});

/** Who signs the access tokens (`iss`), and for which app a token is (`aud`, ARCHITECTURE §7.2). */
export const TOKEN_ISSUER = 'bq:identity';
export const tokenAudience = (app: AppId): string => `bq:${app}`;
/** An access token works 10 minutes; the refresh token gets the next one. */
export const ACCESS_TOKEN_SECONDS = 600;

/**
 * How long a session lasts per app (ARCHITECTURE §7.2). `slidingMs`: each refresh moves the end
 * this far ahead, never past `maxMs` from the sign-in. `idleMs`: no refresh for this long ends it.
 */
export interface SessionPolicy {
  slidingMs: number;
  maxMs: number;
  idleMs?: number;
}
const DAY_MS = 24 * 60 * 60_000;
const internal: SessionPolicy = {
  slidingMs: 12 * 60 * 60_000,
  maxMs: 12 * 60 * 60_000,
  idleMs: 30 * 60_000,
};
export const SESSION_POLICIES: Readonly<Record<AppId, SessionPolicy>> = {
  customer: { slidingMs: 30 * DAY_MS, maxMs: 90 * DAY_MS },
  creator: { slidingMs: 30 * DAY_MS, maxMs: 90 * DAY_MS },
  seller: { slidingMs: 7 * DAY_MS, maxMs: 7 * DAY_MS },
  delivery: { slidingMs: 14 * DAY_MS, maxMs: 14 * DAY_MS },
  admin: internal,
  superadmin: internal,
  master: internal,
  support: internal,
  finance: internal,
  logistics: internal,
  growth: internal,
};

/**
 * The cookies of an app's session, on its own host (no Domain), HttpOnly and Secure. The access
 * cookie goes with every /api request; the refresh cookie only to /api/v1/auth (refresh, logout).
 */
export const accessCookieName = (app: AppId): string => `__Host-bq_${app}_at`;
export const refreshCookieName = (app: AppId): string => `__Secure-bq_${app}_rt`;
export const REFRESH_COOKIE_PATH = '/api/v1/auth';

/**
 * A new access token (and refresh token) for the session in the refresh cookie; the old refresh
 * token stops working. One used again after its successor means it was copied: the session ends
 * and the person gets an email. No cookie, an ended session or an unknown token: SESSION_EXPIRED.
 */
export const refreshSession = defineRoute({
  id: 'auth.session.refresh',
  method: 'POST',
  path: '/auth/refresh',
  summary: 'Get a new access token with the refresh cookie',
  apps: APPS,
  access: { type: 'public' },
  rateLimit: 'auth',
  idempotency: false,
  stepUp: false,
  owner: 'identity',
  input: {},
  output: object({ user: signedInZod, sessionId: uuidv7Zod, expiresAt: isoDateTimeZod }),
});

/** Ends the session in the refresh cookie (if any) and clears the app's cookies. */
export const logout = defineRoute({
  id: 'auth.session.logout',
  method: 'POST',
  path: '/auth/logout',
  summary: 'Sign out of this app on this device',
  apps: APPS,
  access: { type: 'public' },
  rateLimit: 'auth',
  idempotency: false,
  stepUp: false,
  owner: 'identity',
  input: {},
  output: object({ signedOut: literal(true) }),
});

/**
 * A refresh token was used after it had been replaced: someone else has a copy. The session is
 * ended, and notify tells the person by email (ARCHITECTURE §7.2).
 */
export const sessionReuseDetected = defineEvent({
  type: 'identity.session.reuseDetected',
  version: 1,
  producer: 'identity',
  description: 'An old refresh token came back; the session was ended and the person is told',
  data: object({
    sessionId: uuidv7Zod,
    userId: uuidv7Zod,
    email: emailZod,
    app: zodEnum(APPS),
    /** What the session's browser called itself at sign-in, e.g. `Chrome on Windows` */
    device: string().max(120),
    detectedAt: isoDateTimeZod,
  }),
});

/**
 * Redis keys identity writes and the gateway reads at every request (ARCHITECTURE §7.2), so an
 * ended session stops at once instead of when its access token runs out: a session that ended,
 * and since when every session of an account ended (a new password). Both live as long as an
 * access token.
 */
export const revokedSessionKey = (sessionId: string): string =>
  `bq:id:session-revoked:${sessionId}`;
export const revokedUserKey = (userId: string): string => `bq:id:user-revoked:${userId}`;

/** The ways an account signs in (identity_auth_providers). */
export const AUTH_PROVIDERS = ['password', 'google', 'linkedin', 'github'] as const;

/**
 * Who is signed in, the first call of every app (ARCHITECTURE §7.2): the account, how it signs
 * in, and this session. The app keeps nothing of it in browser storage. Grants come with T3.3.
 */
export const getMe = defineRoute({
  id: 'iam.me.get',
  method: 'GET',
  path: '/iam/me',
  summary: 'Who is signed in, and this session',
  apps: APPS,
  access: { type: 'signed-in' },
  rateLimit: 'read',
  idempotency: false,
  stepUp: false,
  owner: 'identity',
  input: {},
  output: object({
    user: object({
      userId: uuidv7Zod,
      email: emailZod,
      /** When the person declared being 18 or older (customer app); null until then */
      ageDeclaredAt: isoDateTimeZod.nullable(),
      signUpApp: zodEnum(APPS),
      /** An account made with Google alone has no `password`: the app suggests setting one */
      providers: array(zodEnum(AUTH_PROVIDERS)),
      authenticator: boolean(),
      /** Recovery codes not used yet; null without an authenticator */
      recoveryCodesLeft: number().int().min(0).nullable(),
    }),
    session: object({
      sessionId: uuidv7Zod,
      app: zodEnum(APPS),
      expiresAt: isoDateTimeZod,
    }),
  }),
});

const sessionViewZod = object({
  sessionId: uuidv7Zod,
  app: zodEnum(APPS),
  /** `Chrome on Windows` */
  device: string(),
  ip: string(),
  createdAt: isoDateTimeZod,
  lastSeenAt: isoDateTimeZod,
  expiresAt: isoDateTimeZod,
  /** This browser's session in this app */
  current: boolean(),
});

/**
 * My Devices: every session of the account that has not ended, in every app (owner, 2026-10-28),
 * the newest first.
 */
export const listSessions = defineRoute({
  id: 'auth.sessions.list',
  method: 'GET',
  path: '/auth/sessions',
  summary: 'My Devices: the account’s sessions in every app',
  apps: APPS,
  access: { type: 'signed-in' },
  rateLimit: 'read',
  idempotency: false,
  stepUp: false,
  owner: 'identity',
  input: {},
  output: object({ sessions: array(sessionViewZod) }),
});

/** Ends one session of the account (another device, or this one). */
export const endSession = defineRoute({
  id: 'auth.sessions.end',
  method: 'DELETE',
  path: '/auth/sessions/:sessionId',
  summary: 'Sign one device out',
  apps: APPS,
  access: { type: 'signed-in' },
  rateLimit: 'auth',
  idempotency: false,
  stepUp: false,
  owner: 'identity',
  input: { params: object({ sessionId: uuidv7Zod }) },
  output: object({ ended: boolean() }),
});

/** Ends every session of the account except this one. */
export const endOtherSessions = defineRoute({
  id: 'auth.sessions.endOthers',
  method: 'POST',
  path: '/auth/sessions/end-others',
  summary: 'Sign every other device out',
  apps: APPS,
  access: { type: 'signed-in' },
  rateLimit: 'auth',
  idempotency: false,
  stepUp: false,
  owner: 'identity',
  input: {},
  output: object({ ended: number().int().min(0) }),
});

// ---- The authenticator, signed in (ARCHITECTURE §9.2, owner 2026-10-31) ----

/**
 * Sets up the authenticator from the account's settings (in an app where it is the person's
 * choice): a new secret to type in, and the otpauth link for the QR code (drawn in the browser).
 * The secret waits for its first code 10 minutes (5 tries); asking again replaces it. An account
 * that has one already replaces it (a new phone) only after a step-up: STEP_UP_REQUIRED without
 * one. An account without a password sets one first (PASSWORD_REQUIRED).
 */
export const enrollAuthenticator = defineRoute({
  id: 'auth.authenticator.enroll',
  method: 'POST',
  path: '/auth/authenticator/enroll',
  summary: 'Start setting up (or replacing) the authenticator',
  apps: APPS,
  access: { type: 'signed-in' },
  rateLimit: 'auth',
  idempotency: false,
  stepUp: false,
  owner: 'identity',
  input: {},
  output: object({ secret: string(), uri: string() }),
});

/**
 * The first authenticator code and the account's password save it, with 10 new recovery codes
 * (shown once; any old ones stop working). The person is emailed. Wrong ones count toward the
 * account's lock like a sign-in.
 */
export const confirmAuthenticator = defineRoute({
  id: 'auth.authenticator.confirm',
  method: 'POST',
  path: '/auth/authenticator/confirm',
  summary: 'Finish setting up the authenticator and get the recovery codes',
  apps: APPS,
  access: { type: 'signed-in' },
  rateLimit: 'auth',
  idempotency: false,
  stepUp: false,
  owner: 'identity',
  input: { body: object({ code: otpZod, password: currentPasswordZod }) },
  output: object({ recoveryCodes: array(string()).length(10) }),
});

/** 10 new recovery codes (shown once); the old ones stop working, and the person is emailed. */
export const newRecoveryCodes = defineRoute({
  id: 'auth.authenticator.recoveryCodes',
  method: 'POST',
  path: '/auth/authenticator/recovery-codes',
  summary: 'Get 10 new recovery codes',
  apps: APPS,
  access: { type: 'signed-in' },
  rateLimit: 'auth',
  idempotency: false,
  stepUp: true,
  owner: 'identity',
  input: {},
  output: object({ recoveryCodes: array(string()).length(10) }),
});

/**
 * Turns the authenticator off, with its recovery codes. Never while a role the account holds needs
 * one (TOTP_REQUIRED_APPS, Seller Account Owner, Seller Finance ...): AUTHENTICATOR_REQUIRED_BY_ROLE
 * names them. The person is emailed; their sessions stay.
 */
export const disableAuthenticator = defineRoute({
  id: 'auth.authenticator.disable',
  method: 'DELETE',
  path: '/auth/authenticator',
  summary: 'Turn the authenticator off',
  apps: APPS,
  access: { type: 'signed-in' },
  rateLimit: 'auth',
  idempotency: false,
  stepUp: true,
  owner: 'identity',
  input: {},
  output: object({ disabled: boolean() }),
});

/** What changed about an account's authenticator, by the person themself. */
export const AUTHENTICATOR_CHANGES = ['enabled', 'replaced', 'recovery-codes', 'disabled'] as const;

/** The person changed their authenticator; notify tells them (a security email, no secret in it). */
export const authenticatorChanged = defineEvent({
  type: 'identity.authenticator.changed',
  version: 1,
  producer: 'identity',
  description:
    'Someone set up, replaced or turned off their authenticator, or got new recovery codes',
  data: object({
    userId: uuidv7Zod,
    email: emailZod,
    change: zodEnum(AUTHENTICATOR_CHANGES),
    /** The app it was done in */
    app: zodEnum(APPS),
    /** `Chrome on Windows` */
    device: string().max(120),
    changedAt: isoDateTimeZod,
  }),
});
