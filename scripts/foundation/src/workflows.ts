// The guards on GitHub Actions workflows (docs/OPERATIONS.md §2 rules 1, 2 and 7; SR-082).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
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
      permissions?: unknown;
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

// Triggers that run with the repository's secrets and write rights on behalf of a fork's pull
// request: pull_request_target runs on the pull request itself, workflow_run after a workflow it ran.
const FORK_TRIGGERS = ['pull_request_target', 'workflow_run'];

// Every workflow: no rights by default, no trigger that hands a fork the repository's secrets, every
// job naming the rights it needs (never write-all or read-all), every action pinned to a commit
// SHA, every job with a time limit.
export function workflowProblems(file: string, workflow: Workflow): string[] {
  const problems: string[] = [];
  if (!isEmptyObject(workflow.permissions)) {
    problems.push(`${file}: the workflow must start from no rights (permissions: {})`);
  }
  for (const trigger of FORK_TRIGGERS) {
    if (triggers(workflow.on).includes(trigger)) {
      problems.push(`${file}: ${trigger} is not allowed`);
    }
  }
  for (const [id, job] of Object.entries(workflow.jobs ?? {})) {
    if (typeof job.permissions === 'string') {
      problems.push(
        `${file}: job ${id} must name its rights one by one, not permissions: ${job.permissions}`,
      );
    }
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

// The repository's own composite actions (`uses: ./.github/actions/<name>` in a workflow): the
// workflow guard does not look inside them, so the actions they use are checked here.
export const ACTIONS_DIR = join(ROOT, '.github', 'actions');

export function localActionProblems(dir: string = ACTIONS_DIR): string[] {
  if (!existsSync(dir)) return [];
  const problems: string[] = [];
  for (const name of readdirSync(dir).sort()) {
    const file = ['action.yml', 'action.yaml']
      .map((candidate) => join(dir, name, candidate))
      .find((candidate) => existsSync(candidate));
    if (!file) continue;
    const action = parse(readFileSync(file, 'utf8')) as {
      runs?: { steps?: { uses?: string }[] };
    };
    for (const step of action.runs?.steps ?? []) {
      const uses = step.uses;
      if (typeof uses === 'string' && !uses.startsWith('./') && !PINNED_ACTION.test(uses)) {
        problems.push(`actions/${name}: uses ${uses}, which is not pinned to a commit SHA`);
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
