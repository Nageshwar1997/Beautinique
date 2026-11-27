import {
  acquireLease,
  defineCollection,
  defineCollections,
  leasesCollection,
  queryPlanProblems,
  releaseSchema,
  withTransaction,
} from '@beautinique/backend-mongo';
import { serviceUnavailable } from '@beautinique/backend-server-kit';
import { ObjectId, type Db, type MongoClient } from 'mongodb';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { eventsCollections } from '../src/collections.ts';
import { MAX_ATTEMPTS, retryDelay, UNAVAILABLE_RETRY_MS } from '../src/retry.ts';
import { createTicker, TICKER_LEASE, TICKER_LEASE_MS, TIMER_BATCH_SIZE } from '../src/ticker.ts';
import {
  cancelTimer,
  dailyDueAt,
  dailyJob,
  onTimer,
  scheduleTimer,
  TIMERS_COLLECTION,
  type TimerHandler,
  type TimerRecord,
} from '../src/timers.ts';
import { clockAt, recordingAlert, recordingLogger } from './utils/fixtures.ts';
import { connectTest, integrationRuns, MONGO_PORT, testDatabase } from './utils/mongo.ts';

const runs = await integrationRuns('ticker.int.test.ts', [MONGO_PORT]);

const work = defineCollection({
  name: 'work',
  retention: 'tech',
  indexes: [],
  expiry: { never: 'A test collection.' },
  accountDelete: { none: 'A test collection.' },
});

const HOUR = 60 * 60_000;
const EXPIRE = 'commerce.reservation.expire';

describe.skipIf(!runs)(
  'timers and the ticker on the real MongoDB (docs/ARCHITECTURE.md §4)',
  () => {
    let client: MongoClient;
    let db: Db;
    const clock = clockAt();
    const logger = recordingLogger();
    const alert = recordingAlert();
    let failing: Error | undefined;

    // Each run of a timer counts one in `work`, in the timer's transaction.
    const expire = onTimer(EXPIRE, async (timer, { db: own, session }) => {
      if (failing !== undefined) throw failing;
      await own
        .collection<{ _id: string; runs: number }>('work')
        .updateOne({ _id: timer.ref }, { $inc: { runs: 1 } }, { upsert: true, session });
    });
    const days: string[] = [];
    const daily = dailyJob({
      kind: 'commerce.stats.daily',
      at: { hour: 2, minute: 0 },
      run: (day) => {
        if (failing !== undefined) return Promise.reject(failing);
        days.push(day);
        return Promise.resolve();
      },
    });
    const ticker = (owner = 'instance-a', handlers: readonly TimerHandler[] = [expire]) =>
      createTicker({ client, db, clock, owner, service: 'commerce', handlers, logger, alert });
    const runsOf = async (ref: string) =>
      (await db.collection<{ _id: string; runs: number }>('work').findOne({ _id: ref }))?.runs ?? 0;
    const timerOf = (kind: string, ref: string) =>
      db.collection<TimerRecord>(TIMERS_COLLECTION).findOne({ kind, ref });

    beforeAll(async () => {
      ({ client } = await connectTest('ticker'));
      db = testDatabase(client, 'ticker');
      await releaseSchema(
        db,
        defineCollections('commerce', [...eventsCollections, leasesCollection, work]),
        {
          clock,
          owner: 'test',
        },
      );
    });

    beforeEach(async () => {
      await db.collection(TIMERS_COLLECTION).deleteMany({});
      await db.collection('leases').deleteMany({});
      await db.collection('work').deleteMany({});
      days.length = 0;
      clock.advance(TICKER_LEASE_MS * 2);
    });

    afterEach(() => {
      failing = undefined;
    });

    afterAll(async () => {
      await db.dropDatabase();
      await client.close();
    });

    it('CR-19: a timer is set in the transaction of its change; set again it moves; cancelled it goes', async () => {
      const dueAt = new Date(clock.now().getTime() + HOUR);
      await withTransaction(
        client,
        (session) => scheduleTimer(db, { kind: EXPIRE, ref: 'r1', dueAt }, { session }),
        { clock },
      );
      await expect(
        withTransaction(
          client,
          async (session) => {
            await scheduleTimer(db, { kind: EXPIRE, ref: 'r2', dueAt }, { session });
            throw new TypeError('rolled back');
          },
          { clock },
        ),
      ).rejects.toThrow('rolled back');
      expect(await timerOf(EXPIRE, 'r2')).toBeNull();
      expect(await timerOf(EXPIRE, 'r1')).toMatchObject({
        status: 'pending',
        dueAt,
        runAt: dueAt,
        attempts: 0,
      });

      const later = new Date(dueAt.getTime() + HOUR);
      await scheduleTimer(db, { kind: EXPIRE, ref: 'r1', dueAt: later });
      expect(
        await db.collection(TIMERS_COLLECTION).countDocuments({ kind: EXPIRE, ref: 'r1' }),
      ).toBe(1);
      expect(await timerOf(EXPIRE, 'r1')).toMatchObject({ dueAt: later, runAt: later });

      // Set by two at once: still one.
      await Promise.all(
        [1, 2, 3, 4, 5].map(() => scheduleTimer(db, { kind: EXPIRE, ref: 'r3', dueAt })),
      );
      expect(
        await db.collection(TIMERS_COLLECTION).countDocuments({ kind: EXPIRE, ref: 'r3' }),
      ).toBe(1);

      expect(await cancelTimer(db, { kind: EXPIRE, ref: 'r1' })).toBe(true);
      expect(await cancelTimer(db, { kind: EXPIRE, ref: 'r1' })).toBe(false);
    });

    it('AC-PLATFORM-6: two instances tick at once (a deploy): every due timer runs once', async () => {
      const refs = Array.from({ length: 60 }, (_, index) => `res-${String(index)}`);
      for (const ref of refs) await scheduleTimer(db, { kind: EXPIRE, ref, dueAt: clock.now() });
      const a = ticker('instance-a');
      const b = ticker('instance-b');

      // Both believe they hold the lease (one ran out while a tick went on).
      const results = await Promise.all([
        a.tick(),
        (async () => {
          await db.collection('leases').deleteMany({});
          return b.tick();
        })(),
      ]);

      for (const ref of refs) expect(await runsOf(ref)).toBe(1);
      expect(results.reduce((sum, result) => sum + result.done, 0)).toBe(refs.length);
      expect(await db.collection(TIMERS_COLLECTION).countDocuments({ status: 'done' })).toBe(
        refs.length,
      );
    });

    it('AC-PLATFORM-6: only the lease holder ticks; after its lease another takes over', async () => {
      await scheduleTimer(db, { kind: EXPIRE, ref: 'one', dueAt: clock.now() });
      expect(
        await acquireLease(db, {
          name: TICKER_LEASE,
          owner: 'instance-a',
          now: clock.now(),
          ttlMs: TICKER_LEASE_MS,
        }),
      ).toBe(true);

      expect(await ticker('instance-b').tick()).toMatchObject({ held: false, done: 0 });
      clock.advance(TICKER_LEASE_MS);
      expect(await ticker('instance-b').tick()).toMatchObject({ held: true, done: 1 });
    });

    it('AC-PLATFORM-6: the process was down 11 hours: at boot every due timer is caught, the soonest first, and none that is not due', async () => {
      const start = clock.now().getTime();
      const order: string[] = [];
      const recording = onTimer(EXPIRE, (timer) => {
        order.push(timer.ref);
        return Promise.resolve();
      });
      // One every 10 minutes over the 11 hours: more than one batch.
      const due = Array.from({ length: 66 }, (_, index) => ({
        ref: `due-${String(index).padStart(3, '0')}`,
        at: start + index * 10 * 60_000,
      }));
      for (const { ref, at } of [...due].reverse())
        await scheduleTimer(db, { kind: EXPIRE, ref, dueAt: new Date(at) });
      await scheduleTimer(db, {
        kind: EXPIRE,
        ref: 'tomorrow',
        dueAt: new Date(start + 24 * HOUR),
      });
      expect(due.length).toBeGreaterThan(TIMER_BATCH_SIZE);

      clock.advance(11 * HOUR);
      const result = await ticker('instance-a', [recording]).tick();

      expect(result.done).toBe(due.length);
      expect(order).toEqual(due.map(({ ref }) => ref));
      expect((await timerOf(EXPIRE, 'tomorrow'))?.status).toBe('pending');
    });

    it('AC-PLATFORM-6: a daily job begins with the last whole day, and after days asleep builds every missed day in order', async () => {
      // 27 Nov 2026, 10:00 IST.
      clock.set(new Date('2026-11-27T04:30:00.000Z'));
      const one = ticker('instance-a', [daily]);

      expect((await one.tick()).done).toBe(1);
      expect(days).toEqual(['2026-11-26']);
      expect(await timerOf('commerce.stats.daily', '2026-11-27')).toMatchObject({
        status: 'pending',
        dueAt: dailyDueAt({ at: { hour: 2, minute: 0 } }, '2026-11-27'),
      });

      // Asleep until 1 Dec, 10:00 IST: 27, 28, 29 and 30 Nov are whole, each built once, in order.
      clock.set(new Date('2026-12-01T04:30:00.000Z'));
      expect((await one.tick()).done).toBe(4);
      expect(days).toEqual(['2026-11-26', '2026-11-27', '2026-11-28', '2026-11-29', '2026-11-30']);

      // A new instance does not start the chain again: it is pending for 1 Dec.
      await db.collection('leases').deleteMany({});
      expect((await ticker('instance-b', [daily]).tick()).done).toBe(0);
      expect(
        await db
          .collection(TIMERS_COLLECTION)
          .countDocuments({ kind: 'commerce.stats.daily', status: 'pending' }),
      ).toBe(1);
    });

    it("AC-PLATFORM-6: a day's work that fails is tried again, and the later days wait for it (in order)", async () => {
      clock.set(new Date('2026-11-27T04:30:00.000Z'));
      const one = ticker('instance-a', [daily]);
      failing = new TypeError('The counts could not be read.');

      expect(await one.tick()).toMatchObject({ done: 0 });
      expect(await timerOf('commerce.stats.daily', '2026-11-26')).toMatchObject({
        status: 'pending',
        attempts: 1,
        claimedBy: null,
      });

      failing = undefined;
      clock.set(new Date('2026-11-29T04:30:00.000Z'));
      expect((await one.tick()).done).toBe(3);
      expect(days).toEqual(['2026-11-26', '2026-11-27', '2026-11-28']);
    });

    it('AC-PLATFORM-6: a timer outside a transaction held by another instance is not run twice', async () => {
      clock.set(new Date('2026-11-27T04:30:00.000Z'));
      await scheduleTimer(db, {
        kind: 'commerce.stats.daily',
        ref: '2026-11-26',
        dueAt: clock.now(),
      });
      await db
        .collection<TimerRecord>(TIMERS_COLLECTION)
        .updateOne(
          { ref: '2026-11-26' },
          { $set: { claimedBy: 'instance-b', claimUntil: new Date(clock.now().getTime() + HOUR) } },
        );

      expect(await ticker('instance-a', [daily]).tick()).toMatchObject({ done: 0, skipped: 1 });
      expect(days).toEqual([]);
    });

    it('AC-PLATFORM-6: a failing timer is tried with a longer wait each time, and after the last try it fails for good with an alert', async () => {
      await scheduleTimer(db, { kind: EXPIRE, ref: 'bad', dueAt: clock.now() });
      failing = new TypeError('A bug.');
      const one = ticker();
      const alerts = alert.raised.length;

      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
        const result = await one.tick();
        const timer = await timerOf(EXPIRE, 'bad');
        expect(timer?.attempts).toBe(attempt);
        if (attempt < MAX_ATTEMPTS) {
          expect(result.failed).toBe(0);
          expect(timer).toMatchObject({ status: 'pending', lastError: 'TypeError: A bug.' });
          expect(timer?.runAt).toEqual(new Date(clock.now().getTime() + retryDelay(attempt)));
          clock.advance(retryDelay(attempt));
        } else {
          expect(result.failed).toBe(1);
          expect(timer?.status).toBe('failed');
        }
      }
      expect(alert.raised.slice(alerts)).toEqual([
        {
          kind: 'events.timerFailed',
          severity: 2,
          service: 'commerce',
          message: `The timer ${EXPIRE} failed after 8 tries.`,
          details: { kind: EXPIRE, ref: 'bad', attempts: 8 },
        },
      ]);
      expect(await runsOf('bad')).toBe(0);
    });

    it('AC-PLATFORM-6: a database out of reach does not count; a kind with no handler is a failure', async () => {
      await scheduleTimer(db, { kind: EXPIRE, ref: 'down', dueAt: clock.now() });
      await scheduleTimer(db, { kind: 'commerce.unknown.work', ref: 'x', dueAt: clock.now() });
      // The work finds its database out of reach (a 503 of the transaction helper).
      failing = serviceUnavailable(5);

      await ticker().tick();

      expect(await timerOf(EXPIRE, 'down')).toMatchObject({ status: 'pending', attempts: 0 });
      expect((await timerOf(EXPIRE, 'down'))?.runAt).toEqual(
        new Date(clock.now().getTime() + UNAVAILABLE_RETRY_MS),
      );
      expect(await timerOf('commerce.unknown.work', 'x')).toMatchObject({
        attempts: 1,
        lastError: 'RangeError: No handler takes the timer kind commerce.unknown.work.',
      });
    });

    it('AC-PLATFORM-7: a tick puts the pending jobs back on their queues', async () => {
      const requeuePending = vi.fn(() => Promise.resolve(3));
      const one = createTicker({
        client,
        db,
        clock,
        owner: 'instance-a',
        service: 'commerce',
        handlers: [],
        queues: { requeuePending },
        logger,
        alert,
      });
      expect(await one.tick()).toMatchObject({ requeued: 3 });
    });

    it('AC-PLATFORM-6: started, the first tick comes after its wait (the boot sweep); stopped, the lease is given up', async () => {
      await scheduleTimer(db, { kind: EXPIRE, ref: 'loop', dueAt: clock.now() });
      const one = createTicker({
        client,
        db,
        clock,
        owner: 'instance-loop',
        service: 'commerce',
        handlers: [expire],
        logger,
        alert,
        bootDelayMs: 0,
        tickMs: 60 * 60_000,
      });
      one.start();
      one.start();
      await vi.waitFor(
        async () => {
          expect(await runsOf('loop')).toBe(1);
        },
        { timeout: 10_000 },
      );
      await one.stop();
      await one.stop();
      expect(
        await acquireLease(db, {
          name: TICKER_LEASE,
          owner: 'instance-b',
          now: clock.now(),
          ttlMs: 1_000,
        }),
      ).toBe(true);
    });

    it('AC-PLATFORM-6: a tick that ran past its lease and lost it to another instance stops', async () => {
      await scheduleTimer(db, { kind: EXPIRE, ref: 'slow', dueAt: clock.now() });
      await scheduleTimer(db, { kind: EXPIRE, ref: 'next', dueAt: clock.now() });
      // The first timer takes longer than the lease, and instance b takes it meanwhile.
      const slow = onTimer(EXPIRE, async (timer, { db: own, session }) => {
        if (timer.ref === 'slow') {
          clock.advance(TICKER_LEASE_MS + 1);
          await acquireLease(db, {
            name: TICKER_LEASE,
            owner: 'instance-b',
            now: clock.now(),
            ttlMs: TICKER_LEASE_MS,
          });
        }
        await own
          .collection<{ _id: string; runs: number }>('work')
          .updateOne({ _id: timer.ref }, { $inc: { runs: 1 } }, { upsert: true, session });
      });

      expect(await ticker('instance-a', [slow]).tick()).toMatchObject({ done: 1 });
      expect([await runsOf('slow'), await runsOf('next')]).toEqual([1, 0]);
    });

    it('AC-PLATFORM-6: an alert of a failed timer that cannot be raised is logged', async () => {
      await scheduleTimer(db, { kind: EXPIRE, ref: 'last', dueAt: clock.now() });
      await db
        .collection<TimerRecord>(TIMERS_COLLECTION)
        .updateOne({ ref: 'last' }, { $set: { attempts: MAX_ATTEMPTS - 1 } });
      failing = new TypeError('A bug.');
      const one = createTicker({
        client,
        db,
        clock,
        owner: 'instance-a',
        service: 'commerce',
        handlers: [expire],
        logger,
        alert: () => Promise.reject(new Error('The push service is down.')),
      });

      expect(await one.tick()).toMatchObject({ failed: 1 });
      expect(logger.lines.at(-1)?.message).toBe('The alert of a failed timer could not be raised.');
    });

    it('AC-PLATFORM-6: a tick that fails is told, and the loop goes on', async () => {
      const { client: closed } = await connectTest('ticker-closed');
      await closed.close();
      const broken = createTicker({
        client: closed,
        db: closed.db('closed'),
        clock,
        owner: 'instance-closed',
        service: 'commerce',
        handlers: [],
        logger,
        alert,
        bootDelayMs: 0,
        tickMs: 60 * 60_000,
      });
      const before = logger.lines.length;

      broken.start();
      await vi.waitFor(
        () => {
          expect(logger.lines.slice(before).map((line) => line.message)).toContain(
            'A tick failed.',
          );
        },
        { timeout: 10_000 },
      );
      await broken.stop();
    });

    it('SR-071: two handlers of one kind are refused at boot', () => {
      expect(() => ticker('a', [expire, expire])).toThrow(
        `The timer kind ${EXPIRE} has two handlers.`,
      );
    });

    it("RT-24: the ticker's query uses its index, on many timers (CR-40)", async () => {
      const now = clock.now();
      await db.collection(TIMERS_COLLECTION).insertMany(
        Array.from({ length: 10_000 }, (_, index) => ({
          _id: new ObjectId(),
          kind: EXPIRE,
          ref: `many-${String(index)}`,
          dueAt: now,
          runAt: new Date(now.getTime() + index * 1_000),
          status: index % 4 === 0 ? 'done' : 'pending',
          attempts: 0,
          claimedBy: null,
          claimUntil: null,
          doneAt: index % 4 === 0 ? now : null,
          lastError: null,
        })),
      );
      expect(
        await queryPlanProblems(db.collection(TIMERS_COLLECTION), {
          name: 'due timers',
          filter: { status: 'pending', runAt: { $lte: now } },
          sort: { runAt: 1, _id: 1 },
          limit: TIMER_BATCH_SIZE,
        }),
      ).toEqual([]);
    });
  },
);
