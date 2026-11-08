import { branchFlowError } from '../lib/branch-flow.ts';

// CI (.github/workflows/ci.yml) passes the names through env, never into the command: a branch name
// is chosen by whoever opens the pull request.
const env = process.env;
const pr = {
  base: env.BASE_REF ?? '',
  head: env.HEAD_REF ?? '',
  headRepo: env.HEAD_REPO ?? '',
  repo: env.REPO ?? '',
};
const error = branchFlowError(pr);
if (error === undefined) {
  console.log(`Branch flow: ${pr.headRepo}:${pr.head} into ${pr.base} is allowed.`);
} else {
  console.log(`::error::${error}`);
  process.exitCode = 1;
}
