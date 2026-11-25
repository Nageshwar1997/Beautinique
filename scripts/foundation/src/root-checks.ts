import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { isIgnored } from './utils/git.ts';
import { readJson } from './utils/read-json.ts';

const EXACT_VERSION = /^\d+\.\d+\.\d+$/;

// The fields of the root package.json that the root checks read.
export interface RootManifest {
  engines?: { node?: string };
  devEngines?: {
    runtime?: { name?: string; version?: string };
    packageManager?: { name?: string; version?: string };
  };
  packageManager?: string;
  workspaces?: string[];
}

interface WorkspaceManifest {
  name?: string;
  private?: boolean;
}

// Node and npm are pinned once, in the root package.json: Render reads `engines`, npm and CI's
// setup-node read `devEngines`, Turborepo reads `packageManager`. All of them must name the same
// exact version, or the laptop, CI and live drift apart.
export function versionPinProblems(manifest: RootManifest): string[] {
  const problems: string[] = [];
  const node = manifest.devEngines?.runtime;
  const npm = manifest.devEngines?.packageManager;

  if (node?.name !== 'node' || !EXACT_VERSION.test(node.version ?? '')) {
    problems.push('devEngines.runtime must be node with an exact version (x.y.z)');
  }
  if (manifest.engines?.node !== node?.version) {
    problems.push('engines.node must equal devEngines.runtime.version');
  }
  if (npm?.name !== 'npm' || !EXACT_VERSION.test(npm.version ?? '')) {
    problems.push('devEngines.packageManager must be npm with an exact version (x.y.z)');
  }
  if (!npm?.version || manifest.packageManager !== `npm@${npm.version}`) {
    problems.push('packageManager must be npm@<devEngines.packageManager.version>');
  }
  return problems;
}

// Deployables (frontend/, backend/) and repo tools (scripts/) are never published, so each one is
// private. Every package under packages/ is public on npm (npm's free plan has no private packages),
// so none of them is.
export function workspacePrivacyProblems(rootDir: string): string[] {
  const problems: string[] = [];
  const check = (dir: string, mustBePrivate: boolean) => {
    const manifestPath = join(rootDir, dir, 'package.json');
    if (!existsSync(manifestPath)) return;
    const manifest = readJson(manifestPath) as WorkspaceManifest;
    if (mustBePrivate && manifest.private !== true) {
      problems.push(`${dir}: must have "private": true`);
    }
    if (!mustBePrivate && manifest.private === true) {
      problems.push(`${dir}: packages are public on npm, remove "private": true`);
    }
  };

  for (const area of ['frontend', 'backend', 'scripts']) {
    for (const name of subfolders(join(rootDir, area))) check(`${area}/${name}`, true);
  }
  for (const category of subfolders(join(rootDir, 'packages'))) {
    for (const name of subfolders(join(rootDir, 'packages', category))) {
      check(`packages/${category}/${name}`, false);
    }
  }
  return problems;
}

// The repository never holds two setups side by side, so no top-level `*-old/` folder is tracked
// (AC-FOUNDATION-11). Git paths use `/` on every platform.
export function oldCodeProblems(trackedPaths: string[]): string[] {
  const oldFolders = new Set(
    trackedPaths
      .filter((path) => path.includes('/'))
      .map((path) => path.slice(0, path.indexOf('/')))
      .filter((folder) => folder.endsWith('-old')),
  );
  return [...oldFolders]
    .sort()
    .map((folder) => `${folder}/: old code must not be in the repository`);
}

function subfolders(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

// The backup command's files (D-013, D-460) live in backups/, outside git: git ignores the folder,
// and a file of it that reaches git anyway is caught (AC-FOUNDATION-8).
export const BACKUP_DIR = 'backups';

export function backupProblems(trackedPaths: string[]): string[] {
  return trackedPaths
    .filter((path) => path.startsWith(`${BACKUP_DIR}/`))
    .map((path) => `${path}: backup files never go into git`);
}

export function backupIgnoreProblems(repoDir: string): string[] {
  const sample = `${BACKUP_DIR}/2026-01-01/manifest.json`;
  return isIgnored(repoDir, sample) ? [] : [`${BACKUP_DIR}/: git must ignore the whole folder`];
}

// Claude Code's own guards in .claude/settings.json (CLAUDE.md): no AI attribution, and no reading
// or editing of any env file, the backups or the All-ENVs folder through its file tools. A deny
// beats an allow, so `.env.example` too is left to the shell (D-460).
export const CLAUDE_SETTINGS = join('.claude', 'settings.json');
export const REQUIRED_DENY = [
  'Read(//**/.env)',
  'Read(//**/.env.*)',
  'Read(//**/All-ENVs/**)',
  'Read(//**/backups/**)',
  'Edit(//**/.env)',
  'Edit(//**/.env.*)',
  'Edit(//**/All-ENVs/**)',
  'Edit(//**/backups/**)',
];

export interface ClaudeSettings {
  attribution?: { commit?: unknown; pr?: unknown; sessionUrl?: unknown };
  permissions?: { deny?: unknown };
}

export function claudeSettingsProblems(settings: ClaudeSettings): string[] {
  const problems: string[] = [];
  const { attribution } = settings;
  if (attribution?.commit !== '' || attribution.pr !== '' || attribution.sessionUrl !== false) {
    problems.push('attribution must be { commit: "", pr: "", sessionUrl: false }');
  }
  const deny = Array.isArray(settings.permissions?.deny) ? settings.permissions.deny : [];
  for (const rule of REQUIRED_DENY) {
    if (!deny.includes(rule)) problems.push(`permissions.deny lacks ${rule}`);
  }
  return problems;
}
