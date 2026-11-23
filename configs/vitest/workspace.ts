// The shared Vitest config of a workspace: `export default workspaceTestConfig({ ... })` in its
// vitest.config.ts. Two projects split the tests by what they need:
// - unit: `*.test.ts` in src/ or test/, no containers;
// - integration: `*.int.test.ts`, against the real containers (`npm run infra:up`).
// Fixtures under a `fixtures/` folder are test data and never run on their own.
import { configDefaults, defineConfig } from 'vitest/config';

import { type CoverageOptions, coverageThresholds } from './coverage.ts';

const FIXTURES = '**/fixtures/**';
const INTEGRATION = '**/*.int.test.{ts,tsx}';
const NEVER = [...configDefaults.exclude, FIXTURES];

export function workspaceTestConfig(options: CoverageOptions = {}) {
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
