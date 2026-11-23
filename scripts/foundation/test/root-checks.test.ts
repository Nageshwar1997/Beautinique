import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterAll, describe, test } from 'vitest';

import {
  oldCodeProblems,
  type RootManifest,
  versionPinProblems,
  workspacePrivacyProblems,
} from '../src/root-checks.ts';
import { readJson } from '../src/utils/read-json.ts';
import { ROOT } from './constants/paths.ts';

describe('old code', () => {
  test('AC-FOUNDATION-11: the repository tracks no *-old folder', () => {
    const git = spawnSync('git', ['ls-files', '-z'], { cwd: ROOT, encoding: 'utf8' });
    assert.equal(git.status, 0, git.stderr);
    const tracked = git.stdout.split('\0').filter(Boolean);
    assert.ok(tracked.includes('package.json'), 'git ls-files must list the repository');
    assert.deepEqual(oldCodeProblems(tracked), []);
  });

  test('AC-FOUNDATION-11: an old folder in git is caught, a name that only contains "-old" is not', () => {
    assert.deepEqual(
      oldCodeProblems([
        'backend-old/identity/src/index.ts',
        'packages-old/shared/ids/package.json',
        'backend-old/core/package.json',
        'docs/how-old-orders-work.md',
        'scripts/foundation/fold-old.ts',
        'gold-older/x.ts',
      ]),
      [
        'backend-old/: old code must not be in the repository',
        'packages-old/: old code must not be in the repository',
      ],
    );
  });
});

describe('root package.json version pins', () => {
  test('the repository pins Node and npm to one exact version each', () => {
    assert.deepEqual(versionPinProblems(readJson(join(ROOT, 'package.json')) as RootManifest), []);
  });

  test('a range, a missing pin or two different versions is caught', () => {
    const pinned = {
      engines: { node: '24.22.3' },
      devEngines: {
        runtime: { name: 'node', version: '24.22.3' },
        packageManager: { name: 'npm', version: '12.2.3' },
      },
      packageManager: 'npm@12.2.3',
    };
    assert.deepEqual(versionPinProblems(pinned), []);

    const range = structuredClone(pinned);
    range.devEngines.runtime.version = '>=24';
    range.engines.node = '>=24';
    assert.equal(versionPinProblems(range).length, 1);

    const drift = structuredClone(pinned);
    drift.engines.node = '24.21.0';
    assert.deepEqual(versionPinProblems(drift), [
      'engines.node must equal devEngines.runtime.version',
    ]);

    const npmDrift = structuredClone(pinned);
    npmDrift.packageManager = 'npm@12.2.0';
    assert.equal(versionPinProblems(npmDrift).length, 1);

    assert.equal(versionPinProblems({}).length, 3);
  });
});

describe('workspace privacy', () => {
  const dirs: string[] = [];
  afterAll(() => {
    for (const dir of dirs) rmSync(dir, { recursive: true, force: true });
  });

  const workspace = (root: string, dir: string, manifest: object) => {
    mkdirSync(join(root, dir), { recursive: true });
    writeFileSync(join(root, dir, 'package.json'), JSON.stringify(manifest));
  };

  test('deployables and repo tools in the repository are private, packages are not', () => {
    assert.deepEqual(workspacePrivacyProblems(ROOT), []);
  });

  test('a public app, service or tool and a private package are caught', () => {
    const root = mkdtempSync(join(tmpdir(), 'bq-privacy-'));
    dirs.push(root);
    workspace(root, 'frontend/customer', { name: 'customer' });
    workspace(root, 'backend/identity', { name: 'identity', private: false });
    workspace(root, 'scripts/tool', { name: 'tool', private: true });
    workspace(root, 'packages/shared/ids', { name: '@beautinique/shared-ids', private: true });
    workspace(root, 'packages/frontend/ui', { name: '@beautinique/frontend-ui' });

    assert.deepEqual(workspacePrivacyProblems(root), [
      'frontend/customer: must have "private": true',
      'backend/identity: must have "private": true',
      'packages/shared/ids: packages are public on npm, remove "private": true',
    ]);
  });
});

describe('turbo.json', () => {
  test('remote cache is off: work is reused from the local cache only', () => {
    const turbo = readJson(join(ROOT, 'turbo.json')) as { remoteCache?: { enabled?: boolean } };
    assert.equal(turbo.remoteCache?.enabled, false);
  });
});
