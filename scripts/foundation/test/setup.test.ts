import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterAll, describe, test } from 'vitest';

import { ROOT } from '../src/constants/paths.ts';
import type { RootManifest } from '../src/root-checks.ts';
import { expectedVersions, versionProblems } from '../src/setup.ts';
import { readJson } from '../src/utils/read-json.ts';
import { cleanEnv } from './utils/env.ts';

const manifest = readJson(join(ROOT, 'package.json')) as RootManifest;
const pinned = expectedVersions(manifest);

describe('npm run setup: versions', () => {
  test('the expected versions are the pins in package.json', () => {
    assert.deepEqual(pinned, {
      node: manifest.devEngines?.runtime?.version,
      npm: manifest.devEngines?.packageManager?.version,
    });
  });

  test('AC-FOUNDATION-1: a different Node or npm is named, with the fix', () => {
    assert.deepEqual(versionProblems(pinned, pinned), []);
    const [node, npm] = versionProblems(pinned, { node: '24.21.0', npm: '11.6.0' });
    assert.match(node ?? '', new RegExp(`Node 24\\.21\\.0 is running.*needs Node ${pinned.node}`));
    assert.match(node ?? '', new RegExp(`nvm install ${pinned.node}`));
    assert.match(npm ?? '', new RegExp(`npm 11\\.6\\.0 is running.*needs npm ${pinned.npm}`));
  });

  const dirs: string[] = [];
  afterAll(() => {
    for (const dir of dirs) rmSync(dir, { recursive: true, force: true });
  });

  test('AC-FOUNDATION-1: on the wrong Node, setup stops before it installs or creates anything', () => {
    // A copy of the setup tool in a root that pins a Node nobody runs.
    const root = mkdtempSync(join(tmpdir(), 'bq-setup-version-'));
    dirs.push(root);
    cpSync(join(ROOT, 'scripts', 'foundation', 'bin'), join(root, 'scripts/foundation/bin'), {
      recursive: true,
    });
    cpSync(join(ROOT, 'scripts', 'foundation', 'src'), join(root, 'scripts/foundation/src'), {
      recursive: true,
    });
    writeFileSync(
      join(root, 'package.json'),
      JSON.stringify({
        devEngines: {
          runtime: { name: 'node', version: '1.0.0' },
          packageManager: { name: 'npm', version: pinned.npm },
        },
      }),
    );

    const result = spawnSync(process.execPath, [join(root, 'scripts/foundation/bin/setup.ts')], {
      cwd: root,
      encoding: 'utf8',
      env: cleanEnv(),
    });
    assert.equal(result.status, 1, `${result.stdout}\n${result.stderr}`);
    assert.match(
      result.stderr,
      /Setup stopped: Node \S+ is running, but this repository needs Node 1\.0\.0/,
    );
    assert.ok(!existsSync(join(root, 'node_modules')), 'npm ci must not have run');
    assert.ok(!existsSync(join(root, 'package-lock.json')));
  }, 60_000);
});
