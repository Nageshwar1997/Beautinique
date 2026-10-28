import { blindIndex, type CryptoKeys } from '@beautinique/backend-server-crypto';
import { AppError } from '@beautinique/backend-server-kit';
import type { Redis } from 'ioredis';

import { signInUnavailable } from './errors.ts';

/**
 * Wrong tries per email (owner, 2026-10-27; ARCHITECTURE §7.1): 10 in 15 minutes lock the account
 * for an hour. Wrong passwords, authenticator and recovery codes all count. A locked account
 * answers like a wrong password, so the lock says nothing about the account either.
 */
export const FAIL_WINDOW_MS = 15 * 60_000;
export const MAX_FAILURES = 10;
export const LOCK_MS = 60 * 60_000;

/** Redis keys (`bq:id:*`, ARCHITECTURE §6.6), by a keyed hash of the email, never the email. */
const failKey = (index: string): string => `bq:id:login-fail:${index}`;
export const lockKey = (index: string): string => `bq:id:login-lock:${index}`;
export const emailIndex = (keys: CryptoKeys, email: string): string =>
  blindIndex(keys, 'login-email', email);

/** Redis away: no tries can be counted, so no sign-in goes on (503). */
async function inRedis<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw signInUnavailable(error);
  }
}

export async function isLocked(redis: Redis, keys: CryptoKeys, email: string): Promise<boolean> {
  const index = emailIndex(keys, email);
  return (await inRedis(() => redis.exists(lockKey(index)))) === 1;
}

/** One more wrong try; the tenth in the window locks the account for an hour. */
export async function recordFailure(redis: Redis, keys: CryptoKeys, email: string): Promise<void> {
  const index = emailIndex(keys, email);
  const key = failKey(index);
  const failures = await inRedis(async () => {
    const [[, value]] = (await redis
      .multi()
      .incr(key)
      .pexpire(key, FAIL_WINDOW_MS, 'NX')
      .exec()) as [[Error | null, number], [Error | null, number]];
    return value;
  });
  if (failures >= MAX_FAILURES) {
    await inRedis(() => redis.multi().set(lockKey(index), '1', 'PX', LOCK_MS).del(key).exec());
  }
}

/**
 * After a right sign-in the count starts again. A new password (proven by an email code) also
 * lifts a lock: the person showed the email is theirs.
 */
export async function clearFailures(
  redis: Redis,
  keys: CryptoKeys,
  email: string,
  { unlock = false }: { unlock?: boolean } = {},
): Promise<void> {
  const index = emailIndex(keys, email);
  const keysToDelete = unlock ? [failKey(index), lockKey(index)] : [failKey(index)];
  await inRedis(() => redis.del(...keysToDelete));
}
