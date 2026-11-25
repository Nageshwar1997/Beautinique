import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

import { ARTIFACT_DIR, TAGS_FILE } from '../src/publish.ts';

const ROOT = join(import.meta.dirname, '../../..');
const text = readFileSync(join(ROOT, '.github/workflows/publish.yml'), 'utf8');

interface Step {
  if?: string;
  uses?: string;
  run?: string;
  env?: Record<string, string>;
  with?: Record<string, unknown>;
}
interface Job {
  if?: string;
  needs?: string | string[];
  permissions?: Record<string, string>;
  steps: Step[];
}
const workflow = parse(text) as { on: unknown; permissions: unknown; jobs: Record<string, Job> };
const jobs = workflow.jobs;
const job = (id: string): Job => {
  const found = jobs[id];
  if (!found) throw new Error(`no job ${id}`);
  return found;
};

describe('the publish workflow', () => {
  it('AC-PACKAGES-9: starts by hand only, and no job runs outside the release branch', () => {
    expect(workflow.on).toEqual({ workflow_dispatch: null });
    expect(job('pack').if).toBe("github.ref == 'refs/heads/release'");
    expect(job('publish').if).toBe("github.ref == 'refs/heads/release'");
    expect(job('tag').if).toContain("github.ref == 'refs/heads/release'");
  });

  it('has three jobs, each with only the rights it needs', () => {
    expect(Object.keys(jobs)).toEqual(['pack', 'publish', 'tag']);
    expect(workflow.permissions).toEqual({});
    expect(job('pack').permissions).toEqual({ contents: 'read' });
    expect(job('publish').permissions).toEqual({ 'id-token': 'write' });
    expect(job('tag').permissions).toEqual({ contents: 'write' });
  });

  it('packs with verify and the --ci mode, and hands over only the artifact folder', () => {
    const steps = job('pack').steps;
    expect(steps.some((step) => step.run === 'npm ci --ignore-scripts')).toBe(true);
    expect(steps.some((step) => step.run === 'npm run packages:publish -- --ci')).toBe(true);
    const upload = steps.find((step) => step.uses?.startsWith('actions/upload-artifact'));
    expect(upload?.with?.path).toBe(ARTIFACT_DIR);
  });

  it('publishes only the downloaded tarballs, with provenance, and has no checkout', () => {
    const steps = job('publish').steps;
    expect(steps.some((step) => step.uses?.startsWith('actions/checkout'))).toBe(false);
    expect(steps.some((step) => step.uses?.startsWith('actions/download-artifact'))).toBe(true);
    const publish = steps.find((step) => step.run?.includes('npm publish'));
    expect(publish?.run).toContain('--provenance');
    expect(publish?.run).toContain('publish-artifact/$tarball');
    expect(publish?.run).not.toContain('npm run');
  });

  it('keeps the same Node version as the root package.json', () => {
    const root = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as {
      engines: { node: string };
    };
    const setup = job('publish').steps.find((step) => step.uses?.startsWith('actions/setup-node'));
    expect(String(setup?.with?.['node-version'])).toBe(root.engines.node);
  });

  it('AC-PACKAGES-10: tags what is on npm, also after a publish that failed midway (QA-PKG-001)', () => {
    const tag = job('tag');
    expect(tag.needs).toEqual(['pack', 'publish']);
    // Runs after a failed publish job, never after a cancelled run or a failed pack.
    expect(tag.if).toContain('!cancelled()');
    expect(tag.if).toContain("needs.pack.result == 'success'");
    expect(tag.if).not.toContain('always()');
    const run = tag.steps.find((step) => step.run?.includes('git tag'))?.run ?? '';
    expect(run).toContain(`publish-artifact/${TAGS_FILE}`);
    expect(run).toContain('git ls-remote --exit-code --tags origin');
    expect(run).toContain('npm view "$name@$version" version');
    expect(run.indexOf('npm view')).toBeLessThan(run.indexOf('git tag "$tag"'));
    // A version npm already had is reported, never tagged at this commit (code review, 2026-11-25).
    expect(run).toContain("jq -r '.thisRun'");
    expect(run.indexOf('.thisRun')).toBeLessThan(run.indexOf('npm view'));
    // The summary lists what was tagged even when the tag step failed midway.
    const summary = tag.steps.find((step) => step.run?.includes('GITHUB_STEP_SUMMARY'));
    expect(summary?.if).toContain('!cancelled()');
  });

  it('AC-PACKAGES-9: no npm token exists anywhere', () => {
    expect(text).not.toMatch(/NODE_AUTH_TOKEN|NPM_TOKEN|secrets\./);
  });

  it('sends the branch name and the back-merge reminder to the job summary', () => {
    const summary = job('tag').steps.find((step) => step.run?.includes('GITHUB_STEP_SUMMARY'));
    expect(summary?.env?.BRANCH).toBe('${{ github.ref_name }}');
    expect(summary?.run).toContain('back-merges');
  });
});
