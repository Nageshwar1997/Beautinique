import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { afterAll, beforeAll, test } from 'vitest';

import { ROOT } from '../src/constants/paths.ts';
import { cleanEnv } from './utils/env.ts';

// A clean clone, made from the files git knows (tracked and new, never ignored ones such as
// node_modules or env files), plus one made-up service with a .env.example. No real secret anywhere.
let clone = '';

// Its own containers: a project name and ports of its own, beside the owner's.
const ENV = {
  ...cleanEnv(),
  COMPOSE_PROJECT_NAME: 'bq-setup-test',
  BQ_DATA_IN_MEMORY: 'true',
  BQ_MONGO_PORT: '37018',
  BQ_VALKEY_PORT: '36380',
};

const EXAMPLE = [
  '# [DEVELOPMENT]',
  'BQ_DEMO_URL=http://127.0.0.1:3000',
  'BQ_DEMO_SECRET=<a random secret>',
  '# [TEST]',
  'BQ_DEMO_URL=http://127.0.0.1:3999',
  'BQ_DEMO_SECRET=test-secret',
  '# [PRODUCTION]',
  'BQ_DEMO_URL=<...>',
  'BQ_DEMO_SECRET=<...>',
  '',
].join('\n');

beforeAll(() => {
  clone = mkdtempSync(join(tmpdir(), 'bq-setup-clone-'));
  const files = spawnSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], {
    cwd: ROOT,
    encoding: 'utf8',
  });
  assert.equal(files.status, 0, files.stderr);
  for (const file of files.stdout.split('\0').filter(Boolean)) {
    if (!existsSync(join(ROOT, file))) continue; // deleted in the working tree
    mkdirSync(dirname(join(clone, file)), { recursive: true });
    cpSync(join(ROOT, file), join(clone, file));
  }

  // The made-up service: no package.json, so it is no workspace and the lockfile stays as it is.
  const demo = join(clone, 'backend', 'demo');
  mkdirSync(demo, { recursive: true });
  writeFileSync(join(demo, '.env.example'), EXAMPLE);
  writeFileSync(join(demo, '.env.test'), 'BQ_DEMO_URL=kept-by-the-owner\n');
  writeFileSync(join(demo, '.env.production'), 'BQ_DEMO_SECRET=only-the-owner-knows\n');
});

afterAll(() => {
  spawnSync(
    'docker',
    ['compose', '-f', join(clone, 'infra/compose.yaml'), '--profile', '*', 'down', '--volumes'],
    {
      env: ENV,
    },
  );
  rmSync(clone, { recursive: true, force: true });
});

test('AC-FOUNDATION-1: on a clean clone, setup installs, makes the missing env files, keeps the rest and starts the containers', () => {
  const setup = spawnSync(process.execPath, [join(clone, 'scripts/foundation/bin/setup.ts')], {
    cwd: clone,
    encoding: 'utf8',
    env: ENV,
  });
  const output = `${setup.stdout}\n${setup.stderr}`;
  assert.equal(setup.status, 0, output);

  // npm ci, from the lockfile.
  assert.ok(existsSync(join(clone, 'node_modules', 'turbo', 'package.json')), 'npm ci did not run');

  // The missing file is made from its section; the existing one is untouched.
  const demo = join(clone, 'backend', 'demo');
  const development = readFileSync(join(demo, '.env.development'), 'utf8');
  assert.match(development, /^BQ_DEMO_URL=http:\/\/127\.0\.0\.1:3000$/m);
  assert.match(development, /^BQ_DEMO_SECRET=<a random secret>$/m);
  assert.equal(readFileSync(join(demo, '.env.test'), 'utf8'), 'BQ_DEMO_URL=kept-by-the-owner\n');
  assert.match(output, /created {2}backend\/demo\/\.env\.development/);
  assert.match(output, /fill in: BQ_DEMO_SECRET/);
  assert.match(output, /kept {5}backend\/demo\/\.env\.test/);

  // AC-FOUNDATION-3: .env.production is neither touched nor mentioned.
  assert.equal(
    readFileSync(join(demo, '.env.production'), 'utf8'),
    'BQ_DEMO_SECRET=only-the-owner-knows\n',
  );
  assert.ok(!output.includes('.env.production'), 'setup must not touch .env.production');

  // infra:up backend: both containers healthy.
  const ps = spawnSync(
    'docker',
    [
      'compose',
      '-f',
      join(clone, 'infra/compose.yaml'),
      'ps',
      '--format',
      '{{.Service}} {{.Health}}',
    ],
    { env: ENV, encoding: 'utf8' },
  );
  assert.deepEqual(ps.stdout.split(/\r?\n/).filter(Boolean).sort(), [
    'mongo healthy',
    'valkey healthy',
  ]);
}, 600_000);
