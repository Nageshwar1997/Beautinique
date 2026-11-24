import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import { addEntry, changelogEntry, escapeMarkdown } from '../src/changelog.ts';
import { rangeFor, satisfies } from '../src/ranges.ts';
import { republish, type RepublishOptions } from '../src/republish.ts';
import { fixtureRepo, recordingLogger } from './utils/fixture-repo.ts';
import { git, gitOnlyExec, initGit, realEnv, setIdentity } from './utils/real-env.ts';
import { startFakeRegistry } from './utils/fake-registry.ts';

// Real git in a throwaway repo (a few seconds each).
vi.setConfig({ testTimeout: 60_000 });

const IDS = '@beautinique/shared-ids';
const MONEY = '@beautinique/shared-money';

// Two released packages (ids, and money that needs ids at `range`), tagged, then one new commit on a
// work branch that touches ids. `origin/prerelease` is the first commit.
async function setup(options: { range?: string; identity?: boolean; branch?: string } = {}) {
  const registry = await startFakeRegistry();
  const env = realEnv(registry);
  const root = fixtureRepo({ 'shared/ids': [], 'shared/money': [IDS] });
  if (options.range) {
    const path = join(root, 'packages/shared/money/package.json');
    const manifest = JSON.parse(readFileSync(path, 'utf8')) as {
      dependencies: Record<string, string>;
    };
    manifest.dependencies[IDS] = options.range;
    writeFileSync(path, JSON.stringify(manifest, null, 2));
  }
  initGit(root, env, 'prerelease');
  git(root, ['update-ref', 'refs/remotes/origin/prerelease', 'HEAD'], env);
  git(root, ['tag', `${IDS}@1.0.0`], env);
  git(root, ['tag', `${MONEY}@1.0.0`], env);
  const branch = options.branch ?? 'feat/change';
  if (branch !== 'prerelease') git(root, ['switch', '-q', '-c', branch], env);
  if (options.identity ?? true) setIdentity(root, env);
  writeFileSync(join(root, 'packages/shared/ids/src/index.ts'), 'export const X = 1;\n');
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
      'feat(shared-ids): add a parser',
    ],
    env,
  );
  const { exec, calls } = gitOnlyExec(root, env);
  const logger = recordingLogger();
  const answers: string[] = [];
  const base: RepublishOptions = {
    root,
    names: [],
    bump: 'minor',
    dryRun: false,
    ask: () => Promise.resolve(answers.shift() ?? 'haan'),
    log: logger.log,
    exec,
    now: () => new Date('2026-11-23T10:00:00Z'),
  };
  return { root, env, base, calls, answers, close: () => registry.close(), ...logger };
}

const readJson = (root: string, path: string) =>
  JSON.parse(readFileSync(join(root, path), 'utf8')) as Record<string, unknown> & {
    version: string;
    dependencies: Record<string, string>;
  };
const commitCount = (root: string, env: Record<string, string>) =>
  Number(git(root, ['rev-list', '--count', 'origin/prerelease..HEAD'], env));

describe('republish', () => {
  it('AC-PACKAGES-6: a minor bump of a package changes only it when the dependent range still takes the new version', async () => {
    const { root, env, base, calls, close } = await setup();
    await republish({ ...base, names: ['shared-ids'] });
    expect(readJson(root, 'packages/shared/ids/package.json').version).toBe('1.1.0');
    expect(readJson(root, 'packages/shared/money/package.json').version).toBe('1.0.0');
    expect(readJson(root, 'packages/shared/money/package.json').dependencies[IDS]).toBe('^1.0.0');
    expect(readFileSync(join(root, 'packages/shared/ids/CHANGELOG.md'), 'utf8')).toContain(
      '## 1.1.0 (2026-11-23)\n\n### Features\n\n- shared-ids: add a parser',
    );
    // One commit for the whole change, and nothing published.
    expect(commitCount(root, env)).toBe(2);
    expect(calls.some((call) => call.args.includes('publish'))).toBe(false);
    await close();
  });

  it('AC-PACKAGES-6: a major bump moves the dependent range and patches the dependent, all in one commit', async () => {
    const { root, env, base, close } = await setup();
    await republish({ ...base, names: ['shared-ids'], bump: 'major' });
    expect(readJson(root, 'packages/shared/ids/package.json').version).toBe('2.0.0');
    const money = readJson(root, 'packages/shared/money/package.json');
    expect(money.version).toBe('1.0.1');
    expect(money.dependencies[IDS]).toBe('^2.0.0');
    expect(readFileSync(join(root, 'packages/shared/money/CHANGELOG.md'), 'utf8')).toContain(
      `### Dependencies\n\n- Updated ${escapeMarkdown(IDS)} ^2.0.0`,
    );
    expect(commitCount(root, env)).toBe(2);
    const files = git(root, ['show', '--name-only', '--format=', 'HEAD'], env).split('\n').sort();
    expect(files).toEqual([
      'packages/shared/ids/CHANGELOG.md',
      'packages/shared/ids/package.json',
      'packages/shared/money/CHANGELOG.md',
      'packages/shared/money/package.json',
    ]);
    await close();
  });

  it('AC-PACKAGES-6: the kind of range (exact, ~, ^) stays the same', async () => {
    for (const range of ['1.0.0', '~1.0.0']) {
      const { root, base, close } = await setup({ range });
      await republish({ ...base, names: ['shared-ids'], bump: 'major' });
      expect(readJson(root, 'packages/shared/money/package.json').dependencies[IDS]).toBe(
        `${range.startsWith('~') ? '~' : ''}2.0.0`,
      );
      await close();
    }
  });

  it('chooses the packages changed since their last tag when none is named', async () => {
    const { root, base, close, out } = await setup();
    await republish(base);
    expect(out[1]).toContain(`${IDS}: 1.0.0 -> 1.1.0 (minor)`);
    expect(readJson(root, 'packages/shared/money/package.json').version).toBe('1.0.0');
    await close();
  });

  it('asks for the bump of each package when --bump is not given', async () => {
    const { root, base, answers, close } = await setup();
    answers.push('patch', 'haan');
    await republish({ ...base, bump: undefined });
    expect(readJson(root, 'packages/shared/ids/package.json').version).toBe('1.0.1');
    await close();
  });

  it('uses the owner git identity and no AI attribution in the commit', async () => {
    const { root, env, base, close } = await setup();
    await republish({ ...base, names: ['shared-ids'] });
    expect(git(root, ['log', '-1', '--format=%an <%ae>'], env)).toBe(
      'Test Owner <owner@example.com>',
    );
    const message = git(root, ['log', '-1', '--format=%B'], env);
    expect(message).toMatch(/^chore\(release\): republish /);
    expect(message).not.toMatch(/co-authored-by|generated (with|by)|anthropic|claude code/i);
    await close();
  });

  it('says so when no package changed since its tag', async () => {
    const { root, env, base, out, close } = await setup();
    git(root, ['tag', '-f', `${IDS}@1.0.0`, 'HEAD'], env);
    expect(await republish(base)).toBe(0);
    expect(out.at(-1)).toBe('No package changed since its last release tag.');
    await close();
  });

  it('writes nothing on --dry-run or when the answer is not haan', async () => {
    const { root, env, base, answers, close } = await setup();
    await republish({ ...base, names: ['shared-ids'], dryRun: true });
    answers.push('no');
    await republish({ ...base, names: ['shared-ids'] });
    expect(readJson(root, 'packages/shared/ids/package.json').version).toBe('1.0.0');
    expect(commitCount(root, env)).toBe(1);
    await close();
  });

  it('refuses on release or prerelease, on a dirty tree, behind origin/prerelease, or without an identity', async () => {
    const onPrerelease = await setup({ branch: 'prerelease' });
    await expect(republish(onPrerelease.base)).rejects.toMatchObject({
      code: 'REPUBLISH_NOT_READY',
      message: expect.stringContaining('not a work branch') as string,
    });
    await onPrerelease.close();

    const dirty = await setup();
    writeFileSync(join(dirty.root, 'stray.txt'), 'x');
    await expect(republish(dirty.base)).rejects.toMatchObject({
      message: expect.stringContaining('not clean') as string,
    });
    await dirty.close();

    const behind = await setup();
    git(behind.root, ['update-ref', 'refs/remotes/origin/prerelease', 'HEAD~0'], behind.env);
    git(behind.root, ['switch', '-q', '--detach', 'HEAD~1'], behind.env);
    git(behind.root, ['switch', '-q', '-c', 'feat/old'], behind.env);
    await expect(republish(behind.base)).rejects.toMatchObject({
      message: expect.stringContaining('latest origin/prerelease') as string,
    });
    await behind.close();

    const noIdentity = await setup({ identity: false });
    await expect(republish(noIdentity.base)).rejects.toMatchObject({
      message: expect.stringContaining('No git identity') as string,
    });
    await noIdentity.close();
  });

  it('refuses a package that was never released', async () => {
    const { base, close } = await setup();
    await expect(republish({ ...base, names: ['shared-nope'] })).rejects.toMatchObject({
      code: 'PACKAGE_UNKNOWN',
    });
    await close();
  });

  it('puts the files back when the lockfile cannot be updated', async () => {
    const { root, env, base, close } = await setup();
    const { exec } = gitOnlyExec(root, env);
    const failing: RepublishOptions['exec'] = (command, args, options) =>
      command === 'npm' ? { status: 1, stdout: '', stderr: 'boom' } : exec(command, args, options);
    await expect(
      republish({ ...base, names: ['shared-ids'], exec: failing }),
    ).rejects.toMatchObject({
      code: 'REPUBLISH_LOCK_FAILED',
    });
    expect(readJson(root, 'packages/shared/ids/package.json').version).toBe('1.0.0');
    expect(git(root, ['status', '--porcelain'], env)).toBe('');
    await close();
  });
});

describe('ranges', () => {
  it('knows when a version is in an exact, ~ or ^ range', () => {
    expect(satisfies('1.1.0', '^1.0.0')).toBe(true);
    expect(satisfies('2.0.0', '^1.0.0')).toBe(false);
    expect(satisfies('1.0.5', '~1.0.0')).toBe(true);
    expect(satisfies('1.1.0', '~1.0.0')).toBe(false);
    expect(satisfies('1.0.0', '1.0.0')).toBe(true);
    expect(satisfies('1.0.1', '1.0.0')).toBe(false);
    expect(satisfies('0.2.5', '^0.2.1')).toBe(true);
    expect(satisfies('0.3.0', '^0.2.1')).toBe(false);
    expect(satisfies('0.0.4', '^0.0.3')).toBe(false);
    expect(satisfies('1.0.0', '^1.0.1')).toBe(false);
  });

  it('keeps the kind of range and refuses other forms', () => {
    expect(rangeFor('^1.0.0', '2.0.0')).toBe('^2.0.0');
    expect(rangeFor('1.0.0', '2.0.0')).toBe('2.0.0');
    expect(() => rangeFor('>=1.0.0', '2.0.0')).toThrow(
      expect.objectContaining({ code: 'RANGE_UNSUPPORTED' }) as Error,
    );
  });
});

describe('changelog', () => {
  it('groups commits by type and escapes what Markdown would act on', () => {
    const entry = changelogEntry('1.2.0', '2026-11-23', [
      { subject: 'feat(money): add *rounding* [x]' },
      { subject: 'fix: stop a crash' },
      { subject: 'not conventional' },
    ]);
    expect(entry).toBe(
      [
        '## 1.2.0 (2026-11-23)',
        '',
        '### Features',
        '',
        '- money: add \\*rounding\\* \\[x\\]',
        '',
        '### Fixes',
        '',
        '- stop a crash',
        '',
        '### Other',
        '',
        '- not conventional',
        '',
      ].join('\n'),
    );
  });

  it('puts a new entry under the title and above the older ones', () => {
    const next = addEntry('# Changelog: x\n\n## 1.0.0 (2026-01-01)\n\n- a\n', '## 1.1.0 (d)\n');
    expect(next).toBe('# Changelog: x\n\n## 1.1.0 (d)\n\n## 1.0.0 (2026-01-01)\n\n- a\n');
  });
});
