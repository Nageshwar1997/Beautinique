import assert from 'node:assert/strict';
import { join } from 'node:path';

import * as prettier from 'prettier';
import { describe, test } from 'vitest';

import { ROOT } from '../src/constants/paths.ts';
import {
  ALL_SUCCEEDED,
  checkJobProblems,
  readWorkflows,
  type Workflow,
  workflowProblems,
} from '../src/workflows.ts';

const PIN = '3d3c42e5aac5ba805825da76410c181273ba90b1';
const workflows = readWorkflows();
const ci = workflows.find(({ file }) => file === 'ci.yml')?.workflow ?? {};
const runs = (job: string) =>
  (ci.jobs?.[job]?.steps ?? []).map((step) => step.run ?? '').join('\n');

describe('every workflow (SR-082)', () => {
  test('AC-FOUNDATION-7: no rights by default, no pull_request_target, actions pinned to a SHA, a time limit per job', () => {
    assert.ok(workflows.length >= 2, 'ci.yml and wake.yml');
    assert.deepEqual(
      workflows.flatMap(({ file, workflow }) => workflowProblems(file, workflow)),
      [],
    );
  });

  test('AC-FOUNDATION-7: a tag-pinned action, missing default rights, pull_request_target and a job without a limit are caught', () => {
    const bad: Workflow = {
      on: { pull_request_target: {}, push: {} },
      permissions: { contents: 'write' },
      jobs: {
        build: {
          'timeout-minutes': 10,
          steps: [
            { uses: 'actions/checkout@v7' },
            { uses: `actions/setup-node@${PIN}` },
            { uses: './.github/actions/local' },
            { run: 'npm test' },
          ],
        },
        deploy: { steps: [{ uses: `owner/action/sub@${PIN.slice(0, 7)}` }] },
      },
    };
    assert.deepEqual(workflowProblems('bad.yml', bad), [
      'bad.yml: the workflow must start from no rights (permissions: {})',
      'bad.yml: pull_request_target is not allowed',
      'bad.yml: job build uses actions/checkout@v7, which is not pinned to a commit SHA',
      'bad.yml: job deploy needs timeout-minutes',
      `bad.yml: job deploy uses owner/action/sub@${PIN.slice(0, 7)}, which is not pinned to a commit SHA`,
    ]);
    assert.deepEqual(
      workflowProblems('list.yml', { on: ['pull_request_target'], permissions: {} }),
      ['list.yml: pull_request_target is not allowed'],
    );
  });
});

describe('ci.yml', () => {
  test('AC-FOUNDATION-4: the jobs run side by side and only check joins them, red if any one is not green', () => {
    assert.deepEqual(checkJobProblems(ci), []);
    assert.deepEqual(Object.keys(ci.jobs ?? {}).sort(), ['check', 'guard', 'static', 'test']);
  });

  test('AC-FOUNDATION-4: a job that waits, a job check forgets, a renamed check and a check that skips are caught', () => {
    const steps = [{ run: `echo "$NEEDS" | jq -e '${ALL_SUCCEEDED}'` }];
    assert.deepEqual(
      checkJobProblems({
        jobs: {
          guard: {},
          static: { needs: 'guard' },
          test: {},
          check: { name: 'All checks', needs: ['guard', 'static'], steps },
        },
      }),
      [
        'job static waits for another job (needs)',
        'check must need every other job: guard, static, test',
        'check must keep its plain name (no display name)',
        'check must run even when a job failed (if: ${{ !cancelled() }})',
      ],
    );
    assert.deepEqual(
      checkJobProblems({
        jobs: { guard: {}, check: { needs: 'guard', if: '${{ !cancelled() }}' } },
      }),
      [`check must fail unless every job succeeded (${ALL_SUCCEEDED})`],
    );
    assert.deepEqual(checkJobProblems({ jobs: { guard: {} } }), ['there is no check job']);
  });

  test('pushes to the long-lived branches and every pull request run CI (rule 11)', () => {
    assert.deepEqual(ci.on, { push: { branches: ['prerelease', 'release'] }, pull_request: null });
  });

  test('AC-FOUNDATION-5: guard tests the secret scan, scans the whole history with redaction, checks the branch flow and audits', () => {
    const guard = ci.jobs?.guard;
    const checkout = guard?.steps?.[0] as { with?: { 'fetch-depth'?: number } } | undefined;
    assert.equal(checkout?.with?.['fetch-depth'], 0, 'the scan needs the whole history');
    const commands = runs('guard');
    assert.match(commands, /node --test \.github\/scripts\/secret-scan\.test\.mjs/);
    assert.match(
      commands,
      /gitleaks" git --config \.gitleaks\.toml --log-opts="--full-history HEAD" --redact .*--exit-code 1/,
    );
    assert.match(commands, /node --test \.github\/scripts\/branch-flow\.test\.mjs/);
    assert.match(commands, /node \.github\/scripts\/branch-flow\.mjs/);
    assert.match(commands, /npm audit --audit-level=high --package-lock-only/);
    // The tests of a check run before the check itself.
    assert.ok(commands.indexOf('secret-scan.test.mjs') < commands.indexOf('--full-history'));
  });

  test('AC-FOUNDATION-6: static runs Prettier (with the lines of a mistake), ESLint, typecheck, build and the docs links', () => {
    const commands = runs('static');
    for (const command of [
      'npm run format:check',
      'git --no-pager diff',
      'npm run lint',
      'npm run typecheck',
      'npm run build',
      'npm run docs:check',
    ]) {
      assert.ok(commands.includes(command), command);
    }
  });

  test('AC-FOUNDATION-6: the repository Prettier config fails a badly formatted file', async () => {
    const filepath = join(ROOT, 'scripts', 'foundation', 'src', 'example.ts');
    const options = { ...(await prettier.resolveConfig(filepath)), filepath };
    assert.equal(options.printWidth, 100);
    assert.equal(options.endOfLine, 'lf');
    assert.equal(await prettier.check("export const a = 'one';\n", options), true);
    assert.equal(await prettier.check('export const a = "one"\n', options), false);
  });

  test('test makes .env.test from .env.example, starts the containers, then runs every test', () => {
    const commands = runs('test');
    const order = [
      'node scripts/foundation/bin/env-files.ts test',
      'npm run infra:up -- backend',
      'npm test',
    ].map((command) => commands.indexOf(command));
    assert.ok(
      order.every((at) => at >= 0),
      commands,
    );
    assert.deepEqual(
      [...order].sort((a, b) => a - b),
      order,
    );
  });
});
