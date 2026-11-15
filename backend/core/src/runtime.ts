import type { PublicJwk } from '@beautinique/backend-server-crypto';
import {
  jwksCache,
  jwksFromUrl,
  type Logger,
  type Passport,
  passportVerifier,
  type ReadyCheck,
} from '@beautinique/backend-server-kit';
import { connectMongo, type Mongo } from '@beautinique/backend-server-mongo';
import {
  connectRedis,
  type Consumer,
  heartbeatTask,
  type RedisConnection,
  redriveOutbox,
  type Relay,
  type Schedule,
  startConsumer,
  startRelay,
  startWipeWatchdog,
  upsertSchedules,
  type WipeWatchdog,
} from '@beautinique/backend-server-queue';
import { passportAudience } from '@beautinique/shared-contracts';
import type { Request } from 'express';

import type { Config } from './config.ts';
import { subscribers, subscriptionsOf } from './modules/index.ts';
import { runReleaseSteps } from './release.ts';

/** core's queue: its worker runs core's subscribers and scheduled tasks (one queue per deployable). */
export const QUEUE = 'q.core';

/** Timers live in BullMQ job schedulers, never `setInterval` (RULES §4.11). */
export const SCHEDULES: readonly Schedule[] = [{ task: 'platform.heartbeat', every: 5 * 60_000 }];

export interface RuntimeOptions {
  logger: Logger;
  /** Start the queue worker right away (default true). A test turns it off to keep events waiting. */
  consume?: boolean;
  /** BullMQ key prefix (default `bull`); a test uses its own so it never meets other keys. */
  queuePrefix?: string;
  /** The Redis key that tells a wipe (default `bq:epoch`). */
  epochKey?: string;
  /** How often the relay looks for new events (default: the relay's own). */
  pollMs?: number;
  /** How often the wipe watchdog looks (default 30 s). */
  watchdogMs?: number;
  /** The gateway's passport keys, in memory (backend/bundle); otherwise read from the config URL */
  passportJwks?: readonly PublicJwk[];
}

/** core's connections and background workers: MongoDB, Redis, the outbox relay, the queue worker. */
export interface Runtime {
  mongo: Mongo;
  redis: RedisConnection;
  relay: Relay;
  watchdog: WipeWatchdog;
  /** Who signed in, from the gateway's passport (401 without one): routes that need a caller */
  passport: (req: Request) => Promise<Passport>;
  /** Starts the queue worker if it is not running yet. */
  startConsuming(): void;
  /** The checks for GET /ready. */
  ready: Readonly<Record<string, ReadyCheck>>;
  /** Stops the workers, then closes Redis and MongoDB. Safe to call twice. */
  stop(): Promise<void>;
}

/**
 * Connects to MongoDB, runs the release steps (migrations, indexes), connects to Redis and starts
 * what the platform needs behind every deployable (ARCHITECTURE §5, §6): the outbox relay, the
 * queue worker with its scheduled tasks, and the
 * watchdog that rebuilds queue state after a Redis wipe. If one step fails, the ones before it are
 * closed again and the error goes on.
 */
export async function startRuntime(config: Config, options: RuntimeOptions): Promise<Runtime> {
  const {
    logger,
    consume = true,
    queuePrefix: prefix,
    epochKey,
    pollMs,
    watchdogMs,
    passportJwks,
  } = options;
  const closers: (() => Promise<void>)[] = [];
  const stop = async () => {
    for (const close of closers.splice(0).toReversed()) await close();
  };
  try {
    const mongo = await connectMongo({
      uri: config.mongoUri,
      dbName: config.mongoDbName,
      appName: 'core',
      logger,
    });
    closers.push(() => mongo.close());
    // migrations and indexes before anything uses the database (ARCHITECTURE §11.1)
    await runReleaseSteps(mongo, logger);
    const redis = await connectRedis({ url: config.redisUrl, name: 'core', logger });
    closers.push(() => redis.close());
    const relay = startRelay({
      mongo,
      redis: redis.client,
      logger,
      mode: config.outboxRelay,
      subscribers,
      prefix,
      pollMs,
    });
    closers.push(() => relay.stop());

    let consumer: Consumer | undefined;
    const startConsuming = () => {
      consumer ??= startConsumer({
        mongo,
        redis: redis.client,
        logger,
        queue: QUEUE,
        subscriptions: subscriptionsOf({ mongo }),
        tasks: [heartbeatTask(mongo, SCHEDULES, logger)],
        prefix,
      });
    };
    closers.push(async () => {
      await consumer?.stop();
    });
    if (consume) startConsuming();

    const watchdog = startWipeWatchdog({
      mongo,
      redis: redis.client,
      logger,
      intervalMs: watchdogMs,
      epochKey,
      recover: async () => {
        await upsertSchedules({
          mongo,
          redis: redis.client,
          logger,
          queue: QUEUE,
          schedules: SCHEDULES,
          prefix,
        });
        await redriveOutbox({ mongo, redis: redis.client, logger, subscribers, prefix });
      },
    });
    closers.push(() => watchdog.stop());

    return {
      mongo,
      redis,
      relay,
      watchdog,
      passport: passportVerifier({
        keys: jwksCache({
          load: passportJwks
            ? () => Promise.resolve({ keys: passportJwks })
            : jwksFromUrl(config.passportJwksUrl),
        }),
        audience: passportAudience('core'),
      }),
      startConsuming,
      ready: {
        mongo: mongo.ready,
        redis: redis.ready,
        outbox: relay.ready,
        events: () => consumer?.ready() ?? false,
      },
      stop,
    };
  } catch (error) {
    await stop();
    throw error;
  }
}
