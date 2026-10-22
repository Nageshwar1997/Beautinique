// Against the local MongoDB replica set and Valkey from `npm run infra:up` (or MONGO_TEST_URI and
// REDIS_TEST_URL). Each run uses its own database and BullMQ key prefix, and removes both at the end.
import { randomUUID } from 'node:crypto';
import { type AddressInfo, connect, createServer, type Server, type Socket } from 'node:net';
import { Writable } from 'node:stream';
import { setTimeout as sleep } from 'node:timers/promises';

import { createLogger } from '@beautinique/backend-server-kit';
import { connectMongo, type Mongo, withTransaction } from '@beautinique/backend-server-mongo';
import { defineEvent } from '@beautinique/shared-contracts';
import { number, object, string } from '@beautinique/shared-zod';
import { Queue } from 'bullmq';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import * as api from '../src/index';
import {
  assertNoEviction,
  connectRedis,
  type Consumer,
  type ConsumerOptions,
  DEAD_LETTER_KEEP_SECONDS,
  DEAD_LETTERS,
  defineTask,
  ensureConsumerIndexes,
  ensureOutboxIndexes,
  EVENT_MAX_BYTES,
  heartbeatTask,
  jobIdOf,
  lateTasks,
  LOCKS,
  OUTBOX,
  OUTBOX_KEEP_SECONDS,
  type OutboxRecord,
  parseRedisInfo,
  PLATFORM_STATE,
  PROCESSED_EVENTS,
  PROCESSED_KEEP_SECONDS,
  type RedisConnection,
  redriveDeadLetters,
  redriveOutbox,
  type Relay,
  RELAY_LEASE,
  type RelayOptions,
  releaseLease,
  type Schedule,
  startConsumer,
  startRelay,
  startWipeWatchdog,
  subscribe,
  type Subscription,
  TASK_RUNS,
  type TaskRun,
  tryLease,
  upsertSchedules,
  type WipeWatchdog,
  writeEvent,
} from '../src/index';

const MONGO_URI = process.env.MONGO_TEST_URI ?? 'mongodb://localhost:27017/?replicaSet=rs0';
const REDIS_URL = process.env.REDIS_TEST_URL ?? 'redis://localhost:6379';
const runId = randomUUID().slice(0, 8);
const dbName = `bq_test_queue_${runId}`;
const prefix = `bqtest${runId}`;
const lines: Record<string, unknown>[] = [];
const logger = createLogger({
  name: 'server-queue-test',
  level: 'debug',
  destination: new Writable({
    write(chunk: Buffer, _encoding, done) {
      for (const line of chunk.toString().split('\n').filter(Boolean)) {
        lines.push(JSON.parse(line) as Record<string, unknown>);
      }
      done();
    },
  }),
});

const orderPlaced = defineEvent({
  type: 'commerce.order.placed',
  version: 1,
  producer: 'core',
  description: 'A customer placed an order.',
  data: object({ orderId: string(), total: number().int() }),
});
const reviewAdded = defineEvent({
  type: 'catalog.review.added',
  version: 1,
  producer: 'core',
  description: 'Nobody subscribes to this one yet.',
  data: object({ reviewId: string() }),
});
const order = (orderId: string) => ({
  aggregate: { type: 'order', id: orderId },
  actor: { type: 'user' as const, id: 'u1' },
  correlationId: 'req-1',
  data: { orderId, total: 129_900 },
});
const SUBSCRIBERS = { 'commerce.order.placed': ['notify.emails', 'identity.grants'] };

let mongo: Mongo;
let redis: RedisConnection;
/** A consumer deployable's own database (like bq_notify): it never reads the producer's. */
let consumerMongo: Mongo;
/** What beforeAll managed to open: if it failed half way, afterAll closes only that. */
const opened: { mongo?: Mongo; redis?: RedisConnection; consumer?: Mongo } = {};
const consumers: Consumer[] = [];
const inspectors: Queue[] = [];
const relays: Relay[] = [];

beforeAll(async () => {
  try {
    mongo = await connectMongo({ uri: MONGO_URI, dbName, appName: 'server-queue-test', logger });
    opened.mongo = mongo;
    redis = await connectRedis({ url: REDIS_URL, name: 'server-queue-test', logger });
    opened.redis = redis;
    consumerMongo = await connectMongo({
      uri: MONGO_URI,
      dbName: `${dbName}_notify`,
      appName: 'server-queue-test',
      logger,
    });
    opened.consumer = consumerMongo;
  } catch (error) {
    throw new Error(
      'These tests need MongoDB and Valkey: run `npm run infra:up` (or set MONGO_TEST_URI and REDIS_TEST_URL).',
      { cause: error },
    );
  }
  await ensureOutboxIndexes(mongo);
  await ensureConsumerIndexes(consumerMongo);
});
/** Removes this run's BullMQ keys, so each test counts only its own jobs. */
async function clearQueues(): Promise<void> {
  const keys = await redis.client.keys(`${prefix}:*`);
  if (keys.length > 0) await redis.client.del(...keys);
}
let failPointOn = false;
/** Makes MongoDB fail or stall this run's commands (needs enableTestCommands: infra has it on). */
async function failPoint(mode: { times: number }, data: Record<string, unknown>): Promise<void> {
  await mongo.client.db('admin').command({
    configureFailPoint: 'failCommand',
    mode,
    data: { appName: 'server-queue-test', ...data },
  });
  failPointOn = true;
}
afterEach(async () => {
  await Promise.all(relays.splice(0).map((relay) => relay.stop()));
  await Promise.all(consumers.splice(0).map((consumer) => consumer.stop()));
  if (failPointOn) {
    await mongo.client.db('admin').command({ configureFailPoint: 'failCommand', mode: 'off' });
    failPointOn = false;
  }
  await mongo.db.collection(OUTBOX).deleteMany({});
  await mongo.db.collection(LOCKS).deleteMany({});
  for (const name of [PROCESSED_EVENTS, DEAD_LETTERS, 'emails', TASK_RUNS, PLATFORM_STATE]) {
    await consumerMongo.db.collection(name).deleteMany({});
  }
  await clearQueues();
  lines.length = 0;
});

interface RedisProxy {
  url: string;
  down(): Promise<void>;
  up(): Promise<void>;
  /** Connections stay open but nothing passes: a Redis that stopped answering. */
  freeze(): void;
  thaw(): void;
}

/**
 * A TCP proxy in front of Redis: `down()` cuts every connection and refuses new ones, like a Redis
 * restart on Render; `up()` listens again on the same port. The client reconnects by itself.
 */
async function redisProxy(): Promise<RedisProxy> {
  const target = new URL(REDIS_URL);
  const sockets = new Set<Socket>();
  let server: Server | undefined;
  let port = 0;
  const up = () =>
    new Promise<void>((resolve) => {
      const listening = createServer((client) => {
        const upstream = connect(Number(target.port || 6379), target.hostname);
        for (const socket of [client, upstream]) {
          sockets.add(socket);
          socket.on('error', () => undefined);
          socket.on('close', () => {
            sockets.delete(socket);
            client.destroy();
            upstream.destroy();
          });
        }
        client.pipe(upstream).pipe(client);
      });
      server = listening;
      listening.listen(port, '127.0.0.1', () => {
        port = (listening.address() as AddressInfo).port;
        resolve();
      });
    });
  const down = () =>
    new Promise<void>((resolve) => {
      for (const socket of sockets) socket.destroy();
      sockets.clear();
      if (server)
        server.close(() => {
          resolve();
        });
      else resolve();
    });
  await up();
  return {
    url: `redis://127.0.0.1:${String(port)}`,
    down,
    up,
    freeze: () => {
      for (const socket of sockets) socket.pause();
    },
    thaw: () => {
      for (const socket of sockets) socket.resume();
    },
  };
}
afterAll(async () => {
  try {
    await Promise.all(inspectors.map((queue) => queue.close()));
    if (opened.redis) {
      const keys = await opened.redis.client.keys(`${prefix}:*`);
      if (keys.length > 0) await opened.redis.client.del(...keys);
    }
    await opened.mongo?.db.dropDatabase();
    await opened.consumer?.db.dropDatabase();
  } finally {
    await opened.redis?.close();
    await opened.mongo?.close();
    await opened.consumer?.close();
  }
});

const outbox = () => mongo.db.collection<OutboxRecord>(OUTBOX);
/** A queue of this run, to look at what the relay made. */
const inspect = (name: string): Queue => {
  const queue = new Queue(name, { connection: redis.client, prefix });
  inspectors.push(queue);
  return queue;
};
const relay = (options: Partial<RelayOptions> = {}): Relay => {
  const started = startRelay({
    mongo,
    redis: redis.client,
    logger,
    mode: 'poll',
    subscribers: SUBSCRIBERS,
    prefix,
    pollMs: 100,
    lockTtlMs: 900,
    ...options,
  });
  relays.push(started);
  return started;
};
async function waitFor(check: () => boolean | Promise<boolean>, ms = 3000): Promise<void> {
  const end = Date.now() + ms;
  while (!(await check())) {
    if (Date.now() > end) {
      const warnings = lines.filter((l) => Number(l.level) >= 40).map((l) => [l.msg, l.err]);
      throw new Error(`timed out; warnings: ${JSON.stringify(warnings)}`);
    }
    await sleep(25);
  }
}
const allRelayed = async () => (await outbox().countDocuments({ status: 'pending' })) === 0;
const placeOrder = (orderId: string) =>
  withTransaction(mongo, (session) => writeEvent(mongo, session, orderPlaced, order(orderId)));

describe('public API', () => {
  it('exports the Redis connection, the outbox, the lease and the relay', () => {
    for (const name of [
      'connectRedis',
      'parseRedisInfo',
      'assertNoEviction',
      'writeEvent',
      'ensureOutboxIndexes',
      'tryLease',
      'releaseLease',
      'startRelay',
      'jobIdOf',
    ]) {
      expect(api, name).toHaveProperty(name);
    }
  });
});

describe('connectRedis', () => {
  it('checks the eviction policy and logs the limits, never the URL', async () => {
    const second = await connectRedis({ url: REDIS_URL, name: 'second', logger });
    await second.close();
    const connected = lines.find((l) => l.msg === 'redis connected');
    expect(connected).toMatchObject({ policy: 'noeviction', maxmemoryMb: 25 });
    expect(JSON.stringify(lines)).not.toContain('localhost:6379');
  });

  it('is ready while connected, and not after close (twice is fine)', async () => {
    const second = await connectRedis({ url: REDIS_URL, name: 'second', logger });
    expect(await second.ready()).toBe(true);
    await second.close();
    await second.close();
    expect(await second.ready()).toBe(false);
    expect(lines.filter((l) => l.msg === 'redis closed')).toHaveLength(1);
  });

  it('is not ready when Redis stops answering for 2 seconds', async () => {
    const proxy = await redisProxy();
    const stuck = await connectRedis({ url: proxy.url, name: 'stuck', logger });
    try {
      proxy.freeze();
      const started = Date.now();
      expect(await stuck.ready()).toBe(false);
      expect(Date.now() - started).toBeLessThan(2900);
      proxy.thaw();
      expect(await stuck.ready()).toBe(true);
    } finally {
      await stuck.close();
      await proxy.down();
    }
  });

  it('warns near the plan connection limit', async () => {
    const second = await connectRedis({
      url: REDIS_URL,
      name: 'second',
      logger,
      connectionLimit: 2,
    });
    await second.close();
    expect(lines.find((l) => l.msg === 'redis is near its connection limit')).toMatchObject({
      connectionLimit: 2,
    });
  });

  it('fails clearly when Redis is not there, without printing the URL', async () => {
    const attempt = connectRedis({
      url: 'redis://:s3cret@127.0.0.1:6390',
      name: 'x',
      logger,
      connectTimeoutMs: 500,
    });
    await expect(attempt).rejects.toThrow(
      'Redis did not answer within 500 ms. Locally run `npm run infra:up`',
    );
    await expect(attempt).rejects.not.toThrow('s3cret');
  });

  it('refuses a Redis that may drop jobs (any policy but noeviction)', async () => {
    await redis.client.config('SET', 'maxmemory-policy', 'allkeys-lru');
    try {
      await expect(connectRedis({ url: REDIS_URL, name: 'lru', logger })).rejects.toThrow(
        'Redis must use maxmemory-policy noeviction (it uses "allkeys-lru")',
      );
    } finally {
      await redis.client.config('SET', 'maxmemory-policy', 'noeviction');
    }
  });

  it('reads INFO replies and accepts only noeviction', () => {
    const limits = parseRedisInfo(
      '# Memory\r\nmaxmemory:26214400\r\nmaxmemory_policy:allkeys-lru\r\n# Clients\r\nconnected_clients:7\r\n',
    );
    expect(limits).toEqual({
      maxmemoryBytes: 26_214_400,
      policy: 'allkeys-lru',
      connectedClients: 7,
    });
    expect(() => {
      assertNoEviction(limits);
    }).toThrow('Redis must use maxmemory-policy noeviction (it uses "allkeys-lru")');
    expect(() => {
      assertNoEviction({ ...limits, policy: 'noeviction' });
    }).not.toThrow();
    expect(parseRedisInfo('')).toEqual({
      maxmemoryBytes: 0,
      policy: 'unknown',
      connectedClients: 0,
    });
  });
});

describe('writeEvent', () => {
  it('writes a checked envelope to the outbox with the change, and returns it', async () => {
    const envelope = await placeOrder('o1');
    expect(envelope).toMatchObject({
      type: 'commerce.order.placed',
      version: 1,
      producer: 'core',
      aggregate: { type: 'order', id: 'o1' },
      causationId: null,
      scope: null,
      data: { orderId: 'o1', total: 129_900 },
    });
    expect(envelope.eventId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7/);
    expect(new Date(envelope.occurredAt).getTime()).toBeGreaterThan(Date.now() - 5000);
    expect(await outbox().findOne({ _id: envelope.eventId })).toMatchObject({
      type: 'commerce.order.placed',
      version: 1,
      status: 'pending',
      envelope: { eventId: envelope.eventId, data: { orderId: 'o1' } },
    });
  });

  it('refuses to write outside a transaction', async () => {
    const session = mongo.client.startSession();
    try {
      await expect(writeEvent(mongo, session, orderPlaced, order('o2'))).rejects.toThrow(
        'writeEvent("commerce.order.placed") must run inside withTransaction',
      );
    } finally {
      await session.endSession();
    }
    expect(await outbox().countDocuments()).toBe(0);
  });

  it('is rolled back with the change', async () => {
    await expect(
      withTransaction(mongo, async (session) => {
        await writeEvent(mongo, session, orderPlaced, order('o3'));
        throw new Error('stock ran out');
      }),
    ).rejects.toThrow('stock ran out');
    expect(await outbox().countDocuments()).toBe(0);
  });

  it('fails the request when the event breaks its contract', async () => {
    await expect(
      withTransaction(mongo, (session) =>
        writeEvent(mongo, session, orderPlaced, {
          ...order('o4'),
          data: { orderId: 'o4', total: 1.5 },
        }),
      ),
    ).rejects.toMatchObject({ name: 'ZodError' });
    expect(await outbox().countDocuments()).toBe(0);
  });

  it('keeps relayed events for 72 hours, and pending ones until relayed', async () => {
    await ensureOutboxIndexes(mongo);
    const indexes = await outbox().indexes();
    expect(indexes.find((i) => i.name === 'status_createdAt')?.key).toEqual({
      status: 1,
      createdAt: 1,
    });
    expect(indexes.find((i) => i.name === 'relayed_expiry')).toMatchObject({
      key: { relayedAt: 1 },
      expireAfterSeconds: OUTBOX_KEEP_SECONDS,
    });
    expect(OUTBOX_KEEP_SECONDS).toBe(72 * 60 * 60);
  });
});

describe('tryLease', () => {
  it('gives a free lease to exactly one of many instances asking at once', async () => {
    for (let round = 0; round < 5; round += 1) {
      const name = `race-${String(round)}`;
      const results = await Promise.all(
        Array.from({ length: 8 }, (_, i) => tryLease(mongo, name, `owner-${String(i)}`, 5000)),
      );
      expect(results.filter(Boolean), name).toHaveLength(1);
    }
  });

  it('gives the lease to one owner until it runs out, and lets only that owner release it', async () => {
    expect(await tryLease(mongo, 'job', 'a', 300)).toBe(true);
    expect(await tryLease(mongo, 'job', 'b', 300)).toBe(false);
    expect(await tryLease(mongo, 'job', 'a', 300)).toBe(true);
    await sleep(400);
    expect(await tryLease(mongo, 'job', 'b', 300)).toBe(true);
    await releaseLease(mongo, 'job', 'a');
    expect(await tryLease(mongo, 'job', 'a', 300)).toBe(false);
    await releaseLease(mongo, 'job', 'b');
    expect(await tryLease(mongo, 'job', 'a', 300)).toBe(true);
  });
});

describe('startRelay', () => {
  it('makes one job per subscriber in the subscriber queue, and marks the event relayed', async () => {
    relay();
    const placed = await placeOrder('o10');
    const reviewed = await withTransaction(mongo, (session) =>
      writeEvent(mongo, session, reviewAdded, {
        ...order('r1'),
        aggregate: { type: 'review', id: 'r1' },
        data: { reviewId: 'r1' },
      }),
    );
    await waitFor(allRelayed);
    for (const [queueName, subscriber] of [
      ['q.notify', 'notify.emails'],
      ['q.identity', 'identity.grants'],
    ] as const) {
      const job = await inspect(queueName).getJob(jobIdOf(placed.eventId, subscriber));
      expect(job?.name).toBe(subscriber);
      // the whole event: a consumer may only read its own database
      expect(job?.data).toEqual(placed);
      expect(job?.opts).toMatchObject({
        attempts: 6,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
        removeOnFail: { count: 20 },
      });
    }
    expect(await outbox().findOne({ _id: placed.eventId })).toMatchObject({
      status: 'relayed',
      subscribers: 2,
    });
    // nobody listens: relayed with no jobs, not left pending
    expect(await outbox().findOne({ _id: reviewed.eventId })).toMatchObject({
      status: 'relayed',
      subscribers: 0,
    });
  });

  it('relays at once through the change stream, before any sweep', async () => {
    // no sweep and no lease renewal for a minute: only the stream can relay in time
    const running = relay({ mode: 'changestream', sweepMs: 60_000, lockTtlMs: 60_000 });
    await waitFor(() => running.isLeader());
    // the stream opens right after the lease; give it a moment to be listening
    await sleep(300);
    const started = Date.now();
    const placed = await placeOrder('o11');
    await waitFor(allRelayed, 1500);
    expect(Date.now() - started).toBeLessThan(1500);
    expect(await inspect('q.notify').getJob(jobIdOf(placed.eventId, 'notify.emails'))).toBeTruthy();
  });

  it('lets one instance relay at a time, and hands over when it stops', async () => {
    const first = relay();
    await waitFor(() => first.isLeader());
    const second = relay();
    await sleep(700);
    expect(second.isLeader()).toBe(false);
    const placed = await placeOrder('o12');
    await waitFor(allRelayed);
    expect(await inspect('q.notify').getJobCounts('waiting')).toMatchObject({ waiting: 1 });
    await first.stop();
    expect(
      await mongo.db.collection<{ _id: string }>(LOCKS).countDocuments({ _id: RELAY_LEASE }),
    ).toBeLessThanOrEqual(1);
    await waitFor(() => second.isLeader(), 2000);
    const next = await placeOrder('o13');
    await waitFor(allRelayed);
    expect(await inspect('q.notify').getJob(jobIdOf(next.eventId, 'notify.emails'))).toBeTruthy();
    expect(await inspect('q.notify').getJob(jobIdOf(placed.eventId, 'notify.emails'))).toBeTruthy();
    expect(lines.some((l) => l.msg === 'outbox relay leading')).toBe(true);
  });

  it('never makes a second job for an event relayed again (same job id)', async () => {
    relay();
    const placed = await placeOrder('o14');
    await waitFor(allRelayed);
    // as after a crash between the job and the mark: the event is pending again
    await outbox().updateOne({ _id: placed.eventId }, { $set: { status: 'pending' } });
    await waitFor(allRelayed);
    expect(await inspect('q.identity').getJobCounts('waiting')).toMatchObject({ waiting: 1 });
  });

  it('keeps an event pending while Redis is away, and relays it when Redis is back', async () => {
    const proxy = await redisProxy();
    const away = await connectRedis({ url: proxy.url, name: 'relay-under-test', logger });
    try {
      const running = relay({ redis: away.client });
      await waitFor(() => running.isLeader());
      await proxy.down();
      const placed = await placeOrder('o15');
      await sleep(600);
      expect(await outbox().findOne({ _id: placed.eventId })).toMatchObject({ status: 'pending' });
      // the outage is logged (and not an unhandled error event)
      expect(lines.some((l) => l.msg === 'redis error')).toBe(true);
      expect(await running.lag()).toBeGreaterThan(0);
      await proxy.up();
      await waitFor(allRelayed, 5000);
      expect(
        await inspect('q.notify').getJob(jobIdOf(placed.eventId, 'notify.emails')),
      ).toBeTruthy();
      await running.stop();
    } finally {
      await away.close();
      await proxy.down();
    }
  });

  it('reports the lag of the oldest pending event, and is not ready past 30 s', async () => {
    const running = relay({ pollMs: 60_000, lockTtlMs: 60_000 });
    await waitFor(() => running.isLeader());
    // the first poll ran at start; this event waits for the next one, a minute away
    await sleep(100);
    const placed = await placeOrder('o16');
    await outbox().updateOne(
      { _id: placed.eventId },
      { $set: { createdAt: new Date(Date.now() - 40_000) } },
    );
    expect(await running.lag()).toBeGreaterThanOrEqual(40_000);
    expect(await running.ready()).toBe(false);
    await outbox().deleteMany({});
    expect(await running.lag()).toBe(0);
    expect(await running.ready()).toBe(true);
  });

  it('relays an event that arrives while a round is still running, without waiting for a sweep', async () => {
    const running = relay({ mode: 'changestream', sweepMs: 60_000, lockTtlMs: 60_000 });
    await waitFor(() => running.isLeader());
    await sleep(300);
    // the relay's next mark (an update) is held for 500 ms: its round is busy meanwhile
    await failPoint(
      { times: 1 },
      { failCommands: ['update'], blockConnection: true, blockTimeMS: 500 },
    );
    await placeOrder('busy1');
    await sleep(100);
    const second = await placeOrder('busy2');
    await waitFor(allRelayed, 2000);
    expect(await inspect('q.notify').getJob(jobIdOf(second.eventId, 'notify.emails'))).toBeTruthy();
  });

  it('renews its lease well before the lease runs out', async () => {
    const running = relay();
    await waitFor(() => running.isLeader());
    const leaseEnd = async () =>
      (
        await mongo.db
          .collection<{ _id: string; expiresAt: Date }>(LOCKS)
          .findOne({ _id: RELAY_LEASE })
      )?.expiresAt.getTime() ?? 0;
    const first = await leaseEnd();
    await sleep(450);
    expect(await leaseEnd()).toBeGreaterThan(first);
  });

  it('leaves no lease behind when stopped right after it started', async () => {
    for (let round = 0; round < 5; round += 1) {
      await relay().stop();
      expect(
        await mongo.db.collection<{ _id: string }>(LOCKS).countDocuments({ _id: RELAY_LEASE }),
        String(round),
      ).toBe(0);
    }
  });

  it('stops cleanly: gives the lease up and leaves the shared Redis client open', async () => {
    const running = relay();
    await waitFor(() => running.isLeader());
    await running.stop();
    await running.stop();
    expect(running.isLeader()).toBe(false);
    expect(
      await mongo.db.collection<{ _id: string }>(LOCKS).countDocuments({ _id: RELAY_LEASE }),
    ).toBe(0);
    expect(await redis.ready()).toBe(true);
    expect(lines.filter((l) => l.msg === 'outbox relay stopped')).toHaveLength(1);
  });

  it('relays in the order the events were written, a batch after another', async () => {
    const written: string[] = [];
    for (let i = 0; i < 5; i += 1) written.push((await placeOrder(`seq${String(i)}`)).eventId);
    // no polling and no lease renewal for a minute: only the batch loop can relay all five
    relay({ batchSize: 2, pollMs: 60_000, lockTtlMs: 60_000 });
    await waitFor(allRelayed, 2000);
    const jobs = await inspect('q.notify').getJobs(['waiting'], 0, -1, true);
    expect(jobs.map((job) => (job.data as { eventId: string }).eventId)).toEqual(written);
  });

  it('sends a subscriber to its own queue when asked', async () => {
    relay({ queueOf: (subscriber) => `q.${subscriber.replace('.', '-')}` });
    const placed = await placeOrder('o17');
    await waitFor(allRelayed);
    expect(
      await inspect('q.notify-emails').getJob(jobIdOf(placed.eventId, 'notify.emails')),
    ).toBeTruthy();
  });

  it('refuses wrong subscriber lists at start', () => {
    for (const subscribers of [
      { 'commerce.order.placed': ['shop.emails'] },
      { 'commerce.order.placed': ['notify'] },
      { 'commerce.order.placed': ['notify.emails', 'notify.emails'] },
    ]) {
      expect(() => relay({ subscribers }), JSON.stringify(subscribers)).toThrow(
        /must be <deployable>\.<module>|lists a subscriber twice/,
      );
    }
  });
});

describe('writeEvent size limit', () => {
  it('refuses an event over 16 KB, so Redis stays small', async () => {
    await expect(
      withTransaction(mongo, (session) =>
        writeEvent(mongo, session, orderPlaced, {
          ...order('big'),
          data: { orderId: 'x'.repeat(EVENT_MAX_BYTES), total: 1 },
        }),
      ),
    ).rejects.toThrow(/^Event "commerce.order.placed" is \d+ bytes; the limit is 16384/);
    expect(await outbox().countDocuments()).toBe(0);
  });
});

describe('startConsumer', () => {
  const emails = () => consumerMongo.db.collection<{ _id: string; orderId: string }>('emails');
  const deadLetters = () => consumerMongo.db.collection<{ _id: string }>(DEAD_LETTERS);
  /** Sends the welcome email row for an order: the consumer's own database work. */
  const sendEmail = subscribe('notify.emails', orderPlaced, async (event, session) => {
    await emails().insertOne({ _id: event.eventId, orderId: event.data.orderId }, { session });
  });
  const consume = (options: Partial<ConsumerOptions> = {}): Consumer => {
    const started = startConsumer({
      mongo: consumerMongo,
      redis: redis.client,
      logger,
      queue: 'q.notify',
      subscriptions: [sendEmail],
      prefix,
      ...options,
    });
    consumers.push(started);
    return started;
  };
  /** Puts an event on q.notify the way a redelivery would, with quick retries for the test. */
  const deliver = (envelope: unknown, eventId: string, attempts = 3) =>
    inspect('q.notify').add('notify.emails', envelope, {
      jobId: jobIdOf(eventId, 'notify.emails'),
      attempts,
      backoff: { type: 'fixed', delay: 50 },
      removeOnComplete: true,
    });

  it('handles a relayed event in its own database, and marks it handled in the same transaction', async () => {
    relay();
    consume();
    const placed = await placeOrder('c1');
    await waitFor(async () => (await emails().countDocuments()) === 1, 5000);
    expect(await emails().findOne({ _id: placed.eventId })).toEqual({
      _id: placed.eventId,
      orderId: 'c1',
    });
    expect(
      await consumerMongo.db
        .collection<{ _id: string }>(PROCESSED_EVENTS)
        .findOne({ _id: jobIdOf(placed.eventId, 'notify.emails') }),
    ).toMatchObject({
      eventId: placed.eventId,
      subscriber: 'notify.emails',
      type: 'commerce.order.placed',
    });
    // the producer's database got nothing from the consumer
    expect(await mongo.db.collection('emails').countDocuments()).toBe(0);
  });

  it('skips an event delivered again: no second effect', async () => {
    consume();
    const placed = await placeOrder('c2');
    await deliver(placed, placed.eventId);
    await waitFor(async () => (await emails().countDocuments()) === 1);
    await deliver(placed, placed.eventId);
    await waitFor(() => lines.some((l) => l.msg === 'event seen again, skipped'));
    expect(await emails().countDocuments()).toBe(1);
  });

  it('retries a failing handler, rolls back each failed try, and applies the effect once', async () => {
    let calls = 0;
    consume({
      subscriptions: [
        subscribe('notify.emails', orderPlaced, async (event, session) => {
          calls += 1;
          await emails().insertOne(
            { _id: event.eventId, orderId: event.data.orderId },
            { session },
          );
          if (calls < 3) throw new Error('mail service busy');
        }),
      ],
    });
    const placed = await placeOrder('c3');
    await deliver(placed, placed.eventId, 3);
    await waitFor(async () => (await emails().countDocuments()) === 1);
    await sleep(100);
    expect(calls).toBe(3);
    expect(await emails().countDocuments()).toBe(1);
    expect(lines.filter((l) => l.msg === 'event handling failed, will retry')).toHaveLength(2);
    expect(await deadLetters().countDocuments()).toBe(0);
  });

  it('dead-letters an event after its last try, with the error', async () => {
    consume({
      subscriptions: [
        subscribe('notify.emails', orderPlaced, () =>
          Promise.reject(new Error(`smtp down ${'x'.repeat(600)}`)),
        ),
      ],
    });
    const placed = await placeOrder('c4');
    await deliver(placed, placed.eventId, 2);
    await waitFor(async () => (await deadLetters().countDocuments()) === 1);
    const letter = await deadLetters().findOne({});
    expect(letter).toMatchObject({
      _id: jobIdOf(placed.eventId, 'notify.emails'),
      queue: 'q.notify',
      subscriber: 'notify.emails',
      eventId: placed.eventId,
      type: 'commerce.order.placed',
      envelope: { eventId: placed.eventId, data: { orderId: 'c4' } },
      error: { name: 'Error' },
      attempts: 2,
    });
    // long errors are cut to 500 characters
    const { message } = (letter as unknown as { error: { message: string } }).error;
    expect(message.startsWith('smtp down xxx')).toBe(true);
    expect(message).toHaveLength(500);
    // the log line follows the saved dead letter
    await waitFor(() => lines.some((l) => l.msg === 'event dead-lettered'));
    expect(lines.find((l) => l.msg === 'event dead-lettered')).toMatchObject({
      eventId: placed.eventId,
      attempts: 2,
    });
    expect(await consumerMongo.db.collection(PROCESSED_EVENTS).countDocuments()).toBe(0);
  });

  it('dead-letters at once what no retry can fix: unknown version, broken contract, handler bug', async () => {
    consume({
      subscriptions: [
        sendEmail,
        subscribe('notify.emails', reviewAdded, async (event, session) => {
          if (event.data.reviewId === 'parallel') {
            // a handler bug: parallel queries in one transaction
            await Promise.all([
              emails().insertOne({ _id: 'p1', orderId: 'p' }, { session }),
              emails().insertOne({ _id: 'p2', orderId: 'p' }, { session }),
              emails().insertOne({ _id: 'p3', orderId: 'p' }, { session }),
            ]);
            return;
          }
          // a handler bug: a query error caught and ignored (MongoDB has cancelled the transaction)
          try {
            await emails().insertOne({ _id: 'taken', orderId: 't' }, { session });
          } catch {
            // ignored on purpose
          }
        }),
      ],
    });
    const placed = await placeOrder('c5');
    const newer = { ...placed, eventId: '0193a2b4-0000-7000-8000-000000000001', version: 9 };
    const broken = {
      ...placed,
      eventId: '0193a2b4-0000-7000-8000-000000000002',
      data: { orderId: 'c5', total: 'many' },
    };
    const review = (eventId: string, reviewId: string) => ({
      ...placed,
      eventId,
      type: 'catalog.review.added',
      data: { reviewId },
    });
    await emails().insertOne({ _id: 'taken', orderId: 't' });
    for (const envelope of [
      newer,
      broken,
      review('0193a2b4-0000-7000-8000-000000000003', 'parallel'),
      review('0193a2b4-0000-7000-8000-000000000004', 'swallow'),
    ]) {
      await deliver(envelope, envelope.eventId, 5);
    }
    await waitFor(async () => (await deadLetters().countDocuments()) === 4, 5000);
    const letters = await deadLetters().find({}).toArray();
    expect(letters.map((letter) => (letter as unknown as { attempts: number }).attempts)).toEqual([
      1, 1, 1, 1,
    ]);
    const messages = letters.map(
      (letter) => (letter as unknown as { error: { message: string } }).error.message,
    );
    expect(
      messages.some((m) =>
        m.startsWith('No handler for commerce.order.placed v9 at notify.emails'),
      ),
    ).toBe(true);
    expect(messages.some((m) => m.includes('breaks its contract at: data.total'))).toBe(true);
    expect(messages.some((m) => m.includes('ran at the same time'))).toBe(true);
    expect(messages.some((m) => m.includes('(MongoDB error 11000)'))).toBe(true);
    expect(await emails().countDocuments()).toBe(1);
  });

  it('refuses wrong subscriptions at start', () => {
    expect(() => subscribe('mail', orderPlaced, () => Promise.resolve())).toThrow(
      'must be <deployable>.<module>',
    );
    expect(() => consume({ subscriptions: [sendEmail, sendEmail] })).toThrow(
      'Subscription notify.emails|commerce.order.placed@v1 is declared twice',
    );
  });

  it('stops after the job in hand and leaves the shared Redis client open', async () => {
    const running = consume();
    expect(await running.ready()).toBe(true);
    await running.stop();
    await running.stop();
    expect(await running.ready()).toBe(false);
    expect(await redis.ready()).toBe(true);
    expect(lines.filter((l) => l.msg === 'event consumer stopped')).toHaveLength(1);
    // a stopped consumer takes no more work
    const placed = await placeOrder('c6');
    await deliver(placed, placed.eventId);
    await sleep(500);
    expect(await emails().countDocuments()).toBe(0);
  });

  it('keeps handled marks 7 days and dead letters 14 days', async () => {
    await ensureConsumerIndexes(consumerMongo);
    const processedIndexes = await consumerMongo.db.collection(PROCESSED_EVENTS).indexes();
    expect(processedIndexes.find((i) => i.name === 'processed_expiry')).toMatchObject({
      key: { processedAt: 1 },
      expireAfterSeconds: PROCESSED_KEEP_SECONDS,
    });
    const deadIndexes = await consumerMongo.db.collection(DEAD_LETTERS).indexes();
    expect(deadIndexes.find((i) => i.name === 'dead_letter_expiry')).toMatchObject({
      key: { failedAt: 1 },
      expireAfterSeconds: DEAD_LETTER_KEEP_SECONDS,
    });
    expect([PROCESSED_KEEP_SECONDS, DEAD_LETTER_KEEP_SECONDS]).toEqual([7 * 86_400, 14 * 86_400]);
  });
});

/** A consumer of q.notify that writes an email row per order, in the consumer's own database. */
function emailConsumer(handle?: Subscription<typeof orderPlaced>['handle']): Consumer {
  const started = startConsumer({
    mongo: consumerMongo,
    redis: redis.client,
    logger,
    queue: 'q.notify',
    subscriptions: [
      subscribe(
        'notify.emails',
        orderPlaced,
        handle ??
          (async (event, session) => {
            await consumerMongo.db
              .collection<{ _id: string; orderId: string }>('emails')
              .insertOne({ _id: event.eventId, orderId: event.data.orderId }, { session });
          }),
      ),
    ],
    prefix,
  });
  consumers.push(started);
  return started;
}
const emailCount = () => consumerMongo.db.collection('emails').countDocuments();
const taskRuns = () => consumerMongo.db.collection<TaskRun>(TASK_RUNS);

describe('upsertSchedules and scheduled tasks', () => {
  const set = (schedules: Schedule[], queue = 'q.core') =>
    upsertSchedules({
      mongo: consumerMongo,
      redis: redis.client,
      logger,
      queue,
      schedules,
      prefix,
    });

  it('makes the queue schedulers exactly the given schedules, in India time by default', async () => {
    await set([
      { task: 'commerce.expireCarts', every: 60_000 },
      { task: 'finance.closeDay', pattern: '0 30 23 * * *', maxGapMs: 26 * 3_600_000 },
    ]);
    let found = await inspect('q.core').getJobSchedulers();
    expect(found.map((scheduler) => scheduler.key).toSorted()).toEqual([
      'commerce.expireCarts',
      'finance.closeDay',
    ]);
    expect(found.find((scheduler) => scheduler.key === 'commerce.expireCarts')).toMatchObject({
      every: 60_000,
    });
    expect(found.find((scheduler) => scheduler.key === 'finance.closeDay')).toMatchObject({
      pattern: '0 30 23 * * *',
      tz: 'Asia/Kolkata',
    });
    // a schedule left out of the code is removed
    await set([{ task: 'commerce.expireCarts', every: 60_000 }]);
    found = await inspect('q.core').getJobSchedulers();
    expect(found.map((scheduler) => scheduler.key)).toEqual(['commerce.expireCarts']);
    expect(lines.some((l) => l.msg === 'schedules set')).toBe(true);
  });

  it('refuses wrong schedules before touching Redis', async () => {
    for (const [schedule, message] of [
      [
        { task: 'commerce.expire', every: 1000, pattern: '* * * * *' },
        'exactly one of every or pattern',
      ],
      [{ task: 'commerce.expire' }, 'exactly one of every or pattern'],
      [{ task: 'expire', every: 1000 }, 'must be <module>.<task>'],
      [{ task: 'commerce.expire', every: 0 }, 'every must be above 0 ms'],
      [{ task: 'commerce.expire', pattern: '0 0 * * *' }, 'give it maxGapMs'],
    ] as const) {
      await expect(set([schedule]), message).rejects.toThrow(message);
    }
    await expect(
      set([
        { task: 'commerce.expire', every: 1000 },
        { task: 'commerce.expire', every: 2000 },
      ]),
    ).rejects.toThrow('is scheduled twice');
    expect(await inspect('q.core').getJobSchedulers()).toEqual([]);
    expect(() => defineTask('expire', () => Promise.resolve())).toThrow('must be <module>.<task>');
  });

  it('runs scheduled tasks on the queue and records each run', async () => {
    let runs = 0;
    await set([{ task: 'commerce.expireCarts', every: 200 }]);
    const started = startConsumer({
      mongo: consumerMongo,
      redis: redis.client,
      logger,
      queue: 'q.core',
      subscriptions: [],
      tasks: [
        defineTask('commerce.expireCarts', () => {
          runs += 1;
          return Promise.resolve();
        }),
      ],
      prefix,
    });
    consumers.push(started);
    await waitFor(() => runs >= 2, 3000);
    const run = await taskRuns().findOne({ _id: 'commerce.expireCarts' });
    expect(run?.lastFinishedAt).toBeInstanceOf(Date);
    expect(run?.lastError).toBeNull();
    expect(run?.firstSeenAt).toBeInstanceOf(Date);
  });

  it('records a failed run without making a dead letter (the next run comes anyway)', async () => {
    await set([{ task: 'commerce.expireCarts', every: 200 }]);
    consumers.push(
      startConsumer({
        mongo: consumerMongo,
        redis: redis.client,
        logger,
        queue: 'q.core',
        subscriptions: [],
        tasks: [
          defineTask('commerce.expireCarts', () => Promise.reject(new Error('index missing'))),
        ],
        prefix,
      }),
    );
    await waitFor(
      async () =>
        ((await taskRuns().findOne({ _id: 'commerce.expireCarts' }))?.lastError ?? null) !== null,
    );
    const run = await taskRuns().findOne({ _id: 'commerce.expireCarts' });
    expect(run).toMatchObject({ lastError: { name: 'Error', message: 'index missing' } });
    expect(run?.lastFailedAt).toBeInstanceOf(Date);
    expect(await consumerMongo.db.collection(DEAD_LETTERS).countDocuments()).toBe(0);
    expect(lines.some((l) => l.msg === 'scheduled task failed')).toBe(true);
  });

  it('refuses the same task twice in one consumer', () => {
    const task = defineTask('commerce.expireCarts', () => Promise.resolve());
    expect(() =>
      startConsumer({
        mongo: consumerMongo,
        redis: redis.client,
        logger,
        queue: 'q.core',
        subscriptions: [],
        tasks: [task, task],
        prefix,
      }),
    ).toThrow('Task commerce.expireCarts is declared twice');
  });

  it('tells which tasks are late, and the heartbeat logs them', async () => {
    const schedules: Schedule[] = [
      { task: 'commerce.expireCarts', every: 1000 },
      { task: 'finance.closeDay', pattern: '0 0 * * *', maxGapMs: 5000 },
      { task: 'platform.heartbeat', every: 1000 },
    ];
    await set(schedules);
    const later = (ms: number) => new Date(Date.now() + ms);
    expect(await lateTasks(consumerMongo, schedules)).toEqual([]);
    // the default gap is twice `every`: 1.5 s after a 1 s schedule is not late yet
    expect(await lateTasks(consumerMongo, schedules, later(1500))).toEqual([]);
    expect(await lateTasks(consumerMongo, schedules, later(3000))).toEqual([
      'commerce.expireCarts',
      'platform.heartbeat',
    ]);
    expect(await lateTasks(consumerMongo, schedules, later(6000))).toEqual([
      'commerce.expireCarts',
      'finance.closeDay',
      'platform.heartbeat',
    ]);
    // a finished run restarts the clock
    await taskRuns().updateOne(
      { _id: 'commerce.expireCarts' },
      { $set: { lastFinishedAt: later(2500) } },
    );
    expect(await lateTasks(consumerMongo, schedules.slice(0, 1), later(3000))).toEqual([]);
    // a task never seen is late
    expect(await lateTasks(consumerMongo, [{ task: 'catalog.reindex', every: 1000 }])).toEqual([
      'catalog.reindex',
    ]);
    const beat = heartbeatTask(consumerMongo, schedules, logger);
    await beat.run({ firedAt: new Date() });
    expect(lines.some((l) => l.msg === 'scheduled tasks on time')).toBe(true);
    // the heartbeat's own record is old too: it never reports itself, only the others
    await taskRuns().updateMany(
      { _id: { $in: ['finance.closeDay', 'platform.heartbeat'] } },
      { $set: { firstSeenAt: new Date(Date.now() - 10_000) } },
    );
    await beat.run({ firedAt: new Date() });
    expect(lines.find((l) => l.msg === 'scheduled tasks are late')).toMatchObject({
      tasks: ['finance.closeDay'],
    });
  });
});

describe('startWipeWatchdog', () => {
  const epochKey = `${prefix}:epoch`;
  const watchdogs: WipeWatchdog[] = [];
  afterEach(async () => {
    await Promise.all(watchdogs.splice(0).map((watchdog) => watchdog.stop()));
  });
  const watch = (recover: () => Promise<void>): WipeWatchdog => {
    const started = startWipeWatchdog({
      mongo: consumerMongo,
      redis: redis.client,
      logger,
      recover,
      intervalMs: 60_000,
      epochKey,
    });
    watchdogs.push(started);
    return started;
  };
  const known = async () =>
    (
      await consumerMongo.db
        .collection<{ _id: string; value: string }>(PLATFORM_STATE)
        .findOne({ _id: 'redis-epoch' })
    )?.value;

  it('recovers once on its first start (a new Redis), and remembers the epoch', async () => {
    let recovered = 0;
    const running = watch(() => {
      recovered += 1;
      return Promise.resolve();
    });
    await waitFor(() => recovered === 1);
    await waitFor(async () => (await known()) !== undefined);
    expect(await running.check()).toBe(false);
    expect(recovered).toBe(1);
    expect(await known()).toBe(await redis.client.get(epochKey));
    expect(lines.some((l) => l.msg === 'redis recovery done')).toBe(true);
  });

  it('recovers again after a wipe, under a new epoch', async () => {
    let recovered = 0;
    const running = watch(() => {
      recovered += 1;
      return Promise.resolve();
    });
    await waitFor(() => recovered === 1);
    await waitFor(async () => (await known()) !== undefined);
    const before = await redis.client.get(epochKey);
    await redis.client.del(epochKey);
    expect(await running.check()).toBe(true);
    expect(recovered).toBe(2);
    const after = await redis.client.get(epochKey);
    expect(after).not.toBe(before);
    expect(await known()).toBe(after);
  });

  it('recovers when another deployable already named the new epoch', async () => {
    let recovered = 0;
    const running = watch(() => {
      recovered += 1;
      return Promise.resolve();
    });
    await waitFor(() => recovered === 1);
    await waitFor(async () => (await known()) !== undefined);
    await redis.client.set(epochKey, 'set-by-identity');
    expect(await running.check()).toBe(true);
    expect(await known()).toBe('set-by-identity');
  });

  it('tries a failed recovery again on the next look', async () => {
    let tries = 0;
    const running = watch(() => {
      tries += 1;
      return tries === 1 ? Promise.reject(new Error('mongo busy')) : Promise.resolve();
    });
    await waitFor(() => tries === 1);
    await waitFor(() =>
      lines.some((l) => l.msg === 'redis recovery failed, retrying on the next look'),
    );
    expect(await known()).toBeUndefined();
    expect(lines.some((l) => l.msg === 'redis recovery failed, retrying on the next look')).toBe(
      true,
    );
    expect(await running.check()).toBe(true);
    expect(await known()).toBe(await redis.client.get(epochKey));
  });

  it('hands the next recovery to another instance (the lease is given back)', async () => {
    let recovered = 0;
    const count = () => {
      recovered += 1;
      return Promise.resolve();
    };
    const first = watch(count);
    await waitFor(async () => (await known()) !== undefined);
    await first.stop();
    await redis.client.del(epochKey);
    const second = watch(count);
    await waitFor(() => recovered === 2, 2000);
    expect(await second.check()).toBe(false);
  });

  it('lets one instance of the deployable recover', async () => {
    let recovered = 0;
    const slow = async () => {
      recovered += 1;
      await sleep(300);
    };
    const first = watch(slow);
    const second = watch(slow);
    await Promise.all([first.check(), second.check()]);
    await sleep(400);
    expect(recovered).toBe(1);
  });
});

describe('redriveOutbox', () => {
  const subscribers = { 'commerce.order.placed': ['notify.emails'] };

  /** Relays `count` orders, then empties Redis: the state right after a wipe. */
  async function relayedThenWiped(count: number): Promise<string[]> {
    const running = relay({ subscribers });
    const ids: string[] = [];
    for (let i = 0; i < count; i += 1) ids.push((await placeOrder(`w${String(i)}`)).eventId);
    await waitFor(allRelayed);
    await running.stop();
    await clearQueues();
    return ids;
  }

  it('sends the last 48 hours again under the same job ids, and nothing older', async () => {
    const [old, ...recent] = await relayedThenWiped(3);
    await outbox().updateOne(
      { _id: old },
      { $set: { createdAt: new Date(Date.now() - 3 * 24 * 3_600_000) } },
    );
    const sent = await redriveOutbox({ mongo, redis: redis.client, logger, subscribers, prefix });
    expect(sent).toBe(2);
    for (const id of recent) {
      expect(await inspect('q.notify').getJob(jobIdOf(id, 'notify.emails'))).toBeTruthy();
    }
    expect(await inspect('q.notify').getJob(jobIdOf(old ?? '', 'notify.emails'))).toBeUndefined();
    expect(lines.find((l) => l.msg === 'outbox redriven')).toMatchObject({ jobs: 2 });
  });

  it('waits for the queues to drain between batches, so a small Redis does not fill up', async () => {
    await relayedThenWiped(5);
    emailConsumer();
    const sent = await redriveOutbox({
      mongo,
      redis: redis.client,
      logger,
      subscribers,
      prefix,
      batchSize: 2,
      maxWaiting: 1,
    });
    expect(sent).toBe(5);
    await waitFor(async () => (await emailCount()) === 5);
  });

  it('gives up when a queue does not drain, so the watchdog can try again later', async () => {
    await relayedThenWiped(3);
    await expect(
      redriveOutbox({
        mongo,
        redis: redis.client,
        logger,
        subscribers,
        prefix,
        batchSize: 1,
        maxWaiting: 1,
        drainTimeoutMs: 300,
      }),
    ).rejects.toThrow('Queue q.notify did not drain below 1 waiting jobs');
  });
});

describe('redriveDeadLetters', () => {
  /** Puts an event on q.notify with a single try, so a failure is a dead letter at once. */
  const deliverOnce = (envelope: { eventId: string }) =>
    inspect('q.notify').add('notify.emails', envelope, {
      jobId: jobIdOf(envelope.eventId, 'notify.emails'),
      attempts: 1,
      removeOnFail: { count: 20 },
    });

  it('sends fixed dead letters to their queue again and removes them', async () => {
    let broken = true;
    emailConsumer(async (event, session) => {
      if (broken) throw new Error('template missing');
      await consumerMongo.db
        .collection<{ _id: string; orderId: string }>('emails')
        .insertOne({ _id: event.eventId, orderId: event.data.orderId }, { session });
    });
    const first = await placeOrder('d1');
    const second = await placeOrder('d2');
    await deliverOnce(first);
    await deliverOnce(second);
    const letters = consumerMongo.db.collection(DEAD_LETTERS);
    await waitFor(async () => (await letters.countDocuments()) === 2);
    broken = false;
    // only the one asked for
    const result = await redriveDeadLetters({
      mongo: consumerMongo,
      redis: redis.client,
      logger,
      ids: [jobIdOf(first.eventId, 'notify.emails')],
      prefix,
    });
    expect(result).toEqual({ sent: [jobIdOf(first.eventId, 'notify.emails')], skipped: [] });
    await waitFor(async () => (await emailCount()) === 1);
    expect(await letters.countDocuments()).toBe(1);
    // then all the rest
    expect(
      (await redriveDeadLetters({ mongo: consumerMongo, redis: redis.client, logger, prefix }))
        .sent,
    ).toHaveLength(1);
    await waitFor(async () => (await emailCount()) === 2);
    expect(await letters.countDocuments()).toBe(0);
  });

  it('leaves a dead letter alone while its job is still running', async () => {
    emailConsumer(async () => {
      await sleep(1500);
    });
    const placed = await placeOrder('d3');
    const id = jobIdOf(placed.eventId, 'notify.emails');
    await deliverOnce(placed);
    await waitFor(async () => (await inspect('q.notify').getJob(id))?.isActive() ?? false);
    await consumerMongo.db.collection<{ _id: string }>(DEAD_LETTERS).insertOne({
      _id: id,
      queue: 'q.notify',
      subscriber: 'notify.emails',
      eventId: placed.eventId,
      type: placed.type,
      envelope: placed,
      error: { name: 'Error', message: 'old' },
      attempts: 1,
      failedAt: new Date(),
    } as never);
    expect(
      await redriveDeadLetters({ mongo: consumerMongo, redis: redis.client, logger, prefix }),
    ).toEqual({ sent: [], skipped: [id] });
    expect(await consumerMongo.db.collection(DEAD_LETTERS).countDocuments()).toBe(1);
  });
});
