// Plain `major.minor.patch` versions only: prerelease versions are the owner's call and are
// left out (docs/tasks/28-packages/TASK.md §2).
export type Bump = 'patch' | 'minor' | 'major';

const PLAIN = /^(\d+)\.(\d+)\.(\d+)$/;

export function parseVersion(version: string): [number, number, number] | undefined {
  const match = PLAIN.exec(version);
  if (!match) return undefined;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

export function compareVersions(a: string, b: string): number {
  const left = parseVersion(a) ?? [0, 0, 0];
  const right = parseVersion(b) ?? [0, 0, 0];
  for (let i = 0; i < 3; i += 1) {
    const diff = (left[i] ?? 0) - (right[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

export function highestVersion(versions: string[]): string | undefined {
  return versions
    .filter((version) => parseVersion(version) !== undefined)
    .sort(compareVersions)
    .at(-1);
}

export function bumpVersion(version: string, bump: Bump): string {
  const [major = 0, minor = 0, patch = 0] = parseVersion(version) ?? [];
  if (bump === 'major') return `${String(major + 1)}.0.0`;
  if (bump === 'minor') return `${String(major)}.${String(minor + 1)}.0`;
  return `${String(major)}.${String(minor)}.${String(patch + 1)}`;
}
