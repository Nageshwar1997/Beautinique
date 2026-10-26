import type { Logger } from '@beautinique/backend-server-kit';
import { OUTBOX, PROCESSED_EVENTS } from '@beautinique/backend-server-queue';
import { createClient, getPing, recordPing } from '@beautinique/shared-contracts';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import {
  PING_AUDIT,
  PING_AUDIT_COLLECTION,
  PING_TTL_SECONDS,
} from '../src/modules/platform/index.ts';
import { PING_CAP, PINGS } from '../src/modules/platform/routes.ts';
import { QUEUE } from '../src/runtime.ts';
import {
  captureLogger,
  type Inspector,
  inspector,
  isolation,
  type RunningCore,
  start,
  testConfig,
  waitFor,
} from './support.ts';

const { dbName, prefix, epochKey } = isolation();
let look: Inspector;
const running: RunningCore[] = [];

beforeAll(async () => {
  look = await inspector(dbName);
});
afterEach(async () => {
  await Promise.all(running.splice(0).map((core) => core.stop()));
  // every test starts from an empty database and no queue state
  await Promise.all(
    (await look.mongo.db.collections()).map((collection) => collection.deleteMany({})),
  );
  const keys = await look.redis.client.keys(`${prefix}:*`);
  await look.redis.client.del(epochKey, ...keys);
});
afterAll(async () => {
  await look.cleanUp(prefix, epochKey);
});

async function startCore(options: { consume?: boolean } = {}, logger?: Logger) {
  const core = await start(testConfig(dbName), {
    port: 0,
    host: '127.0.0.1',
    handleSignals: false,
    logger,
    runtime: { queuePrefix: prefix, epochKey, pollMs: 50, watchdogMs: 200, ...options },
  });
  running.push(core);
  return core;
}

const pings = () => look.mongo.db.collection<{ _id: string; note: string }>(PINGS);
const audit = () =>
  look.mongo.db.collection<{ _id: string; pingId: string; note: string }>(PING_AUDIT_COLLECTION);
const outbox = () =>
  look.mongo.db.collection<{
    type: string;
    status: string;
    envelope: { aggregate: { id: string }; producer: string; correlationId: string };
  }>(OUTBOX);
const handled = () => look.mongo.db.collection(PROCESSED_EVENTS);
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('the sample endpoint, from the contract to the inbox', () => {
  it('records a ping and its event together; the event reaches the queue worker and is applied once', async () => {
    const core = await startCore();
    const client = createClient({ baseUrl: core.url, app: 'admin' });

    const recorded = await client.call(recordPing, { body: { note: 'first ping' } });
    expect(recorded).toMatchObject({ note: 'first ping' });
    expect(await pings().findOne({ _id: recorded.pingId })).toMatchObject({ note: 'first ping' });

    // the same transaction wrote the event, and the relay and the worker carried it to the inbox
    await waitFor(async () => (await audit().countDocuments({ pingId: recorded.pingId })) === 1);
    const events = await outbox().find({ 'envelope.aggregate.id': recorded.pingId }).toArray();
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      type: 'platform.ping.recorded',
      status: 'relayed',
      envelope: { producer: 'core', actor: { type: 'system' }, data: { note: 'first ping' } },
    });
    expect(await handled().countDocuments({ eventId: events[0]?._id })).toBe(1);
    expect(await audit().countDocuments()).toBe(1);
    expect(await audit().findOne({ pingId: recorded.pingId })).toMatchObject({
      recordedAt: new Date(recorded.recordedAt),
    });

    expect(await client.call(getPing, { params: { pingId: recorded.pingId } })).toEqual(recorded);
  });

  it('answers 201 with { data } and carries the request id into the event', async () => {
    const core = await startCore();
    const response = await fetch(`${core.url}/platform/pings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Request-Id': 'req-from-gateway' },
      body: JSON.stringify({ note: 'with id' }),
    });
    expect(response.status).toBe(201);
    const { data } = (await response.json()) as { data: { pingId: string; note: string } };
    expect(data.note).toBe('with id');
    const event = await outbox().findOne({ 'envelope.aggregate.id': data.pingId });
    expect(event?.envelope.correlationId).toBe(response.headers.get('X-Request-Id'));
  });

  it('refuses a wrong body and an unknown ping with the contracts error body, and writes nothing', async () => {
    const core = await startCore();
    const client = createClient({ baseUrl: core.url, app: 'admin' });
    await expect(client.call(recordPing, { body: { note: '' } })).rejects.toMatchObject({
      status: 400,
      code: 'VALIDATION_FAILED',
    });
    await expect(
      client.call(getPing, { params: { pingId: '019dc0de-0000-7000-8000-000000000000' } }),
    ).rejects.toMatchObject({ status: 404, code: 'NOT_FOUND' });
    const bad = await fetch(`${core.url}/platform/pings/not-an-id`);
    expect(bad.status).toBe(400);
    expect(await pings().countDocuments()).toBe(0);
    expect(await outbox().countDocuments()).toBe(0);
  });

  it('deletes pings and their audit copies 7 days after they were recorded (public demo route)', async () => {
    await startCore();
    for (const collection of [pings(), audit()]) {
      const ttl = (await collection.indexes()).find((index) => index.name === 'recordedAt_ttl');
      expect(ttl, collection.collectionName).toMatchObject({
        key: { recordedAt: 1 },
        expireAfterSeconds: PING_TTL_SECONDS,
      });
    }
    expect(PING_TTL_SECONDS).toBe(604_800);
  });

  it('keeps at most PING_CAP pings, so the public demo cannot fill the free cluster', async () => {
    const core = await startCore();
    await pings().insertMany(
      Array.from({ length: PING_CAP }, (_, index) => ({
        _id: `filler-${String(index)}`,
        note: 'x',
      })),
    );
    const response = await fetch(`${core.url}/platform/pings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: 'one too many' }),
    });
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ error: { code: 'PING_LIMIT_REACHED' } });
    expect(await pings().countDocuments()).toBe(PING_CAP);
    expect(await outbox().countDocuments()).toBe(0);
  });
});

describe('Redis wipe drill', () => {
  const redis = () => look.redis.client;
  /** Jobs for core's own subscriber that wait in the queue (the heartbeat job is not one of them). */
  const waitingEvents = async () =>
    (await redis().lrange(`${prefix}:${QUEUE}:wait`, 0, -1)).filter((id) =>
      id.endsWith(`@${PING_AUDIT}`),
    ).length;
  const schedulers = async () =>
    (await redis().keys(`${prefix}:${QUEUE}:*`)).filter((key) =>
      key.includes('platform.heartbeat'),
    );
  const wipe = async () => {
    // what a restarted Render Key Value leaves: nothing, not even the epoch key
    await redis().del(epochKey, ...(await redis().keys(`${prefix}:*`)));
  };

  it('loses no event when Redis is wiped between the outbox and the worker, and rebuilds the schedulers', async () => {
    // the worker is off, so relayed events wait in the queue, like events not yet read when Redis restarts
    const core = await startCore({ consume: false });
    const client = createClient({ baseUrl: core.url, app: 'admin' });
    await waitFor(async () => (await redis().exists(epochKey)) === 1);
    await waitFor(async () => (await schedulers()).length > 0);

    const first = await client.call(recordPing, { body: { note: 'before the wipe 1' } });
    const second = await client.call(recordPing, { body: { note: 'before the wipe 2' } });
    await waitFor(async () => (await outbox().countDocuments({ status: 'pending' })) === 0);
    await waitFor(async () => (await waitingEvents()) === 2);
    expect(await audit().countDocuments()).toBe(0);

    await wipe();
    expect(await waitingEvents()).toBe(0);
    expect(await schedulers()).toEqual([]);

    // the watchdog misses the epoch, puts the schedulers back and sends the events again
    await waitFor(async () => (await waitingEvents()) === 2);
    await waitFor(async () => (await schedulers()).length > 0);
    await waitFor(async () => (await redis().exists(epochKey)) === 1);

    // now the worker runs: both events are applied, once each
    core.runtime.startConsuming();
    await waitFor(async () => (await audit().countDocuments()) === 2);
    await sleep(300);
    expect((await audit().find().toArray()).map((row) => row.pingId).toSorted()).toEqual(
      [first.pingId, second.pingId].toSorted(),
    );
    expect(await handled().countDocuments()).toBe(2);
  }, 30_000);

  it('does not apply an event twice when a wipe sends it again after it was handled', async () => {
    const { logger, lines } = captureLogger();
    const core = await startCore({}, logger);
    const client = createClient({ baseUrl: core.url, app: 'admin' });
    const recorded = await client.call(recordPing, { body: { note: 'handled, then wipe' } });
    await waitFor(async () => (await audit().countDocuments()) === 1);
    await waitFor(async () => (await waitingEvents()) === 0);

    await wipe();
    await waitFor(async () => (await redis().exists(epochKey)) === 1);
    // the redrive sends the handled event again, and the inbox mark skips it: no second effect
    await waitFor(() => lines.some((line) => line.msg === 'event seen again, skipped'));
    expect(await audit().countDocuments({ pingId: recorded.pingId })).toBe(1);
    expect(await handled().countDocuments()).toBe(1);
  }, 30_000);
});
