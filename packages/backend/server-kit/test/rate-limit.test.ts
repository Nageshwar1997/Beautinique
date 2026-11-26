import { createFakeClock } from '@beautinique/shared-clock';
import { describe, expect, it, vi } from 'vitest';

import { AppError } from '../src/errors.ts';
import {
  createMemoryCounter,
  createRateLimiter,
  createValkeyCounter,
  HIT_SCRIPT,
  type RateLimitCounter,
} from '../src/rate-limit.ts';
import { NOW } from './utils/fixtures.ts';

const MINUTE = 60_000;

// What a call throws, or undefined when it does not.
async function thrownBy(call: () => Promise<unknown>): Promise<unknown> {
  try {
    await call();
  } catch (thrown) {
    return thrown;
  }
  return undefined;
}

describe('createMemoryCounter: the small limit of the process (SR-008)', () => {
  it('SR-008: counts the hits of a key in its window, and the window ends by itself', async () => {
    const clock = createFakeClock(NOW);
    const counter = createMemoryCounter(clock);

    expect(await counter.hit('a', MINUTE)).toEqual({ count: 1, resetInMs: MINUTE });
    clock.advance(10_000);
    expect(await counter.hit('a', MINUTE)).toEqual({ count: 2, resetInMs: MINUTE - 10_000 });
    expect(await counter.hit('b', MINUTE)).toEqual({ count: 1, resetInMs: MINUTE });
    clock.advance(MINUTE - 10_000);
    expect(await counter.hit('a', MINUTE)).toEqual({ count: 1, resetInMs: MINUTE });
  });

  it('SR-007, CR-40: holds at most maxKeys keys: the ended windows are swept, then the oldest goes', async () => {
    const clock = createFakeClock(NOW);
    const counter = createMemoryCounter(clock, { maxKeys: 3 });
    for (const key of ['a', 'b', 'c']) await counter.hit(key, MINUTE);

    // Full of windows in force: the oldest (a) is dropped to make room, and starts again at 1.
    await counter.hit('d', MINUTE);
    expect((await counter.hit('a', MINUTE)).count).toBe(1);
    expect((await counter.hit('c', MINUTE)).count).toBe(2);

    // Ended windows are swept (at most once a second) before anything in force is dropped.
    clock.advance(MINUTE + 2000);
    await counter.hit('e', MINUTE);
    await counter.hit('f', MINUTE);
    await counter.hit('g', MINUTE);
    await counter.hit('h', MINUTE);
    expect((await counter.hit('h', MINUTE)).count).toBe(2);
    expect((await counter.hit('g', MINUTE)).count).toBe(2);
  });

  it('SR-007, CR-40: 10^5 different callers do not fill the memory, and each hit is quick', async () => {
    const counter = createMemoryCounter(createFakeClock(NOW), { maxKeys: 1000 });

    for (let caller = 0; caller < 100_000; caller += 1) {
      await counter.hit(`ip:${String(caller)}`, MINUTE);
    }
    expect((await counter.hit('ip:99999', MINUTE)).count).toBe(2);
    expect((await counter.hit('ip:0', MINUTE)).count).toBe(1);
  });
});

describe('createValkeyCounter', () => {
  it('SR-008: runs one script on one key (with the prefix) and the window, and reads { count, time left }', async () => {
    const send = vi.fn().mockResolvedValue([3, 41_000]);
    const counter = createValkeyCounter({ eval: send });

    expect(await counter.hit('sign-in:ip:1.2.3.4', 600_000)).toEqual({
      count: 3,
      resetInMs: 41_000,
    });
    expect(send).toHaveBeenCalledWith(HIT_SCRIPT, 1, 'rl:sign-in:ip:1.2.3.4', 600_000);
    await createValkeyCounter({ eval: send }, { prefix: 'bq:' }).hit('x', 1000);
    expect(send).toHaveBeenLastCalledWith(HIT_SCRIPT, 1, 'bq:x', 1000);
  });

  it('SR-008: an answer that is not { count, time left } is a failure of the counter, not a count', async () => {
    for (const reply of [undefined, 'OK', [1], ['1', 2], [1, null], {}]) {
      const counter = createValkeyCounter({ eval: () => Promise.resolve(reply) });
      await expect(counter.hit('x', 1000), JSON.stringify(reply)).rejects.toThrow(TypeError);
    }
  });

  it('SR-008: a failure of the client is the counter being out of reach', async () => {
    const counter = createValkeyCounter({ eval: () => Promise.reject(new Error('ECONNREFUSED')) });

    await expect(counter.hit('x', 1000)).rejects.toThrow('ECONNREFUSED');
  });
});

describe('createRateLimiter (SR-008)', () => {
  const limit = { limit: 3, windowMs: 10 * MINUTE };
  const fallback = { limit: 2, windowMs: MINUTE };
  const down: RateLimitCounter = { hit: () => Promise.reject(new Error('Valkey is out of reach')) };

  function make(counter: RateLimitCounter = createMemoryCounter(createFakeClock(NOW))) {
    const clock = createFakeClock(NOW);
    return createRateLimiter({ counter, local: createMemoryCounter(clock), fallback });
  }

  it('SR-008: lets through up to the limit, says how many are left, and then 429 with the time to wait', async () => {
    const limiter = make();

    expect(await limiter.check('read', 'ip:1', limit)).toEqual({ ok: true, remaining: 2 });
    expect(await limiter.check('read', 'ip:1', limit)).toEqual({ ok: true, remaining: 1 });
    expect(await limiter.check('read', 'ip:1', limit)).toEqual({ ok: true, remaining: 0 });
    expect(await limiter.check('read', 'ip:1', limit)).toEqual({
      ok: false,
      reason: 'limited',
      retryAfterSeconds: 600,
    });
    // Another caller, and another class of the same caller, count apart.
    expect(await limiter.check('read', 'ip:2', limit)).toEqual({ ok: true, remaining: 2 });
    expect(await limiter.check('write', 'ip:1', limit)).toEqual({ ok: true, remaining: 2 });
  });

  it('SR-008: a wait is told in whole seconds, from 1', async () => {
    const counter: RateLimitCounter = { hit: () => Promise.resolve({ count: 99, resetInMs: 300 }) };

    expect(await make(counter).check('read', 'ip:1', limit)).toEqual({
      ok: false,
      reason: 'limited',
      retryAfterSeconds: 1,
    });
    const slow: RateLimitCounter = { hit: () => Promise.resolve({ count: 99, resetInMs: 1500 }) };
    expect(await make(slow).check('read', 'ip:1', limit)).toMatchObject({ retryAfterSeconds: 2 });
  });

  it('SR-008: with the counter out of reach, sign-in, codes, payment, review, report and claim are 503', async () => {
    const limiter = make(down);

    for (const rateClass of [
      'sign-in',
      'code',
      'payment-start',
      'review',
      'report',
      'claim',
    ] as const) {
      expect(await limiter.check(rateClass, 'ip:1', limit), rateClass).toEqual({
        ok: false,
        reason: 'unavailable',
        retryAfterSeconds: 5,
      });
    }
  });

  it('SR-008: with the counter out of reach, the others go on with the small limit of the process', async () => {
    const limiter = make(down);

    expect(await limiter.check('read', 'ip:1', limit)).toEqual({ ok: true, remaining: 1 });
    expect(await limiter.check('read', 'ip:1', limit)).toEqual({ ok: true, remaining: 0 });
    expect(await limiter.check('read', 'ip:1', limit)).toMatchObject({
      ok: false,
      reason: 'limited',
    });
    expect(await limiter.check('search-public', 'ip:9', limit)).toEqual({ ok: true, remaining: 1 });
  });

  it('SR-008: the wait of a fail-closed outage can be set', async () => {
    const limiter = createRateLimiter({
      counter: down,
      local: createMemoryCounter(createFakeClock(NOW)),
      fallback,
      outageRetryAfterSeconds: 30,
    });

    expect(await limiter.check('sign-in', 'ip:1', limit)).toMatchObject({ retryAfterSeconds: 30 });
  });

  it('SR-008: enforce throws the answer: 429 RATE_LIMITED or 503 SERVICE_UNAVAILABLE, both with Retry-After', async () => {
    const limited = make();
    await limited.enforce('read', 'ip:1', { limit: 1, windowMs: MINUTE });
    const tooMany = await thrownBy(() =>
      limited.enforce('read', 'ip:1', { limit: 1, windowMs: MINUTE }),
    );

    expect(tooMany).toBeInstanceOf(AppError);
    expect(tooMany).toMatchObject({ status: 429, code: 'RATE_LIMITED', retryAfterSeconds: 60 });
    const unavailable = await thrownBy(() => make(down).enforce('sign-in', 'ip:1', limit));
    expect(unavailable).toMatchObject({
      status: 503,
      code: 'SERVICE_UNAVAILABLE',
      retryAfterSeconds: 5,
    });
    await expect(make().enforce('read', 'ip:5', limit)).resolves.toBeUndefined();
  });
});
