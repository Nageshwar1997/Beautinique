import type { Logger, ReadyCheck } from '@beautinique/backend-server-kit';
import { connectMongo, type Mongo } from '@beautinique/backend-server-mongo';
import { connectRedis, type RedisConnection } from '@beautinique/backend-server-queue';

import type { Config } from './config.ts';
import { runReleaseSteps } from './release.ts';

/** identity's connections: its own MongoDB database and Redis. */
export interface Runtime {
  mongo: Mongo;
  redis: RedisConnection;
  /** The checks for GET /ready. */
  ready: Readonly<Record<string, ReadyCheck>>;
  /** Closes Redis, then MongoDB. Safe to call twice. */
  stop(): Promise<void>;
}

/**
 * Connects to identity's MongoDB database, runs the release steps (migrations, indexes) and connects
 * to Redis. The outbox relay and the queue worker come with identity's first event (TASKS T3.1).
 * If one step fails, the ones before it are closed again and the error goes on.
 */
export async function startRuntime(
  config: Config,
  { logger }: { logger: Logger },
): Promise<Runtime> {
  const closers: (() => Promise<void>)[] = [];
  const stop = async () => {
    for (const close of closers.splice(0).toReversed()) await close();
  };
  try {
    const mongo = await connectMongo({
      uri: config.mongoUri,
      dbName: config.mongoDbName,
      appName: 'identity',
      logger,
    });
    closers.push(() => mongo.close());
    // migrations and indexes before anything uses the database (ARCHITECTURE §11.1)
    await runReleaseSteps(mongo, logger);
    const redis = await connectRedis({ url: config.redisUrl, name: 'identity', logger });
    closers.push(() => redis.close());
    return { mongo, redis, ready: { mongo: mongo.ready, redis: redis.ready }, stop };
  } catch (error) {
    await stop();
    throw error;
  }
}
