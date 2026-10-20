/**
 * End to end: the real CLI entry points, the real npm and git, against a throwaway monorepo and a
 * fake registry. Nothing touches npmjs.com or the Beautinique repository.
 */
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { type FixturePackage, makeRepo, privatePackage, publicPackage } from './helpers.ts';
import { type FakeRegistry, startRegistry } from './registry-server.ts';

const BIN = join(import.meta.dirname, '..', 'bin');
const PUBLISH_TARBALLS = join(
  import.meta.dirname,
  '..',
  '..',
  '..',
  '.github',
  'scripts',
  'publish-tarballs.mjs',
);

let registry: FakeRegistry;
let repo: ReturnType<typeof makeRepo>;
let userconfig: string;
const cleanups: (() => void)[] = [];

beforeAll(async () => {
  registry = await startRegistry();
});
afterAll(async () => {
  await registry.close();
});

const git = (...args: string[]) => {
  const res = spawnSync('git', args, { cwd: repo.root, encoding: 'utf8' });
  if (res.status !== 0) {
    throw new Error(`git ${args.join(' ')}: ${res.stderr}`);
  }
  return res.stdout.trim();
};

function setup(packages: FixturePackage[]) {
  registry.versions.clear();
  registry.distTags.clear();
  registry.failPublish.clear();
  registry.whoamiLimit = Infinity;
  registry.published.length = 0;
  repo = makeRepo(packages);
  cleanups.push(repo.cleanup);
  repo.write('.gitignore', 'node_modules\n');
  userconfig = join(repo.root, '..', `${repo.root.split(/[\\/]/).pop() ?? 'x'}.npmrc`);
  const host = registry.url.replace(/^http:/, '');
  writeFileSync(userconfig, `registry=${registry.url}\n${host}:_authToken=${registry.token}\n`);
  git('init', '-q', '-b', 'release');
  git('config', 'user.name', 'Test');
  git('config', 'user.email', 'test@example.test');
  git('config', 'commit.gpgsign', 'false');
  git('add', '-A');
  git('commit', '-q', '-m', 'feat: initial packages');
}

/**
 * Runs a script with the fixture's npm config. Async on purpose: the fake registry lives in this
 * process and must keep answering. GITHUB_ACTIONS is cleared (these tests may run in GitHub CI).
 */
function run(
  script: string,
  args: string[],
  env: Record<string, string> = {},
): Promise<{ code: number | null; out: string }> {
  const base = { ...process.env };
  delete base.GITHUB_ACTIONS;
  const child = spawn(process.execPath, [script, ...args], {
    cwd: repo.root,
    env: {
      ...base,
      BEAUTINIQUE_ROOT: repo.root,
      BEAUTINIQUE_REGISTRY: registry.url,
      NPM_CONFIG_USERCONFIG: userconfig,
      NO_COLOR: '1',
      FORCE_COLOR: '0',
      ...env,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let out = '';
  const collect = (chunk: Buffer) => {
    out += chunk.toString();
  };
  child.stdout.on('data', collect);
  child.stderr.on('data', collect);
  return new Promise((resolve) => {
    child.on('close', (code) => {
      resolve({ code, out });
    });
  });
}

const cli = (command: string, ...args: string[]) => run(join(BIN, `${command}.ts`), args);

const manifest = (dir: string) =>
  JSON.parse(readFileSync(join(repo.root, dir, 'package.json'), 'utf8')) as Record<
    string,
    Record<string, string> | string
  >;

/** shared-a <- frontend-b (dependency), backend-c (peer), backend-d (private) */
const family = () => [
  publicPackage('shared', 'a', '1.0.0'),
  publicPackage('frontend', 'b', '1.0.0', { dependencies: { '@beautinique/shared-a': '^1.0.0' } }),
  publicPackage('backend', 'c', '1.0.0', {
    peerDependencies: { '@beautinique/shared-a': '^1.0.0' },
  }),
  privatePackage('packages/backend/d', '@beautinique/backend-d', {
    dependencies: { '@beautinique/shared-a': '^1.0.0' },
  }),
];

describe('package CLI end to end', () => {
  beforeEach(() => {
    cleanups.splice(0).forEach((cleanup) => {
      cleanup();
    });
  });

  it('publishes new packages dependencies first, then republishes with dependents', async () => {
    setup(family());

    const first = await cli('publish', '--all', '--yes');
    expect(first.out).toContain('Summary');
    expect(first.code).toBe(0);
    expect(registry.published).toEqual([
      '@beautinique/shared-a@1.0.0',
      '@beautinique/frontend-b@1.0.0',
      '@beautinique/backend-c@1.0.0',
    ]);
    expect(git('tag', '--list').split('\n').sort()).toEqual([
      '@beautinique/backend-c@1.0.0',
      '@beautinique/frontend-b@1.0.0',
      '@beautinique/shared-a@1.0.0',
    ]);
    expect(readFileSync(join(repo.root, 'packages/shared/a/CHANGELOG.md'), 'utf8')).toContain(
      '## 1.0.0 (',
    );
    expect(git('status', '--porcelain')).toBe('');

    const second = await cli(
      'republish',
      '--packages',
      'shared-a',
      '--bump',
      'major',
      '--cascade',
      'yes',
      '--target',
      'laptop',
      '--yes',
    );
    expect(second.out).toContain('Release plan');
    expect(second.code).toBe(0);
    expect(registry.published.slice(3)).toEqual([
      '@beautinique/shared-a@2.0.0',
      '@beautinique/frontend-b@1.0.1',
      '@beautinique/backend-c@2.0.0',
    ]);
    expect(manifest('packages/frontend/b').dependencies).toEqual({
      '@beautinique/shared-a': '^2.0.0',
    });
    expect(manifest('packages/backend/c').peerDependencies).toEqual({
      '@beautinique/shared-a': '^2.0.0',
    });
    expect(manifest('packages/backend/d')).toMatchObject({
      version: '1.0.0',
      dependencies: { '@beautinique/shared-a': '^2.0.0' },
    });
    expect(readFileSync(join(repo.root, 'packages/frontend/b/CHANGELOG.md'), 'utf8')).toContain(
      '- @beautinique/shared-a ^2.0.0',
    );
    expect(git('log', '-1', '--format=%s')).toBe('chore(release): publish packages');
    expect(git('status', '--porcelain')).toBe('');
    expect(git('tag', '--list', '*@2.0.0').split('\n').sort()).toEqual([
      '@beautinique/backend-c@2.0.0',
      '@beautinique/shared-a@2.0.0',
    ]);

    const status = await cli('status');
    expect(status.code).toBe(0);
    expect(status.out).toContain('4 packages: 3 published, 1 private');
    expect(status.out).toContain('npm: logged in as beautinique');
  });

  it('stops at a failed publish, keeps what went out, and publish finishes the rest', async () => {
    setup(family().slice(0, 2));
    registry.failPublish.add('@beautinique/frontend-b');

    const broken = await cli('publish', '--all', '--yes');
    expect(broken.code).toBe(1);
    expect(broken.out).toContain('Stopped at @beautinique/frontend-b');
    expect(broken.out).toContain('Run npm run publish to publish the rest');
    expect(registry.published).toEqual(['@beautinique/shared-a@1.0.0']);
    expect(git('tag', '--list')).toBe('@beautinique/shared-a@1.0.0');
    expect(git('status', '--porcelain')).toBe('');

    registry.failPublish.clear();
    const rest = await cli('publish', '--all', '--yes');
    expect(rest.code).toBe(0);
    expect(registry.published).toEqual([
      '@beautinique/shared-a@1.0.0',
      '@beautinique/frontend-b@1.0.0',
    ]);
    expect(git('tag', '--list').split('\n').sort()).toEqual([
      '@beautinique/frontend-b@1.0.0',
      '@beautinique/shared-a@1.0.0',
    ]);
  });

  it('a dry run changes nothing anywhere', async () => {
    setup(family().slice(0, 2));
    expect((await cli('publish', '--all', '--yes')).code).toBe(0);
    const head = git('rev-parse', 'HEAD');

    const dry = await cli(
      'republish',
      '--all',
      '--bump',
      'minor',
      '--target',
      'laptop',
      '--yes',
      '--dry-run',
    );
    expect(dry.out).toContain('Dry run: no file, git or npm change was made.');
    expect(dry.code).toBe(0);
    // npm's own dry run saw the planned version, not the one in git
    expect(dry.out).toMatch(/version:\s+1\.1\.0/);
    expect(registry.published).toHaveLength(2);
    expect(manifest('packages/shared/a').version).toBe('1.0.0');
    expect(git('rev-parse', 'HEAD')).toBe(head);
    expect(git('status', '--porcelain')).toBe('');
  });

  it('refuses to release from a dirty tree, and explains a missing npm login', async () => {
    setup(family().slice(0, 1));
    repo.write('packages/shared/a/index.js', 'export const value = 2;\n');
    const dirty = await cli('publish', '--all', '--yes');
    expect(dirty.code).toBe(1);
    expect(dirty.out).toContain('uncommitted changes');
    git('commit', '-q', '-am', 'fix: value');

    writeFileSync(userconfig, `registry=${registry.url}\n`);
    const loggedOut = await cli('publish', '--all', '--yes');
    expect(loggedOut.code).toBe(1);
    expect(loggedOut.out).toContain('You are not logged in to npm.');
    expect(loggedOut.out).toContain('npm run login');
    expect(registry.published).toEqual([]);
  });

  it('checks the package before publishing and restores nothing it did not touch', async () => {
    setup([publicPackage('shared', 'a', '1.0.0', { exports: { '.': './dist/index.js' } })]);
    const res = await cli('publish', '--all', '--yes');
    expect(res.code).toBe(1);
    expect(res.out).toContain(
      'package.json points at "./dist/index.js", but it is not in the package',
    );
    expect(registry.published).toEqual([]);
    expect(existsSync(join(repo.root, 'packages/shared/a/CHANGELOG.md'))).toBe(false);
    expect(git('status', '--porcelain')).toBe('');
  });

  it('releases only from the release branch', async () => {
    setup(family().slice(0, 1));
    git('switch', '-q', '-c', 'feature');
    const res = await cli('publish', '--all', '--yes');
    expect(res.code).toBe(1);
    expect(res.out).toContain('You are on "feature"; releases are made from "release" only.');
    expect(registry.published).toEqual([]);
  });

  it('puts every file back when the npm session runs out during the checks', async () => {
    setup(family().slice(0, 2));
    expect((await cli('publish', '--all', '--yes')).code).toBe(0);

    registry.whoamiLimit = 1; // the early check passes, the one right before publishing does not
    const res = await cli('republish', '--all', '--bump', 'minor', '--target', 'laptop', '--yes');
    expect(res.code).toBe(1);
    expect(res.out).toContain('Your npm session has expired');
    expect(res.out).toContain('Every file is back as it was; nothing was published.');
    expect(registry.published).toHaveLength(2);
    expect(manifest('packages/shared/a').version).toBe('1.0.0');
    expect(git('status', '--porcelain')).toBe('');
  });

  it('GitHub release: --ci packs only versions tagged on the built commit; the publish job publishes them once', async () => {
    setup(family().slice(0, 2));
    expect((await cli('publish', '--all', '--yes')).code).toBe(0);
    // what `republish --target github` leaves behind: a new version, committed (tagged below)
    const a = manifest('packages/shared/a');
    writeFileSync(
      join(repo.root, 'packages/shared/a/package.json'),
      `${JSON.stringify({ ...a, version: '1.1.0' }, null, 2)}\n`,
    );
    git('commit', '-q', '-am', 'chore(release): version packages');

    const outside = await cli('publish', '--ci');
    expect(outside.code).toBe(1);
    expect(outside.out).toContain('--ci is only for the GitHub Release workflow.');

    const ci = (...args: string[]) =>
      run(join(BIN, 'publish.ts'), ['--ci', ...args], { GITHUB_ACTIONS: 'true' });
    const untagged = await ci();
    expect(untagged.code).toBe(1);
    expect(untagged.out).toContain(
      'These versions are not tagged on the commit being built: @beautinique/shared-a@1.1.0.',
    );

    git('tag', '-a', '@beautinique/shared-a@1.1.0', '-m', 'release');
    const packed = await ci('--pack-dir', 'out');
    expect(packed.out).toContain('packed @beautinique/shared-a@1.1.0');
    expect(packed.code).toBe(0);
    expect(registry.published).toHaveLength(2);
    expect(JSON.parse(readFileSync(join(repo.root, 'out', 'release.json'), 'utf8'))).toEqual([
      {
        name: '@beautinique/shared-a',
        version: '1.1.0',
        tag: 'latest',
        file: expect.stringMatching(/^[\w.-]+\.tgz$/) as unknown,
      },
    ]);
    expect(git('status', '--porcelain')).toBe('?? out/');

    const env = { npm_config_registry: registry.url };
    const first = await run(PUBLISH_TARBALLS, ['out'], env);
    expect(first.out).toContain('Done: 1 published, 0 already on npm.');
    expect(first.code).toBe(0);
    expect(registry.published.at(-1)).toBe('@beautinique/shared-a@1.1.0');

    const again = await run(PUBLISH_TARBALLS, ['out'], env);
    expect(again.code).toBe(0);
    expect(again.out).toContain('@beautinique/shared-a@1.1.0 is already on npm; skipped.');
    expect(registry.published).toHaveLength(3);
  });

  it('every command has --help and rejects unknown flags', async () => {
    setup([]);
    const commands = [
      'login',
      'logout',
      'status',
      'build',
      'create',
      'publish',
      'republish',
      'verify',
    ];
    for (const command of commands) {
      const help = await cli(command, '--help');
      expect(help.code, command).toBe(0);
      expect(help.out, command).toContain(`npm run ${command}`);
    }
    const bad = await cli('login', '--nope');
    expect(bad.code).toBe(1);
    expect(bad.out).toContain("Unknown option '--nope'");
  });
});
