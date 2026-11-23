import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach } from 'vitest';

import { createLogger, type Logger } from '../../src/logger.ts';

const roots: string[] = [];

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

// A throwaway repo root holding packages/<category>/<name>/package.json for each entry:
// `{ 'shared/money': ['@beautinique/shared-ids'] }` is a package needing another one.
export function fixtureRepo(packages: Record<string, string[]>): string {
  const root = mkdtempSync(join(tmpdir(), 'bq-packages-'));
  roots.push(root);
  for (const [path, needs] of Object.entries(packages)) {
    const [category = '', name = ''] = path.split('/');
    const dir = join(root, 'packages', category, name);
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'package.json'),
      JSON.stringify({
        name: `@beautinique/${category}-${name}`,
        dependencies: Object.fromEntries(needs.map((need) => [need, '^1.0.0'])),
      }),
    );
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
