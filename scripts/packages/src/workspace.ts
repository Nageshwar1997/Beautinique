import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { CliError } from './cli-error.ts';
import { readJson } from './utils/read-json.ts';

// packages/<category>/<name>/ (D-002).
export const CATEGORIES = ['shared', 'frontend', 'backend'] as const;
export type Category = (typeof CATEGORIES)[number];
export const SCOPE = '@beautinique/';

const DEPENDENCY_FIELDS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
] as const;

export interface PackageInfo {
  /** `@beautinique/<category>-<name>`. */
  name: string;
  category: Category;
  /** The folder name, `money` in packages/shared/money. */
  folder: string;
  dir: string;
  manifest: Record<string, unknown>;
  /** Names of the repo's own packages this one needs, any kind of dependency. */
  internalDeps: string[];
}

function dependencyNames(manifest: Record<string, unknown>): string[] {
  const names: string[] = [];
  for (const field of DEPENDENCY_FIELDS) {
    const value = manifest[field];
    if (typeof value === 'object' && value !== null) names.push(...Object.keys(value));
  }
  return names;
}

// Every package under packages/, with its dependencies on the others. A manifest that cannot be
// read stops the whole run: building around a broken package would hide it.
export function discoverPackages(root: string): PackageInfo[] {
  const found: Omit<PackageInfo, 'internalDeps'>[] = [];
  for (const category of CATEGORIES) {
    const categoryDir = join(root, 'packages', category);
    if (!existsSync(categoryDir)) continue;
    for (const entry of readdirSync(categoryDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const dir = join(categoryDir, entry.name);
      const manifestPath = join(dir, 'package.json');
      if (!existsSync(manifestPath)) continue;
      let manifest: unknown;
      try {
        manifest = readJson(manifestPath);
      } catch (error) {
        throw new CliError(
          'PACKAGE_JSON_UNREADABLE',
          `${manifestPath} cannot be read: ${(error as Error).message}`,
          'Fix the JSON in that package.json, then run the command again.',
        );
      }
      const record =
        typeof manifest === 'object' && manifest !== null
          ? (manifest as Record<string, unknown>)
          : {};
      if (typeof record.name !== 'string' || !record.name.startsWith(SCOPE)) {
        throw new CliError(
          'PACKAGE_NAME_INVALID',
          `${manifestPath} has no name starting with ${SCOPE}.`,
          `Name it ${SCOPE}${category}-${entry.name} (docs/tasks/28-packages/TASK.md §4 rule 1).`,
        );
      }
      found.push({ name: record.name, category, folder: entry.name, dir, manifest: record });
    }
  }
  const names = new Set(found.map((pkg) => pkg.name));
  return found
    .map((pkg) => ({
      ...pkg,
      internalDeps: dependencyNames(pkg.manifest).filter(
        (dep) => names.has(dep) && dep !== pkg.name,
      ),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

// `@beautinique/shared-money` or just `shared-money`.
export function resolvePackage(all: PackageInfo[], input: string): PackageInfo {
  const full = input.startsWith(SCOPE) ? input : `${SCOPE}${input}`;
  const match = all.find((pkg) => pkg.name === full);
  if (!match) {
    throw new CliError(
      'PACKAGE_UNKNOWN',
      `No package named ${input}.`,
      all.length > 0
        ? `Packages: ${all.map((pkg) => pkg.name).join(', ')}.`
        : 'There are no packages yet; create one first.',
    );
  }
  return match;
}

// The packages to build, in the order that works: each one after everything it needs. With
// `selected` only those and what they need; a cycle stops with the packages in it named.
export function buildOrder(all: PackageInfo[], selected: PackageInfo[] = all): PackageInfo[] {
  const byName = new Map(all.map((pkg) => [pkg.name, pkg]));
  const order: PackageInfo[] = [];
  const done = new Set<string>();
  const path: string[] = [];

  const visit = (pkg: PackageInfo): void => {
    if (done.has(pkg.name)) return;
    const at = path.indexOf(pkg.name);
    if (at !== -1) {
      const cycle = [...path.slice(at), pkg.name].join(' -> ');
      throw new CliError(
        'PACKAGES_CYCLE',
        `Packages depend on each other in a circle: ${cycle}.`,
        'Break the circle: move what both need into a third package, or drop one dependency.',
      );
    }
    path.push(pkg.name);
    for (const dep of pkg.internalDeps) {
      const next = byName.get(dep);
      if (next) visit(next);
    }
    path.pop();
    done.add(pkg.name);
    order.push(pkg);
  };

  for (const pkg of selected) visit(pkg);
  return order;
}
