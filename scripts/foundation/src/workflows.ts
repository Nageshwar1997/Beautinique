// The guards on GitHub Actions workflows (docs/OPERATIONS.md §2 rules 1, 2 and 7; SR-082).
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { parse } from 'yaml';

import { ROOT } from './constants/paths.ts';

export const WORKFLOWS_DIR = join(ROOT, '.github', 'workflows');

// The fields of a workflow file that the guards read.
export interface Workflow {
  on?: unknown;
  permissions?: unknown;
  jobs?: Record<
    string,
    {
      name?: string;
      needs?: string | string[];
      if?: string;
      uses?: string;
      'timeout-minutes'?: unknown;
      steps?: { uses?: string; run?: string }[];
    }
  >;
}

// owner/repo[/path]@<full commit SHA>; a tag or branch can be moved under us, a SHA cannot.
const PINNED_ACTION = /^[\w.-]+\/[\w.-]+(?:\/[\w./-]+)?@[0-9a-f]{40}$/;

export function readWorkflows(dir: string = WORKFLOWS_DIR): { file: string; workflow: Workflow }[] {
  return readdirSync(dir)
    .filter((file) => /\.ya?ml$/.test(file))
    .sort()
    .map((file) => ({ file, workflow: parse(readFileSync(join(dir, file), 'utf8')) as Workflow }));
}

function triggers(on: unknown): string[] {
  if (typeof on === 'string') return [on];
  if (Array.isArray(on)) return on.map(String);
  if (on && typeof on === 'object') return Object.keys(on);
  return [];
}

function isEmptyObject(value: unknown): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).length === 0
  );
}

// Every workflow: no rights by default, no pull_request_target (it runs a fork's pull request with
// the repository's secrets), every action pinned to a commit SHA, every job with a time limit.
export function workflowProblems(file: string, workflow: Workflow): string[] {
  const problems: string[] = [];
  if (!isEmptyObject(workflow.permissions)) {
    problems.push(`${file}: the workflow must start from no rights (permissions: {})`);
  }
  if (triggers(workflow.on).includes('pull_request_target')) {
    problems.push(`${file}: pull_request_target is not allowed`);
  }
  for (const [id, job] of Object.entries(workflow.jobs ?? {})) {
    if (typeof job['timeout-minutes'] !== 'number' && !job.uses) {
      problems.push(`${file}: job ${id} needs timeout-minutes`);
    }
    const uses = [job.uses, ...(job.steps ?? []).map((step) => step.uses)].filter(
      (value): value is string => typeof value === 'string' && !value.startsWith('./'),
    );
    for (const action of uses) {
      if (!PINNED_ACTION.test(action)) {
        problems.push(`${file}: job ${id} uses ${action}, which is not pinned to a commit SHA`);
      }
    }
  }
  return problems;
}

// CI's `check` (rules 1 and 2): the one check the rulesets and deploys wait for. Every other job runs
// side by side (no `needs`), and `check` needs all of them, runs unless the run was cancelled, keeps
// its plain name, and passes only when every one of them succeeded.
export const CHECK_JOB = 'check';
export const ALL_SUCCEEDED = 'all(.[]; .result == "success")';

export function checkJobProblems(workflow: Workflow): string[] {
  const jobs = workflow.jobs ?? {};
  const check = jobs[CHECK_JOB];
  if (!check) return [`there is no ${CHECK_JOB} job`];

  const problems: string[] = [];
  const others = Object.keys(jobs)
    .filter((id) => id !== CHECK_JOB)
    .sort();
  for (const id of others) {
    if (jobs[id]?.needs !== undefined) problems.push(`job ${id} waits for another job (needs)`);
  }
  const needs = [check.needs ?? []].flat().sort();
  if (needs.join(',') !== others.join(',')) {
    problems.push(`${CHECK_JOB} must need every other job: ${others.join(', ')}`);
  }
  if (check.name !== undefined) {
    problems.push(`${CHECK_JOB} must keep its plain name (no display name)`);
  }
  if (!check.if?.includes('!cancelled()')) {
    problems.push(`${CHECK_JOB} must run even when a job failed (if: \${{ !cancelled() }})`);
  }
  if (!(check.steps ?? []).some((step) => step.run?.includes(ALL_SUCCEEDED))) {
    problems.push(`${CHECK_JOB} must fail unless every job succeeded (${ALL_SUCCEEDED})`);
  }
  return problems;
}
