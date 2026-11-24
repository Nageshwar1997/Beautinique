import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { afterEach } from 'vitest';

import type { Exec, ExecResult } from '../../src/exec.ts';
import { createLogger, type Logger } from '../../src/logger.ts';
import { packageFiles } from '../../src/template.ts';
import type { Category } from '../../src/workspace.ts';

export const REPOSITORY_URL = 'git+https://github.com/Nageshwar1997/Beautinique.git';
const roots: string[] = [];

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

export function writeText(dir: string, path: string, content: string): void {
  const target = join(dir, path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
}

// Writes the template package and returns its folder; `needs` become dependencies.
export function addPackage(
  root: string,
  category: Category,
  name: string,
  needs: string[] = [],
): string {
  const dir = join(root, 'packages', category, name);
  const files = packageFiles({
    category,
    name,
    packageName: `@beautinique/${category}-${name}`,
    description: 'A fixture package',
    version: '1.0.0',
    node: '24.22.3',
    license: 'MIT License\n',
  });
  for (const [path, content] of Object.entries(files)) writeText(dir, path, content);
  if (needs.length > 0) {
    const manifest = JSON.parse(files['package.json'] ?? '{}') as Record<string, unknown>;
    manifest.dependencies = Object.fromEntries(needs.map((need) => [need, '^1.0.0']));
    writeText(dir, 'package.json', JSON.stringify(manifest, null, 2));
  }
  return dir;
}

// A throwaway repo root: a root package.json and LICENSE, and packages/<category>/<name>/ for each
// entry. `{ 'shared/money': ['@beautinique/shared-ids'] }` is a package needing another one; the
// package is the real template output, so the rules see what `create` writes.
export function fixtureRepo(packages: Record<string, string[]> = {}): string {
  const root = mkdtempSync(join(tmpdir(), 'bq-packages-'));
  roots.push(root);
  writeFileSync(
    join(root, 'package.json'),
    JSON.stringify({
      name: 'beautinique',
      engines: { node: '24.22.3' },
      repository: { url: REPOSITORY_URL },
    }),
  );
  writeFileSync(join(root, 'LICENSE'), 'MIT License\n');
  for (const [path, needs] of Object.entries(packages)) {
    const [category = '', name = ''] = path.split('/');
    addPackage(root, category as Category, name, needs);
  }
  return root;
}

// A logger that keeps what it is told, split by stream.
export function recordingLogger(): { log: Logger; out: string[]; err: string[] } {
  const out: string[] = [];
  const err: string[] = [];
  return {
    log: createLogger(
      (line) => out.push(line),
      (line) => err.push(line),
    ),
    out,
    err,
  };
}

export interface Call {
  command: string;
  args: string[];
  cwd: string;
  input?: string | undefined;
}

// A stand-in for running programs: records every call and answers 0. `turbo` also writes the build
// output (dist/) every package would have, and `npm pack` lists the files a tarball would hold.
// `answer` replaces the default for a call: return a result to take over, or undefined to pass.
export function fakeExec(
  root: string,
  answer: (call: Call) => Partial<ExecResult> | undefined = () => undefined,
): { exec: Exec; calls: Call[] } {
  const calls: Call[] = [];
  const exec: Exec = (command, args, options) => {
    const call: Call = { command, args, cwd: options.cwd, input: options.input };
    calls.push(call);
    const custom = answer(call);
    if (custom) return { status: 0, stdout: '', stderr: '', ...custom };
    if (command === 'turbo') {
      for (const category of ['shared', 'frontend', 'backend']) {
        const base = join(root, 'packages', category);
        if (!existsSync(base)) continue;
        for (const name of readdirSync(base)) {
          writeText(join(base, name), 'dist/index.mjs', 'export {};\n');
          writeText(join(base, name), 'dist/index.d.mts', 'export {};\n');
        }
      }
    }
    if (command === 'npm' && args[0] === 'pack') {
      const paths = [
        'package.json',
        'README.md',
        'CHANGELOG.md',
        'LICENSE',
        'dist/index.mjs',
        'dist/index.d.mts',
      ];
      const files = paths
        .filter((path) => existsSync(join(options.cwd, path)))
        .map((path) => ({ path }));
      return { status: 0, stdout: JSON.stringify({ pkg: { files } }), stderr: '' };
    }
    return { status: 0, stdout: '', stderr: '' };
  };
  return { exec, calls };
}
