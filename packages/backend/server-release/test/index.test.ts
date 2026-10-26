// Against a real MongoDB replica set: the local one from `npm run infra:up`, or MONGO_TEST_URI (CI).
import { randomUUID } from 'node:crypto';
import { Writable } from 'node:stream';
import { setTimeout as sleep } from 'node:timers/promises';

import { createLogger } from '@beautinique/backend-server-kit';
import { connectMongo, type IndexSpec, type Mongo } from '@beautinique/backend-server-mongo';
import { LOCKS } from '@beautinique/backend-server-queue';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import * as api from '../src/index';
import {
  defineMigrations,
  type Migration,
  MigrationFailedError,
  MIGRATIONS,
  RELEASE_LEASE,
  RELEASE_STATE,
  releaseFingerprint,
  ReleaseLeaseLostError,
  ReleaseLockTimeoutError,
  runRelease,
  type RunReleaseOptions,
} from '../src/index';

const URI = process.env.MONGO_TEST_URI ?? 'mongodb://localhost:27017/?replicaSet=rs0';
const runId = randomUUID().slice(0, 8);
const lines: Record<string, unknown>[] = [];
const logger = createLogger({
  name: 'server-release-test',
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

let base: Mongo;
let mongo: Mongo;
let count = 0;
const dbNames: string[] = [];

beforeAll(async () => {
  try {
    base = await connectMongo({
      uri: URI,
      dbName: `bq_test_release_${runId}`,
      appName: 'server-release-test',
      logger,
      serverSelectionTimeoutMS: 3000,
    });
  } catch (error) {
    throw new Error(
      'These tests need the MongoDB replica set: run `npm run infra:up` (or set MONGO_TEST_URI).',
      { cause: error },
    );
  }
});
afterAll(async () => {
  try {
    for (const name of dbNames) await base.client.db(name).dropDatabase();
  } finally {
    await base.close();
  }
});
// every test gets a database of its own, like a deployable that boots for the first time
beforeEach(() => {
  lines.length = 0;
  count += 1;
  const dbName = `bq_test_release_${runId}_${String(count)}`;
  dbNames.push(dbName);
  mongo = { ...base, db: base.client.db(dbName) };
});

/** A migration that counts its runs. */
function counted(id: string, runs: string[], work?: () => Promise<void>): Migration {
  return {
    id,
    description: `test ${id}`,
    up: async () => {
      runs.push(id);
      await work?.();
    },
  };
}
const ordersIndex: IndexSpec = { collection: 'orders', name: 'buyer', key: { buyerId: 1 } };
const options = (more: Partial<RunReleaseOptions> = {}): RunReleaseOptions => ({
  mongo,
  logger,
  migrations: [],
  indexes: [],
  ...more,
});
const lease = () => mongo.db.collection<{ _id: string; owner: string; expiresAt: Date }>(LOCKS);
/** Another instance's lease, for `ms` from now on MongoDB's clock. */
async function heldByOther(ms: number): Promise<void> {
  await lease().updateOne(
    { _id: RELEASE_LEASE },
    [{ $set: { owner: 'other', expiresAt: { $add: ['$$NOW', ms] } } }],
    { upsert: true },
  );
}
const messages = () => lines.map((line) => line.msg);

describe('public API', () => {
  it('exports the runner, the migrations and the errors', () => {
    for (const name of [
      'runRelease',
      'releaseFingerprint',
      'defineMigrations',
      'MIGRATIONS',
      'RELEASE_LEASE',
      'RELEASE_STATE',
      'MigrationFailedError',
      'ReleaseLeaseLostError',
      'ReleaseLockTimeoutError',
    ]) {
      expect(api, name).toHaveProperty(name);
    }
  });
});

describe('defineMigrations', () => {
  const ok = (id: string): Migration => ({ id, description: 'd', up: () => Promise.resolve() });

  it('takes well-formed ids in order', () => {
    const list = defineMigrations([
      ok('20261027-001-users'),
      ok('20261027-002-users-email-unique'),
    ]);
    expect(list.map((m) => m.id)).toEqual([
      '20261027-001-users',
      '20261027-002-users-email-unique',
    ]);
    expect(Object.isFrozen(list)).toBe(true);
    expect(defineMigrations([])).toEqual([]);
  });

  it.each([
    ['2026-10-27-users', 'must look like'],
    ['20261027-1-users', 'must look like'],
    ['20261027-001-Users', 'must look like'],
    ['20261027-001-', 'must look like'],
    ['20261027-001-users-', 'must look like'],
    ['x20261027-001-users', 'must look like'],
    ['20261027-001-users x', 'must look like'],
  ])('refuses the id %s', (id, message) => {
    expect(() => defineMigrations([ok(id)])).toThrow(message);
  });

  it('refuses ids out of order or twice, and a missing description', () => {
    expect(() => defineMigrations([ok('20261027-002-b'), ok('20261027-001-a')])).toThrow(
      'Migration 20261027-001-a must come after 20261027-002-b',
    );
    expect(() => defineMigrations([ok('20261027-001-a'), ok('20261027-001-a')])).toThrow(
      'must come after',
    );
    expect(() =>
      defineMigrations([{ id: '20261027-001-a', description: ' ', up: () => Promise.resolve() }]),
    ).toThrow('Migration 20261027-001-a needs a description.');
  });
});

describe('releaseFingerprint', () => {
  const migrations = [counted('20261027-001-a', [])];
  const indexes: IndexSpec[] = [ordersIndex];
  const step = { name: 'sync', fingerprint: 'v1', run: () => Promise.resolve() };
  const steps = [step];
  const fingerprint = releaseFingerprint({ migrations, indexes, steps });

  it('is the same for the same release, and a sha256 hex', () => {
    expect(releaseFingerprint({ migrations, indexes, steps })).toBe(fingerprint);
    expect(fingerprint).toMatch(/^[0-9a-f]{64}$/);
    expect(releaseFingerprint({ migrations: [], indexes: [] })).toBe(
      releaseFingerprint({ migrations: [], indexes: [], steps: [] }),
    );
  });

  it.each<[string, Parameters<typeof releaseFingerprint>[0]]>([
    [
      'a new migration',
      { migrations: [...migrations, counted('20261027-002-b', [])], indexes, steps },
    ],
    [
      'another collection',
      { migrations, indexes: [{ ...ordersIndex, collection: 'carts' }], steps },
    ],
    ['another name', { migrations, indexes: [{ ...ordersIndex, name: 'buyer2' }], steps }],
    ['another key', { migrations, indexes: [{ ...ordersIndex, key: { buyerId: -1 } }], steps }],
    [
      'another key order',
      {
        migrations,
        indexes: [{ ...ordersIndex, key: { a: 1, b: 1 } }],
        steps,
      },
    ],
    ['unique', { migrations, indexes: [{ ...ordersIndex, unique: true }], steps }],
    ['sparse', { migrations, indexes: [{ ...ordersIndex, sparse: true }], steps }],
    ['a TTL', { migrations, indexes: [{ ...ordersIndex, expireAfterSeconds: 60 }], steps }],
    [
      'a partial filter',
      { migrations, indexes: [{ ...ordersIndex, partialFilterExpression: { a: 1 } }], steps },
    ],
    ['a new index', { migrations, indexes: [...indexes, { ...ordersIndex, name: 'x' }], steps }],
    ['a step with new work', { migrations, indexes, steps: [{ ...step, fingerprint: 'v2' }] }],
    ['a renamed step', { migrations, indexes, steps: [{ ...step, name: 'other' }] }],
    ['no step', { migrations, indexes }],
  ])('changes with %s', (_, release) => {
    expect(releaseFingerprint(release)).not.toBe(fingerprint);
  });

  it('tells the key order apart', () => {
    const ab = releaseFingerprint({
      migrations: [],
      indexes: [{ ...ordersIndex, key: { a: 1, b: 1 } }],
    });
    const ba = releaseFingerprint({
      migrations: [],
      indexes: [{ ...ordersIndex, key: { b: 1, a: 1 } }],
    });
    expect(ab).not.toBe(ba);
  });
});

describe('runRelease', () => {
  it('runs migrations, then the index sync, then the steps, records them and gives the lease back', async () => {
    const order: string[] = [];
    const runs: string[] = [];
    const migrations = [
      counted('20261027-001-a', runs, async () => {
        order.push('migration a');
        // the index sync comes after: no orders index yet
        expect(
          await mongo.db
            .collection('orders')
            .indexExists('buyer')
            .catch(() => false),
        ).toBe(false);
      }),
      counted('20261027-002-b', runs, () => {
        order.push('migration b');
        return Promise.resolve();
      }),
    ];
    const steps = [
      {
        name: 'sync',
        fingerprint: 'v1',
        run: async ({ mongo: db }: { mongo: Mongo }) => {
          order.push('step');
          expect(await db.db.collection('orders').indexExists('buyer')).toBe(true);
        },
      },
    ];

    const report = await runRelease(options({ migrations, indexes: [ordersIndex], steps }));

    expect(order).toEqual(['migration a', 'migration b', 'step']);
    expect(report).toMatchObject({
      upToDate: false,
      fingerprint: releaseFingerprint({ migrations, indexes: [ordersIndex], steps }),
      migrations: ['20261027-001-a', '20261027-002-b'],
      unknownMigrations: [],
      indexes: { created: ['orders.buyer'], extra: [] },
      steps: ['sync'],
    });
    expect(report.ms).toBeGreaterThanOrEqual(0);
    const records = await mongo.db.collection(MIGRATIONS).find().sort({ _id: 1 }).toArray();
    expect(records).toMatchObject([
      { _id: '20261027-001-a', description: 'test 20261027-001-a' },
      { _id: '20261027-002-b', description: 'test 20261027-002-b' },
    ]);
    expect(records[0]?.appliedAt).toBeInstanceOf(Date);
    expect(typeof records[0]?.ms).toBe('number');
    expect(await mongo.db.collection(RELEASE_STATE).findOne({})).toMatchObject({
      _id: 'current',
      fingerprint: report.fingerprint,
    });
    expect(await lease().countDocuments()).toBe(0);
    expect(lines.find((line) => line.msg === 'release steps done')).toMatchObject({
      migrations: ['20261027-001-a', '20261027-002-b'],
      indexesCreated: ['orders.buyer'],
      steps: ['sync'],
    });
    expect(messages().filter((msg) => msg === 'migration applied')).toHaveLength(2);
  });

  it('only reads one document on the next boot of the same release, even while another holds the lease', async () => {
    const runs: string[] = [];
    const release = options({
      migrations: [counted('20261027-001-a', runs)],
      indexes: [ordersIndex],
    });
    await runRelease(release);
    await heldByOther(60_000);
    lines.length = 0;

    const report = await runRelease({ ...release, waitMs: 0 });

    expect(report).toMatchObject({
      upToDate: true,
      migrations: [],
      indexes: { created: [], extra: [] },
      steps: [],
    });
    expect(runs).toEqual(['20261027-001-a']);
    expect(messages()).toEqual(['release steps up to date']);
  });

  it('runs only the new migration of the next release', async () => {
    const runs: string[] = [];
    const first = [counted('20261027-001-a', runs)];
    await runRelease(options({ migrations: first }));
    const report = await runRelease(
      options({ migrations: [...first, counted('20261028-001-b', runs)] }),
    );
    expect(report.migrations).toEqual(['20261028-001-b']);
    expect(runs).toEqual(['20261027-001-a', '20261028-001-b']);
  });

  it('runs everything again with force, and makes an index dropped by hand again', async () => {
    const runs: string[] = [];
    const release = options({
      migrations: [counted('20261027-001-a', runs)],
      indexes: [ordersIndex],
    });
    await runRelease(release);
    await mongo.db.collection('orders').dropIndex('buyer');

    expect((await runRelease(release)).upToDate).toBe(true);
    const forced = await runRelease({ ...release, force: true });

    expect(forced).toMatchObject({ upToDate: false, indexes: { created: ['orders.buyer'] } });
    // force does not repeat applied migrations
    expect(runs).toEqual(['20261027-001-a']);
  });

  it('stops at a failed migration: not recorded, no new state, lease given back, and the next boot tries again', async () => {
    const runs: string[] = [];
    let fail = true;
    const migrations = [
      counted('20261027-001-a', runs),
      counted('20261027-002-b', runs, () =>
        fail ? Promise.reject(new Error('bad data')) : Promise.resolve(),
      ),
      counted('20261027-003-c', runs),
    ];
    const release = options({ migrations, indexes: [ordersIndex] });

    const error = await runRelease(release).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(MigrationFailedError);
    expect(error).toMatchObject({ migration: '20261027-002-b', cause: { message: 'bad data' } });
    expect(runs).toEqual(['20261027-001-a', '20261027-002-b']);
    expect(await mongo.db.collection(MIGRATIONS).distinct('_id')).toEqual(['20261027-001-a']);
    expect(await mongo.db.collection(RELEASE_STATE).countDocuments()).toBe(0);
    expect(await lease().countDocuments()).toBe(0);
    // the index sync never ran
    expect(
      await mongo.db
        .collection('orders')
        .indexExists('buyer')
        .catch(() => false),
    ).toBe(false);

    fail = false;
    const report = await runRelease(release);
    expect(report.migrations).toEqual(['20261027-002-b', '20261027-003-c']);
  });

  it('stops at an index conflict, and gives the lease back', async () => {
    await mongo.db.collection('orders').createIndex({ other: 1 }, { name: 'buyer' });
    await expect(runRelease(options({ indexes: [ordersIndex] }))).rejects.toMatchObject({
      name: 'IndexConflictError',
    });
    expect(await mongo.db.collection(RELEASE_STATE).countDocuments()).toBe(0);
    expect(await lease().countDocuments()).toBe(0);
  });

  it('stops at a failed step, and the next boot runs it again', async () => {
    let tries = 0;
    const steps = [
      {
        name: 'sync',
        fingerprint: 'v1',
        run: () => {
          tries += 1;
          return tries === 1 ? Promise.reject(new Error('step broke')) : Promise.resolve();
        },
      },
    ];
    await expect(runRelease(options({ steps }))).rejects.toThrow('step broke');
    expect(await mongo.db.collection(RELEASE_STATE).countDocuments()).toBe(0);
    expect(await lease().countDocuments()).toBe(0);
    expect((await runRelease(options({ steps }))).steps).toEqual(['sync']);
    expect(tries).toBe(2);
  });

  it('refuses a bad migration list before it touches the database', async () => {
    const bad = { id: 'nope', description: 'x', up: () => Promise.resolve() };
    await expect(runRelease(options({ migrations: [bad] }))).rejects.toThrow('must look like');
    expect(await lease().countDocuments()).toBe(0);
  });

  it('reports migrations the database has but the code does not know (a newer release ran first)', async () => {
    const runs: string[] = [];
    await runRelease(
      options({ migrations: [counted('20261027-001-a', runs), counted('20261028-001-b', runs)] }),
    );
    lines.length = 0;
    const older = await runRelease(options({ migrations: [counted('20261027-001-a', runs)] }));
    expect(older).toMatchObject({
      upToDate: false,
      migrations: [],
      unknownMigrations: ['20261028-001-b'],
    });
    expect(
      lines.find((line) => line.msg === 'the database has migrations this code does not know'),
    ).toMatchObject({
      level: 40,
      unknown: ['20261028-001-b'],
    });
  });

  it('warns about indexes nobody asks for, and keeps them', async () => {
    await mongo.db.collection('orders').createIndex({ old: 1 }, { name: 'old_one' });
    const report = await runRelease(options({ indexes: [ordersIndex] }));
    expect(report.indexes.extra).toEqual(['orders.old_one']);
    expect(
      lines.find((line) => (line.msg as string).startsWith('indexes nobody asks for')),
    ).toMatchObject({
      level: 40,
      indexes: ['orders.old_one'],
    });
    expect(await mongo.db.collection('orders').indexExists('old_one')).toBe(true);
  });

  it('runs a release on two instances at once only once', async () => {
    const runs: string[] = [];
    const migrations = [counted('20261027-001-a', runs, () => sleep(300))];
    const release = options({ migrations, indexes: [ordersIndex], pollMs: 50 });

    const reports = await Promise.all([runRelease(release), runRelease(release)]);

    expect(runs).toEqual(['20261027-001-a']);
    expect(reports.map((report) => report.upToDate).toSorted()).toEqual([false, true]);
    expect(messages()).toContain('waiting for another instance to finish its release steps');
    expect(await lease().countDocuments()).toBe(0);
  });

  it('keeps its lease while a step runs longer than the lease, so a second boot waits', async () => {
    const runs: string[] = [];
    // the lease lasts 1.5 s and is renewed every 500 ms; the migration takes 3 s
    const migrations = [counted('20261027-001-a', runs, () => sleep(3000))];
    const release = options({ migrations, lockTtlMs: 1500, pollMs: 50 });

    const first = runRelease(release);
    // without renewals the lease would have run out by now
    await sleep(2000);
    const second = await runRelease(release);
    const done = await first;

    expect(runs).toEqual(['20261027-001-a']);
    expect(done.upToDate).toBe(false);
    expect(second.upToDate).toBe(true);
  });

  it('goes on once the lease of a crashed instance runs out, even after waiting longer than its own lease', async () => {
    const runs: string[] = [];
    // waits 1.8 s; its own lease lasts 1.5 s, counted from the request that took it
    await heldByOther(1800);
    const report = await runRelease(
      options({
        migrations: [counted('20261027-001-a', runs)],
        indexes: [ordersIndex],
        lockTtlMs: 1500,
        pollMs: 50,
      }),
    );
    expect(report.upToDate).toBe(false);
    expect(runs).toEqual(['20261027-001-a']);
    expect(messages()).toContain('waiting for another instance to finish its release steps');
  });

  it('gives up with ReleaseLockTimeoutError when the lease stays taken', async () => {
    await heldByOther(60_000);
    const started = Date.now();
    const error = await runRelease(options({ waitMs: 300, pollMs: 50 })).catch(
      (caught: unknown) => caught,
    );
    expect(error).toBeInstanceOf(ReleaseLockTimeoutError);
    expect((error as Error).message).toContain('more than 300 ms');
    expect(Date.now() - started).toBeGreaterThanOrEqual(300);
    // the other instance's lease is untouched
    expect(await lease().findOne({ _id: RELEASE_LEASE })).toMatchObject({ owner: 'other' });
  });

  it('stops before the next step once another instance took its lease', async () => {
    const runs: string[] = [];
    const migrations = [
      counted('20261027-001-a', runs, async () => {
        // another instance takes over, and our next renewal (every 500 ms) finds out
        await heldByOther(60_000);
        await sleep(700);
      }),
      counted('20261027-002-b', runs),
    ];

    const error = await runRelease(options({ migrations, lockTtlMs: 1500 })).catch(
      (caught: unknown) => caught,
    );

    expect(error).toBeInstanceOf(ReleaseLeaseLostError);
    expect(runs).toEqual(['20261027-001-a']);
    expect(await mongo.db.collection(RELEASE_STATE).countDocuments()).toBe(0);
    // the other instance's lease stays
    expect(await lease().findOne({ _id: RELEASE_LEASE })).toMatchObject({ owner: 'other' });
  });

  it('stops when it could not renew its lease in time, and never takes a lease back that ran out', async () => {
    const runs: string[] = [];
    let mongoDown = false;
    const flaky: Mongo = {
      ...mongo,
      db: new Proxy(mongo.db, {
        get(target, property, receiver) {
          if (property === 'collection') {
            return (name: string) => {
              if (mongoDown && name === LOCKS) throw new Error('MongoDB is away');
              return target.collection(name);
            };
          }
          return Reflect.get(target, property, receiver) as unknown;
        },
      }),
    };
    const migrations = [
      counted('20261027-001-a', runs, async () => {
        // the 1.5 s lease runs out while MongoDB is away
        mongoDown = true;
        await sleep(2000);
        mongoDown = false;
        // MongoDB is back: a renewal now would succeed, but the lease had already run out
        await sleep(800);
      }),
      counted('20261027-002-b', runs),
    ];

    const error = await runRelease({
      ...options({ migrations, lockTtlMs: 1500 }),
      mongo: flaky,
    }).catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ReleaseLeaseLostError);
    expect(runs).toEqual(['20261027-001-a']);
    expect(messages()).toContain('could not renew the release lease');
  });

  it('stops when a step held the process past the lease, before any renewal could run', async () => {
    const ran: string[] = [];
    // work that holds the process and never lets a timer run (like CPU work on 0.1 CPU on free
    // Render): the lease runs out unseen
    const busy = (name: string, ms: number) => () => {
      ran.push(name);
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
      return Promise.resolve();
    };
    const steps = [
      { name: 'heavy', fingerprint: 'v1', run: busy('heavy', 1700) },
      { name: 'next', fingerprint: 'v1', run: busy('next', 0) },
    ];

    const error = await runRelease(options({ steps, lockTtlMs: 1500 })).catch(
      (caught: unknown) => caught,
    );

    expect(error).toBeInstanceOf(ReleaseLeaseLostError);
    expect(ran).toEqual(['heavy']);
    expect(await mongo.db.collection(RELEASE_STATE).countDocuments()).toBe(0);
  });

  it('warns when the steps take longer than the boot budget', async () => {
    const migrations = [counted('20261027-001-a', [], () => sleep(60))];
    await runRelease(options({ migrations, budgetMs: 20 }));
    expect(
      lines.find((line) => line.msg === 'release steps took longer than the boot budget'),
    ).toMatchObject({
      level: 40,
      budgetMs: 20,
    });
  });

  it('does not warn within the budget', async () => {
    await runRelease(options({ indexes: [ordersIndex] }));
    expect(messages()).not.toContain('release steps took longer than the boot budget');
  });

  it('holds a 30 second lease by default (ARCHITECTURE §11.1)', async () => {
    let left = 0;
    const migrations = [
      counted('20261027-001-a', [], async () => {
        const [held] = await lease()
          .aggregate<{ left: number }>([
            { $match: { _id: RELEASE_LEASE } },
            { $project: { left: { $subtract: ['$expiresAt', '$$NOW'] } } },
          ])
          .toArray();
        left = held?.left ?? 0;
      }),
    ];
    await runRelease(options({ migrations }));
    expect(left).toBeGreaterThan(25_000);
    expect(left).toBeLessThanOrEqual(30_000);
  });

  it('stops renewing once it is done: the lease does not come back', async () => {
    const migrations = [counted('20261027-001-a', [], () => sleep(700))];
    await runRelease(options({ migrations, lockTtlMs: 1500 }));
    expect(await lease().countDocuments()).toBe(0);
    // renewals came every 500 ms while it ran
    await sleep(1000);
    expect(await lease().countDocuments()).toBe(0);
  });

  it.each([
    ['the last migration', 'migration'],
    ['the first step', 'first step'],
    ['the last step', 'last step'],
  ])(
    'stops when the lease is taken during %s: nothing after it runs, and no release is recorded',
    async (_, where) => {
      const ran: string[] = [];
      // another instance takes over, and our next renewal (every 500 ms) finds out
      const stolen = async (name: string) => {
        ran.push(name);
        if (name === where) {
          await heldByOther(60_000);
          await sleep(700);
        }
      };
      const migrations = [
        {
          id: '20261027-001-a',
          description: 'a',
          up: () => stolen('migration'),
        },
      ];
      const steps = ['first step', 'last step'].map((name) => ({
        name,
        fingerprint: 'v1',
        run: () => stolen(name),
      }));

      const error = await runRelease(
        options({ migrations, indexes: [ordersIndex], steps, lockTtlMs: 1500 }),
      ).catch((caught: unknown) => caught);

      expect(error).toBeInstanceOf(ReleaseLeaseLostError);
      const order = ['migration', 'first step', 'last step'];
      expect(ran).toEqual(order.slice(0, order.indexOf(where) + 1));
      expect(await mongo.db.collection(RELEASE_STATE).countDocuments()).toBe(0);
      // the index sync runs only while the lease is ours
      expect(
        await mongo.db
          .collection('orders')
          .indexExists('buyer')
          .catch(() => false),
      ).toBe(where !== 'migration');
    },
  );
});
