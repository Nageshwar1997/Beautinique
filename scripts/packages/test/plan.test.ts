import { afterEach, describe, expect, it } from 'vitest';

import { parseCommonFlags } from '../lib/args.ts';
import {
  chooseVersions,
  planPublish,
  planRepublish,
  publishCandidates,
  readRegistryState,
  republishCandidates,
} from '../lib/plan.ts';
import type { RegistryPackage } from '../lib/registry.ts';
import { selectPackages } from '../lib/selection.ts';
import { loadWorkspace } from '../lib/workspace.ts';
import { makeRepo, onNpm, privatePackage, publicPackage, testContext } from './helpers.ts';

const repos: { cleanup: () => void }[] = [];
afterEach(() => {
  repos.splice(0).forEach((r) => {
    r.cleanup();
  });
});

/** shared-a <- frontend-b (dependency), backend-c (peer), app (private), frontend-d (dev only) */
function setup(
  answers: unknown[] = [],
  registry: Record<string, RegistryPackage> = {
    '@beautinique/shared-a': onNpm('1.0.0', '1.1.0'),
    '@beautinique/frontend-b': onNpm('1.0.0'),
    '@beautinique/backend-c': onNpm('3.0.0'),
    '@beautinique/frontend-d': onNpm('1.0.0'),
  },
) {
  const r = makeRepo([
    publicPackage('shared', 'a', '1.1.0'),
    publicPackage('frontend', 'b', '1.0.0', {
      dependencies: { '@beautinique/shared-a': '^1.0.0' },
    }),
    publicPackage('backend', 'c', '3.0.0', {
      peerDependencies: { '@beautinique/shared-a': '^1.1.0' },
    }),
    publicPackage('frontend', 'd', '1.0.0', {
      devDependencies: { '@beautinique/shared-a': '^1.0.0' },
    }),
    privatePackage('frontend/app', 'app', {
      dependencies: { '@beautinique/shared-a': '~1.1.0', other: 'workspace:*' },
    }),
  ]);
  repos.push(r);
  const ctx = testContext(r.root, { answers, registry });
  return { ctx, ws: loadWorkspace(ctx) };
}

describe('candidates', () => {
  it('publish takes new and waiting versions; republish takes versions already on npm', async () => {
    const { ctx, ws } = setup([], {
      '@beautinique/shared-a': onNpm('1.0.0'), // local 1.1.0: waiting
      '@beautinique/frontend-b': onNpm('1.0.0'), // in sync
      '@beautinique/backend-c': onNpm('3.1.0'), // local 3.0.0 is behind
    });
    const registry = await readRegistryState(ctx, ws);
    const pub = Object.fromEntries(
      publishCandidates(ws, registry).map((c) => [c.pkg.folder, c.blocked]),
    );
    expect(pub.a).toBeNull();
    expect(pub.d).toBeNull(); // never published
    expect(pub.b).toContain('already on npm');
    expect(pub.c).toContain('behind npm 3.1.0');
    const rep = Object.fromEntries(
      republishCandidates(ws, registry).map((c) => [c.pkg.folder, c.blocked]),
    );
    expect(rep.b).toBeNull();
    expect(rep.a).toContain('waiting to be published');
    expect(rep.d).toContain('never published');
  });
});

describe('selection', () => {
  const candidates = async (answers: unknown[] = []) => {
    const { ctx, ws } = setup(answers);
    return { ctx, list: republishCandidates(ws, await readRegistryState(ctx, ws)) };
  };

  it('answers from flags: all, category, packages', async () => {
    const { ctx, list } = await candidates();
    const names = async (argv: string[]) =>
      (await selectPackages(ctx, list, parseCommonFlags(argv), 'republish')).map((p) => p.folder);
    expect(await names(['--all'])).toEqual(['a', 'b', 'd', 'c']);
    expect(await names(['--category', 'frontend'])).toEqual(['b', 'd']);
    expect(await names(['--packages', 'shared-a,frontend/b,@beautinique/backend-c'])).toEqual([
      'a',
      'b',
      'c',
    ]);
    await expect(names(['--packages', 'nope'])).rejects.toThrow('No package matches "nope"');
  });

  it('asks: all / by category / pick (grouped, blocked ones disabled)', async () => {
    let offered: { separator?: string; name?: string; disabled?: unknown }[] = [];
    const { ctx, list } = await candidates([
      'pick',
      (choices: typeof offered) => {
        offered = choices;
        return ['@beautinique/frontend-b', '@beautinique/backend-c'];
      },
    ]);
    const picked = await selectPackages(ctx, list, parseCommonFlags([]), 'republish');
    expect(picked.map((p) => p.folder)).toEqual(['b', 'c']);
    expect(offered.filter((c) => c.separator).map((c) => c.separator)).toEqual([
      '── shared ──',
      '── frontend ──',
      '── backend ──',
    ]);

    const byCategory = await candidates(['category', ['shared', 'backend']]);
    expect(
      (
        await selectPackages(byCategory.ctx, byCategory.list, parseCommonFlags([]), 'republish')
      ).map((p) => p.folder),
    ).toEqual(['a', 'c']);
  });

  it('explains when nothing can be chosen', async () => {
    const { ctx, ws } = setup([], {});
    const list = republishCandidates(ws, await readRegistryState(ctx, ws));
    await expect(selectPackages(ctx, list, parseCommonFlags([]), 'republish')).rejects.toThrow(
      'Nothing to republish',
    );
  });
});

describe('versions', () => {
  it('one bump for all, or per package with custom', async () => {
    const { ctx, ws } = setup(['same', 'minor']);
    const pkgs = [
      ws.byName.get('@beautinique/shared-a'),
      ws.byName.get('@beautinique/backend-c'),
    ].filter((p) => p !== undefined);
    expect([...(await chooseVersions(ctx, pkgs, null))]).toEqual([
      ['@beautinique/shared-a', '1.2.0'],
      ['@beautinique/backend-c', '3.1.0'],
    ]);

    const each = setup(['each', 'major', 'custom', '3.0.1-beta.0']);
    const pkgs2 = [
      each.ws.byName.get('@beautinique/shared-a'),
      each.ws.byName.get('@beautinique/backend-c'),
    ].filter((p) => p !== undefined);
    expect([...(await chooseVersions(each.ctx, pkgs2, null))]).toEqual([
      ['@beautinique/shared-a', '2.0.0'],
      ['@beautinique/backend-c', '3.0.1-beta.0'],
    ]);
  });

  it('rejects a custom version that is not higher', async () => {
    const { ctx, ws } = setup(['each', 'custom', '1.0.0']);
    const pkg = ws.byName.get('@beautinique/shared-a');
    await expect(chooseVersions(ctx, pkg ? [pkg] : [], null)).rejects.toThrow(
      'Must be higher than 1.1.0',
    );
  });
});

describe('republish plan', () => {
  it('a major bump pulls in broken dependents (peer -> major), rewrites private and dev ranges', async () => {
    const { ctx, ws } = setup([true, true]);
    const registry = await readRegistryState(ctx, ws);
    const plan = await planRepublish(
      ctx,
      ws,
      registry,
      new Map([['@beautinique/shared-a', '2.0.0']]),
      'ask',
    );

    expect(plan.items.map((i) => [i.pkg.folder, i.from, i.to, i.reason, i.tag])).toEqual([
      ['a', '1.1.0', '2.0.0', 'selected', 'latest'],
      ['b', '1.0.0', '1.0.1', 'dependent', 'latest'],
      ['c', '3.0.0', '4.0.0', 'dependent', 'latest'],
    ]);
    const ranges = plan.rangeChanges
      .map((r) => `${r.pkg.name} ${r.field} ${r.from} -> ${r.to}`)
      .sort();
    expect(ranges).toEqual([
      '@beautinique/backend-c peerDependencies ^1.1.0 -> ^2.0.0',
      '@beautinique/frontend-b dependencies ^1.0.0 -> ^2.0.0',
      '@beautinique/frontend-d devDependencies ^1.0.0 -> ^2.0.0',
      'app dependencies ~1.1.0 -> ~2.0.0',
    ]);
    expect(plan.manifests.get('app')?.dependencies?.other).toBe('workspace:*');
    expect(plan.manifests.get('@beautinique/backend-c')?.version).toBe('4.0.0');
    expect(ctx.prompt.asked).toHaveLength(2);
  });

  it('declined dependents keep their range and get a warning', async () => {
    const { ctx, ws } = setup();
    const plan = await planRepublish(
      ctx,
      ws,
      await readRegistryState(ctx, ws),
      new Map([['@beautinique/shared-a', '2.0.0']]),
      'no',
    );
    expect(plan.items.map((i) => i.pkg.folder)).toEqual(['a']);
    expect(plan.rangeChanges.some((r) => r.pkg.folder === 'b')).toBe(false);
    expect(plan.warnings.join('\n')).toContain(
      '@beautinique/frontend-b keeps @beautinique/shared-a "^1.0.0"',
    );
  });

  it('a minor bump needs nothing else, and released dependents get a raised floor', async () => {
    const { ctx, ws } = setup();
    const registry = await readRegistryState(ctx, ws);
    const only = await planRepublish(
      ctx,
      ws,
      registry,
      new Map([['@beautinique/shared-a', '1.2.0']]),
      'yes',
    );
    expect(only.items.map((i) => i.pkg.folder)).toEqual(['a']);
    // only the app's tilde range (~1.1.0) breaks on a minor bump; caret ranges still allow 1.2.0
    expect(only.rangeChanges.map((r) => `${r.pkg.name} ${r.from} -> ${r.to}`)).toEqual([
      'app ~1.1.0 -> ~1.2.0',
    ]);

    const both = await planRepublish(
      ctx,
      ws,
      registry,
      new Map([
        ['@beautinique/frontend-b', '1.1.0'],
        ['@beautinique/shared-a', '1.2.0'],
      ]),
      'yes',
    );
    expect(both.items.map((i) => i.pkg.folder)).toEqual(['a', 'b']);
    expect(both.manifests.get('@beautinique/frontend-b')?.dependencies).toEqual({
      '@beautinique/shared-a': '^1.2.0',
    });
  });

  it('refuses a release that cannot be installed', async () => {
    const r = makeRepo([
      publicPackage('shared', 'a', '1.0.0'),
      publicPackage('frontend', 'b', '1.0.0', {
        dependencies: { '@beautinique/shared-a': '^1.0.0', '@beautinique/backend-k': '^1.0.0' },
      }),
      privatePackage('packages/backend/k', '@beautinique/backend-k'),
    ]);
    repos.push(r);
    const ctx = testContext(r.root, { registry: { '@beautinique/frontend-b': onNpm('1.0.0') } });
    const ws = loadWorkspace(ctx);
    const registry = await readRegistryState(ctx, ws);
    const b = ws.byName.get('@beautinique/frontend-b');
    const error = await planPublish(ctx, ws, registry, b ? [b] : []).catch(
      (e: unknown) => e as Error,
    );
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain(
      'depends on @beautinique/backend-k, which is not published to npm (private)',
    );
    expect((error as Error).message).toContain(
      'needs @beautinique/shared-a "^1.0.0", but npm would find no matching version',
    );
  });

  it('publishing a dependency together with its dependent is fine, dependencies first', async () => {
    const r = makeRepo([
      publicPackage('frontend', 'b', '1.0.0', {
        dependencies: { '@beautinique/shared-a': '^1.0.0' },
      }),
      publicPackage('shared', 'a', '1.0.0'),
    ]);
    repos.push(r);
    const ctx = testContext(r.root);
    const ws = loadWorkspace(ctx);
    const plan = await planPublish(ctx, ws, await readRegistryState(ctx, ws), ws.packages);
    expect(plan.items.map((i) => [i.pkg.folder, i.reason])).toEqual([
      ['a', 'new'],
      ['b', 'new'],
    ]);
  });
});
