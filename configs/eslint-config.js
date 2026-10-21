// @ts-check
/**
 * Shared ESLint setup. Each package's eslint.config.js is one line:
 *
 *   export default packageConfig({ platform: 'browser', react: true, tsconfigRootDir: import.meta.dirname });
 */
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const GLOBALS = {
  neutral: {},
  browser: globals.browser,
  node: globals.node,
};

/**
 * @param {object} options
 * @param {'neutral' | 'browser' | 'node'} options.platform where the code runs (decides the allowed globals)
 * @param {boolean} [options.react] add the React hooks rules
 * @param {string} options.tsconfigRootDir pass `import.meta.dirname`
 * @param {string[]} [options.ignores] extra paths to skip
 * @param {boolean} [options.zodPackage] only for @beautinique/shared-zod: the one package that imports zod
 * @param {boolean} [options.mongoPackage] only for @beautinique/backend-server-mongo: the one package that imports mongodb
 * @param {string[]} [options.envFiles] backend apps: the only files that may read process.env (ARCHITECTURE §3)
 */
export function packageConfig({
  platform,
  react = false,
  tsconfigRootDir,
  ignores = [],
  zodPackage = false,
  mongoPackage = false,
  envFiles,
}) {
  const ZOD_MESSAGE =
    "Import z from '@beautinique/shared-zod' (the repo has one zod and one import path).";
  const MONGO_MESSAGE =
    "Import from '@beautinique/backend-server-mongo' (the repo has one MongoDB driver and one import path).";
  const restrictedPaths = [
    ...(zodPackage ? [] : [{ name: 'zod', message: ZOD_MESSAGE }]),
    ...(mongoPackage ? [] : [{ name: 'mongodb', message: MONGO_MESSAGE }]),
  ];
  const restrictedPatterns = [
    ...(zodPackage ? [] : [{ group: ['zod/*'], message: ZOD_MESSAGE }]),
    ...(mongoPackage ? [] : [{ group: ['mongodb/*'], message: MONGO_MESSAGE }]),
  ];
  return defineConfig(
    { ignores: ['dist', 'coverage', 'node_modules', ...ignores] },
    js.configs.recommended,
    tseslint.configs.strictTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    {
      languageOptions: {
        globals: GLOBALS[platform],
        parserOptions: { projectService: true, tsconfigRootDir },
      },
      plugins: { 'simple-import-sort': simpleImportSort },
      rules: {
        'simple-import-sort/imports': 'error',
        'simple-import-sort/exports': 'error',
        '@typescript-eslint/consistent-type-imports': 'error',
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
        ],
        'no-console': ['error', { allow: ['warn', 'error'] }],
        eqeqeq: ['error', 'always'],
        curly: ['error', 'all'],
        'no-restricted-imports': [
          'error',
          { paths: restrictedPaths, patterns: restrictedPatterns },
        ],
        // MongoDB runs a transaction's queries one at a time; the runtime check in withTransaction
        // only sees queries that reach the server together, this one sees every inline case.
        'no-restricted-syntax': [
          'error',
          {
            selector:
              "CallExpression:matches([callee.name='withTransaction'], [callee.property.name='withTransaction']) CallExpression[callee.object.name='Promise'][callee.property.name=/^(all|allSettled|any|race)$/]",
            message:
              'No Promise.all/allSettled/any/race inside withTransaction: MongoDB does not support parallel queries in a transaction. Await them one after another.',
          },
        ],
      },
    },
    // Plain JS config files (eslint.config.js) are not part of a tsconfig project.
    { files: ['**/*.js', '**/*.mjs', '**/*.cjs'], extends: [tseslint.configs.disableTypeChecked] },
    react
      ? {
          files: ['**/*.{ts,tsx}'],
          extends: [reactHooks.configs.flat['recommended-latest']],
          rules: {
            // async event handlers are normal in React
            '@typescript-eslint/no-misused-promises': [
              'error',
              { checksVoidReturn: { attributes: false } },
            ],
          },
        }
      : {},
    envFiles
      ? [
          {
            files: ['**/*.ts'],
            rules: {
              'no-restricted-properties': [
                'error',
                {
                  object: 'process',
                  property: 'env',
                  message: `Read settings in ${envFiles.join(' or ')} (namespaced config, ARCHITECTURE §3).`,
                },
              ],
            },
          },
          { files: envFiles, rules: { 'no-restricted-properties': 'off' } },
        ]
      : {},
    prettier,
  );
}
