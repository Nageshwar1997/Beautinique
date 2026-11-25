import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ARTIFACT_DIR,
  publish,
  TAGS_FILE,
  type PlanEntry,
  type PublishOptions,
} from '../src/publish.ts';
import { status } from '../src/status.ts';
import { startFakeRegistry, type FakeRegistry } from './utils/fake-registry.ts';
import { addPackage, fixtureRepo, recordingLogger } from './utils/fixture-repo.ts';
import { git, initGit, realEnv, routedExec, setIdentity } from './utils/real-env.ts';

// Real npm and git run here, a few seconds each time.
vi.setConfig({ testTimeout: 60_000 });

let registry: FakeRegistry;
beforeEach(async () => {
  registry = await startFakeRegistry();
});
afterEach(async () => {
  await registry.close();
});

const IDS = '@beautinique/shared-ids';
const MONEY = '@beautinique/shared-money';

// Two packages, money needing ids, in a git repo on `release`; the real npm and git, the fake registry.
function setup(options: { branch?: string; loggedIn?: boolean; identity?: boolean } = {}) {
  const root = fixtureRepo({ 'shared/ids': [], 'shared/money': [IDS] });
  const env = realEnv(registry, options.loggedIn ?? true);
  initGit(root, env, options.branch ?? 'release');
  if (options.identity ?? true) setIdentity(root, env);
  const { exec } = routedExec(root, env);
  const logger = recordingLogger();
  const answers: string[] = [];
  const base: PublishOptions = {
    root,
    registry: registry.url,
    names: [],
    dryRun: false,
    ci: false,
    env: {},
    ask: () => Promise.resolve(answers.shift() ?? 'haan'),
    log: logger.log,
    exec,
  };
  return { root, env, base, answers, ...logger };
}

const puts = async () => (await registry.requests()).filter((request) => request.startsWith('PUT'));
const tags = (root: string, env: Record<string, string>) =>
  git(root, ['tag', '--list'], env).split('\n').filter(Boolean);

describe('status', () => {
  it('AC-PACKAGES-5: shows the repo version, the npm version and the state of each package', async () => {
    const root = fixtureRepo({ 'shared/ids': [], 'shared/money': [], 'shared/fresh': [] });
    writeFileSync(
      join(root, 'packages/shared/money/package.json'),
      JSON.stringify({ name: MONEY, version: '1.2.0' }),
    );
    await registry.seed(IDS, ['1.0.0']);
    await registry.seed(MONEY, ['1.0.0', '1.1.0']);
    const { log, out } = recordingLogger();
    await status({ root, registry: registry.url, names: [], log });
    expect(out).toEqual([
      'package                    repo   npm    state',
      '@beautinique/shared-fresh  1.0.0  -      new',
      '@beautinique/shared-ids    1.0.0  1.0.0  published',
      '@beautinique/shared-money  1.2.0  1.1.0  to publish',
    ]);
  });

  it('AC-PACKAGES-5: a registry that does not answer is an error, not "new"', async () => {
    const root = fixtureRepo({ 'shared/ids': [] });
    const { log } = recordingLogger();
    await expect(
      status({ root, registry: 'http://127.0.0.1:1', names: [], log }),
    ).rejects.toMatchObject({ code: 'REGISTRY_UNREACHABLE' });
  });
});

describe('publish from the laptop', () => {
  it('AC-PACKAGES-7: publishes only the versions the registry lacks, after what they need, and tags them', async () => {
    await registry.seed(IDS, ['1.0.0']);
    const { root, env, base } = setup();
    expect(await publish(base)).toBe(0);
    expect(await registry.versionsOf(MONEY)).toEqual(['1.0.0']);
    expect(await registry.versionsOf(IDS)).toEqual(['1.0.0']);
    expect(await puts()).toEqual([`PUT /${MONEY}`]);
    expect(tags(root, env)).toEqual([`${MONEY}@1.0.0`]);
  });

  it('AC-PACKAGES-7: publishes a package after the packages it needs', async () => {
    const { base } = setup();
    await publish(base);
    expect(await puts()).toEqual([`PUT /${IDS}`, `PUT /${MONEY}`]);
  });

  it('AC-PACKAGES-7: --dry-run leaves the registry and the tags as they are', async () => {
    await registry.seed(IDS, ['1.0.0']);
    const { root, env, base, out } = setup();
    await publish({ ...base, dryRun: true });
    expect(await registry.versionsOf(MONEY)).toEqual([]);
    expect(tags(root, env)).toEqual([]);
    expect(out.join('\n')).toContain(`${MONEY}@1.0.0`);
  });

  it('AC-PACKAGES-8: nothing is published without a "haan"', async () => {
    const { base, answers, out } = setup();
    answers.push('no');
    await publish(base);
    expect(await puts()).toEqual([]);
    expect(out.at(-1)).toBe('Nothing was published.');
  });

  it('AC-PACKAGES-8: not on release, a dirty tree, no git identity or no npm login stops with the reasons', async () => {
    const wrongBranch = setup({ branch: 'prerelease' });
    await expect(publish(wrongBranch.base)).rejects.toMatchObject({
      code: 'PUBLISH_NOT_READY',
      message: expect.stringContaining('not release') as string,
    });

    const dirty = setup();
    writeFileSync(join(dirty.root, 'stray.txt'), 'x');
    await expect(publish(dirty.base)).rejects.toMatchObject({
      message: expect.stringContaining('not clean') as string,
    });

    const noIdentity = setup({ identity: false });
    await expect(publish(noIdentity.base)).rejects.toMatchObject({
      message: expect.stringContaining('No git identity') as string,
    });

    const loggedOut = setup({ loggedIn: false });
    await expect(publish(loggedOut.base)).rejects.toMatchObject({
      message: expect.stringContaining('Not logged in') as string,
    });
    expect(await puts()).toEqual([]);
  });

  it('AC-PACKAGES-10: after a failed publish, a second run publishes only what is left and tags only what went out', async () => {
    await registry.failPublishes(1, 503, 1);
    const { root, env, base } = setup();
    await expect(publish(base)).rejects.toMatchObject({ code: 'PUBLISH_FAILED' });
    expect(await registry.versionsOf(IDS)).toEqual(['1.0.0']);
    expect(await registry.versionsOf(MONEY)).toEqual([]);
    expect(tags(root, env)).toEqual([`${IDS}@1.0.0`]);

    await registry.clearRequests();
    await publish(base);
    expect(await puts()).toEqual([`PUT /${MONEY}`]);
    expect(tags(root, env).sort()).toEqual([`${IDS}@1.0.0`, `${MONEY}@1.0.0`]);
  });

  it('AC-PACKAGES-10: an expired session in the middle is handled the same way', async () => {
    await registry.failPublishes(1, 401, 1);
    const { base } = setup();
    await expect(publish(base)).rejects.toMatchObject({ code: 'PUBLISH_FAILED' });
    expect(await registry.versionsOf(IDS)).toEqual(['1.0.0']);
  });

  it('AC-PACKAGES-7: a named package goes out with the own package it needs when npm lacks the needed version (QA-PKG-003)', async () => {
    const { base, out } = setup();
    await publish({ ...base, names: [MONEY] });
    expect(await puts()).toEqual([`PUT /${IDS}`, `PUT /${MONEY}`]);
    expect(out.join('\n')).toContain(`${IDS}@1.0.0  (new package, needed by a chosen package)`);
    // What goes out with it is verified too.
    expect(out.join('\n')).toContain(`Verified 2 package(s): ${IDS}, ${MONEY}`);
  });

  it('AC-PACKAGES-7: a named package goes out alone when npm already has a version it can use', async () => {
    await registry.seed(IDS, ['1.0.0']);
    const { base } = setup();
    await publish({ ...base, names: [MONEY] });
    expect(await puts()).toEqual([`PUT /${MONEY}`]);
  });

  it('stops before publishing when a needed own version is neither on npm nor in the repository', async () => {
    const { root, env, base } = setup();
    const manifestPath = join(root, 'packages/shared/money/package.json');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Record<string, unknown>;
    manifest.dependencies = { [IDS]: '^2.0.0' };
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    git(root, ['commit', '-q', '-am', 'needs ids 2'], env);
    await expect(publish({ ...base, names: [MONEY] })).rejects.toMatchObject({
      code: 'PUBLISH_DEPENDENCY_MISSING',
      message: expect.stringContaining(`${IDS} ^2.0.0`) as string,
    });
    expect(await puts()).toEqual([]);
  });

  it('warns about a version that is on npm but has no tag here (QA-PKG-001)', async () => {
    await registry.seed(IDS, ['1.0.0']);
    const { base, err } = setup();
    await publish(base);
    expect(err.join('\n')).toContain(`On npm but without a tag here: ${IDS}@1.0.0`);
  });

  it('says so when git cannot make the tag of a published version', async () => {
    await registry.seed(IDS, ['1.0.0']);
    const { root, env, base, out, err } = setup();
    const exec: PublishOptions['exec'] = (command, args, options) =>
      command === 'git' && args[0] === 'tag'
        ? { status: 128, stdout: '', stderr: 'fatal: cannot lock ref' }
        : base.exec(command, args, options);
    await publish({ ...base, exec });
    expect(await registry.versionsOf(MONEY)).toEqual(['1.0.0']);
    expect(tags(root, env)).toEqual([]);
    expect(err.join('\n')).toContain(`${MONEY}@1.0.0 is on npm, but git could not tag it`);
    expect(out.join('\n')).toContain(`Published 1 version(s): ${MONEY}@1.0.0`);
  });

  it('reminds the owner of the tags, the back-merge and npm trust for a new package', async () => {
    const { base, out } = setup();
    await publish(base);
    const text = out.join('\n');
    expect(text).toContain('git push origin <tag>');
    expect(text).toContain('Back-merge release into prerelease');
    expect(text).toContain(`npm trust (${MONEY})`);
  });
});

describe('publish --ci (the workflow)', () => {
  const inActions = { GITHUB_ACTIONS: 'true', GITHUB_REF_NAME: 'release' };

  it('AC-PACKAGES-9: refuses outside GitHub Actions and outside the release branch', async () => {
    const { base } = setup();
    await expect(publish({ ...base, ci: true })).rejects.toMatchObject({
      code: 'PUBLISH_CI_OUTSIDE_ACTIONS',
    });
    await expect(
      publish({ ...base, ci: true, env: { ...inActions, GITHUB_REF_NAME: 'prerelease' } }),
    ).rejects.toMatchObject({ code: 'PUBLISH_NOT_RELEASE' });
  });

  it('AC-PACKAGES-9: refuses a package npm has never seen and says to publish it from the laptop', async () => {
    await registry.seed(IDS, ['1.0.0']);
    const { base } = setup();
    await expect(publish({ ...base, ci: true, env: inActions })).rejects.toMatchObject({
      code: 'PUBLISH_NEW_PACKAGE',
      message: expect.stringContaining(MONEY) as string,
      hint: expect.stringContaining('first time from the owner laptop') as string,
    });
    expect(existsSync(join(base.root, ARTIFACT_DIR, 'plan.json'))).toBe(false);
  });

  it('packs a tarball and a plan for the versions npm lacks, and publishes nothing itself', async () => {
    await registry.seed(IDS, ['1.0.0']);
    await registry.seed(MONEY, ['0.9.0']);
    const { base } = setup();
    expect(await publish({ ...base, ci: true, env: inActions })).toBe(0);
    const plan = JSON.parse(
      readFileSync(join(base.root, ARTIFACT_DIR, 'plan.json'), 'utf8'),
    ) as PlanEntry[];
    expect(plan).toEqual([
      {
        name: MONEY,
        version: '1.0.0',
        tarball: 'beautinique-shared-money-1.0.0.tgz',
        tag: `${MONEY}@1.0.0`,
      },
    ]);
    expect(existsSync(join(base.root, ARTIFACT_DIR, plan[0]?.tarball ?? 'x'))).toBe(true);
    expect(await puts()).toEqual([]);
  });

  it('AC-PACKAGES-10: lists for the tag job every version of the plan and every version npm already has (QA-PKG-001)', async () => {
    // As after a run that failed midway: ids went out (without its tag), money did not.
    await registry.seed(IDS, ['0.9.0', '1.0.0']);
    await registry.seed(MONEY, ['0.9.0']);
    const { base } = setup();
    await publish({ ...base, ci: true, env: inActions });
    const read = (file: string) =>
      JSON.parse(readFileSync(join(base.root, ARTIFACT_DIR, file), 'utf8')) as { tag: string }[];
    expect(read('plan.json').map((entry) => entry.tag)).toEqual([`${MONEY}@1.0.0`]);
    expect(read(TAGS_FILE)).toEqual([
      { name: IDS, version: '1.0.0', tag: `${IDS}@1.0.0` },
      { name: MONEY, version: '1.0.0', tag: `${MONEY}@1.0.0` },
    ]);
  });

  it('writes an empty plan when every version is already on npm', async () => {
    await registry.seed(IDS, ['1.0.0']);
    await registry.seed(MONEY, ['1.0.0']);
    const { base, out } = setup();
    await publish({ ...base, ci: true, env: inActions });
    expect(JSON.parse(readFileSync(join(base.root, ARTIFACT_DIR, 'plan.json'), 'utf8'))).toEqual(
      [],
    );
    expect(out.at(-1)).toContain('Nothing to publish');
  });
});

describe('a package added later', () => {
  it('is picked up by status', async () => {
    const root = fixtureRepo({ 'shared/ids': [] });
    addPackage(root, 'backend', 'events');
    const { log, out } = recordingLogger();
    await status({ root, registry: registry.url, names: ['backend-events'], log });
    expect(out[1]).toContain('@beautinique/backend-events');
  });
});
