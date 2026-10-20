import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

import semver from 'semver';

import { CATEGORIES, type Category, type Context } from './context.ts';
import { CliError } from './errors.ts';

export const DEPENDENCY_FIELDS = [
  'dependencies',
  'peerDependencies',
  'optionalDependencies',
  'devDependencies',
] as const;
export type DependencyField = (typeof DEPENDENCY_FIELDS)[number];

export interface PackageManifest {
  name: string;
  version: string;
  private?: boolean;
  description?: string;
  publishConfig?: { access?: string; tag?: string };
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  exports?: unknown;
  main?: string;
  module?: string;
  types?: string;
  typings?: string;
  style?: string;
  bin?: string | Record<string, string>;
  files?: string[];
  [key: string]: unknown;
}

export interface WorkspacePackage {
  name: string;
  version: string;
  dir: string;
  /** posix path from the repo root, e.g. packages/shared/utils */
  relDir: string;
  /** set for packages under packages/<category>/; apps and services have none */
  category: Category | null;
  /** folder name, e.g. utils */
  folder: string;
  private: boolean;
  /** under packages/ and not private: goes to npm */
  publishable: boolean;
  manifest: PackageManifest;
}

export interface Workspace {
  root: string;
  packages: WorkspacePackage[];
  byName: Map<string, WorkspacePackage>;
}

const toPosix = (p: string) => p.split(sep).join('/');

/** Expands the simple globs npm workspaces use here ("packages/*\/*", "frontend/*"). */
export function expandWorkspaceGlobs(root: string, patterns: string[]): string[] {
  const results = new Set<string>();
  for (const pattern of patterns) {
    let dirs = [root];
    for (const segment of pattern.split('/').filter(Boolean)) {
      const next: string[] = [];
      for (const dir of dirs) {
        if (segment === '*') {
          if (!existsSync(dir)) {
            continue;
          }
          for (const entry of readdirSync(dir, { withFileTypes: true })) {
            if (
              entry.isDirectory() &&
              !entry.name.startsWith('.') &&
              entry.name !== 'node_modules'
            ) {
              next.push(join(dir, entry.name));
            }
          }
        } else if (segment.includes('*')) {
          throw new CliError(
            `Workspace glob "${pattern}" is not supported (only whole "*" segments).`,
          );
        } else {
          next.push(join(dir, segment));
        }
      }
      dirs = next;
    }
    for (const dir of dirs) {
      if (existsSync(join(dir, 'package.json'))) {
        results.add(dir);
      }
    }
  }
  return [...results].sort();
}

export function readManifest(dir: string): PackageManifest {
  const file = join(dir, 'package.json');
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as PackageManifest;
  } catch (error) {
    throw new CliError(`Could not read ${file}: ${(error as Error).message}`, {
      code: 'BAD_MANIFEST',
    });
  }
}

export function expectedName(scope: string, category: Category, folder: string): string {
  return `${scope}/${category}-${folder}`;
}

/**
 * Reads every workspace and checks the package rules:
 * - packages live in packages/<shared|frontend|backend>/<folder>
 * - the name is <scope>/<category>-<folder>
 * - the version is valid semver
 * - public packages have publishConfig.access "public" (scoped packages are private on npm otherwise)
 */
export function loadWorkspace(ctx: Pick<Context, 'root' | 'scope'>): Workspace {
  const rootManifest = readManifest(ctx.root) as { workspaces?: string[] };
  const dirs = expandWorkspaceGlobs(ctx.root, rootManifest.workspaces ?? []);
  const problems: string[] = [];
  const packages: WorkspacePackage[] = [];

  for (const dir of dirs) {
    const manifest = readManifest(dir);
    const relDir = toPosix(relative(ctx.root, dir));
    const parts = relDir.split('/');
    const folder = parts.at(-1) ?? '';
    let category: Category | null = null;

    if (parts[0] === 'packages') {
      const candidate = parts[1] ?? '';
      if (parts.length !== 3 || !(CATEGORIES as readonly string[]).includes(candidate)) {
        problems.push(
          `${relDir}: packages must live in packages/<${CATEGORIES.join('|')}>/<name>.`,
        );
        continue;
      }
      category = candidate as Category;
      const expected = expectedName(ctx.scope, category, folder);
      if (manifest.name !== expected) {
        problems.push(`${relDir}: name is "${manifest.name}", expected "${expected}".`);
      }
    }
    if (typeof manifest.name !== 'string' || manifest.name === '') {
      problems.push(`${relDir}: package.json has no name.`);
      continue;
    }
    if (typeof manifest.version !== 'string' || !semver.valid(manifest.version)) {
      problems.push(`${relDir}: version ${JSON.stringify(manifest.version)} is not valid semver.`);
      continue;
    }
    const isPrivate = manifest.private === true;
    const publishable = category !== null && !isPrivate;
    if (publishable && manifest.publishConfig?.access !== 'public') {
      problems.push(
        `${relDir}: public packages need "publishConfig": { "access": "public" } (or "private": true).`,
      );
    }
    packages.push({
      name: manifest.name,
      version: manifest.version,
      dir,
      relDir,
      category,
      folder,
      private: isPrivate,
      publishable,
      manifest,
    });
  }

  const byName = new Map<string, WorkspacePackage>();
  for (const pkg of packages) {
    const existing = byName.get(pkg.name);
    if (existing) {
      problems.push(`${pkg.relDir}: name "${pkg.name}" is also used by ${existing.relDir}.`);
    }
    byName.set(pkg.name, pkg);
  }

  if (problems.length > 0) {
    throw new CliError(`The workspace has problems:\n  - ${problems.join('\n  - ')}`, {
      code: 'BAD_WORKSPACE',
    });
  }
  return { root: ctx.root, packages, byName };
}

/** Packages that can go to npm, in a stable order: category, then folder. */
export function publishablePackages(ws: Workspace): WorkspacePackage[] {
  const order = (c: Category | null) => (c ? CATEGORIES.indexOf(c) : 99);
  return ws.packages
    .filter((p) => p.publishable)
    .sort((a, b) => order(a.category) - order(b.category) || a.folder.localeCompare(b.folder));
}
