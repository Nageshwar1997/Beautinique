import type { Db, MongoClient } from 'mongodb';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { IDEMPOTENCY_COLLECTION } from '../src/idempotency.ts';
import { queryPlanProblems } from '../src/query-plan.ts';
import { connectTest, integrationRuns, testDatabase } from './utils/mongo.ts';

const runs = await integrationRuns('query-plan.int.test.ts');

describe.skipIf(!runs)(
  'the guard of collection scans on the real MongoDB (docs/OPERATIONS.md §2 rule 6)',
  () => {
    let client: MongoClient;
    let db: Db;
    const orders = () => db.collection('orders');

    beforeAll(async () => {
      ({ client } = await connectTest('plan'));
      db = testDatabase(client, 'plan');
      await orders().createIndex(
        { customerId: 1, placedAt: -1 },
        { name: 'customerId_placedAt' },
        undefined,
      );
      await orders().insertMany(
        Array.from({ length: 50 }, (_, index) => ({
          customerId: `c${String(index % 5)}`,
          placedAt: new Date(Date.UTC(2026, 10, 1 + (index % 20))),
          note: `n${String(index)}`,
        })),
      );
      await db.createCollection(IDEMPOTENCY_COLLECTION);
    });

    afterAll(async () => {
      await db.dropDatabase();
      await client.close();
    });

    it('RT-24: a query that its index serves, in the order of the index, has no problem', async () => {
      expect(
        await queryPlanProblems(orders(), {
          name: 'orders.byCustomer',
          filter: { customerId: 'c1' },
          sort: { placedAt: -1 },
          limit: 20,
        }),
      ).toEqual([]);
      expect(
        await queryPlanProblems(db.collection(IDEMPOTENCY_COLLECTION), {
          name: 'idempotency.byId',
          filter: { _id: 'a'.repeat(64) },
        }),
      ).toEqual([]);
    });

    it('RT-24: a filter with no index, or a sort that no index gives, is caught', async () => {
      expect(
        await queryPlanProblems(orders(), { name: 'orders.byNote', filter: { note: 'n1' } }),
      ).toEqual(['orders.byNote: reads the whole collection (COLLSCAN): give it an index.']);
      expect(
        await queryPlanProblems(orders(), {
          name: 'orders.byCustomerAndNote',
          filter: { customerId: 'c1' },
          sort: { note: 1 },
          projection: { note: 1 },
        }),
      ).toEqual([
        'orders.byCustomerAndNote: sorts in memory (SORT): give it an index in the order of its sort.',
      ]);
    });

    it('RT-24: a query on a collection that is not there is not taken as served', async () => {
      expect(
        await queryPlanProblems(db.collection('missing'), {
          name: 'missing.all',
          filter: { a: 1 },
        }),
      ).toEqual([
        'missing.all: the collection is not there; run the release step before the guard.',
      ]);
    });
  },
);
