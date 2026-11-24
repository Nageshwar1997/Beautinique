import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach } from 'vitest';

import { exec as realExec, type Exec } from '../../src/exec.ts';
import { FAKE_TOKEN, type FakeRegistry } from './fake-registry.ts';
import { fakeExec, type Call } from './fixture-repo.ts';

const scratch: string[] = [];
afterEach(() => {
  for (const dir of scratch.splice(0)) rmSync(dir, { recursive: true, force: true });
});

// The environment of the real `npm` and `git` in a test: npm talks to the fake registry only
// (token in a throwaway config, no retries, no update check), and git ignores the machine's own
// configuration, so the tests do not depend on whose laptop they run on.
export function realEnv(registry: FakeRegistry, loggedIn = true): Record<string, string> {
  const dir = mkdtempSync(join(tmpdir(), 'bq-npm-'));
  scratch.push(dir);
  const host = registry.url.replace(/^http:/, '');
  const npmrc = join(dir, 'npmrc');
  writeFileSync(npmrc, loggedIn ? `${host}/:_authToken=${FAKE_TOKEN}\n` : '');
  const gitConfig = join(dir, 'gitconfig');
  writeFileSync(gitConfig, '');
  mkdirSync(join(dir, 'cache'));
  return {
    npm_config_userconfig: npmrc,
    npm_config_globalconfig: join(dir, 'globalrc'),
    npm_config_cache: join(dir, 'cache'),
    npm_config_registry: registry.url,
    npm_config_fetch_retries: '0',
    npm_config_update_notifier: 'false',
    npm_config_fund: 'false',
    npm_config_audit: 'false',
    GIT_CONFIG_GLOBAL: gitConfig,
    GIT_CONFIG_NOSYSTEM: '1',
  };
}

// Real npm and git; Turborepo and the `npm pack --dry-run` file list are the fake ones (the fixture
// packages cannot be built here).
export function routedExec(root: string, env: Record<string, string>): { exec: Exec } {
  const { exec: fake } = fakeExec(root);
  const exec: Exec = (command, args, options) => {
    const isFake =
      command === 'turbo' ||
      (command === 'npm' && args.includes('--dry-run') && args[0] === 'pack');
    return (isFake ? fake : realExec)(command, args, {
      ...options,
      env: { ...env, ...options.env },
    });
  };
  return { exec };
}

export function git(dir: string, args: string[], env: Record<string, string>): string {
  const result = realExec('git', args, { cwd: dir, env });
  if (result.status !== 0) throw new Error(`git ${args.join(' ')}: ${result.stderr}`);
  return result.stdout.trim();
}

// Makes the fixture repo a git repository on `branch` with one commit.
export function initGit(root: string, env: Record<string, string>, branch = 'release'): void {
  writeFileSync(join(root, '.gitignore'), 'dist\nnode_modules\npublish-artifact\n');
  git(root, ['init', '-q', '-b', branch], env);
  git(root, ['add', '-A'], env);
  git(
    root,
    [
      '-c',
      'user.name=Test Owner',
      '-c',
      'user.email=owner@example.com',
      'commit',
      '-q',
      '-m',
      'init',
    ],
    env,
  );
}

// The owner's identity in the fixture repo (a laptop that has one).
export function setIdentity(root: string, env: Record<string, string>): void {
  git(root, ['config', 'user.name', 'Test Owner'], env);
  git(root, ['config', 'user.email', 'owner@example.com'], env);
}

// Real git; everything else (npm, Turborepo) is the fake one. For tests that only need git.
export function gitOnlyExec(
  root: string,
  env: Record<string, string>,
): { exec: Exec; calls: Call[] } {
  const { exec: fake, calls } = fakeExec(root);
  const exec: Exec = (command, args, options) =>
    command === 'git'
      ? realExec(command, args, { ...options, env: { ...env, ...options.env } })
      : fake(command, args, options);
  return { exec, calls };
}
