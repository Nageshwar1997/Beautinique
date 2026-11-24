import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

import { addEntry, changelogEntry, type Commit } from './changelog.ts';
import { CliError } from './cli-error.ts';
import { confirm, type Ask } from './confirm.ts';
import type { Exec } from './exec.ts';
import type { Logger } from './logger.ts';
import { rangeFor, satisfies } from './ranges.ts';
import { bumpVersion, highestVersion, type Bump } from './utils/semver.ts';
import { discoverPackages, resolvePackage, type PackageInfo } from './workspace.ts';

export interface RepublishOptions {
  root: string;
  names: string[];
  /** One bump for every chosen package; asked for each package when missing. */
  bump: string | undefined;
  dryRun: boolean;
  ask: Ask;
  log: Logger;
  exec: Exec;
  now: () => Date;
}

const BUMPS: readonly string[] = ['patch', 'minor', 'major'];
const DEPENDENCY_FIELDS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
] as const;
const REFUSED_BRANCHES = new Set(['', 'release', 'prerelease']);

interface Planned {
  pkg: PackageInfo;
  from: string;
  to: string;
  /** Why the version moves: the chosen bump, or the packages it depends on that moved. */
  reason: string;
  commits: Commit[];
  dependencyNotes: string[];
}

function git(exec: Exec, root: string, args: string[]): string {
  const result = exec('git', args, { cwd: root });
  return result.status === 0 ? result.stdout.trim() : '';
}

// The highest version tagged for a package, from tags `<name>@<version>`.
function lastTag(exec: Exec, root: string, name: string): string | undefined {
  const tags = git(exec, root, ['tag', '--list', `${name}@*`])
    .split(/\r?\n/)
    .filter(Boolean);
  const version = highestVersion(tags.map((tag) => tag.slice(name.length + 1)));
  return version === undefined ? undefined : `${name}@${version}`;
}

function commitsSince(exec: Exec, root: string, tag: string, pkg: PackageInfo): Commit[] {
  const folder = relative(root, pkg.dir).replaceAll('\\', '/');
  const subjects = git(exec, root, ['log', `${tag}..HEAD`, '--format=%s', '--', folder]);
  return subjects
    .split(/\r?\n/)
    .filter(Boolean)
    .map((subject) => ({ subject }));
}

function currentVersion(pkg: PackageInfo): string {
  return typeof pkg.manifest.version === 'string' ? pkg.manifest.version : '0.0.0';
}

function refusals(options: RepublishOptions): string[] {
  const { exec, root } = options;
  const problems: string[] = [];
  const branch = git(exec, root, ['branch', '--show-current']);
  if (REFUSED_BRANCHES.has(branch)) {
    problems.push(
      `The branch "${branch}" is not a work branch: republish runs on a branch made from origin/prerelease.`,
    );
  } else if (
    exec('git', ['merge-base', '--is-ancestor', 'origin/prerelease', 'HEAD'], { cwd: root })
      .status !== 0
  ) {
    problems.push(
      'The branch does not contain the latest origin/prerelease: fetch and rebase first.',
    );
  }
  if (git(exec, root, ['status', '--porcelain']) !== '') {
    problems.push('The working tree is not clean: commit or remove the changes first.');
  }
  if (
    git(exec, root, ['config', 'user.name']) === '' ||
    git(exec, root, ['config', 'user.email']) === ''
  ) {
    problems.push('No git identity: user.name and user.email must be set.');
  }
  return problems;
}

async function chooseBump(pkg: PackageInfo, options: RepublishOptions): Promise<Bump> {
  const answer =
    options.bump ??
    ((await options.ask(`Bump for ${pkg.name} (patch, minor, major) [patch]: `)).trim() || 'patch');
  if (!BUMPS.includes(answer)) {
    throw new CliError(
      'REPUBLISH_BUMP_INVALID',
      `"${answer}" is not a bump for ${pkg.name}.`,
      'Use patch, minor or major.',
    );
  }
  return answer as Bump;
}

// `republish`: new versions for packages that are already out, as one commit on a work branch
// (docs/tasks/28-packages/TASK.md §3.5). Nothing is published here.
export async function republish(options: RepublishOptions): Promise<number> {
  const { root, names, dryRun, ask, log, exec, now } = options;
  const problems = refusals(options);
  if (problems.length > 0) {
    throw new CliError(
      'REPUBLISH_NOT_READY',
      `Nothing was changed:\n${problems.map((problem) => `  - ${problem}`).join('\n')}`,
      'Fix each point above, then run republish again.',
    );
  }

  const all = discoverPackages(root);
  const tags = new Map(all.map((pkg) => [pkg.name, lastTag(exec, root, pkg.name)]));
  const commits = new Map<string, Commit[]>();
  for (const pkg of all) {
    const tag = tags.get(pkg.name);
    if (tag !== undefined) commits.set(pkg.name, commitsSince(exec, root, tag, pkg));
  }

  let chosen: PackageInfo[];
  if (names.length > 0) {
    chosen = names.map((name) => resolvePackage(all, name));
    for (const pkg of chosen) {
      if (!tags.get(pkg.name)) {
        throw new CliError(
          'REPUBLISH_NOT_PUBLISHED',
          `${pkg.name} has no release tag, so it has not been published from here.`,
          'A package that is not out yet is published with its own version (fetch the tags with git fetch --tags if they are missing).',
        );
      }
    }
  } else {
    chosen = all.filter((pkg) => (commits.get(pkg.name)?.length ?? 0) > 0);
  }
  if (chosen.length === 0) {
    log.info('No package changed since its last release tag.');
    return 0;
  }

  const planned = new Map<string, Planned>();
  const plan = (pkg: PackageInfo, to: string, reason: string): Planned => {
    const entry: Planned = {
      pkg,
      from: currentVersion(pkg),
      to,
      reason,
      commits: commits.get(pkg.name) ?? [],
      dependencyNotes: [],
    };
    planned.set(pkg.name, entry);
    return entry;
  };
  for (const pkg of chosen) {
    const bump = await chooseBump(pkg, options);
    plan(pkg, bumpVersion(currentVersion(pkg), bump), bump);
  }

  // Packages that depend on a package that moved: a range that no longer takes the new version
  // is moved to it (same kind of range), and the dependent gets a patch version.
  const rewrites = new Map<string, Map<string, Map<string, string>>>();
  const queue = [...planned.values()];
  while (queue.length > 0) {
    const moved = queue.shift();
    if (!moved) break;
    for (const dependent of all.filter((pkg) => pkg.internalDeps.includes(moved.pkg.name))) {
      for (const field of DEPENDENCY_FIELDS) {
        const section = dependent.manifest[field] as Record<string, string> | undefined;
        const range = section?.[moved.pkg.name];
        if (range === undefined || satisfies(moved.to, range)) continue;
        const forDependent = rewrites.get(dependent.name) ?? new Map<string, Map<string, string>>();
        const fields = forDependent.get(field) ?? new Map<string, string>();
        fields.set(moved.pkg.name, rangeFor(range, moved.to));
        forDependent.set(field, fields);
        rewrites.set(dependent.name, forDependent);
        const note = `${moved.pkg.name} ${rangeFor(range, moved.to)}`;
        const existing = planned.get(dependent.name);
        if (existing) {
          if (!existing.dependencyNotes.includes(note)) existing.dependencyNotes.push(note);
        } else {
          const entry = plan(
            dependent,
            bumpVersion(currentVersion(dependent), 'patch'),
            `uses ${moved.pkg.name}`,
          );
          entry.dependencyNotes.push(note);
          if (tags.get(dependent.name) === undefined) entry.to = entry.from;
          queue.push(entry);
        }
      }
    }
  }

  log.info('Versions:');
  for (const entry of planned.values()) {
    log.info(`  ${entry.pkg.name}: ${entry.from} -> ${entry.to} (${entry.reason})`);
  }
  if (dryRun) return 0;
  if (!(await confirm(ask, 'Write these versions, the CHANGELOGs and the lockfile, and commit?'))) {
    log.info('Nothing was changed.');
    return 0;
  }

  // Everything is worked out in memory first, so a failure leaves the files as they were.
  const date = now().toISOString().slice(0, 10);
  const originals = new Map<string, string | undefined>();
  const writes = new Map<string, string>();
  for (const entry of planned.values()) {
    const manifest = JSON.parse(JSON.stringify(entry.pkg.manifest)) as Record<string, unknown>;
    manifest.version = entry.to;
    for (const [field, deps] of rewrites.get(entry.pkg.name) ?? []) {
      const section = manifest[field] as Record<string, string>;
      for (const [name, range] of deps) section[name] = range;
    }
    writes.set(join(entry.pkg.dir, 'package.json'), `${JSON.stringify(manifest, null, 2)}\n`);
    const changelogPath = join(entry.pkg.dir, 'CHANGELOG.md');
    const changelog = existsSync(changelogPath)
      ? readFileSync(changelogPath, 'utf8')
      : `# Changelog: ${entry.pkg.name}\n`;
    const notes = entry.dependencyNotes.map((note) => `Updated ${note}`);
    writes.set(
      changelogPath,
      addEntry(changelog, changelogEntry(entry.to, date, entry.commits, notes)),
    );
  }
  const lockPath = join(root, 'package-lock.json');
  for (const path of [...writes.keys(), lockPath]) {
    originals.set(path, existsSync(path) ? readFileSync(path, 'utf8') : undefined);
  }
  const restore = () => {
    for (const [path, content] of originals)
      if (content !== undefined) writeFileSync(path, content);
  };
  for (const [path, content] of writes) writeFileSync(path, content);
  const lock = exec('npm', ['install', '--package-lock-only', '--ignore-scripts'], { cwd: root });
  if (lock.status !== 0) {
    restore();
    throw new CliError(
      'REPUBLISH_LOCK_FAILED',
      `Updating package-lock.json failed: ${lock.stderr.trim()}`,
      'The files are back as they were. Fix the problem above, then run republish again.',
    );
  }

  const paths = [...writes.keys(), ...(existsSync(lockPath) ? [lockPath] : [])].map((path) =>
    relative(root, path).replaceAll('\\', '/'),
  );
  exec('git', ['add', '--', ...paths], { cwd: root });
  const summary = [...planned.values()].map((entry) => `${entry.pkg.name} ${entry.to}`);
  const message = `chore(release): republish ${summary.join(', ')}\n\n${[...planned.values()]
    .map((entry) => `- ${entry.pkg.name}: ${entry.from} -> ${entry.to} (${entry.reason})`)
    .join('\n')}\n`;
  const commit = exec('git', ['commit', '-F', '-'], { cwd: root, input: message });
  if (commit.status !== 0) {
    throw new CliError(
      'REPUBLISH_COMMIT_FAILED',
      `git commit failed: ${commit.stderr.trim()}`,
      'The files are changed and staged; fix the problem, then commit them or undo the changes.',
    );
  }
  log.info(
    `Committed ${String(planned.size)} version(s) on this branch. Open a PR into prerelease, then release.`,
  );
  return 0;
}
