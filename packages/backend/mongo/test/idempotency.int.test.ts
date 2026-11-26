import { createHash } from 'node:crypto';

import {
  IDEMPOTENCY_LEASE_MS,
  IDEMPOTENCY_TTL_MS,
  type IdempotencyClaim,
  type IdempotencyId,
  type IdempotencyStore,
} from '@beautinique/backend-server-kit';
import { createFakeClock } from '@beautinique/shared-clock';
import type { Db, Document, MongoClient } from 'mongodb';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { defineCollections } from '../src/collections.ts';
import {
  createMongoIdempotencyStore,
  IDEMPOTENCY_COLLECTION,
  idempotencyCollection,
} from '../src/idempotency.ts';
import { leasesCollection } from '../src/lease.ts';
import { migrationsCollection, releaseSchema } from '../src/release.ts';
import { connectTest, integrationRuns, testDatabase } from './utils/mongo.ts';

const runs = await integrationRuns('idempotency.int.test.ts');

const NOW = new Date('2026-11-26T10:00:00.000Z');
const at = (ms: number) => new Date(NOW.getTime() + ms);
const claimAt = (fingerprint: string, ms = 0): IdempotencyClaim => ({
  fingerprint,
  leaseUntil: at(ms + IDEMPOTENCY_LEASE_MS),
});
const answer = { status: 201, body: { orderId: 'o1', total: 129_900, lines: [{ qty: 2 }] } };

describe.skipIf(!runs)('the idempotency store on the real MongoDB (AC-PLATFORM-8, SR-045)', () => {
  let client: MongoClient;
  let db: Db;
  let store: IdempotencyStore;
  let n = 0;
  // A key of its own for each test, so the tests do not see each other's records.
  let id: IdempotencyId;

  beforeAll(async () => {
    ({ client } = await connectTest('idem'));
    db = testDatabase(client, 'idem');
    const collections = defineCollections('commerce', [
      idempotencyCollection,
      leasesCollection,
      migrationsCollection,
    ]);
    await releaseSchema(db, collections, { clock: createFakeClock(NOW), owner: 'test' });
    store = createMongoIdempotencyStore(db);
  });

  beforeEach(() => {
    n += 1;
    id = {
      caller: 'acc-1',
      routeId: 'commerce.order.place',
      key: `key-${String(n).padStart(4, '0')}`,
    };
  });

  afterAll(async () => {
    await db.dropDatabase();
    await client.close();
  });

  it('AC-PLATFORM-8: the first request starts; the same key and body while it runs is in progress', async () => {
    expect(await store.begin(id, claimAt('f1'), NOW)).toEqual({ kind: 'started' });
    expect(await store.begin(id, claimAt('f1', 1), at(1))).toEqual({ kind: 'in-progress' });
    expect(await store.begin(id, claimAt('f2', 1), at(1))).toEqual({ kind: 'key-reused' });
  });

  it('AC-PLATFORM-8: the same key and body after it ended is its answer, as it was; another body is a key reused', async () => {
    const first = claimAt('f1');
    await store.begin(id, first, NOW);
    await store.complete(id, first, answer, at(IDEMPOTENCY_TTL_MS));

    expect(await store.begin(id, claimAt('f1', 1_000), at(1_000))).toEqual({
      kind: 'replay',
      response: answer,
    });
    expect(await store.begin(id, claimAt('f2', 1_000), at(1_000))).toEqual({ kind: 'key-reused' });
  });

  it('AC-PLATFORM-8: an answer with no body (204) and one that is null are each given back as they were', async () => {
    const first = claimAt('f1');
    await store.begin(id, first, NOW);
    await store.complete(id, first, { status: 204, body: undefined }, at(IDEMPOTENCY_TTL_MS));
    expect(await store.begin(id, claimAt('f1', 1), at(1))).toEqual({
      kind: 'replay',
      response: { status: 204, body: undefined },
    });

    const other = { ...id, key: `${id.key}-null` };
    await store.begin(other, first, NOW);
    await store.complete(other, first, { status: 200, body: null }, at(IDEMPOTENCY_TTL_MS));
    expect(await store.begin(other, claimAt('f1', 1), at(1))).toEqual({
      kind: 'replay',
      response: { status: 200, body: null },
    });
  });

  it('SR-045: the key is of the caller and of the route, and only its SHA-256 is kept (docs/ARCHITECTURE.md §10.1 rule 4)', async () => {
    await store.begin(id, claimAt('f1'), NOW);

    expect(await store.begin({ ...id, caller: 'acc-2' }, claimAt('f1'), NOW)).toEqual({
      kind: 'started',
    });
    expect(
      await store.begin({ ...id, routeId: 'commerce.order.close' }, claimAt('f1'), NOW),
    ).toEqual({
      kind: 'started',
    });
    const hash = createHash('sha256')
      .update(JSON.stringify([id.caller, id.routeId, id.key]))
      .digest('hex');
    const record = await db.collection(IDEMPOTENCY_COLLECTION).findOne({ _id: hash as never });
    expect(record).not.toBeNull();
    expect(JSON.stringify(record)).not.toContain(id.key);
    expect(JSON.stringify(record)).not.toContain(id.caller);
  });

  it('AC-PLATFORM-8: a record is kept 48 hours, then the key is free; a lease that ran out frees it too', async () => {
    const first = claimAt('f1');
    await store.begin(id, first, NOW);
    await store.complete(id, first, answer, at(IDEMPOTENCY_TTL_MS));
    const before = IDEMPOTENCY_TTL_MS - 1;
    expect((await store.begin(id, claimAt('f1', before), at(before))).kind).toBe('replay');
    expect(
      (await store.begin(id, claimAt('f2', IDEMPOTENCY_TTL_MS), at(IDEMPOTENCY_TTL_MS))).kind,
    ).toBe('started');

    const other = { ...id, key: `${id.key}-lease` };
    await store.begin(other, claimAt('f1'), NOW);
    const late = IDEMPOTENCY_LEASE_MS - 1;
    expect((await store.begin(other, claimAt('f1', late), at(late))).kind).toBe('in-progress');
    expect(
      (await store.begin(other, claimAt('f1', IDEMPOTENCY_LEASE_MS), at(IDEMPOTENCY_LEASE_MS)))
        .kind,
    ).toBe('started');
  });

  it('AC-PLATFORM-8: a request that ended in a 5xx is forgotten, so the same key can try again', async () => {
    const first = claimAt('f1');
    await store.begin(id, first, NOW);
    await store.release(id, first);

    expect((await store.begin(id, claimAt('f2', 1), at(1))).kind).toBe('started');
  });

  it('SR-045: a request whose lease ran out leaves the record of the request that took its key as it is', async () => {
    const late = claimAt('f1');
    await store.begin(id, late, NOW);
    const retry = claimAt('f1', IDEMPOTENCY_LEASE_MS);
    expect((await store.begin(id, retry, at(IDEMPOTENCY_LEASE_MS))).kind).toBe('started');

    const third = IDEMPOTENCY_LEASE_MS + 1;
    await store.release(id, late);
    expect((await store.begin(id, claimAt('f1', third), at(third))).kind).toBe('in-progress');
    await store.complete(id, late, { status: 200, body: { late: true } }, at(IDEMPOTENCY_TTL_MS));
    expect((await store.begin(id, claimAt('f1', third), at(third))).kind).toBe('in-progress');

    await store.complete(id, retry, answer, at(IDEMPOTENCY_TTL_MS));
    await store.release(id, retry);
    expect(await store.begin(id, claimAt('f1', third), at(third))).toEqual({
      kind: 'replay',
      response: answer,
    });
  });

  it('SR-045: of 25 requests with one key at one moment exactly one starts (begin is one atomic step)', async () => {
    const results = await Promise.all(
      Array.from({ length: 25 }, () => store.begin(id, claimAt('f1'), NOW)),
    );

    expect(results.filter((result) => result.kind === 'started')).toHaveLength(1);
    expect(results.filter((result) => result.kind === 'in-progress')).toHaveLength(24);
  });

  it('SR-045: ending or releasing a key that is not there changes nothing', async () => {
    const first = claimAt('f1');

    await expect(
      store.complete(id, first, answer, at(IDEMPOTENCY_TTL_MS)),
    ).resolves.toBeUndefined();
    await expect(store.release(id, first)).resolves.toBeUndefined();
    expect((await store.begin(id, first, NOW)).kind).toBe('started');
  });

  it('AC-PLATFORM-8: the record goes by itself after its time: the TTL index is on expiresAt', async () => {
    const indexes = (await db
      .collection(IDEMPOTENCY_COLLECTION)
      .listIndexes()
      .toArray()) as Document[];
    const ttl = indexes.find((index) => index['name'] === 'expiresAt_ttl');
    expect(ttl).toMatchObject({ key: { expiresAt: 1 }, expireAfterSeconds: 0 });
  });

  it('SR-045: a record that the validator does not take, or a database error, is thrown, not taken as started', async () => {
    const broken = createMongoIdempotencyStore(client.db(`${db.databaseName}_strict`));
    const strict = client.db(`${db.databaseName}_strict`);
    try {
      await strict.createCollection(IDEMPOTENCY_COLLECTION, {
        validator: { $jsonSchema: { bsonType: 'object', required: ['nothing'] } },
      });
      await expect(broken.begin(id, claimAt('f1'), NOW)).rejects.toMatchObject({ code: 121 });
    } finally {
      await strict.dropDatabase();
    }
  });
});
