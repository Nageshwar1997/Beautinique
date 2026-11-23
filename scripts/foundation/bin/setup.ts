// `npm run setup`: a new laptop, ready in one command (docs/OPERATIONS.md §1 rule 10).
// 1. The pinned Node and npm.  2. `npm ci`.  3. Every deployable's `.env.development` and `.env.test`
// from its `.env.example` (existing files are kept).  4. `infra:up backend`.
// The seed joins with the services. `.env.production` is never created, read or touched.
import { join } from 'node:path';

import { ROOT } from '../src/constants/paths.ts';
import { deployablesWithEnvExample, writeEnvFiles } from '../src/env-files.ts';
import { compose, dockerIsRunning, upArgs } from '../src/infra.ts';
import type { RootManifest } from '../src/root-checks.ts';
import { expectedVersions, npm, versionProblems } from '../src/setup.ts';
import { readJson } from '../src/utils/read-json.ts';

function fail(message: string): never {
  console.error(`\nSetup stopped: ${message}`);
  process.exit(1);
}

function step(title: string) {
  console.log(`\n> ${title}`);
}

step('Node and npm');
const expected = expectedVersions(readJson(join(ROOT, 'package.json')) as RootManifest);
const npmVersion = String(npm(['--version']).stdout).trim();
const problems = versionProblems(expected, { node: process.versions.node, npm: npmVersion });
if (problems.length > 0) fail(problems.join('\n'));
console.log(`Node ${process.versions.node}, npm ${npmVersion}`);

step('npm ci (no install scripts, as in CI)');
const install = npm(['ci', '--ignore-scripts'], { cwd: ROOT, stdio: 'inherit' });
if (install.status !== 0) fail('npm ci failed (its output is above).');

step('Env files');
const deployables = deployablesWithEnvExample(ROOT);
if (deployables.length === 0) console.log('No deployable has a .env.example yet.');
for (const deployable of deployables) {
  for (const result of writeEnvFiles(join(ROOT, deployable))) {
    const path = `${deployable}/${result.file}`;
    if (result.status === 'kept') {
      console.log(`kept     ${path} (it already exists)`);
      continue;
    }
    console.log(`created  ${path}`);
    if (result.placeholders.length > 0) {
      console.log(`         fill in: ${result.placeholders.join(', ')}`);
    }
  }
}

step('Containers: infra:up backend');
if (!dockerIsRunning()) {
  fail('Docker is not running. Start Docker Desktop (or the Docker service) and run setup again.');
}
const up = compose(upArgs(['backend']), { stdio: 'inherit' });
if (up.status !== 0) fail('infra:up backend failed (its output is above).');

console.log('\nSetup done. Stop the containers with `npm run infra:down` when the work is over.');
