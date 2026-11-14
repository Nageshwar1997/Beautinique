// Core's modules talk to each other only through a module's index.ts (ARCHITECTURE §4, RULES §4.2),
// and core never imports another deployable's code (ARCHITECTURE §3): dependency-cruiser checks both
// with .dependency-cruiser.json in `npm run lint` (QA-DOC-001). These show the rules catch a module
// that reaches into another one and a file that reaches into identity, let the facade through, and
// find nothing wrong in core today.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const core = join(import.meta.dirname, '..');
const bin = join(core, '../../node_modules/dependency-cruiser/bin/dependency-cruiser.mjs');

interface Cruise {
  summary: { violations: { from: string; to: string; rule: { name: string } }[] };
}

/** dependency-cruiser over `path` (from core's folder), with core's own rules. */
function depcruise(path: string, ...extra: string[]) {
  return spawnSync(
    process.execPath,
    [bin, path, '--config', '.dependency-cruiser.json', ...extra],
    {
      cwd: core,
      encoding: 'utf8',
    },
  );
}

/** The rules `path` breaks, as `from -> to (rule)`, and the exit code `npm run lint` would see. */
function cruise(path: string) {
  const result = JSON.parse(depcruise(path, '--output-type', 'json').stdout) as Cruise;
  return {
    failsLint: depcruise(path).status !== 0,
    violations: result.summary.violations
      .map(({ from, to, rule }) => `${from} -> ${to} (${rule.name})`)
      .sort(),
  };
}

// Each check starts dependency-cruiser twice as its own process: ~2 s alone, more next to the other
// test files of a full `npm test`.
// A mutation run copies core alone (scripts/mutation): there the file the fixture imports from
// identity is not there, so only that check waits for the repo.
const identityBeside = existsSync(join(core, '../identity/src/errors.ts'));

describe('core boundaries', { timeout: 30_000 }, () => {
  it('stop a module reaching into another, and let its index.ts through', () => {
    const fixtures = 'test/fixtures/boundaries/modules';
    expect(cruise(fixtures)).toEqual({
      failsLint: true,
      violations: [
        `${fixtures}/beta/reaches-in.ts -> ${fixtures}/alpha/domain/thing.ts (core-module-facade-only)`,
      ],
    });
  });

  it.runIf(identityBeside)('keep other deployables out', () => {
    const fixture = 'test/fixtures/boundaries/other-deployable.ts';
    expect(cruise(fixture)).toEqual({
      failsLint: true,
      violations: [`${fixture} -> ../identity/src/errors.ts (core-no-other-deployable)`],
    });
  });

  it('find nothing wrong in core’s own code', () => {
    expect(cruise('src')).toEqual({ failsLint: false, violations: [] });
  });
});
