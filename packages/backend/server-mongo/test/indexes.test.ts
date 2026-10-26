// syncIndexes against a real MongoDB replica set: the local one from `npm run infra:up`, or MONGO_TEST_URI (CI).
import { randomUUID } from 'node:crypto';

import { createLogger } from '@beautinique/backend-server-kit';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  connectMongo,
  IndexConflictError,
  type IndexSpec,
  type Mongo,
  MongoServerError,
  syncIndexes,
} from '../src/index';

const URI = process.env.MONGO_TEST_URI ?? 'mongodb://localhost:27017/?replicaSet=rs0';
const dbName = `bq_test_indexes_${randomUUID().slice(0, 8)}`;
let mongo: Mongo;

beforeAll(async () => {
  try {
    mongo = await connectMongo({
      uri: URI,
      dbName,
      appName: 'server-mongo-indexes-test',
      logger: createLogger({ name: 'indexes-test', level: 'silent' }),
      serverSelectionTimeoutMS: 3000,
    });
  } catch (error) {
    throw new Error(
      'These tests need the MongoDB replica set: run `npm run infra:up` (or set MONGO_TEST_URI).',
      { cause: error },
    );
  }
});
afterAll(async () => {
  try {
    await mongo.db.dropDatabase();
  } finally {
    await mongo.close();
  }
});

/** Every test gets collections of its own. */
const fresh = () => `c_${randomUUID().slice(0, 8)}`;
const indexesOf = (collection: string) => mongo.db.collection(collection).indexes();

describe('syncIndexes', () => {
  it('makes the missing indexes with their exact shape, also on collections that do not exist yet', async () => {
    const orders = fresh();
    const sessions = fresh();
    const specs: IndexSpec[] = [
      { collection: orders, name: 'buyer_createdAt', key: { buyerId: 1, createdAt: -1 } },
      {
        collection: orders,
        name: 'number_unique',
        key: { number: 1 },
        unique: true,
        partialFilterExpression: { number: { $exists: true } },
      },
      { collection: orders, name: 'coupon_sparse', key: { coupon: 1 }, sparse: true },
      { collection: sessions, name: 'expiry', key: { expiresAt: 1 }, expireAfterSeconds: 3600 },
    ];

    expect(await syncIndexes(mongo, specs)).toEqual({
      created: [
        `${orders}.buyer_createdAt`,
        `${orders}.number_unique`,
        `${orders}.coupon_sparse`,
        `${sessions}.expiry`,
      ],
      extra: [],
    });
    const made = await indexesOf(orders);
    expect(made.find((i) => i.name === 'buyer_createdAt')?.key).toEqual({
      buyerId: 1,
      createdAt: -1,
    });
    expect(made.find((i) => i.name === 'number_unique')).toMatchObject({
      unique: true,
      partialFilterExpression: { number: { $exists: true } },
    });
    expect(made.find((i) => i.name === 'coupon_sparse')).toMatchObject({ sparse: true });
    expect((await indexesOf(sessions)).find((i) => i.name === 'expiry')).toMatchObject({
      key: { expiresAt: 1 },
      expireAfterSeconds: 3600,
    });

    // a second run (the next boot) finds them all
    expect(await syncIndexes(mongo, specs)).toEqual({ created: [], extra: [] });
  });

  it('reports indexes nobody asked for, and never drops them', async () => {
    const products = fresh();
    await mongo.db.collection(products).createIndex({ old: 1 }, { name: 'old_one' });
    const report = await syncIndexes(mongo, [
      { collection: products, name: 'slug', key: { slug: 1 } },
    ]);
    expect(report).toEqual({ created: [`${products}.slug`], extra: [`${products}.old_one`] });
    expect((await indexesOf(products)).map((i) => i.name).toSorted()).toEqual([
      '_id_',
      'old_one',
      'slug',
    ]);
  });

  it.each<[string, Partial<IndexSpec>]>([
    ['other key order', { key: { b: 1, a: 1 } }],
    ['other direction', { key: { a: -1, b: 1 } }],
    ['unique now', { unique: true }],
    ['sparse now', { sparse: true }],
    ['a TTL now', { expireAfterSeconds: 60 }],
    ['a partial filter now', { partialFilterExpression: { a: { $exists: true } } }],
  ])(
    'refuses an index whose shape changed under its name (%s), and makes nothing',
    async (_, change) => {
      const collection = fresh();
      await syncIndexes(mongo, [{ collection, name: 'a_b', key: { a: 1, b: 1 } }]);
      const changed: IndexSpec = { collection, name: 'a_b', key: { a: 1, b: 1 }, ...change };
      const other: IndexSpec = { collection, name: 'other', key: { other: 1 } };

      const error = await syncIndexes(mongo, [other, changed]).catch((caught: unknown) => caught);
      expect(error).toBeInstanceOf(IndexConflictError);
      expect(error).toMatchObject({
        name: 'IndexConflictError',
        collection,
        index: 'a_b',
        message: expect.stringContaining('another shape') as unknown,
      });
      expect((await indexesOf(collection)).map((i) => i.name)).not.toContain('other');
    },
  );

  it('refuses a TTL that changed, and a partial filter that changed', async () => {
    const collection = fresh();
    const ttl: IndexSpec = { collection, name: 'ttl', key: { at: 1 }, expireAfterSeconds: 60 };
    const partial: IndexSpec = {
      collection,
      name: 'partial',
      key: { p: 1 },
      partialFilterExpression: { p: { $gt: 1 } },
    };
    await syncIndexes(mongo, [ttl, partial]);
    await expect(syncIndexes(mongo, [{ ...ttl, expireAfterSeconds: 120 }])).rejects.toThrow(
      IndexConflictError,
    );
    await expect(
      syncIndexes(mongo, [{ ...partial, partialFilterExpression: { p: { $gt: 2 } } }]),
    ).rejects.toThrow(IndexConflictError);
  });

  it('refuses an index whose keys already exist under another name', async () => {
    const collection = fresh();
    await mongo.db.collection(collection).createIndex({ email: 1 }, { name: 'email_old' });
    const error = await syncIndexes(mongo, [
      { collection, name: 'email_new', key: { email: 1 } },
    ]).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(IndexConflictError);
    expect(error).toMatchObject({
      index: 'email_new',
      message: expect.stringContaining('under another name') as unknown,
    });
    expect((error as Error).cause).toBeInstanceOf(MongoServerError);
  });

  it('passes on other MongoDB errors as they are', async () => {
    const collection = fresh();
    // a TTL index must have a single field
    const error = await syncIndexes(mongo, [
      { collection, name: 'bad_ttl', key: { a: 1, b: 1 }, expireAfterSeconds: 60 },
    ]).catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(MongoServerError);
    expect(error).not.toBeInstanceOf(IndexConflictError);
  });

  it('refuses a list that names one index twice', async () => {
    const collection = fresh();
    await expect(
      syncIndexes(mongo, [
        { collection, name: 'twice', key: { a: 1 } },
        { collection, name: 'twice', key: { b: 1 } },
      ]),
    ).rejects.toThrow(`Index ${collection}.twice is listed twice.`);
    // the same name on two collections is fine
    await expect(
      syncIndexes(mongo, [
        { collection, name: 'same', key: { a: 1 } },
        { collection: fresh(), name: 'same', key: { a: 1 } },
      ]),
    ).resolves.toMatchObject({ extra: [] });
  });

  it('is safe on two instances at once', async () => {
    const collection = fresh();
    const specs: IndexSpec[] = [
      { collection, name: 'a', key: { a: 1 } },
      { collection, name: 'b', key: { b: 1 }, unique: true },
    ];
    const [first, second] = await Promise.all([
      syncIndexes(mongo, specs),
      syncIndexes(mongo, specs),
    ]);
    expect([...first.created, ...second.created].length).toBeGreaterThanOrEqual(2);
    expect((await indexesOf(collection)).map((i) => i.name).toSorted()).toEqual(['_id_', 'a', 'b']);
  });
});
