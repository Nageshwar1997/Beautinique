import { RELEASE_STATE, releaseFingerprint } from '@beautinique/backend-server-release';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { readConfig } from '../src/config.ts';
import { releaseDefinition } from '../src/release.ts';
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
      host: '127.0.0.1',
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
      host: '127.0.0.1',
      handleSignals: false,
      runtime: { queuePrefix: prefix, epochKey, consume: false },
    });
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

  it('is not ready while its queue worker is not running', async () => {
    const server = await start(testConfig(dbName), {
      port: 0,
      host: '127.0.0.1',
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
      redisUrl: env.CORE__REDIS_URL,
      outboxRelay: 'poll',
    });
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
      start(config, { port: 0, host: '127.0.0.1', handleSignals: false }),
    ).rejects.toThrow();
    await waitFor(async () => (await connections()) <= before);
  });
});
