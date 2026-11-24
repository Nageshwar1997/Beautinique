import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { CliError } from './cli-error.ts';
import { confirm, type Ask } from './confirm.ts';
import type { Exec } from './exec.ts';
import type { Logger } from './logger.ts';
import { parseRange } from './ranges.ts';
import { fetchPackument } from './registry.ts';
import { compareVersions, parseVersion } from './utils/semver.ts';
import { discoverPackages, resolvePackage, type PackageInfo } from './workspace.ts';

export interface UpdateDepsOptions {
  root: string;
  registry: string;
  names: string[];
  /** The biggest step to take: patch, minor (the default) or major. */
  level: string | undefined;
  dryRun: boolean;
  ask: Ask;
  log: Logger;
  exec: Exec;
}

type Level = 'patch' | 'minor' | 'major';
const LEVELS: readonly string[] = ['patch', 'minor', 'major'];
const FIELDS = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];

interface Change {
  pkg: PackageInfo;
  dependency: string;
  /** The fields that hold the same range and move together (a peer dependency and its dev copy). */
  fields: string[];
  range: string;
  prefix: string;
  from: string;
  to: string;
}

// The highest plain version above `from` that the level allows.
function newest(versions: string[], from: string, level: Level): string | undefined {
  const [major = 0, minor = 0] = parseVersion(from) ?? [];
  return versions
    .filter((version) => {
      const parsed = parseVersion(version);
      if (!parsed || compareVersions(version, from) <= 0) return false;
      if (level === 'major') return true;
      if (parsed[0] !== major) return false;
      return level === 'minor' || parsed[1] === minor;
    })
    .sort(compareVersions)
    .at(-1);
}

function writeManifest(pkg: PackageInfo, manifest: Record<string, unknown>): void {
  writeFileSync(join(pkg.dir, 'package.json'), `${JSON.stringify(manifest, null, 2)}\n`);
}

// `update-deps`: newer versions of the packages' outside dependencies, by hand and on the spot
// (the monthly Dependabot PRs are the regular path). The plan is shown and "haan" asked. The new
// version is installed exactly first and the range then gets its own form back, so npm takes the
// very version the plan named. If the install fails or the run is stopped, every package.json and
// the lockfile are put back as they were (docs/tasks/28-packages/TASK.md §3.7).
export async function updateDeps(options: UpdateDepsOptions): Promise<number> {
  const { root, registry, names, dryRun, ask, log, exec } = options;
  const level = options.level ?? 'minor';
  if (!LEVELS.includes(level)) {
    throw new CliError(
      'UPDATE_LEVEL_INVALID',
      `"${level}" is not a level.`,
      'Use --level patch, minor or major.',
    );
  }
  const all = discoverPackages(root);
  const selected = names.length > 0 ? names.map((name) => resolvePackage(all, name)) : all;
  const own = new Set(all.map((pkg) => pkg.name));

  const changes: Change[] = [];
  const latest = new Map<string, string[]>();
  for (const pkg of selected) {
    const seen = new Set<string>();
    for (const field of FIELDS) {
      const section = (pkg.manifest[field] ?? {}) as Record<string, string>;
      for (const [dependency, range] of Object.entries(section)) {
        if (own.has(dependency) || seen.has(`${dependency}@${range}`)) continue;
        seen.add(`${dependency}@${range}`);
        let parsed: ReturnType<typeof parseRange>;
        try {
          parsed = parseRange(range);
        } catch {
          log.warn(
            `${pkg.name}: ${dependency} "${range}" is not an exact, ~ or ^ range; left alone.`,
          );
          continue;
        }
        if (!latest.has(dependency)) {
          latest.set(dependency, (await fetchPackument(registry, dependency))?.versions ?? []);
        }
        const to = newest(latest.get(dependency) ?? [], parsed.base, level as Level);
        if (to === undefined) continue;
        const fields = FIELDS.filter(
          (other) => ((pkg.manifest[other] ?? {}) as Record<string, string>)[dependency] === range,
        );
        changes.push({
          pkg,
          dependency,
          fields,
          range,
          prefix: parsed.prefix,
          from: parsed.base,
          to,
        });
      }
    }
  }
  if (changes.length === 0) {
    log.info(`Nothing to update at the ${level} level.`);
    return 0;
  }

  log.info('Updates:');
  for (const change of changes) {
    log.info(
      `  ${change.pkg.name}: ${change.dependency} ${change.range} -> ${change.prefix}${change.to} (${change.fields.join(', ')})`,
    );
  }
  if (dryRun) return 0;
  if (!(await confirm(ask, 'Write these ranges and install?'))) {
    log.info('Nothing was changed.');
    return 0;
  }

  const files = [...new Set(changes.map((change) => change.pkg))].map((pkg) =>
    join(pkg.dir, 'package.json'),
  );
  const lock = join(root, 'package-lock.json');
  const originals = new Map<string, string | undefined>(
    [...files, lock].map((path) => [
      path,
      existsSync(path) ? readFileSync(path, 'utf8') : undefined,
    ]),
  );
  const restore = () => {
    for (const [path, content] of originals)
      if (content !== undefined) writeFileSync(path, content);
  };
  const onInterrupt = () => {
    restore();
    process.exit(130);
  };
  process.once('SIGINT', onInterrupt);

  // The manifests of each package, written with exact versions first and own ranges after.
  const write = (exact: boolean) => {
    for (const pkg of new Set(changes.map((change) => change.pkg))) {
      const manifest = JSON.parse(JSON.stringify(pkg.manifest)) as Record<
        string,
        Record<string, string>
      >;
      for (const change of changes.filter((entry) => entry.pkg === pkg)) {
        for (const field of change.fields) {
          const section = manifest[field];
          if (section) section[change.dependency] = `${exact ? '' : change.prefix}${change.to}`;
        }
      }
      writeManifest(pkg, manifest);
    }
  };
  try {
    write(true);
    const install = exec('npm', ['install', '--ignore-scripts'], { cwd: root, inherit: true });
    if (install.status !== 0) {
      throw new CliError(
        'UPDATE_INSTALL_FAILED',
        `npm install failed (exit code ${String(install.status)}).`,
        'Every package.json and package-lock.json is back as it was. Read the output above, then try again.',
      );
    }
    write(false);
    const align = exec('npm', ['install', '--package-lock-only', '--ignore-scripts'], {
      cwd: root,
    });
    if (align.status !== 0) {
      throw new CliError(
        'UPDATE_INSTALL_FAILED',
        `Updating package-lock.json failed: ${align.stderr.trim()}`,
        'Every package.json and package-lock.json is back as it was.',
      );
    }
  } catch (error) {
    restore();
    throw error;
  } finally {
    process.removeListener('SIGINT', onInterrupt);
  }
  log.info(
    `Updated ${String(changes.length)} range(s). Run npm run packages:verify before committing.`,
  );
  return 0;
}
