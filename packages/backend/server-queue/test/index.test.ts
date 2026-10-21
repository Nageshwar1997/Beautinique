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
  ensureOutboxIndexes,
  jobIdOf,
  LOCKS,
  OUTBOX,
  OUTBOX_KEEP_SECONDS,
  type OutboxRecord,
  parseRedisInfo,
  type RedisConnection,
  type Relay,
  RELAY_LEASE,
  type RelayOptions,
  releaseLease,
  startRelay,
  tryLease,
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
const inspectors: Queue[] = [];
const relays: Relay[] = [];

beforeAll(async () => {
  try {
    mongo = await connectMongo({ uri: MONGO_URI, dbName, appName: 'server-queue-test', logger });
    redis = await connectRedis({ url: REDIS_URL, name: 'server-queue-test', logger });
  } catch (error) {
    throw new Error(
      'These tests need MongoDB and Valkey: run `npm run infra:up` (or set MONGO_TEST_URI and REDIS_TEST_URL).',
      { cause: error },
    );
  }
  await ensureOutboxIndexes(mongo);
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
  if (failPointOn) {
    await mongo.client.db('admin').command({ configureFailPoint: 'failCommand', mode: 'off' });
    failPointOn = false;
  }
  await mongo.db.collection(OUTBOX).deleteMany({});
  await mongo.db.collection(LOCKS).deleteMany({});
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
    const keys = await redis.client.keys(`${prefix}:*`);
    if (keys.length > 0) await redis.client.del(...keys);
    await mongo.db.dropDatabase();
  } finally {
    await redis.close();
    await mongo.close();
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
      expect(job?.data).toEqual({ eventId: placed.eventId, type: 'commerce.order.placed' });
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
