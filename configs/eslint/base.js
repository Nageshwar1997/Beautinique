// @ts-check
// The shared ESLint flat config. A workspace uses it as is through the root eslint.config.js (ESLint
// looks for the config from each file's folder upwards), or adds its own rules in its own
// eslint.config.js with `defineConfig(base, { ... })`. Formatting is Prettier's job, so the rules
// that would fight it are switched off last.
import { resolve } from 'node:path';

import js from '@eslint/js';
import prettier from 'eslint-config-prettier/flat';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const ROOT = resolve(import.meta.dirname, '../..');

const SOURCE_FILES = '*.{js,mjs,cjs,ts,mts,cts,tsx}';
const CLOCK_MESSAGE =
  'Take "now" from the injected Clock (@beautinique/shared-clock), not from the real clock (RULES RT-13).';

export default defineConfig(
  {
    name: 'beautinique/ignores',
    // backups/ holds the live databases' backups (D-013): never linted or read.
    ignores: ['**/dist/', '**/build/', '**/coverage/', '**/.turbo/', '**/fixtures/', 'backups/'],
  },
  {
    name: 'beautinique/javascript',
    files: ['**/*.{js,mjs,cjs,ts,mts,cts,tsx}'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
  },
  {
    // Type-aware rules: floating promises, unsafe `any` and wrong awaits are bugs a type check alone
    // lets through. Every TypeScript file belongs to the tsconfig.json nearest to it.
    name: 'beautinique/typescript',
    files: ['**/*.{ts,mts,cts,tsx}'],
    extends: [tseslint.configs.strictTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: ROOT,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-import-type-side-effects': 'error',
    },
  },
  {
    // RT-13 (D-470): the source of packages, services and apps takes "now" only from the injected
    // clock, so every time rule can be tested at any moment. The clock package itself, tests and the
    // repository's tools (scripts/, never matched here) read the real clock.
    name: 'beautinique/injected-clock',
    files: [
      `packages/*/*/src/**/${SOURCE_FILES}`,
      `backend/*/src/**/${SOURCE_FILES}`,
      `frontend/*/src/**/${SOURCE_FILES}`,
    ],
    ignores: [
      'packages/shared/clock/**',
      '**/*.{test,spec}.*',
      '**/test/**',
      '**/tests/**',
      '**/__tests__/**',
    ],
    rules: {
      // A call, a reference and a destructured `now` alike.
      'no-restricted-properties': [
        'error',
        { object: 'Date', property: 'now', message: CLOCK_MESSAGE },
      ],
      'no-restricted-syntax': [
        'error',
        {
          selector: "NewExpression[callee.name='Date'][arguments.length=0]",
          message: CLOCK_MESSAGE,
        },
        // `Date()` without `new` gives the current time as a string.
        { selector: "CallExpression[callee.name='Date']", message: CLOCK_MESSAGE },
      ],
    },
  },
  prettier,
);
