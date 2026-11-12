import { randomBytes, randomUUID } from 'node:crypto';

import { generateKey } from '@beautinique/backend-server-crypto';
import { createLogger, LOOPBACK_HOST } from '@beautinique/backend-server-kit';
import { connectMongo, ObjectId } from '@beautinique/backend-server-mongo';
import { RELEASE_STATE } from '@beautinique/backend-server-release';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  expectNoCollectionScans,
  watchCollectionScans,
} from '../../../scripts/e2e/collection-scans.ts';
import { expectObjectIds } from '../../../scripts/e2e/object-ids.ts';
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

let watch: Awaited<ReturnType<typeof connectMongo>>;

beforeAll(async () => {
  // the test's own handle (its look-ups do not count), and the watch before identity starts
  watch = await connectMongo({ uri: MONGO_URI, dbName, appName: 'identity-test', logger });
  await watchCollectionScans(watch.db);
});

afterAll(async () => {
  try {
    await expectNoCollectionScans(watch.db, ['identity', 'identity-release']);
    // every document's _id and every reference an ObjectId (RULES §4.17)
    await expectObjectIds(watch.db);
  } finally {
    await watch.db.dropDatabase();
    await watch.close();
  }
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
      host: LOOPBACK_HOST,
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
      loginHashesPerMinute: 30,
      codesPerHour: 60,
      signUpCodesPerDay: 100,
      legalVersion: 'dummy-1',
      hibpUrl: 'https://api.pwnedpasswords.com',
      passportJwksUrl: 'http://localhost:8080/.well-known/passport-jwks.json',
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

  it('reads each social login client as an ID and secret pair, with the customer app origin', () => {
    const env = testEnv();
    // made per run, so no secret-looking literal sits in the repo (gitleaks)
    const secret = randomBytes(24).toString('base64url');
    const google = {
      IDENTITY__GOOGLE_CLIENT_ID: '123-abc.apps.googleusercontent.com',
      IDENTITY__GOOGLE_CLIENT_SECRET: secret,
      IDENTITY__OAUTH_REDIRECT_ORIGIN: 'http://localhost:3001',
    };
    expect(readConfig({ env: { ...env, ...google } })).toMatchObject({
      googleClientId: '123-abc.apps.googleusercontent.com',
      googleClientSecret: secret,
      oauthRedirectOrigin: 'http://localhost:3001',
    });
    // none set: social login off, and no origin needed
    expect(readConfig({ env }).googleClientId).toBeUndefined();
    const live = {
      ...google,
      IDENTITY__OAUTH_REDIRECT_ORIGIN: 'https://beautinique-customer.vercel.app',
    };
    expect(readConfig({ env: { ...env, ...live } }).oauthRedirectOrigin).toBe(
      'https://beautinique-customer.vercel.app',
    );

    const problem = (extra: Record<string, string | undefined>) => {
      try {
        readConfig({ env: { ...env, ...extra } });
      } catch (error) {
        const message = (error as Error).message;
        expect(message).not.toContain(secret);
        return message;
      }
      throw new Error('expected a config error');
    };
    expect(problem({ ...google, IDENTITY__GOOGLE_CLIENT_ID: undefined })).toContain(
      'IDENTITY__GOOGLE_CLIENT_ID: Required with IDENTITY__GOOGLE_CLIENT_SECRET',
    );
    expect(problem({ IDENTITY__GITHUB_CLIENT_ID: 'Iv1.abc' })).toContain(
      'IDENTITY__GITHUB_CLIENT_SECRET: Required with IDENTITY__GITHUB_CLIENT_ID',
    );
    expect(problem({ IDENTITY__LINKEDIN_CLIENT_SECRET: secret })).toContain(
      'IDENTITY__LINKEDIN_CLIENT_ID: Required with IDENTITY__LINKEDIN_CLIENT_SECRET',
    );
    expect(problem({ ...google, IDENTITY__OAUTH_REDIRECT_ORIGIN: undefined })).toContain(
      'IDENTITY__OAUTH_REDIRECT_ORIGIN: Required when a social login provider is set',
    );
    // plain http only on the laptop, and an origin without a path
    for (const origin of [
      'http://beautinique-customer.vercel.app',
      'https://beautinique-customer.vercel.app/',
      'https://beautinique-customer.vercel.app/api/v1',
      'localhost:3001',
    ]) {
      expect(problem({ ...google, IDENTITY__OAUTH_REDIRECT_ORIGIN: origin }), origin).toContain(
        'IDENTITY__OAUTH_REDIRECT_ORIGIN: Use an origin like',
      );
    }
  });

  it('runs its release steps in its own database before it listens, and only once per release', async () => {
    const server = await start(readConfig({ env: testEnv() }), {
      port: 0,
      host: LOOPBACK_HOST,
      handleSignals: false,
    });
    try {
      // one release document, its _id an ObjectId like every document's
      const states = await watch.db.collection(RELEASE_STATE).find().toArray();
      expect(states).toHaveLength(1);
      expect(states[0]?._id).toBeInstanceOf(ObjectId);
      expect(states[0]).toMatchObject({ fingerprint: expect.any(String) as unknown });
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
        start(config, { port: 0, host: LOOPBACK_HOST, handleSignals: false }),
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
