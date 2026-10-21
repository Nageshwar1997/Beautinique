import { hostname } from 'node:os';

import type { Logger, ReadyCheck } from '@beautinique/backend-server-kit';
import type { ChangeStream, Mongo } from '@beautinique/backend-server-mongo';
import { DEPLOYABLES } from '@beautinique/shared-contracts';
import { uuidv7 } from '@beautinique/shared-utils';
import { Queue } from 'bullmq';
import type { Redis } from 'ioredis';

import { releaseLease, tryLease } from './lock';
import { OUTBOX, type OutboxRecord } from './outbox';

/** `poll` on Atlas free (5 change streams per cluster), `changestream` on the laptop and paid tiers. */
export type RelayMode = 'poll' | 'changestream';

export interface RelayOptions {
  mongo: Mongo;
  /** The deployable's shared Redis client (`connectRedis().client`); the relay never closes it. */
  redis: Redis;
  logger: Logger;
  mode: RelayMode;
  /**
   * Who gets each event type, as `<deployable>.<module>`:
   * `{ 'sellers.org.approved': ['identity.grants', 'notify.emails'] }`.
   */
  subscribers: Readonly<Record<string, readonly string[]>>;
  /** A subscriber's queue (default `q.<deployable>`: one queue per deployable on the free plan). */
  queueOf?: (subscriber: string) => string;
  /** BullMQ key prefix (default `bull`, so keys are `bull:<queue>:*`, ARCHITECTURE §6.6). */
  prefix?: string;
  /** `poll` mode: how often to look for new events (default 1 s). */
  pollMs?: number;
  /** `changestream` mode: the safety sweep for anything the stream missed (default 5 s). */
  sweepMs?: number;
  /** The lease: one relaying instance at a time, also while a deploy runs two (default 15 s). */
  lockTtlMs?: number;
  /** Events per read (default 100). */
  batchSize?: number;
}

export interface Relay {
  /** Whether this instance holds the relay lease right now. */
  isLeader(): boolean;
  /** Age in ms of the oldest event not relayed yet (0 when there is none). */
  lag(): Promise<number>;
  /** For /ready: false when an event has waited 30 s or more (ARCHITECTURE §11). */
  ready: ReadyCheck;
  /** Stops relaying, gives the lease up and closes its queues (never the shared Redis client). */
  stop(): Promise<void>;
}

/** One job per event and subscriber. BullMQ forbids `:` in custom ids, hence `@`. */
export const jobIdOf = (eventId: string, subscriber: string): string => `${eventId}@${subscriber}`;

/** Retries with backoff, and Redis kept small: done jobs go at once, failed ones only the last 20. */
export const RELAY_JOB_OPTIONS = {
  attempts: 6,
  backoff: { type: 'exponential', delay: 1000 },
  removeOnComplete: true,
  removeOnFail: { count: 20 },
} as const;

/** The lease every relay of a deployable competes for. */
export const RELAY_LEASE = 'outbox-relay';

const SUBSCRIBER = /^([a-z]+)\.[a-z][a-zA-Z0-9]*$/;
const LAG_LIMIT_MS = 30_000;

const defaultQueueOf = (subscriber: string): string => `q.${subscriber.split('.')[0] ?? ''}`;

/** Wrong subscriber lists throw at start, not when the first event arrives. */
function checkSubscribers(subscribers: RelayOptions['subscribers']): void {
  for (const [type, list] of Object.entries(subscribers)) {
    if (new Set(list).size !== list.length) {
      throw new Error(`Event "${type}" lists a subscriber twice`);
    }
    for (const subscriber of list) {
      const deployable = SUBSCRIBER.exec(subscriber)?.[1];
      if (!deployable || !(DEPLOYABLES as readonly string[]).includes(deployable)) {
        throw new Error(
          `Subscriber "${subscriber}" of "${type}" must be <deployable>.<module> (deployables: ${DEPLOYABLES.join(', ')})`,
        );
      }
    }
  }
}

/**
 * Sends the outbox on to BullMQ: one job per subscriber (`jobId = <eventId>@<subscriber>`, data
 * `{ eventId, type }`; the payload stays in MongoDB), then marks the event relayed. Events go in the
 * order they were written; if Redis is away the relay stops at that event and tries again on the
 * next round. Only the instance holding the MongoDB lease relays. Delivery is at least once (a crash
 * between the job and the mark sends the event again under the same job id); consumers dedupe.
 */
export function startRelay(options: RelayOptions): Relay {
  const {
    mongo,
    redis,
    logger,
    mode,
    subscribers,
    queueOf = defaultQueueOf,
    prefix = 'bull',
    pollMs = 1000,
    sweepMs = 5000,
    lockTtlMs = 15_000,
    batchSize = 100,
  } = options;
  checkSubscribers(subscribers);
  const outbox = mongo.db.collection<OutboxRecord>(OUTBOX);
  const owner = `${hostname()}:${String(process.pid)}:${uuidv7()}`;
  const queues = new Map<string, Queue>();
  const timers = new Set<NodeJS.Timeout>();
  const inFlight = new Set<Promise<void>>();
  let leader = false;
  let stopped = false;
  let stream: ChangeStream | undefined;
  let draining: Promise<void> | undefined;
  let again = false;
  let lastProblem = 0;
  // read through functions: TypeScript would keep these narrowed across an await, but stop() and
  // drain() change them meanwhile
  const isStopped = (): boolean => stopped;
  const runAgain = (): boolean => again;

  const problem = (error: unknown, message: string) => {
    if (Date.now() - lastProblem < 10_000) return;
    lastProblem = Date.now();
    const { name, message: text } = error instanceof Error ? error : new Error(String(error));
    logger.warn({ err: { name, message: text } }, message);
  };

  const queue = (name: string): Queue => {
    let existing = queues.get(name);
    if (!existing) {
      existing = new Queue(name, {
        connection: redis,
        prefix,
        streams: { events: { maxLen: 200 } },
      });
      // an 'error' event without a listener crashes the process (Redis away is normal on Render)
      existing.on('error', (error) => {
        problem(error, 'outbox relay queue error');
      });
      queues.set(name, existing);
    }
    return existing;
  };

  /** Relays one batch; returns how many events it read. */
  async function relayBatch(): Promise<number> {
    const batch = await outbox
      .find({ status: 'pending' })
      .sort({ createdAt: 1, _id: 1 })
      .limit(batchSize)
      .toArray();
    for (const record of batch) {
      if (!leader || stopped) return 0;
      const targets = subscribers[record.type] ?? [];
      for (const subscriber of targets) {
        await queue(queueOf(subscriber)).add(
          subscriber,
          { eventId: record._id, type: record.type },
          { ...RELAY_JOB_OPTIONS, jobId: jobIdOf(record._id, subscriber) },
        );
      }
      await outbox.updateOne(
        { _id: record._id, status: 'pending' },
        { $set: { status: 'relayed', relayedAt: new Date(), subscribers: targets.length } },
      );
    }
    return batch.length;
  }

  /** Relays until nothing is pending; a call while one runs makes it go round once more. */
  function drain(): Promise<void> {
    if (draining) {
      again = true;
      return draining;
    }
    const run = async (): Promise<void> => {
      try {
        do {
          again = false;
          while (leader && !stopped && (await relayBatch()) === batchSize) {
            // a full batch: more may be waiting
          }
        } while (runAgain() && leader && !isStopped());
      } catch (error) {
        problem(error, 'outbox relay paused, retrying on the next round');
      }
    };
    // cleared in .finally, never inside run(): with nothing to await, run() finishes before this
    // assignment, and a clear inside it would leave `draining` stuck on a settled promise
    const current = run().finally(() => {
      if (draining === current) draining = undefined;
    });
    draining = current;
    return current;
  }

  function openStream(): void {
    // only insert events of committed changes; the sweep catches anything a reopen misses
    const opened = outbox.watch([{ $match: { operationType: 'insert' } }]);
    stream = opened;
    opened.on('change', () => {
      void drain();
    });
    opened.on('error', (error) => {
      problem(error, 'outbox change stream failed, reopening');
      if (stream === opened) stream = undefined;
      void opened.close().catch(() => undefined);
    });
  }

  function closeStream(): void {
    const open = stream;
    stream = undefined;
    void open?.close().catch(() => undefined);
  }

  async function holdLease(): Promise<void> {
    let holds = false;
    try {
      holds = await tryLease(mongo, RELAY_LEASE, owner, lockTtlMs);
    } catch (error) {
      problem(error, 'outbox relay could not renew its lease');
    }
    if (stopped) return;
    if (holds !== leader) {
      leader = holds;
      logger.info(holds ? 'outbox relay leading' : 'outbox relay stood down');
    }
    if (mode === 'changestream') {
      if (leader && !stream) openStream();
      if (!leader && stream) closeStream();
    }
    if (leader) void drain();
  }

  /** Runs `task` now and then every `ms`, without overlapping itself; stop() waits for a running one. */
  function every(ms: number, task: () => Promise<void>): void {
    const run = async (): Promise<void> => {
      if (stopped) return;
      const current = task();
      inFlight.add(current);
      await current;
      inFlight.delete(current);
      if (isStopped()) return;
      const timer = setTimeout(() => {
        timers.delete(timer);
        void run();
      }, ms);
      // the relay alone never keeps the process alive
      timer.unref();
      timers.add(timer);
    };
    void run();
  }

  every(Math.max(250, Math.floor(lockTtlMs / 3)), holdLease);
  every(mode === 'poll' ? pollMs : sweepMs, drain);

  async function lag(): Promise<number> {
    const oldest = await outbox
      .find({ status: 'pending' }, { projection: { createdAt: 1 } })
      .sort({ createdAt: 1 })
      .limit(1)
      .next();
    return oldest ? Math.max(0, Date.now() - oldest.createdAt.getTime()) : 0;
  }

  return {
    isLeader: () => leader,
    lag,
    ready: async () => {
      try {
        return (await lag()) < LAG_LIMIT_MS;
      } catch {
        return false;
      }
    },
    stop: async () => {
      if (stopped) return;
      stopped = true;
      for (const timer of timers) clearTimeout(timer);
      timers.clear();
      closeStream();
      await Promise.all(inFlight);
      await draining;
      await Promise.all([...queues.values()].map((open) => open.close()));
      queues.clear();
      // stand down for whoever is next, without waiting for the lease to run out
      leader = false;
      await releaseLease(mongo, RELAY_LEASE, owner).catch(() => undefined);
      logger.info('outbox relay stopped');
    },
  };
}
