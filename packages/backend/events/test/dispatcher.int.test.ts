import {
  acquireLease,
  defineCollection,
  defineCollections,
  leasesCollection,
  releaseSchema,
  withTransaction,
} from '@beautinique/backend-mongo';
import { ObjectId, type Db, type MongoClient } from 'mongodb';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { eventsCollections } from '../src/collections.ts';
import { inProcessDelivery } from '../src/delivery.ts';
import {
  BLOCKED_RECHECK_MS,
  createDispatcher,
  DISPATCHER_LEASE,
  DISPATCHER_LEASE_MS,
} from '../src/dispatcher.ts';
import {
  createInbox,
  DEAD_LETTERS_COLLECTION,
  onEvent,
  type DeadLetterRecord,
} from '../src/inbox.ts';
import {
  createOutbox,
  OUTBOX_COLLECTION,
  retryDeadDelivery,
  type OutboxRecord,
} from '../src/outbox.ts';
import { MAX_ATTEMPTS, retryDelay, UNAVAILABLE_RETRY_MS } from '../src/retry.ts';
import {
  aboutOrder,
  clockAt,
  newId,
  orderPlaced,
  recordingAlert,
  recordingLogger,
} from './utils/fixtures.ts';
import {
  connectTest,
  failCommands,
  failPointOff,
  integrationRuns,
  MONGO_PORT,
  testDatabase,
} from './utils/mongo.ts';

const runs = await integrationRuns('dispatcher.int.test.ts', [MONGO_PORT]);

const seenLog = defineCollection({
  name: 'seen',
  retention: 'tech',
  indexes: [],
  expiry: { never: 'A test collection.' },
  accountDelete: { none: 'A test collection.' },
});

const SUBSCRIPTIONS = { 'commerce.order.placed': ['payments', 'notify'] };

describe.skipIf(!runs)(
  'the dispatcher on the real MongoDB (docs/ARCHITECTURE.md §3 rules 2 to 6)',
  () => {
    let producer: { client: MongoClient; appName: string };
    let consumer: { client: MongoClient; appName: string };
    let commerce: Db;
    let payments: Db;
    let notify: Db;
    const clock = clockAt();
    const logger = recordingLogger();
    const alert = recordingAlert();
    // The orders whose events the payments handler fails on, for now.
    const failingOrders = new Set<string>();
    // What happens while the payments handler runs (a test's way to move time in a pass).
    let whileHandling: (() => Promise<void>) | undefined;
    const outbox = createOutbox({ service: 'commerce', subscriptions: SUBSCRIPTIONS, clock });

    // Each subscriber writes, in its transaction, the order it took the events in.
    const handlerOf = (subscriber: 'payments' | 'notify') =>
      onEvent(orderPlaced, async (event, { db, session }) => {
        if (subscriber === 'payments') await whileHandling?.();
        if (subscriber === 'payments' && failingOrders.has(event.data.orderId)) {
          throw new TypeError(`The order ${event.data.orderId} is not in the copy yet.`);
        }
        await db
          .collection<{ _id: string; events: string[] }>('seen')
          .updateOne(
            { _id: event.data.orderId },
            { $push: { events: event.eventId } },
            { upsert: true, session },
          );
      });
    const transport = () =>
      inProcessDelivery([
        createInbox({
          subscriber: 'payments',
          client: consumer.client,
          db: payments,
          clock,
          logger,
          alert,
          handlers: [handlerOf('payments')],
        }),
        createInbox({
          subscriber: 'notify',
          client: consumer.client,
          db: notify,
          clock,
          logger,
          alert,
          handlers: [handlerOf('notify')],
        }),
      ]);
    const dispatcher = (owner = 'instance-a', batchSize?: number) =>
      createDispatcher({
        db: commerce,
        clock,
        owner,
        subscriptions: SUBSCRIPTIONS,
        transport: transport(),
        logger,
        ...(batchSize === undefined ? {} : { batchSize }),
      });

    async function place(orderId: string, version: number): Promise<string> {
      const envelope = await withTransaction(
        producer.client,
        (session) => outbox.append(commerce, session, orderPlaced, aboutOrder(orderId, version)),
        { clock },
      );
      return envelope.eventId;
    }
    const seenBy = async (db: Db, orderId: string): Promise<string[]> =>
      (await db.collection<{ _id: string; events: string[] }>('seen').findOne({ _id: orderId }))
        ?.events ?? [];
    const deliveryOf = async (eventId: string, subscriber: string) =>
      (
        await commerce
          .collection<OutboxRecord>(OUTBOX_COLLECTION)
          .findOne({ _id: ObjectId.createFromHexString(eventId) })
      )?.deliveries.find((delivery) => delivery.subscriber === subscriber);
    const recordOf = (eventId: string) =>
      commerce
        .collection<OutboxRecord>(OUTBOX_COLLECTION)
        .findOne({ _id: ObjectId.createFromHexString(eventId) });

    beforeAll(async () => {
      producer = await connectTest('dispatcher-commerce');
      consumer = await connectTest('dispatcher-consumer');
      commerce = testDatabase(producer.client, 'dispatch_commerce');
      payments = testDatabase(consumer.client, 'dispatch_payments');
      notify = testDatabase(consumer.client, 'dispatch_notify');
      const options = { clock, owner: 'test' };
      await releaseSchema(
        commerce,
        defineCollections('commerce', [...eventsCollections, leasesCollection]),
        options,
      );
      await releaseSchema(
        payments,
        defineCollections('payments', [...eventsCollections, leasesCollection, seenLog]),
        options,
      );
      await releaseSchema(
        notify,
        defineCollections('notify', [...eventsCollections, leasesCollection, seenLog]),
        options,
      );
    });

    beforeEach(async () => {
      // Each test from an empty outbox and no lease, and a minute later than the last.
      await commerce.collection(OUTBOX_COLLECTION).deleteMany({});
      await commerce.collection('leases').deleteMany({});
      clock.advance(DISPATCHER_LEASE_MS * 2);
    });

    afterEach(async () => {
      failingOrders.clear();
      whileHandling = undefined;
      await failPointOff(consumer.client);
    });

    afterAll(async () => {
      await Promise.all([commerce.dropDatabase(), payments.dropDatabase(), notify.dropDatabase()]);
      await producer.client.close();
      await consumer.client.close();
    });

    it('AC-PLATFORM-4: a failed event holds up only the later events of its order for that subscriber; others go on', async () => {
      const orderA = newId();
      const orderB = newId();
      const a1 = await place(orderA, 1);
      const a2 = await place(orderA, 2);
      const b1 = await place(orderB, 1);
      failingOrders.add(orderA);
      const one = dispatcher();

      const first = await one.pass();

      expect(first).toMatchObject({ held: true, failed: 1, heldUp: 1 });
      expect(await seenBy(payments, orderA)).toEqual([]);
      expect(await seenBy(payments, orderB)).toEqual([b1]);
      // The other subscriber of the same order is not held up.
      expect(await seenBy(notify, orderA)).toEqual([a1, a2]);
      expect(await deliveryOf(a1, 'payments')).toMatchObject({
        status: 'pending',
        attempts: 1,
        lastError: 'The subscriber failed.',
      });
      const heldUp = await deliveryOf(a2, 'payments');
      expect(heldUp).toMatchObject({ status: 'pending', attempts: 0 });
      expect(heldUp?.nextAttemptAt?.getTime()).toBeGreaterThanOrEqual(
        clock.now().getTime() + retryDelay(1),
      );

      // Not due yet: nothing goes, nothing jumps the queue.
      expect(await one.pass()).toMatchObject({ delivered: 0, failed: 0 });
      expect(await seenBy(payments, orderA)).toEqual([]);

      // The cause is mended; at its next try the first goes, and then the second, in order.
      failingOrders.clear();
      clock.advance(retryDelay(1));
      expect(await one.pass()).toMatchObject({ delivered: 2 });
      expect(await seenBy(payments, orderA)).toEqual([a1, a2]);
      expect(await recordOf(a2)).toMatchObject({
        pendingCount: 0,
        nextAttemptAt: null,
        doneAt: clock.now(),
      });
    });

    it("AC-PLATFORM-5: the handler's own error, 8 tries with a longer wait each, then dead: a dead letter and an ops alert", async () => {
      const order = newId();
      const first = await place(order, 1);
      const later = await place(order, 2);
      failingOrders.add(order);
      const one = dispatcher();
      const alerts = alert.raised.length;

      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
        const result = await one.pass();
        expect(result[attempt === MAX_ATTEMPTS ? 'dead' : 'failed']).toBe(1);
        const delivery = await deliveryOf(first, 'payments');
        expect(delivery?.attempts).toBe(attempt);
        if (attempt < MAX_ATTEMPTS) {
          expect(delivery?.nextAttemptAt).toEqual(
            new Date(clock.now().getTime() + retryDelay(attempt)),
          );
          // Not before its time.
          clock.advance(retryDelay(attempt) - 1);
          expect((await one.pass()).failed).toBe(0);
          clock.advance(1);
        }
      }

      expect(await deliveryOf(first, 'payments')).toMatchObject({
        status: 'dead',
        attempts: 8,
        nextAttemptAt: null,
      });
      expect(await recordOf(first)).toMatchObject({
        pendingCount: 0,
        nextAttemptAt: null,
        doneAt: null,
      });
      const letter = await payments
        .collection<DeadLetterRecord>(DEAD_LETTERS_COLLECTION)
        .findOne({ eventId: first });
      expect(letter).toMatchObject({ subscriber: 'payments', attempts: 8, resolvedAt: null });
      expect(alert.raised.slice(alerts).map((raised) => raised.kind)).toEqual([
        'events.deadLetter',
      ]);
      // The later event of the order waits for the dead one, and is looked at again after a while.
      const waiting = await deliveryOf(later, 'payments');
      expect(waiting).toMatchObject({ status: 'pending', attempts: 0 });
      expect(waiting?.nextAttemptAt?.getTime()).toBe(clock.now().getTime() + BLOCKED_RECHECK_MS);
      clock.advance(BLOCKED_RECHECK_MS);
      expect(await one.pass()).toMatchObject({ delivered: 0, heldUp: 1 });
      expect(await seenBy(payments, order)).toEqual([]);

      // Tried again from the Master app, once mended: both go, in order, and the dead letter is dealt with.
      failingOrders.clear();
      expect(
        await retryDeadDelivery(commerce, {
          eventId: first,
          subscriber: 'payments',
          now: clock.now(),
        }),
      ).toBe(true);
      expect(
        await retryDeadDelivery(commerce, {
          eventId: first,
          subscriber: 'payments',
          now: clock.now(),
        }),
      ).toBe(false);
      expect(await one.pass()).toMatchObject({ delivered: 2 });
      expect(await seenBy(payments, order)).toEqual([first, later]);
      expect(
        (
          await payments
            .collection<DeadLetterRecord>(DEAD_LETTERS_COLLECTION)
            .findOne({ eventId: first })
        )?.resolvedAt,
      ).toEqual(clock.now());
    });

    it('AC-PLATFORM-5: a subscriber whose database is down is tried again, and the count does not go up', async () => {
      const order = newId();
      const event = await place(order, 1);
      const one = dispatcher();
      // The subscriber's database runs out of time on every command (as Neon that stopped).
      await failCommands(consumer.client, consumer.appName, 1_000, {
        failCommands: ['find', 'insert', 'update'],
        errorCode: 50,
      });

      for (let time = 0; time < 3; time += 1) {
        expect(await one.pass()).toMatchObject({ unavailable: 2 });
        const delivery = await deliveryOf(event, 'payments');
        expect(delivery).toMatchObject({ status: 'pending', attempts: 0 });
        expect(delivery?.nextAttemptAt).toEqual(
          new Date(clock.now().getTime() + UNAVAILABLE_RETRY_MS),
        );
        clock.advance(UNAVAILABLE_RETRY_MS);
      }

      await failPointOff(consumer.client);
      expect(await one.pass()).toMatchObject({ delivered: 2 });
      expect(await deliveryOf(event, 'payments')).toMatchObject({
        status: 'delivered',
        attempts: 1,
      });
    });

    it('AC-PLATFORM-6: of two instances only the lease holder dispatches; after its lease another takes over', async () => {
      const event = await place(newId(), 1);
      const a = dispatcher('instance-a');
      const b = dispatcher('instance-b');
      expect(
        await acquireLease(commerce, {
          name: DISPATCHER_LEASE,
          owner: 'instance-a',
          now: clock.now(),
          ttlMs: DISPATCHER_LEASE_MS,
        }),
      ).toBe(true);

      expect(await b.pass()).toMatchObject({ held: false, delivered: 0 });
      expect((await deliveryOf(event, 'payments'))?.status).toBe('pending');
      expect(await a.pass()).toMatchObject({ held: true, delivered: 2 });

      await place(newId(), 1);
      clock.advance(DISPATCHER_LEASE_MS);
      expect(await b.pass()).toMatchObject({ held: true, delivered: 2 });
      expect(await a.pass()).toMatchObject({ held: false });
    });

    it("AC-PLATFORM-3: two instances in a lease's handover at once: every event goes, each effect once", async () => {
      const orders = Array.from({ length: 10 }, () => newId());
      const events = [];
      for (const order of orders) events.push(await place(order, 1));
      const a = dispatcher('instance-a');
      const b = dispatcher('instance-b');
      // Both believe they hold it: a lease that ran out while a pass went on.
      await commerce.collection('leases').deleteMany({});
      await Promise.all([
        a.pass(),
        (async () => {
          await commerce.collection('leases').deleteMany({});
          return b.pass();
        })(),
      ]);
      // Whatever is left goes on the next pass.
      clock.advance(DISPATCHER_LEASE_MS);
      await a.pass();

      for (const order of orders) {
        expect((await seenBy(payments, order)).length).toBe(1);
        expect((await seenBy(notify, order)).length).toBe(1);
      }
      expect(
        await commerce.collection(OUTBOX_COLLECTION).countDocuments({ pendingCount: { $gt: 0 } }),
      ).toBe(0);
    });

    it('AC-PLATFORM-4: a pass takes only its batch, the soonest first, and the next pass the rest', async () => {
      const orders = Array.from({ length: 5 }, () => newId());
      for (const order of orders) await place(order, 1);
      const small = dispatcher('instance-a', 2);

      expect(await small.pass()).toMatchObject({ delivered: 4 });
      expect(await seenBy(payments, orders[0] as string)).toHaveLength(1);
      expect(await seenBy(payments, orders[4] as string)).toHaveLength(0);
      expect(await small.pass()).toMatchObject({ delivered: 4 });
      expect(await small.pass()).toMatchObject({ delivered: 2 });
      expect(await small.pass()).toMatchObject({ delivered: 0 });
    });

    it('AC-PLATFORM-2: started, it dispatches at once; a nudge after a commit sends the event without the poll', async () => {
      const one = createDispatcher({
        db: commerce,
        clock,
        owner: 'instance-loop',
        subscriptions: SUBSCRIPTIONS,
        transport: transport(),
        logger,
        // A poll far off: only the nudge can send it in time.
        pollMs: 60 * 60_000,
      });
      const order = newId();
      await place(order, 1);
      one.start();
      one.start();
      await vi.waitFor(
        async () => {
          expect(await seenBy(payments, order)).toHaveLength(1);
        },
        { timeout: 10_000 },
      );

      const next = newId();
      await place(next, 1);
      one.nudge();
      await vi.waitFor(
        async () => {
          expect(await seenBy(payments, next)).toHaveLength(1);
        },
        { timeout: 10_000 },
      );
      await one.stop();
      await one.stop();
      // Stopped, it gave its lease up: another instance takes it at once.
      expect(
        await acquireLease(commerce, {
          name: DISPATCHER_LEASE,
          owner: 'instance-b',
          now: clock.now(),
          ttlMs: 1_000,
        }),
      ).toBe(true);
    });

    it('SR-071: a subscriber with no way in is refused at boot; a transport that throws is "down"', async () => {
      expect(() =>
        createDispatcher({
          db: commerce,
          clock,
          owner: 'x',
          subscriptions: { 'commerce.order.placed': ['finance'] },
          transport: transport(),
          logger,
        }),
      ).toThrow('The subscriber finance of commerce.order.placed has no way in (transport).');

      const event = await place(newId(), 1);
      const throwing = createDispatcher({
        db: commerce,
        clock,
        owner: 'instance-a',
        subscriptions: SUBSCRIPTIONS,
        transport: {
          subscribers: new Set(['payments', 'notify']),
          deliver: () => Promise.reject(new Error('boom')),
        },
        logger,
      });
      expect(await throwing.pass()).toMatchObject({ unavailable: 2 });
      expect(await deliveryOf(event, 'payments')).toMatchObject({ status: 'pending', attempts: 0 });
    });

    it('AC-PLATFORM-6: a pass that ran past its lease and lost it to another instance stops', async () => {
      const first = newId();
      const second = newId();
      await place(first, 1);
      await place(second, 1);
      const one = dispatcher('instance-a');
      // The first delivery takes longer than the lease, and instance b takes the lease meanwhile.
      whileHandling = async () => {
        whileHandling = undefined;
        clock.advance(DISPATCHER_LEASE_MS + 1);
        await acquireLease(commerce, {
          name: DISPATCHER_LEASE,
          owner: 'instance-b',
          now: clock.now(),
          ttlMs: DISPATCHER_LEASE_MS,
        });
      };

      const result = await one.pass();

      // It finished the delivery it was in, and took no other.
      expect(result.delivered).toBe(1);
      expect((await seenBy(payments, first)).length + (await seenBy(payments, second)).length).toBe(
        1,
      );
    });

    it('AC-PLATFORM-6: a pass that fails is told, and the loop goes on', async () => {
      const { client: closed } = await connectTest('dispatcher-closed');
      await closed.close();
      const broken = createDispatcher({
        db: closed.db('closed'),
        clock,
        owner: 'instance-closed',
        subscriptions: {},
        transport: transport(),
        logger,
        pollMs: 60 * 60_000,
      });
      const before = logger.lines.length;

      broken.start();
      await vi.waitFor(
        () => {
          expect(logger.lines.slice(before).map((line) => line.message)).toContain(
            'A pass of the dispatcher failed.',
          );
        },
        { timeout: 10_000 },
      );
      await broken.stop();
    });
  },
);
