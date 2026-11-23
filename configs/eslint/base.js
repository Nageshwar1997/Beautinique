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
  prettier,
);
