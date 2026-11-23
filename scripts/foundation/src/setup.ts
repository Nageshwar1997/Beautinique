// `npm run setup` on a new laptop (docs/OPERATIONS.md §1 rule 10). It runs before `npm ci` has
// installed anything, so this module and everything it imports use Node's own modules only.
import { spawnSync, type SpawnSyncOptions } from 'node:child_process';

import type { RootManifest } from './root-checks.ts';

export interface Versions {
  node: string;
  npm: string;
}

export function expectedVersions(manifest: RootManifest): Versions {
  return {
    node: manifest.devEngines?.runtime?.version ?? '',
    npm: manifest.devEngines?.packageManager?.version ?? '',
  };
}

// The running Node and npm must be the pinned ones (D-458); anything else stops setup before it
// installs or creates anything.
export function versionProblems(expected: Versions, actual: Versions): string[] {
  const problems: string[] = [];
  if (actual.node !== expected.node) {
    problems.push(
      `Node ${actual.node} is running, but this repository needs Node ${expected.node} ` +
        `(package.json devEngines). Install it, for example: nvm install ${expected.node} && ` +
        `nvm use ${expected.node}`,
    );
  }
  if (actual.npm !== expected.npm) {
    problems.push(
      `npm ${actual.npm} is running, but this repository needs npm ${expected.npm}. ` +
        `Install it: npm install --global npm@${expected.npm}`,
    );
  }
  return problems;
}

// npm itself: the one running this script when started through `npm run`, else the one on PATH
// (a shell on Windows, where npm is a .cmd file).
export function npm(args: string[], options: SpawnSyncOptions = {}) {
  const npmCli = process.env.npm_execpath;
  if (npmCli?.endsWith('.js')) {
    return spawnSync(process.execPath, [npmCli, ...args], { encoding: 'utf8', ...options });
  }
  return spawnSync('npm', args, {
    encoding: 'utf8',
    shell: process.platform === 'win32',
    ...options,
  });
}
