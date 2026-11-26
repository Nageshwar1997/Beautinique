import { paise } from '@beautinique/shared-money';
import { createFakeClock } from '@beautinique/shared-clock';
import type { Db, Document, MongoClient } from 'mongodb';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { defineCollections, retentionProblems, type CollectionSpec } from '../src/collections.ts';
import { idempotencyCollection } from '../src/idempotency.ts';
import { acquireLease, leasesCollection, releaseLease } from '../src/lease.ts';
import { MONEY_BSON_SCHEMA, moneyToBson } from '../src/money.ts';
import {
  migrationsCollection,
  releaseSchema,
  runDataMigrations,
  type DataMigration,
} from '../src/release.ts';
import { connectTest, integrationRuns, testDatabase } from './utils/mongo.ts';

const runs = await integrationRuns('release.int.test.ts');
const START = new Date('2026-11-26T10:00:00.000Z');

const orders: CollectionSpec = {
  name: 'orders',
  retention: 'book',
  schema: {
    bsonType: 'object',
    required: ['total', 'status', 'version'],
    properties: {
      total: MONEY_BSON_SCHEMA,
      status: { enum: ['placed', 'packed'] },
      version: { bsonType: 'int', minimum: 1 },
    },
  },
  indexes: [
    { name: 'customerId_placedAt', key: { customerId: 1, placedAt: -1 } },
    {
      name: 'number_unique',
      key: { number: 1 },
      unique: true,
      partialFilterExpression: { number: { $exists: true } },
    },
  ],
  expiry: { job: 'commerce.orders.archive' },
  accountDelete: { run: () => Promise.resolve() },
};
const platform = [idempotencyCollection, leasesCollection, migrationsCollection];

describe.skipIf(!runs)('the release step on the real MongoDB (docs/ARCHITECTURE.md §10.4)', () => {
  let client: MongoClient;
  let db: Db;
  const clock = createFakeClock(START);
  const plan = (specs: CollectionSpec[]) => defineCollections('commerce', [...specs, ...platform]);
  const indexesOf = async (name: string) =>
    (await db.collection(name).listIndexes().toArray())
      .map((index: Document) => String(index['name']))
      .sort();

  beforeAll(async () => {
    ({ client } = await connectTest('release'));
    db = testDatabase(client, 'release');
  });

  afterAll(async () => {
    await db.dropDatabase();
    await client.close();
  });

  it('AC-PLATFORM-11: the first run makes every collection with its validator and indexes; the same plan again does nothing', async () => {
    const first = await releaseSchema(db, plan([orders]), { clock, owner: 'a' });

    expect(first.kind).toBe('ran');
    expect(first.changes).toEqual(
      expect.arrayContaining([
        'created orders',
        'index orders.customerId_placedAt created',
        'index orders.number_unique created',
        'created idempotency_keys',
        'index idempotency_keys.expiresAt_ttl created',
      ]),
    );
    expect(await indexesOf('orders')).toEqual(['_id_', 'customerId_placedAt', 'number_unique']);
    const indexes = (await db.collection('idempotency_keys').listIndexes().toArray()) as Document[];
    const ttl = indexes.find((index) => index['name'] === 'expiresAt_ttl');
    expect(ttl).toMatchObject({ key: { expiresAt: 1 }, expireAfterSeconds: 0 });

    expect(await releaseSchema(db, plan([orders]), { clock, owner: 'b' })).toEqual({
      kind: 'unchanged',
      fingerprint: first.fingerprint,
      changes: [],
    });
  });

  it('SR-047: the validator turns away an amount that is not a long, and a status that is not on the list', async () => {
    const ok = { total: moneyToBson(paise(129_900)), status: 'placed', version: 1 };

    await expect(db.collection('orders').insertOne({ ...ok })).resolves.toBeDefined();
    await expect(
      db.collection('orders').insertOne({ ...ok, total: 129_900 }),
    ).rejects.toMatchObject({
      code: 121,
    });
    await expect(
      db.collection('orders').insertOne({ ...ok, status: 'lost' }),
    ).rejects.toMatchObject({
      code: 121,
    });
    await expect(
      db.collection('orders').insertOne({ ...ok, total: moneyToBson(paise(-1)) }),
    ).rejects.toMatchObject({ code: 121 });
  });

  it('AC-PLATFORM-11: a new schema is set with collMod, a new index is made and an index the plan no longer has is dropped', async () => {
    const next: CollectionSpec = {
      ...orders,
      schema: { bsonType: 'object', required: ['version'] },
      indexes: [
        orders.indexes[0] as never,
        { name: 'status_placedAt', key: { status: 1, placedAt: -1 } },
      ],
    };

    const result = await releaseSchema(db, plan([next]), { clock, owner: 'a' });

    expect(result.changes).toEqual([
      'validator of orders',
      'index orders.status_placedAt created',
      'index orders.number_unique dropped',
    ]);
    expect(await indexesOf('orders')).toEqual(['_id_', 'customerId_placedAt', 'status_placedAt']);
    // The old validator is gone: an amount as a plain number is taken now.
    await expect(
      db.collection('orders').insertOne({ version: 1, total: 5 }),
    ).resolves.toBeDefined();
  });

  it('AC-PLATFORM-11: an index whose name is there with another shape stops the release (a new shape is a new name)', async () => {
    const changed: CollectionSpec = {
      ...orders,
      schema: { bsonType: 'object', required: ['version'] },
      indexes: [{ name: 'customerId_placedAt', key: { customerId: 1, placedAt: 1 } }],
    };

    await expect(releaseSchema(db, plan([changed]), { clock, owner: 'a' })).rejects.toThrow(
      'The index orders.customerId_placedAt has another shape in the database. A new shape is a new name, and the old one goes in the next release (docs/ARCHITECTURE.md §10.4 rule 2).',
    );
    // The lease was given up, so the next release does not wait for it.
    expect(await db.collection('leases').findOne({ _id: 'release' as never })).toBeNull();
  });

  it('AC-PLATFORM-6: two instances at one boot: one makes the schema and the other waits for it', async () => {
    const fresh = client.db(`${db.databaseName}_two`);
    try {
      const both = await Promise.all([
        releaseSchema(fresh, plan([orders]), { clock, owner: 'a', pollMs: 20 }),
        releaseSchema(fresh, plan([orders]), { clock, owner: 'b', pollMs: 20 }),
      ]);
      expect(both.map((result) => result.kind).sort()).toEqual(['ran', 'waited']);
      expect(await fresh.collection('orders').listIndexes().toArray()).toHaveLength(3);
    } finally {
      await fresh.dropDatabase();
    }
  });

  it('AC-PLATFORM-6: an instance that died with the lease stops the next boot only until its lease is out', async () => {
    const fresh = client.db(`${db.databaseName}_dead`);
    try {
      expect(
        await acquireLease(fresh, {
          name: 'release',
          owner: 'dead',
          now: clock.now(),
          ttlMs: 60_000,
        }),
      ).toBe(true);
      await expect(
        releaseSchema(fresh, plan([orders]), { clock, owner: 'a', waitMs: 60, pollMs: 20 }),
      ).rejects.toThrow(
        'Another instance has held the release lease of commerce for 60 ms; this boot stops, and the next one tries again.',
      );

      clock.advance(60_000);
      expect((await releaseSchema(fresh, plan([orders]), { clock, owner: 'a' })).kind).toBe('ran');
    } finally {
      await fresh.dropDatabase();
    }
  });

  it('AC-PLATFORM-11: the guard of the registry finds a collection that is not in it', async () => {
    await db.createCollection('stray_copies');
    const names = (await db.listCollections({}, { nameOnly: true }).toArray()).map(
      (info) => info.name,
    );

    expect(retentionProblems(plan([orders]), names)).toEqual([
      'The collection stray_copies of commerce is not in the retention registry: give it a retention class, its expiry and its account delete handler.',
    ]);
  });

  it('AC-PLATFORM-11: a view in the place of a collection stops the release', async () => {
    const fresh = client.db(`${db.databaseName}_view`);
    try {
      await fresh.createCollection('source');
      await fresh.createCollection('orders', { viewOn: 'source', pipeline: [] });
      await expect(releaseSchema(fresh, plan([orders]), { clock, owner: 'a' })).rejects.toThrow(
        'orders is in the database, and it is a view, not a collection.',
      );
    } finally {
      await fresh.dropDatabase();
    }
  });
});

describe.skipIf(!runs)('the leases (docs/ARCHITECTURE.md §10.2)', () => {
  let client: MongoClient;
  let db: Db;

  beforeAll(async () => {
    ({ client } = await connectTest('lease'));
    db = testDatabase(client, 'lease');
  });

  afterAll(async () => {
    await db.dropDatabase();
    await client.close();
  });

  it('AC-PLATFORM-6: one owner at a time; the owner renews it; another takes it when its time is out', async () => {
    const at = (ms: number) => new Date(START.getTime() + ms);
    const lease = (owner: string, ms: number) => ({
      name: 'ticker',
      owner,
      now: at(ms),
      ttlMs: 10_000,
    });

    expect(await acquireLease(db, lease('a', 0))).toBe(true);
    expect(await acquireLease(db, lease('b', 1))).toBe(false);
    expect(await acquireLease(db, lease('a', 5_000))).toBe(true);
    expect(await acquireLease(db, lease('b', 14_999))).toBe(false);
    expect(await acquireLease(db, lease('b', 15_000))).toBe(true);
    // The old owner's release does not take it from the new one.
    await releaseLease(db, { name: 'ticker', owner: 'a' });
    expect(await acquireLease(db, lease('a', 15_001))).toBe(false);
    await releaseLease(db, { name: 'ticker', owner: 'b' });
    expect(await acquireLease(db, lease('a', 15_002))).toBe(true);
    await expect(acquireLease(db, { ...lease('a', 0), ttlMs: 0 })).rejects.toThrow(
      'ttlMs must be a whole number of milliseconds, 1 or more.',
    );
  });

  it('AC-PLATFORM-6: a database error is thrown, not taken as a lease that another holds', async () => {
    const strict = client.db(`${db.databaseName}_strict`);
    try {
      await strict.createCollection('leases', {
        validator: { $jsonSchema: { bsonType: 'object', required: ['nothing'] } },
      });
      await expect(
        acquireLease(strict, { name: 'ticker', owner: 'a', now: START, ttlMs: 1_000 }),
      ).rejects.toMatchObject({ code: 121 });
    } finally {
      await strict.dropDatabase();
    }
  });

  it('AC-PLATFORM-6: of 20 owners at one moment exactly one holds it', async () => {
    const results = await Promise.all(
      Array.from({ length: 20 }, (_, index) =>
        acquireLease(db, {
          name: 'dispatcher',
          owner: `o${String(index)}`,
          now: START,
          ttlMs: 10_000,
        }),
      ),
    );

    expect(results.filter(Boolean)).toHaveLength(1);
  });
});

describe.skipIf(!runs)('the data migrations (docs/ARCHITECTURE.md §10.4 rules 3 and 4)', () => {
  let client: MongoClient;
  let db: Db;
  const clock = createFakeClock(START);
  const rows = () => db.collection<{ _id: number; istDay?: string }>('rows');

  // Sets `istDay` on each row, a batch at a time, in `_id` order.
  const addDay = (id: string, seen: number[]): DataMigration => ({
    id,
    async batch({ db: database, after, size }) {
      const batch = await database
        .collection<{ _id: number }>('rows')
        .find(after === null ? {} : { _id: { $gt: after as number } }, {
          sort: { _id: 1 },
          limit: size,
        })
        .toArray();
      if (batch.length === 0) return null;
      await database
        .collection<{ _id: number }>('rows')
        .updateMany(
          { _id: { $in: batch.map((row) => row._id) } },
          { $set: { istDay: '2026-11-26' } },
        );
      seen.push(batch.length);
      return batch.at(-1)?._id;
    },
  });

  beforeAll(async () => {
    ({ client } = await connectTest('data'));
    db = testDatabase(client, 'data');
    await rows().insertMany(Array.from({ length: 120 }, (_, index) => ({ _id: index })));
  });

  afterAll(async () => {
    await db.dropDatabase();
    await client.close();
  });

  it('AC-PLATFORM-11: a migration goes a batch at a time, keeps how far it came, and is done once', async () => {
    const seen: number[] = [];
    const options = { clock, owner: 'a', batchSize: 50, opsPerSecond: 1_000_000 };

    expect(await runDataMigrations(db, [addDay('2026-11-rows-ist-day', seen)], options)).toEqual({
      kind: 'done',
      ran: ['2026-11-rows-ist-day'],
    });
    expect(seen).toEqual([50, 50, 20]);
    expect(await rows().countDocuments({ istDay: '2026-11-26' })).toBe(120);
    expect(
      await db.collection('migrations').findOne({ _id: 'data:2026-11-rows-ist-day' as never }),
    ).toMatchObject({
      done: true,
      after: 119,
    });

    // Done: the next release does not run it again.
    expect(await runDataMigrations(db, [addDay('2026-11-rows-ist-day', seen)], options)).toEqual({
      kind: 'done',
      ran: [],
    });
    expect(seen).toEqual([50, 50, 20]);
  });

  it('AC-PLATFORM-11: a stop (SIGTERM) leaves it where it was, and the next start goes on from there', async () => {
    const seen: number[] = [];
    const stop = new AbortController();
    const first = addDay('2026-11-rows-again', seen);
    const stopping: DataMigration = {
      id: first.id,
      async batch(input) {
        const last = await first.batch(input);
        stop.abort();
        return last;
      },
    };

    expect(
      await runDataMigrations(db, [stopping], {
        clock,
        owner: 'a',
        batchSize: 50,
        opsPerSecond: 1,
        signal: stop.signal,
      }),
    ).toEqual({ kind: 'stopped', at: '2026-11-rows-again', ran: [] });
    expect(seen).toEqual([50]);

    expect(
      await runDataMigrations(db, [first], {
        clock,
        owner: 'b',
        batchSize: 50,
        opsPerSecond: 1_000_000,
      }),
    ).toEqual({ kind: 'done', ran: ['2026-11-rows-again'] });
    expect(seen).toEqual([50, 50, 20]);
  });

  it('AC-PLATFORM-6: only one instance runs them, and one that lost its lease stops', async () => {
    const seen: number[] = [];
    expect(
      await acquireLease(db, {
        name: 'release-data',
        owner: 'other',
        now: clock.now(),
        ttlMs: 60_000,
      }),
    ).toBe(true);

    expect(
      await runDataMigrations(db, [addDay('2026-11-rows-third', seen)], { clock, owner: 'a' }),
    ).toEqual({ kind: 'elsewhere' });
    await releaseLease(db, { name: 'release-data', owner: 'other' });

    // The lease goes to another between two batches: this one stops.
    const losing: DataMigration = {
      id: '2026-11-rows-third',
      async batch(input) {
        const last = await addDay('x', seen).batch(input);
        clock.advance(120_000);
        await acquireLease(db, {
          name: 'release-data',
          owner: 'thief',
          now: clock.now(),
          ttlMs: 60_000,
        });
        return last;
      },
    };
    expect(
      await runDataMigrations(db, [losing], {
        clock,
        owner: 'a',
        batchSize: 50,
        opsPerSecond: 1_000_000,
      }),
    ).toEqual({ kind: 'stopped', at: '2026-11-rows-third', ran: [] });
  });

  it('CR-12: a migration id that is wrong or given twice, a batch size or a speed that is wrong, is refused', async () => {
    const one = addDay('ok-id', []);
    const call = (migrations: DataMigration[], extra: Document = {}) =>
      runDataMigrations(db, migrations, { clock, owner: 'a', ...extra });

    await expect(call([{ ...one, id: 'Bad Id' }])).rejects.toThrow(
      'The data migration Bad Id needs an id of small letters, digits and -.',
    );
    await expect(call([one, one])).rejects.toThrow('The data migration ok-id is given twice.');
    await expect(call([one], { batchSize: 0 })).rejects.toThrow(
      'batchSize must be a whole number of 1 or more.',
    );
    await expect(call([one], { opsPerSecond: 0 })).rejects.toThrow(
      'opsPerSecond must be more than 0.',
    );
  });
});
