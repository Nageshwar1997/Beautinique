import { execFileSync } from 'node:child_process';
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { packageDirOf, parseOnly } from '../lib/cli.ts';
import { parseChangedLines, touches } from '../lib/diff.ts';
import { anchorLines, applyChange, MutationError, validateList } from '../lib/list.ts';
import { runMutations } from '../lib/runner.ts';

const REPO = resolve(import.meta.dirname, '..', '..', '..');

describe('validateList', () => {
  it('accepts a good list and keeps only known fields', () => {
    const list = validateList(
      [
        { file: 'relay', name: 'no lease', change: [['a', 'b']] },
        { file: 'lib/x', name: 'n', change: [['a', 'b']], tests: 'relay', survives: 'equivalent' },
      ],
      'list',
    );
    expect(list[1]).toEqual({
      file: 'lib/x',
      name: 'n',
      change: [['a', 'b']],
      tests: 'relay',
      survives: 'equivalent',
    });
  });

  it('names the entry and the problem', () => {
    const cases: [unknown, string][] = [
      [{}, 'the default export must be an array'],
      [[null], 'list #0: not an object'],
      [[{ file: '../x', name: 'n', change: [['a', 'b']] }], 'file must be a path under src'],
      [[{ file: 'x', name: ' ', change: [['a', 'b']] }], 'name is required'],
      [[{ file: 'x', name: 'n', change: [] }], 'change must be [from, to] pairs'],
      [[{ file: 'x', name: 'n', change: [['a', 'a']] }], 'change must be [from, to] pairs'],
      [[{ file: 'x', name: 'n', change: [['', 'b']] }], 'change must be [from, to] pairs'],
      [[{ file: 'x', name: 'n', change: [['a', 'b']], tests: '' }], 'tests must be'],
      [[{ file: 'x', name: 'n', change: [['a', 'b']], survives: ' ' }], 'survives must say why'],
    ];
    for (const [list, message] of cases) {
      expect(() => validateList(list, 'list'), message).toThrow(message);
    }
  });
});

describe('applyChange and anchorLines', () => {
  it('applies pairs in turn, each found exactly once', () => {
    expect(
      applyChange(
        'one two three',
        [
          ['two', '2'],
          ['2 three', 'x'],
        ],
        'm',
      ),
    ).toBe('one x');
    expect(() => applyChange('a a', [['a', 'b']], 'm')).toThrow('is found 2 times');
    expect(() => applyChange('a', [['z', 'b']], 'm')).toThrow('is found 0 times');
  });

  it('gives the lines an anchor spans', () => {
    expect(anchorLines('l1\nl2 x\nl3\nl4', 'x\nl3')).toEqual([2, 3]);
    expect(() => anchorLines('a', 'z')).toThrow(MutationError);
  });
});

describe('parseChangedLines and touches', () => {
  it('reads the new-side lines of every hunk, deletions marking both sides', () => {
    const diff = [
      'diff --git a/p/src/a.ts b/p/src/a.ts',
      '--- a/p/src/a.ts',
      '+++ b/p/src/a.ts',
      '@@ -3 +3 @@',
      '@@ -10,2 +10,4 @@ function x() {',
      '@@ -20,3 +21,0 @@',
      'diff --git a/p/src/gone.ts b/p/src/gone.ts',
      '+++ /dev/null',
      '@@ -1,5 +0,0 @@',
    ].join('\n');
    const changed = parseChangedLines(diff);
    expect([...changed.keys()]).toEqual(['p/src/a.ts']);
    expect(changed.get('p/src/a.ts')).toEqual([
      [3, 3],
      [10, 13],
      [21, 22],
    ]);
    const ranges = changed.get('p/src/a.ts');
    expect(touches(ranges, [13, 15])).toBe(true);
    expect(touches(ranges, [14, 20])).toBe(false);
    expect(touches(undefined, [1, 1])).toBe(false);
  });
});

describe('packageDirOf and parseOnly', () => {
  it('maps package names and mutation numbers, and refuses anything else', () => {
    expect(packageDirOf('backend-server-queue')).toBe('packages/backend/server-queue');
    expect(packageDirOf('shared-zod')).toBe('packages/shared/zod');
    expect(packageDirOf('gateway')).toBe('backend/gateway');
    expect(packageDirOf('core')).toBe('backend/core');
    for (const bad of [
      'server-queue',
      'backend-',
      'backend-Server',
      'other-x',
      'bundle',
      'gateways',
    ]) {
      expect(() => packageDirOf(bad), bad).toThrow('--package must look like');
    }
    expect(parseOnly('3, 5,12')).toEqual([3, 5, 12]);
    for (const bad of ['', '3,,5', 'a', '-1', '1.5']) {
      expect(() => parseOnly(bad), bad).toThrow('--only takes mutation numbers');
    }
  });
});

/** A tiny repo with one package, its tests and a mutation list, using the real node_modules. */
describe('runMutations on a real package', () => {
  let root: string;
  const pkg = 'packages/backend/fixture';
  const write = (path: string, text: string) => {
    mkdirSync(join(root, path, '..'), { recursive: true });
    writeFileSync(join(root, path), text);
  };
  const git = (...args: string[]) =>
    execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: 'pipe' });
  const list = (entries: unknown[]) => {
    write(`${pkg}/test/mutations.ts`, `export default ${JSON.stringify(entries)};\n`);
  };
  const run = async (options: { only?: number[]; changedSince?: string } = {}) => {
    const lines: string[] = [];
    const summary = await runMutations({
      root,
      packageDir: pkg,
      ...options,
      log: (line) => lines.push(line),
    });
    return { summary, lines };
  };

  beforeAll(() => {
    root = mkdtempSync(join(tmpdir(), 'bq-mutation-test-'));
    cpSync(join(REPO, 'configs'), join(root, 'configs'), { recursive: true });
    symlinkSync(
      join(REPO, 'node_modules'),
      join(root, 'node_modules'),
      process.platform === 'win32' ? 'junction' : 'dir',
    );
    write(`${pkg}/package.json`, '{ "name": "fixture", "type": "module" }\n');
    write(
      `${pkg}/src/math.ts`,
      'export const add = (a: number, b: number): number => a + b;\n\nexport const twice = (a: number): number => a * 2;\n',
    );
    write(
      `${pkg}/test/math.test.ts`,
      "import { expect, it } from 'vitest';\n\nimport { add, twice } from '../src/math';\n\nit('adds', () => {\n  expect(add(2, 3)).toBe(5);\n});\n\nit('doubles', () => {\n  expect(twice(0)).toBe(0);\n});\n",
    );
    // the node_modules link must stay out of the fixture's git
    write('.gitignore', 'node_modules\n');
    git('init', '--quiet');
    git('-c', 'user.name=t', '-c', 'user.email=t@t', 'add', '.');
    git('-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '--quiet', '-m', 'fixture');
  });
  afterAll(() => {
    unlinkSync(join(root, 'node_modules'));
    rmSync(root, { recursive: true, force: true });
  });

  it('kills real bugs, accepts known survivors, flags unexpected ones, and cleans up', async () => {
    list([
      { file: 'math', name: 'minus', change: [['a + b', 'a - b']], tests: 'adds' },
      {
        file: 'math',
        name: 'twice is plus',
        change: [['a * 2', 'a + a']],
        survives: 'equivalent: a + a is a * 2',
      },
      { file: 'math', name: 'twice squared', change: [['a * 2', 'a * a']] },
    ]);
    const before = readdirSync(tmpdir()).filter((name) => name.startsWith('bq-mutation-')).length;
    const { summary, lines } = await run();
    expect(summary.results.map((r) => [r.index, r.outcome])).toEqual([
      [0, 'killed'],
      [1, 'survived'],
      [2, 'survived'],
    ]);
    expect(summary.unexpected.map((r) => r.index)).toEqual([2]);
    expect(lines.some((line) => line.includes('needs a test, or a survives note'))).toBe(true);
    expect(lines.at(-1)).toBe('Result: 1 of 3 killed, 1 expected survivors, 1 unexpected');
    // the copy is gone, the real node_modules and source are untouched
    expect(readdirSync(tmpdir()).filter((name) => name.startsWith('bq-mutation-')).length).toBe(
      before,
    );
    expect(readdirSync(join(REPO, 'node_modules', 'vitest')).length).toBeGreaterThan(0);
    expect(git('status', '--porcelain', '--', `${pkg}/src`)).toBe('');
  });

  it('says when a known survivor is killed now', async () => {
    list([{ file: 'math', name: 'minus', change: [['a + b', 'a - b']], survives: 'old note' }]);
    const { summary, lines } = await run();
    expect(summary.nowKilled.map((r) => r.index)).toEqual([0]);
    expect(lines.some((line) => line.includes('is killed now: remove its survives note'))).toBe(
      true,
    );
  });

  it('runs only the mutations asked for, or those on changed lines', async () => {
    list([
      { file: 'math', name: 'minus', change: [['a + b', 'a - b']] },
      {
        file: 'math',
        name: 'twice squared',
        change: [['a * 2', 'a * a']],
        survives: 'test gap kept for this check',
      },
    ]);
    expect((await run({ only: [1] })).summary.results.map((r) => r.index)).toEqual([1]);
    expect((await run({ changedSince: 'HEAD' })).summary.results).toEqual([]);
    write(
      `${pkg}/src/math.ts`,
      'export const add = (a: number, b: number): number => a + b;\n\nexport const twice = (a: number): number => a * 2; // changed\n',
    );
    expect((await run({ changedSince: 'HEAD' })).summary.results.map((r) => r.index)).toEqual([1]);
    git('checkout', '--', `${pkg}/src/math.ts`);
  });

  it('refuses a stale list before running anything, and failing tests', async () => {
    list([
      { file: 'math', name: 'gone', change: [['a / b', 'a * b']] },
      { file: 'nope', name: 'no file', change: [['x', 'y']] },
    ]);
    await expect(run()).rejects.toThrow(
      /#0 gone: "a \/ b" is found 0 times[\s\S]*src\/nope\.ts does not exist/,
    );
    list([{ file: 'math', name: 'minus', change: [['a + b', 'a - b']] }]);
    write(
      `${pkg}/test/broken.test.ts`,
      "import { it } from 'vitest';\n\nit('fails', () => {\n  throw new Error('red');\n});\n",
    );
    await expect(run()).rejects.toThrow('The tests fail without any mutation');
    rmSync(join(root, pkg, 'test', 'broken.test.ts'));
  });

  it('asks for a list when the package has none', async () => {
    rmSync(join(root, pkg, 'test', 'mutations.ts'));
    await expect(run()).rejects.toThrow('test/mutations.ts does not exist');
  });
});
