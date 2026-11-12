import { blindIndex, type CryptoKeys } from '@beautinique/backend-server-crypto';
import { AppError } from '@beautinique/backend-server-kit';
import { ipKey } from '@beautinique/backend-server-ratelimit';
import type { Redis } from 'ioredis';

import { signInUnavailable } from './errors.ts';

/**
 * Wrong tries per email (owner, 2026-10-27; per IP since 2026-11-12, QA DR-003; ARCHITECTURE
 * §7.1): wrong passwords, authenticator and recovery codes all count. 10 from one IP in 15 minutes
 * lock the account for that IP for an hour; the owner elsewhere goes on. 50 from every IP together
 * lock it everywhere for 15 minutes. Tries during a lock are not counted, so they never make it
 * longer. A locked account answers like a wrong password, so the lock says nothing about it.
 */
export const FAIL_WINDOW_MS = 15 * 60_000;
export const MAX_FAILURES = 10;
export const LOCK_MS = 60 * 60_000;
export const MAX_ACCOUNT_FAILURES = 50;
export const ACCOUNT_LOCK_MS = 15 * 60_000;

/**
 * Redis keys (`bq:id:*`, ARCHITECTURE §6.6), by a keyed hash of the email, never the email. Both
 * are hashes with a field per IP bucket and `*` for the whole account: the counts of the window,
 * and the time (ms) each lock ends.
 */
const failKey = (index: string): string => `bq:id:login-fail:${index}`;
export const lockKey = (index: string): string => `bq:id:login-lock:${index}`;
export const emailIndex = (keys: CryptoKeys, email: string): string =>
  blindIndex(keys, 'login-email', email);
const ACCOUNT = '*';

/** An IP's bucket, as the gateway's limits: IPv4 as it is, IPv6 as its /64; `unknown` without one. */
export function ipBucket(ip: string): string {
  try {
    return ipKey(ip);
  } catch {
    return 'unknown';
  }
}

/** Redis away: no tries can be counted, so no sign-in goes on (503). */
async function inRedis<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw signInUnavailable(error);
  }
}

/** Is the account locked for this IP: its own lock, or the whole account's? */
export async function isLocked(
  redis: Redis,
  keys: CryptoKeys,
  email: string,
  ip: string,
): Promise<boolean> {
  const index = emailIndex(keys, email);
  const ends = await inRedis(() => redis.hmget(lockKey(index), ipBucket(ip), ACCOUNT));
  const now = Date.now();
  return ends.some((end) => end !== null && Number(end) > now);
}

/**
 * One more wrong try from this IP, unless the account is locked for it already. The IP's tenth in
 * the window locks it for an hour, the account's fiftieth locks everyone for 15 minutes.
 */
export async function recordFailure(
  redis: Redis,
  keys: CryptoKeys,
  email: string,
  ip: string,
): Promise<void> {
  if (await isLocked(redis, keys, email, ip)) return;
  const index = emailIndex(keys, email);
  const bucket = ipBucket(ip);
  const fails = failKey(index);
  const [mine, all] = await inRedis(async () => {
    const answers = (await redis
      .multi()
      .hincrby(fails, bucket, 1)
      .hincrby(fails, ACCOUNT, 1)
      .pexpire(fails, FAIL_WINDOW_MS, 'NX')
      .exec()) as [Error | null, number][];
    return [answers[0]?.[1] ?? 0, answers[1]?.[1] ?? 0];
  });
  const now = Date.now();
  const locks: [field: string, forMs: number][] = [];
  if (mine >= MAX_FAILURES) locks.push([bucket, LOCK_MS]);
  if (all >= MAX_ACCOUNT_FAILURES) locks.push([ACCOUNT, ACCOUNT_LOCK_MS]);
  if (locks.length === 0) return;
  const lock = lockKey(index);
  const longest = Math.max(...locks.map(([, forMs]) => forMs));
  await inRedis(() => {
    const write = redis.multi();
    for (const [field, forMs] of locks) write.hset(lock, field, String(now + forMs));
    // the key lives as long as its longest lock: set when new, longer only (GT)
    write.pexpire(lock, longest, 'NX').pexpire(lock, longest, 'GT');
    // their counts start again once the lock ends
    write.hdel(fails, ...locks.map(([field]) => field));
    return write.exec();
  });
}

/**
 * After a right sign-in from an IP its count starts again (the account's runs out by itself). A new
 * password (proven by an email code) lifts every lock: the person showed the email is theirs.
 */
export async function clearFailures(
  redis: Redis,
  keys: CryptoKeys,
  email: string,
  options: { ip: string } | { unlock: true },
): Promise<void> {
  const index = emailIndex(keys, email);
  await inRedis(() =>
    'unlock' in options
      ? redis.del(failKey(index), lockKey(index))
      : redis.hdel(failKey(index), ipBucket(options.ip)),
  );
}
