// @ts-check
// Root lint: the release tooling (scripts/) and shared configs. Every workspace lints itself.
import { defineConfig } from 'eslint/config';

import { packageConfig } from './configs/eslint-config.js';

export default defineConfig(
  { ignores: ['packages/**', 'frontend/**', 'backend/**', 'docs/**'] },
  packageConfig({ platform: 'node', tsconfigRootDir: import.meta.dirname }),
  {
    // The CLI and the release scripts print to the terminal on purpose.
    files: ['scripts/**/*.ts', '.github/scripts/**/*.mjs'],
    rules: { 'no-console': 'off' },
  },
);
