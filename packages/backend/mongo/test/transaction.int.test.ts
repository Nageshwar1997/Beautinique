import { createFakeClock, systemClock } from '@beautinique/shared-clock';
import type { ClientSession, Db, MongoClient } from 'mongodb';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { withTransaction } from '../src/transaction.ts';
import {
  connectTest,
  failCommands,
  failPointOff,
  integrationRuns,
  testDatabase,
} from './utils/mongo.ts';

const runs = await integrationRuns('transaction.int.test.ts');

interface Counter {
  _id: string;
  count: number;
}

describe.skipIf(!runs)('withTransaction on the real MongoDB (AC-PLATFORM-1)', () => {
  let client: MongoClient;
  let appName: string;
  let db: Db;
  const counters = () => db.collection<Counter>('counters');
  const logs = () => db.collection<{ _id: string }>('logs');

  beforeAll(async () => {
    ({ client, appName } = await connectTest('tx'));
    db = testDatabase(client, 'tx');
    await db.createCollection('counters');
    await db.createCollection('logs');
  });

  afterEach(async () => {
    await failPointOff(client);
  });

  afterAll(async () => {
    await db.dropDatabase();
    await client.close();
  });

  // One placed order: a counter goes up and a log is written, in one transaction.
  const place = (id: string, runsOf: { n: number }) => async (session: ClientSession) => {
    runsOf.n += 1;
    await counters().updateOne({ _id: id }, { $inc: { count: 1 } }, { session, upsert: true });
    await logs().insertOne({ _id: `${id}:${String(runsOf.n)}` }, { session });
    return runsOf.n;
  };

  it('AC-PLATFORM-1: a transient error at the commit (a fail point) runs the whole work again, and it counts once', async () => {
    await failCommands(client, appName, 1, {
      failCommands: ['commitTransaction'],
      errorCode: 251,
      errorLabels: ['TransientTransactionError'],
    });
    const ran = { n: 0 };

    expect(await withTransaction(client, place('transient', ran), { clock: systemClock })).toBe(2);
    expect(ran.n).toBe(2);
    expect(await counters().findOne({ _id: 'transient' })).toEqual({ _id: 'transient', count: 1 });
    // The first try's log was never committed.
    expect(
      await logs()
        .find({ _id: /^transient:/ })
        .toArray(),
    ).toEqual([{ _id: 'transient:2' }]);
  });

  it('AC-PLATFORM-1: a commit whose result is not known (the connection closes) is only committed again', async () => {
    // Twice, so the driver's own retry of the commit fails too, and the helper's turn comes.
    await failCommands(client, appName, 2, {
      failCommands: ['commitTransaction'],
      closeConnection: true,
    });
    const ran = { n: 0 };

    expect(await withTransaction(client, place('unknown', ran), { clock: systemClock })).toBe(1);
    expect(ran.n).toBe(1);
    expect(await counters().findOne({ _id: 'unknown' })).toEqual({ _id: 'unknown', count: 1 });
  });

  it('AC-PLATFORM-1: two transactions on one document conflict, try again, and both count', async () => {
    await counters().insertOne({ _id: 'hot', count: 0 });
    const ran = { n: 0 };
    // Both read and write the same document; one of them meets a write conflict.
    const bump = (session: ClientSession) =>
      (async () => {
        ran.n += 1;
        const found = await counters().findOne({ _id: 'hot' }, { session });
        await counters().updateOne(
          { _id: 'hot' },
          { $set: { count: (found?.count ?? 0) + 1 } },
          { session },
        );
      })();

    await Promise.all(
      Array.from({ length: 5 }, () => withTransaction(client, bump, { clock: systemClock })),
    );

    expect(await counters().findOne({ _id: 'hot' })).toEqual({ _id: 'hot', count: 5 });
    expect(ran.n).toBeGreaterThan(5);
  });

  it('AC-PLATFORM-1: after the deadline it is a 503, and nothing of the work is left', async () => {
    await failCommands(client, appName, 50, {
      failCommands: ['commitTransaction'],
      errorCode: 251,
      errorLabels: ['TransientTransactionError'],
    });
    const clock = createFakeClock(new Date('2026-11-26T10:00:00.000Z'));
    const ran = { n: 0 };
    const slow = async (session: ClientSession) => {
      clock.advance(4_000);
      return place('late', ran)(session);
    };

    await expect(withTransaction(client, slow, { clock })).rejects.toMatchObject({
      status: 503,
      code: 'SERVICE_UNAVAILABLE',
    });
    expect(ran.n).toBe(3);
    expect(await counters().findOne({ _id: 'late' })).toBeNull();
  });

  it('AC-PLATFORM-2: a work that throws leaves nothing behind', async () => {
    const boom = new Error('stock is short');

    await expect(
      withTransaction(
        client,
        async (session) => {
          await counters().insertOne({ _id: 'rolled', count: 1 }, { session });
          throw boom;
        },
        { clock: systemClock },
      ),
    ).rejects.toBe(boom);
    expect(await counters().findOne({ _id: 'rolled' })).toBeNull();
  });
});
