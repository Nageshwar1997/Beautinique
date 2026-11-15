// What each CI job runs (scripts/ci/lib/plan.ts): same-code skip, affected only, everything when in
// doubt. The last block reads this repository itself, so a new kind of link between workspaces that
// the graph misses shows up here.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  affected,
  classify,
  findPassedRun,
  type Job,
  loadWorkspaces,
  planJob,
  workspaceDirs,
  type WorkspaceInfo,
} from '../lib/plan.ts';

const PATTERNS = ['packages/*/*', 'frontend/*', 'backend/*'];

/** A small repository: file path → content. */
const FILES: Record<string, string> = {
  'package.json': '{}',
  'packages/shared/zod/package.json': JSON.stringify({
    name: '@x/shared-zod',
    scripts: { test: 'vitest', build: 'tsc' },
  }),
  'packages/shared/zod/src/index.ts': "export * from './zod.ts';",
  'packages/backend/kit/package.json': JSON.stringify({
    name: '@x/backend-kit',
    scripts: { test: 'vitest' },
    dependencies: { '@x/shared-zod': '*', express: '*' },
  }),
  'packages/backend/kit/test/kit.test.ts':
    "import { list } from '../../../../scripts/mutation/lib/list.ts';",
  'packages/frontend/styles/package.json': JSON.stringify({
    name: '@x/frontend-styles',
    scripts: { test: 'vitest' },
  }),
  'packages/frontend/components/package.json': JSON.stringify({
    name: '@x/frontend-components',
    scripts: { test: 'vitest' },
    peerDependencies: { '@x/frontend-styles': '*' },
    devDependencies: { '@x/shared-zod': '*' },
  }),
  'frontend/shop/package.json': JSON.stringify({
    name: 'shop',
    scripts: { test: 'vitest', e2e: 'playwright test' },
    dependencies: { '@x/frontend-components': '*' },
  }),
  'frontend/shop/app/app.css': "@import '../../../packages/frontend/styles/src/tailwind.css';",
  'frontend/blank/package.json': JSON.stringify({
    name: 'blank',
    scripts: { test: 'vitest', e2e: 'playwright test' },
  }),
  'frontend/blank/README.md': "import x from '../shop/app/app.css'",
  'backend/core/package.json': JSON.stringify({
    name: 'core',
    scripts: { test: 'vitest' },
    dependencies: { '@x/backend-kit': '*' },
  }),
  'backend/core/test/fixtures/other.ts':
    "import type { e } from '../../../identity/src/errors.ts';",
  'backend/identity/package.json': JSON.stringify({
    name: 'identity',
    scripts: { build: 'tsc' },
  }),
  'backend/bundle/package.json': JSON.stringify({
    name: 'bundle',
    scripts: { test: 'vitest' },
    dependencies: { core: '*', identity: '*' },
  }),
  'docs/HANDOFF.md': '',
  'scripts/mutation/lib/list.ts': '',
  'not-a-workspace/package.json': JSON.stringify({ name: 'outside' }),
};

const workspaces = loadWorkspaces({
  patterns: PATTERNS,
  files: Object.keys(FILES),
  read: (path) => FILES[path] ?? '',
});

const plan = (job: Job, changed: string[] | null, extra: { full?: boolean; app?: string } = {}) =>
  planJob({ job, full: false, changed, workspaces, ...extra });

describe('the workspaces', () => {
  it('are the folders the root patterns match that have a package.json', () => {
    expect(workspaceDirs(PATTERNS, Object.keys(FILES))).toEqual([
      'backend/bundle',
      'backend/core',
      'backend/identity',
      'frontend/blank',
      'frontend/shop',
      'packages/backend/kit',
      'packages/frontend/components',
      'packages/frontend/styles',
      'packages/shared/zod',
    ]);
  });

  it('use what their package.json names, every kind of dependency, workspaces only', () => {
    const uses = Object.fromEntries(workspaces.map((w) => [w.dir, w.uses]));
    expect(uses['packages/backend/kit']).toEqual(['packages/shared/zod']);
    expect(uses['packages/frontend/components']).toEqual([
      'packages/frontend/styles',
      'packages/shared/zod',
    ]);
    expect(uses['backend/bundle']).toEqual(['backend/core', 'backend/identity']);
  });

  it('use what a relative import reaches outside their folder, in code and CSS only', () => {
    const uses = Object.fromEntries(workspaces.map((w) => [w.dir, w.uses]));
    expect(uses['frontend/shop']).toEqual([
      'packages/frontend/components',
      'packages/frontend/styles',
    ]);
    expect(uses['backend/core']).toEqual(['backend/identity', 'packages/backend/kit']);
    // a README is not code; scripts/ is not a workspace (a change there runs everything)
    expect(uses['frontend/blank']).toEqual([]);
  });

  it('a workspace without a name is an error, not a guess', () => {
    expect(() =>
      loadWorkspaces({
        patterns: PATTERNS,
        files: ['frontend/x/package.json'],
        read: () => '{}',
      }),
    ).toThrow(/has no name/);
  });
});

describe('the changed files', () => {
  const dirs = workspaces.map((w) => w.dir);

  it('are docs, global or in a workspace; a file inside a workspace is never docs', () => {
    expect(
      classify(
        [
          'docs/RULES.md',
          'linkedin-posts/2026-11-14/post.md',
          'CLAUDE.md',
          '.claude/skills/pr/SKILL.md',
          '.vscode/settings.json',
          'frontend/shop/README.md',
          'frontend/shop/app/root.tsx',
          'package-lock.json',
          'scripts/e2e/app.ts',
          'infra/docker-compose.yml',
          '.github/workflows/ci.yml',
          'frontend/gone/src/index.ts',
        ],
        dirs,
      ),
    ).toEqual({
      docs: [
        'docs/RULES.md',
        'linkedin-posts/2026-11-14/post.md',
        'CLAUDE.md',
        '.claude/skills/pr/SKILL.md',
        '.vscode/settings.json',
      ],
      global: [
        'package-lock.json',
        'scripts/e2e/app.ts',
        'infra/docker-compose.yml',
        '.github/workflows/ci.yml',
        // a workspace that no longer exists is not known, so it runs everything
        'frontend/gone/src/index.ts',
      ],
      workspaces: ['frontend/shop'],
    });
  });

  it('reach every workspace that uses a changed one, through others too', () => {
    expect(affected(['packages/shared/zod'], workspaces)).toEqual([
      'backend/bundle',
      'backend/core',
      'frontend/shop',
      'packages/backend/kit',
      'packages/frontend/components',
      'packages/shared/zod',
    ]);
    expect(affected(['frontend/shop'], workspaces)).toEqual(['frontend/shop']);
    expect(affected([], workspaces)).toEqual([]);
  });
});

describe('a job', () => {
  it('runs nothing when this code already passed, however it changed', () => {
    for (const job of ['static', 'test-scripts', 'test-backend', 'verify'] as const) {
      const result = planJob({ job, full: true, passedRun: 42, changed: null, workspaces });
      expect(result).toMatchObject({ run: false, everything: false, build: '' });
      expect(result.reason).toMatch(/run 42/);
    }
    expect(
      planJob({ job: 'e2e', app: 'shop', full: true, passedRun: 42, changed: null, workspaces })
        .run,
    ).toBe(false);
  });

  it('runs everything on a push or a pull request into release or main', () => {
    const options = { full: true, changed: null };
    expect(plan('static', null, options)).toMatchObject({
      run: true,
      code: true,
      everything: true,
    });
    expect(plan('test-scripts', null, options).run).toBe(true);
    expect(plan('test-backend', null, options).args).toBe(
      '--workspace=backend/bundle --workspace=backend/core --workspace=packages/backend/kit --workspace=packages/shared/zod',
    );
    expect(plan('test-frontend', null, options).args).toBe(
      '--workspace=frontend/blank --workspace=frontend/shop --workspace=packages/frontend/components --workspace=packages/frontend/styles',
    );
    expect(plan('e2e', null, { ...options, app: 'blank' }).run).toBe(true);
    expect(plan('verify', null, options)).toMatchObject({ run: true, args: '--all' });
  });

  it('runs everything when the changed files are unknown or one is outside the workspaces', () => {
    for (const changed of [null, ['frontend/shop/app/root.tsx', 'scripts/e2e/app.ts']]) {
      expect(plan('static', changed)).toMatchObject({ run: true, code: true, everything: true });
      expect(plan('e2e', changed, { app: 'blank' }).run).toBe(true);
      expect(plan('verify', changed).args).toBe('--all');
    }
  });

  it('after a docs-only change: the format check, nothing else', () => {
    const changed = ['docs/TASKS.md', 'linkedin-posts/x/post.md'];
    expect(plan('static', changed)).toMatchObject({ run: true, code: false, everything: false });
    expect(plan('static', changed).reason).toMatch(/only docs changed: the format check only/);
    for (const job of ['test-scripts', 'test-backend', 'test-frontend', 'verify'] as const) {
      expect(plan(job, changed).run).toBe(false);
    }
    expect(plan('e2e', changed, { app: 'shop' }).run).toBe(false);
  });

  it('after an app change: that app, its tests and E2E, and the repo-wide script tests', () => {
    const changed = ['frontend/shop/app/root.tsx'];
    expect(plan('static', changed)).toMatchObject({ run: true, code: true, everything: false });
    expect(plan('test-scripts', changed).run).toBe(true);
    expect(plan('test-frontend', changed).args).toBe('--workspace=frontend/shop');
    expect(plan('test-backend', changed).run).toBe(false);
    expect(plan('e2e', changed, { app: 'shop' }).run).toBe(true);
    expect(plan('e2e', changed, { app: 'blank' }).run).toBe(false);
    expect(plan('verify', changed).run).toBe(false);
  });

  it('after a frontend package change: it and everything that uses it, with its verify', () => {
    const changed = ['packages/frontend/styles/src/tokens.css'];
    expect(plan('test-frontend', changed).args).toBe(
      '--workspace=frontend/shop --workspace=packages/frontend/components --workspace=packages/frontend/styles',
    );
    expect(plan('test-backend', changed).run).toBe(false);
    expect(plan('e2e', changed, { app: 'shop' }).run).toBe(true);
    expect(plan('e2e', changed, { app: 'blank' }).run).toBe(false);
    expect(plan('verify', changed).args).toBe(
      '--packages @x/frontend-components,@x/frontend-styles',
    );
  });

  it("after a backend change: the backend's tests and every app's E2E (it runs the whole backend)", () => {
    const changed = ['backend/identity/src/users.ts'];
    expect(plan('test-backend', changed).args).toBe(
      // identity has no test script; core (a fixture imports it) and bundle use it
      '--workspace=backend/bundle --workspace=backend/core',
    );
    expect(plan('test-frontend', changed).run).toBe(false);
    expect(plan('e2e', changed, { app: 'shop' }).run).toBe(true);
    expect(plan('e2e', changed, { app: 'blank' }).run).toBe(true);
    expect(plan('verify', changed).run).toBe(false);
  });

  it('after a shared package change: both sides', () => {
    const changed = ['packages/shared/zod/src/index.ts'];
    expect(plan('test-backend', changed).run).toBe(true);
    expect(plan('test-frontend', changed).args).toBe(
      '--workspace=frontend/shop --workspace=packages/frontend/components',
    );
    expect(plan('e2e', changed, { app: 'blank' }).run).toBe(true);
    expect(plan('verify', changed).args).toBe(
      '--packages @x/backend-kit,@x/frontend-components,@x/shared-zod',
    );
  });

  it('builds only what the job runs and what that needs; static and test-scripts everything', () => {
    const all = { full: true };
    expect(plan('static', null, all).build).toBe('');
    expect(plan('test-scripts', null, all).build).toBe('');
    expect(plan('verify', null, all).build).toBe('');
    expect(plan('test-backend', null, all).build).toBe(
      '--filter=bundle... --filter=core... --filter=@x/backend-kit... --filter=@x/shared-zod...',
    );
    expect(plan('test-frontend', null, all).build).toBe(
      '--filter=blank... --filter=shop... --filter=@x/frontend-components... --filter=@x/frontend-styles...',
    );
    expect(plan('e2e', null, { ...all, app: 'blank' }).build).toBe(
      '--filter=blank... --filter=bundle...',
    );

    const appChange = ['frontend/shop/app/root.tsx'];
    expect(plan('test-frontend', appChange).build).toBe('--filter=shop...');
    expect(plan('e2e', appChange, { app: 'shop' }).build).toBe(
      '--filter=shop... --filter=bundle...',
    );
    expect(plan('static', appChange).build).toBe('');
  });

  it('an E2E job without a bundle workspace builds everything', () => {
    const noBundle = workspaces.filter((w) => w.dir !== 'backend/bundle');
    const result = planJob({
      job: 'e2e',
      app: 'shop',
      full: true,
      changed: null,
      workspaces: noBundle,
    });
    expect(result).toMatchObject({ run: true, build: '' });
  });

  it('an E2E job names an app with an e2e script', () => {
    expect(() => plan('e2e', [], { app: 'nope' })).toThrow(/No app frontend\/nope/);
    const noE2e: WorkspaceInfo[] = [{ dir: 'frontend/a', name: 'a', scripts: ['test'], uses: [] }];
    expect(() =>
      planJob({ job: 'e2e', app: 'a', full: true, changed: null, workspaces: noE2e }),
    ).toThrow(/with an e2e script/);
  });

  it('npm arguments only from plain workspace names', () => {
    const odd: WorkspaceInfo[] = [{ dir: 'frontend/$(x)', name: 'x', scripts: ['test'], uses: [] }];
    expect(() =>
      planJob({ job: 'test-frontend', full: true, changed: null, workspaces: odd }),
    ).toThrow(/Unexpected workspace name/);
  });
});

describe('the marker of a passed run', () => {
  const TREE = 'a'.repeat(40);
  const REPO = 'owner/repo';
  const artifact = (run: Record<string, unknown>, expired = false) => ({
    expired,
    workflow_run: { id: 7, repository_id: 1, head_repository_id: 1, ...run },
  });
  const api =
    (artifacts: unknown[], runs: Record<string, unknown> = {}) =>
    (path: string): unknown => {
      if (path === `repos/${REPO}/actions/artifacts?name=ci-pass-${TREE}&per_page=20`) {
        return { artifacts };
      }
      const id = /actions\/runs\/(\d+)$/.exec(path)?.[1] ?? '';
      if (id in runs) return runs[id];
      throw new Error(`unexpected ${path}`);
    };
  const green = { path: '.github/workflows/ci.yml', conclusion: 'success' };

  it('counts: not expired, this repository, ci.yml, finished green', () => {
    expect(findPassedRun(TREE, REPO, api([artifact({})], { 7: green }))).toBe(7);
  });

  it("does not count a fork's, an expired one, another workflow's or an unfinished run's", () => {
    expect(
      findPassedRun(TREE, REPO, api([artifact({ head_repository_id: 2 })], { 7: green })),
    ).toBe(undefined);
    expect(findPassedRun(TREE, REPO, api([artifact({}, true)], { 7: green }))).toBe(undefined);
    expect(
      findPassedRun(
        TREE,
        REPO,
        api([artifact({})], { 7: { ...green, path: '.github/workflows/x.yml' } }),
      ),
    ).toBe(undefined);
    expect(
      findPassedRun(TREE, REPO, api([artifact({})], { 7: { ...green, conclusion: null } })),
    ).toBe(undefined);
    expect(
      findPassedRun(TREE, REPO, api([artifact({})], { 7: { ...green, conclusion: 'failure' } })),
    ).toBe(undefined);
  });

  it('takes the first good one of several', () => {
    const bad = artifact({ id: 5, head_repository_id: 9 });
    expect(findPassedRun(TREE, REPO, api([bad, artifact({ id: 8 })], { 8: green }))).toBe(8);
  });

  it('a failed call or an odd tree or repository name counts as no marker', () => {
    const failing = () => {
      throw new Error('gh: HTTP 500');
    };
    expect(findPassedRun(TREE, REPO, failing)).toBe(undefined);
    expect(findPassedRun(TREE, REPO, api([artifact({})]))).toBe(undefined);
    expect(findPassedRun('not-a-tree', REPO, api([artifact({})], { 7: green }))).toBe(undefined);
    expect(findPassedRun(TREE, 'owner/repo?x=1', api([artifact({})], { 7: green }))).toBe(
      undefined,
    );
    expect(findPassedRun(TREE, REPO, () => ({ artifacts: 'no' }))).toBe(undefined);
  });
});

describe('this repository', () => {
  const root = join(import.meta.dirname, '../../..');
  const files = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' })
    .split('\0')
    .filter((file) => file !== '');
  const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
    workspaces: string[];
  };
  const real = loadWorkspaces({
    patterns: manifest.workspaces,
    files,
    read: (path) => readFileSync(join(root, path), 'utf8'),
  });
  const uses = (dir: string) => real.find((w) => w.dir === dir)?.uses ?? [];

  it('the bundle uses every backend deployable', () => {
    const deployables = real
      .map((w) => w.dir)
      .filter((dir) => dir.startsWith('backend/') && dir !== 'backend/bundle');
    expect(deployables.length).toBeGreaterThan(0);
    expect(uses('backend/bundle')).toEqual(expect.arrayContaining(deployables));
  });

  it('every app is reached from the styles package', () => {
    const apps = real.map((w) => w.dir).filter((dir) => dir.startsWith('frontend/'));
    expect(affected(['packages/frontend/styles'], real)).toEqual(expect.arrayContaining(apps));
  });

  it('every app and deployable uses some package, so a package change reaches it', () => {
    const packages = real.map((w) => w.dir).filter((dir) => dir.startsWith('packages/'));
    expect(affected(packages, real)).toEqual(real.map((w) => w.dir));
  });
});
