import {
  emailZod,
  enum as zodEnum,
  isoDateTimeZod,
  object,
  string,
  uuidv7Zod,
} from '@beautinique/shared-zod';

import { defineEvent } from '../events';
import { APPS } from '../platform';

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
