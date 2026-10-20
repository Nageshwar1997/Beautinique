import { afterEach, describe, expect, it } from 'vitest';

import { parseCommonFlags } from '../lib/args.ts';
import { parseRepository } from '../lib/context.ts';
import { childEnv } from '../lib/exec.ts';
import { dependentsOf, topoSort } from '../lib/graph.ts';
import { bump, bumpKind, highest, prereleaseId, rewriteRange, satisfies } from '../lib/versions.ts';
import { loadWorkspace } from '../lib/workspace.ts';
import { makeRepo, privatePackage, publicPackage } from './helpers.ts';

const repos: { cleanup: () => void }[] = [];
const repo = (...args: Parameters<typeof makeRepo>) => {
  const r = makeRepo(...args);
  repos.push(r);
  return r;
};
afterEach(() => {
  repos.splice(0).forEach((r) => {
    r.cleanup();
  });
});

describe('versions', () => {
  it('bumps and reports the kind', () => {
    expect(bump('1.2.3', 'patch')).toBe('1.2.4');
    expect(bump('1.2.3', 'minor')).toBe('1.3.0');
    expect(bump('1.2.3', 'major')).toBe('2.0.0');
    expect(bump('2.0.0-beta.1', 'patch')).toBe('2.0.0');
    expect(bumpKind('1.2.3', '2.0.0')).toBe('major');
    expect(bumpKind('1.0.0', '1.0.0')).toBe('none');
  });

  it('rewrites only plain version ranges, keeping their style', () => {
    expect(rewriteRange('^1.2.0', '2.0.0')).toBe('^2.0.0');
    expect(rewriteRange('~1.2.0', '1.3.0')).toBe('~1.3.0');
    expect(rewriteRange('1.2.0', '1.3.0')).toBe('1.3.0');
    expect(rewriteRange('^1.0.0-beta.1', '1.0.0')).toBe('^1.0.0');
    for (const odd of ['workspace:*', 'file:../a', '*', 'latest', '>=1 <3', '^1 || ^2']) {
      expect(rewriteRange(odd, '2.0.0')).toBeNull();
    }
  });

  it('checks ranges, prereleases and the highest version', () => {
    expect(satisfies('1.5.0', '^1.0.0')).toBe(true);
    expect(satisfies('2.0.0', '^1.0.0')).toBe(false);
    expect(satisfies('2.0.0-beta.0', '^2.0.0-beta.0')).toBe(true);
    expect(satisfies('1.0.0', 'workspace:*')).toBe(false);
    expect(prereleaseId('2.0.0-beta.3')).toBe('beta');
    expect(prereleaseId('2.0.0-0')).toBe('next');
    expect(prereleaseId('2.0.0')).toBeNull();
    expect(highest(['1.0.0', '1.10.0', '1.2.0', 'nope'])).toBe('1.10.0');
    expect(highest([])).toBeNull();
  });
});

describe('workspace', () => {
  it('reads packages and apps, with category and publishability', () => {
    const { root } = repo([
      publicPackage('shared', 'utils', '1.0.0'),
      privatePackage('packages/backend/server-kit', '@beautinique/backend-server-kit'),
      privatePackage('frontend/customer', 'customer-app'),
    ]);
    const ws = loadWorkspace({ root, scope: '@beautinique' });
    const by = (n: string) => ws.byName.get(n);
    expect(by('@beautinique/shared-utils')).toMatchObject({
      category: 'shared',
      folder: 'utils',
      publishable: true,
      relDir: 'packages/shared/utils',
    });
    expect(by('@beautinique/backend-server-kit')).toMatchObject({
      category: 'backend',
      private: true,
      publishable: false,
    });
    expect(by('customer-app')).toMatchObject({ category: null, publishable: false });
  });

  it('reports every broken rule at once', () => {
    const { root } = repo([
      {
        dir: 'packages/shared/utils',
        manifest: {
          name: '@beautinique/utils',
          version: '1.0.0',
          publishConfig: { access: 'public' },
        },
      },
      { dir: 'packages/web/thing', manifest: { name: '@beautinique/web-thing', version: '1.0.0' } },
      { dir: 'packages/frontend/a', manifest: { name: '@beautinique/frontend-a', version: 'one' } },
      { dir: 'packages/backend/b', manifest: { name: '@beautinique/backend-b', version: '1.0.0' } },
    ]);
    let message = '';
    try {
      loadWorkspace({ root, scope: '@beautinique' });
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toContain('expected "@beautinique/shared-utils"');
    expect(message).toContain('packages must live in packages/<shared|frontend|backend>/<name>');
    expect(message).toContain('version "one" is not valid semver');
    expect(message).toContain('packages/backend/b: public packages need "publishConfig"');
  });

  it('rejects duplicate names', () => {
    const { root } = repo([
      privatePackage('frontend/a', 'same'),
      privatePackage('backend/a', 'same'),
    ]);
    expect(() => loadWorkspace({ root, scope: '@beautinique' })).toThrow(/is also used by/);
  });
});

describe('graph', () => {
  const graphRepo = () =>
    repo([
      publicPackage('shared', 'a', '1.0.0'),
      publicPackage('frontend', 'b', '1.0.0', {
        dependencies: { '@beautinique/shared-a': '^1.0.0' },
      }),
      publicPackage('backend', 'c', '1.0.0', {
        peerDependencies: { '@beautinique/frontend-b': '^1.0.0' },
      }),
      privatePackage('frontend/app', 'app', {
        devDependencies: { '@beautinique/shared-a': '^1.0.0' },
      }),
    ]);

  it('orders dependencies first and keeps unrelated order', () => {
    const ws = loadWorkspace({ root: graphRepo().root, scope: '@beautinique' });
    expect(
      topoSort(['@beautinique/backend-c', '@beautinique/frontend-b', '@beautinique/shared-a'], ws),
    ).toEqual(['@beautinique/shared-a', '@beautinique/frontend-b', '@beautinique/backend-c']);
  });

  it('finds dependents in every field, apps included', () => {
    const ws = loadWorkspace({ root: graphRepo().root, scope: '@beautinique' });
    const found = dependentsOf('@beautinique/shared-a', ws).map((d) => `${d.pkg.name}:${d.field}`);
    expect(found.sort()).toEqual(['@beautinique/frontend-b:dependencies', 'app:devDependencies']);
  });

  it('reports a cycle with its path but ignores devDependency loops', () => {
    const { root } = repo([
      publicPackage('shared', 'a', '1.0.0', {
        dependencies: { '@beautinique/shared-b': '^1.0.0' },
      }),
      publicPackage('shared', 'b', '1.0.0', {
        dependencies: { '@beautinique/shared-a': '^1.0.0' },
      }),
      publicPackage('shared', 'c', '1.0.0', {
        devDependencies: { '@beautinique/shared-d': '^1.0.0' },
      }),
      publicPackage('shared', 'd', '1.0.0', {
        dependencies: { '@beautinique/shared-c': '^1.0.0' },
      }),
    ]);
    const ws = loadWorkspace({ root, scope: '@beautinique' });
    expect(() => topoSort(['@beautinique/shared-a', '@beautinique/shared-b'], ws)).toThrow(
      'Circular dependency: @beautinique/shared-a -> @beautinique/shared-b -> @beautinique/shared-a',
    );
    expect(topoSort(['@beautinique/shared-c', '@beautinique/shared-d'], ws)).toEqual([
      '@beautinique/shared-c',
      '@beautinique/shared-d',
    ]);
  });
});

describe('flags and environment', () => {
  it('parses selection, bump, target and cascade', () => {
    expect(
      parseCommonFlags([
        '--category',
        'shared,frontend',
        '--bump',
        'minor',
        '--target',
        'github',
        '-y',
      ]),
    ).toMatchObject({
      categories: ['shared', 'frontend'],
      bump: 'minor',
      target: 'github',
      yes: true,
      cascade: 'ask',
    });
    expect(
      parseCommonFlags(['--packages', 'shared-a', '--packages', 'frontend-b']).packages,
    ).toEqual(['shared-a', 'frontend-b']);
  });

  it('rejects bad or conflicting flags', () => {
    expect(() => parseCommonFlags(['--category', 'web'])).toThrow('Unknown category "web"');
    expect(() => parseCommonFlags(['--bump', 'huge'])).toThrow('--bump must be');
    expect(() => parseCommonFlags(['--all', '--category', 'shared'])).toThrow('Use only one of');
    expect(() => parseCommonFlags(['--nope'])).toThrow();
  });

  it('honours `npm run publish --dry-run` (npm keeps the flag and sets npm_config_dry_run)', () => {
    process.env.npm_config_dry_run = 'true';
    try {
      expect(parseCommonFlags([]).dryRun).toBe(true);
    } finally {
      delete process.env.npm_config_dry_run;
    }
  });

  it('never passes npm run config such as dry-run on to child npm commands', () => {
    process.env.npm_config_dry_run = 'true';
    process.env.npm_config_tag = 'beta';
    try {
      const env = childEnv({ FORCE_COLOR: '0', REMOVE_ME: undefined });
      expect(env.npm_config_dry_run).toBeUndefined();
      expect(env.npm_config_tag).toBeUndefined();
      expect(env.FORCE_COLOR).toBe('0');
      expect(env.PATH ?? env.Path).toBeDefined();
    } finally {
      delete process.env.npm_config_dry_run;
      delete process.env.npm_config_tag;
    }
  });

  it('reads GitHub repository URLs', () => {
    expect(parseRepository('git+https://github.com/Nageshwar1997/Beautinique.git')).toEqual({
      web: 'https://github.com/Nageshwar1997/Beautinique',
      url: 'git+https://github.com/Nageshwar1997/Beautinique.git',
      slug: 'Nageshwar1997/Beautinique',
    });
    expect(() => parseRepository('https://gitlab.com/a/b')).toThrow('not a GitHub URL');
  });
});
