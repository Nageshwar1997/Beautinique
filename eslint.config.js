// @ts-check
// Root lint: the release tooling (scripts/) and shared configs. Every workspace lints itself, and
// Claude Code's worktrees (.claude/worktrees: other checkouts of this repo) are not ours to lint
// here (QA-TOOL-001). The CI tests' lint fixtures break rules on purpose; their tests lint them.
import { defineConfig } from 'eslint/config';

import { packageConfig } from './configs/eslint-config.js';

export default defineConfig(
  {
    ignores: [
      'packages/**',
      'frontend/**',
      'backend/**',
      'docs/**',
      '.claude/worktrees/**',
      'scripts/ci/test/fixtures/**',
    ],
  },
  packageConfig({ platform: 'node', tsconfigRootDir: import.meta.dirname }),
  {
    // The CLI and the release scripts print to the terminal on purpose.
    files: ['scripts/**/*.ts', '.github/scripts/**/*.mjs'],
    rules: { 'no-console': 'off' },
  },
);
