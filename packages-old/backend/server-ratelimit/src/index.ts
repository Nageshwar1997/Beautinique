import { createHash } from 'node:crypto';
import { isIPv4, isIPv6 } from 'node:net';

import type { Redis } from 'ioredis';

/** `limit` requests per `windowMs`. All of them may come at once; then one more every windowMs / limit. */
export interface RateLimitRule {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  /** requests still allowed right now */
  remaining: number;
  /** ms until the bucket is full again */
  resetMs: number;
  /** ms to wait before the next request can pass (0 when this one passed) */
  retryAfterMs: number;
}

/** Redis failed or answered too slowly. The caller decides: fail open, or fail closed (auth, OTP). */
export class RateLimitUnavailableError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'RateLimitUnavailableError';
  }
}

export interface RateLimiterOptions {
  /** the deployable's shared Redis client */
  redis: Redis;
  /** key prefix of the deployable (ARCHITECTURE §6.6), e.g. `bq:gw:rl:` */
  prefix: string;
  /** a Redis answer slower than this counts as Redis down (default 500 ms) */
  timeoutMs?: number;
}

export interface RateLimiter {
  /**
   * Takes `cost` (default 1) from the bucket `key` under `rule`. A refused request takes nothing.
   * Throws RateLimitUnavailableError when Redis fails or is slower than `timeoutMs`.
   */
  take(key: string, rule: RateLimitRule, cost?: number): Promise<RateLimitResult>;
  /** Empties the record of `key`, so its bucket is full again (e.g. after a successful login). */
  reset(key: string): Promise<void>;
}

/**
 * GCRA (a token bucket kept as one timestamp per key, ARCHITECTURE §6.6: small and always with a
 * TTL). KEYS[1] holds the "theoretical arrival time" in microseconds, so a fast rule (900 per
 * second) refills at its own rate; Redis' own clock decides, so instances with skewed clocks agree.
 * Microseconds since 1970 stay below 2^53, so the numbers are exact. Returns allowed (0/1),
 * remaining, retry-after ms, reset ms.
 */
const SCRIPT = `
local now_parts = redis.call('TIME')
local now = tonumber(now_parts[1]) * 1000000 + tonumber(now_parts[2])
local interval = tonumber(ARGV[1])
local capacity = tonumber(ARGV[2])
local cost = tonumber(ARGV[3])
local tat = tonumber(redis.call('GET', KEYS[1]) or now)
if tat < now then tat = now end
local new_tat = tat + interval * cost
local allow_at = new_tat - interval * capacity
local function ms(us) return math.ceil(us / 1000) end
if allow_at > now then
  return {0, math.floor((now + interval * capacity - tat) / interval), ms(allow_at - now), ms(tat - now)}
end
redis.call('SET', KEYS[1], new_tat, 'PX', ms(new_tat - now))
return {1, math.floor((now + interval * capacity - new_tat) / interval), 0, ms(new_tat - now)}
`;
const SCRIPT_SHA = createHash('sha1').update(SCRIPT).digest('hex');

const MAX_KEY_LENGTH = 512;

function checkRule({ limit, windowMs }: RateLimitRule): void {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new RangeError(`Rate limit must be a whole number from 1, got ${String(limit)}`);
  }
  if (!Number.isInteger(windowMs) || windowMs < 1) {
    throw new RangeError(
      `Rate limit window must be whole milliseconds from 1, got ${String(windowMs)}`,
    );
  }
}

/** A Redis call that gives up after `ms`. The command itself may still finish later; that is harmless. */
async function within<T>(ms: number, work: Promise<T>): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new RateLimitUnavailableError(`Redis did not answer within ${String(ms)} ms`));
    }, ms);
  });
  try {
    return await Promise.race([work, timeout]);
  } catch (error) {
    if (error instanceof RateLimitUnavailableError) throw error;
    throw new RateLimitUnavailableError('Redis failed', { cause: error });
  } finally {
    clearTimeout(timer);
  }
}

/** Rate limits on the deployable's Redis. Keys are stored as `<prefix><key>`, with a TTL. */
export function createRateLimiter({
  redis,
  prefix,
  timeoutMs = 500,
}: RateLimiterOptions): RateLimiter {
  if (prefix === '') throw new Error('A rate limiter needs a key prefix (ARCHITECTURE §6.6)');
  const fullKey = (key: string) => {
    if (key === '' || key.length > MAX_KEY_LENGTH) {
      throw new RangeError(`A rate limit key must be 1 to ${String(MAX_KEY_LENGTH)} characters`);
    }
    return prefix + key;
  };

  const run = async (key: string, args: number[]): Promise<number[]> => {
    try {
      return (await redis.evalsha(SCRIPT_SHA, 1, key, ...args)) as number[];
    } catch (error) {
      // the first call after a Redis restart (or wipe) finds no cached script
      if (error instanceof Error && error.message.startsWith('NOSCRIPT')) {
        return (await redis.eval(SCRIPT, 1, key, ...args)) as number[];
      }
      throw error;
    }
  };

  return {
    async take(key, rule, cost = 1) {
      checkRule(rule);
      if (!Number.isInteger(cost) || cost < 1 || cost > rule.limit) {
        throw new RangeError(
          `Cost must be a whole number from 1 to the limit (${String(rule.limit)})`,
        );
      }
      const target = fullKey(key);
      // whole microseconds keep the stored time exact; rounding up never lets more through
      const interval = Math.ceil((rule.windowMs * 1000) / rule.limit);
      const [allowed = 0, remaining = 0, retryAfterMs = 0, resetMs = 0] = await within(
        timeoutMs,
        run(target, [interval, rule.limit, cost]),
      );
      return {
        allowed: allowed === 1,
        limit: rule.limit,
        remaining: Math.max(0, remaining),
        resetMs: Math.max(0, resetMs),
        retryAfterMs: Math.max(0, retryAfterMs),
      };
    },
    async reset(key) {
      await within(timeoutMs, redis.del(fullKey(key)));
    },
  };
}

/**
 * The bucket part of a key for a client IP: an IPv4 address as it is, an IPv6 address as its /64
 * network (one home or phone gets a whole /64, and could otherwise step through it). IPv4-mapped
 * IPv6 (`::ffff:1.2.3.4`) counts as the IPv4 address. Anything else throws.
 */
export function ipKey(ip: string): string {
  const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/i.exec(ip)?.[1];
  if (mapped !== undefined && isIPv4(mapped)) return mapped;
  if (isIPv4(ip)) return ip;
  if (!isIPv6(ip)) throw new RangeError('Not an IP address');
  const address = ip.toLowerCase().split('%')[0] ?? '';
  const [head = '', tail = ''] = address.split('::');
  const left = head === '' ? [] : head.split(':');
  const right = tail === '' ? [] : tail.split(':');
  // an embedded IPv4 tail (64:ff9b::1.2.3.4) fills two groups
  const rightGroups = right.reduce((count, group) => count + (group.includes('.') ? 2 : 1), 0);
  const groups = address.includes('::')
    ? [...left, ...Array<string>(8 - left.length - rightGroups).fill('0'), ...right]
    : left;
  return `${groups
    .slice(0, 4)
    .map((group) => Number.parseInt(group, 16).toString(16))
    .join(':')}::/64`;
}
