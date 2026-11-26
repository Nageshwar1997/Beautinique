import { assert, constantFrom, dictionary, jsonValue, property, string as text } from 'fast-check';
import { describe, expect, it } from 'vitest';

import {
  createMemoryIdempotencyStore,
  fingerprintOf,
  IDEMPOTENCY_LEASE_MS,
  IDEMPOTENCY_TTL_MS,
  type IdempotencyClaim,
  type IdempotencyId,
} from '../src/idempotency.ts';
import { NOW } from './utils/fixtures.ts';

const id: IdempotencyId = { caller: 'acc-1', routeId: 'commerce.order.place', key: 'key-0001' };
const at = (ms: number) => new Date(NOW.getTime() + ms);
const answer = { status: 201, body: { orderId: 'o1' } };
// The claim of a request with this fingerprint that begins `ms` after NOW.
const claimAt = (fingerprint: string, ms = 0): IdempotencyClaim => ({
  fingerprint,
  leaseUntil: at(ms + IDEMPOTENCY_LEASE_MS),
});

describe('the idempotency store in memory (AC-PLATFORM-8, SR-045)', () => {
  it('AC-PLATFORM-8: the first request starts, and the same key and body while it runs is in progress', async () => {
    const store = createMemoryIdempotencyStore();

    expect(await store.begin(id, claimAt('f1'), NOW)).toEqual({ kind: 'started' });
    expect(await store.begin(id, claimAt('f1', 1), at(1))).toEqual({ kind: 'in-progress' });
  });

  it('AC-PLATFORM-8: the same key and body after it ended is its answer; another body is a key that was reused', async () => {
    const store = createMemoryIdempotencyStore();
    const first = claimAt('f1');
    await store.begin(id, first, NOW);
    await store.complete(id, first, answer, at(IDEMPOTENCY_TTL_MS));

    expect(await store.begin(id, claimAt('f1', 1000), at(1000))).toEqual({
      kind: 'replay',
      response: answer,
    });
    expect(await store.begin(id, claimAt('f2', 1000), at(1000))).toEqual({ kind: 'key-reused' });
    // Also while it is still running: another body with the key is not the same request.
    const other = { ...id, key: 'key-0002' };
    await store.begin(other, claimAt('f1'), NOW);
    expect(await store.begin(other, claimAt('f2', 1), at(1))).toEqual({ kind: 'key-reused' });
  });

  it('SR-045: the key is of the caller and of the route: the same key of another is another request', async () => {
    const store = createMemoryIdempotencyStore();
    const first = claimAt('f1');
    await store.begin(id, first, NOW);
    await store.complete(id, first, answer, at(IDEMPOTENCY_TTL_MS));

    const otherCaller = { ...id, caller: 'acc-2' };
    const otherRoute = { ...id, routeId: 'commerce.order.close' };
    expect(await store.begin(otherCaller, claimAt('f1', 1), at(1))).toEqual({ kind: 'started' });
    expect(await store.begin(otherRoute, claimAt('f1', 1), at(1))).toEqual({ kind: 'started' });
    // A caller or a route with a `|` or a quote in it cannot be made to look like another.
    const tricky = { caller: 'a","b', routeId: 'c', key: 'k' };
    const other = { caller: 'a', routeId: 'b","c', key: 'k' };
    await store.begin(tricky, claimAt('f1'), NOW);
    expect(await store.begin(other, claimAt('f1'), NOW)).toEqual({ kind: 'started' });
  });

  it('AC-PLATFORM-8: a record is kept about 48 hours, and then the key is free', async () => {
    const store = createMemoryIdempotencyStore();
    const first = claimAt('f1');
    await store.begin(id, first, NOW);
    await store.complete(id, first, answer, at(IDEMPOTENCY_TTL_MS));

    const before = IDEMPOTENCY_TTL_MS - 1;
    expect((await store.begin(id, claimAt('f1', before), at(before))).kind).toBe('replay');
    const after = IDEMPOTENCY_TTL_MS;
    expect((await store.begin(id, claimAt('f2', after), at(after))).kind).toBe('started');
  });

  it('SR-007: a request that began and never ended frees its key when the lease is out', async () => {
    const store = createMemoryIdempotencyStore();
    await store.begin(id, claimAt('f1'), NOW);

    const before = IDEMPOTENCY_LEASE_MS - 1;
    expect((await store.begin(id, claimAt('f1', before), at(before))).kind).toBe('in-progress');
    const after = IDEMPOTENCY_LEASE_MS;
    expect((await store.begin(id, claimAt('f1', after), at(after))).kind).toBe('started');
  });

  it('AC-PLATFORM-8: a request that ended in a 5xx is forgotten, so the same key can try again', async () => {
    const store = createMemoryIdempotencyStore();
    const first = claimAt('f1');
    await store.begin(id, first, NOW);
    await store.release(id, first);

    expect((await store.begin(id, claimAt('f2', 1), at(1))).kind).toBe('started');
  });

  it('SR-045: a request whose lease ran out leaves the record of the request that took its key as it is', async () => {
    const store = createMemoryIdempotencyStore();
    const late = claimAt('f1');
    await store.begin(id, late, NOW);
    // Its lease runs out, and the same request (the same body) is sent again and starts.
    const retry = claimAt('f1', IDEMPOTENCY_LEASE_MS);
    expect((await store.begin(id, retry, at(IDEMPOTENCY_LEASE_MS))).kind).toBe('started');

    // The late one ends in a 5xx: the retry's record is not forgotten, so a third does not start.
    await store.release(id, late);
    const third = IDEMPOTENCY_LEASE_MS + 1;
    expect((await store.begin(id, claimAt('f1', third), at(third))).kind).toBe('in-progress');
    // Nor is its answer kept in the retry's place.
    await store.complete(id, late, { status: 200, body: { late: true } }, at(IDEMPOTENCY_TTL_MS));
    expect((await store.begin(id, claimAt('f1', third), at(third))).kind).toBe('in-progress');

    // The retry's own end is kept; after that its claim changes nothing more.
    await store.complete(id, retry, answer, at(IDEMPOTENCY_TTL_MS));
    await store.release(id, retry);
    await store.complete(id, retry, { status: 200, body: {} }, at(IDEMPOTENCY_TTL_MS));
    expect(await store.begin(id, claimAt('f1', third), at(third))).toEqual({
      kind: 'replay',
      response: answer,
    });
  });

  it('SR-045: ending or releasing a key that is not there changes nothing', async () => {
    const store = createMemoryIdempotencyStore();
    const first = claimAt('f1');

    await expect(
      store.complete(id, first, answer, at(IDEMPOTENCY_TTL_MS)),
    ).resolves.toBeUndefined();
    await expect(store.release(id, first)).resolves.toBeUndefined();
    expect((await store.begin(id, first, NOW)).kind).toBe('started');
  });
});

describe('fingerprintOf: the same request has the same fingerprint', () => {
  const request = { params: { orderId: 'o1' }, query: { limit: 20 }, body: { a: 1, b: [1, 2] } };

  it('AC-PLATFORM-8: the order of the fields does not matter, the values do', () => {
    const reordered = {
      body: { b: [1, 2], a: 1 },
      query: { limit: 20 },
      params: { orderId: 'o1' },
    };

    expect(fingerprintOf(reordered)).toBe(fingerprintOf(request));
    expect(fingerprintOf({ ...request, body: { a: 2, b: [1, 2] } })).not.toBe(
      fingerprintOf(request),
    );
    expect(fingerprintOf({ ...request, body: { a: 1, b: [2, 1] } })).not.toBe(
      fingerprintOf(request),
    );
    expect(fingerprintOf({ ...request, params: { orderId: 'o2' } })).not.toBe(
      fingerprintOf(request),
    );
  });

  it('AC-PLATFORM-8: a part that is not there, undefined or a field left out is the same; a date is its ISO', () => {
    expect(fingerprintOf({ params: undefined, query: undefined, body: undefined })).toBe(
      fingerprintOf({ params: undefined, query: undefined, body: undefined }),
    );
    expect(fingerprintOf({ params: {}, query: { a: undefined }, body: undefined })).toBe(
      fingerprintOf({ params: {}, query: {}, body: undefined }),
    );
    const day = new Date('2026-11-26T00:00:00.000Z');
    expect(fingerprintOf({ params: {}, query: { since: day }, body: undefined })).toBe(
      fingerprintOf({ params: {}, query: { since: day.toISOString() }, body: undefined }),
    );
    expect(fingerprintOf({ params: {}, query: {}, body: null })).not.toBe(
      fingerprintOf({ params: {}, query: {}, body: {} }),
    );
  });

  it('AC-PLATFORM-8: a hash of 64 hex characters, and different texts that look alike differ', () => {
    expect(fingerprintOf(request)).toMatch(/^[0-9a-f]{64}$/);
    expect(fingerprintOf({ params: {}, query: {}, body: 'a,b' })).not.toBe(
      fingerprintOf({ params: {}, query: {}, body: ['a', 'b'] }),
    );
    expect(fingerprintOf({ params: {}, query: {}, body: { 'a:1': 2 } })).not.toBe(
      fingerprintOf({ params: {}, query: {}, body: { a: { 1: 2 } } }),
    );
  });

  it('AC-PLATFORM-8: any JSON value, written with its keys in another order, has the same fingerprint', () => {
    const reverse = (value: unknown): unknown => {
      if (Array.isArray(value)) return (value as unknown[]).map(reverse);
      if (typeof value === 'object' && value !== null) {
        return Object.fromEntries(
          Object.entries(value)
            .reverse()
            .map(([name, item]) => [name, reverse(item)]),
        );
      }
      return value;
    };

    assert(
      property(jsonValue(), (body) => {
        expect(fingerprintOf({ params: {}, query: {}, body: reverse(body) })).toBe(
          fingerprintOf({ params: {}, query: {}, body }),
        );
      }),
    );
    assert(
      property(dictionary(text(), constantFrom(1, 2, 3)), (body) => {
        expect(fingerprintOf({ params: {}, query: {}, body })).toMatch(/^[0-9a-f]{64}$/);
      }),
    );
  });

  it('SR-007, CR-40: a body of 100 KB is hashed in one pass', () => {
    const body = { items: Array.from({ length: 10_000 }, (_, index) => ({ id: index, n: 'x' })) };

    expect(fingerprintOf({ params: {}, query: {}, body })).toMatch(/^[0-9a-f]{64}$/);
  });
});
