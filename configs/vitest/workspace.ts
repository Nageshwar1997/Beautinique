// The shared Vitest config of a workspace: `export default workspaceTestConfig({ ... })` in its
// vitest.config.ts. Two projects split the tests by what they need:
// - unit: `*.test.ts` in src/ or test/, no containers;
// - integration: `*.int.test.ts`, against the real containers (`npm run infra:up`).
// Fixtures under a `fixtures/` folder are test data and never run on their own.
import { globSync } from 'node:fs';

import { configDefaults, defineConfig } from 'vitest/config';

import { type CoverageOptions, coverageThresholds } from './coverage.ts';

const FIXTURES = '**/fixtures/**';
const INTEGRATION = '**/*.int.test.{ts,tsx}';
// backups/ holds the live databases' backups (D-013): no test ever reads it.
const NEVER = [...configDefaults.exclude, FIXTURES, '**/backups/**'];

// Vitest quietly skips a threshold whose glob matches no file, so a mistyped glob of money, stock
// or permissions code would switch its limit off: the globs that match no file under `root`.
export function unmatchedCriticalGlobs(globs: string[], root: string = process.cwd()): string[] {
  return globs.filter(
    (glob) => !globSync(glob, { cwd: root, withFileTypes: true }).some((entry) => entry.isFile()),
  );
}

export function workspaceTestConfig(options: CoverageOptions = {}) {
  const root = options.root ?? process.cwd();
  const unmatched = unmatchedCriticalGlobs(options.critical ?? [], root);
  if (unmatched.length > 0) {
    throw new Error(
      `Coverage: the critical glob(s) ${unmatched.join(', ')} match no file under ${root}. Fix the glob, or its 85% branch limit would not apply (RULES RT-23).`,
    );
  }
  return defineConfig({
    test: {
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['**/*.test.{ts,tsx}', FIXTURES],
        reporter: ['text-summary', 'json-summary'],
        thresholds: coverageThresholds(options),
      },
      projects: [
        {
          extends: true,
          test: {
            name: 'unit',
            include: ['{src,test}/**/*.test.{ts,tsx}'],
            exclude: [...NEVER, INTEGRATION],
          },
        },
        {
          extends: true,
          test: {
            name: 'integration',
            include: [INTEGRATION],
            exclude: NEVER,
            // Containers answer slower than memory; a test still fails on a real hang.
            testTimeout: 30_000,
            hookTimeout: 60_000,
          },
        },
      ],
    },
  });
}
