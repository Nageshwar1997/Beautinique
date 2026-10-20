import { describe, expect, it } from 'vitest';

import { groupCommits, prependEntry, renderEntry } from '../lib/changelog.ts';
import { classifyPublishError, packDryRun, whoami } from '../lib/npm.ts';
import { serializeManifest } from '../lib/release.ts';
import { checkPackedFiles, entryTargets, typedEntrypoints } from '../lib/verify.ts';
import type { WorkspacePackage } from '../lib/workspace.ts';
import { testContext } from './helpers.ts';

const pkg = (manifest: Partial<WorkspacePackage['manifest']>): WorkspacePackage => ({
  name: '@beautinique/shared-x',
  version: '1.0.0',
  dir: '/x',
  relDir: 'packages/shared/x',
  category: 'shared',
  folder: 'x',
  private: false,
  publishable: true,
  manifest: { name: '@beautinique/shared-x', version: '1.0.0', ...manifest },
});

describe('package contents', () => {
  it('collects every entry point, including nested export conditions', () => {
    expect(
      entryTargets({
        name: 'x',
        version: '1.0.0',
        main: './dist/index.js',
        types: './dist/index.d.ts',
        style: './src/index.css',
        bin: { x: './bin/x.js' },
        exports: {
          '.': { types: './dist/index.d.ts', import: { default: './dist/index.js' } },
          './fonts/*': './src/fonts/*',
          './blocked': null,
        },
      }).sort(),
    ).toEqual(['bin/x.js', 'dist/index.d.ts', 'dist/index.js', 'src/fonts/*', 'src/index.css']);
  });

  it('checks types only where TypeScript can resolve (not CSS, assets or wildcards)', () => {
    expect(
      typedEntrypoints({
        name: 'x',
        version: '1.0.0',
        exports: {
          '.': { style: './src/index.css', default: './src/index.css' },
          './base.css': './src/base.css',
          './fonts/*': './src/fonts/*',
          './vite': { types: './src/vite.d.ts', default: './src/vite.js' },
          './plain': './dist/plain.js',
          './package.json': './package.json',
        },
      }),
    ).toEqual(['./vite', './plain']);
    expect(
      typedEntrypoints({
        name: 'x',
        version: '1.0.0',
        exports: { types: './a.d.ts', default: './a.js' },
      }),
    ).toEqual(['.']);
    expect(typedEntrypoints({ name: 'x', version: '1.0.0', main: './index.js' })).toEqual(['.']);
    expect(typedEntrypoints({ name: 'x', version: '1.0.0', style: './a.css' })).toEqual([]);
  });

  it('passes a complete package', () => {
    const manifest = {
      exports: {
        '.': { types: './dist/index.d.ts', default: './dist/index.js' },
        './fonts/*': './fonts/*',
      },
    };
    expect(
      checkPackedFiles(pkg(manifest), [
        'package.json',
        'README.md',
        'LICENSE',
        'dist/index.js',
        'dist/index.d.ts',
        'fonts/a.woff2',
      ]),
    ).toEqual([]);
  });

  it('finds missing files, unbuilt entries and files that must not ship', () => {
    const problems = checkPackedFiles(
      pkg({ main: './dist/index.js', exports: { './fonts/*': './fonts/*' } }),
      ['package.json', 'src/index.test.ts', '.env.local', 'dist/tsconfig.tsbuildinfo'],
    );
    expect(problems).toEqual([
      'README.md is not in the package.',
      'LICENSE is not in the package (copy the root LICENSE into the package folder).',
      'package.json points at "./dist/index.js", but it is not in the package (not built, or missing from "files").',
      'package.json points at "./fonts/*", but it is not in the package (not built, or missing from "files").',
      'src/index.test.ts is a test file and must not be published.',
      '.env.local is an .env file and must not be published.',
      'dist/tsconfig.tsbuildinfo is a TypeScript build cache and must not be published.',
    ]);
  });
});

describe('changelog', () => {
  const commits = [
    { hash: 'a1', subject: 'feat(shared-x): add formatPrice' },
    { hash: 'b2', subject: 'fix: round half up' },
    { hash: 'c3', subject: 'feat!: drop the old API' },
    { hash: 'd4', subject: 'chore(release): publish packages' },
    { hash: 'e5', subject: 'docs: explain options' },
  ];

  it('groups Conventional Commits and skips release commits', () => {
    expect(Object.fromEntries(groupCommits(commits))).toEqual({
      Features: ['add formatPrice (a1)'],
      Fixes: ['round half up (b2)'],
      'Breaking changes': ['drop the old API (c3)'],
      'Other changes': ['explain options (e5)'],
    });
  });

  it('renders sections in a fixed order with dependency updates', () => {
    const text = renderEntry({ to: '2.0.0', reason: 'selected' }, '2026-10-20', commits, [
      { dep: '@beautinique/shared-y', to: '^3.0.0' },
    ]);
    expect(text.indexOf('### Breaking changes')).toBeLessThan(text.indexOf('### Features'));
    expect(text).toContain('## 2.0.0 (2026-10-20)');
    expect(text).toContain('### Dependencies\n\n- @beautinique/shared-y ^3.0.0');
    expect(renderEntry({ to: '1.0.0', reason: 'new' }, '2026-10-20', [], [])).toContain(
      'Initial release.',
    );
    expect(renderEntry({ to: '1.0.1', reason: 'dependent' }, '2026-10-20', [], [])).toContain(
      'Released with updated dependencies.',
    );
  });

  it('adds new entries on top and never twice', () => {
    const first = prependEntry(null, '1.0.0', '## 1.0.0 (2026-10-01)\n\nInitial release.\n');
    const second = prependEntry(first, '1.1.0', '## 1.1.0 (2026-10-20)\n\n- x\n');
    expect(second.indexOf('## 1.1.0')).toBeLessThan(second.indexOf('## 1.0.0'));
    expect(second.startsWith('# Changelog')).toBe(true);
    expect(prependEntry(second, '1.1.0', 'again')).toBe(second);
  });
});

describe('npm', () => {
  const ctxWith = (code: number, stdout: string, stderr: string) =>
    testContext('/repo', { respond: () => ({ code, stdout, stderr }) });

  it('tells logged out, expired, offline and logged in apart', async () => {
    expect(await whoami(ctxWith(0, 'beautinique\n', ''))).toEqual({
      state: 'logged-in',
      user: 'beautinique',
    });
    expect(
      (await whoami(ctxWith(1, '', 'npm error code ENEEDAUTH\nnpm error need auth'))).state,
    ).toBe('logged-out');
    expect(
      (await whoami(ctxWith(1, '', 'npm error code E401\nnpm error 401 Unauthorized'))).state,
    ).toBe('expired');
    expect(
      await whoami(
        ctxWith(
          1,
          '',
          'npm error code ENOTFOUND\nnpm error getaddrinfo ENOTFOUND registry.npmjs.org',
        ),
      ),
    ).toMatchObject({ state: 'offline' });
  });

  it('classifies publish failures', () => {
    expect(
      classifyPublishError(
        'npm error code EOTP\nnpm error This operation requires a one-time password',
      ).failure,
    ).toBe('otp');
    expect(
      classifyPublishError(
        'npm error 403 You cannot publish over the previously published versions: 1.0.0.',
      ).failure,
    ).toBe('exists');
    expect(
      classifyPublishError('npm error code E401\nnpm error Unable to authenticate').failure,
    ).toBe('auth');
    expect(
      classifyPublishError('npm error code E403\nnpm error 403 Forbidden - no permission').failure,
    ).toBe('forbidden');
    expect(classifyPublishError('npm error code ECONNRESET\nnpm error network').failure).toBe(
      'network',
    );
    expect(classifyPublishError('npm error something else').message).toBe('something else');
  });

  it('reads npm pack output from npm 12 (object) and npm 11 (array)', async () => {
    const files = [{ path: 'package.json', size: 10 }];
    const p = pkg({});
    const v12 = await packDryRun(
      ctxWith(0, JSON.stringify({ [p.name]: { files, size: 1, unpackedSize: 2 } }), ''),
      p,
    );
    const v11 = await packDryRun(
      ctxWith(0, JSON.stringify([{ files, size: 1, unpackedSize: 2 }]), ''),
      p,
    );
    expect(v12).toEqual({ files, size: 1, unpackedSize: 2 });
    expect(v11).toEqual(v12);
  });

  it('keeps the indentation of package.json when writing it back', () => {
    expect(serializeManifest('{\n    "name": "x"\n}\n', { name: 'x', version: '1.0.0' })).toBe(
      '{\n    "name": "x",\n    "version": "1.0.0"\n}\n',
    );
    expect(serializeManifest('', { a: 1 })).toBe('{\n  "a": 1\n}\n');
  });
});
