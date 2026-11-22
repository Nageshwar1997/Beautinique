import { createRateLimiter } from '@beautinique/backend-server-ratelimit';
import type { Redis } from 'ioredis';

import { otpBusy, otpSignUpLimit, otpUnavailable } from './errors.ts';
import { RATE_LIMIT_PREFIX } from './password.ts';

/** Takes one code email from the budgets of every IP together; throws when one is spent. */
export type CodeBudget = (code: { signUp: boolean }) => Promise<void>;

const DAY_MS = 24 * 60 * 60_000;

/**
 * Code emails are free for anyone to ask for, and the day has 300 emails in all (Brevo free), so
 * (owner, 2026-11-12, QA DR-009): every IP together gets `perHour` codes an hour (resends too;
 * GCRA), and sign-up codes `signUpPerDay` of a UTC day (notify's day too), so a flood of made-up
 * sign-ups leaves room for password, invitation and security emails. Past either the app says so
 * at once (OTP_BUSY, OTP_SIGN_UP_LIMIT), instead of a code that quietly never comes. Redis away: 503.
 */
export function codeBudget({
  redis,
  perHour,
  signUpPerDay,
  prefix = RATE_LIMIT_PREFIX,
  now = Date.now,
}: {
  redis: Redis;
  perHour: number;
  signUpPerDay: number;
  prefix?: string;
  now?: () => number;
}): CodeBudget {
  const limiter = createRateLimiter({ redis, prefix });
  const hour = { limit: perHour, windowMs: 60 * 60_000 };
  return async ({ signUp }) => {
    let allowed: boolean;
    try {
      ({ allowed } = await limiter.take('codes', hour));
    } catch (error) {
      throw otpUnavailable(error);
    }
    if (!allowed) throw otpBusy();
    if (!signUp) return;
    const key = `${prefix}sign-up-codes:${new Date(now()).toISOString().slice(0, 10)}`;
    let count: number;
    try {
      const [[, value]] = (await redis
        .multi()
        .incr(key)
        .pexpire(key, 2 * DAY_MS, 'NX')
        .exec()) as [[Error | null, number], [Error | null, number]];
      count = value;
    } catch (error) {
      throw otpUnavailable(error);
    }
    if (count > signUpPerDay) throw otpSignUpLimit();
  };
}
