import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterAll, describe, test } from 'vitest';

import { ROOT } from '../src/constants/paths.ts';
import {
  deployablesWithEnvExample,
  envIgnoreProblems,
  parseEnvExample,
  trackedEnvFileProblems,
  writeEnvFiles,
} from '../src/env-files.ts';
import { trackedFiles } from '../src/utils/git.ts';

const EXAMPLE = [
  '# Example of a service (fake values only).',
  '# [DEVELOPMENT]',
  'BQ_DB_URI=mongodb://127.0.0.1:27017/?directConnection=true',
  'BQ_SIGNING_KEY=<a long random secret>',
  '# [TEST]',
  'BQ_DB_URI=mongodb://127.0.0.1:27017/?directConnection=true',
  'BQ_SIGNING_KEY=test-signing-key',
  '# [PRODUCTION]',
  'BQ_DB_URI=<...>',
  'BQ_SIGNING_KEY=<...>',
  '',
].join('\n');

const dirs: string[] = [];
function tempDir(prefix: string): string {
  const dir = mkdtempSync(join(tmpdir(), prefix));
  dirs.push(dir);
  return dir;
}
afterAll(() => {
  for (const dir of dirs) rmSync(dir, { recursive: true, force: true });
});

describe('.env.example', () => {
  test('three sections with the same keys, production values only placeholders', () => {
    const { sections, problems } = parseEnvExample(EXAMPLE);
    assert.deepEqual(problems, []);
    assert.deepEqual(sections.TEST, [
      'BQ_DB_URI=mongodb://127.0.0.1:27017/?directConnection=true',
      'BQ_SIGNING_KEY=test-signing-key',
    ]);
  });

  test('a missing or repeated section, a stray key, a key gap and a real production value are caught', () => {
    const bad = [
      'BQ_EARLY=1',
      '# [DEVELOPMENT]',
      'BQ_A=1',
      'BQ_B=2',
      'not a key line',
      '# [TEST]',
      'BQ_A=1',
      'BQ_A=1',
      'BQ_C=3',
      '# [TEST]',
      '# [DEVELOPMENT]',
      'BQ_A=1',
      'BQ_B=2',
    ].join('\n');
    assert.deepEqual(parseEnvExample(bad).problems, [
      'line 1: a key before the first section',
      'line 5: not a KEY=value line (keys are UPPER_SNAKE_CASE)',
      'line 10: the [TEST] section appears twice',
      'line 11: the [DEVELOPMENT] section appears twice',
      'missing the [PRODUCTION] section',
      // The second [TEST] started empty, so it names none of the keys.
      '[TEST] lacks BQ_A',
      '[TEST] lacks BQ_B',
    ]);

    const gaps = EXAMPLE.replace('BQ_SIGNING_KEY=test-signing-key', 'BQ_OTHER=1').replace(
      'BQ_SIGNING_KEY=<...>',
      'BQ_SIGNING_KEY=live-secret-value',
    );
    assert.deepEqual(parseEnvExample(gaps).problems, [
      '[TEST] has BQ_OTHER, which [DEVELOPMENT] lacks',
      '[TEST] lacks BQ_SIGNING_KEY',
      '[PRODUCTION] BQ_SIGNING_KEY must be a placeholder like <...>, never a value',
    ]);
    // A problem never repeats the line's value.
    assert.ok(!parseEnvExample(gaps).problems.join('\n').includes('live-secret-value'));
  });
});

describe('writeEnvFiles', () => {
  test('AC-FOUNDATION-1: makes .env.development and .env.test from their sections and keeps a file that exists', () => {
    const dir = tempDir('bq-env-');
    writeFileSync(join(dir, '.env.example'), EXAMPLE);
    writeFileSync(join(dir, '.env.test'), 'BQ_DB_URI=owner-edited\n');

    const results = writeEnvFiles(dir);
    assert.deepEqual(results, [
      { file: '.env.development', status: 'created', placeholders: ['BQ_SIGNING_KEY'] },
      { file: '.env.test', status: 'kept', placeholders: [] },
    ]);
    const development = readFileSync(join(dir, '.env.development'), 'utf8');
    assert.match(development, /^# Made by `npm run setup` from .env.example \[DEVELOPMENT\]/);
    assert.match(development, /^BQ_SIGNING_KEY=<a long random secret>$/m);
    assert.ok(!development.includes('test-signing-key'));
    assert.equal(readFileSync(join(dir, '.env.test'), 'utf8'), 'BQ_DB_URI=owner-edited\n');
  });

  test('AC-FOUNDATION-3: setup never creates or touches .env.production', () => {
    const withProduction = tempDir('bq-env-');
    writeFileSync(join(withProduction, '.env.example'), EXAMPLE);
    writeFileSync(join(withProduction, '.env.production'), 'BQ_DB_URI=owner-only\n');
    writeEnvFiles(withProduction);
    assert.equal(
      readFileSync(join(withProduction, '.env.production'), 'utf8'),
      'BQ_DB_URI=owner-only\n',
    );

    const without = tempDir('bq-env-');
    writeFileSync(join(without, '.env.example'), EXAMPLE);
    writeEnvFiles(without);
    assert.deepEqual(readdirSync(without).sort(), [
      '.env.development',
      '.env.example',
      '.env.test',
    ]);
  });

  test('a broken .env.example stops before any file is made', () => {
    const dir = tempDir('bq-env-');
    writeFileSync(join(dir, '.env.example'), '# [DEVELOPMENT]\nBQ_A=1\n');
    assert.throws(() => writeEnvFiles(dir), /missing the \[TEST\] section/);
    assert.deepEqual(readdirSync(dir), ['.env.example']);
  });

  test('deployables are frontend/<app> and backend/<service> folders with a .env.example', () => {
    const root = tempDir('bq-env-');
    for (const dir of ['frontend/customer', 'backend/identity', 'backend/no-env', 'scripts/tool']) {
      mkdirSync(join(root, dir), { recursive: true });
    }
    for (const dir of ['frontend/customer', 'backend/identity', 'scripts/tool']) {
      writeFileSync(join(root, dir, '.env.example'), EXAMPLE);
    }
    assert.deepEqual(deployablesWithEnvExample(root), ['backend/identity', 'frontend/customer']);
  });
});

// These start git: seconds when the whole suite runs, not a unit test's 5 s budget.
describe('env files and git', { timeout: 60_000 }, () => {
  test('AC-FOUNDATION-3: git ignores every env file but .env.example, anywhere in the repository', () => {
    assert.deepEqual(envIgnoreProblems(ROOT), []);
  });

  test('AC-FOUNDATION-3: a .gitignore that lets an env file through is caught', () => {
    const repo = tempDir('bq-env-git-');
    assert.equal(spawnSync('git', ['init', '--quiet'], { cwd: repo }).status, 0);
    writeFileSync(join(repo, '.gitignore'), '.env\n');
    const problems = envIgnoreProblems(repo);
    assert.ok(problems.includes('.env.production: git must ignore it'), problems.join('\n'));
    assert.ok(problems.includes('.env.test: git must ignore it'), problems.join('\n'));
  });

  test('AC-FOUNDATION-3: no env file is tracked; one in git would be caught', () => {
    assert.deepEqual(trackedEnvFileProblems(trackedFiles(ROOT)), []);

    assert.deepEqual(
      trackedEnvFileProblems([
        '.env',
        'backend/identity/.env.production',
        'frontend/customer/.env.local',
        'backend/identity/.env.example',
        'docs/env-files.md',
        '.envrc',
      ]),
      [
        '.env: env files never go into git; only .env.example does',
        'backend/identity/.env.production: env files never go into git; only .env.example does',
        'frontend/customer/.env.local: env files never go into git; only .env.example does',
      ],
    );
  });
});
