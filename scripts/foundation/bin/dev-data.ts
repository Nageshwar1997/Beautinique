// `npm run dev-data:copy` and `npm run dev-data:restore` (docs/OPERATIONS.md §1 rule 14): development
// data only ever moves towards this laptop (the primary), never to the secondary.
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import {
  contextEndpoint,
  copyFromSecondary,
  copyProblems,
  dockerHostProblems,
  latestSnapshot,
  localContexts,
  mongoIsRunning,
  pickLocalContext,
  restoreProblems,
  restoreSnapshot,
  SNAPSHOT_DIR,
} from '../src/dev-data.ts';
import { DEV_PROJECT } from '../src/infra.ts';
import { INFRA_CONTEXT } from '../src/remote-infra.ts';

const command = process.argv[2];

function fail(message: string | string[]): never {
  console.error([message].flat().join('\n'));
  process.exit(1);
}

if (command !== 'copy' && command !== 'restore') {
  fail('Usage: npm run dev-data:copy  |  npm run dev-data:restore');
}

const problems = dockerHostProblems();
if (problems.length > 0) fail(problems);

const target = pickLocalContext(localContexts());
if (!target)
  fail('No Docker context of this laptop was found. Start Docker Desktop and try again.');
const targetEndpoint = contextEndpoint(target);

if (command === 'copy') {
  const found = copyProblems({
    project: DEV_PROJECT,
    sourceEndpoint: contextEndpoint(INFRA_CONTEXT),
    targetEndpoint,
  });
  if (found.length > 0) fail(found);
  if (!mongoIsRunning(INFRA_CONTEXT)) {
    fail(
      'MongoDB is not running on the secondary: start it there with npm run infra:up -- backend.',
    );
  }
  if (!mongoIsRunning(target)) {
    fail(
      `MongoDB is not running on this laptop: set DOCKER_CONTEXT=${target} and start it with npm run infra:up -- backend.`,
    );
  }
  await copyFromSecondary(target);
  console.log("Copied the secondary's development MongoDB into this laptop's.");
} else {
  const found = restoreProblems(targetEndpoint, DEV_PROJECT);
  if (found.length > 0) fail(found);
  const latest = latestSnapshot(existsSync(SNAPSHOT_DIR) ? readdirSync(SNAPSHOT_DIR) : []);
  if (!latest) fail(`No snapshot in ${SNAPSHOT_DIR}: infra:down on the secondary saves one.`);
  if (!mongoIsRunning(target)) {
    fail(
      `MongoDB is not running on this laptop: set DOCKER_CONTEXT=${target} and start it with npm run infra:up -- backend.`,
    );
  }
  await restoreSnapshot(target, join(SNAPSHOT_DIR, latest));
  console.log(`Restored ${latest} into this laptop's development MongoDB.`);
}
