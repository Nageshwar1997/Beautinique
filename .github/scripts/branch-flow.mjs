// Branch flow check of the CI `guard` job (docs/OPERATIONS.md §2, rule 3; the flow itself: CLAUDE.md):
// - release takes only prerelease or hotfix/*;
// - prerelease takes work branches and the release back-merge, never hotfix/*;
// - every pull request into these two comes from this repository, never from a fork.
// Pull requests into any other branch are not checked. release is the GitHub default branch, so
// GitHub suggests it as the base of every new pull request; this check turns a work branch aimed
// at it red.
//
// It catches mistakes, not a hostile pull request: a pull_request run uses the pull request's own copy
// of this file. The real lock is the rulesets and who may merge (docs/OPERATIONS.md §2, rule 4).
//
// Dependency-free. The branch names come in through env, never through the command line, because
// whoever opens the pull request names the head branch:
// BASE_REF=<base> HEAD_REF=<head> HEAD_REPO=<owner/name> REPO=<owner/name> node .github/scripts/branch-flow.mjs
import { pathToFileURL } from 'node:url';

/**
 * The branches each protected branch takes, from this repository only.
 * @type {Map<string, { allowed: (head: string) => boolean, names: string }>}
 */
const RULES = new Map([
  [
    'release',
    {
      allowed: (head) => head === 'prerelease' || head.startsWith('hotfix/'),
      names: 'prerelease or hotfix/*',
    },
  ],
  [
    'prerelease',
    {
      allowed: (head) => !head.startsWith('hotfix/'),
      names: 'a work branch or release (back-merge)',
    },
  ],
]);

/**
 * Why the pull request breaks the branch flow, or undefined when it may go in.
 * @param {{ base: string, head: string, headRepo: string, repo: string }} pullRequest
 *   `headRepo` is the `owner/name` of the head branch's repository, empty when that fork was deleted.
 * @returns {string | undefined}
 */
export function branchFlowError({ base, head, headRepo, repo }) {
  const rule = RULES.get(base);
  if (rule === undefined) return undefined;
  if (!rule.allowed(head)) {
    return `Pull requests into ${base} come only from ${rule.names} (got '${head}').`;
  }
  // GitHub repository names ignore case; a fork always has another owner; a deleted fork has no name.
  if (headRepo === '' || headRepo.toLowerCase() !== repo.toLowerCase()) {
    const from = headRepo === '' ? 'a deleted fork' : headRepo;
    return `Pull requests into ${base} come only from branches of ${repo} (got '${head}' of ${from}).`;
  }
  return undefined;
}

/**
 * A workflow command message with `%`, CR and LF escaped, so a branch name cannot start a new command.
 * @param {string} message
 * @returns {string}
 */
export function escapeCommand(message) {
  return message.replaceAll('%', '%25').replaceAll('\r', '%0D').replaceAll('\n', '%0A');
}

function main() {
  const { BASE_REF = '', HEAD_REF = '', HEAD_REPO = '', REPO = '' } = process.env;
  if (BASE_REF === '' || HEAD_REF === '' || REPO === '') {
    console.error('::error::BASE_REF, HEAD_REF and REPO must be set.');
    process.exit(1);
  }
  const error = branchFlowError({
    base: BASE_REF,
    head: HEAD_REF,
    headRepo: HEAD_REPO,
    repo: REPO,
  });
  if (error !== undefined) {
    console.error(`::error::${escapeCommand(error)}`);
    process.exit(1);
  }
  console.log(escapeCommand(`Branch flow OK: '${HEAD_REF}' into '${BASE_REF}'.`));
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
