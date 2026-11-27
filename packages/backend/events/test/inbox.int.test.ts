import {
  defineCollection,
  defineCollections,
  leasesCollection,
  releaseSchema,
  withTransaction,
} from '@beautinique/backend-mongo';
import type { Db, MongoClient } from 'mongodb';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { eventsCollections } from '../src/collections.ts';
import {
  createInbox,
  DEAD_LETTERS_COLLECTION,
  onEvent,
  PROCESSED_EVENTS_COLLECTION,
  type DeadLetterRecord,
  type DeliveryRequest,
} from '../src/inbox.ts';
import { createOutbox, OUTBOX_COLLECTION, type OutboxRecord } from '../src/outbox.ts';
import {
  aboutOrder,
  clockAt,
  newId,
  orderConfirmed,
  orderPlaced,
  recordingAlert,
  recordingLogger,
} from './utils/fixtures.ts';
import {
  connectTest,
  failCommands,
  failPoint,
  failPointOff,
  integrationRuns,
  MONGO_PORT,
  testDatabase,
} from './utils/mongo.ts';

const runs = await integrationRuns('inbox.int.test.ts', [MONGO_PORT]);

const effects = defineCollection({
  name: 'payment_orders',
  retention: 'book',
  indexes: [],
  expiry: { never: 'A test collection.' },
  accountDelete: { none: 'A test collection.' },
});

describe.skipIf(!runs)(
  'the inbox on the real MongoDB (docs/ARCHITECTURE.md §3 rules 4 and 6)',
  () => {
    let client: MongoClient;
    let appName: string;
    let producerClient: MongoClient;
    let db: Db;
    let producerDb: Db;
    const clock = clockAt();
    const logger = recordingLogger();
    const alert = recordingAlert();
    let failing: Error | undefined;

    const outbox = createOutbox({
      service: 'commerce',
      subscriptions: { 'commerce.order.placed': ['payments'] },
      clock,
    });
    const inbox = () =>
      createInbox({
        subscriber: 'payments',
        client,
        db,
        clock,
        logger,
        alert,
        handlers: [
          onEvent(orderPlaced, async (event, { db: own, session }) => {
            await own
              .collection<{ _id: string; seen: number }>('payment_orders')
              .updateOne(
                { _id: event.data.orderId },
                { $inc: { seen: 1 } },
                { upsert: true, session },
              );
            if (failing !== undefined) throw failing;
          }),
        ],
      });

    // An event as the producer wrote it, and a try of it.
    async function written(orderId = newId()): Promise<{ orderId: string; payload: string }> {
      const envelope = await withTransaction(
        producerClient,
        (session) => outbox.append(producerDb, session, orderPlaced, aboutOrder(orderId, 1)),
        { clock },
      );
      const record = await producerDb
        .collection<OutboxRecord>(OUTBOX_COLLECTION)
        .findOne({ type: 'commerce.order.placed', aggregateKey: `order:${orderId}` });
      expect(JSON.parse(record?.payload ?? '')).toEqual(envelope);
      return { orderId, payload: record?.payload ?? '' };
    }
    const attempt = (payload: string, number = 1): DeliveryRequest => ({
      subscriber: 'payments',
      payload,
      attempt: number,
      maxAttempts: 8,
    });
    const seen = async (orderId: string) =>
      (
        await db
          .collection<{ _id: string; seen: number }>('payment_orders')
          .findOne({ _id: orderId })
      )?.seen ?? 0;

    beforeAll(async () => {
      ({ client, appName } = await connectTest('inbox'));
      ({ client: producerClient } = await connectTest('inbox-producer'));
      db = testDatabase(client, 'inbox');
      producerDb = testDatabase(producerClient, 'inbox_producer');
      const plan = defineCollections('payments', [...eventsCollections, leasesCollection, effects]);
      await releaseSchema(db, plan, { clock, owner: 'test' });
      await releaseSchema(
        producerDb,
        defineCollections('commerce', [...eventsCollections, leasesCollection]),
        {
          clock,
          owner: 'test',
        },
      );
    });

    afterEach(async () => {
      failing = undefined;
      await failPointOff(client);
    });

    afterAll(async () => {
      await db.dropDatabase();
      await producerDb.dropDatabase();
      await client.close();
      await producerClient.close();
    });

    it('AC-PLATFORM-3: the same event 3 times: the effect once and one processed_events record', async () => {
      const { orderId, payload } = await written();
      const taking = inbox();

      const answers = [];
      for (let time = 1; time <= 3; time += 1)
        answers.push(await taking.receive(attempt(payload, time)));

      expect(answers).toEqual(['delivered', 'delivered', 'delivered']);
      expect(await seen(orderId)).toBe(1);
      const eventId = (JSON.parse(payload) as { eventId: string }).eventId;
      expect(await db.collection(PROCESSED_EVENTS_COLLECTION).find({ eventId }).toArray()).toEqual([
        {
          _id: `${eventId}:payments`,
          eventId,
          subscriber: 'payments',
          type: 'commerce.order.placed',
          processedAt: clock.now(),
        },
      ]);
    });

    it('AC-PLATFORM-3: the same event 3 times at once (a redelivery while the first runs): the effect once', async () => {
      const { orderId, payload } = await written();
      const taking = inbox();

      const answers = await Promise.all(
        [1, 2, 3].map((time) => taking.receive(attempt(payload, time))),
      );

      expect(answers).toEqual(['delivered', 'delivered', 'delivered']);
      expect(await seen(orderId)).toBe(1);
      const eventId = (JSON.parse(payload) as { eventId: string }).eventId;
      expect(await db.collection(PROCESSED_EVENTS_COLLECTION).countDocuments({ eventId })).toBe(1);
    });

    it('AC-PLATFORM-5: the handler\'s own error is "failed": nothing of it stays, and it is tried again', async () => {
      const { orderId, payload } = await written();
      failing = new TypeError('The order is not in the copy yet.');

      expect(await inbox().receive(attempt(payload, 1))).toBe('failed');
      expect(await seen(orderId)).toBe(0);
      const eventId = (JSON.parse(payload) as { eventId: string }).eventId;
      expect(await db.collection(PROCESSED_EVENTS_COLLECTION).countDocuments({ eventId })).toBe(0);
      expect(await db.collection(DEAD_LETTERS_COLLECTION).countDocuments({ eventId })).toBe(0);
      expect(logger.lines.at(-1)?.message).toBe('A handler failed on an event.');

      failing = undefined;
      expect(await inbox().receive(attempt(payload, 2))).toBe('delivered');
      expect(await seen(orderId)).toBe(1);
    });

    it("AC-PLATFORM-5: on the last try the handler's error is a dead letter and an ops alert; taken later, it is dealt with", async () => {
      const { orderId, payload } = await written();
      const eventId = (JSON.parse(payload) as { eventId: string }).eventId;
      failing = new TypeError('The order is gone, mail a@b.co about it.');
      const alerts = alert.raised.length;

      expect(await inbox().receive(attempt(payload, 8))).toBe('dead');

      const letter = await db
        .collection<DeadLetterRecord>(DEAD_LETTERS_COLLECTION)
        .findOne({ eventId });
      expect(letter).toMatchObject({
        _id: `${eventId}:payments`,
        subscriber: 'payments',
        type: 'commerce.order.placed',
        producer: 'commerce',
        payload,
        attempts: 8,
        failedAt: clock.now(),
        resolvedAt: null,
        error: { type: 'TypeError' },
      });
      // The message is kept short and with its patterns masked (SR-077).
      expect(letter?.error.message).not.toContain('a@b.co');
      expect(alert.raised.slice(alerts)).toEqual([
        {
          kind: 'events.deadLetter',
          severity: 2,
          service: 'payments',
          message: 'payments could not take commerce.order.placed after 8 tries.',
          details: { eventId, type: 'commerce.order.placed', subscriber: 'payments' },
        },
      ]);

      // Tried again from the Master app: taken, and its dead letter is dealt with in that transaction.
      failing = undefined;
      clock.advance(60_000);
      expect(await inbox().receive(attempt(payload, 1))).toBe('delivered');
      expect(await seen(orderId)).toBe(1);
      expect(
        (await db.collection<DeadLetterRecord>(DEAD_LETTERS_COLLECTION).findOne({ eventId }))
          ?.resolvedAt,
      ).toEqual(clock.now());
    });

    it('AC-PLATFORM-5: a database out of reach is "unavailable", even on the last try: no dead letter, no count', async () => {
      const { orderId, payload } = await written();
      const eventId = (JSON.parse(payload) as { eventId: string }).eventId;
      // The subscriber's database runs out of time (as Neon or a cluster that stopped).
      await failCommands(client, appName, 50, {
        failCommands: ['find', 'insert', 'update'],
        errorCode: 50,
      });

      expect(await inbox().receive(attempt(payload, 8))).toBe('unavailable');

      await failPointOff(client);
      expect(await seen(orderId)).toBe(0);
      expect(await db.collection(DEAD_LETTERS_COLLECTION).countDocuments({ eventId })).toBe(0);
    });

    it('AC-PLATFORM-5: a dead letter that cannot be written is "unavailable", so the last try is not lost', async () => {
      const { payload } = await written();
      const eventId = (JSON.parse(payload) as { eventId: string }).eventId;
      failing = new TypeError('A bug.');
      // The first update is the handler's own, in its transaction; every one after it (the dead
      // letter's) finds the database out of time.
      await failPoint(client, appName, { skip: 1 }, { failCommands: ['update'], errorCode: 50 });

      expect(await inbox().receive(attempt(payload, 8))).toBe('unavailable');

      await failPointOff(client);
      expect(await db.collection(DEAD_LETTERS_COLLECTION).countDocuments({ eventId })).toBe(0);
    });

    it('AC-PLATFORM-5: a dead letter that cannot be written for another reason is an error, not a delivery', async () => {
      const { payload } = await written();
      failing = new TypeError('A bug.');
      // The dead letter's update is refused outright (a bad value), not for being down.
      await failPoint(client, appName, { skip: 1 }, { failCommands: ['update'], errorCode: 2 });

      await expect(inbox().receive(attempt(payload, 8))).rejects.toThrow();
      await failPointOff(client);
    });

    it('AC-PLATFORM-5: an alert that cannot be raised is logged; the dead letter stays', async () => {
      const { payload } = await written();
      const eventId = (JSON.parse(payload) as { eventId: string }).eventId;
      failing = new TypeError('A bug.');
      const taking = createInbox({
        subscriber: 'payments',
        client,
        db,
        clock,
        logger,
        alert: () => Promise.reject(new Error('The push service is down.')),
        handlers: [onEvent(orderPlaced, () => Promise.reject(new TypeError('A bug.')))],
      });

      expect(await taking.receive(attempt(payload, 8))).toBe('dead');
      expect(await db.collection(DEAD_LETTERS_COLLECTION).countDocuments({ eventId })).toBe(1);
      expect(logger.lines.at(-1)?.message).toBe('The alert of a dead letter could not be raised.');
    });

    it('AC-PLATFORM-3: an event that no handler takes, or that does not match its contract, is failed (dead on the last try)', async () => {
      const taking = inbox();
      const { payload } = await written();
      const other = JSON.stringify({ ...JSON.parse(payload), type: 'commerce.order.confirmed' });

      expect(await taking.receive(attempt(other, 1))).toBe('failed');
      expect(await taking.receive(attempt('not json', 1))).toBe('failed');
      expect(await taking.receive(attempt('{"type":1}', 1))).toBe('failed');
      expect(await taking.receive(attempt('"text"', 1))).toBe('failed');

      const broken = JSON.stringify({ ...JSON.parse(payload), data: { orderId: 7 } });
      expect(await taking.receive(attempt(broken, 1))).toBe('failed');
      expect(await taking.receive(attempt(broken, 8))).toBe('dead');
      const eventId = (JSON.parse(payload) as { eventId: string }).eventId;
      expect(
        (await db.collection<DeadLetterRecord>(DEAD_LETTERS_COLLECTION).findOne({ eventId }))?.error
          .type,
      ).toBe('ZodError');
    });

    it('SR-071: two handlers of one event and version are refused at boot; a wrong subscriber name too', () => {
      const handle = () => Promise.resolve();
      expect(() =>
        createInbox({
          subscriber: 'payments',
          client,
          db,
          clock,
          logger,
          alert,
          handlers: [onEvent(orderPlaced, handle), onEvent(orderPlaced, handle)],
        }),
      ).toThrow('payments has two handlers of commerce.order.placed@1.');
      expect(() =>
        createInbox({ subscriber: 'shop', client, db, clock, logger, alert, handlers: [] }),
      ).toThrow(RangeError);
      const taking = createInbox({
        subscriber: 'payments',
        client,
        db,
        clock,
        logger,
        alert,
        handlers: [onEvent(orderPlaced, handle), onEvent(orderConfirmed, handle)],
      });
      expect([...taking.takes].sort()).toEqual([
        'commerce.order.confirmed@1',
        'commerce.order.placed@1',
      ]);
    });
  },
);
