import { randomBytes, randomUUID } from 'node:crypto';
import { type AddressInfo, createServer } from 'node:net';

import { ConfigError, createLogger } from '@beautinique/backend-server-kit';
import { connectMongo } from '@beautinique/backend-server-mongo';
import { connectRedis } from '@beautinique/backend-server-queue';
import { afterAll, describe, expect, it } from 'vitest';

import { startBundle } from '../src/bundle.ts';
import { readBundleConfig } from '../src/config.ts';
import { names } from '../src/deployables.ts';

// core needs MongoDB and Redis: the laptop's and CI's local ones (`npm run infra:up`). The test uses
// its own database and Redis database 5, so it never touches the data of a running dev server.
const MONGO_URI = 'mongodb://localhost:27017/?replicaSet=rs0';
const REDIS_DB = 'redis://localhost:6379/5';
const dbName = `bq_test_bundle_${randomUUID().slice(0, 8)}`;
// made per run, so no secret-looking literal sits in the repo (gitleaks)
const ORIGIN_SECRET = randomBytes(32).toString('base64url');

afterAll(async () => {
  const logger = createLogger({ name: 'bundle-test', level: 'silent' });
  const mongo = await connectMongo({ uri: MONGO_URI, dbName, appName: 'bundle-test', logger });
  await mongo.db.dropDatabase();
  await mongo.close();
  const redis = await connectRedis({ url: REDIS_DB, name: 'bundle-test', logger });
  await redis.client.flushdb();
  await redis.close();
});

const quiet = () => ({
  ...Object.fromEntries(names.map((name) => [`${name.toUpperCase()}__LOG_LEVEL`, 'silent'])),
  CORE__MONGO_URI: MONGO_URI,
  CORE__MONGO_DB_NAME: dbName,
  CORE__REDIS_URL: REDIS_DB,
  GATEWAY__REDIS_URL: REDIS_DB,
  GATEWAY__ORIGIN_SECRETS: ORIGIN_SECRET,
});

describe('bundle', () => {
  it('runs every deployable behind the gateway, then stops them all', async () => {
    const env: Record<string, string | undefined> = { ...quiet(), UNRELATED: 'kept' };
    const bundle = await startBundle({ port: 0, env });
    try {
      expect(bundle.names).toEqual(names);
      expect(env).toEqual({ UNRELATED: 'kept' });
      const ready = await fetch(`${bundle.url}/ready`);
      expect(ready.status).toBe(200);
      expect(await ready.json()).toEqual({
        status: 'ready',
        checks: {
          redis: 'ok',
          ...Object.fromEntries(names.filter((n) => n !== 'gateway').map((n) => [n, 'ok'])),
        },
      });
      const status = await fetch(`${bundle.url}/status`);
      expect(status.status).toBe(200);
      expect(await status.json()).toMatchObject({
        status: 'ok',
        deployables: { core: { status: 'ok' }, identity: { status: 'ok' } },
      });
    } finally {
      await bundle.stop();
    }
    await expect(fetch(`${bundle.url}/health`)).rejects.toThrow();
  });

  it('takes the live demo ping from an app through the gateway to core (Milestone 2)', async () => {
    const bundle = await startBundle({ port: 0, env: quiet() });
    try {
      const headers = {
        'X-BQ-App': 'customer',
        'x-origin-secret': ORIGIN_SECRET,
        'content-type': 'application/json',
      };
      const recorded = await fetch(`${bundle.url}/api/v1/platform/pings`, {
        method: 'POST',
        headers: { ...headers, 'Idempotency-Key': randomUUID() },
        body: JSON.stringify({ note: 'hello from the bundle' }),
      });
      expect(recorded.status).toBe(201);
      expect(recorded.headers.get('cache-control')).toBe('private, no-store');
      expect(recorded.headers.get('ratelimit-policy')).toBe('"write";q=20;w=60');
      const { data } = (await recorded.json()) as { data: { pingId: string; note: string } };
      expect(data.note).toBe('hello from the bundle');
      // reading a ping needs a permission: refused until sign-in exists
      const read = await fetch(`${bundle.url}/api/v1/platform/pings/${data.pingId}`, {
        headers: { ...headers, 'X-BQ-App': 'admin' },
      });
      expect(read.status).toBe(401);
      // straight to the server, without the apps' secret
      const direct = await fetch(`${bundle.url}/api/v1/platform/pings`, {
        method: 'POST',
        headers: { 'X-BQ-App': 'customer', 'content-type': 'application/json' },
        body: '{"note":"x"}',
      });
      expect(direct.status).toBe(403);
    } finally {
      await bundle.stop();
    }
  });

  it('answers the apps’ wake call through the gateway from core, never cached (T2.7)', async () => {
    const bundle = await startBundle({ port: 0, env: quiet() });
    try {
      const before = Date.now();
      const woken = await fetch(`${bundle.url}/api/v1/platform/wake`, {
        headers: { 'X-BQ-App': 'customer', 'x-origin-secret': ORIGIN_SECRET },
      });
      expect(woken.status).toBe(200);
      // a CDN copy would answer without waking the server
      expect(woken.headers.get('cache-control')).toBe('private, no-store');
      expect(woken.headers.get('ratelimit-policy')).toBe('"public";q=600;w=60');
      const { data } = (await woken.json()) as { data: { awakeAt: string } };
      expect(Date.parse(data.awakeAt)).toBeGreaterThanOrEqual(before - 1000);
      // like every /api route, not straight to the server without the apps' secret
      const direct = await fetch(`${bundle.url}/api/v1/platform/wake`, {
        headers: { 'X-BQ-App': 'customer' },
      });
      expect(direct.status).toBe(403);
    } finally {
      await bundle.stop();
    }
  });

  it('starts nothing when a config is wrong', async () => {
    await expect(
      startBundle({ port: 0, env: { ...quiet(), GATEWAY__PORT: 'abc' } }),
    ).rejects.toThrow(ConfigError);
  });

  it('stops what it started when the gateway cannot start', async () => {
    // listening servers in this process; a closed one leaves the list a moment later
    const listening = async () => {
      const count = () =>
        process.getActiveResourcesInfo().filter((resource) => resource === 'TCPServerWrap').length;
      let last = -1;
      let now = count();
      while (now !== last) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        last = now;
        now = count();
      }
      return now;
    };
    const blocker = createServer();
    await new Promise<void>((resolve) => blocker.listen(0, '0.0.0.0', resolve));
    try {
      const before = await listening();
      const { port } = blocker.address() as AddressInfo;
      await expect(startBundle({ port, env: quiet() })).rejects.toThrow('EADDRINUSE');
      expect(await listening()).toBe(before);
    } finally {
      blocker.close();
    }
  });

  it('takes the public port from PORT', () => {
    expect(readBundleConfig({}).port).toBe(8080);
    expect(readBundleConfig({ PORT: '10000' }).port).toBe(10_000);
    expect(() => readBundleConfig({ PORT: 'x' })).toThrow('PORT');
  });
});
