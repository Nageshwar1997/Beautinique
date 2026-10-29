import { randomBytes, randomUUID } from 'node:crypto';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable, Writable } from 'node:stream';

import { createLogger } from '@beautinique/backend-server-kit';
import { connectMongo, type Mongo } from '@beautinique/backend-server-mongo';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { grantMasterCli } from '../src/grant-master-cli.ts';

// the laptop's and CI's local MongoDB (`npm run infra:up`), in a test database of its own
const MONGO_URI = 'mongodb://localhost:27017/?replicaSet=rs0';
const id = randomUUID().slice(0, 8);
const identityDb = `bq_test_cli_master_${id}`;
const logger = createLogger({ name: 'grant-master-cli-test', level: 'silent' });
const OWNER = `owner-${id}@beautinique.example`;
let dir: string;
let mongo: Mongo;

const envText = [
  `IDENTITY__MONGO_URI=${MONGO_URI}`,
  `IDENTITY__MONGO_DB_NAME=${identityDb}`,
  'IDENTITY__REDIS_URL=redis://localhost:6379/5',
  `IDENTITY__FIELD_KEYS=k1:${randomBytes(32).toString('base64')}`,
  `IDENTITY__BLIND_INDEX_KEY=b1:${randomBytes(32).toString('base64')}`,
  `IDENTITY__OTP_EVENT_KEYS=e1:${randomBytes(32).toString('base64')}`,
].join('\n');

beforeAll(async () => {
  dir = await mkdtemp(join(tmpdir(), 'bq-grant-master-cli-'));
  await writeFile(join(dir, 'laptop.env'), envText);
  await writeFile(join(dir, 'live.env'), envText);
  mongo = await connectMongo({ uri: MONGO_URI, dbName: identityDb, appName: 'cli-test', logger });
  const now = new Date();
  await mongo.db.collection<Record<string, unknown> & { _id: string }>('identity_users').insertOne({
    _id: randomUUID(),
    email: OWNER,
    status: 'active',
    emailVerifiedAt: now,
    ageDeclaredAt: now,
    signUpApp: 'customer',
    createdAt: now,
    updatedAt: now,
  });
});
afterAll(async () => {
  await rm(dir, { recursive: true, force: true });
  await mongo.db.dropDatabase();
  await mongo.close();
});

/** Runs the CLI with its own files and the given answer: the exit code and what it printed. */
async function run(args: string[], answer = '') {
  let printed = '';
  const output = new Writable({
    write(chunk: Buffer, _encoding, done) {
      printed += chunk.toString();
      done();
    },
  });
  const code = await grantMasterCli(args, {
    logger,
    output,
    input: Readable.from([`${answer}\n`]),
    files: { laptop: join(dir, 'laptop.env'), live: join(dir, 'live.env') },
  });
  return { code, printed };
}

const masters = () =>
  mongo.db.collection('identity_grants').countDocuments({ role: 'master.master', active: true });

describe('npm run db:grant-master', () => {
  it('explains itself, and refuses a missing email or another --env', async () => {
    expect(await run(['--help'])).toMatchObject({ code: 0 });
    expect((await run(['--help'])).printed).toMatch(/--email <email>/);
    const missing = await run([]);
    expect(missing.code).toBe(1);
    expect(missing.printed).toMatch(/--email is required/);
    expect(await run(['--email', OWNER, '--env', 'staging'])).toMatchObject({ code: 1 });
    expect(await run(['--nope'])).toMatchObject({ code: 1 });
    expect(await masters()).toBe(0);
  });

  it('does nothing on the live database unless "live" is typed', async () => {
    const stopped = await run(['--email', OWNER, '--env', 'live'], 'yes');
    expect(stopped.code).toBe(1);
    expect(stopped.printed).toMatch(/LIVE database: .* on localhost:27017/);
    expect(stopped.printed).toMatch(/Stopped: nothing changed/);
    expect(await masters()).toBe(0);
  });

  it('gives the role once, with the release steps run first', async () => {
    const given = await run(['--email', OWNER]);
    expect(given.code).toBe(0);
    expect(given.printed).toMatch(/is now a Master/);
    expect(await mongo.db.collection('identity_roles').countDocuments()).toBeGreaterThan(79);
    expect(await masters()).toBe(1);
    const again = await run(['--email', OWNER, '--env', 'live'], 'live');
    expect(again.code).toBe(0);
    expect(again.printed).toMatch(/a Master already/);
    expect(await masters()).toBe(1);
  });

  it('says what went wrong for an email without an account', async () => {
    const failed = await run(['--email', `nobody-${id}@beautinique.example`]);
    expect(failed.code).toBe(1);
    expect(failed.printed).toMatch(/Failed: No account has .*sign up in the customer app first/);
  });
});
