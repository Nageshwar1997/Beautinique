// Tests of the branch flow check: node --test .github/scripts/branch-flow.test.mjs
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, it } from 'node:test';

import { branchFlowError, escapeCommand } from './branch-flow.mjs';

const REPO = 'owner/repo';
const own = (base, head) => ({ base, head, headRepo: REPO, repo: REPO });

describe('branchFlowError', () => {
  it('lets release (the default branch) take only prerelease or hotfix/*', () => {
    assert.equal(branchFlowError(own('release', 'prerelease')), undefined);
    assert.equal(branchFlowError(own('release', 'hotfix/login-crash')), undefined);
    for (const head of ['feat/x', 'fix/y', 'docs/z', 'hotfix', 'dependabot/github_actions/x']) {
      assert.match(branchFlowError(own('release', head)), /into release come only from/);
    }
  });

  it('lets prerelease take work branches and the release back-merge', () => {
    for (const head of ['feat/x', 'fix/y', 'docs/z', 'dependabot/github_actions/x', 'release']) {
      assert.equal(branchFlowError(own('prerelease', head)), undefined, head);
    }
  });

  it('keeps hotfix/* out of prerelease', () => {
    assert.match(branchFlowError(own('prerelease', 'hotfix/x')), /into prerelease come only from/);
  });

  it('rejects a fork, even with an allowed branch name', () => {
    for (const [base, head] of [
      ['release', 'prerelease'],
      ['release', 'hotfix/x'],
      ['prerelease', 'feat/x'],
    ]) {
      const error = branchFlowError({ base, head, headRepo: 'someone/repo', repo: REPO });
      assert.match(error, /of someone\/repo\)/);
    }
  });

  it('rejects a deleted fork', () => {
    const error = branchFlowError({ base: 'prerelease', head: 'feat/x', headRepo: '', repo: REPO });
    assert.match(error, /of a deleted fork\)/);
  });

  it('ignores case in repository names', () => {
    const pr = { base: 'release', head: 'prerelease', headRepo: 'Owner/Repo', repo: REPO };
    assert.equal(branchFlowError(pr), undefined);
  });

  it('does not check pull requests into other branches', () => {
    const pr = { base: 'feat/x', head: 'hotfix/y', headRepo: 'someone/repo', repo: REPO };
    assert.equal(branchFlowError(pr), undefined);
  });
});

describe('escapeCommand', () => {
  it('escapes %, CR and LF', () => {
    assert.equal(escapeCommand('a%b\r\n::error::c'), 'a%25b%0D%0A::error::c');
  });
});

describe('the command line', () => {
  const script = fileURLToPath(new URL('./branch-flow.mjs', import.meta.url));
  const run = (env) =>
    spawnSync(process.execPath, [script], {
      env: { ...env, PATH: process.env.PATH },
      encoding: 'utf8',
    });

  it('exits 0 for an allowed pull request', () => {
    const result = run({ BASE_REF: 'prerelease', HEAD_REF: 'feat/x', HEAD_REPO: REPO, REPO });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Branch flow OK/);
  });

  it('exits 1 with an error annotation for a wrong pair', () => {
    const result = run({ BASE_REF: 'release', HEAD_REF: 'feat/x', HEAD_REPO: REPO, REPO });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /^::error::Pull requests into release come only from prerelease/);
  });

  it('exits 1 when the names are missing', () => {
    const result = run({});
    assert.equal(result.status, 1);
    assert.match(result.stderr, /must be set/);
  });
});
