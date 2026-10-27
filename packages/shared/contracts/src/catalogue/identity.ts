import {
  boolean,
  emailZod,
  enum as zodEnum,
  isoDateTimeZod,
  literal,
  number,
  object,
  otpZod,
  string,
  uuidv7Zod,
} from '@beautinique/shared-zod';

import { defineEvent } from '../events';
import { APPS } from '../platform';
import { defineRoute } from '../routes';

/** Apps that sign in with an email code (ARCHITECTURE §7.1); the internal apps use password + TOTP. */
export const OTP_APPS = ['customer', 'seller', 'creator', 'delivery'] as const;

/**
 * Apps where an unknown email makes a new account. A delivery partner is onboarded by a hub, never
 * signs up. The consent each of them asks for is in `consentProblems`.
 */
export const SIGN_UP_APPS = ['customer', 'seller', 'creator'] as const;

/**
 * Error codes of sign-in (RULES §4.15: codes in contracts, the text in one place). None of them tells whether an
 * email has an account.
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
} as const satisfies Record<string, number>;

/** Why a sign-in code was sent: to sign in to an account, or to make a new one (customer sign-up). */
export const OTP_PURPOSES = ['sign-in', 'sign-up'] as const;

/**
 * The associated data that binds a sealed code to its challenge: a code sealed for one challenge
 * does not open for another. identity seals with it, notify opens with it.
 */
export const otpSealContext = (challengeId: string): string => `identity.otp:${challengeId}`;

/**
 * A sign-in code was asked for, and notify emails it at once (the OTP fast lane, ARCHITECTURE §7.1).
 * The code travels sealed (AES-256-GCM, a key only identity and notify hold), so the outbox, Redis
 * and logs never see it; identity itself keeps only its hash.
 */
export const otpRequested = defineEvent({
  type: 'identity.otp.requested',
  version: 1,
  producer: 'identity',
  description:
    'A sign-in code was asked for; notify emails it (the code is sealed for notify only)',
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

/** The consent `app` needs before a code goes out; empty when it is complete. */
export function consentProblems(
  app: (typeof OTP_APPS)[number],
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
const otpChallengeZod = object({
  challengeId: uuidv7Zod,
  expiresAt: isoDateTimeZod,
  resendAfter: isoDateTimeZod,
  resendsLeft: number().int().min(0),
});

const challengeParams = object({ challengeId: uuidv7Zod });

/**
 * Sends a sign-in code to an email (OTP only by email, ARCHITECTURE §7.1). The answer is the same
 * whether or not the email has an account; in a sign-up app an unknown email gets a code to make one.
 */
export const requestOtp = defineRoute({
  id: 'auth.otp.request',
  method: 'POST',
  path: '/auth/otp',
  summary: 'Email a sign-in code (the same answer for every email)',
  apps: OTP_APPS,
  access: { type: 'public' },
  rateLimit: 'otp',
  idempotency: false,
  stepUp: false,
  owner: 'identity',
  input: { body: object({ email: emailZod, consent: otpConsentZod.optional() }) },
  output: otpChallengeZod,
});

/** A new code for the same challenge: at most 3, a minute apart; the old code stops working. */
export const resendOtp = defineRoute({
  id: 'auth.otp.resend',
  method: 'POST',
  path: '/auth/otp/:challengeId/resend',
  summary: 'Email a new sign-in code for the same challenge',
  apps: OTP_APPS,
  access: { type: 'public' },
  rateLimit: 'otp',
  idempotency: false,
  stepUp: false,
  owner: 'identity',
  input: { params: challengeParams },
  output: otpChallengeZod,
});

/**
 * Checks a code: 5 tries per challenge, each code works once. A right code signs in, or makes the
 * account in a sign-up app. The session (cookies) comes with T3.2.
 */
export const verifyOtp = defineRoute({
  id: 'auth.otp.verify',
  method: 'POST',
  path: '/auth/otp/:challengeId/verify',
  summary: 'Check a sign-in code; a right one signs in or makes the account',
  apps: OTP_APPS,
  access: { type: 'public' },
  rateLimit: 'auth',
  idempotency: false,
  stepUp: false,
  owner: 'identity',
  input: { params: challengeParams, body: object({ code: otpZod }) },
  output: object({ userId: uuidv7Zod, email: emailZod, isNewUser: boolean() }),
});
