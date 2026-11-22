import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import semver from 'semver';

import { CliError } from './errors.ts';
import type { RegistryPackage } from './registry.ts';
import { type BumpType, npmSatisfies, rewriteRange } from './versions.ts';
import {
  DEPENDENCY_FIELDS,
  type DependencyField,
  type PackageManifest,
  readManifest,
  type Workspace,
} from './workspace.ts';

/**
 * Dependencies update-deps never touches, with the reason it prints. Remove an entry once the reason is
 * gone: the report says when every package that has it as a peer accepts a newer version.
 */
export const HELD: ReadonlyMap<string, string> = new Map([
  ['typescript', 'typescript-eslint does not support a newer TypeScript yet'],
]);

/** One dependency line of one package.json. */
export interface DependencyEntry {
  /** posix folder from the repo root; "." is the root package.json */
  where: string;
  file: string;
  field: DependencyField;
  name: string;
  range: string;
  /** the version package-lock.json has for it there, if any */
  installed?: string;
}

export type LockPackages = Record<string, { version?: string }>;

/** The "packages" of package-lock.json; empty when there is none. */
export function readLockPackages(root: string): LockPackages {
  const file = join(root, 'package-lock.json');
  if (!existsSync(file)) {
    return {};
  }
  try {
    return (JSON.parse(readFileSync(file, 'utf8')) as { packages?: LockPackages }).packages ?? {};
  } catch (error) {
    throw new CliError(`package-lock.json is not valid JSON: ${(error as Error).message}`, {
      code: 'BAD_LOCKFILE',
      hint: 'A merge conflict? Resolve it (or run npm install), then try again.',
    });
  }
}

/** The version npm installed for `name` as seen from the folder `where` (nested copy first, then hoisted). */
export function installedVersion(
  packages: LockPackages,
  where: string,
  name: string,
): string | undefined {
  const nested = where === '.' ? undefined : packages[`${where}/node_modules/${name}`];
  return (nested ?? packages[`node_modules/${name}`])?.version;
}

/** Every dependency of the root package.json and of every workspace, in a stable order. */
export function collectEntries(ws: Workspace): DependencyEntry[] {
  const lock = readLockPackages(ws.root);
  const manifests: [string, string, PackageManifest][] = [
    ['.', join(ws.root, 'package.json'), readManifest(ws.root)],
    ...ws.packages.map((p): [string, string, PackageManifest] => [
      p.relDir,
      join(p.dir, 'package.json'),
      p.manifest,
    ]),
  ];
  return manifests.flatMap(([where, file, manifest]) =>
    DEPENDENCY_FIELDS.flatMap((field) =>
      Object.entries(manifest[field] ?? {}).map(([name, range]): DependencyEntry => {
        const installed = installedVersion(lock, where, name);
        return { where, file, field, name, range, ...(installed ? { installed } : {}) };
      }),
    ),
  );
}

/** The version a plain range starts at ("^1.2.3", "~1.2.3", "1.2.3" -> 1.2.3); null for any other range. */
export function plainBase(range: string): string | null {
  if (rewriteRange(range, '0.0.0') === null || semver.validRange(range) === null) {
    return null;
  }
  return semver.minVersion(range)?.version ?? null;
}

/**
 * Where an entry starts from: the installed version when it fits the range and is newer than the
 * range's start (^19.0.0 with 19.3.1 installed starts at 19.3.1, so --level patch never pins 19.0.x
 * and downgrades it); else the range's start. null for a range that is not plain.
 */
export function entryBase(entry: DependencyEntry): string | null {
  const floor = plainBase(entry.range);
  const { installed } = entry;
  if (
    floor !== null &&
    installed !== undefined &&
    semver.valid(installed) !== null &&
    npmSatisfies(installed, entry.range) &&
    semver.gt(installed, floor)
  ) {
    return installed;
  }
  return floor;
}

/**
 * Is `version` within `level` of `base`?
 * - patch: bug fixes only (what both ~ and ^ allow: 1.2.x, and 0.3.x for 0.3.1)
 * - minor: nothing breaking (what ^ allows: 1.x.x, and still 0.3.x for 0.3.1)
 * - major: anything
 */
export function inLevel(base: string, version: string, level: BumpType): boolean {
  if (level === 'major') {
    return true;
  }
  const options = { includePrerelease: true };
  const caret = semver.satisfies(version, `^${base}`, options);
  return level === 'minor' ? caret : caret && semver.satisfies(version, `~${base}`, options);
}

/** The smallest level that allows from -> to (0.3.1 -> 0.4.0 is major: it may break). */
export function levelOf(from: string, to: string): BumpType {
  if (inLevel(from, to, 'patch')) {
    return 'patch';
  }
  return inLevel(from, to, 'minor') ? 'minor' : 'major';
}

export interface PickOptions {
  /** the running Node.js version: versions whose engines.node leaves it out are skipped */
  node?: string;
  /** never above this version */
  max?: string;
  /** an extra condition, e.g. a peer range */
  accept?: (version: string) => boolean;
}

const releaseOf = (version: string) =>
  `${String(semver.major(version))}.${String(semver.minor(version))}.${String(semver.patch(version))}`;

const nodeAllowed = (node: string, range: string) =>
  semver.validRange(range, { loose: true }) === null ||
  semver.satisfies(node, range, { loose: true, includePrerelease: true });

/**
 * The newest version to move to from `base` within `level`, or null when there is none. Never a version
 * above the `latest` tag (a next or canary line is not a release yet), a deprecated one, a prerelease
 * (unless base is a prerelease of the same version) or one that needs another Node.js.
 */
export function pickVersion(
  info: RegistryPackage,
  base: string,
  level: BumpType,
  options: PickOptions = {},
): string | null {
  const latest = info.distTags.latest;
  const cap = latest !== undefined && semver.valid(latest) !== null ? latest : null;
  const baseRelease = semver.prerelease(base) === null ? null : releaseOf(base);
  let best: string | null = null;
  for (const version of info.versions) {
    if (semver.valid(version) === null || !semver.gt(version, base)) continue;
    if (best !== null && !semver.gt(version, best)) continue;
    if (semver.prerelease(version) !== null && releaseOf(version) !== baseRelease) continue;
    if (cap !== null && semver.gt(version, cap)) continue;
    if (options.max !== undefined && semver.gt(version, options.max)) continue;
    if (!inLevel(base, version, level)) continue;
    const details = info.details?.[version];
    if (details?.deprecated !== undefined) continue;
    const engine = details?.engines?.node;
    if (options.node !== undefined && engine !== undefined && !nodeAllowed(options.node, engine)) {
      continue;
    }
    if (options.accept && !options.accept(version)) continue;
    best = version;
  }
  return best;
}

/** How big a change is; "range" when the version is already installed and only the range catches up. */
export type ChangeKind = BumpType | 'range';

/** One package.json line that changes. */
export interface DependencyChange {
  entry: DependencyEntry;
  /** where it starts: the installed version, or the old range's start (entryBase) */
  from: string;
  to: string;
  /** the new range, in the old range's style */
  range: string;
  kind: ChangeKind;
}

export interface UpdatePlan {
  changes: DependencyChange[];
  /** dependencies left alone or held back, one line each */
  notes: string[];
  /** newer versions the chosen level leaves out ("eslint 11.0.0"); empty for major */
  outsideLevel: string[];
}

/** Where one dependency goes, for all package.json files that have it. */
interface Target {
  name: string;
  info: RegistryPackage;
  /** the highest version any package.json starts from */
  base: string;
  /** what the level allows */
  wanted: string;
  /** where it goes after the peer checks; base means it stays */
  target: string;
  /** held: never moves */
  fixed: boolean;
  /** why target is below wanted */
  limits: Set<string>;
}

const peersOf = (t: Target, version: string): Record<string, string> =>
  t.info.details?.[version]?.peerDependencies ?? {};

/**
 * Keeps peer dependencies working together. When a dependency's new version wants a peer range that
 * the peer's target misses, first an older peer that fits is taken (eslint stays on 10 while
 * typescript-eslint does not accept 11), else an older dependent whose peers all fit (a tsdown that
 * still takes the held TypeScript). Every move lowers a target and none goes below its base, so this
 * ends; a conflict that is already in the repo is left for npm install to report.
 */
function resolvePeers(targets: Map<string, Target>, level: BumpType, options: PickOptions): void {
  const all = [...targets.values()].sort((a, b) => a.name.localeCompare(b.name));
  const conflicts = (t: Target, version: string): [Target, string][] =>
    Object.entries(peersOf(t, version)).flatMap(([name, range]): [Target, string][] => {
      const peer = targets.get(name);
      return peer !== undefined && peer !== t && !npmSatisfies(peer.target, range)
        ? [[peer, range]]
        : [];
    });

  for (let round = 0; round < 1000; round += 1) {
    let moved = false;
    for (const dependent of all) {
      for (const [peer, range] of conflicts(dependent, dependent.target)) {
        const fits = (version: string) => npmSatisfies(version, range);
        if (!peer.fixed && peer.target !== peer.base) {
          const older =
            pickVersion(peer.info, peer.base, level, {
              ...options,
              max: peer.target,
              accept: fits,
            }) ?? (fits(peer.base) ? peer.base : null);
          if (older !== null) {
            peer.limits.add(`${dependent.name} ${dependent.target} wants ${peer.name} ${range}`);
            peer.target = older;
            moved = true;
            continue;
          }
        }
        if (!dependent.fixed && dependent.target !== dependent.base) {
          const current = dependent.target;
          const older =
            pickVersion(dependent.info, dependent.base, level, {
              ...options,
              max: current,
              accept: (v) => v !== current && conflicts(dependent, v).length === 0,
            }) ?? (conflicts(dependent, dependent.base).length === 0 ? dependent.base : null);
          if (older !== null) {
            dependent.limits.add(
              `${current} wants ${peer.name} ${range}, and ${peer.name} stays at ${peer.target}`,
            );
            dependent.target = older;
            moved = true;
            break;
          }
        }
      }
    }
    if (!moved) {
      return;
    }
  }
}

/** External dependencies with a plain range: the ones to look up on npm. */
export function namesToCheck(entries: DependencyEntry[], internal: ReadonlySet<string>): string[] {
  return [
    ...new Set(
      entries
        .filter((e) => !internal.has(e.name) && plainBase(e.range) !== null)
        .map((e) => e.name),
    ),
  ].sort();
}

const label = (where: string) => (where === '.' ? 'root' : where);

/**
 * What update-deps changes. One target per dependency for the whole repo (npm hoists it), checked
 * against the peer ranges of all the others; a package.json that starts lower than the rest moves within
 * its own level. Our own workspace packages are left to the release CLI.
 */
export function planUpdates(input: {
  entries: DependencyEntry[];
  internal: ReadonlySet<string>;
  registry: ReadonlyMap<string, RegistryPackage | null>;
  level: BumpType;
  node?: string;
}): UpdatePlan {
  const { entries, internal, registry, level } = input;
  const options: PickOptions = input.node === undefined ? {} : { node: input.node };
  const notes: string[] = [];
  const groups = new Map<string, { entry: DependencyEntry; base: string; floor: string }[]>();

  for (const entry of entries) {
    if (internal.has(entry.name)) continue;
    const base = entryBase(entry);
    const floor = plainBase(entry.range);
    if (base === null || floor === null) {
      notes.push(
        `${entry.name} "${entry.range}" (${label(entry.where)}): not a plain version range, left alone`,
      );
      continue;
    }
    groups.set(entry.name, [...(groups.get(entry.name) ?? []), { entry, base, floor }]);
  }

  const targets = new Map<string, Target>();
  for (const [name, group] of groups) {
    const info = registry.get(name) ?? null;
    if (info === null) {
      notes.push(`${name}: not on the npm registry, left alone`);
      continue;
    }
    const base = semver.rsort(group.map((g) => g.base))[0] ?? '0.0.0'; // a group is never empty
    const fixed = HELD.has(name);
    const wanted = fixed ? base : (pickVersion(info, base, level, options) ?? base);
    targets.set(name, { name, info, base, wanted, target: wanted, fixed, limits: new Set() });
  }

  resolvePeers(targets, level, options);

  const changes: DependencyChange[] = [];
  const outsideLevel: string[] = [];
  for (const t of [...targets.values()].sort((a, b) => a.name.localeCompare(b.name))) {
    if (t.fixed) {
      const newest = pickVersion(t.info, t.base, level, options);
      let note = `${t.name}: held (${HELD.get(t.name) ?? ''})`;
      if (newest !== null) {
        const blocking = [...targets.values()].flatMap((other) => {
          const range = peersOf(other, other.target)[t.name];
          return other !== t && range !== undefined && !npmSatisfies(newest, range)
            ? [`${other.name} ${other.target} wants ${range}`]
            : [];
        });
        note +=
          blocking.length > 0
            ? `; ${newest} is out, but ${blocking.join('; ')}`
            : `; ${newest} is out and every package that has it as a peer accepts it: remove the hold (HELD in scripts/packages/lib/dependencies.ts)`;
      }
      notes.push(note);
      continue;
    }
    if (t.target !== t.wanted) {
      notes.push(
        `${t.name}: ${t.wanted} is out, staying at ${t.target} (${[...t.limits].join('; ')})`,
      );
    }
    if (level !== 'major') {
      const newest = pickVersion(t.info, t.base, 'major', options);
      if (newest !== null && semver.gt(newest, t.wanted)) {
        outsideLevel.push(`${t.name} ${newest}`);
      }
    }
    // Every range moves up to its target, also when that version is installed already (^8.3.4 with
    // 8.3.5 installed becomes ^8.3.5), so each package.json says what the repo really runs.
    for (const { entry, base, floor } of groups.get(t.name) ?? []) {
      let to = t.target;
      if (!inLevel(base, to, level)) {
        to = pickVersion(t.info, base, level, { ...options, max: t.target }) ?? base;
      }
      if (!semver.gt(to, floor)) continue;
      changes.push({
        entry,
        from: base,
        to,
        range: rewriteRange(entry.range, to) ?? entry.range,
        kind: semver.gt(to, base) ? levelOf(base, to) : 'range',
      });
    }
  }
  return { changes, notes, outsideLevel };
}
