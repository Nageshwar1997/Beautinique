import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { connect } from 'node:net';
import { join } from 'node:path';

import { afterAll, test } from 'vitest';

import { compose } from '../src/infra.ts';
import { ROOT } from './constants/paths.ts';
import { cleanEnv } from './utils/env.ts';

// A second set of containers beside the laptop's own: its own project name, volumes and ports, so the
// test never touches the containers the owner is working with.
const MONGO_PORT = 37017;
const VALKEY_PORT = 36379;
const ENV = {
  ...cleanEnv(),
  COMPOSE_PROJECT_NAME: 'bq-infra-test',
  BQ_MONGO_PORT: String(MONGO_PORT),
  BQ_VALKEY_PORT: String(VALKEY_PORT),
};
const CLI = join(ROOT, 'scripts', 'foundation', 'bin', 'infra.ts');

const infra = (...args: string[]) =>
  spawnSync(process.execPath, [CLI, ...args], { env: ENV, encoding: 'utf8' });
const inProject = (args: string[]) => compose(args, { env: ENV });

// One transaction on the replica set: it commits only where transactions are possible.
const TRANSACTION = [
  'const session = db.getMongo().startSession();',
  'session.startTransaction();',
  "session.getDatabase('bq_infra_test').items.insertOne({ n: 1 });",
  'session.commitTransaction();',
  "print('committed ' + db.getSiblingDB('bq_infra_test').items.countDocuments());",
].join(' ');

interface PsEntry {
  Service: string;
  State: string;
  Health: string;
  Publishers: { URL: string; PublishedPort: number }[];
}

function running(): PsEntry[] {
  const ps = inProject(['ps', '--format', 'json']);
  assert.equal(ps.status, 0, String(ps.stderr));
  return String(ps.stdout)
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line) as PsEntry);
}

function listening(port: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const socket = connect({ host: '127.0.0.1', port }, () => {
      socket.end();
      resolve();
    });
    socket.on('error', reject);
  });
}

afterAll(() => {
  inProject(['--profile', '*', 'down', '--volumes']);
});

test('AC-FOUNDATION-2: infra:up backend starts only MongoDB and Valkey, ready and on 127.0.0.1; infra:down stops them', async () => {
  const up = infra('up', 'backend');
  assert.equal(up.status, 0, `${up.stdout}\n${up.stderr}`);

  // Only the profile's containers, each healthy (up --wait returned), each published on 127.0.0.1.
  const containers = running();
  assert.deepEqual(containers.map((c) => c.Service).sort(), ['mongo', 'valkey']);
  for (const container of containers) {
    assert.equal(container.Health, 'healthy', `${container.Service}: ${container.Health}`);
    assert.ok(container.Publishers.length > 0, `${container.Service} publishes no port`);
    for (const publisher of container.Publishers) {
      assert.equal(publisher.URL, '127.0.0.1', `${container.Service}: ${publisher.URL}`);
    }
  }
  await listening(MONGO_PORT);
  await listening(VALKEY_PORT);

  // MongoDB is a replica set ready for transactions.
  const mongo = inProject([
    'exec',
    '-T',
    'mongo',
    'mongosh',
    '--quiet',
    '--port',
    String(MONGO_PORT),
    '--eval',
    TRANSACTION,
  ]);
  assert.equal(mongo.status, 0, `${String(mongo.stdout)}\n${String(mongo.stderr)}`);
  assert.match(String(mongo.stdout), /committed 1/);

  // Valkey has Render's memory limit (25 MB) and the policy BullMQ needs.
  const valkey = inProject([
    'exec',
    '-T',
    'valkey',
    'valkey-cli',
    '-p',
    String(VALKEY_PORT),
    'config',
    'get',
    'maxmemory*',
  ]);
  assert.equal(valkey.status, 0, String(valkey.stderr));
  assert.match(String(valkey.stdout), /^maxmemory\r?\n26214400$/m);
  assert.match(String(valkey.stdout), /^maxmemory-policy\r?\nnoeviction$/m);

  // infra:down stops and removes every container of the project.
  const down = infra('down');
  assert.equal(down.status, 0, `${down.stdout}\n${down.stderr}`);
  const left = inProject(['--profile', '*', 'ps', '--all', '--quiet']);
  assert.equal(String(left.stdout).trim(), '');
}, 300_000);
