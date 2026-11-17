import semver from 'semver';

import { CliError } from './errors.ts';

export const BUMP_TYPES = ['patch', 'minor', 'major'] as const;
export type BumpType = (typeof BUMP_TYPES)[number];

export function bump(version: string, type: BumpType): string {
  const next = semver.inc(version, type);
  if (!next) {
    throw new CliError(`Cannot bump "${version}" (${type}).`, { code: 'BAD_VERSION' });
  }
  return next;
}

/** The prerelease id ("beta" in 2.0.0-beta.1), or null for a normal version. */
export function prereleaseId(version: string): string | null {
  const pre = semver.prerelease(version);
  if (!pre) {
    return null;
  }
  return typeof pre[0] === 'string' ? pre[0] : 'next';
}

export function satisfies(version: string, range: string): boolean {
  return (
    semver.validRange(range) !== null &&
    semver.satisfies(version, range, { includePrerelease: true })
  );
}

/**
 * Points a dependency range at a new version, keeping its style:
 * "^1.2.0" -> "^2.0.0", "~1.2.0" -> "~1.3.0", "1.2.0" -> "1.3.0".
 * Anything else (workspace:, file:, *, latest, complex ranges) returns null: leave it alone.
 */
export function rewriteRange(range: string, version: string): string | null {
  const match = /^([~^]?)(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)$/.exec(range.trim());
  if (!match) {
    return null;
  }
  return `${match[1] ?? ''}${version}`;
}

/**
 * Does npm install `version` for `range`? Like npm's own resolver (no includePrerelease): a prerelease
 * only matches a range that names a prerelease of the same version.
 */
export function npmSatisfies(version: string, range: string): boolean {
  return (
    semver.validRange(range, { loose: true }) !== null &&
    semver.satisfies(version, range, { loose: true })
  );
}

/** Highest version in a list, or null. */
export function highest(versions: string[]): string | null {
  const valid = versions.filter((v) => semver.valid(v));
  return valid.length > 0 ? (semver.rsort([...valid])[0] ?? null) : null;
}

/** Highest normal (non-prerelease) version in a list, or null. */
export function highestStable(versions: string[]): string | null {
  return highest(versions.filter((v) => semver.valid(v) && semver.prerelease(v) === null));
}

export const gt = (a: string, b: string): boolean => semver.gt(a, b);
export const isValid = (v: string): boolean => semver.valid(v) !== null;

const RANK: Record<BumpType, number> = { patch: 0, minor: 1, major: 2 };
export const strongest = (a: BumpType, b: BumpType): BumpType => (RANK[a] >= RANK[b] ? a : b);
export const weaker = (a: BumpType, b: BumpType): boolean => RANK[a] < RANK[b];

/** How big a change from -> to is, as patch / minor / major (prereleases count as their target). */
export function changeKind(from: string, to: string): BumpType {
  const diff = semver.diff(from, to);
  if (diff === 'major' || diff === 'premajor') {
    return 'major';
  }
  if (diff === 'minor' || diff === 'preminor') {
    return 'minor';
  }
  return 'patch';
}

/**
 * The next version of a package released because of a dependency:
 * - already on a prerelease line (3.0.0-beta.1): continue it (3.0.0-beta.2), never graduate it;
 * - the dependency is a prerelease (id "beta"): a prerelease with that id (1.0.0 -> 1.0.1-beta.0);
 * - otherwise a normal bump.
 */
export function dependentVersion(current: string, kind: BumpType, preid: string | null): string {
  const own = prereleaseId(current);
  const next = own
    ? semver.inc(current, 'prerelease', own)
    : preid
      ? semver.inc(current, `pre${kind}`, preid)
      : semver.inc(current, kind);
  if (!next) {
    throw new CliError(`Cannot bump "${current}" (${kind}).`, { code: 'BAD_VERSION' });
  }
  return next;
}

/** patch, minor, major or prerelease between two versions (for the plan table). */
export function bumpKind(from: string, to: string): string {
  return semver.diff(from, to) ?? 'none';
}
