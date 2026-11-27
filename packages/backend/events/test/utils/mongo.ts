import { randomUUID } from 'node:crypto';
import { Socket } from 'node:net';

import { acquireLease, createMongoClient, releaseLease } from '@beautinique/backend-mongo';
import type { Db, Document, MongoClient } from 'mongodb';

// The tests' real MongoDB and Valkey (docs/OPERATIONS.md §1 rule 6): `npm run infra:up --
// backend`. The CI has them up. On a laptop with no container up the integration tests are
// skipped, and say so; in the CI one that does not answer is a failure, not a skip.
export const MONGO_PORT = Number(process.env['BQ_MONGO_PORT'] ?? 27017);
export const VALKEY_PORT = Number(process.env['BQ_VALKEY_PORT'] ?? 6379);
export const IN_CI = process.env['CI'] !== undefined;
export const MONGO_URI = `mongodb://127.0.0.1:${String(MONGO_PORT)}/?directConnection=true`;
export const VALKEY_URL = `redis://127.0.0.1:${String(VALKEY_PORT)}`;

/** Whether something answers on a port of this machine. */
export function reachable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new Socket();
    const done = (up: boolean) => {
      socket.destroy();
      resolve(up);
    };
    socket.setTimeout(1_000);
    socket.once('connect', () => {
      done(true);
    });
    socket.once('timeout', () => {
      done(false);
    });
    socket.once('error', () => {
      done(false);
    });
    socket.connect(port, '127.0.0.1');
  });
}

/** Whether a file's integration tests run: always in the CI, on a laptop when its containers are up. */
export async function integrationRuns(file: string, ports: readonly number[]): Promise<boolean> {
  if (IN_CI) return true;
  const up = await Promise.all(ports.map((port) => reachable(port)));
  if (up.includes(false)) {
    console.warn(`MongoDB or Valkey does not answer: ${file} is skipped.`);
    return false;
  }
  return true;
}

/** A client with an app name of its own, so a fail point can be aimed at it alone. */
export async function connectTest(
  label: string,
): Promise<{ client: MongoClient; appName: string }> {
  const appName = `bq-test-${label}-${randomUUID().slice(0, 8)}`;
  const client = createMongoClient({ uri: MONGO_URI, appName, maxPoolSize: 20 });
  await client.connect();
  return { client, appName };
}

/** A database of its own for each test file (docs/ARCHITECTURE.md §10.4 rule 9), dropped after. */
export function testDatabase(client: MongoClient, label: string): Db {
  return client.db(`bq_test_${label}_${randomUUID().slice(0, 8)}`);
}

// The `failCommand` fail point is one for the whole server: a test file that sets it would undo
// another's. So a file takes this lock first (in the server, across the files and the packages
// that test at once), holds it until it turns the fail point off, and the others wait for it.
const FAIL_POINT_LOCK = 'failCommand';
const LOCK_MS = 60_000;
const owner = randomUUID();
let holding = false;

async function takeFailPointLock(client: MongoClient): Promise<void> {
  const locks = client.db('bq_test_locks');
  const end = performance.now() + 2 * LOCK_MS;
  // A wait on a condition (the lock is free), never a fixed sleep (docs/RULES.md RT-25).
  while (
    !(await acquireLease(locks, { name: FAIL_POINT_LOCK, owner, now: new Date(), ttlMs: LOCK_MS }))
  ) {
    if (performance.now() > end) throw new Error('The fail point lock stayed taken.');
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  holding = true;
}

/**
 * Sets the `failCommand` fail point (the containers have the test commands on) for `appName`
 * only, so the tests of other packages that run beside it are not touched; the lock above keeps
 * two files from setting it at once.
 */
export async function failPoint(
  client: MongoClient,
  appName: string,
  mode: Document | string,
  data: Document,
): Promise<void> {
  await takeFailPointLock(client);
  await client
    .db('admin')
    .command({ configureFailPoint: 'failCommand', mode, data: { ...data, appName } });
}

/** Makes the next `times` of the given commands from `appName` fail. */
export async function failCommands(
  client: MongoClient,
  appName: string,
  times: number,
  data: Document,
): Promise<void> {
  await failPoint(client, appName, { times }, data);
}

/** Turns the fail point off and gives the lock back; a file that did not set it does nothing. */
export async function failPointOff(client: MongoClient): Promise<void> {
  if (!holding) return;
  await client.db('admin').command({ configureFailPoint: 'failCommand', mode: 'off' });
  await releaseLease(client.db('bq_test_locks'), { name: FAIL_POINT_LOCK, owner });
  holding = false;
}
