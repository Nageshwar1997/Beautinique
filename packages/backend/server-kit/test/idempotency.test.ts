import { assert, constantFrom, dictionary, jsonValue, property, string as text } from 'fast-check';
import { describe, expect, it } from 'vitest';

import {
  createMemoryIdempotencyStore,
  fingerprintOf,
  IDEMPOTENCY_LEASE_MS,
  IDEMPOTENCY_TTL_MS,
  type IdempotencyId,
} from '../src/idempotency.ts';
import { NOW } from './utils/fixtures.ts';

const id: IdempotencyId = { caller: 'acc-1', routeId: 'commerce.order.place', key: 'key-0001' };
const at = (ms: number) => new Date(NOW.getTime() + ms);
const answer = { status: 201, body: { orderId: 'o1' } };

describe('the idempotency store in memory (AC-PLATFORM-8, SR-045)', () => {
  it('AC-PLATFORM-8: the first request starts, and the same key and body while it runs is in progress', async () => {
    const store = createMemoryIdempotencyStore();

    expect(await store.begin(id, 'f1', NOW, at(IDEMPOTENCY_LEASE_MS))).toEqual({ kind: 'started' });
    expect(await store.begin(id, 'f1', at(1), at(IDEMPOTENCY_LEASE_MS))).toEqual({
      kind: 'in-progress',
    });
  });

  it('AC-PLATFORM-8: the same key and body after it ended is its answer; another body is a key that was reused', async () => {
    const store = createMemoryIdempotencyStore();
    await store.begin(id, 'f1', NOW, at(IDEMPOTENCY_LEASE_MS));
    await store.complete(id, answer, at(IDEMPOTENCY_TTL_MS));

    expect(await store.begin(id, 'f1', at(1000), at(1000 + IDEMPOTENCY_LEASE_MS))).toEqual({
      kind: 'replay',
      response: answer,
    });
    expect(await store.begin(id, 'f2', at(1000), at(1000 + IDEMPOTENCY_LEASE_MS))).toEqual({
      kind: 'key-reused',
    });
    // Also while it is still running: another body with the key is not the same request.
    const other = { ...id, key: 'key-0002' };
    await store.begin(other, 'f1', NOW, at(IDEMPOTENCY_LEASE_MS));
    expect(await store.begin(other, 'f2', at(1), at(IDEMPOTENCY_LEASE_MS))).toEqual({
      kind: 'key-reused',
    });
  });

  it('SR-045: the key is of the caller and of the route: the same key of another is another request', async () => {
    const store = createMemoryIdempotencyStore();
    await store.begin(id, 'f1', NOW, at(IDEMPOTENCY_LEASE_MS));
    await store.complete(id, answer, at(IDEMPOTENCY_TTL_MS));

    const otherCaller = { ...id, caller: 'acc-2' };
    const otherRoute = { ...id, routeId: 'commerce.order.close' };
    expect(await store.begin(otherCaller, 'f1', at(1), at(IDEMPOTENCY_LEASE_MS))).toEqual({
      kind: 'started',
    });
    expect(await store.begin(otherRoute, 'f1', at(1), at(IDEMPOTENCY_LEASE_MS))).toEqual({
      kind: 'started',
    });
    // A caller or a route with a `|` or a quote in it cannot be made to look like another.
    const tricky = { caller: 'a","b', routeId: 'c', key: 'k' };
    const other = { caller: 'a', routeId: 'b","c', key: 'k' };
    await store.begin(tricky, 'f1', NOW, at(IDEMPOTENCY_LEASE_MS));
    expect(await store.begin(other, 'f1', NOW, at(IDEMPOTENCY_LEASE_MS))).toEqual({
      kind: 'started',
    });
  });

  it('AC-PLATFORM-8: a record is kept about 48 hours, and then the key is free', async () => {
    const store = createMemoryIdempotencyStore();
    await store.begin(id, 'f1', NOW, at(IDEMPOTENCY_LEASE_MS));
    await store.complete(id, answer, at(IDEMPOTENCY_TTL_MS));

    const before = at(IDEMPOTENCY_TTL_MS - 1);
    expect((await store.begin(id, 'f1', before, at(IDEMPOTENCY_TTL_MS))).kind).toBe('replay');
    const after = at(IDEMPOTENCY_TTL_MS);
    expect((await store.begin(id, 'f2', after, at(IDEMPOTENCY_TTL_MS + 1000))).kind).toBe(
      'started',
    );
  });

  it('SR-007: a request that began and never ended frees its key when the lease is out', async () => {
    const store = createMemoryIdempotencyStore();
    await store.begin(id, 'f1', NOW, at(IDEMPOTENCY_LEASE_MS));

    expect((await store.begin(id, 'f1', at(IDEMPOTENCY_LEASE_MS - 1), at(120_000))).kind).toBe(
      'in-progress',
    );
    expect((await store.begin(id, 'f1', at(IDEMPOTENCY_LEASE_MS), at(120_000))).kind).toBe(
      'started',
    );
  });

  it('AC-PLATFORM-8: a request that ended in a 5xx is forgotten, so the same key can try again', async () => {
    const store = createMemoryIdempotencyStore();
    await store.begin(id, 'f1', NOW, at(IDEMPOTENCY_LEASE_MS));
    await store.release(id);

    expect((await store.begin(id, 'f2', at(1), at(IDEMPOTENCY_LEASE_MS))).kind).toBe('started');
  });

  it('SR-045: ending or releasing a key that is not there changes nothing', async () => {
    const store = createMemoryIdempotencyStore();

    await expect(store.complete(id, answer, at(IDEMPOTENCY_TTL_MS))).resolves.toBeUndefined();
    await expect(store.release(id)).resolves.toBeUndefined();
    expect((await store.begin(id, 'f1', NOW, at(IDEMPOTENCY_LEASE_MS))).kind).toBe('started');
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
