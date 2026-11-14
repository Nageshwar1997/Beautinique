// Every job of .github/workflows/ci.yml (but guard and check) runs this first:
//   node scripts/ci/bin/plan.ts --job <static|test-scripts|test-backend|test-frontend|e2e|verify> [--app <app>]
// and its steps read the outputs: run (true/false), code, args, tree, upload. The rules are in
// ../lib/plan.ts. It looks for the marker with the gh CLI (on every GitHub runner, GH_TOKEN from the
// job), not an HTTP call of its own.
import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';

import { findPassedRun, type Job, JOBS, loadWorkspaces, planJob } from '../lib/plan.ts';

const root = join(import.meta.dirname, '../../..');
const { values } = parseArgs({
  options: { job: { type: 'string' }, app: { type: 'string' } },
});
const job = values.job as Job;
if (!JOBS.includes(job)) {
  throw new Error(`--job must be one of ${JOBS.join(', ')} (got ${String(values.job)}).`);
}

const git = (...args: string[]) =>
  execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const nulList = (output: string) => output.split('\0').filter((entry) => entry !== '');

// CI passes these through env (whoever opens a pull request names its branches)
const env = process.env;
const event = env.EVENT_NAME ?? '';
const base = env.BASE_REF ?? '';
const repo = env.REPO ?? '';

// A pull request into a work branch (prerelease, or a feature branch) tests what it affects; a push
// and a pull request into release or main test everything.
const full = event !== 'pull_request' || base === 'release' || base === 'main';
const tree = git('rev-parse', 'HEAD^{tree}').trim();
const passedRun = findPassedRun(tree, repo, (path) => {
  const output = execFileSync('gh', ['api', path], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return JSON.parse(output) as unknown;
});

// For a pull request the checkout is its merge commit: the first parent is the base branch, so
// this diff is exactly what the pull request brings in. --no-renames lists a moved file at both paths.
let changed: string[] | null = null;
if (!full && passedRun === undefined) {
  try {
    changed = nulList(git('diff', '--name-only', '--no-renames', '-z', 'HEAD^1', 'HEAD'));
  } catch {
    changed = null;
  }
}

const rootManifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
  workspaces?: string[];
};
const workspaces = loadWorkspaces({
  patterns: rootManifest.workspaces ?? [],
  files: nulList(git('ls-files', '-z')),
  read: (path) => readFileSync(join(root, path), 'utf8'),
});

const plan = planJob({ job, app: values.app, full, passedRun, changed, workspaces });
const upload = plan.everything && passedRun === undefined;
const label = values.app === undefined ? job : `${job} (${values.app})`;

console.log(`${label}: ${plan.run ? 'runs' : 'skips its steps'}, ${plan.reason}.`);
console.log(
  `Tree ${tree}${changed === null ? '' : `, ${String(changed.length)} changed file(s)`}.`,
);
if (plan.args !== '') console.log(`npm arguments: ${plan.args}`);

const outputs = {
  run: String(plan.run),
  code: String(plan.code),
  args: plan.args,
  tree,
  upload: String(upload),
};
if (env.GITHUB_OUTPUT !== undefined) {
  appendFileSync(
    env.GITHUB_OUTPUT,
    Object.entries(outputs)
      .map(([key, value]) => `${key}=${value}\n`)
      .join(''),
  );
}
if (env.GITHUB_STEP_SUMMARY !== undefined) {
  appendFileSync(
    env.GITHUB_STEP_SUMMARY,
    `**${label}:** ${plan.run ? 'runs' : 'skips its steps'}, ${plan.reason}.\n`,
  );
}
