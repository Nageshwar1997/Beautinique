// The collection-scan watch every deployable's tests keep (scripts/e2e/collection-scans.ts, RULES
// §4.13): what it counts, and what it lets through. Against the local MongoDB (`npm run infra:up`).
import { randomUUID } from 'node:crypto';

import { createLogger } from '@beautinique/backend-server-kit';
import { connectMongo } from '@beautinique/backend-server-mongo';
import { describe, expect, it } from 'vitest';

import {
  collectionScans,
  expectNoCollectionScans,
  watchCollectionScans,
} from '../../../scripts/e2e/collection-scans.ts';
import { MONGO_URI } from './helpers.ts';

const logger = createLogger({ name: 'identity-test', level: 'silent' });

describe('the collection-scan watch', () => {
  it('counts the deployable’s whole-collection reads by shape, never an index read, a marked full read or the test’s own', async () => {
    const dbName = `bq_test_identity_scans_${randomUUID().slice(0, 8)}`;
    const look = await connectMongo({ uri: MONGO_URI, dbName, appName: 'identity-test', logger });
    const app = await connectMongo({ uri: MONGO_URI, dbName, appName: 'identity', logger });
    try {
      await watchCollectionScans(look.db);
      const items = app.db.collection<{ a: number; b: string; c?: number }>('items');
      await items.insertMany([
        { a: 1, b: 'x' },
        { a: 2, b: 'y' },
      ]);
      await items.createIndex({ b: 1 }, {}, undefined);
      await items.findOne({ a: 1 });
      await items.findOne({ a: 2 });
      await items.updateOne({ a: { $in: [2, 3] } }, { $set: { c: 1 } });
      await items.countDocuments({ a: 1 });
      await items.findOne({ b: 'x' });
      await items.find({}, { comment: 'full read: every item, on purpose' }).toArray();
      await look.db.collection('items').findOne({ a: 1 });

      expect(await collectionScans(look.db, ['identity'])).toEqual([
        'command items {"$match":{"a":"?"}}',
        'query items {"a":"?"}',
        'update items {"a":{"$in":["?"]}}',
      ]);
      await expect(expectNoCollectionScans(look.db, ['identity'])).rejects.toThrow(
        'identity read a whole collection, without an index (RULES §4.13):\n' +
          '  command items {"$match":{"a":"?"}}\n' +
          '  query items {"a":"?"}\n' +
          '  update items {"a":{"$in":["?"]}}',
      );
      // by the client's name: the test's own look-up is the test's, another deployable made none,
      // and the watch's reads of its record never count
      expect(await collectionScans(look.db, ['identity-test'])).toEqual(['query items {"a":"?"}']);
      await expectNoCollectionScans(look.db, ['notify']);
    } finally {
      await app.close();
      await look.db.dropDatabase();
      await look.close();
    }
  });
});
