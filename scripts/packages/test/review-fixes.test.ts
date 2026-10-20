/** Regression tests for the problems the independent review found (2026-10-20). */
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { parseCommonFlags, parseHelpOnly } from '../lib/args.ts';
import { escapeMarkdown, groupCommits } from '../lib/changelog.ts';
import { verifyCommand } from '../lib/commands.ts';
import { lastTag } from '../lib/git.ts';
import { buildOrder, internalClosure, reexports } from '../lib/graph.ts';
import { firstErrorLine } from '../lib/npm.ts';
import {
  chooseVersions,
  planPublish,
  planRepublish,
  readRegistryState,
  republishCandidates,
} from '../lib/plan.ts';
import { noPrompter } from '../lib/prompts.ts';
import type { RegistryPackage } from '../lib/registry.ts';
import { dependentVersion, npmSatisfies } from '../lib/versions.ts';
import { loadWorkspace } from '../lib/workspace.ts';
import {
  type FixturePackage,
  makeRepo,
  onNpm,
  privatePackage,
  publicPackage,
  testContext,
} from './helpers.ts';

const repos: { cleanup: () => void }[] = [];
afterEach(() => {
  repos.splice(0).forEach((r) => {
    r.cleanup();
  });
});

function workspace(
  packages: FixturePackage[],
  registry: Record<string, RegistryPackage>,
  answers: unknown[] = [],
) {
  const r = makeRepo(packages);
  repos.push(r);
  const ctx = testContext(r.root, { answers, registry });
  return { ctx, ws: loadWorkspace(ctx) };
}

async function plan(
  packages: FixturePackage[],
  registry: Record<string, RegistryPackage>,
  versions: [string, string][],
  cascade: 'ask' | 'yes' | 'no' = 'yes',
  answers: unknown[] = [],
) {
  const { ctx, ws } = workspace(packages, registry, answers);
  const result = await planRepublish(
    ctx,
    ws,
    await readRegistryState(ctx, ws),
    new Map(versions),
    cascade,
  );
  return { ctx, result, rows: result.items.map((i) => `${i.pkg.folder} ${i.to} ${i.tag}`) };
}

const a = (version = '1.0.0') => publicPackage('shared', 'a', version);

describe('npm state', () => {
  it('a local copy behind npm cannot be republished, and a taken version is refused', async () => {
    const { ctx, ws } = workspace([a()], { '@beautinique/shared-a': onNpm('1.0.0', '1.0.1') });
    const registry = await readRegistryState(ctx, ws);
    expect(republishCandidates(ws, registry)[0]?.blocked).toContain('behind npm 1.0.1');
    await expect(
      planRepublish(ctx, ws, registry, new Map([['@beautinique/shared-a', '1.0.1']]), 'yes'),
    ).rejects.toThrow('already on npm: @beautinique/shared-a@1.0.1');
  });

  it('a prerelease on npm does not make a stable local copy "behind"', async () => {
    const { ctx, ws } = workspace([a()], {
      '@beautinique/shared-a': {
        versions: ['1.0.0', '2.0.0-beta.0'],
        distTags: { latest: '1.0.0', beta: '2.0.0-beta.0' },
      },
    });
    expect(republishCandidates(ws, await readRegistryState(ctx, ws))[0]?.blocked).toBeNull();
  });

  it('checks installability the way npm resolves: a prerelease does not match ^1.1.0', async () => {
    const { ctx, ws } = workspace(
      [
        a('1.2.0-beta.0'),
        publicPackage('frontend', 'b', '1.0.0', {
          dependencies: { '@beautinique/shared-a': '^1.1.0' },
        }),
      ],
      { '@beautinique/shared-a': onNpm('1.0.0') },
    );
    await expect(
      planPublish(ctx, ws, await readRegistryState(ctx, ws), ws.packages),
    ).rejects.toThrow(
      'needs @beautinique/shared-a "^1.1.0", but npm would find no matching version',
    );
  });
});

describe('cascade bumps', () => {
  it('the biggest broken edge decides: a broken peer range makes the dependent major', async () => {
    const { rows } = await plan(
      [
        a(),
        publicPackage('shared', 'b', '1.0.0'),
        publicPackage('backend', 'c', '1.0.0', {
          dependencies: { '@beautinique/shared-a': '^1.0.0' },
          peerDependencies: { '@beautinique/shared-b': '^1.0.0' },
        }),
      ],
      {
        '@beautinique/shared-a': onNpm('1.0.0'),
        '@beautinique/shared-b': onNpm('1.0.0'),
        '@beautinique/backend-c': onNpm('1.0.0'),
      },
      [
        ['@beautinique/shared-a', '2.0.0'],
        ['@beautinique/shared-b', '2.0.0'],
      ],
    );
    expect(rows).toContain('c 2.0.0 latest');
  });

  it('a package that re-exports a dependency gets major when it breaks; others get patch', async () => {
    const reexporting = publicPackage('frontend', 'b', '1.0.0', {
      dependencies: { '@beautinique/shared-a': '^1.0.0' },
    });
    reexporting.files = {
      ...reexporting.files,
      'src/index.ts': "export * from '@beautinique/shared-a';\n",
    };
    const { rows } = await plan(
      [
        a(),
        reexporting,
        publicPackage('backend', 'c', '1.0.0', {
          dependencies: { '@beautinique/shared-a': '^1.0.0' },
        }),
      ],
      {
        '@beautinique/shared-a': onNpm('1.0.0'),
        '@beautinique/frontend-b': onNpm('1.0.0'),
        '@beautinique/backend-c': onNpm('1.0.0'),
      },
      [['@beautinique/shared-a', '2.0.0']],
    );
    expect(rows).toEqual(['a 2.0.0 latest', 'b 2.0.0 latest', 'c 1.0.1 latest']);
  });

  it('a selected package with too small a bump is raised after asking', async () => {
    const { ctx, rows } = await plan(
      [
        a(),
        publicPackage('backend', 'c', '1.0.0', {
          peerDependencies: { '@beautinique/shared-a': '^1.0.0' },
        }),
      ],
      { '@beautinique/shared-a': onNpm('1.0.0'), '@beautinique/backend-c': onNpm('1.0.0') },
      [
        ['@beautinique/shared-a', '2.0.0'],
        ['@beautinique/backend-c', '1.0.1'],
      ],
      'ask',
      [true],
    );
    expect(ctx.prompt.asked[0]).toContain('needs a major bump (peer dependency)');
    expect(rows).toEqual(['a 2.0.0 latest', 'c 2.0.0 latest']);
  });

  it('a prerelease cascades as a prerelease on the same tag; a prerelease line is never graduated', async () => {
    const { rows } = await plan(
      [
        a(),
        publicPackage('frontend', 'b', '1.0.0', {
          dependencies: { '@beautinique/shared-a': '^1.0.0' },
        }),
        publicPackage('backend', 'c', '3.0.0-beta.1', {
          dependencies: { '@beautinique/shared-a': '^1.0.0' },
        }),
      ],
      {
        '@beautinique/shared-a': onNpm('1.0.0'),
        '@beautinique/frontend-b': onNpm('1.0.0'),
        '@beautinique/backend-c': {
          versions: ['2.5.0', '3.0.0-beta.1'],
          distTags: { latest: '2.5.0', beta: '3.0.0-beta.1' },
        },
      },
      [['@beautinique/shared-a', '2.0.0-beta.0']],
    );
    expect(rows).toEqual(['a 2.0.0-beta.0 beta', 'b 1.0.1-beta.0 beta', 'c 3.0.0-beta.2 beta']);
  });

  it('a released dependent keeps a peer range that still matches (no forced consumer upgrade)', async () => {
    const { result } = await plan(
      [
        a('1.1.0'),
        publicPackage('backend', 'c', '3.0.0', {
          peerDependencies: { '@beautinique/shared-a': '^1.1.0' },
        }),
      ],
      { '@beautinique/shared-a': onNpm('1.1.0'), '@beautinique/backend-c': onNpm('3.0.0') },
      [
        ['@beautinique/shared-a', '1.2.0'],
        ['@beautinique/backend-c', '3.0.1'],
      ],
    );
    expect(result.rangeChanges).toEqual([]);
  });

  it('rejects custom versions semver cannot read', async () => {
    const { ctx, ws } = workspace([a()], {}, ['each', 'custom', '01.0.0']);
    await expect(chooseVersions(ctx, ws.packages, null)).rejects.toThrow('no leading zeros');
  });
});

describe('build order and re-exports', () => {
  it('builds devDependencies first, falling back to runtime order on a dev-only loop', () => {
    const { ws } = workspace(
      [
        publicPackage('shared', 'a', '1.0.0', {
          devDependencies: { '@beautinique/shared-b': '^1.0.0' },
        }),
        publicPackage('shared', 'b', '1.0.0'),
        publicPackage('shared', 'c', '1.0.0', {
          devDependencies: { '@beautinique/shared-d': '^1.0.0' },
        }),
        publicPackage('shared', 'd', '1.0.0', {
          devDependencies: { '@beautinique/shared-c': '^1.0.0' },
        }),
      ],
      {},
    );
    expect(buildOrder(['@beautinique/shared-a', '@beautinique/shared-b'], ws)).toEqual([
      '@beautinique/shared-b',
      '@beautinique/shared-a',
    ]);
    expect(buildOrder(['@beautinique/shared-c', '@beautinique/shared-d'], ws)).toEqual([
      '@beautinique/shared-c',
      '@beautinique/shared-d',
    ]);
    expect(internalClosure(['@beautinique/shared-a'], ws)).toEqual(['@beautinique/shared-b']);
  });

  it('detects re-exports in the entry file only', () => {
    const b = publicPackage('frontend', 'b', '1.0.0');
    b.files = {
      ...b.files,
      'src/index.ts':
        "export * from '@beautinique/shared-a';\nexport { x } from '@beautinique/shared-x';\nexport type { T } from '@beautinique/shared-t';\nimport y from '@beautinique/shared-y';\n",
    };
    const { ws } = workspace([b], {});
    const pkg = ws.packages[0];
    expect(pkg && reexports(pkg, '@beautinique/shared-a')).toBe(true);
    expect(pkg && reexports(pkg, '@beautinique/shared-x')).toBe(true);
    expect(pkg && reexports(pkg, '@beautinique/shared-t')).toBe(true);
    expect(pkg && reexports(pkg, '@beautinique/shared-y')).toBe(false);
  });

  it('computes dependent versions without graduating prereleases, and matches ranges like npm', () => {
    expect(dependentVersion('1.0.0', 'patch', null)).toBe('1.0.1');
    expect(dependentVersion('1.0.0', 'major', 'beta')).toBe('2.0.0-beta.0');
    expect(dependentVersion('3.0.0-beta.1', 'major', null)).toBe('3.0.0-beta.2');
    expect(npmSatisfies('1.2.0-beta.0', '^1.1.0')).toBe(false);
    expect(npmSatisfies('2.0.0-beta.0', '^2.0.0-beta.0')).toBe(true);
  });
});

describe('small pieces the review asked for', () => {
  it('without a terminal a confirmation is never assumed, unless --yes said so', async () => {
    await expect(noPrompter('hint').confirm('Publish?')).rejects.toMatchObject({
      code: 'NEEDS_ANSWER',
    });
    await expect(noPrompter('hint', true).confirm('Publish?')).resolves.toBe(true);
    await expect(noPrompter('pass --all', true).select('Which?', [])).rejects.toMatchObject({
      code: 'NEEDS_ANSWER',
      hint: 'pass --all',
    });
  });

  it("picks npm's real error line, not the code or the log file line", () => {
    const stderr = [
      'npm error code E403',
      'npm error 403 Forbidden - PUT https://registry.npmjs.org/x - You do not have permission',
      'npm error A complete log of this run can be found in: /tmp/x.log',
    ].join('\n');
    expect(firstErrorLine(stderr)).toBe(
      '403 Forbidden - PUT https://registry.npmjs.org/x - You do not have permission',
    );
    expect(firstErrorLine('\n  plain failure\n')).toBe('plain failure');
    expect(firstErrorLine('')).toBe('unknown error');
  });

  it('the last release tag is the highest by semver (a beta sorts below its release)', async () => {
    const { ctx } = workspace([], {});
    const tags = [
      '@beautinique/shared-a@1.9.0',
      '@beautinique/shared-a@2.0.0',
      '@beautinique/shared-a@2.0.0-beta.0',
      '@beautinique/shared-a@10.0.0-rc.1',
    ];
    const withTags = testContext(ctx.root, {
      respond: (call) => (call.args[0] === 'tag' ? { stdout: `${tags.join('\n')}\n` } : undefined),
    });
    expect(await lastTag(withTags, '@beautinique/shared-a')).toBe(
      '@beautinique/shared-a@10.0.0-rc.1',
    );
    tags.pop();
    expect(await lastTag(withTags, '@beautinique/shared-a')).toBe('@beautinique/shared-a@2.0.0');
    const none = testContext(ctx.root);
    expect(await lastTag(none, '@beautinique/shared-a')).toBeNull();
  });

  it('parses --pack-dir and help-only commands', () => {
    expect(parseCommonFlags([]).packDir).toBe('release-tarballs');
    expect(parseCommonFlags(['--ci', '--pack-dir', 'out']).packDir).toBe('out');
    expect(() => parseCommonFlags(['--pack-dir', ' '])).toThrow('--pack-dir needs a folder.');
    expect(parseHelpOnly([])).toBe(false);
    expect(parseHelpOnly(['-h'])).toBe(true);
    expect(() => parseHelpOnly(['--all'])).toThrow("Unknown option '--all'");
  });

  it('commit subjects cannot inject markdown or HTML into a changelog; code spans stay', () => {
    expect(
      escapeMarkdown(String.raw`fix: <script> in **name** [link](x) a_b \ ${'`a_b <c>`'}`),
    ).toBe(String.raw`fix: \<script\> in \*\*name\*\* \[link\](x) a\_b \\ ${'`a_b <c>`'}`);
    const [entry] = groupCommits([{ hash: 'abc1234', subject: 'feat: support <img> tags' }]).get(
      'Features',
    ) ?? [''];
    expect(entry).toBe(String.raw`support \<img\> tags (abc1234)`);
  });
});

describe('verify on a fresh clone', () => {
  it('builds internal dependencies (devDependencies too) before checking the selection', async () => {
    const r = makeRepo([
      publicPackage('shared', 'a', '1.0.0', { scripts: { build: 'x' } }),
      publicPackage('shared', 'tools', '1.0.0', { scripts: { build: 'x' } }),
      publicPackage('shared', 'unused', '1.0.0', { scripts: { build: 'x' } }),
      privatePackage('packages/backend/d', '@beautinique/backend-d', {
        scripts: { build: 'x', test: 'x' },
        dependencies: { '@beautinique/shared-a': '^1.0.0' },
        devDependencies: { '@beautinique/shared-tools': '^1.0.0' },
      }),
    ]);
    repos.push(r);
    const ctx = testContext(r.root, { interactive: false });
    await verifyCommand(ctx, parseCommonFlags(['--packages', 'backend-d', '--yes']));
    expect(
      ctx.calls
        .filter((c) => c.args[0] === 'run')
        .map((c) => `${c.args[1] ?? ''} ${c.args[3] ?? ''}`),
    ).toEqual([
      'build @beautinique/shared-a',
      'build @beautinique/shared-tools',
      'build @beautinique/backend-d',
      'test @beautinique/backend-d',
    ]);
  });
});

describe('publish job script', () => {
  const script = join(
    import.meta.dirname,
    '..',
    '..',
    '..',
    '.github',
    'scripts',
    'publish-tarballs.mjs',
  );
  const runIn = (dir: string) => spawnSync(process.execPath, [script, dir], { encoding: 'utf8' });

  it('refuses a missing or tampered release.json before touching npm', () => {
    const r = makeRepo([]);
    repos.push(r);
    const missing = runIn(join(r.root, 'nothing'));
    expect(missing.status).toBe(1);
    expect(missing.stderr).toContain('release.json is missing');

    const bad = (entry: Record<string, string>) => {
      r.write('out/release.json', JSON.stringify([entry]));
      return runIn(join(r.root, 'out'));
    };
    const good = { name: '@beautinique/shared-a', version: '1.0.0', tag: 'latest', file: 'a.tgz' };
    for (const entry of [
      { ...good, file: '../../evil.tgz' },
      { ...good, name: 'left-pad' },
      { ...good, tag: '--access=restricted' },
      { ...good, version: '1.0' },
    ]) {
      const res = bad(entry);
      expect(res.status, JSON.stringify(entry)).toBe(1);
      expect(res.stderr).toContain('release.json has an invalid entry');
    }
    const absent = bad(good);
    expect(absent.status).toBe(1);
    expect(absent.stderr).toContain('a.tgz is missing');
  });
});
