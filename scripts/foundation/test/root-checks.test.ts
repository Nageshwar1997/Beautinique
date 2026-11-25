import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterAll, describe, test } from 'vitest';

import { ROOT } from '../src/constants/paths.ts';
import {
  BACKUP_DIR,
  backupIgnoreProblems,
  backupProblems,
  CLAUDE_SETTINGS,
  type ClaudeSettings,
  claudeSettingsProblems,
  oldCodeProblems,
  REQUIRED_DENY,
  type RootManifest,
  versionPinProblems,
  workspacePrivacyProblems,
} from '../src/root-checks.ts';
import { trackedFiles } from '../src/utils/git.ts';
import { readJson } from '../src/utils/read-json.ts';

// The git and old-code checks start git: seconds when the whole suite runs, not 5 s.
describe('backups (D-013)', { timeout: 60_000 }, () => {
  test('AC-FOUNDATION-8: git ignores the backup folder, and no backup file is tracked', () => {
    assert.equal(BACKUP_DIR, 'backups');
    assert.deepEqual(backupIgnoreProblems(ROOT), []);
    assert.deepEqual(backupProblems(trackedFiles(ROOT)), []);
  });

  test('AC-FOUNDATION-8: a backup file in git, or a .gitignore that lets the folder through, is caught', () => {
    assert.deepEqual(
      backupProblems([
        'backups/2026-11-23/manifest.json',
        'docs/backups.md',
        'scripts/backups/x.ts',
      ]),
      ['backups/2026-11-23/manifest.json: backup files never go into git'],
    );
    const repo = mkdtempSync(join(tmpdir(), 'bq-backup-git-'));
    try {
      assert.equal(spawnSync('git', ['init', '--quiet'], { cwd: repo }).status, 0);
      writeFileSync(join(repo, '.gitignore'), 'node_modules/\n');
      assert.deepEqual(backupIgnoreProblems(repo), ['backups/: git must ignore the whole folder']);
    } finally {
      rmSync(repo, { recursive: true, force: true });
    }
  });
});

describe('old code', { timeout: 60_000 }, () => {
  test('AC-FOUNDATION-11: the repository tracks no *-old folder', () => {
    const tracked = trackedFiles(ROOT);
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

describe('.claude/settings.json (CLAUDE.md)', () => {
  test('no AI attribution, and Claude may not read or edit any env file, the backups or All-ENVs (QA-TOOL-001)', () => {
    const settings = readJson(join(ROOT, CLAUDE_SETTINGS)) as ClaudeSettings;
    assert.deepEqual(claudeSettingsProblems(settings), []);
  });

  test('a deny list without the broad env rule, or with attribution on, is caught', () => {
    assert.deepEqual(
      claudeSettingsProblems({
        attribution: { commit: 'Co-Authored-By', pr: '', sessionUrl: false },
        permissions: { deny: REQUIRED_DENY.filter((rule) => !rule.includes('.env.*')) },
      }),
      [
        'attribution must be { commit: "", pr: "", sessionUrl: false }',
        'permissions.deny lacks Read(//**/.env.*)',
        'permissions.deny lacks Edit(//**/.env.*)',
      ],
    );
  });
});

describe('turbo.json', () => {
  test('remote cache is off: work is reused from the local cache only', () => {
    const turbo = readJson(join(ROOT, 'turbo.json')) as { remoteCache?: { enabled?: boolean } };
    assert.equal(turbo.remoteCache?.enabled, false);
  });
});
