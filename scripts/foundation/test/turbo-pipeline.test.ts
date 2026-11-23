import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterAll, beforeAll, test } from 'vitest';

import type { RootManifest } from '../src/root-checks.ts';
import { readJson } from '../src/utils/read-json.ts';
import { ROOT } from '../src/constants/paths.ts';
import { cleanEnv } from './utils/env.ts';

const TURBO = join(ROOT, 'node_modules', 'turbo', 'bin', 'turbo');

// A throwaway monorepo with the repository's own turbo.json and workspace globs: `@fixture/b`
// depends on `@fixture/a`. Every task appends "<task> <package>" to log.txt, so the log shows what
// really ran and in which order; a task served from the cache leaves no line.
let fixture = '';

const TASK_SCRIPT = `import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs';
const [name, task] = process.argv.slice(2);
appendFileSync(new URL('./log.txt', import.meta.url), task + ' ' + name + '\\n');
if (task === 'build') {
  mkdirSync('dist', { recursive: true });
  writeFileSync('dist/out.txt', name);
}
`;

function writeWorkspace(name: 'a' | 'b', dependencies: Record<string, string>) {
  const dir = join(fixture, 'packages', 'shared', name);
  mkdirSync(dir, { recursive: true });
  writeFileSync(
    join(dir, 'package.json'),
    JSON.stringify({
      name: `@fixture/${name}`,
      version: '1.0.0',
      private: true,
      dependencies,
      scripts: {
        build: `node ../../../task.mjs ${name} build`,
        test: `node ../../../task.mjs ${name} test`,
      },
    }),
  );
  writeFileSync(join(dir, 'index.js'), `export const name = '${name}';\n`);
}

function turbo(...args: string[]): string {
  const result = spawnSync(process.execPath, [TURBO, 'run', ...args, '--output-logs=errors-only'], {
    cwd: fixture,
    encoding: 'utf8',
    env: { ...cleanEnv(), TURBO_TELEMETRY_DISABLED: '1', TURBO_NO_UPDATE_NOTIFIER: '1' },
  });
  assert.equal(
    result.status,
    0,
    `turbo ${args.join(' ')} failed:\n${result.stdout}\n${result.stderr}`,
  );
  return result.stdout;
}

// Lines the tasks added to the log since the previous call.
let seen = 0;
function newLogLines(): string[] {
  const path = join(fixture, 'log.txt');
  const lines = existsSync(path) ? readFileSync(path, 'utf8').split('\n').filter(Boolean) : [];
  const fresh = lines.slice(seen);
  seen = lines.length;
  return fresh;
}

beforeAll(() => {
  fixture = mkdtempSync(join(tmpdir(), 'bq-turbo-'));
  const root = readJson(join(ROOT, 'package.json')) as RootManifest;

  copyFileSync(join(ROOT, 'turbo.json'), join(fixture, 'turbo.json'));
  writeFileSync(
    join(fixture, 'package.json'),
    JSON.stringify({
      name: 'bq-turbo-fixture',
      private: true,
      workspaces: root.workspaces,
      packageManager: root.packageManager,
    }),
  );
  // The npm lockfile Turborepo reads for the package graph: two linked workspaces, nothing else.
  writeFileSync(
    join(fixture, 'package-lock.json'),
    JSON.stringify({
      name: 'bq-turbo-fixture',
      lockfileVersion: 3,
      requires: true,
      packages: {
        '': { name: 'bq-turbo-fixture', workspaces: root.workspaces },
        'node_modules/@fixture/a': { resolved: 'packages/shared/a', link: true },
        'node_modules/@fixture/b': { resolved: 'packages/shared/b', link: true },
        'packages/shared/a': { name: '@fixture/a', version: '1.0.0' },
        'packages/shared/b': {
          name: '@fixture/b',
          version: '1.0.0',
          dependencies: { '@fixture/a': '1.0.0' },
        },
      },
    }),
  );
  writeFileSync(join(fixture, '.gitignore'), 'node_modules/\ndist/\ncoverage/\n.turbo/\nlog.txt\n');
  writeFileSync(join(fixture, 'task.mjs'), TASK_SCRIPT);
  writeWorkspace('a', {});
  writeWorkspace('b', { '@fixture/a': '1.0.0' });

  // Turborepo hashes the files git sees, so build output (ignored) never changes a task's hash.
  const git = spawnSync('git', ['init', '--quiet'], { cwd: fixture, encoding: 'utf8' });
  assert.equal(git.status, 0, git.stderr);
});

afterAll(() => {
  rmSync(fixture, { recursive: true, force: true });
});

test('AC-FOUNDATION-9: build and test run the dependency first and reuse the local cache for unchanged work', () => {
  // First run: nothing is cached, and @fixture/a is built before anything of @fixture/b that needs it.
  turbo('build', 'test');
  const first = newLogLines();
  assert.deepEqual([...first].sort(), ['build a', 'build b', 'test a', 'test b']);
  assert.ok(first.indexOf('build a') < first.indexOf('build b'), `order: ${first.join(', ')}`);
  assert.ok(first.indexOf('build a') < first.indexOf('test b'), `order: ${first.join(', ')}`);

  // Nothing changed: every task comes from the local cache, and the build output comes back from it.
  rmSync(join(fixture, 'packages', 'shared', 'a', 'dist'), { recursive: true });
  const cached = turbo('build', 'test');
  assert.deepEqual(newLogLines(), []);
  assert.match(cached, /4 cached, 4 total/);
  assert.equal(readFileSync(join(fixture, 'packages/shared/a/dist/out.txt'), 'utf8'), 'a');

  // Only @fixture/b changed: its tasks run again, @fixture/a's stay cached.
  writeFileSync(join(fixture, 'packages/shared/b/index.js'), "export const name = 'b2';\n");
  turbo('build', 'test');
  assert.deepEqual(newLogLines().sort(), ['build b', 'test b']);

  // @fixture/a changed: it runs again, and so does @fixture/b, whose dependency is now different.
  writeFileSync(join(fixture, 'packages/shared/a/index.js'), "export const name = 'a2';\n");
  turbo('build', 'test');
  const afterDependencyChange = newLogLines();
  assert.deepEqual([...afterDependencyChange].sort(), ['build a', 'build b', 'test a', 'test b']);
  assert.ok(afterDependencyChange.indexOf('build a') < afterDependencyChange.indexOf('build b'));
  // Four real Turborepo runs: seconds, not the default 5 s budget of a unit test.
}, 60_000);
