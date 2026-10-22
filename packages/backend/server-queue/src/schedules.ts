import type { Logger } from '@beautinique/backend-server-kit';
import type { Mongo } from '@beautinique/backend-server-mongo';
import type { Redis } from 'ioredis';

import { openQueue } from './relay';

/** When each scheduled task last ran: the heartbeat reads it (ARCHITECTURE §5.3). */
export const TASK_RUNS = 'platform_task_runs';

/** `<module>.<task>`, e.g. `commerce.expireCarts`. */
const TASK_NAME = /^[a-z][a-zA-Z0-9]*\.[a-z][a-zA-Z0-9]*$/;

/** Work that runs on a schedule, not because of an event. It may run again: keep it idempotent. */
export interface Task {
  name: string;
  run: (context: { firedAt: Date }) => Promise<void>;
}

/** One task's timing: `every` ms, or a cron `pattern` (India time unless `tz` says otherwise). */
export interface Schedule {
  task: string;
  every?: number;
  pattern?: string;
  tz?: string;
  /** The longest gap between finished runs before the heartbeat calls it late (default 2 × every; needed with pattern). */
  maxGapMs?: number;
}

export interface TaskRun {
  _id: string;
  /** When the schedule was first set: a task that never ran is late only after its gap from here. */
  firstSeenAt: Date;
  lastStartedAt?: Date;
  lastFinishedAt?: Date;
  lastFailedAt?: Date;
  lastError?: { name: string; message: string } | null;
}

export function defineTask(name: string, run: Task['run']): Task {
  if (!TASK_NAME.test(name)) throw new Error(`Task "${name}" must be <module>.<task>`);
  return { name, run };
}

const gapOf = (schedule: Schedule): number => {
  if (schedule.maxGapMs !== undefined) return schedule.maxGapMs;
  if (schedule.every !== undefined) return schedule.every * 2;
  throw new Error(`Schedule "${schedule.task}" uses a pattern: give it maxGapMs`);
};

/** Wrong schedules throw before anything is changed in Redis. */
function checkSchedules(schedules: readonly Schedule[]): void {
  const names = new Set<string>();
  for (const schedule of schedules) {
    if (!TASK_NAME.test(schedule.task)) {
      throw new Error(`Task "${schedule.task}" must be <module>.<task>`);
    }
    if (names.has(schedule.task)) throw new Error(`Task "${schedule.task}" is scheduled twice`);
    names.add(schedule.task);
    if ((schedule.every === undefined) === (schedule.pattern === undefined)) {
      throw new Error(`Schedule "${schedule.task}" needs exactly one of every or pattern`);
    }
    if (schedule.every !== undefined && !(schedule.every > 0)) {
      throw new Error(`Schedule "${schedule.task}" every must be above 0 ms`);
    }
    gapOf(schedule);
  }
}

export interface UpsertSchedulesOptions {
  /** The deployable's own database (task run times live there). */
  mongo: Mongo;
  redis: Redis;
  logger: Logger;
  /** The deployable's queue: its consumer runs the tasks. */
  queue: string;
  schedules: readonly Schedule[];
  /** BullMQ key prefix (default `bull`). */
  prefix?: string;
}

/**
 * Makes the queue's BullMQ job schedulers exactly `schedules`: adds or updates each one and removes
 * any left from older code. Safe to repeat: at every start, and after a Redis wipe (the schedulers
 * live in Redis and are gone with it). No setInterval anywhere (ARCHITECTURE §5.3).
 */
export async function upsertSchedules({
  mongo,
  redis,
  logger,
  queue,
  schedules,
  prefix = 'bull',
}: UpsertSchedulesOptions): Promise<void> {
  checkSchedules(schedules);
  const runs = mongo.db.collection<TaskRun>(TASK_RUNS);
  const open = openQueue(queue, redis, prefix, (error) => {
    logger.warn({ err: { name: error.name, message: error.message } }, 'schedule queue error');
  });
  try {
    for (const schedule of schedules) {
      const timing =
        schedule.every === undefined
          ? { pattern: schedule.pattern ?? '', tz: schedule.tz ?? 'Asia/Kolkata' }
          : { every: schedule.every };
      await open.upsertJobScheduler(schedule.task, timing, {
        name: schedule.task,
        data: { task: schedule.task },
        opts: { removeOnComplete: true, removeOnFail: { count: 20 } },
      });
      await runs.updateOne(
        { _id: schedule.task },
        { $setOnInsert: { firstSeenAt: new Date() } },
        { upsert: true },
      );
    }
    const wanted = new Set(schedules.map((schedule) => schedule.task));
    for (const existing of await open.getJobSchedulers()) {
      if (!wanted.has(existing.key)) await open.removeJobScheduler(existing.key);
    }
  } finally {
    await open.close();
  }
  logger.info({ queue, tasks: [...schedules.map((schedule) => schedule.task)] }, 'schedules set');
}

/** The scheduled tasks whose last finished run is older than their gap (or that never finished). */
export async function lateTasks(
  mongo: Mongo,
  schedules: readonly Schedule[],
  now: Date = new Date(),
): Promise<string[]> {
  const runs = mongo.db.collection<TaskRun>(TASK_RUNS);
  const late: string[] = [];
  for (const schedule of schedules) {
    const run = await runs.findOne({ _id: schedule.task });
    const since = run?.lastFinishedAt ?? run?.firstSeenAt;
    if (!since || now.getTime() - since.getTime() > gapOf(schedule)) late.push(schedule.task);
  }
  return late;
}

/**
 * The one heartbeat task: checks every other schedule's last run in MongoDB and logs an error for
 * late ones (Sentry's free plan has a single cron monitor, so this one task watches them all).
 */
export function heartbeatTask(
  mongo: Mongo,
  schedules: readonly Schedule[],
  logger: Logger,
  name = 'platform.heartbeat',
): Task {
  return defineTask(name, async () => {
    const late = await lateTasks(
      mongo,
      schedules.filter((schedule) => schedule.task !== name),
    );
    if (late.length > 0) logger.error({ tasks: late }, 'scheduled tasks are late');
    else logger.info('scheduled tasks on time');
  });
}
