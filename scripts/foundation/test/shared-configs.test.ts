import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ESLint } from 'eslint';
import { afterAll, describe, test } from 'vitest';

import { COVERAGE_LIMITS, coverageThresholds } from '../../../configs/vitest/coverage.ts';
import { ROOT } from '../src/constants/paths.ts';
import { cleanEnv } from './utils/env.ts';

const FIXTURES = fileURLToPath(new URL('./fixtures/', import.meta.url));
const TSC = join(ROOT, 'node_modules', 'typescript', 'bin', 'tsc');
const VITEST = join(ROOT, 'node_modules', 'vitest', 'vitest.mjs');

function run(args: string[], cwd: string) {
  const result = spawnSync(process.execPath, args, { cwd, encoding: 'utf8', env: cleanEnv() });
  return { status: result.status, output: `${result.stdout}${result.stderr}` };
}

describe('ESLint (configs/eslint/base.js)', () => {
  test('AC-FOUNDATION-6: an `any` and a floating promise fail lint with file, line and rule', async () => {
    // Fixtures are ignored by the repository's lint; `ignore: false` lints the wrong example anyway.
    const eslint = new ESLint({ cwd: ROOT, ignore: false });
    const [result] = await eslint.lintFiles([join(FIXTURES, 'lint', 'bad.ts')]);
    assert.ok(result, 'ESLint returned no result for the fixture');
    assert.match(result.filePath, /bad\.ts$/);

    const found = result.messages.map((m) => `${String(m.line)}:${m.ruleId ?? 'parse error'}`);
    assert.ok(found.includes('2:@typescript-eslint/no-explicit-any'), found.join(', '));
    // Only a type-aware rule sees this one: the config really reads the types.
    assert.ok(found.includes('11:@typescript-eslint/no-floating-promises'), found.join(', '));
    // Type-aware lint builds a TypeScript program first: seconds, not a unit test's 5 s budget.
  }, 60_000);
});

// Each test runs tsc: seconds when the whole suite runs, not a unit test's 5 s budget.
describe('TypeScript (configs/typescript)', { timeout: 60_000 }, () => {
  test('AC-FOUNDATION-6: a type error fails typecheck with file, line and column', () => {
    const { status, output } = run(
      [TSC, '-p', join(FIXTURES, 'typecheck'), '--pretty', 'false'],
      ROOT,
    );
    assert.notEqual(status, 0, output);
    assert.match(output, /bad\.ts\(1,14\): error TS2322/);
    // noUncheckedIndexedAccess: an array element may be missing.
    assert.match(output, /bad\.ts\(4,14\): error TS2322/);
  });

  test('the React base knows the browser, the Node base does not', () => {
    const react = run([TSC, '-p', join(FIXTURES, 'dom', 'tsconfig.react.json')], ROOT);
    assert.equal(react.status, 0, react.output);

    const node = run(
      [TSC, '-p', join(FIXTURES, 'dom', 'tsconfig.node.json'), '--pretty', 'false'],
      ROOT,
    );
    assert.notEqual(node.status, 0, node.output);
    assert.match(node.output, /page\.ts\(1,30\): error TS2584/);
  });
});

describe('coverage limits by area (configs/vitest)', () => {
  const gate = join(FIXTURES, 'coverage-gate');
  afterAll(() => {
    rmSync(join(gate, 'coverage'), { recursive: true, force: true });
  });

  test('RT-23: the limits are the ones RULES names', () => {
    assert.deepEqual(COVERAGE_LIMITS, {
      kernel: { branches: 90 },
      critical: { branches: 85 },
      standard: { lines: 70 },
    });
    assert.deepEqual(coverageThresholds({ area: 'kernel' }), { branches: 90 });
    assert.deepEqual(coverageThresholds({ critical: ['src/money/**'] }), {
      'src/money/**': { branches: 85 },
    });
    assert.deepEqual(coverageThresholds({}), {});
  });

  // The fixture's test covers one branch of three.
  const coverageRun = (area: string) =>
    run([VITEST, 'run', '--config', `vitest.${area}.config.ts`, '--coverage'], gate);

  test('RT-23: a kernel package below 90% branch coverage fails the run', () => {
    const { status, output } = coverageRun('kernel');
    assert.equal(status, 1, output);
    assert.match(output, /Coverage for branches \(\d+%\) does not meet global threshold \(90%\)/);
  }, 60_000);

  test('RT-23: money, stock and permissions code below 85% fails the run', () => {
    const { status, output } = coverageRun('critical');
    assert.equal(status, 1, output);
    assert.match(output, /does not meet "src\/sign\.ts" threshold \(85%\)/);
  }, 60_000);

  test('RT-23: the rest only reports its coverage', () => {
    const { status, output } = coverageRun('standard');
    assert.equal(status, 0, output);
    assert.match(output, /Coverage summary/);
  }, 60_000);
});
