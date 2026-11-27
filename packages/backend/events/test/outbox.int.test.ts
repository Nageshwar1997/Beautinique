import {
  defineCollection,
  defineCollections,
  leasesCollection,
  queryPlanProblems,
  releaseSchema,
  withTransaction,
} from '@beautinique/backend-mongo';
import { ObjectId, type Db, type MongoClient } from 'mongodb';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { eventsCollections } from '../src/collections.ts';
import { createOutbox, OUTBOX_COLLECTION, type OutboxRecord } from '../src/outbox.ts';
import { aboutOrder, clockAt, orderConfirmed, orderPlaced } from './utils/fixtures.ts';
import { connectTest, integrationRuns, MONGO_PORT, testDatabase } from './utils/mongo.ts';

const runs = await integrationRuns('outbox.int.test.ts', [MONGO_PORT]);

const orders = defineCollection({
  name: 'orders',
  retention: 'book',
  indexes: [],
  expiry: { never: 'A test collection.' },
  accountDelete: { none: 'A test collection.' },
});

describe.skipIf(!runs)('the outbox on the real MongoDB (docs/ARCHITECTURE.md §3 rule 1)', () => {
  let client: MongoClient;
  let db: Db;
  const clock = clockAt();
  const outbox = createOutbox({
    service: 'commerce',
    subscriptions: { 'commerce.order.placed': ['payments', 'notify'] },
    clock,
  });

  beforeAll(async () => {
    ({ client } = await connectTest('outbox'));
    db = testDatabase(client, 'outbox');
    await releaseSchema(
      db,
      defineCollections('commerce', [...eventsCollections, leasesCollection, orders]),
      {
        clock,
        owner: 'test',
      },
    );
  });

  afterAll(async () => {
    await db.dropDatabase();
    await client.close();
  });

  it('AC-PLATFORM-2: a transaction that does not commit leaves neither the change nor its event', async () => {
    const orderId = new ObjectId();

    await expect(
      withTransaction(
        client,
        async (session) => {
          await db.collection('orders').insertOne({ _id: orderId, status: 'placed' }, { session });
          await outbox.append(db, session, orderPlaced, aboutOrder(orderId.toHexString(), 1));
          throw new TypeError('The stock was not there.');
        },
        { clock },
      ),
    ).rejects.toThrow('The stock was not there.');

    expect(await db.collection('orders').countDocuments({ _id: orderId })).toBe(0);
    expect(
      await db
        .collection(OUTBOX_COLLECTION)
        .countDocuments({ aggregateKey: `order:${orderId.toHexString()}` }),
    ).toBe(0);
  });

  it('AC-PLATFORM-2: a commit writes both, and the event has a pending delivery for each subscriber', async () => {
    const orderId = new ObjectId().toHexString();

    const envelope = await withTransaction(
      client,
      async (session) => {
        await db.collection('orders').insertOne({ orderId, status: 'placed' }, { session });
        return outbox.append(db, session, orderPlaced, aboutOrder(orderId, 1, { lines: 3 }));
      },
      { clock },
    );

    const record = await db
      .collection<OutboxRecord>(OUTBOX_COLLECTION)
      .findOne({ _id: ObjectId.createFromHexString(envelope.eventId) });
    expect(record).toMatchObject({
      type: 'commerce.order.placed',
      producer: 'commerce',
      aggregateKey: `order:${orderId}`,
      aggregateVersion: 1,
      occurredAt: clock.now(),
      pendingCount: 2,
      nextAttemptAt: clock.now(),
      doneAt: null,
    });
    expect(
      record?.deliveries.map((delivery) => [
        delivery.subscriber,
        delivery.status,
        delivery.attempts,
      ]),
    ).toEqual([
      ['payments', 'pending', 0],
      ['notify', 'pending', 0],
    ]);
    // The payload is the checked envelope, byte for byte what each subscriber gets.
    expect(JSON.parse(record?.payload ?? '')).toEqual(envelope);
    expect(envelope).toMatchObject({
      type: 'commerce.order.placed',
      version: 1,
      producer: 'commerce',
      occurredAt: clock.now().toISOString(),
      data: { orderId, lines: 3 },
    });
    expect(envelope.eventId).toMatch(/^[0-9a-f]{24}$/);
  });

  it('AC-PLATFORM-2: an event no one takes is done at once, so it goes with the TTL', async () => {
    const envelope = await withTransaction(
      client,
      (session) =>
        outbox.append(db, session, orderConfirmed, {
          ...aboutOrder('B', 2),
          data: { orderId: 'B' },
        }),
      { clock },
    );
    const record = await db
      .collection<OutboxRecord>(OUTBOX_COLLECTION)
      .findOne({ _id: ObjectId.createFromHexString(envelope.eventId) });
    expect(record).toMatchObject({
      deliveries: [],
      pendingCount: 0,
      nextAttemptAt: null,
      doneAt: clock.now(),
    });
  });

  it("RT-24: the dispatcher's queries use their indexes, on a big outbox (CR-40)", async () => {
    const now = clock.now();
    const many = Array.from({ length: 10_000 }, (_, index) => ({
      _id: new ObjectId(),
      type: 'commerce.order.placed',
      producer: 'commerce' as const,
      aggregateKey: `order:big-${String(index % 500)}`,
      aggregateVersion: index,
      occurredAt: now,
      payload: '{}',
      deliveries: [],
      pendingCount: index % 3,
      nextAttemptAt: index % 3 === 0 ? null : now,
      doneAt: index % 3 === 0 ? now : null,
    }));
    await db.collection(OUTBOX_COLLECTION).insertMany(many);
    const outboxOf = db.collection(OUTBOX_COLLECTION);

    expect(
      await queryPlanProblems(outboxOf, {
        name: 'due events',
        filter: { pendingCount: { $gt: 0 }, nextAttemptAt: { $lte: now } },
        sort: { nextAttemptAt: 1, _id: 1 },
        limit: 100,
      }),
    ).toEqual([]);
    expect(
      await queryPlanProblems(outboxOf, {
        name: 'heads of aggregates',
        filter: { aggregateKey: { $in: ['order:big-1', 'order:big-2'] }, doneAt: null },
        sort: { aggregateKey: 1, aggregateVersion: 1, _id: 1 },
      }),
    ).toEqual([]);
  });
});
