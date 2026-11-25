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
  saveBeforeCopy,
  SNAPSHOT_DIR,
  startMongo,
  stopMongo,
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
  if (!mongoIsRunning(target)) {
    fail(
      `MongoDB is not running on this laptop: set DOCKER_CONTEXT=${target} and start it with npm run infra:up -- backend. ` +
        'If infra:up is running on the secondary, its SSH tunnel holds the same ports on this laptop: stop it with npm run infra:down (that saves a snapshot) and use npm run dev-data:restore instead.',
    );
  }
  // The secondary's MongoDB is started here, without the SSH tunnel, when it is not running, and
  // stopped again afterwards, so the copy leaves the secondary as it found it.
  const startedHere = !mongoIsRunning(INFRA_CONTEXT);
  if (startedHere && !startMongo(INFRA_CONTEXT)) {
    fail(
      `MongoDB did not start on the secondary: is it on, on the same network as this laptop, and does ssh ${INFRA_CONTEXT} work?`,
    );
  }
  // This laptop's data is saved first: a copy that breaks off (the network goes) would otherwise
  // leave it half replaced, since the restore drops each collection before it fills it.
  let broken: string | undefined;
  try {
    const backup = await saveBeforeCopy(target);
    console.log(`Saved this laptop's development MongoDB to ${backup} first.`);
    try {
      await copyFromSecondary(target);
      console.log("Copied the secondary's development MongoDB into this laptop's.");
    } catch (error) {
      console.error(
        `The copy broke off (${(error as Error).message}): putting this laptop's MongoDB back from ${backup}.`,
      );
      try {
        await restoreSnapshot(target, backup);
        broken =
          "This laptop's development MongoDB is back as it was before the copy. Run npm run dev-data:copy again once the secondary answers.";
      } catch (restoreError) {
        broken = `Putting it back failed too (${(restoreError as Error).message}). The saved data is ${backup}: restore it with docker compose -p ${DEV_PROJECT} exec -T mongo mongorestore --archive --gzip --drop < "${backup}" (from the infra folder).`;
      }
    }
  } finally {
    if (startedHere && !stopMongo(INFRA_CONTEXT)) {
      console.error(
        'MongoDB could not be stopped on the secondary: stop it there with npm run infra:down.',
      );
    }
  }
  if (broken) fail(broken);
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
