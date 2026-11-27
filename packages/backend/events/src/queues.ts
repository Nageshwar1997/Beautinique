import type { Service } from '@beautinique/shared-contracts';
import { Queue, Worker, type Job } from 'bullmq';
import { Redis } from 'ioredis';
import type { Db } from 'mongodb';

import type { Alert, EventsLogger } from './inbox.ts';
import type { Requeue } from './ticker.ts';
import { subscriberService } from './subscriber.ts';

/** The queue of the whole process for heavy work: PDF, export, import, media (§4 rule 3). */
export const HEAVY_QUEUE = 'heavy';

/** How many jobs of a service's light queue run at once. */
export const LIGHT_CONCURRENCY = 2;

/** How many heavy jobs run at once in the process (512 MB, R-007). */
export const HEAVY_CONCURRENCY = 1;

/** How many times a job is tried, with a longer wait each time, before it fails for good. */
export const JOB_ATTEMPTS = 5;

/** The wait before the second try of a job; it doubles for each try after. */
export const JOB_BACKOFF_MS = 30_000;

/** How many pending records of a kind one requeue puts back. */
export const REQUEUE_BATCH_SIZE = 500;

/** A failed job stays this long (so the same record is not put back at once), then goes. */
export const FAILED_JOB_AGE_SECONDS = 7 * 24 * 60 * 60;

export type QueueName = 'light' | 'heavy';

export interface JobKind {
  /** `<service>.<thing>.<work>`, like `notify.email.send`. The service owns the record. */
  name: string;
  queue: QueueName;
  /**
   * The ids of records whose work is pending in the database (oldest first, up to `limit`):
   * what the ticker puts back on the queue when Valkey has lost it (R-010).
   */
  pending(db: Db, limit: number): Promise<string[]>;
  /**
   * Does the work of one record. It reads the record's state first and does nothing when it is
   * done, and marks it done as it ends: so a job that comes twice works once (§4 rule 4).
   */
  run(recordId: string, context: { db: Db }): Promise<void>;
}

const KIND = /^([a-z]+)(\.[a-z][A-Za-z0-9]*){2}$/;
// A record's id, in the job's id: BullMQ takes no `:` in an id.
const RECORD_ID = /^[A-Za-z0-9_-]{1,128}$/;

/** A kind of job, checked once at boot. */
export function defineJob(kind: JobKind): JobKind {
  if (!KIND.test(kind.name)) {
    throw new RangeError(
      `The job ${kind.name} is not <service>.<thing>.<work>, like notify.email.send.`,
    );
  }
  subscriberService(kind.name.slice(0, kind.name.indexOf('.')));
  // Checked as what it is at run time: a caller in plain JavaScript may give anything.
  const queue: unknown = kind.queue;
  if (queue !== 'light' && queue !== 'heavy') {
    throw new RangeError(`The queue of ${kind.name} is light or heavy.`);
  }
  return kind;
}

/** The job's id: its kind and its record's id, so the same record's work is one job (§4 rule 2). */
export function jobIdOf(kind: string, recordId: string): string {
  if (!RECORD_ID.test(recordId)) {
    throw new RangeError(`The record id of a ${kind} job is 1 to 128 letters, digits, _ and -.`);
  }
  return `${kind}.${recordId}`;
}

/**
 * The one Valkey connection that the queues of a process share (each worker adds its own for
 * waiting). BullMQ needs `maxRetriesPerRequest: null`; the rate limit counter, which must fail at
 * once when Valkey is down, has a connection of its own.
 */
export function createQueueConnection(url: string, name: string): Redis {
  return new Redis(url, { connectionName: name, maxRetriesPerRequest: null });
}

export interface JobQueuesOptions {
  connection: Redis;
  /** The keys' prefix in Valkey, like `bq`. */
  prefix: string;
  logger: EventsLogger;
  alert: Alert;
}

export interface ServiceJobs extends Requeue {
  /** Puts a record's work on its queue; once only while the job is there. Call it after the commit. */
  enqueue(kind: JobKind, recordId: string): Promise<void>;
}

export interface JobQueues {
  /** The jobs of one service: its light queue, and its heavy kinds on the process's heavy queue. */
  service(service: Service, options: { db: Db; kinds: readonly JobKind[] }): ServiceJobs;
  /** Starts the workers: one for each service's light queue, and one for the heavy queue. */
  startWorkers(): void;
  /** Stops the workers (their jobs end first) and the queues. The connection stays the caller's. */
  close(): Promise<void>;
}

interface Registered {
  kind: JobKind;
  db: Db;
}

/**
 * The job queues of a process (docs/ARCHITECTURE.md §4 rules 2 and 3): BullMQ only runs the work;
 * the record of the work is in the database, and the job's id is the record's. A job holds only
 * the record's id, never personal data.
 */
export function createJobQueues({
  connection,
  prefix,
  logger,
  alert,
}: JobQueuesOptions): JobQueues {
  const kinds = new Map<string, Registered>();
  const queues = new Map<string, Queue>();
  const workers: Worker[] = [];
  const services = new Set<string>();

  const queueOf = (name: string): Queue => {
    let queue = queues.get(name);
    if (queue === undefined) {
      queue = new Queue(name, {
        connection,
        prefix,
        defaultJobOptions: {
          attempts: JOB_ATTEMPTS,
          backoff: { type: 'exponential', delay: JOB_BACKOFF_MS },
          removeOnComplete: true,
          removeOnFail: { age: FAILED_JOB_AGE_SECONDS },
        },
      });
      queues.set(name, queue);
    }
    return queue;
  };

  async function runJob(job: Job<{ recordId: string }>): Promise<void> {
    const registered = kinds.get(job.name);
    if (registered === undefined) throw new RangeError(`No kind takes the job ${job.name}.`);
    await registered.kind.run(job.data.recordId, { db: registered.db });
  }

  function onFailed(job: Job<{ recordId: string }> | undefined, thrown: Error): void {
    if (job === undefined) return;
    const details = { job: job.name, recordId: job.data.recordId, attempts: job.attemptsMade };
    if (job.attemptsMade < (job.opts.attempts ?? 1)) {
      logger.warn({ ...details, err: thrown }, 'A job failed and will be tried again.');
      return;
    }
    logger.error({ ...details, err: thrown }, 'A job failed after its last try.');
    Promise.resolve(
      alert({
        kind: 'events.jobFailed',
        severity: 2,
        service: job.name.slice(0, job.name.indexOf('.')),
        message: `The job ${job.name} failed after ${String(job.attemptsMade)} tries.`,
        details,
      }),
    ).catch((raised: unknown) => {
      logger.error({ ...details, err: raised }, 'The alert of a failed job could not be raised.');
    });
  }

  return {
    service(service, { db, kinds: given }) {
      if (services.has(service)) throw new RangeError(`The jobs of ${service} are given twice.`);
      // All checked first: a service that is refused leaves nothing behind.
      const names = new Set<string>();
      for (const kind of given) {
        defineJob(kind);
        if (!kind.name.startsWith(`${service}.`)) {
          throw new RangeError(`The job ${kind.name} is not of ${service}.`);
        }
        if (names.has(kind.name)) throw new RangeError(`The job ${kind.name} is given twice.`);
        names.add(kind.name);
      }
      services.add(service);
      const own = [...given];
      for (const kind of own) kinds.set(kind.name, { kind, db });
      const queueFor = (kind: JobKind): Queue =>
        queueOf(kind.queue === 'heavy' ? HEAVY_QUEUE : service);
      return {
        async enqueue(kind, recordId) {
          if (kinds.get(kind.name)?.kind !== kind)
            throw new RangeError(`The job ${kind.name} is not of ${service}.`);
          await queueFor(kind).add(
            kind.name,
            { recordId },
            { jobId: jobIdOf(kind.name, recordId) },
          );
        },
        async requeuePending() {
          let count = 0;
          for (const kind of own) {
            const ids = await kind.pending(db, REQUEUE_BATCH_SIZE);
            if (ids.length === 0) continue;
            // A job that is there already (waiting, running, or failed for good) is not added again.
            await queueFor(kind).addBulk(
              ids.map((recordId) => ({
                name: kind.name,
                data: { recordId },
                opts: { jobId: jobIdOf(kind.name, recordId) },
              })),
            );
            count += ids.length;
          }
          return count;
        },
      };
    },
    startWorkers() {
      if (workers.length > 0) return;
      const names = [...services].sort();
      for (const name of [...names, HEAVY_QUEUE]) {
        const worker = new Worker(name, runJob, {
          connection,
          prefix,
          concurrency: name === HEAVY_QUEUE ? HEAVY_CONCURRENCY : LIGHT_CONCURRENCY,
        });
        worker.on('failed', onFailed);
        worker.on('error', (thrown) => {
          logger.error({ err: thrown, queue: name }, 'A job worker had an error.');
        });
        workers.push(worker);
      }
    },
    async close() {
      await Promise.all(workers.map((worker) => worker.close()));
      workers.length = 0;
      await Promise.all([...queues.values()].map((queue) => queue.close()));
      queues.clear();
    },
  };
}
