import { randomUUID } from 'node:crypto';

import { generateKey } from '@beautinique/backend-server-crypto';
import { createLogger } from '@beautinique/backend-server-kit';
import { connectMongo } from '@beautinique/backend-server-mongo';
import { RELEASE_STATE } from '@beautinique/backend-server-release';
import { afterAll, describe, expect, it } from 'vitest';

import { readConfig } from '../src/config.ts';
import { release, start } from '../src/service.ts';

// The laptop's and CI's local services (`npm run infra:up`), in a test database of its own.
const MONGO_URI = 'mongodb://localhost:27017/?replicaSet=rs0';
const REDIS_URL = 'redis://localhost:6379';
const dbName = `bq_test_identity_${randomUUID().slice(0, 8)}`;
const logger = createLogger({ name: 'identity-test', level: 'silent' });
// made per run, so no key-looking literal sits in the repo (gitleaks)
const FIELD_KEYS = `k1:${generateKey()}`;
const BLIND_INDEX_KEY = `b1:${generateKey()}`;
const OTP_EVENT_KEYS = `e1:${generateKey()}`;

afterAll(async () => {
  const mongo = await connectMongo({ uri: MONGO_URI, dbName, appName: 'identity-test', logger });
  await mongo.db.dropDatabase();
  await mongo.close();
});

const testEnv = (): Record<string, string> => ({
  IDENTITY__LOG_LEVEL: 'silent',
  IDENTITY__MONGO_URI: MONGO_URI,
  IDENTITY__MONGO_DB_NAME: dbName,
  IDENTITY__REDIS_URL: REDIS_URL,
  IDENTITY__FIELD_KEYS: FIELD_KEYS,
  IDENTITY__BLIND_INDEX_KEY: BLIND_INDEX_KEY,
  IDENTITY__OTP_EVENT_KEYS: OTP_EVENT_KEYS,
});

describe('identity', () => {
  it('answers /health and /ready, and turns unknown paths into the contracts error body', async () => {
    const server = await start(readConfig({ env: testEnv() }), {
      port: 0,
      host: '127.0.0.1',
      handleSignals: false,
    });
    try {
      const health = await fetch(`${server.url}/health`);
      expect(await health.json()).toEqual({ status: 'ok' });
      const ready = await fetch(`${server.url}/ready`);
      expect(ready.status).toBe(200);
      expect(await ready.json()).toEqual({
        status: 'ready',
        checks: { mongo: 'ok', redis: 'ok', outbox: 'ok' },
      });
      expect(server.runtime.mongo.db.databaseName).toBe(dbName);
      const missing = await fetch(`${server.url}/nope`);
      expect(missing.status).toBe(404);
      expect(await missing.json()).toMatchObject({ error: { code: 'NOT_FOUND' } });
    } finally {
      await server.stop();
    }
  });

  it('reads IDENTITY__* settings, with defaults, and names a bad one without showing its value', () => {
    const env = testEnv();
    expect(readConfig({ env: { ...env, IDENTITY__MONGO_DB_NAME: undefined } })).toEqual({
      port: 8081,
      logLevel: 'silent',
      mongoUri: MONGO_URI,
      mongoDbName: 'bq_identity',
      redisUrl: REDIS_URL,
      outboxRelay: 'poll',
      fieldKeys: FIELD_KEYS,
      blindIndexKey: BLIND_INDEX_KEY,
      otpEventKeys: OTP_EVENT_KEYS,
      otpEmailLimitPerHour: 5,
      legalVersion: 'dummy-1',
      hibpUrl: 'https://api.pwnedpasswords.com',
    });
    expect(readConfig({ env: { ...env, IDENTITY__PORT: '9001' } }).port).toBe(9001);
    expect(() => readConfig({ env: { ...env, IDENTITY__PORT: 'abc' } })).toThrow('IDENTITY__PORT');
    expect(() => readConfig({ env: { ...env, IDENTITY__MONGO_URI: undefined } })).toThrow(
      'IDENTITY__MONGO_URI',
    );
    expect(() => readConfig({ env: { ...env, IDENTITY__REDIS_URL: undefined } })).toThrow(
      'IDENTITY__REDIS_URL',
    );
    expect(() =>
      readConfig({ env: { ...env, IDENTITY__MONGO_URI: 'localhost:27017/secret-db' } }),
    ).toThrow(/IDENTITY__MONGO_URI: Use a MongoDB connection string$/);
    expect(() => readConfig({ env: { ...env, IDENTITY__REDIS_URL: 'localhost:6379' } })).toThrow(
      /IDENTITY__REDIS_URL: Use a Redis URL$/,
    );
    expect(readConfig({ env: { ...env, IDENTITY__HIBP_URL: 'http://127.0.0.1:9' } }).hibpUrl).toBe(
      'http://127.0.0.1:9',
    );
    expect(() =>
      readConfig({ env: { ...env, IDENTITY__HIBP_URL: 'https://api.pwnedpasswords.com/range' } }),
    ).toThrow('IDENTITY__HIBP_URL: Use a base URL');
  });

  it('runs its release steps in its own database before it listens, and only once per release', async () => {
    const server = await start(readConfig({ env: testEnv() }), {
      port: 0,
      host: '127.0.0.1',
      handleSignals: false,
    });
    try {
      const state = await server.runtime.mongo.db.collection(RELEASE_STATE).findOne({});
      expect(state).toMatchObject({ _id: 'current', fingerprint: expect.any(String) as unknown });
    } finally {
      await server.stop();
    }
    // npm run db:release: the same release, so nothing runs
    const report = await release(readConfig({ env: testEnv() }), { logger });
    expect(report).toMatchObject({ upToDate: true, migrations: [], steps: [] });
    const forced = await release(readConfig({ env: testEnv() }), { logger, force: true });
    expect(forced).toMatchObject({ upToDate: false });
  });

  it('does not start when Redis is unreachable, and closes the MongoDB connection it had opened', async () => {
    const look = await connectMongo({ uri: MONGO_URI, dbName, appName: 'identity-test', logger });
    try {
      const connections = async () => {
        const status = await look.client.db('admin').command({ serverStatus: 1 });
        return (status as { connections: { current: number } }).connections.current;
      };
      const before = await connections();
      const config = { ...readConfig({ env: testEnv() }), redisUrl: 'redis://127.0.0.1:1' };
      await expect(
        start(config, { port: 0, host: '127.0.0.1', handleSignals: false }),
      ).rejects.toThrow();
      const end = Date.now() + 8000;
      while ((await connections()) > before) {
        if (Date.now() > end) throw new Error('identity kept its MongoDB connections open');
        await new Promise((resolve) => setTimeout(resolve, 25));
      }
    } finally {
      await look.close();
    }
  });
});
