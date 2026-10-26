import { randomBytes, randomUUID } from 'node:crypto';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable, Writable } from 'node:stream';

import { createLogger } from '@beautinique/backend-server-kit';
import { connectMongo } from '@beautinique/backend-server-mongo';
import { RELEASE_STATE } from '@beautinique/backend-server-release';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { releaseCli } from '../src/release-cli.ts';

// the laptop's and CI's local services (`npm run infra:up`), in test databases of their own
const MONGO_URI = 'mongodb://localhost:27017/?replicaSet=rs0';
const id = randomUUID().slice(0, 8);
const coreDb = `bq_test_cli_core_${id}`;
const identityDb = `bq_test_cli_identity_${id}`;
const logger = createLogger({ name: 'release-cli-test', level: 'silent' });
let dir: string;

const envText = (mongoUri: string) =>
  [
    `CORE__MONGO_URI=${mongoUri}`,
    `CORE__MONGO_DB_NAME=${coreDb}`,
    'CORE__REDIS_URL=redis://localhost:6379/5',
    `IDENTITY__MONGO_URI=${mongoUri}`,
    `IDENTITY__MONGO_DB_NAME=${identityDb}`,
    'IDENTITY__REDIS_URL=redis://localhost:6379/5',
  ].join('\n');

beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), 'bq-release-cli-'));
  await writeFile(join(dir, 'laptop.env'), envText(MONGO_URI));
  await writeFile(join(dir, 'live.env'), envText(MONGO_URI));
});
afterAll(async () => {
  await rm(dir, { recursive: true, force: true });
  const mongo = await connectMongo({ uri: MONGO_URI, dbName: coreDb, appName: 'cli-test', logger });
  await mongo.db.dropDatabase();
  await mongo.client.db(identityDb).dropDatabase();
  await mongo.close();
});

/** Runs the CLI with its own files, the given answer, and returns the exit code and what it printed. */
async function run(args: string[], answer = '', files?: { laptop: string; live: string }) {
  let printed = '';
  const output = new Writable({
    write(chunk: Buffer, _encoding, done) {
      printed += chunk.toString();
      done();
    },
  });
  const code = await releaseCli(args, {
    logger,
    output,
    input: Readable.from([answer]),
    files: files ?? { laptop: join(dir, 'laptop.env'), live: join(dir, 'live.env') },
  });
  return { code, printed };
}

describe('npm run db:release', () => {
  it('prints its help', async () => {
    const { code, printed } = await run(['--help']);
    expect(code).toBe(0);
    expect(printed).toContain('npm run db:release -- [options]');
  });

  it.each([
    [['--nope'], 'Unknown option'],
    [['--env', 'staging'], '--env takes only "live"'],
    [
      ['--deployable', 'shop'],
      'There is no deployable "shop". Deployables: identity, core, gateway.',
    ],
    [['--deployable', 'gateway'], 'gateway has no database, so it has no release steps.'],
  ])('refuses %j', async (args, message) => {
    const { code, printed } = await run(args);
    expect(code).toBe(1);
    expect(printed).toContain(message);
  });

  it('names the missing env file, and what to do', async () => {
    const missing = { laptop: join(dir, 'none.env'), live: join(dir, 'none.production') };
    const laptop = await run([], '', missing);
    expect(laptop.code).toBe(1);
    expect(laptop.printed).toContain('copy backend/bundle/.env.example to .env first');
    const live = await run(['--env', 'live'], 'live', missing);
    expect(live.code).toBe(1);
    expect(live.printed).toContain("the owner's private copy");
  });

  it('runs the release steps of every deployable with a database on the laptop, then finds them up to date', async () => {
    const first = await run([]);
    expect(first.code).toBe(0);
    expect(first.printed).toMatch(
      new RegExp(
        `identity \\(${identityDb} on localhost:27017\\): 0 migration\\(s\\), 0 index\\(es\\) made`,
      ),
    );
    expect(first.printed).toMatch(
      new RegExp(
        `core \\(${coreDb} on localhost:27017\\): 0 migration\\(s\\), \\d+ index\\(es\\) made`,
      ),
    );
    expect(first.printed).not.toContain('gateway');

    const again = await run([]);
    expect(again.printed).toContain(`identity (${identityDb} on localhost:27017): up to date`);
    expect(again.printed).toContain(`core (${coreDb} on localhost:27017): up to date`);

    const one = await run(['--deployable', 'core', '--force']);
    expect(one.code).toBe(0);
    expect(one.printed).toContain(
      `core (${coreDb} on localhost:27017): 0 migration(s), 0 index(es) made`,
    );
    expect(one.printed).not.toContain('identity');
  });

  it('asks before the live databases, and runs nothing without "live"', async () => {
    const secretUri = new URL('mongodb://localhost:27017/?replicaSet=rs0');
    secretUri.username = 'bq-core';
    secretUri.password = randomBytes(12).toString('hex');
    await writeFile(join(dir, 'secret.env'), envText(secretUri.toString()));
    const files = { laptop: join(dir, 'laptop.env'), live: join(dir, 'secret.env') };

    const { code, printed } = await run(['--env', 'live'], 'yes\n', files);

    expect(code).toBe(1);
    expect(printed).toContain('The release steps will run on the LIVE databases:');
    expect(printed).toContain(`core: ${coreDb} on localhost:27017`);
    expect(printed).toContain('Type "live" to go on:');
    expect(printed).toContain('Stopped: nothing ran.');
    expect(printed).not.toContain(secretUri.password);
    expect(printed).not.toContain('bq-core');
  });

  it('runs on the live databases after "live"', async () => {
    const liveIdentity = `${identityDb}_live`;
    await writeFile(join(dir, 'live.env'), envText(MONGO_URI).replace(identityDb, liveIdentity));
    const { code, printed } = await run(['--env', 'live', '--deployable', 'identity'], 'live\n');
    expect(code).toBe(0);
    expect(printed).toContain(`identity (${liveIdentity} on localhost:27017): 0 migration(s)`);
    const mongo = await connectMongo({
      uri: MONGO_URI,
      dbName: liveIdentity,
      appName: 'cli-test',
      logger,
    });
    expect(await mongo.db.collection(RELEASE_STATE).countDocuments()).toBe(1);
    await mongo.db.dropDatabase();
    await mongo.close();
  });

  it('reports a failure with exit code 1', async () => {
    await writeFile(
      join(dir, 'bad.env'),
      envText(MONGO_URI).replace('CORE__MONGO_URI=', 'CORE__MONGO_URI=nope'),
    );
    const { code, printed } = await run([], '', { laptop: join(dir, 'bad.env'), live: '' });
    expect(code).toBe(1);
    expect(printed).toContain('Failed: Invalid CORE configuration');
  });
});
