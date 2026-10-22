import { hostname } from 'node:os';
import { setTimeout as sleep } from 'node:timers/promises';

import type { Logger } from '@beautinique/backend-server-kit';
import type { Mongo } from '@beautinique/backend-server-mongo';
import { uuidv7 } from '@beautinique/shared-utils';
import type { Queue } from 'bullmq';
import type { Redis } from 'ioredis';

import { releaseLease, tryLease } from './lock';
import { OUTBOX, type OutboxRecord } from './outbox';
import {
  checkSubscribers,
  defaultQueueOf,
  jobIdOf,
  openQueue,
  RELAY_JOB_OPTIONS,
  type RelayOptions,
} from './relay';

/** Written once into an empty Redis; when it is gone or changed, Redis was wiped (ARCHITECTURE §6.6). */
export const EPOCH_KEY = 'bq:epoch';

/** A deployable's small facts about the platform: here, the Redis epoch it last recovered for. */
export const PLATFORM_STATE = 'platform_state';

/** The lease a deployable's instances share, so one of them recovers. */
export const RECOVERY_LEASE = 'redis-recovery';

interface StateRecord {
  _id: string;
  value: string;
  recoveredAt: Date;
}

export interface WipeWatchdogOptions {
  /** The deployable's own database (its last known epoch and the recovery lease live there). */
  mongo: Mongo;
  redis: Redis;
  logger: Logger;
  /**
   * What this deployable restores after a wipe: its schedules (upsertSchedules), its outbox
   * (redriveOutbox), and its own keys (Identity: revoked and frozen sessions). Must be safe to repeat.
   */
  recover: () => Promise<void>;
  /** How often to look (default 30 s). */
  intervalMs?: number;
  /** How long one recovery may hold the lease (default 10 min). */
  lockTtlMs?: number;
  /** The Redis key (default `bq:epoch`). */
  epochKey?: string;
}

export interface WipeWatchdog {
  /** Looks now (after any look in progress): true when it ran a recovery. */
  check(): Promise<boolean>;
  stop(): Promise<void>;
}

/**
 * Notices a Redis wipe and recovers this deployable. Render's free Key Value restarts empty now and
 * then while Node keeps running (ioredis just reconnects), taking queued jobs and schedulers with it.
 * The `bq:epoch` key (no TTL) is shared by every deployable, so each one remembers in its own
 * database which epoch it last recovered for: a missing key gets a new one, and any epoch this
 * deployable has not recovered for (also on its very first start) runs `recover` once, behind a
 * lease, then is remembered. A failed recovery is tried again on the next look. This loop is the one
 * timer outside BullMQ (ARCHITECTURE §6.6): the schedulers it would rely on are gone in a wipe.
 */
export function startWipeWatchdog({
  mongo,
  redis,
  logger,
  recover,
  intervalMs = 30_000,
  lockTtlMs = 10 * 60_000,
  epochKey = EPOCH_KEY,
}: WipeWatchdogOptions): WipeWatchdog {
  const state = mongo.db.collection<StateRecord>(PLATFORM_STATE);
  const owner = `${hostname()}:${String(process.pid)}:${uuidv7()}`;
  let stopped = false;
  let timer: NodeJS.Timeout | undefined;
  let running: Promise<boolean> | undefined;
  let lastProblem = 0;
  // read through a function: TypeScript would keep `stopped` narrowed across an await
  const isStopped = (): boolean => stopped;

  async function look(): Promise<boolean> {
    let epoch = await redis.get(epochKey);
    if (epoch === null) {
      // an empty Redis: the first instance to notice names the new epoch
      await redis.set(epochKey, uuidv7(), 'NX');
      epoch = await redis.get(epochKey);
      if (epoch === null) throw new Error(`Redis did not keep ${epochKey}`);
    }
    const known = await state.findOne({ _id: 'redis-epoch' });
    if (known?.value === epoch) return false;
    if (!(await tryLease(mongo, RECOVERY_LEASE, owner, lockTtlMs))) return false;
    try {
      // another instance may have finished while this one waited for the lease
      if ((await state.findOne({ _id: 'redis-epoch' }))?.value === epoch) return false;
      logger.warn({ epoch }, 'redis was wiped or is new: recovering');
      await recover();
      await state.updateOne(
        { _id: 'redis-epoch' },
        { $set: { value: epoch, recoveredAt: new Date() } },
        { upsert: true },
      );
      logger.info({ epoch }, 'redis recovery done');
      return true;
    } finally {
      await releaseLease(mongo, RECOVERY_LEASE, owner).catch(() => undefined);
    }
  }

  async function check(): Promise<boolean> {
    // one look at a time: a look in progress finishes first, then a fresh one starts
    while (running) await running;
    const current = look()
      .catch((error: unknown) => {
        if (Date.now() - lastProblem >= 10_000) {
          lastProblem = Date.now();
          const { name, message } = error instanceof Error ? error : new Error(String(error));
          logger.error(
            { err: { name, message } },
            'redis recovery failed, retrying on the next look',
          );
        }
        return false;
      })
      .finally(() => {
        if (running === current) running = undefined;
      });
    running = current;
    return await current;
  }

  const loop = async (): Promise<void> => {
    if (stopped) return;
    await check();
    if (isStopped()) return;
    timer = setTimeout(() => {
      void loop();
    }, intervalMs);
    // the watchdog alone never keeps the process alive
    timer.unref();
  };
  void loop();

  return {
    check,
    stop: async () => {
      stopped = true;
      clearTimeout(timer);
      await running;
    },
  };
}

export interface RedriveOutboxOptions {
  mongo: Mongo;
  redis: Redis;
  logger: Logger;
  /** The relay's subscriber list (`startRelay`'s `subscribers`). */
  subscribers: RelayOptions['subscribers'];
  queueOf?: (subscriber: string) => string;
  /** BullMQ key prefix (default `bull`). */
  prefix?: string;
  /** How far back (default 48 hours: the longest retry window, ARCHITECTURE §6.6). */
  sinceMs?: number;
  /** Events per batch (default 200). */
  batchSize?: number;
  /** The next batch waits until every queue has fewer waiting jobs than this (default 100). */
  maxWaiting?: number;
  /** How long to wait for queues to drain before giving up (default 5 min; the watchdog retries). */
  drainTimeoutMs?: number;
}

/**
 * After a wipe, sends the relayed events of the last 48 hours again, under the same job ids, in
 * batches, waiting between batches for the queues to drain so a small Redis does not fill up.
 * Consumers skip what they already handled. Pending events need nothing: the relay sends them.
 * Returns how many jobs it made.
 */
export async function redriveOutbox({
  mongo,
  redis,
  logger,
  subscribers,
  queueOf = defaultQueueOf,
  prefix = 'bull',
  sinceMs = 48 * 60 * 60 * 1000,
  batchSize = 200,
  maxWaiting = 100,
  drainTimeoutMs = 5 * 60_000,
}: RedriveOutboxOptions): Promise<number> {
  checkSubscribers(subscribers);
  const outbox = mongo.db.collection<OutboxRecord>(OUTBOX);
  const since = new Date(Date.now() - sinceMs);
  const queues = new Map<string, Queue>();
  const queue = (name: string): Queue => {
    let open = queues.get(name);
    if (!open) {
      open = openQueue(name, redis, prefix, (error) => {
        logger.warn({ err: { name: error.name, message: error.message } }, 'redrive queue error');
      });
      queues.set(name, open);
    }
    return open;
  };
  let sent = 0;
  let after: string | undefined;
  try {
    for (;;) {
      const batch = await outbox
        .find({
          status: 'relayed',
          createdAt: { $gte: since },
          ...(after === undefined ? {} : { _id: { $gt: after } }),
        })
        .sort({ _id: 1 })
        .limit(batchSize)
        .toArray();
      if (batch.length === 0) break;
      for (const record of batch) {
        for (const subscriber of subscribers[record.type] ?? []) {
          await queue(queueOf(subscriber)).add(subscriber, record.envelope, {
            ...RELAY_JOB_OPTIONS,
            jobId: jobIdOf(record._id, subscriber),
          });
          sent += 1;
        }
      }
      after = batch.at(-1)?._id;
      await untilDrained([...queues.values()], maxWaiting, drainTimeoutMs);
    }
  } finally {
    await Promise.all([...queues.values()].map((open) => open.close()));
  }
  logger.info({ jobs: sent }, 'outbox redriven');
  return sent;
}

/** Waits until every queue has fewer than `maxWaiting` waiting jobs, or throws after `timeoutMs`. */
async function untilDrained(queues: Queue[], maxWaiting: number, timeoutMs: number): Promise<void> {
  const end = Date.now() + timeoutMs;
  for (;;) {
    const counts = await Promise.all(queues.map((open) => open.getWaitingCount()));
    const full = queues.filter((_open, i) => (counts[i] ?? 0) >= maxWaiting);
    if (full.length === 0) return;
    if (Date.now() >= end) {
      throw new Error(
        `Queue ${full.map((open) => open.name).join(', ')} did not drain below ${String(maxWaiting)} waiting jobs; the redrive stops and resumes on the next look`,
      );
    }
    await sleep(250);
  }
}
