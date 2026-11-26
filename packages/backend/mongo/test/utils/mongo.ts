import { randomUUID } from 'node:crypto';
import { Socket } from 'node:net';

import type { Db, Document, MongoClient } from 'mongodb';

import { createMongoClient } from '../../src/client.ts';

// The tests' real MongoDB (docs/OPERATIONS.md §1 rule 6): `npm run infra:up -- backend`. The CI has
// it up. On a laptop with no container up the integration tests are skipped, and say so; in the CI
// a MongoDB that does not answer is a failure, not a skip.
export const MONGO_PORT = Number(process.env['BQ_MONGO_PORT'] ?? 27017);
export const IN_CI = process.env['CI'] !== undefined;
export const MONGO_URI = `mongodb://127.0.0.1:${String(MONGO_PORT)}/?directConnection=true`;

/** Whether something answers on MongoDB's port. */
export function mongoReachable(port = MONGO_PORT): Promise<boolean> {
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

/** Whether a file's integration tests run: always in the CI, on a laptop when MongoDB is up. */
export async function integrationRuns(file: string): Promise<boolean> {
  if (IN_CI) return true;
  const up = await mongoReachable();
  if (!up)
    console.warn(`MongoDB does not answer on port ${String(MONGO_PORT)}: ${file} is skipped.`);
  return up;
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

/**
 * Makes the next `times` of the given commands from `appName` fail (the `failCommand` fail point;
 * the containers have the test commands on). Only that app's commands fail, so the tests of other
 * packages that run beside it are not touched.
 */
export async function failCommands(
  client: MongoClient,
  appName: string,
  times: number,
  data: Document,
): Promise<void> {
  await client.db('admin').command({
    configureFailPoint: 'failCommand',
    mode: { times },
    data: { ...data, appName },
  });
}

export async function failPointOff(client: MongoClient): Promise<void> {
  await client.db('admin').command({ configureFailPoint: 'failCommand', mode: 'off' });
}
