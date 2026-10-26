import { randomUUID } from 'node:crypto';
import { type AddressInfo, createServer, type Server, type Socket } from 'node:net';

import { Redis } from 'ioredis';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  createRateLimiter,
  ipKey,
  type RateLimiter,
  RateLimitUnavailableError,
} from '../src/index';

// The laptop's and CI's local Valkey (`npm run infra:up`); every key of this run has its own prefix.
const REDIS_URL = process.env.REDIS_TEST_URL ?? 'redis://localhost:6379';
const prefix = `bq:test:rl:${randomUUID().slice(0, 8)}:`;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let redis: Redis;
let limiter: RateLimiter;

beforeAll(async () => {
  redis = new Redis(REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1 });
  try {
    await redis.connect();
  } catch (error) {
    throw new Error('These tests need Valkey: run `npm run infra:up` (or set REDIS_TEST_URL).', {
      cause: error,
    });
  }
  limiter = createRateLimiter({ redis, prefix });
});

afterAll(async () => {
  const keys = await redis.keys(`${prefix}*`);
  if (keys.length > 0) await redis.del(...keys);
  await redis.quit();
});

const key = () => randomUUID();

describe('rate limiter', () => {
  it('lets a full bucket through at once, then refuses with the wait', async () => {
    const bucket = key();
    const rule = { limit: 3, windowMs: 60_000 };
    const results = [];
    for (let i = 0; i < 4; i += 1) results.push(await limiter.take(bucket, rule));
    expect(results.map((r) => [r.allowed, r.remaining])).toEqual([
      [true, 2],
      [true, 1],
      [true, 0],
      [false, 0],
    ]);
    const refused = results[3];
    expect(refused?.limit).toBe(3);
    // one request comes back every 20 s; the bucket is full again after 60 s
    expect(refused?.retryAfterMs).toBeGreaterThan(19_000);
    expect(refused?.retryAfterMs).toBeLessThanOrEqual(20_000);
    expect(refused?.resetMs).toBeGreaterThan(59_000);
    expect(refused?.resetMs).toBeLessThanOrEqual(60_000);
    expect(results[0]?.retryAfterMs).toBe(0);
    expect(results[0]?.resetMs).toBeLessThanOrEqual(20_000);
  });

  it('fills up again over time, and a refused request takes nothing', async () => {
    const bucket = key();
    const rule = { limit: 2, windowMs: 400 };
    expect((await limiter.take(bucket, rule)).allowed).toBe(true);
    expect((await limiter.take(bucket, rule)).allowed).toBe(true);
    expect((await limiter.take(bucket, rule)).allowed).toBe(false);
    expect((await limiter.take(bucket, rule)).allowed).toBe(false);
    await sleep(230);
    // one interval (200 ms) passed: exactly one more, however often the refused ones asked
    expect((await limiter.take(bucket, rule)).allowed).toBe(true);
    expect((await limiter.take(bucket, rule)).allowed).toBe(false);
  });

  it('fills up again: a record from the past counts as a full bucket, never more', async () => {
    // e.g. a clock step after a Redis failover: the stored time lies behind Redis' clock
    const bucket = key();
    await redis.set(prefix + bucket, String((Date.now() - 600_000) * 1000));
    expect(await limiter.take(bucket, { limit: 3, windowMs: 60_000 })).toMatchObject({
      allowed: true,
      remaining: 2,
    });
  });

  it('keeps one small key per bucket, with a TTL until it is full again', async () => {
    const bucket = key();
    await limiter.take(bucket, { limit: 5, windowMs: 1000 });
    const ttl = await redis.pttl(prefix + bucket);
    expect(ttl).toBeGreaterThan(0);
    expect(ttl).toBeLessThanOrEqual(200);
    await sleep(260);
    expect(await redis.exists(prefix + bucket)).toBe(0);
  });

  it('takes a cost of several requests', async () => {
    const bucket = key();
    const rule = { limit: 5, windowMs: 60_000 };
    expect(await limiter.take(bucket, rule, 4)).toMatchObject({ allowed: true, remaining: 1 });
    expect(await limiter.take(bucket, rule, 2)).toMatchObject({ allowed: false, remaining: 1 });
    expect(await limiter.take(bucket, rule, 1)).toMatchObject({ allowed: true, remaining: 0 });
  });

  it('keeps buckets apart, and reset fills one again', async () => {
    const [a, b] = [key(), key()];
    const rule = { limit: 1, windowMs: 60_000 };
    expect((await limiter.take(a, rule)).allowed).toBe(true);
    expect((await limiter.take(a, rule)).allowed).toBe(false);
    expect((await limiter.take(b, rule)).allowed).toBe(true);
    await limiter.reset(a);
    expect((await limiter.take(a, rule)).allowed).toBe(true);
  });

  it('counts parallel requests exactly (one atomic script per request)', async () => {
    const bucket = key();
    const rule = { limit: 10, windowMs: 60_000 };
    const results = await Promise.all(Array.from({ length: 25 }, () => limiter.take(bucket, rule)));
    expect(results.filter((r) => r.allowed)).toHaveLength(10);
  });

  it('loads its script again after Redis forgot it', async () => {
    await redis.script('FLUSH');
    expect((await limiter.take(key(), { limit: 1, windowMs: 1000 })).allowed).toBe(true);
  });

  it('refills a fast rule at its own rate, below a millisecond per request', async () => {
    // 3000 per second: one more every 333 µs. In whole milliseconds it would be 1000 per second.
    const bucket = key();
    const rule = { limit: 3000, windowMs: 1000 };
    expect(await limiter.take(bucket, rule, 3000)).toMatchObject({ allowed: true, remaining: 0 });
    await sleep(110);
    expect((await limiter.take(bucket, rule, 250)).allowed).toBe(true);
  });

  it('stores the time as a plain whole number of microseconds', async () => {
    const bucket = key();
    await limiter.take(bucket, { limit: 7, windowMs: 60_000 });
    const stored = await redis.get(prefix + bucket);
    expect(stored).toMatch(/^\d{16,}$/);
    // microseconds, close to now
    expect(Math.abs(Number(stored) / 1000 - Date.now())).toBeLessThan(60_000);
  });

  it('refuses wrong rules, costs, keys and an empty prefix', async () => {
    const bucket = key();
    for (const rule of [
      { limit: 0, windowMs: 1000 },
      { limit: 1.5, windowMs: 1000 },
      { limit: 1, windowMs: 0 },
      { limit: 1, windowMs: 2.5 },
    ]) {
      await expect(limiter.take(bucket, rule), JSON.stringify(rule)).rejects.toThrow(RangeError);
    }
    const rule = { limit: 3, windowMs: 1000 };
    for (const cost of [0, 4, 1.5]) {
      await expect(limiter.take(bucket, rule, cost), String(cost)).rejects.toThrow(
        'Cost must be a whole number from 1 to the limit (3)',
      );
    }
    await expect(limiter.take('', rule)).rejects.toThrow('1 to 512 characters');
    await expect(limiter.take('x'.repeat(513), rule)).rejects.toThrow('1 to 512 characters');
    expect((await limiter.take('x'.repeat(512), rule)).allowed).toBe(true);
    expect(() => createRateLimiter({ redis, prefix: '' })).toThrow('needs a key prefix');
  });
});

describe('when Redis is down or slow', () => {
  const sockets = new Set<Socket>();
  let silent: Server;

  beforeAll(async () => {
    // accepts connections and never answers: a hung Redis
    silent = createServer((socket) => {
      sockets.add(socket);
    });
    await new Promise<void>((resolve) => silent.listen(0, '127.0.0.1', resolve));
  });

  afterAll(async () => {
    for (const socket of sockets) socket.destroy();
    await new Promise((resolve) => silent.close(resolve));
  });

  it('throws RateLimitUnavailableError after the timeout instead of holding the request', async () => {
    const { port } = silent.address() as AddressInfo;
    const hung = new Redis({ port, host: '127.0.0.1', lazyConnect: true, maxRetriesPerRequest: 1 });
    hung.on('error', () => undefined);
    try {
      const slow = createRateLimiter({ redis: hung, prefix, timeoutMs: 150 });
      const started = Date.now();
      await expect(slow.take(key(), { limit: 1, windowMs: 1000 })).rejects.toThrow(
        'Redis did not answer within 150 ms',
      );
      expect(Date.now() - started).toBeLessThan(1000);
      await expect(slow.reset(key())).rejects.toBeInstanceOf(RateLimitUnavailableError);
    } finally {
      hung.disconnect();
    }
  });

  it('throws RateLimitUnavailableError when Redis refuses', async () => {
    const closed = createServer();
    await new Promise<void>((resolve) => closed.listen(0, '127.0.0.1', resolve));
    const { port } = closed.address() as AddressInfo;
    await new Promise((resolve) => closed.close(resolve));
    const down = new Redis({
      port,
      host: '127.0.0.1',
      lazyConnect: true,
      maxRetriesPerRequest: 0,
      retryStrategy: () => null,
    });
    down.on('error', () => undefined);
    try {
      const error: unknown = await createRateLimiter({ redis: down, prefix })
        .take(key(), { limit: 1, windowMs: 1000 })
        .catch((caught: unknown) => caught);
      expect(error).toBeInstanceOf(RateLimitUnavailableError);
      expect((error as Error).message).toBe('Redis failed');
    } finally {
      down.disconnect();
    }
  });
});

describe('ipKey', () => {
  it('keeps IPv4 as it is and takes the /64 network of IPv6', () => {
    const cases: [string, string][] = [
      ['203.0.113.7', '203.0.113.7'],
      ['::ffff:203.0.113.7', '203.0.113.7'],
      ['::FFFF:203.0.113.7', '203.0.113.7'],
      ['2401:4900:1c2a:7f00:a1b2:c3d4:e5f6:0789', '2401:4900:1c2a:7f00::/64'],
      ['2401:4900:1c2a:7f00:ffff::1', '2401:4900:1c2a:7f00::/64'],
      ['2401:4900:1C2A:07F0::', '2401:4900:1c2a:7f0::/64'],
      ['2401:db8::1', '2401:db8:0:0::/64'],
      ['::1', '0:0:0:0::/64'],
      ['::', '0:0:0:0::/64'],
      ['fe80::1%eth0', 'fe80:0:0:0::/64'],
      ['1::2:3:4:5:1.2.3.4', '1:0:2:3::/64'],
      ['64:ff9b::1.2.3.4', '64:ff9b:0:0::/64'],
    ];
    for (const [ip, expected] of cases) expect(ipKey(ip), ip).toBe(expected);
    // two addresses of one home network share one bucket
    expect(ipKey('2401:4900:1c2a:7f00::a')).toBe(ipKey('2401:4900:1c2a:7f00::b'));
  });

  it('refuses what is not an IP address', () => {
    for (const bad of ['', 'localhost', '999.1.1.1', '1.2.3', '2401:::1', 'unknown']) {
      expect(() => ipKey(bad), bad).toThrow('Not an IP address');
    }
  });
});
