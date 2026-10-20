import type { Context } from './context.ts';
import { CliError } from './errors.ts';
import { highest } from './versions.ts';

async function git(ctx: Context, args: string[]): Promise<string> {
  const res = await ctx.run('git', args, { cwd: ctx.root });
  if (res.code !== 0) {
    throw new CliError(`git ${args[0] ?? ''} failed: ${res.stderr.trim() || res.stdout.trim()}`, {
      code: 'GIT_FAILED',
    });
  }
  return res.stdout;
}

/** Paths with uncommitted changes (staged, unstaged or untracked). */
export async function dirtyFiles(ctx: Context): Promise<string[]> {
  const out = await git(ctx, ['status', '--porcelain=v1', '--untracked-files=all']);
  return out
    .split('\n')
    .filter((l) => l.trim() !== '')
    .map((l) => l.slice(3).replace(/^"|"$/g, ''));
}

export async function currentBranch(ctx: Context): Promise<string> {
  return (await git(ctx, ['rev-parse', '--abbrev-ref', 'HEAD'])).trim();
}

/** Releases are made from committed code only. */
export async function requireCleanTree(ctx: Context): Promise<void> {
  const dirty = await dirtyFiles(ctx);
  if (dirty.length > 0) {
    const shown = dirty
      .slice(0, 10)
      .map((f) => `    ${f}`)
      .join('\n');
    const more = dirty.length > 10 ? `\n    ... and ${String(dirty.length - 10)} more` : '';
    throw new CliError(`The working tree has uncommitted changes:\n${shown}${more}`, {
      code: 'DIRTY_TREE',
      hint: 'Commit or stash them first, so every published version matches a commit.',
    });
  }
}

export async function requireIdentity(ctx: Context): Promise<void> {
  for (const key of ['user.name', 'user.email']) {
    const res = await ctx.run('git', ['config', key], { cwd: ctx.root });
    if (res.code !== 0 || res.stdout.trim() === '') {
      throw new CliError(`git ${key} is not set, so the release commit cannot be made.`, {
        code: 'NO_GIT_IDENTITY',
        hint: `Run: git config --global ${key} "<your value>"`,
      });
    }
  }
}

export async function commit(ctx: Context, files: string[], message: string): Promise<void> {
  if (files.length === 0) {
    return;
  }
  await git(ctx, ['add', '--', ...files]);
  await git(ctx, ['commit', '-m', message, '--', ...files]);
}

export async function tagExists(ctx: Context, tag: string): Promise<boolean> {
  return (await git(ctx, ['tag', '--list', tag])).trim() !== '';
}

/** Annotated tag on HEAD, e.g. @beautinique/shared-utils@1.2.0. */
export async function createTag(ctx: Context, tag: string, message: string): Promise<void> {
  await git(ctx, ['tag', '-a', tag, '-m', message]);
}

/**
 * The newest release tag of a package by semver (git's own version sort puts 2.0.0-beta.0 above 2.0.0),
 * e.g. "@beautinique/shared-utils@1.1.0", or null.
 */
export async function lastTag(ctx: Context, packageName: string): Promise<string | null> {
  const out = await git(ctx, ['tag', '--list', `${packageName}@*`]);
  const prefix = `${packageName}@`;
  const versions = out
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith(prefix))
    .map((l) => l.slice(prefix.length));
  const newest = highest(versions);
  return newest === null ? null : `${prefix}${newest}`;
}

/** The release branch: releases are made from it only (never a feature branch or a detached HEAD). */
export const RELEASE_BRANCH = 'main';

export async function requireReleaseBranch(ctx: Context): Promise<void> {
  const branch = await currentBranch(ctx);
  if (branch !== RELEASE_BRANCH) {
    throw new CliError(
      branch === 'HEAD'
        ? 'HEAD is detached; releases are made from a branch.'
        : `You are on "${branch}"; releases are made from "${RELEASE_BRANCH}" only.`,
      { code: 'WRONG_BRANCH', hint: `git switch ${RELEASE_BRANCH} (and merge your work first).` },
    );
  }
}

/** The commit a tag points at, or null if the tag does not exist. */
export async function tagCommit(ctx: Context, tag: string): Promise<string | null> {
  const res = await ctx.run(
    'git',
    ['rev-parse', '--verify', '--quiet', `refs/tags/${tag}^{commit}`],
    { cwd: ctx.root },
  );
  return res.code === 0 ? res.stdout.trim() : null;
}

export async function headCommit(ctx: Context): Promise<string> {
  return (await git(ctx, ['rev-parse', 'HEAD'])).trim();
}

export interface CommitInfo {
  hash: string;
  subject: string;
}

/** Commits touching `path` since `since` (a tag), newest first. */
export async function commitsSince(
  ctx: Context,
  since: string | null,
  path: string,
): Promise<CommitInfo[]> {
  const range = since ? [`${since}..HEAD`] : [];
  const out = await git(ctx, ['log', '--format=%h%x1f%s', ...range, '--', path]);
  return out
    .split('\n')
    .filter((l) => l.includes('\x1f'))
    .map((l) => {
      const [hash = '', subject = ''] = l.split('\x1f');
      return { hash, subject };
    });
}
