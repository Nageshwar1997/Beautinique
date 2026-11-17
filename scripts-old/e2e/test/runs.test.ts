// The E2E runs' clean-up (QA-TOOL-002): this run's backend stops before its databases go, so none
// comes back, and the databases of runs that are over go too. Against the local MongoDB (`npm run
// infra:up`), with a database prefix and a pid folder of its own: a real E2E run is never touched.
import { type ChildProcess, spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createLogger } from '@beautinique/backend-server-kit';
import { connectMongo, type Mongo } from '@beautinique/backend-server-mongo';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { cleanUpRun } from '../runs.ts';

const PREFIX = `bq_test_e2eruns_${randomUUID().slice(0, 6)}_`;
const dir = mkdtempSync(join(tmpdir(), 'bq-e2e-runs-'));
let mongo: Mongo;
const writers: ChildProcess[] = [];

beforeAll(async () => {
  mongo = await connectMongo({
    uri: 'mongodb://localhost:27017/?replicaSet=rs0',
    dbName: 'admin',
    appName: 'e2e-runs-test',
    logger: createLogger({ name: 'e2e-runs-test', level: 'silent' }),
  });
});

afterAll(async () => {
  for (const writer of writers) writer.kill('SIGKILL');
  await new Promise((resolve) => setTimeout(resolve, 200));
  for (const name of await ours()) await mongo.client.db(name).dropDatabase();
  await mongo.close();
  rmSync(dir, { recursive: true, force: true });
});

/** This test's databases now. */
async function ours(): Promise<string[]> {
  const { databases } = await mongo.client.db('admin').admin().listDatabases({ nameOnly: true });
  return databases.map((d) => d.name).filter((name) => name.startsWith(PREFIX));
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** A stand-in backend for `runId`, writing into its run's database until stopped. */
async function startWriter(runId: string): Promise<ChildProcess> {
  const writer = spawn(
    process.execPath,
    [join(import.meta.dirname, 'fixtures', 'backend-writer.ts'), runId, dir, PREFIX],
    { stdio: 'ignore' },
  );
  writers.push(writer);
  for (let tries = 0; !(await ours()).includes(`${PREFIX}${runId}_core`); tries += 1) {
    if (tries > 100) throw new Error('the stand-in backend never wrote');
    await wait(100);
  }
  return writer;
}

const gone = (writer: ChildProcess) => writer.exitCode !== null || writer.signalCode !== null;

describe('cleaning up after an E2E run (QA-TOOL-002)', () => {
  it('stops the run’s backend before its databases go, so none comes back', async () => {
    const run = randomUUID().slice(0, 8);
    const writer = await startWriter(run);
    await cleanUpRun(mongo, run, { dir, prefix: PREFIX });
    await wait(200);
    expect(gone(writer)).toBe(true);
    // it wrote every 50 ms while it lived: nothing came back after the drop
    await wait(500);
    expect(await ours()).not.toContain(`${PREFIX}${run}_core`);
  });

  it('drops the databases of runs that are over, and keeps those of a run still going', async () => {
    const finished = randomUUID().slice(0, 8);
    await mongo.client
      .db(`${PREFIX}${finished}_identity`)
      .collection('platform_locks')
      .insertOne({});
    const going = randomUUID().slice(0, 8);
    const writer = await startWriter(going);
    await cleanUpRun(mongo, undefined, { dir, prefix: PREFIX });
    const left = await ours();
    expect(left).not.toContain(`${PREFIX}${finished}_identity`);
    expect(left).toContain(`${PREFIX}${going}_core`);
    expect(gone(writer)).toBe(false);
  });
});
