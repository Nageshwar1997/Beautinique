import { randomUUID } from 'node:crypto';
import { Socket } from 'node:net';

import { createMongoClient } from '@beautinique/backend-mongo';
import type { Db, MongoClient } from 'mongodb';

// The tests' real MongoDB (docs/OPERATIONS.md §1 rule 6): `npm run infra:up -- backend`. The CI has
// it up. On a laptop with no container up the integration tests are skipped, and say so; in the CI
// one that does not answer is a failure, not a skip.
export const MONGO_PORT = Number(process.env['BQ_MONGO_PORT'] ?? 27017);
const IN_CI = process.env['CI'] !== undefined;
const MONGO_URI = `mongodb://127.0.0.1:${String(MONGO_PORT)}/?directConnection=true`;

function reachable(port: number): Promise<boolean> {
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
  if (await reachable(MONGO_PORT)) return true;
  console.warn(`MongoDB does not answer: ${file} is skipped.`);
  return false;
}

export async function connectTest(label: string): Promise<MongoClient> {
  const appName = `bq-test-${label}-${randomUUID().slice(0, 8)}`;
  const client = createMongoClient({ uri: MONGO_URI, appName, maxPoolSize: 10 });
  await client.connect();
  return client;
}

/** A database of its own for each test file (docs/ARCHITECTURE.md §10.4 rule 9), dropped after. */
export function testDatabase(client: MongoClient, label: string): Db {
  return client.db(`bq_test_${label}_${randomUUID().slice(0, 8)}`);
}
