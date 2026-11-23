import { spawnSync } from 'node:child_process';

// Every path git tracks in the repository at `repoDir` (staged state), with `/` on every platform.
export function trackedFiles(repoDir: string): string[] {
  const result = spawnSync('git', ['ls-files', '-z'], { cwd: repoDir, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`git ls-files failed:\n${result.stderr}`);
  return result.stdout.split('\0').filter(Boolean);
}

// Whether git's ignore rules cover `path` (the file need not exist).
export function isIgnored(repoDir: string, path: string): boolean {
  return (
    spawnSync('git', ['check-ignore', '--quiet', '--no-index', path], { cwd: repoDir }).status === 0
  );
}
