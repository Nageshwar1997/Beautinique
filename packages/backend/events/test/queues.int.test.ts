import { randomUUID } from 'node:crypto';

import { defineCollection, defineCollections, releaseSchema } from '@beautinique/backend-mongo';
import { SERVICES } from '@beautinique/shared-contracts';
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { ObjectId, type Db, type MongoClient } from 'mongodb';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createJobQueues,
  createQueueConnection,
  defineJob,
  HEAVY_QUEUE,
  jobIdOf,
  type JobKind,
  type JobQueues,
} from '../src/queues.ts';
import { clockAt, recordingAlert, recordingLogger } from './utils/fixtures.ts';
import {
  connectTest,
  integrationRuns,
  MONGO_PORT,
  testDatabase,
  VALKEY_PORT,
  VALKEY_URL,
} from './utils/mongo.ts';

const runs = await integrationRuns('queues.int.test.ts', [MONGO_PORT, VALKEY_PORT]);

const emails = defineCollection({
  name: 'email_jobs',
  retention: 'tech',
  indexes: [{ name: 'status_id', key: { status: 1, _id: 1 } }],
  expiry: { never: 'A test collection.' },
  accountDelete: { none: 'A test collection.' },
});

interface EmailJob {
  _id: ObjectId;
  status: 'pending' | 'sent';
  runs: number;
}

describe.skipIf(!runs)(
  'the job queues on the real Valkey and MongoDB (docs/ARCHITECTURE.md §4 rules 2 and 3)',
  () => {
    let client: MongoClient;
    let db: Db;
    let connection: Redis;
    let queues: JobQueues | undefined;
    // Keys of their own, so a laptop's Valkey with other things in it is left as it was.
    let prefix: string;
    const logger = recordingLogger();
    const alert = recordingAlert();
    clockAt();

    // The work of one email: it reads the record first and does nothing when it is sent (§4 rule 4).
    const send = defineJob({
      name: 'notify.email.send',
      queue: 'light',
      async pending(own, limit) {
        const records = await own
          .collection<EmailJob>('email_jobs')
          .find({ status: 'pending' }, { sort: { _id: 1 }, limit, projection: { _id: 1 } })
          .toArray();
        return records.map((record) => record._id.toHexString());
      },
      async run(recordId, { db: own }) {
        const jobs = own.collection<EmailJob>('email_jobs');
        const _id = ObjectId.createFromHexString(recordId);
        // One step: only a pending record is sent, and it is sent with its count.
        await jobs.updateOne(
          { _id, status: 'pending' },
          { $set: { status: 'sent' }, $inc: { runs: 1 } },
        );
      },
    });

    async function newRecords(count: number): Promise<string[]> {
      const records = Array.from({ length: count }, () => ({
        _id: new ObjectId(),
        status: 'pending' as const,
        runs: 0,
      }));
      await db.collection<EmailJob>('email_jobs').insertMany(records);
      return records.map((record) => record._id.toHexString());
    }
    const runsOf = async (ids: string[]) =>
      (
        await db
          .collection<EmailJob>('email_jobs')
          .find({ _id: { $in: ids.map((id) => ObjectId.createFromHexString(id)) } })
          .toArray()
      ).map((record) => record.runs);
    // "Valkey is empty": every key of these tests goes (as after a restart without its data).
    async function emptyValkey(): Promise<void> {
      const keys = await connection.keys(`${prefix}:*`);
      if (keys.length > 0) await connection.del(...keys);
    }
    // A queue of the tests' own, to look into, closed after.
    async function inQueue<T>(name: string, look: (queue: Queue) => Promise<T>): Promise<T> {
      const queue = new Queue(name, { connection, prefix });
      try {
        return await look(queue);
      } finally {
        await queue.close();
      }
    }
    const waiting = (name: string) =>
      inQueue(name, (queue) => queue.getJobCounts('waiting', 'active', 'delayed'));

    beforeAll(async () => {
      ({ client } = await connectTest('queues'));
      db = testDatabase(client, 'queues');
      await releaseSchema(db, defineCollections('notify', [emails]), {
        clock: clockAt(),
        owner: 'test',
      });
      connection = createQueueConnection(VALKEY_URL, `bq-test-queues-${randomUUID().slice(0, 8)}`);
    });

    beforeEach(async () => {
      await queues?.close();
      queues = undefined;
      await emptyValkey();
      prefix = `bq-test-${randomUUID().slice(0, 8)}`;
      await db.collection('email_jobs').deleteMany({});
    });

    afterAll(async () => {
      await queues?.close();
      await emptyValkey();
      await db.dropDatabase();
      await client.close();
      connection.disconnect();
    });

    it("AC-PLATFORM-7: a job runs its record's work once, and the job id is the record's", async () => {
      queues = createJobQueues({ connection, prefix, logger, alert });
      const notify = queues.service('notify', { db, kinds: [send] });
      const [id] = await newRecords(1);
      const recordId = id as string;

      await notify.enqueue(send, recordId);
      await notify.enqueue(send, recordId);
      const job = await inQueue('notify', (queue) => queue.getJob(jobIdOf(send.name, recordId)));
      expect(job?.data).toEqual({ recordId });
      expect((await waiting('notify')).waiting).toBe(1);

      queues.startWorkers();
      await vi.waitFor(
        async () => {
          expect(await runsOf([recordId])).toEqual([1]);
        },
        { timeout: 15_000 },
      );
    });

    it("AC-PLATFORM-7: Valkey is empty: the ticker's requeue puts the pending work back, and none runs twice", async () => {
      queues = createJobQueues({ connection, prefix, logger, alert });
      const notify = queues.service('notify', { db, kinds: [send] });
      const ids = await newRecords(5);
      for (const id of ids) await notify.enqueue(send, id);

      // Valkey loses everything before a worker took them.
      await emptyValkey();
      expect((await waiting('notify')).waiting).toBe(0);

      // The ticker puts them back, twice over: still one job for each record.
      expect(await notify.requeuePending()).toBe(5);
      expect(await notify.requeuePending()).toBe(5);
      expect((await waiting('notify')).waiting).toBe(5);

      queues.startWorkers();
      await vi.waitFor(
        async () => {
          expect(await runsOf(ids)).toEqual([1, 1, 1, 1, 1]);
        },
        { timeout: 15_000 },
      );
      // Done: nothing is pending, so nothing is put back.
      expect(await notify.requeuePending()).toBe(0);
    });

    it("AC-PLATFORM-7: a heavy kind goes to the one heavy queue of the process; a light one to its service's", async () => {
      queues = createJobQueues({ connection, prefix, logger, alert });
      const build: JobKind = defineJob({ ...send, name: 'finance.export.build', queue: 'heavy' });
      const finance = queues.service('finance', { db, kinds: [build] });
      const [id] = await newRecords(1);

      await finance.enqueue(build, id as string);

      expect((await waiting(HEAVY_QUEUE)).waiting).toBe(1);
      expect((await waiting('finance')).waiting).toBe(0);
      queues.startWorkers();
      await vi.waitFor(
        async () => {
          expect(await runsOf([id as string])).toEqual([1]);
        },
        { timeout: 15_000 },
      );
    });

    it('AC-PLATFORM-7: a job that fails every try fails for good, with an alert', async () => {
      queues = createJobQueues({ connection, prefix, logger, alert });
      const broken = defineJob({
        ...send,
        name: 'notify.email.broken',
        run: () => Promise.reject(new TypeError('The template is not there.')),
      });
      queues.service('notify', { db, kinds: [broken] });
      const [id] = await newRecords(1);
      const before = alert.raised.length;

      // Two tries a moment apart, so the test does not wait for the real backoff.
      await inQueue('notify', (queue) =>
        queue.add(
          broken.name,
          { recordId: id },
          {
            jobId: jobIdOf(broken.name, id as string),
            attempts: 2,
            backoff: { type: 'fixed', delay: 1 },
          },
        ),
      );
      queues.startWorkers();

      await vi.waitFor(
        () => {
          expect(alert.raised.slice(before).map((raised) => raised.kind)).toEqual([
            'events.jobFailed',
          ]);
        },
        { timeout: 15_000 },
      );
      expect(alert.raised.at(-1)).toMatchObject({
        service: 'notify',
        details: { job: 'notify.email.broken', recordId: id, attempts: 2 },
      });
    });

    it('R-007: a process of every service has its queues within 20 Valkey connections', async () => {
      const name = `bq-test-count-${randomUUID().slice(0, 8)}`;
      const shared = createQueueConnection(VALKEY_URL, name);
      queues = createJobQueues({ connection: shared, prefix, logger, alert });
      for (const service of SERVICES) {
        const kind = defineJob({ ...send, name: `${service}.work.run` });
        queues.service(service, { db, kinds: [kind] });
      }
      queues.startWorkers();
      const counter = new Redis(VALKEY_URL);
      await vi.waitFor(
        async () => {
          const list = String(await counter.call('CLIENT', 'LIST'));
          // BullMQ names each connection of a queue `<prefix>:<queue>`; the shared one may keep its own name.
          const ours = list
            .split('\n')
            .filter((line) => line.includes(`name=${prefix}:`) || line.includes(`name=${name} `));
          // Every worker has its connection for waiting: the services and the heavy queue.
          expect(ours.length).toBeGreaterThanOrEqual(SERVICES.length + 1);
          expect(ours.length).toBeLessThanOrEqual(20);
        },
        { timeout: 15_000 },
      );
      await queues.close();
      queues = undefined;
      counter.disconnect();
      shared.disconnect();
    });

    it('AC-PLATFORM-7: an alert of a failed job that cannot be raised is logged; a kind not given cannot be put on a queue', async () => {
      queues = createJobQueues({
        connection,
        prefix,
        logger,
        alert: () => Promise.reject(new Error('The push service is down.')),
      });
      const broken = defineJob({
        ...send,
        name: 'notify.email.broken',
        run: () => Promise.reject(new TypeError('The template is not there.')),
      });
      const notify = queues.service('notify', { db, kinds: [broken] });
      const [id] = await newRecords(1);
      await expect(notify.enqueue(send, id as string)).rejects.toThrow(
        'The job notify.email.send is not of notify.',
      );
      await inQueue('notify', (queue) =>
        queue.add(
          broken.name,
          { recordId: id },
          { jobId: jobIdOf(broken.name, id as string), attempts: 1 },
        ),
      );
      queues.startWorkers();
      queues.startWorkers();

      await vi.waitFor(
        () => {
          expect(logger.lines.map((line) => line.message)).toContain(
            'The alert of a failed job could not be raised.',
          );
        },
        { timeout: 15_000 },
      );
    });

    it('SR-071: kinds are checked when a service is given: its own, once each; a service once', () => {
      queues = createJobQueues({ connection, prefix, logger, alert });
      expect(() => queues?.service('finance', { db, kinds: [send] })).toThrow(
        'The job notify.email.send is not of finance.',
      );
      queues.service('notify', { db, kinds: [send] });
      expect(() => queues?.service('notify', { db, kinds: [] })).toThrow(
        'The jobs of notify are given twice.',
      );
      expect(() => queues?.service('commerce', { db, kinds: [send] })).toThrow(RangeError);
    });
  },
);
