import { randomUUID } from 'node:crypto';
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
        checks: Object.fromEntries(names.filter((n) => n !== 'gateway').map((n) => [n, 'ok'])),
      });
    } finally {
      await bundle.stop();
    }
    await expect(fetch(`${bundle.url}/health`)).rejects.toThrow();
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
