/**
 * The branch flow (RULES §2): work → prerelease → release → main. main takes only release (final code
 * after a successful release); release takes only prerelease or a hotfix/* branch, and both only from
 * this repository: a fork can name its branches release or hotfix/x too (QA-CI-001).
 *
 * It catches mistakes, not a hostile pull request: a pull_request workflow runs the pull request's own
 * copy of ci.yml and of this file. The lock is who may merge (RULES §2).
 */

/** A pull request as CI sees it (`.github/workflows/ci.yml`, step "Check the branch flow"). */
export interface PullRequest {
  /** The branch it goes into (`github.base_ref`). */
  base: string;
  /** The branch it comes from (`github.head_ref`), named by whoever opened it. */
  head: string;
  /** `owner/name` of the repository the head branch lives in; empty when that fork was deleted. */
  headRepo: string;
  /** `owner/name` of this repository (`github.repository`). */
  repo: string;
}

interface Sources {
  allowed: (head: string) => boolean;
  names: string;
  advice: string;
}

/** The branches each protected branch takes, from this repository only. */
const SOURCES = new Map<string, Sources>([
  [
    'main',
    {
      allowed: (head) => head === 'release',
      names: 'release',
      advice: ' Open it against prerelease.',
    },
  ],
  [
    'release',
    {
      allowed: (head) => head === 'prerelease' || head.startsWith('hotfix/'),
      names: 'prerelease or hotfix/*',
      advice: '',
    },
  ],
]);

/** Why the pull request breaks the branch flow, or undefined when it may go in. */
export function branchFlowError({ base, head, headRepo, repo }: PullRequest): string | undefined {
  const sources = SOURCES.get(base);
  if (sources === undefined) return undefined;
  const { names, advice } = sources;
  if (!sources.allowed(head)) {
    return `Pull requests into ${base} come only from ${names} (got '${head}').${advice}`;
  }
  // GitHub repository names ignore case; a fork always has another owner. A deleted fork has no name.
  if (headRepo === '' || headRepo.toLowerCase() !== repo.toLowerCase()) {
    const from = headRepo === '' ? 'a deleted fork' : headRepo;
    return `Pull requests into ${base} come only from ${names} of ${repo} (got '${head}' of ${from}).${advice}`;
  }
  return undefined;
}
