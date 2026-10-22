import type { Logger, ReadyCheck } from '@beautinique/backend-server-kit';
import {
  type ClientSession,
  type Mongo,
  ParallelTransactionError,
  TransactionAbortedError,
  withTransaction,
} from '@beautinique/backend-server-mongo';
import type { EventDefinition, EventEnvelope } from '@beautinique/shared-contracts';
import { type Job, type RedisOptions, UnrecoverableError, Worker } from 'bullmq';
import type { Redis } from 'ioredis';

import { assertSubscriber, jobIdOf } from './relay';
import { type Task, TASK_RUNS, type TaskRun } from './schedules';

/** Events a subscriber has handled: its effect and this row commit together, so a repeat is skipped. */
export const PROCESSED_EVENTS = 'platform_processed_events';

/** Events that failed every try (or can never succeed), kept for a person to look at and redrive. */
export const DEAD_LETTERS = 'platform_dead_letters';

/** Handled-event rows outlive every redelivery: retries, and the 48-hour Redis wipe redrive. */
export const PROCESSED_KEEP_SECONDS = 7 * 24 * 60 * 60;

/** Dead letters stay 14 days (ARCHITECTURE §5.2). */
export const DEAD_LETTER_KEEP_SECONDS = 14 * 24 * 60 * 60;

/** One subscriber's handling of one event type and version. */
export interface Subscription<Definition extends EventDefinition = EventDefinition> {
  /** `<deployable>.<module>`, the same name the producer's relay sends the job under. */
  subscriber: string;
  event: Definition;
  /**
   * The effect, inside the transaction that also marks the event handled. Only database work: it
   * can run again after a failure, so emails or payment calls go through the outbox instead.
   */
  handle: (event: EventEnvelope<Definition>, session: ClientSession) => Promise<void>;
}

/** Declares a subscription with the handler typed by the event's contract. */
export function subscribe<Definition extends EventDefinition>(
  subscriber: string,
  event: Definition,
  handle: Subscription<Definition>['handle'],
): Subscription {
  assertSubscriber(subscriber, event.type);
  return { subscriber, event, handle: handle as Subscription['handle'] };
}

export interface ConsumerOptions {
  /** The consumer deployable's own database (handled events and dead letters live there). */
  mongo: Mongo;
  /** The deployable's shared Redis client; the worker opens its own two connections from it. */
  redis: Redis;
  logger: Logger;
  /** The queue to work (`q.<deployable>` on the free plan). */
  queue: string;
  subscriptions: readonly Subscription[];
  /** Scheduled tasks this queue runs (their schedules come from upsertSchedules). */
  tasks?: readonly Task[];
  /** BullMQ key prefix (default `bull`). */
  prefix?: string;
  /** Jobs at a time (default 1: Atlas free has about 100 operations a second for everything). */
  concurrency?: number;
}

export interface Consumer {
  /** For /ready: true while the worker runs. */
  ready: ReadyCheck;
  /** Finishes the job in hand, then closes the worker and its connections (not the shared client). */
  stop(): Promise<void>;
}

export interface DeadLetter {
  _id: string;
  queue: string;
  subscriber: string;
  eventId: string;
  type: string;
  envelope: unknown;
  error: { name: string; message: string };
  attempts: number;
  failedAt: Date;
}

/** The consumer's indexes: handled events and dead letters expire on their own. Safe to repeat. */
export async function ensureConsumerIndexes(mongo: Mongo): Promise<void> {
  await mongo.db
    .collection(PROCESSED_EVENTS)
    .createIndex(
      { processedAt: 1 },
      { name: 'processed_expiry', expireAfterSeconds: PROCESSED_KEEP_SECONDS },
    );
  await mongo.db
    .collection(DEAD_LETTERS)
    .createIndex(
      { failedAt: 1 },
      { name: 'dead_letter_expiry', expireAfterSeconds: DEAD_LETTER_KEEP_SECONDS },
    );
}

/** The shared client's address and reconnect rules, for the worker's own connections. */
function workerConnection(redis: Redis): RedisOptions {
  const { host, port, username, password, db, tls, family, connectTimeout, retryStrategy } =
    redis.options;
  const picked = { host, port, username, password, db, tls, family, connectTimeout, retryStrategy };
  return {
    ...Object.fromEntries(Object.entries(picked).filter(([, value]) => value !== undefined)),
    maxRetriesPerRequest: null,
  };
}

const keyOf = (subscriber: string, type: unknown, version: unknown): string =>
  `${subscriber}|${String(type)}@v${String(version)}`;

/** Errors no retry can fix: they go to the dead letters at once. */
const isPermanent = (error: unknown): boolean =>
  error instanceof UnrecoverableError ||
  error instanceof ParallelTransactionError ||
  error instanceof TransactionAbortedError;

const describe = (error: unknown): { name: string; message: string } => {
  const { name, message } = error instanceof Error ? error : new Error(String(error));
  return { name, message: message.slice(0, 500) };
};

/**
 * Works one queue: checks each event against its contract, runs the subscriber's handler and marks
 * the event handled in one transaction, so a repeat delivery has no second effect (delivery is at
 * least once, the effect once). A failure is retried with the job's backoff; after the last try, or
 * at once when no retry can help (unknown event, broken contract, a handler bug the transaction
 * helper caught), the event goes to `platform_dead_letters` with the error.
 */
export function startConsumer({
  mongo,
  redis,
  logger,
  queue,
  subscriptions,
  tasks = [],
  prefix = 'bull',
  concurrency = 1,
}: ConsumerOptions): Consumer {
  const routes = new Map<string, Subscription>();
  for (const subscription of subscriptions) {
    assertSubscriber(subscription.subscriber, subscription.event.type);
    const key = keyOf(subscription.subscriber, subscription.event.type, subscription.event.version);
    if (routes.has(key)) throw new Error(`Subscription ${key} is declared twice`);
    routes.set(key, subscription);
  }
  const processed = mongo.db.collection<{ _id: string }>(PROCESSED_EVENTS);
  const deadLetters = mongo.db.collection<DeadLetter>(DEAD_LETTERS);
  const taskRuns = mongo.db.collection<TaskRun>(TASK_RUNS);
  const taskByName = new Map<string, Task>();
  for (const task of tasks) {
    if (taskByName.has(task.name)) throw new Error(`Task ${task.name} is declared twice`);
    taskByName.set(task.name, task);
  }

  /**
   * A scheduled run. Its start, finish or error go to platform_task_runs for the heartbeat; a failed
   * run is not a dead letter (the next run comes anyway) but stays in Redis's failed list.
   */
  async function runTask(job: Job, name: string): Promise<void> {
    const task = taskByName.get(name);
    if (!task) {
      logger.error({ task: name }, 'scheduled task has no handler');
      throw new UnrecoverableError(`No task ${name} on ${queue}`);
    }
    await taskRuns.updateOne(
      { _id: name },
      { $set: { lastStartedAt: new Date() }, $setOnInsert: { firstSeenAt: new Date() } },
      { upsert: true },
    );
    try {
      await task.run({ firedAt: new Date(job.timestamp) });
    } catch (error) {
      await taskRuns.updateOne(
        { _id: name },
        { $set: { lastFailedAt: new Date(), lastError: describe(error) } },
      );
      logger.error({ task: name, err: describe(error) }, 'scheduled task failed');
      throw error;
    }
    await taskRuns.updateOne(
      { _id: name },
      { $set: { lastFinishedAt: new Date(), lastError: null } },
    );
  }

  async function handle(job: Job): Promise<void> {
    const data = job.data as { eventId?: unknown; type?: unknown; version?: unknown };
    const subscription = routes.get(keyOf(job.name, data.type, data.version));
    if (!subscription) {
      throw new UnrecoverableError(
        `No handler for ${String(data.type)} v${String(data.version)} at ${job.name}`,
      );
    }
    const parsed = subscription.event.envelope.safeParse(job.data);
    if (!parsed.success) {
      const fields = parsed.error.issues.map((issue) => issue.path.join('.') || '(root)');
      throw new UnrecoverableError(
        `Event ${String(data.eventId)} breaks its contract at: ${fields.join(', ')}`,
      );
    }
    const event = parsed.data;
    const handled = await withTransaction(mongo, async (session) => {
      const mark = await processed.updateOne(
        { _id: jobIdOf(event.eventId, job.name) },
        {
          $setOnInsert: {
            eventId: event.eventId,
            subscriber: job.name,
            type: event.type,
            processedAt: new Date(),
          },
        },
        { upsert: true, session },
      );
      // handled before (a redelivery): nothing to do
      if (mark.upsertedCount === 0) return false;
      await subscription.handle(event, session);
      return true;
    });
    if (!handled)
      logger.info({ eventId: event.eventId, subscriber: job.name }, 'event seen again, skipped');
  }

  async function deadLetter(job: Job, error: unknown, attempts: number): Promise<void> {
    const data = job.data as { eventId?: unknown; type?: unknown };
    const record: DeadLetter = {
      _id: job.id ?? `${String(data.eventId)}@${job.name}`,
      queue,
      subscriber: job.name,
      eventId: String(data.eventId),
      type: String(data.type),
      envelope: job.data,
      error: describe(error),
      attempts,
      failedAt: new Date(),
    };
    try {
      await deadLetters.replaceOne({ _id: record._id }, record, { upsert: true });
    } catch (writeError) {
      // MongoDB away as well: the job still waits in Redis's failed list (the last 20)
      logger.error({ err: describe(writeError), eventId: record.eventId }, 'dead letter not saved');
    }
    logger.error(
      {
        eventId: record.eventId,
        type: record.type,
        subscriber: record.subscriber,
        attempts,
        err: record.error,
      },
      'event dead-lettered',
    );
  }

  const worker = new Worker(
    queue,
    async (job: Job) => {
      const { task } = job.data as { task?: unknown };
      if (typeof task === 'string') {
        await runTask(job, task);
        return;
      }
      const attempt = job.attemptsMade + 1;
      try {
        await handle(job);
      } catch (error) {
        const last = attempt >= (job.opts.attempts ?? 1);
        if (isPermanent(error) || last) {
          await deadLetter(job, error, attempt);
          throw error instanceof UnrecoverableError
            ? error
            : new UnrecoverableError(describe(error).message);
        }
        logger.warn(
          {
            eventId: (job.data as { eventId?: unknown }).eventId,
            subscriber: job.name,
            attempt,
            err: describe(error),
          },
          'event handling failed, will retry',
        );
        throw error;
      }
    },
    {
      // own connections from the shared client's address: blocking reads need
      // maxRetriesPerRequest null, unlike the shared client
      connection: workerConnection(redis),
      prefix,
      concurrency,
    },
  );
  // an 'error' event without a listener crashes the process (Redis away is normal on Render)
  let lastProblem = 0;
  worker.on('error', (error) => {
    if (Date.now() - lastProblem < 10_000) return;
    lastProblem = Date.now();
    logger.warn({ err: describe(error) }, 'event consumer error');
  });
  let stopped = false;

  return {
    ready: () => Promise.resolve(!stopped && worker.isRunning()),
    stop: async () => {
      if (stopped) return;
      stopped = true;
      await worker.close();
      logger.info({ queue }, 'event consumer stopped');
    },
  };
}
