import { LOOPBACK_HOST } from '@beautinique/backend-server-kit';
import { PLATFORM_STATE, TASK_RUNS } from '@beautinique/backend-server-queue';
import { RELEASE_STATE, releaseFingerprint } from '@beautinique/backend-server-release';
import { events } from '@beautinique/shared-contracts';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { readConfig } from '../src/config.ts';
import { subscribers } from '../src/modules/index.ts';
import { releaseDefinitionOf } from '../src/release.ts';
import { SCHEDULES } from '../src/runtime.ts';
import {
  type Inspector,
  inspector,
  isolation,
  start,
  testConfig,
  testEnv,
  waitFor,
} from './support.ts';

const { dbName, prefix, epochKey } = isolation();
let look: Inspector;

beforeAll(async () => {
  look = await inspector(dbName);
});
afterAll(async () => {
  await look.cleanUp(prefix, epochKey);
});

describe('core', () => {
  it('answers /health and /ready, and turns unknown paths into the contracts error body', async () => {
    const server = await start(testConfig(dbName), {
      port: 0,
      host: LOOPBACK_HOST,
      handleSignals: false,
      runtime: { queuePrefix: prefix, epochKey },
    });
    try {
      const health = await fetch(`${server.url}/health`);
      expect(await health.json()).toEqual({ status: 'ok' });
      const ready = await fetch(`${server.url}/ready`);
      expect(ready.status).toBe(200);
      expect(await ready.json()).toEqual({
        status: 'ready',
        checks: { mongo: 'ok', redis: 'ok', outbox: 'ok', events: 'ok' },
      });
      const missing = await fetch(`${server.url}/nope`);
      expect(missing.status).toBe(404);
      expect(await missing.json()).toMatchObject({ error: { code: 'NOT_FOUND' } });
    } finally {
      await server.stop();
    }
  });

  it('makes every index in its release steps before it listens, and records the release', async () => {
    const server = await start(testConfig(dbName), {
      port: 0,
      host: LOOPBACK_HOST,
      handleSignals: false,
      runtime: { queuePrefix: prefix, epochKey, consume: false },
    });
    const releaseDefinition = releaseDefinitionOf(testConfig(dbName).auditDbName);
    try {
      for (const { collection, name } of releaseDefinition.indexes) {
        const names = (await look.mongo.db.collection(collection).indexes()).map((i) => i.name);
        expect(names, `${collection}.${name}`).toContain(name);
      }
      expect(releaseDefinition.indexes.map((i) => `${i.collection}.${i.name}`)).toEqual(
        expect.arrayContaining([
          'platform_outbox.status_createdAt',
          'platform_processed_events.processed_expiry',
          'platform_pings.recordedAt_ttl',
        ]) as unknown,
      );
      expect(await look.mongo.db.collection(RELEASE_STATE).findOne({})).toMatchObject({
        fingerprint: releaseFingerprint(releaseDefinition),
      });
    } finally {
      await server.stop();
    }
  });

  it('sets its schedules at every start, also on a Redis it already recovered for (LIVE-006)', async () => {
    // a Redis that lives on from the last release: the watchdog has nothing to recover
    const ownPrefix = `${prefix}s`;
    const epoch = `epoch-${ownPrefix}`;
    await look.redis.client.set(epochKey, epoch);
    await look.mongo.db
      .collection(PLATFORM_STATE)
      .updateOne(
        { key: 'redis-epoch' },
        { $set: { value: epoch, recoveredAt: new Date() } },
        { upsert: true },
      );
    const server = await start(testConfig(dbName), {
      port: 0,
      host: LOOPBACK_HOST,
      handleSignals: false,
      runtime: { queuePrefix: ownPrefix, epochKey, consume: false },
    });
    try {
      const runs = await look.mongo.db
        .collection<{ task: string; firstSeenAt: Date }>(TASK_RUNS)
        .find({ task: { $in: SCHEDULES.map((schedule) => schedule.task) } })
        .toArray();
      expect(runs.map((run) => run.task).sort()).toEqual(
        SCHEDULES.map((schedule) => schedule.task).sort(),
      );
      // and the schedulers are in this Redis, under this start's prefix
      expect(await look.redis.client.keys(`${ownPrefix}:q.core:*`)).not.toEqual([]);
    } finally {
      await server.stop();
      const keys = await look.redis.client.keys(`${ownPrefix}:*`);
      if (keys.length > 0) await look.redis.client.del(...keys);
    }
  });

  it('routes every event type it writes, and only those (LIVE-006: an unrouted type waits)', () => {
    const written = [
      ...new Set(
        events
          .all()
          .filter((event) => event.producer === 'core')
          .map((event) => event.type),
      ),
    ].sort();
    expect(Object.keys(subscribers).sort()).toEqual(written);
  });

  it('is not ready while its queue worker is not running', async () => {
    const server = await start(testConfig(dbName), {
      port: 0,
      host: LOOPBACK_HOST,
      handleSignals: false,
      runtime: { queuePrefix: prefix, epochKey, consume: false },
    });
    try {
      const ready = await fetch(`${server.url}/ready`);
      expect(ready.status).toBe(503);
      expect(await ready.json()).toMatchObject({ checks: { events: 'failing', mongo: 'ok' } });
    } finally {
      await server.stop();
    }
  });

  it('reads CORE__* settings, with defaults, and names a bad one without showing its value', () => {
    const env = testEnv('bq_core_x');
    expect(readConfig({ env })).toEqual({
      port: 8084,
      logLevel: 'silent',
      mongoUri: env.CORE__MONGO_URI,
      mongoDbName: 'bq_core_x',
      auditDbName: 'bq_core_x_audit',
      redisUrl: env.CORE__REDIS_URL,
      outboxRelay: 'poll',
      passportJwksUrl: 'http://localhost:8080/.well-known/passport-jwks.json',
    });
    // live, the audit log has its own database by default
    expect(readConfig({ env: { ...env, CORE__AUDIT_DB_NAME: undefined } }).auditDbName).toBe(
      'bq_audit',
    );
    expect(readConfig({ env: { ...env, CORE__PORT: '9001' } }).port).toBe(9001);
    expect(readConfig({ env: { ...env, CORE__OUTBOX_RELAY: 'changestream' } }).outboxRelay).toBe(
      'changestream',
    );
    expect(() => readConfig({ env: { ...env, CORE__PORT: 'abc' } })).toThrow('CORE__PORT');
    expect(() => readConfig({ env: { ...env, CORE__OUTBOX_RELAY: 'push' } })).toThrow(
      'CORE__OUTBOX_RELAY',
    );
    expect(() => readConfig({ env: { ...env, CORE__MONGO_URI: undefined } })).toThrow(
      'CORE__MONGO_URI',
    );
    expect(() => readConfig({ env: { ...env, CORE__REDIS_URL: undefined } })).toThrow(
      'CORE__REDIS_URL',
    );
    expect(() =>
      readConfig({ env: { ...env, CORE__MONGO_URI: 'localhost:27017/secret-db' } }),
    ).toThrow(/CORE__MONGO_URI: Use a MongoDB connection string$/);
  });

  it('does not start when Redis is unreachable, and closes the MongoDB connection it had opened', async () => {
    const connections = async () => {
      const status = await look.mongo.client.db('admin').command({ serverStatus: 1 });
      return (status as { connections: { current: number } }).connections.current;
    };
    const before = await connections();
    const config = { ...testConfig(dbName), redisUrl: 'redis://127.0.0.1:1' };
    await expect(
      start(config, { port: 0, host: LOOPBACK_HOST, handleSignals: false }),
    ).rejects.toThrow();
    await waitFor(async () => (await connections()) <= before);
  });
});
