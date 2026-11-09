import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { branchFlowError, type PullRequest } from '../lib/branch-flow.ts';

const REPO = 'Nageshwar1997/Beautinique';
const FORK = 'someone-else/Beautinique';

/** A pull request from a branch of this repository, unless `headRepo` says otherwise. */
function pr(base: string, head: string, headRepo = REPO): PullRequest {
  return { base, head, headRepo, repo: REPO };
}

describe('branchFlowError', () => {
  it.each([
    ['main', 'release'],
    ['release', 'prerelease'],
    ['release', 'hotfix/otp-email'],
    ['prerelease', 'feat/qa-audit'],
    ['prerelease', 'release'],
    ['feat/a', 'feat/b'],
  ])('lets %s take %s from this repository', (base, head) => {
    expect(branchFlowError(pr(base, head))).toBeUndefined();
  });

  it.each([
    ['main', 'prerelease'],
    ['main', 'feat/x'],
    ['main', 'hotfix/x'],
    ['main', 'Release'],
    ['main', 'release-2'],
    ['release', 'main'],
    ['release', 'feat/x'],
    ['release', 'Prerelease'],
    ['release', 'hotfix'],
    ['release', 'x/hotfix/y'],
  ])('stops %s taking %s, even from this repository', (base, head) => {
    expect(branchFlowError(pr(base, head))).toBeDefined();
  });

  it.each([
    ['main', 'release'],
    ['release', 'prerelease'],
    ['release', 'hotfix/x'],
  ])('stops %s taking a fork’s %s', (base, head) => {
    expect(branchFlowError(pr(base, head, FORK))).toBeDefined();
  });

  it.each([
    ['main', 'release'],
    ['release', 'prerelease'],
  ])('stops %s taking %s from a fork that was deleted', (base, head) => {
    expect(branchFlowError(pr(base, head, ''))).toBeDefined();
  });

  it('stops a deleted fork even when the repository name is missing too', () => {
    expect(
      branchFlowError({ base: 'main', head: 'release', headRepo: '', repo: '' }),
    ).toBeDefined();
  });

  it.each(['constructor', 'toString', '__proto__', 'hasOwnProperty'])(
    'has no rule for a branch named %s',
    (base) => {
      expect(branchFlowError(pr(base, 'feat/x', FORK))).toBeUndefined();
    },
  );

  it('takes the repository name in any case (GitHub names ignore case)', () => {
    expect(branchFlowError(pr('main', 'release', REPO.toLowerCase()))).toBeUndefined();
    expect(branchFlowError(pr('release', 'hotfix/x', REPO.toUpperCase()))).toBeUndefined();
  });

  it('lets a fork’s branches into prerelease and other branches', () => {
    expect(branchFlowError(pr('prerelease', 'release', FORK))).toBeUndefined();
    expect(branchFlowError(pr('prerelease', 'feat/x', ''))).toBeUndefined();
    expect(branchFlowError(pr('feat/a', 'release', FORK))).toBeUndefined();
  });

  it('says where the pull request came from and where it should go', () => {
    expect(branchFlowError(pr('main', 'feat/x'))).toBe(
      "Pull requests into main come only from release (got 'feat/x'). Open it against prerelease.",
    );
    expect(branchFlowError(pr('release', 'feat/x'))).toBe(
      "Pull requests into release come only from prerelease or hotfix/* (got 'feat/x').",
    );
    expect(branchFlowError(pr('main', 'release', FORK))).toBe(
      `Pull requests into main come only from release of ${REPO} (got 'release' of ${FORK}). Open it against prerelease.`,
    );
    expect(branchFlowError(pr('release', 'prerelease', FORK))).toBe(
      `Pull requests into release come only from prerelease or hotfix/* of ${REPO} (got 'prerelease' of ${FORK}).`,
    );
    expect(branchFlowError(pr('main', 'release', ''))).toBe(
      `Pull requests into main come only from release of ${REPO} (got 'release' of a deleted fork). Open it against prerelease.`,
    );
  });
});

describe('the CI command', () => {
  const bin = join(import.meta.dirname, '../bin/branch-flow.ts');

  function run(base: string, head: string, headRepo: string) {
    return spawnSync(process.execPath, [bin], {
      encoding: 'utf8',
      env: { ...process.env, BASE_REF: base, HEAD_REF: head, HEAD_REPO: headRepo, REPO },
    });
  }

  it('passes a pull request that keeps the flow', () => {
    const result = run('main', 'release', REPO);
    expect(result.stdout).toBe(`Branch flow: ${REPO}:release into main is allowed.\n`);
    expect(result.status).toBe(0);
  });

  it('fails with a GitHub error line for one that breaks it', () => {
    const result = run('main', 'release', FORK);
    expect(result.stdout).toMatch(/^::error::Pull requests into main come only from release of /);
    expect(result.status).toBe(1);
  });
});

describe('ci.yml', () => {
  const workflow = readFileSync(
    join(import.meta.dirname, '../../../.github/workflows/ci.yml'),
    'utf8',
  );
  const start = workflow.indexOf('- name: Check the branch flow');
  const end = workflow.indexOf('\n      - ', start);
  const step = workflow.slice(start, end === -1 ? undefined : end);

  it('runs the check on every pull request, after Node 24 is set up', () => {
    const setupNode = workflow.indexOf('uses: actions/setup-node@');
    expect(setupNode).toBeGreaterThan(-1);
    expect(start).toBeGreaterThan(setupNode);
    expect(step).toContain("if: github.event_name == 'pull_request'");
    expect(step).toContain('run: node scripts/ci/bin/branch-flow.ts');
  });

  it('hands the check the head repository, through env only', () => {
    const env = (name: string, value: string) => `${name}: $` + `{{ ${value} }}`;
    expect(step).toContain(env('BASE_REF', 'github.base_ref'));
    expect(step).toContain(env('HEAD_REF', 'github.head_ref'));
    expect(step).toContain(env('HEAD_REPO', 'github.event.pull_request.head.repo.full_name'));
    expect(step).toContain(env('REPO', 'github.repository'));
    const command = step.slice(step.indexOf('run:'));
    expect(command).not.toContain('$' + '{{');
  });
});
