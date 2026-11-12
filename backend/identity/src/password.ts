import { argon2, createHash, randomBytes, timingSafeEqual } from 'node:crypto';

import type { Logger } from '@beautinique/backend-server-kit';
import { createRateLimiter } from '@beautinique/backend-server-ratelimit';
import axios from 'axios';
import type { Redis } from 'ioredis';

import { passwordsBusy, signInUnavailable } from './errors.ts';

/**
 * argon2id at the OWASP minimum (ARCHITECTURE §11.1): 19 MiB, 2 passes, 1 lane. A new setting here
 * makes every stored hash "need a rehash", and the next sign-in stores it with the new one.
 */
export const ARGON2 = { memory: 19_456, passes: 2, parallelism: 1, tagLength: 32 } as const;
const SALT_BYTES = 16;
/** Sign-ins waiting for a hash before the next one is refused (503) instead of queued. */
export const MAX_WAITING_HASHES = 32;

interface Params {
  memory: number;
  passes: number;
  parallelism: number;
}

const derive = (password: string, nonce: Buffer, params: Params): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    argon2(
      'argon2id',
      { message: password, nonce, tagLength: ARGON2.tagLength, ...params },
      (error, key) => {
        if (error) reject(error);
        else resolve(key);
      },
    );
  });

// One hash at a time: 19 MiB each, and the free server has 512 MB for every deployable at once
let queue: Promise<unknown> = Promise.resolve();
let waiting = 0;
async function oneAtATime<T>(work: () => Promise<T>): Promise<T> {
  if (waiting >= MAX_WAITING_HASHES) throw passwordsBusy();
  waiting += 1;
  const run = queue.then(work);
  queue = run.catch(() => undefined);
  try {
    return await run;
  } finally {
    waiting -= 1;
  }
}

const b64 = (bytes: Buffer): string => bytes.toString('base64').replace(/=+$/, '');
const PHC = /^\$argon2id\$v=19\$m=(\d+),t=(\d+),p=(\d+)\$([A-Za-z0-9+/]+)\$([A-Za-z0-9+/]+)$/;

/** A new password's hash as a PHC string: `$argon2id$v=19$m=19456,t=2,p=1$<salt>$<hash>`. */
export function hashPassword(password: string): Promise<string> {
  return oneAtATime(async () => {
    const salt = randomBytes(SALT_BYTES);
    const key = await derive(password, salt, ARGON2);
    return `$argon2id$v=19$m=${String(ARGON2.memory)},t=${String(ARGON2.passes)},p=${String(ARGON2.parallelism)}$${b64(salt)}$${b64(key)}`;
  });
}

/** Whether `password` is the one `hash` was made from (constant time); false for a hash it cannot read. */
export function verifyPassword(hash: string, password: string): Promise<boolean> {
  const parts = PHC.exec(hash);
  if (!parts) return Promise.resolve(false);
  const [, memory, passes, parallelism, salt, expected] = parts;
  return oneAtATime(async () => {
    const want = Buffer.from(expected ?? '', 'base64');
    const key = await derive(password, Buffer.from(salt ?? '', 'base64'), {
      memory: Number(memory),
      passes: Number(passes),
      parallelism: Number(parallelism),
    });
    return key.length === want.length && timingSafeEqual(key, want);
  });
}

/** identity's rate-limit keys in Redis (ARCHITECTURE §6.6, `bq:id:*`). */
export const RATE_LIMIT_PREFIX = 'bq:id:rl:';

/** Takes one sign-in hash from the budget of every IP together; throws 503 when it is spent. */
export type LoginHashBudget = () => Promise<void>;

/**
 * The password hashes sign-ins may cost a minute, every IP together (owner, 2026-11-12, QA
 * DR-004): the gateway's limits are per IP, so many IPs could keep the one-at-a-time hashing busy
 * and the free server's 0.1 CPU with it. Past the budget a sign-in is 503 ("Too many sign-ins right
 * now") until it fills again (GCRA: then one every 60 / perMinute seconds); browsing and signed-in
 * work go on. Redis away: 503 too, like the lock it cannot read then.
 */
export function loginHashBudget({
  redis,
  perMinute,
  prefix = RATE_LIMIT_PREFIX,
}: {
  redis: Redis;
  perMinute: number;
  prefix?: string;
}): LoginHashBudget {
  const limiter = createRateLimiter({ redis, prefix });
  const rule = { limit: perMinute, windowMs: 60_000 };
  return async () => {
    let allowed: boolean;
    try {
      ({ allowed } = await limiter.take('login-hash', rule));
    } catch (error) {
      throw signInUnavailable(error);
    }
    if (!allowed) throw passwordsBusy();
  };
}

/** A hash made with other settings than ARGON2 (stored again at the next right sign-in). */
export const needsRehash = (hash: string): boolean =>
  !hash.startsWith(
    `$argon2id$v=19$m=${String(ARGON2.memory)},t=${String(ARGON2.passes)},p=${String(ARGON2.parallelism)}$`,
  );

// A real hash of a random password: an email without a password is checked against it, so it
// takes as long as one with a password and the time says nothing about the account
let dummy: Promise<string> | undefined;
export const dummyHash = (): Promise<string> =>
  (dummy ??= hashPassword(randomBytes(16).toString('hex')));

/** Whether a password is in a known data breach. */
export type BreachCheck = (password: string) => Promise<boolean>;

/**
 * Have I Been Pwned's Pwned Passwords range API (k-anonymity: only the first 5 hex characters of
 * the SHA-1 leave the server, and the answer is padded). When it does not answer in time, the
 * password is allowed and a warning logged (fail-open, ARCHITECTURE §7.1).
 */
export function hibpBreachCheck({
  url = 'https://api.pwnedpasswords.com',
  timeoutMs = 2_000,
  logger,
}: {
  url?: string;
  timeoutMs?: number;
  logger: Logger;
}): BreachCheck {
  return async (password) => {
    const sha1 = createHash('sha1').update(password).digest('hex').toUpperCase();
    const prefix = sha1.slice(0, 5);
    const suffix = sha1.slice(5);
    try {
      const response = await axios.get<string>(`${url}/range/${prefix}`, {
        headers: { 'Add-Padding': 'true', 'User-Agent': 'Beautinique-identity' },
        signal: AbortSignal.timeout(timeoutMs),
        responseType: 'text',
      });
      for (const line of response.data.split('\n')) {
        const [hashSuffix, count] = line.trim().split(':');
        // padding lines have a count of 0
        if (hashSuffix === suffix && Number(count) > 0) return true;
      }
      return false;
    } catch (error) {
      logger.warn(
        { err: error instanceof Error ? error.message : String(error) },
        'breached-password check unavailable; the password is allowed',
      );
      return false;
    }
  };
}
