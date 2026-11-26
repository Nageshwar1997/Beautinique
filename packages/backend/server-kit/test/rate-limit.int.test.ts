import { randomUUID } from 'node:crypto';

import { createFakeClock } from '@beautinique/shared-clock';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createMemoryCounter, createRateLimiter, createValkeyCounter } from '../src/rate-limit.ts';
import { NOW } from './utils/fixtures.ts';
import { connectResp, reachable, type RespClient } from './utils/resp.ts';

// The script of the counter against the real Valkey (docs/OPERATIONS.md §1 rule 6): `npm run
// infra:up -- backend`. The tests of the CI have it up. On a laptop with no container up they are
// skipped, and say so; in the CI a Valkey that does not answer is a failure, not a skip.
const PORT = Number(process.env['BQ_VALKEY_PORT'] ?? 6379);
const up = await reachable(PORT);
if (!up && process.env['CI'] === undefined) {
  console.warn(
    `Valkey does not answer on port ${String(PORT)}: rate-limit.int.test.ts is skipped.`,
  );
}

// Keys of their own, so a laptop's Valkey with other things in it is left as it was.
const prefix = `bq-test:server-kit:${randomUUID()}:`;
const MINUTE = 60_000;

describe.skipIf(!up && process.env['CI'] === undefined)('the counter on Valkey (SR-008)', () => {
  let client: RespClient;
  const keys = new Set<string>();
  const counter = () => createValkeyCounter(client, { prefix });
  const key = (name: string) => {
    keys.add(`${prefix}${name}`);
    return name;
  };

  beforeAll(async () => {
    client = await connectResp(PORT);
    expect(await client.command('PING')).toBe('PONG');
  });

  afterAll(async () => {
    if (keys.size > 0) await client.command('DEL', ...keys);
    client.close();
  });

  it('SR-008: counts the hits of a key, and the time left is inside the window', async () => {
    const name = key('count');

    const first = await counter().hit(name, MINUTE);
    const second = await counter().hit(name, MINUTE);
    const third = await counter().hit(name, MINUTE);

    expect([first.count, second.count, third.count]).toEqual([1, 2, 3]);
    for (const reading of [first, second, third]) {
      expect(reading.resetInMs).toBeGreaterThan(0);
      expect(reading.resetInMs).toBeLessThanOrEqual(MINUTE);
    }
    // The key has its time, as the script gave it.
    const ttl = Number(await client.command('PTTL', `${prefix}${name}`));
    expect(ttl).toBeGreaterThan(0);
    expect(ttl).toBeLessThanOrEqual(MINUTE);
  });

  it('SR-008: the window ends by itself, and the count begins again', async () => {
    const name = key('window');

    expect((await counter().hit(name, 300)).count).toBe(1);
    expect((await counter().hit(name, 300)).count).toBe(2);
    await new Promise((resolve) => setTimeout(resolve, 450));

    expect((await counter().hit(name, 300)).count).toBe(1);
  });

  it('SR-008: a key that has lost its time (it should not) gets it again, so nobody is turned away for ever', async () => {
    const name = key('no-ttl');
    await client.command('SET', `${prefix}${name}`, 5);
    expect(Number(await client.command('PTTL', `${prefix}${name}`))).toBe(-1);

    const reading = await counter().hit(name, MINUTE);

    expect(reading.count).toBe(6);
    expect(reading.resetInMs).toBe(MINUTE);
    expect(Number(await client.command('PTTL', `${prefix}${name}`))).toBeGreaterThan(0);
  });

  it('SR-008: different keys count apart, and 50 hits at once from 5 connections are 1 to 50, each once', async () => {
    const name = key('parallel');
    const other = key('other');
    const clients = await Promise.all(Array.from({ length: 5 }, () => connectResp(PORT)));
    try {
      const runs = clients.map(async (connection) => {
        const mine = createValkeyCounter(connection, { prefix });
        const counts: number[] = [];
        for (let hit = 0; hit < 10; hit += 1) counts.push((await mine.hit(name, MINUTE)).count);
        return counts;
      });
      const counts = (await Promise.all(runs)).flat().sort((a, b) => a - b);

      expect(counts).toEqual(Array.from({ length: 50 }, (_, index) => index + 1));
      expect((await counter().hit(other, MINUTE)).count).toBe(1);
    } finally {
      for (const connection of clients) connection.close();
    }
  });

  it('SR-008: the limiter lets through up to the limit and then says 429 with a time inside the window', async () => {
    const limiter = createRateLimiter({
      counter: counter(),
      local: createMemoryCounter(createFakeClock(NOW)),
      fallback: { limit: 1, windowMs: MINUTE },
    });
    const name = key('read:ip:203.0.113.7');
    const limit = { limit: 3, windowMs: 10 * MINUTE };

    for (let hit = 0; hit < 3; hit += 1) {
      expect((await limiter.check('read', 'ip:203.0.113.7', limit)).ok).toBe(true);
    }
    const refused = await limiter.check('read', 'ip:203.0.113.7', limit);

    expect(refused).toMatchObject({ ok: false, reason: 'limited' });
    if (!refused.ok) {
      expect(refused.retryAfterSeconds).toBeGreaterThan(0);
      expect(refused.retryAfterSeconds).toBeLessThanOrEqual(600);
    }
    expect(Number(await client.command('GET', `${prefix}${name}`))).toBe(4);
  });

  it('SR-008: with the connection to Valkey gone, sign-in is 503 and a read goes on with the small limit', async () => {
    const lost = await connectResp(PORT);
    lost.close();
    const limiter = createRateLimiter({
      counter: createValkeyCounter(lost, { prefix }),
      local: createMemoryCounter(createFakeClock(NOW)),
      fallback: { limit: 1, windowMs: MINUTE },
    });
    const limit = { limit: 100, windowMs: MINUTE };

    expect(await limiter.check('sign-in', 'ip:1', limit)).toMatchObject({
      ok: false,
      reason: 'unavailable',
    });
    expect(await limiter.check('read', 'ip:1', limit)).toEqual({ ok: true, remaining: 0 });
    expect(await limiter.check('read', 'ip:1', limit)).toMatchObject({
      ok: false,
      reason: 'limited',
    });
  });
});
