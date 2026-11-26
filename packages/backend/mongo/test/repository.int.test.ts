import { systemClock } from '@beautinique/shared-clock';
import type { Db, Document, MongoClient } from 'mongodb';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { findPage, updateIf, updateVersioned } from '../src/repository.ts';
import { withTransaction } from '../src/transaction.ts';
import { connectTest, integrationRuns, testDatabase } from './utils/mongo.ts';

const runs = await integrationRuns('repository.int.test.ts');

interface Order {
  _id: string;
  version: number;
  status: string;
}
interface Item {
  _id: number;
  rank: number;
}

describe.skipIf(!runs)(
  'the repository base on the real MongoDB (docs/ARCHITECTURE.md §10.2, §10.4 rule 8)',
  () => {
    let client: MongoClient;
    let db: Db;
    const orders = () => db.collection<Order>('orders');
    const limits = () => db.collection<{ _id: string; used: number }>('limits');
    const items = () => db.collection<Item>('items');

    beforeAll(async () => {
      ({ client } = await connectTest('repo'));
      db = testDatabase(client, 'repo');
      await items().createIndex({ rank: 1, _id: 1 }, { name: 'rank_id' }, undefined);
    });

    afterAll(async () => {
      await db.dropDatabase();
      await client.close();
    });

    it('SR-045: an update at the right version and state goes through; the same version again is a 409', async () => {
      await orders().insertOne({ _id: 'o1', version: 1, status: 'packing' });

      const after = await updateVersioned(
        orders(),
        { id: 'o1', version: 1, where: { status: 'packing' } },
        { $set: { status: 'packed' } },
      );
      expect(after).toEqual({ _id: 'o1', version: 2, status: 'packed' });

      await expect(
        updateVersioned(orders(), { id: 'o1', version: 1 }, { $set: { status: 'cancelled' } }),
      ).rejects.toMatchObject({ status: 409, code: 'CONFLICT' });
      await expect(
        updateVersioned(
          orders(),
          { id: 'o1', version: 2, where: { status: 'packing' } },
          { $set: { status: 'x' } },
        ),
      ).rejects.toMatchObject({ status: 409 });
      expect(await orders().findOne({ _id: 'o1' })).toEqual({
        _id: 'o1',
        version: 2,
        status: 'packed',
      });
    });

    it('SR-045: two changes from one version at once: exactly one goes through, the other is a 409', async () => {
      await orders().insertOne({ _id: 'o2', version: 1, status: 'packing' });

      const results = await Promise.allSettled(
        Array.from({ length: 10 }, (_, index) =>
          updateVersioned(
            orders(),
            { id: 'o2', version: 1 },
            { $set: { status: `s${String(index)}` } },
          ),
        ),
      );

      expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
      expect(await orders().findOne({ _id: 'o2' })).toMatchObject({ version: 2 });
    });

    it('SR-045: a conditional $inc keeps a limit, also inside a transaction', async () => {
      await limits().insertOne({ _id: 'day', used: 0 });
      const take = () =>
        updateIf(limits(), { _id: 'day', used: { $lt: 3 } }, { $inc: { used: 1 } });

      const taken = await Promise.all(Array.from({ length: 6 }, take));
      expect(taken.filter((found) => found !== null)).toHaveLength(3);

      await limits().insertOne({ _id: 'tx', used: 0 });
      const inside = await withTransaction(
        client,
        (session) => updateIf(limits(), { _id: 'tx' }, { $inc: { used: 1 } }, { session }),
        { clock: systemClock },
      );
      expect(inside).toEqual({ _id: 'tx', used: 1 });
      const versioned = await withTransaction(
        client,
        async (session) => {
          await orders().insertOne({ _id: 'o3', version: 1, status: 'new' }, { session });
          return updateVersioned(
            orders(),
            { id: 'o3', version: 1 },
            { $set: { status: 'paid' } },
            { session },
          );
        },
        { clock: systemClock },
      );
      expect(versioned).toEqual({ _id: 'o3', version: 2, status: 'paid' });
    });

    describe('findPage over 10^5 documents (CR-40)', () => {
      const total = 100_000;

      beforeAll(async () => {
        // Many documents share a rank, so the order needs the _id after it.
        const all = Array.from({ length: total }, (_, index) => ({
          _id: index,
          rank: index % 1_000,
        }));
        for (let start = 0; start < total; start += 10_000) {
          await items().insertMany(all.slice(start, start + 10_000), { ordered: false });
        }
      }, 120_000);

      it('SR-036: every document in the order of rank comes once, in both directions', async () => {
        for (const direction of [1, -1] as const) {
          const seen: number[] = [];
          let after: string | undefined;
          // 2,000 documents (ranks 0 and 1 only), 100 a page.
          const filter = { rank: { $lt: 2 } };
          do {
            const page = await findPage(items(), {
              filter,
              by: 'rank',
              direction,
              limit: 100,
              ...(after === undefined ? {} : { after }),
            });
            seen.push(...page.items.map((item) => item._id));
            after = page.next ?? undefined;
          } while (after !== undefined);

          expect(seen).toHaveLength(200);
          expect(new Set(seen).size).toBe(200);
          const expected = Array.from({ length: total }, (_, index) => index)
            .filter((index) => index % 1_000 < 2)
            .sort((a, b) => (a % 1_000) - (b % 1_000) || a - b);
          expect(seen).toEqual(direction === 1 ? expected : [...expected].reverse());
        }
      });

      it('CR-40: a page deep in the list reads only its own documents, never the ones before it', async () => {
        // The page after the 90,000th: what it examines on the server.
        const asked: { filter: Document; options: Document }[] = [];
        const watched = new Proxy(items(), {
          get(target, name, receiver) {
            if (name === 'find') {
              return (filter: Document, options: Document) => {
                asked.push({ filter, options });
                return target.find(filter, options);
              };
            }
            return Reflect.get(target, name, receiver) as unknown;
          },
        });
        const deep = await findPage(items(), {
          filter: { rank: { $gte: 900 } },
          by: 'rank',
          direction: 1,
          limit: 100,
        });
        await findPage(watched, {
          filter: {},
          by: 'rank',
          direction: 1,
          limit: 100,
          after: deep.next as string,
        });

        const query = asked[0] as { filter: Document; options: Document };
        const stats = (await items()
          .find(query.filter, { sort: query.options['sort'] as Document, limit: 101 })
          .explain('executionStats')) as { executionStats: { totalDocsExamined: number } };
        expect(stats.executionStats.totalDocsExamined).toBeLessThanOrEqual(101);
      });
    });
  },
);
