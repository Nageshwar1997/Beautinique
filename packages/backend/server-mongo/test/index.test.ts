// Against a real MongoDB replica set: the local one from `npm run infra:up`, or MONGO_TEST_URI (CI).
import { randomUUID } from 'node:crypto';
import { Writable } from 'node:stream';
import { setTimeout as sleep } from 'node:timers/promises';

import {
  AppError,
  createApp,
  createLogger,
  type RunningServer,
  startServer,
  toErrorResponse,
} from '@beautinique/backend-server-kit';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import * as api from '../src/index';
import {
  assertReplicaSet,
  type ClientSession,
  type CommandStartedEvent,
  connectMongo,
  type Mongo,
  MongoClient,
  ObjectId,
  ParallelTransactionError,
  TransactionAbortedError,
  TransactionTimeoutError,
  withTransaction,
} from '../src/index';
import { backoffMs } from '../src/transaction';

const URI = process.env.MONGO_TEST_URI ?? 'mongodb://localhost:27017/?replicaSet=rs0';
const runId = randomUUID().slice(0, 8);
const dbName = `bq_test_${runId}`;
// fail points match on it, so another test run on the same MongoDB is not hit by ours
const appName = `server-mongo-test-${runId}`;
const lines: Record<string, unknown>[] = [];
const logger = createLogger({
  name: 'server-mongo-test',
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

let mongo: Mongo;
/** A second client, like another process: it only sees what was committed. */
let other: MongoClient;

beforeAll(async () => {
  try {
    mongo = await connectMongo({
      uri: URI,
      dbName,
      appName,
      logger,
      serverSelectionTimeoutMS: 3000,
    });
  } catch (error) {
    throw new Error(
      'These tests need the MongoDB replica set: run `npm run infra:up` (or set MONGO_TEST_URI).',
      {
        cause: error,
      },
    );
  }
  other = new MongoClient(URI, { readConcernLevel: 'majority' });
  await other.connect();
});
afterAll(async () => {
  try {
    await mongo.db.dropDatabase();
  } finally {
    await mongo.close();
    await other.close();
  }
});
let failPointOn = false;
/** Makes MongoDB fail or stall this client's commands (needs enableTestCommands: infra has it on). */
async function failPoint(mode: { times: number } | 'alwaysOn', data: Record<string, unknown>) {
  try {
    await other.db('admin').command({
      configureFailPoint: 'failCommand',
      mode,
      data: { appName, ...data },
    });
    failPointOn = true;
  } catch (error) {
    throw new Error(
      'These tests need MongoDB test commands: `npm run infra:up` starts mongod with enableTestCommands=1.',
      { cause: error },
    );
  }
}
afterEach(async () => {
  lines.length = 0;
  if (failPointOn) {
    await other.db('admin').command({ configureFailPoint: 'failCommand', mode: 'off' });
    failPointOn = false;
  }
});

/** Test documents use readable string ids. */
interface Doc {
  _id: string;
  [field: string]: unknown;
}
/** Stock rows, typed so `$inc` on qty type-checks. */
interface Stock {
  _id: string;
  qty: number;
}
/** A collection through the client under test. */
const own = <T extends Doc | Stock = Doc>(name: string) => mongo.db.collection<T>(name);
/** The same collection through the other client: it sees only committed data. */
const committed = <T extends Doc | Stock = Doc>(name: string) =>
  other.db(dbName).collection<T>(name);

describe('public API', () => {
  it('exports our helpers and the whole driver', () => {
    for (const name of [
      'connectMongo',
      'withTransaction',
      'assertReplicaSet',
      'ParallelTransactionError',
      'TransactionAbortedError',
      'TransactionTimeoutError',
    ]) {
      expect(api, name).toHaveProperty(name);
    }
    expect(new ObjectId().toHexString()).toMatch(/^[0-9a-f]{24}$/);
  });
});

describe('connectMongo', () => {
  it('opens a pool of 5 with majority writes, and leaves undefined fields out', async () => {
    expect(mongo.client.options.maxPoolSize).toBe(5);
    expect(mongo.client.options.writeConcern.w).toBe('majority');
    expect(mongo.db.databaseName).toBe(dbName);
    await own('plain').insertOne({ _id: 'u', name: 'Priya', nickname: undefined });
    expect(await committed('plain').findOne({ _id: 'u' })).toEqual({
      _id: 'u',
      name: 'Priya',
    });
  });

  it('is ready while connected, and not after close', async () => {
    expect(await mongo.ready()).toBe(true);
    const second = await connectMongo({ uri: URI, dbName, appName: 'second', logger });
    await second.close();
    expect(await second.ready()).toBe(false);
    expect(lines.some((l) => l.msg === 'mongo connected')).toBe(true);
    expect(JSON.stringify(lines)).not.toContain(URI);
  });

  it('is not ready when MongoDB takes longer than 2 seconds to answer', async () => {
    await failPoint(
      { times: 1 },
      { failCommands: ['ping'], blockConnection: true, blockTimeMS: 3000 },
    );
    const started = Date.now();
    expect(await mongo.ready()).toBe(false);
    expect(Date.now() - started).toBeLessThan(2900);
  });

  it('accepts a replica set or a sharded cluster, and refuses a lone server', () => {
    expect(() => {
      assertReplicaSet({ setName: 'rs0' });
    }).not.toThrow();
    expect(() => {
      assertReplicaSet({ msg: 'isdbgrid' });
    }).not.toThrow();
    expect(() => {
      assertReplicaSet({ isWritablePrimary: true });
    }).toThrow('must be a replica set');
  });

  it('fails clearly when MongoDB is not there, without printing the URI', async () => {
    const uri = 'mongodb://user:secret@127.0.0.1:1/?replicaSet=rs0';
    const attempt = connectMongo({
      uri,
      dbName,
      appName: 'x',
      logger,
      serverSelectionTimeoutMS: 300,
    });
    await expect(attempt).rejects.toThrow(
      'MongoDB did not answer within 300 ms. Locally run `npm run infra:up`',
    );
    await expect(attempt).rejects.not.toThrow('secret');
  });
});

describe('backoffMs', () => {
  const most = () => 1;
  const least = () => 0;

  it('doubles from 10 ms up to 200 ms', () => {
    expect([1, 2, 3, 4, 5, 6, 7, 20].map((attempt) => backoffMs(attempt, 10_000, most))).toEqual([
      10, 20, 40, 80, 160, 200, 200, 200,
    ]);
  });

  it('spreads retries out: the jitter takes between half and all of the pause', () => {
    expect(backoffMs(3, 10_000, least)).toBe(20);
    expect(backoffMs(3, 10_000, () => 0.5)).toBe(30);
    expect(backoffMs(6, 10_000, least)).toBe(100);
  });

  it('never waits past the deadline', () => {
    expect(backoffMs(6, 35, most)).toBe(35);
    expect(backoffMs(6, 0, most)).toBe(0);
    expect(backoffMs(6, -50, most)).toBe(0);
  });
});

describe('withTransaction', () => {
  it('returns the value only after the commit: another client already sees the data', async () => {
    const sessions: ClientSession[] = [];
    const order = await withTransaction(mongo, async (session) => {
      sessions.push(session);
      await own('orders').insertOne({ _id: 'o1', total: 129_900 }, { session });
      await own('outbox').insertOne({ _id: 'e1', type: 'commerce.order.placed' }, { session });
      return { id: 'o1' };
    });
    expect(order).toEqual({ id: 'o1' });
    expect(await committed('orders').findOne({ _id: 'o1' })).toMatchObject({
      total: 129_900,
    });
    expect(await committed('outbox').findOne({ _id: 'e1' })).toMatchObject({
      type: 'commerce.order.placed',
    });
    expect(sessions[0]?.hasEnded).toBe(true);
  });

  it('starts each transaction with snapshot reads and a majority commit', async () => {
    const started: CommandStartedEvent[] = [];
    const listen = (event: CommandStartedEvent) => started.push(event);
    mongo.client.on('commandStarted', listen);
    await withTransaction(mongo, async (session) => {
      await own('settings').insertOne({ _id: 's1' }, { session });
    });
    mongo.client.off('commandStarted', listen);
    const first = started.find((event) => event.commandName === 'insert');
    const commit = started.find((event) => event.commandName === 'commitTransaction');
    expect(first?.command.readConcern).toMatchObject({ level: 'snapshot' });
    expect(commit?.command.writeConcern).toMatchObject({ w: 'majority' });
  });

  it('lets several requests run their own transactions at the same time', async () => {
    const order = (name: string) =>
      withTransaction(mongo, async (session) => {
        for (let i = 0; i < 5; i += 1) {
          await own('concurrent').insertOne({ _id: `${name}${String(i)}` }, { session });
        }
      });
    await Promise.all([order('a'), order('b'), order('c')]);
    expect(await committed('concurrent').countDocuments()).toBe(15);
    expect(mongo.guard.watching).toBe(0);
  });

  it('rolls everything back when the work throws, and rethrows the same error', async () => {
    const problem = new AppError('CONFLICT', 'That coupon is used up.');
    await expect(
      withTransaction(mongo, async (session) => {
        await own('orders').insertOne({ _id: 'o2' }, { session });
        throw problem;
      }),
    ).rejects.toBe(problem);
    expect(await committed('orders').findOne({ _id: 'o2' })).toBeNull();
  });

  it('runs the work again after a write conflict, and saves the result once', async () => {
    await own<Stock>('stock').insertOne({ _id: 'ROSE', qty: 10 });
    const holder = other.startSession();
    holder.startTransaction();
    await committed<Stock>('stock').updateOne(
      { _id: 'ROSE' },
      { $inc: { qty: -1 } },
      { session: holder },
    );
    setTimeout(() => {
      void holder.commitTransaction().then(() => holder.endSession());
    }, 300);
    let attempts = 0;
    await withTransaction(mongo, async (session) => {
      attempts += 1;
      await own<Stock>('stock').updateOne({ _id: 'ROSE' }, { $inc: { qty: -1 } }, { session });
    });
    expect(attempts).toBeGreaterThan(1);
    // a short, growing pause between attempts, not a tight loop (that would be 100+ in 300 ms)
    expect(attempts).toBeLessThan(25);
    expect(await committed<Stock>('stock').findOne({ _id: 'ROSE' })).toMatchObject({ qty: 8 });
    expect(lines.find((l) => l.msg === 'transaction committed after retrying')).toMatchObject({
      attempts,
    });
  });

  it('gives up with TransactionTimeoutError (503) when the conflict outlasts the timeout', async () => {
    await own<Stock>('stock').insertOne({ _id: 'PLUM', qty: 5 });
    const holder = other.startSession();
    holder.startTransaction();
    await committed<Stock>('stock').updateOne(
      { _id: 'PLUM' },
      { $inc: { qty: -1 } },
      { session: holder },
    );
    const started = Date.now();
    let caught: unknown;
    try {
      await withTransaction(
        mongo,
        async (session) => {
          await own<Stock>('stock').updateOne({ _id: 'PLUM' }, { $inc: { qty: -1 } }, { session });
        },
        { timeoutMs: 400 },
      );
    } catch (error) {
      caught = error;
    } finally {
      await holder.abortTransaction();
      await holder.endSession();
    }
    expect(caught).toBeInstanceOf(TransactionTimeoutError);
    expect((caught as TransactionTimeoutError).attempts).toBeGreaterThan(1);
    expect(Date.now() - started).toBeLessThan(3000);
    expect(toErrorResponse(caught, 'r1')).toMatchObject({
      status: 503,
      body: { error: { code: 'SERVICE_UNAVAILABLE' } },
    });
    expect(await committed<Stock>('stock').findOne({ _id: 'PLUM' })).toMatchObject({ qty: 5 });
  });

  describe('when the commit fails', () => {
    const failCommits = (mode: { times: number } | 'alwaysOn', data: Record<string, unknown>) =>
      failPoint(mode, { failCommands: ['commitTransaction'], ...data });
    let commits = 0;
    // a commit the fail point refused leaves its transaction open on the server: killed after each test
    let lsids: unknown[] = [];
    const countCommits = (event: CommandStartedEvent) => {
      if (event.commandName !== 'commitTransaction') return;
      commits += 1;
      lsids.push(event.command.lsid);
    };
    beforeAll(() => {
      mongo.client.on('commandStarted', countCommits);
    });
    afterEach(async () => {
      if (lsids.length > 0) await other.db('admin').command({ killSessions: lsids });
      commits = 0;
      lsids = [];
    });
    afterAll(() => {
      mongo.client.off('commandStarted', countCommits);
    });

    it('retries only the commit when its result is unknown, and runs the work once', async () => {
      // MaxTimeMSExpired on commit: the server may or may not have committed
      await failCommits({ times: 2 }, { errorCode: 50 });
      let attempts = 0;
      await withTransaction(mongo, async (session) => {
        attempts += 1;
        await own('unknown').insertOne({ _id: 'once' }, { session });
      });
      expect(attempts).toBe(1);
      expect(commits).toBe(3);
      expect(await committed('unknown').countDocuments()).toBe(1);
    });

    it('runs the work again when the commit hits a transient error', async () => {
      await failCommits(
        { times: 1 },
        { errorCode: 112, errorLabels: ['TransientTransactionError'] },
      );
      let attempts = 0;
      await withTransaction(mongo, async (session) => {
        attempts += 1;
        // the same id each attempt: a second save would be a duplicate key error
        await own('transient').insertOne({ _id: 'once' }, { session });
      });
      expect(attempts).toBe(2);
      expect(await committed('transient').countDocuments()).toBe(1);
      expect(lines.find((l) => l.msg === 'transaction committed after retrying')).toMatchObject({
        attempts: 2,
      });
    });

    it('gives up with TransactionTimeoutError when the commit result stays unknown', async () => {
      await failCommits('alwaysOn', { errorCode: 50 });
      const attempt = withTransaction(
        mongo,
        async (session) => {
          await own('stuck').insertOne({ _id: 'never' }, { session });
        },
        { timeoutMs: 300 },
      );
      await expect(attempt).rejects.toBeInstanceOf(TransactionTimeoutError);
      // a short pause between commit retries, not a tight loop
      expect(commits).toBeGreaterThan(1);
      expect(commits).toBeLessThan(25);
    });

    it('gives up with TransactionTimeoutError when every commit hits a transient error', async () => {
      await failCommits('alwaysOn', {
        errorCode: 112,
        errorLabels: ['TransientTransactionError'],
      });
      let attempts = 0;
      const attempt = withTransaction(
        mongo,
        async (session) => {
          attempts += 1;
          await own('busy').insertOne({ _id: 'never' }, { session });
        },
        { timeoutMs: 300 },
      );
      await expect(attempt).rejects.toBeInstanceOf(TransactionTimeoutError);
      expect(attempts).toBeGreaterThan(1);
      expect(await committed('busy').countDocuments()).toBe(0);
    });

    it('rethrows other commit errors as they are', async () => {
      await failCommits({ times: 1 }, { errorCode: 13 });
      const attempt = withTransaction(mongo, async (session) => {
        await own('other').insertOne({ _id: 'x' }, { session });
      });
      await expect(attempt).rejects.toMatchObject({ code: 13, codeName: 'Unauthorized' });
      expect(commits).toBe(1);
    });
  });

  // MEMORY sabak: Promise.all inside one session gave random transaction errors and a generic 500.
  // ESLint stops Promise.all inside withTransaction; these tests switch that off to test the runtime net.
  it('refuses queries that reach MongoDB together, and saves nothing', async () => {
    for (let run = 0; run < 5; run += 1) {
      await expect(
        withTransaction(mongo, async (session) => {
          // eslint-disable-next-line no-restricted-syntax -- on purpose: the runtime check under test
          await Promise.all([
            own('parallel').insertOne({ _id: `p${String(run)}a` }, { session }),
            own('parallel').insertOne({ _id: `p${String(run)}b` }, { session }),
            own('parallel').insertOne({ _id: `p${String(run)}c` }, { session }),
          ]);
        }),
      ).rejects.toBeInstanceOf(ParallelTransactionError);
    }
    expect(await committed('parallel').countDocuments()).toBe(0);
    expect(mongo.guard.watching).toBe(0);
  });

  it('names parallel queries as the cause even when one of them fails with its own error', async () => {
    await own('dupes').insertOne({ _id: 'taken' });
    let caught: unknown;
    try {
      await withTransaction(mongo, async (session) => {
        // eslint-disable-next-line no-restricted-syntax -- on purpose: the runtime check under test
        await Promise.all([
          ...Array.from({ length: 6 }, (_, i) =>
            own('dupes').insertOne({ _id: `d${String(i)}` }, { session }),
          ),
          own('dupes').insertOne({ _id: 'taken' }, { session }),
        ]);
      });
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(ParallelTransactionError);
    expect((caught as Error).cause).toBeDefined();
    expect(await committed('dupes').countDocuments()).toBe(1);
  });

  it('refuses a query that is still running when the work finishes (a missing await)', async () => {
    // hold this run's inserts for 400 ms, so the forgotten one is surely still on the wire
    await failPoint(
      { times: 1 },
      { failCommands: ['insert'], blockConnection: true, blockTimeMS: 400 },
    );
    let lsid: unknown;
    await expect(
      withTransaction(mongo, async (session) => {
        lsid = session.id;
        void own('forgotten')
          .insertOne({ _id: 'f1' }, { session })
          .catch(() => undefined);
        await sleep(100);
      }),
    ).rejects.toBeInstanceOf(ParallelTransactionError);
    await sleep(500);
    // the blocked insert may have opened the transaction after the abort: close it on the server
    await other.db('admin').command({ killSessions: [lsid] });
    expect(await committed('forgotten').countDocuments()).toBe(0);
  });

  // Found in the second review: a query started without await on the last line was not on the wire yet
  // when the work finished, so its failure turned into retries until the timeout (503).
  it('refuses a query started without await on the last line of the work', async () => {
    await own('late_inbox').insertOne({ _id: 'dupe' });
    let attempts = 0;
    let commits = 0;
    const countCommits = (event: CommandStartedEvent) => {
      if (event.commandName === 'commitTransaction') commits += 1;
    };
    mongo.client.on('commandStarted', countCommits);
    const started = Date.now();
    const attempt = withTransaction(mongo, async (session) => {
      attempts += 1;
      await own('late_inbox').insertOne({ _id: `order${String(attempts)}` }, { session });
      void own('late_inbox')
        .insertOne({ _id: 'dupe' }, { session })
        .catch(() => undefined);
      return 'placed';
    });
    await expect(attempt).rejects.toBeInstanceOf(ParallelTransactionError);
    mongo.client.off('commandStarted', countCommits);
    expect(attempts).toBe(1);
    // caught before the commit: one turn of the event loop put the forgotten query on the wire
    expect(commits).toBe(0);
    expect(Date.now() - started).toBeLessThan(2000);
    await sleep(100);
    expect(await committed('late_inbox').find().toArray()).toEqual([{ _id: 'dupe' }]);
    expect(mongo.guard.watching).toBe(0);
  });

  it('sees a late query that waited for a busy connection until after the work finished', async () => {
    const tight = await connectMongo({ uri: URI, dbName, appName, logger, maxPoolSize: 1 });
    try {
      const tightOwn = tight.db.collection<Doc>('tight');
      await tightOwn.insertOne({ _id: 'dupe' });
      // the next ping keeps the only connection busy for 300 ms
      await failPoint(
        { times: 1 },
        { failCommands: ['ping'], blockConnection: true, blockTimeMS: 300 },
      );
      const attempt = withTransaction(tight, async (session) => {
        await tightOwn.insertOne({ _id: 'order' }, { session });
        void tight.db.command({ ping: 1 }).catch(() => undefined);
        void tightOwn.insertOne({ _id: 'dupe' }, { session }).catch(() => undefined);
        return 'placed';
      });
      await expect(attempt).rejects.toBeInstanceOf(ParallelTransactionError);
      expect(await committed('tight').find().toArray()).toEqual([{ _id: 'dupe' }]);
    } finally {
      await tight.close();
    }
  });

  it('passes on a query error the work did not catch, as it is', async () => {
    await own('plain_dupes').insertOne({ _id: 'taken' });
    const attempt = withTransaction(mongo, async (session) => {
      await own('plain_dupes').insertOne({ _id: 'taken' }, { session });
    });
    await expect(attempt).rejects.toMatchObject({ code: 11000 });
    await expect(attempt).rejects.not.toBeInstanceOf(TransactionAbortedError);
  });

  it('still retries when the work caught a write conflict (a retry can fix that)', async () => {
    await own<Stock>('stock').insertOne({ _id: 'IRIS', qty: 0 });
    const holder = other.startSession();
    holder.startTransaction();
    await committed<Stock>('stock').updateOne(
      { _id: 'IRIS' },
      { $inc: { qty: 1 } },
      { session: holder },
    );
    setTimeout(() => {
      void holder.commitTransaction().then(() => holder.endSession());
    }, 300);
    let attempts = 0;
    await withTransaction(mongo, async (session) => {
      attempts += 1;
      try {
        await own<Stock>('stock').updateOne({ _id: 'IRIS' }, { $inc: { qty: 1 } }, { session });
      } catch {
        // a best-effort counter: wrong, but a write conflict is not a bug a retry cannot fix
      }
      await own('side').insertOne({ _id: `s${String(attempts)}` }, { session });
    });
    expect(attempts).toBeGreaterThan(1);
    expect(await committed('side').find().toArray()).toEqual([{ _id: `s${String(attempts)}` }]);
    expect(await committed<Stock>('stock').findOne({ _id: 'IRIS' })).toMatchObject({ qty: 2 });
  });

  // Found in the second review: after a network error the driver throws the session away; if the abort
  // did not get through either, its transaction kept the row locked for a minute.
  it(
    'closes the transaction of a session lost to a network error, so the retry is not blocked',
    {
      timeout: 20_000,
    },
    async () => {
      await own<Stock>('stock').insertOne({ _id: 'ZINNIA', qty: 5 });
      // the insert and both abort tries lose their connection
      await failPoint(
        { times: 3 },
        { failCommands: ['insert', 'abortTransaction'], closeConnection: true },
      );
      let attempts = 0;
      await withTransaction(
        mongo,
        async (session) => {
          attempts += 1;
          await own<Stock>('stock').updateOne(
            { _id: 'ZINNIA' },
            { $inc: { qty: -1 } },
            { session },
          );
          await own('zinnia_log').insertOne({ _id: `z${String(attempts)}` }, { session });
        },
        { timeoutMs: 8000 },
      );
      expect(attempts).toBeGreaterThan(1);
      expect(await committed<Stock>('stock').findOne({ _id: 'ZINNIA' })).toMatchObject({ qty: 4 });
      expect(await committed('zinnia_log').countDocuments()).toBe(1);
    },
  );

  // Found in review: one session for every attempt let a late Promise.all branch of a failed attempt
  // save its row outside the transaction (a 201 with extra outbox rows).
  it('never saves a late query of a failed attempt', async () => {
    await own<Stock>('stock').insertOne({ _id: 'LILY', qty: 3 });
    const holder = other.startSession();
    holder.startTransaction();
    await committed<Stock>('stock').updateOne(
      { _id: 'LILY' },
      { $inc: { qty: -1 } },
      { session: holder },
    );
    setTimeout(() => {
      void holder.commitTransaction().then(() => holder.endSession());
    }, 300);
    let attempts = 0;
    await withTransaction(mongo, async (session) => {
      attempts += 1;
      const id = `late${String(attempts)}`;
      // eslint-disable-next-line no-restricted-syntax -- on purpose: a branch that starts late
      await Promise.all([
        own<Stock>('stock').updateOne({ _id: 'LILY' }, { $inc: { qty: -1 } }, { session }),
        (async () => {
          await sleep(50);
          await own('late').insertOne({ _id: id }, { session });
        })(),
      ]);
    });
    await sleep(50);
    expect(attempts).toBeGreaterThan(1);
    expect(await committed('late').find().toArray()).toEqual([{ _id: `late${String(attempts)}` }]);
    expect(await committed<Stock>('stock').findOne({ _id: 'LILY' })).toMatchObject({ qty: 1 });
  });

  it('still runs the work again when MongoDB dropped the transaction itself', async () => {
    let attempts = 0;
    await withTransaction(mongo, async (session) => {
      attempts += 1;
      await own('dropped').insertOne({ _id: `a${String(attempts)}` }, { session });
      // like a server-side transaction timeout or failover: the next query finds no transaction
      if (attempts === 1) await other.db('admin').command({ killSessions: [session.id] });
      await own('dropped').insertOne({ _id: `b${String(attempts)}` }, { session });
    });
    expect(attempts).toBe(2);
    expect(await committed('dropped').find().toArray()).toEqual([{ _id: 'a2' }, { _id: 'b2' }]);
  });

  it('names a query error that the work caught, instead of retrying it until the timeout', async () => {
    await own('inbox').insertOne({ _id: 'evt-1' });
    for (const then of ['return', 'query again']) {
      let attempts = 0;
      const started = Date.now();
      const attempt = withTransaction(mongo, async (session) => {
        attempts += 1;
        try {
          await own('inbox').insertOne({ _id: 'evt-1' }, { session });
        } catch {
          // the wrong way to dedupe: MongoDB has already cancelled the transaction here
        }
        if (then === 'query again') await own('inbox').insertOne({ _id: 'evt-2' }, { session });
        return 'done';
      });
      await expect(attempt, then).rejects.toBeInstanceOf(TransactionAbortedError);
      await expect(attempt, then).rejects.toMatchObject({ mongoCode: 11000 });
      expect(attempts, then).toBe(1);
      expect(Date.now() - started, then).toBeLessThan(2000);
    }
    expect(await committed('inbox').countDocuments()).toBe(1);
  });

  it('names a failed query command that the work caught, too', async () => {
    let attempts = 0;
    const attempt = withTransaction(
      mongo,
      async (session) => {
        attempts += 1;
        try {
          // the whole command fails (unknown operator), not one document of a write
          await mongo.db.collection('inbox').findOne({ _id: { $nope: 1 } }, { session });
        } catch {
          // ignored on purpose
        }
        await own('inbox').insertOne({ _id: 'evt-3' }, { session });
      },
      { timeoutMs: 3000 },
    );
    await expect(attempt).rejects.toBeInstanceOf(TransactionAbortedError);
    await expect(attempt).rejects.toMatchObject({ mongoCode: 2 });
    expect(attempts).toBe(1);
  });

  it('does not mistake sequential queries for parallel ones (the driver reuses session ids)', async () => {
    for (let run = 0; run < 10; run += 1) {
      await withTransaction(mongo, async (session) => {
        for (let i = 0; i < 3; i += 1) {
          await mongo.db.collection('sequential').insertOne({ run, i }, { session });
        }
      });
    }
    expect(await committed('sequential').countDocuments()).toBe(30);
  });
});

// The old bug: the API answered before the commit. A route built on withTransaction replies only with
// committed data, and answers an error (and saves nothing) when the transaction fails.
describe('a route that replies after the commit', () => {
  let server: RunningServer;

  beforeAll(async () => {
    const app = createApp({
      logger,
      ready: { mongo: mongo.ready },
      routes: (router) => {
        router.post('/orders/:mode', async (req, res) => {
          const id = new ObjectId();
          const order = await withTransaction(mongo, async (session) => {
            await mongo.db
              .collection('route_orders')
              .insertOne({ _id: id, mode: req.params.mode }, { session });
            if (req.params.mode === 'broken') throw new Error('payment row could not be written');
            if (req.params.mode === 'parallel') {
              // eslint-disable-next-line no-restricted-syntax -- on purpose: the runtime check under test
              await Promise.all([
                mongo.db.collection('route_outbox').insertOne({ order: id, n: 1 }, { session }),
                mongo.db.collection('route_outbox').insertOne({ order: id, n: 2 }, { session }),
              ]);
            }
            return { id: id.toHexString() };
          });
          res.status(201).json({ data: order });
        });
      },
    });
    server = await startServer(app, { port: 0, host: '127.0.0.1', logger, handleSignals: false });
  });
  afterAll(async () => {
    await server.stop();
  });

  it('answers 201 only once the order is committed', async () => {
    const res = await fetch(`${server.url}/orders/ok`, { method: 'POST' });
    expect(res.status).toBe(201);
    const { data } = (await res.json()) as { data: { id: string } };
    const orders = other.db(dbName).collection('route_orders');
    expect(await orders.findOne({ _id: new ObjectId(data.id) })).toMatchObject({ mode: 'ok' });
  });

  it('answers 500 and saves nothing when the transaction fails, or runs queries in parallel', async () => {
    for (const mode of ['broken', 'parallel']) {
      const res = await fetch(`${server.url}/orders/${mode}`, { method: 'POST' });
      expect(res.status, mode).toBe(500);
      expect(await res.json()).toMatchObject({ error: { code: 'INTERNAL' } });
      expect(await committed('route_orders').countDocuments({ mode })).toBe(0);
    }
    expect(await committed('route_outbox').countDocuments()).toBe(0);
    expect(
      lines.some(
        (l) => l.msg === 'request failed' && JSON.stringify(l).includes('ParallelTransactionError'),
      ),
    ).toBe(true);
  });

  it('reports MongoDB in /ready', async () => {
    const res = await fetch(`${server.url}/ready`);
    expect(await res.json()).toEqual({ status: 'ready', checks: { mongo: 'ok' } });
  });
});
