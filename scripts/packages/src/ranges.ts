import { CliError } from './cli-error.ts';
import { compareVersions, parseVersion } from './utils/semver.ts';

// The dependency ranges between our own packages: an exact version, `~` or `^` (docs/tasks/
// 28-packages/TASK.md §4 rule 3). Any other form is refused rather than guessed at.
const RANGE = /^([\^~]?)(\d+\.\d+\.\d+)$/;

export function parseRange(range: string): { prefix: '' | '^' | '~'; base: string } {
  const match = RANGE.exec(range);
  if (!match) {
    throw new CliError(
      'RANGE_UNSUPPORTED',
      `The range "${range}" is not an exact version, ~ or ^.`,
      'Write the range of an own package as 1.2.3, ~1.2.3 or ^1.2.3, then run the command again.',
    );
  }
  return { prefix: match[1] as '' | '^' | '~', base: match[2] ?? '' };
}

// Whether `version` falls in `range` (npm's rules for these three forms).
export function satisfies(version: string, range: string): boolean {
  const { prefix, base } = parseRange(range);
  const [major = 0, minor = 0] = parseVersion(version) ?? [];
  const [baseMajor = 0, baseMinor = 0] = parseVersion(base) ?? [];
  if (prefix === '') return version === base;
  if (compareVersions(version, base) < 0) return false;
  if (prefix === '~') return major === baseMajor && minor === baseMinor;
  if (baseMajor > 0) return major === baseMajor;
  if (baseMinor > 0) return major === 0 && minor === baseMinor;
  return version === base;
}

// The same kind of range, pointing at `version`.
export function rangeFor(range: string, version: string): string {
  return `${parseRange(range).prefix}${version}`;
}
