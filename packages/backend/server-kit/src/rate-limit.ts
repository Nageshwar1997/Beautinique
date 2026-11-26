import type { Clock } from '@beautinique/shared-clock';
import { RATE_LIMIT_CLASSES, type RateLimitClass } from '@beautinique/shared-contracts';

import { rateLimited, serviceUnavailable } from './errors.ts';

/** How many times in how long, for one class of route (the numbers are settings of the gateway, SR-008). */
export interface RateLimit {
  limit: number;
  windowMs: number;
}

/** How many hits a key has had in its window, and how long until the window ends. */
export interface CounterReading {
  count: number;
  resetInMs: number;
}

/** Counts hits in windows. The live one is Valkey's; the memory one is the process's own small limit. */
export interface RateLimitCounter {
  /** Counts one hit for `key` in a window of `windowMs`, and says how it stands. Throws when it cannot be reached. */
  hit(key: string, windowMs: number): Promise<CounterReading>;
}

/** What `createValkeyCounter` needs of a Valkey client: `eval`, as `ioredis` has it. */
export interface ScriptClient {
  eval(script: string, numberOfKeys: number, ...args: (string | number)[]): Promise<unknown>;
}

// One step, so the count and the time of the window are never half done: the first hit makes the
// key and its time; a key that has lost its time (it should not) gets it again, so that nobody is
// turned away for ever. Gives { count, milliseconds left }.
export const HIT_SCRIPT = `
local count = redis.call('INCR', KEYS[1])
local ttl = redis.call('PTTL', KEYS[1])
if count == 1 or ttl < 0 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
  ttl = tonumber(ARGV[1])
end
return { count, ttl }
`;

/**
 * The counter on Valkey (docs/ARCHITECTURE.md §6 rule 11: the counts of the rate limit live there,
 * and nothing else is kept as a cache). A window is a fixed one: it begins at the first hit and
 * ends after `windowMs`, so a caller who hits at the end of one and the start of the next can have
 * up to twice the limit in a short time.
 */
export function createValkeyCounter(
  client: ScriptClient,
  options: { prefix?: string } = {},
): RateLimitCounter {
  const prefix = options.prefix ?? 'rl:';
  return {
    async hit(key, windowMs) {
      const reply = await client.eval(HIT_SCRIPT, 1, `${prefix}${key}`, windowMs);
      if (!Array.isArray(reply) || typeof reply[0] !== 'number' || typeof reply[1] !== 'number') {
        throw new TypeError('The rate limit counter answered with something unexpected.');
      }
      return { count: reply[0], resetInMs: reply[1] };
    },
  };
}

interface Window {
  count: number;
  endsAt: number;
}

/**
 * The counter in the memory of the process: the small limit that it keeps when Valkey is out of
 * reach (SR-008), and the one for tests. It holds at most `maxKeys` keys (a caller that changes
 * its address at every request cannot fill the memory): ended windows are swept at most once a
 * second, and when it is still full the oldest key is dropped.
 */
export function createMemoryCounter(
  clock: Clock,
  options: { maxKeys?: number } = {},
): RateLimitCounter {
  const maxKeys = options.maxKeys ?? 10_000;
  const windows = new Map<string, Window>();
  let sweptAt = 0;

  function sweep(now: number): void {
    sweptAt = now;
    for (const [key, window] of windows) {
      if (window.endsAt <= now) windows.delete(key);
    }
  }

  return {
    hit(key, windowMs) {
      const now = clock.now().getTime();
      let window = windows.get(key);
      if (window === undefined || window.endsAt <= now) {
        // Out and in again, so that the order of the map is the order of the windows' beginning.
        windows.delete(key);
        if (windows.size >= maxKeys) {
          if (now - sweptAt >= 1000) sweep(now);
          if (windows.size >= maxKeys) {
            const oldest = windows.keys().next();
            if (oldest.done !== true) windows.delete(oldest.value);
          }
        }
        window = { count: 0, endsAt: now + windowMs };
        windows.set(key, window);
      }
      window.count += 1;
      return Promise.resolve({ count: window.count, resetInMs: window.endsAt - now });
    },
  };
}

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; reason: 'limited' | 'unavailable'; retryAfterSeconds: number };

export interface RateLimiter {
  check(rateClass: RateLimitClass, subject: string, limit: RateLimit): Promise<RateLimitResult>;
  /** `check`, and throws the answer that the caller gets: 429 (`RATE_LIMITED`) or 503 (`SERVICE_UNAVAILABLE`), both with `Retry-After`. */
  enforce(rateClass: RateLimitClass, subject: string, limit: RateLimit): Promise<void>;
}

export interface RateLimiterOptions {
  /** The shared counter (Valkey). */
  counter: RateLimitCounter;
  /** The process's own counter, for a class that is not fail-closed when `counter` cannot be reached. */
  local: RateLimitCounter;
  /** The small limit of the process, in place of the class's limit while `counter` cannot be reached. */
  fallback: RateLimit;
  /** What a caller is told to wait when the counter cannot be reached and the class is fail-closed. */
  outageRetryAfterSeconds?: number;
}

const toSeconds = (ms: number): number => Math.max(1, Math.ceil(ms / 1000));

/**
 * The rate limit of a route class (SR-008). The shared counter decides. When it cannot be reached,
 * a class that is fail-closed (sign-in, codes, starting a payment, review, report, claim) is turned
 * away with 503, and the others go on with the process's own small limit, so that reading the shop
 * does not stop with Valkey. Which classes are fail-closed is in the contracts
 * (`RATE_LIMIT_CLASSES`); the limits of each class, and whether the key is an address or an account,
 * are the gateway's.
 */
export function createRateLimiter(options: RateLimiterOptions): RateLimiter {
  const outageRetryAfter = options.outageRetryAfterSeconds ?? 5;

  async function check(
    rateClass: RateLimitClass,
    subject: string,
    limit: RateLimit,
  ): Promise<RateLimitResult> {
    const key = `${rateClass}:${subject}`;
    let reading: CounterReading;
    let allowed = limit.limit;
    try {
      reading = await options.counter.hit(key, limit.windowMs);
    } catch {
      if (RATE_LIMIT_CLASSES[rateClass].failClosed) {
        return { ok: false, reason: 'unavailable', retryAfterSeconds: outageRetryAfter };
      }
      reading = await options.local.hit(key, options.fallback.windowMs);
      allowed = options.fallback.limit;
    }
    if (reading.count > allowed) {
      return { ok: false, reason: 'limited', retryAfterSeconds: toSeconds(reading.resetInMs) };
    }
    return { ok: true, remaining: allowed - reading.count };
  }

  return {
    check,
    async enforce(rateClass, subject, limit) {
      const result = await check(rateClass, subject, limit);
      if (result.ok) return;
      throw result.reason === 'limited'
        ? rateLimited(result.retryAfterSeconds)
        : serviceUnavailable(result.retryAfterSeconds);
    },
  };
}
