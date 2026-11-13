import { randomUUID } from 'node:crypto';
import { Writable } from 'node:stream';

import { createLogger } from '@beautinique/backend-server-kit';
import { connectMongo, type Mongo } from '@beautinique/backend-server-mongo';
import { connectRedis, type RedisConnection } from '@beautinique/backend-server-queue';

import {
  expectNoCollectionScans,
  watchCollectionScans,
} from '../../../scripts/e2e/collection-scans.ts';
import { expectObjectIds } from '../../../scripts/e2e/object-ids.ts';
import { readConfig } from '../src/config.ts';
import { type RunningCore, start } from '../src/service.ts';
import { MONGO_URI, REDIS_URL } from './env.ts';

/** A test's own database name, queue prefix and epoch key, so tests never meet each other's data. */
export function isolation() {
  const id = randomUUID().slice(0, 8);
  return { dbName: `bq_test_core_${id}`, prefix: `bqtest${id}`, epochKey: `bq:test:epoch:${id}` };
}

export const testEnv = (dbName: string): Record<string, string> => ({
  CORE__LOG_LEVEL: 'silent',
  CORE__MONGO_URI: MONGO_URI,
  CORE__MONGO_DB_NAME: dbName,
  CORE__REDIS_URL: REDIS_URL,
});

export const testConfig = (dbName: string) => readConfig({ env: testEnv(dbName) });

/** Our own handles on the same MongoDB and Redis, to look inside and to clean up. */
export interface Inspector {
  mongo: Mongo;
  redis: RedisConnection;
  /** Removes the test database and every Redis key the test made. */
  cleanUp(prefix: string, epochKey: string): Promise<void>;
}

export async function inspector(dbName: string): Promise<Inspector> {
  const logger = createLogger({
    name: 'core-test',
    level: 'silent',
    destination: new Writable({
      write: (_chunk, _encoding, done) => {
        done();
      },
    }),
  });
  const mongo = await connectMongo({ uri: MONGO_URI, dbName, appName: 'core-test', logger });
  // before core starts: its release steps query too
  await watchCollectionScans(mongo.db);
  const redis = await connectRedis({ url: REDIS_URL, name: 'core-test', logger });
  return {
    mongo,
    redis,
    async cleanUp(prefix, epochKey) {
      try {
        // what core asked, not the test's own look-ups on this handle
        await expectNoCollectionScans(mongo.db, ['core', 'core-release']);
        // every document's _id and every reference an ObjectId (RULES §4.17)
        await expectObjectIds(mongo.db);
      } finally {
        await mongo.db.dropDatabase();
        const keys = await redis.client.keys(`${prefix}:*`);
        await redis.client.del(epochKey, ...keys);
        await redis.close();
        await mongo.close();
      }
    },
  };
}

export async function waitFor(check: () => boolean | Promise<boolean>, ms = 8000): Promise<void> {
  const end = Date.now() + ms;
  while (!(await check())) {
    if (Date.now() > end) throw new Error('timed out waiting');
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
}

export type { RunningCore };
export { start };

/** A logger whose JSON lines land in `lines`, for tests that wait for a log line. */
export function captureLogger() {
  const lines: Record<string, unknown>[] = [];
  const logger = createLogger({
    name: 'core-test',
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
  return { logger, lines };
}
