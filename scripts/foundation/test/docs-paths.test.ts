import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterAll, describe, test } from 'vitest';

import { ROOT } from '../src/constants/paths.ts';
import {
  commandProblems,
  docFiles,
  docsCommandProblems,
  docsPathProblems,
} from '../src/docs-paths.ts';

const dirs: string[] = [];
afterAll(() => {
  for (const dir of dirs) rmSync(dir, { recursive: true, force: true });
});

describe('docs paths (D-019)', () => {
  test('AC-FOUNDATION-6: every relative link in the docs points at something in the repository', () => {
    assert.ok(docFiles(ROOT).length > 10, 'the docs were not found');
    assert.deepEqual(docsPathProblems(ROOT), []);
  });

  test('AC-FOUNDATION-6: a broken link is named with its doc and line; web links, anchors and code are left alone', () => {
    const root = mkdtempSync(join(tmpdir(), 'bq-docs-'));
    dirs.push(root);
    mkdirSync(join(root, 'docs', 'tasks'), { recursive: true });
    writeFileSync(join(root, 'docs', 'RULES.md'), '# Rules\n');
    writeFileSync(join(root, 'README.md'), 'See [the docs](docs/RULES.md).\n');
    writeFileSync(
      join(root, 'docs', 'tasks', 'TASK.md'),
      [
        '# Task',
        'Rules: [RULES](../RULES.md#section), line [12](../RULES.md:12).',
        'Gone: [old file](../MOVED.md) and [folder](../missing/).',
        'Web: [site](https://example.com/x.md), [mail](mailto:a@example.com), [here](#task).',
        '```md',
        '[inside a code block](../NOT-CHECKED.md)',
        '```',
      ].join('\n'),
    );
    assert.deepEqual(docsPathProblems(root), [
      'docs/tasks/TASK.md:3: ../MOVED.md does not exist',
      'docs/tasks/TASK.md:3: ../missing/ does not exist',
    ]);
  });

  test('AC-FOUNDATION-6: every npm run command in the README and CLAUDE.md is a root script', () => {
    assert.deepEqual(docsCommandProblems(ROOT), []);
  });

  test('AC-FOUNDATION-6: a command that package.json lacks is named with its file and line', () => {
    const text = [
      'Run `npm run setup`, then `npm run infra:up -- backend`.',
      'Old: `npm run start` and `npm run infra:start`.',
    ].join('\n');
    assert.deepEqual(commandProblems('README.md', text, new Set(['setup', 'infra:up'])), [
      'README.md:2: npm run start is not a script of package.json',
      'README.md:2: npm run infra:start is not a script of package.json',
    ]);
  });
});
