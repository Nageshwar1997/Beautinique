// The shape of .github/workflows/ci.yml that the parallel jobs rely on (RULES §2 "CI"): every job but
// guard and check asks scripts/ci/bin/plan.ts first and guards every later step with its answer, only
// check waits for others (Render deploys once every check it sees passed), check waits for all of
// them, and every app with an e2e script has its E2E job.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { JOBS } from '../lib/plan.ts';

const root = join(import.meta.dirname, '../../..');
const workflow = readFileSync(join(root, '.github/workflows/ci.yml'), 'utf8');

/** The jobs: id → its lines (from the `  id:` line to the next one). */
const jobs = new Map<string, string[]>();
{
  const lines = workflow.slice(workflow.indexOf('\njobs:\n')).split('\n').slice(2);
  let current: string[] | undefined;
  for (const line of lines) {
    const id = /^ {2}([\w-]+):$/.exec(line)?.[1];
    if (id !== undefined) {
      current = [];
      jobs.set(id, current);
    } else if (/^\S/.test(line)) {
      break;
    } else {
      current?.push(line);
    }
  }
}

/** A job's steps, each as its lines. */
const stepsOf = (id: string) => {
  const steps: string[][] = [];
  for (const line of jobs.get(id) ?? []) {
    if (/^ {6}- /.test(line)) steps.push([line]);
    else if (/^ {8}/.test(line)) steps.at(-1)?.push(line);
  }
  return steps;
};

const planned = [...jobs.keys()].filter((id) => id !== 'guard' && id !== 'check');

describe('ci.yml', () => {
  it('has guard, check and one job for each plan.ts job', () => {
    expect([...jobs.keys()].sort()).toEqual(['check', 'guard', ...JOBS].sort());
  });

  it.each(planned)('%s: checks out, sets up Node, then asks plan.ts for itself', (id) => {
    const steps = stepsOf(id).map((step) => step.join('\n'));
    expect(steps[0]).toMatch(/uses: actions\/checkout@/);
    expect(steps[0]).toMatch(/fetch-depth: 2/);
    expect(steps[1]).toMatch(/uses: actions\/setup-node@/);
    expect(steps[2]).toMatch(/id: plan/);
    expect(steps[2]).toContain(`run: node scripts/ci/bin/plan.ts --job ${id}`);
    for (const key of ['GH_TOKEN', 'EVENT_NAME', 'BASE_REF', 'REPO']) {
      expect(steps[2]).toContain(`${key}: `);
    }
  });

  it.each(planned)('%s: every step after the plan runs only when the plan says so', (id) => {
    for (const step of stepsOf(id).slice(3)) {
      const condition = step.find((line) => /^ {6}- if: | {8}if: /.test(line)) ?? '';
      expect(condition, step.join('\n')).toMatch(/steps\.plan\.outputs\.(?:run|code) == 'true'/);
    }
  });

  it('only check waits for other jobs, and it waits for all of them', () => {
    for (const [id, lines] of jobs) {
      if (id !== 'check') expect(lines.join('\n'), id).not.toMatch(/^\s+needs:/m);
    }
    const needs = /^\s+needs: \[(.+)\]$/m.exec((jobs.get('check') ?? []).join('\n'))?.[1];
    expect(
      needs
        ?.split(',')
        .map((need) => need.trim())
        .sort(),
    ).toEqual([...jobs.keys()].filter((id) => id !== 'check').sort());
  });

  it('check runs unless the run is cancelled, and keeps the marker only after a full pass', () => {
    const check = (jobs.get('check') ?? []).join('\n');
    expect(check).toMatch(/if: \$\{\{ !cancelled\(\) \}\}/);
    expect(check).toMatch(/jq -e 'all\(\.\[\]; \.result == "success"\)'/);
    expect(check).toMatch(/if: needs\.static\.outputs\.upload == 'true'/);
    expect(check).toMatch(/name: ci-pass-\$\{\{ needs\.static\.outputs\.tree \}\}/);
  });

  it('has an E2E job for every app with an e2e script, and no other', () => {
    const frontend = join(root, 'frontend');
    const apps = readdirSync(frontend, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .filter((app) => {
        try {
          const manifest = JSON.parse(
            readFileSync(join(frontend, app, 'package.json'), 'utf8'),
          ) as { scripts?: Record<string, string> };
          return manifest.scripts?.e2e !== undefined;
        } catch {
          return false;
        }
      });
    const matrix = /^\s+app: \[(.+)\]$/m.exec((jobs.get('e2e') ?? []).join('\n'))?.[1];
    expect(
      matrix
        ?.split(',')
        .map((app) => app.trim())
        .sort(),
    ).toEqual(apps.sort());
  });
});
