import type { Logger } from './logger.ts';
import { fetchPackument } from './registry.ts';
import { highestVersion } from './utils/semver.ts';
import { discoverPackages, resolvePackage, type PackageInfo } from './workspace.ts';

// `published`: the repo's version is on npm. `pending`: the package is on npm but not this version.
// `new`: npm has never seen the package.
export type PackageState = 'published' | 'pending' | 'new';

export interface PackageStatus {
  pkg: PackageInfo;
  repoVersion: string;
  /** The highest version on npm; undefined for a new package. */
  npmVersion: string | undefined;
  state: PackageState;
}

export function repoVersion(pkg: PackageInfo): string {
  return typeof pkg.manifest.version === 'string' ? pkg.manifest.version : '0.0.0';
}

// Asks the registry about every package. A registry that does not answer is an error from
// `fetchPackument`: a package is never called "new" just because the question failed.
export async function packageStatuses(
  registry: string,
  packages: PackageInfo[],
): Promise<PackageStatus[]> {
  const statuses: PackageStatus[] = [];
  for (const pkg of packages) {
    const packument = await fetchPackument(registry, pkg.name);
    const version = repoVersion(pkg);
    const state: PackageState = !packument
      ? 'new'
      : packument.versions.includes(version)
        ? 'published'
        : 'pending';
    statuses.push({
      pkg,
      repoVersion: version,
      npmVersion: packument ? highestVersion(packument.versions) : undefined,
      state,
    });
  }
  return statuses;
}

const LABELS: Record<PackageState, string> = {
  published: 'published',
  pending: 'to publish',
  new: 'new',
};

// `status`: one table, a row for each package.
export async function status(options: {
  root: string;
  registry: string;
  names: string[];
  log: Logger;
}): Promise<number> {
  const { root, registry, names, log } = options;
  const all = discoverPackages(root);
  if (all.length === 0) {
    log.info('No packages yet.');
    return 0;
  }
  const selected = names.length > 0 ? names.map((name) => resolvePackage(all, name)) : all;
  const rows = (await packageStatuses(registry, selected)).map((row) => [
    row.pkg.name,
    row.repoVersion,
    row.npmVersion ?? '-',
    LABELS[row.state],
  ]);
  const table = [['package', 'repo', 'npm', 'state'], ...rows];
  const widths =
    table[0]?.map((_, i) => Math.max(...table.map((row) => row[i]?.length ?? 0))) ?? [];
  for (const row of table)
    log.info(
      row
        .map((cell, i) => cell.padEnd(widths[i] ?? 0))
        .join('  ')
        .trimEnd(),
    );
  return 0;
}
