import { loadSealingKeys } from '@beautinique/backend-server-crypto';
import type { Logger, ReadyCheck } from '@beautinique/backend-server-kit';
import { connectMongo, type Mongo } from '@beautinique/backend-server-mongo';
import {
  connectRedis,
  type Consumer,
  defineTask,
  heartbeatTask,
  type RedisConnection,
  type Schedule,
  startConsumer,
  startTaskTrigger,
  startWipeWatchdog,
  type TaskTrigger,
  upsertSchedules,
  type WipeWatchdog,
} from '@beautinique/backend-server-queue';

import type { Config } from './config.ts';
import { otpSubscription, securitySubscription, SEND_TASK, sendDue } from './deliveries.ts';
import { brevoSender } from './email/brevo.ts';
import { mailpitSender } from './email/mailpit.ts';
import type { EmailSender } from './email/port.ts';
import { runReleaseSteps } from './release.ts';

/** notify's queue: identity's relay sends its events here, and the send task runs here. */
export const QUEUE = 'q.notify';

/**
 * Timers live in BullMQ job schedulers, never `setInterval` (RULES §4.11). The send task also runs
 * at once after every new email; the minute run is the safety net (retries, a missed trigger).
 */
export const SCHEDULES: readonly Schedule[] = [
  { task: SEND_TASK, every: 60_000 },
  { task: 'platform.heartbeat', every: 5 * 60_000 },
];

/** The email provider the settings name: Brevo live, Mailpit on the laptop. */
export function senderOf(config: Config): EmailSender {
  const from = { email: config.emailFrom, name: config.emailFromName };
  if (config.emailTransport === 'brevo') {
    // configZod requires the key with brevo
    return brevoSender({ apiKey: config.brevoApiKey ?? '', from });
  }
  return mailpitSender({ url: config.mailpitUrl, from });
}

export interface RuntimeOptions {
  logger: Logger;
  /** default: from the settings; tests pass a fake */
  sender?: EmailSender;
  /** Start the queue worker right away (default true). */
  consume?: boolean;
  /** BullMQ key prefix (default `bull`); a test uses its own so it never meets other keys. */
  queuePrefix?: string;
  /** The Redis key that tells a wipe (default `bq:epoch`). */
  epochKey?: string;
  /** How often the wipe watchdog looks (default 30 s). */
  watchdogMs?: number;
}

/** notify's connections and background work: MongoDB, Redis, the queue worker and its tasks. */
export interface Runtime {
  mongo: Mongo;
  redis: RedisConnection;
  trigger: TaskTrigger;
  watchdog: WipeWatchdog;
  /** Starts the queue worker if it is not running yet. */
  startConsuming(): void;
  /** The checks for GET /ready. */
  ready: Readonly<Record<string, ReadyCheck>>;
  /** Stops the workers, then closes Redis and MongoDB. Safe to call twice. */
  stop(): Promise<void>;
}

/**
 * Connects to MongoDB, runs the release steps, connects to Redis and starts the queue worker
 * (identity.otp.requested → an email in the OTP lane, and the send task) with its schedules and the
 * Redis wipe watchdog. Wrong OTP event keys fail the start. If one step fails, the ones before it
 * are closed again and the error goes on.
 */
export async function startRuntime(config: Config, options: RuntimeOptions): Promise<Runtime> {
  const { logger, consume = true, queuePrefix: prefix, epochKey, watchdogMs } = options;
  const otpKeys = loadSealingKeys(config.otpEventKeys, 'NOTIFY__OTP_EVENT_KEYS');
  const sender = options.sender ?? senderOf(config);
  const closers: (() => Promise<void>)[] = [];
  const stop = async () => {
    for (const close of closers.splice(0).toReversed()) await close();
  };
  try {
    const mongo = await connectMongo({
      uri: config.mongoUri,
      dbName: config.mongoDbName,
      appName: 'notify',
      logger,
    });
    closers.push(() => mongo.close());
    // migrations and indexes before anything uses the database (ARCHITECTURE §11.1)
    await runReleaseSteps(mongo, logger);
    const redis = await connectRedis({ url: config.redisUrl, name: 'notify', logger });
    closers.push(() => redis.close());
    const trigger = startTaskTrigger({ redis: redis.client, logger, queue: QUEUE, prefix });
    closers.push(() => trigger.close());

    const tasks = [
      defineTask(SEND_TASK, async () => {
        await sendDue({
          mongo,
          sender,
          otpKeys,
          logger,
          trigger,
          limits: { daily: config.emailDailyLimit, other: config.emailOtherLimit },
        });
      }),
      heartbeatTask(mongo, SCHEDULES, logger),
    ];
    let consumer: Consumer | undefined;
    const startConsuming = () => {
      consumer ??= startConsumer({
        mongo,
        redis: redis.client,
        logger,
        queue: QUEUE,
        subscriptions: [
          otpSubscription({ mongo, trigger, logger }),
          securitySubscription({ mongo, trigger, logger }),
        ],
        tasks,
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
      // the schedulers live in Redis; lost events come back from their producers' outboxes
      recover: () =>
        upsertSchedules({
          mongo,
          redis: redis.client,
          logger,
          queue: QUEUE,
          schedules: SCHEDULES,
          prefix,
        }),
    });
    closers.push(() => watchdog.stop());

    return {
      mongo,
      redis,
      trigger,
      watchdog,
      startConsuming,
      ready: {
        mongo: mongo.ready,
        redis: redis.ready,
        events: () => consumer?.ready() ?? false,
      },
      stop,
    };
  } catch (error) {
    await stop();
    throw error;
  }
}
