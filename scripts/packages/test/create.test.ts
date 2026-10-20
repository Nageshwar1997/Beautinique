import { spawn } from 'node:child_process';
import { cpSync, existsSync, readFileSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { parseRepository } from '../lib/context.ts';
import { type PackageSpec, renderPackage } from '../lib/create/templates.ts';
import {
  parseKeywords,
  validateDescription,
  validateKeywords,
  validateName,
} from '../lib/create/validate.ts';
import { loadWorkspace } from '../lib/workspace.ts';
import { makeRepo, publicPackage } from './helpers.ts';
import { type FakeRegistry, startRegistry } from './registry-server.ts';

const REPO_ROOT = join(import.meta.dirname, '..', '..', '..');

const spec = (over: Partial<PackageSpec> = {}): PackageSpec => ({
  scope: '@beautinique',
  category: 'shared',
  folder: 'date-format',
  kind: 'ts',
  visibility: 'public',
  description: 'Formats dates for invoices.',
  keywords: ['dates'],
  version: '1.0.0',
  extendsPackage: null,
  author: 'Test Author',
  license: 'MIT',
  repository: parseRepository('git+https://github.com/example/fixture.git'),
  defaultBranch: 'main',
  toolVersions: { react: '^19.3.1', '@types/react': '^19.3.0' },
  rootLicenseText: 'MIT License\n',
  ...over,
});

describe('create: validation', () => {
  const { root, cleanup } = makeRepo([publicPackage('shared', 'taken', '1.0.0')]);
  afterAll(cleanup);
  const ctx = {
    root,
    scope: '@beautinique',
    category: 'shared' as const,
    workspace: loadWorkspace({ root, scope: '@beautinique' }),
  };

  it('accepts good names and explains bad ones', () => {
    expect(validateName('date-format', ctx)).toBe(true);
    expect(validateName('Date', ctx)).toContain('lowercase');
    expect(validateName('a--b', ctx)).toContain('single hyphens');
    expect(validateName('trailing-', ctx)).toContain('single hyphens');
    expect(validateName('shared-utils', ctx)).toContain('Leave out "shared"');
    expect(validateName('frontend', ctx)).toContain('Leave out "frontend"');
    expect(validateName('taken', ctx)).toContain('already exists');
    expect(validateName('a'.repeat(210), ctx)).toContain('longer than npm allows');
  });

  it('checks descriptions and keywords', () => {
    expect(validateDescription('short')).toContain('at least 10');
    expect(validateDescription('A good description.')).toBe(true);
    expect(parseKeywords(' Dates, dates ,Time Zone,')).toEqual(['dates', 'time-zone']);
    expect(validateKeywords('ok, x')).toContain('"x"');
    expect(
      validateKeywords(Array.from({ length: 11 }, (_, i) => `k${String(i)}`).join(',')),
    ).toContain('at most 10');
  });
});

describe('create: templates', () => {
  const manifest = (s: PackageSpec) =>
    JSON.parse(renderPackage(s).get('package.json') ?? '{}') as Record<string, unknown>;

  it('a public TypeScript package is ESM-only with types, LICENSE and publishConfig', () => {
    const files = renderPackage(spec());
    expect([...files.keys()]).toEqual([
      'package.json',
      'README.md',
      'LICENSE',
      'tsconfig.json',
      'eslint.config.js',
      'tsdown.config.ts',
      'src/index.ts',
      'test/index.test.ts',
    ]);
    expect(manifest(spec()).scripts).toMatchObject({ test: 'vitest run' });
    expect(files.get('tsconfig.json')).toContain('"test"');
    expect(files.get('test/index.test.ts')).toContain("from '../src/index'");
    expect(manifest(spec())).toMatchObject({
      name: '@beautinique/shared-date-format',
      type: 'module',
      exports: { '.': { types: './dist/index.d.ts', default: './dist/index.js' } },
      files: ['dist'],
      keywords: ['beautinique', 'shared', 'dates'],
      repository: { directory: 'packages/shared/date-format' },
      publishConfig: { access: 'public' },
    });
    expect(files.get('tsdown.config.ts')).toContain("platform: 'neutral'");
    expect(files.get('tsdown.config.ts')).toContain('fixedExtension: false');
  });

  it('private packages have no LICENSE and no publishConfig', () => {
    const s = spec({ visibility: 'private' });
    expect(manifest(s)).toMatchObject({ private: true });
    expect(manifest(s).publishConfig).toBeUndefined();
    expect(renderPackage(s).has('LICENSE')).toBe(false);
  });

  it('React packages peer-depend on react and test in jsdom', () => {
    const s = spec({ category: 'frontend', kind: 'react' });
    expect(manifest(s)).toMatchObject({
      peerDependencies: { react: '^19.0.0' },
      devDependencies: { react: '^19.3.1' },
    });
    expect(renderPackage(s).get('vitest.config.ts')).toContain("environment: 'jsdom'");
    expect(renderPackage(s).get('eslint.config.js')).toContain('react: true');
  });

  it('CSS packages ship src with style exports and no build', () => {
    const s = spec({ category: 'frontend', kind: 'css' });
    expect(manifest(s)).toMatchObject({
      files: ['src'],
      sideEffects: ['*.css'],
      style: './src/index.css',
    });
    expect(manifest(s).scripts).toBeUndefined();
    expect([...renderPackage(s).keys()]).toEqual([
      'package.json',
      'README.md',
      'LICENSE',
      'src/index.css',
    ]);
  });

  it('frontend/backend packages can build on a shared package', () => {
    const s = spec({
      category: 'backend',
      extendsPackage: { name: '@beautinique/shared-date-format', version: '1.2.0' },
    });
    expect(manifest(s).dependencies).toEqual({ '@beautinique/shared-date-format': '^1.2.0' });
    expect(renderPackage(s).get('src/index.ts')).toBe(
      "export * from '@beautinique/shared-date-format';\n",
    );
    expect(renderPackage(s).get('tsdown.config.ts')).toContain("platform: 'node'");
    expect(renderPackage(s).get('test/index.test.ts')).toContain(
      "import * as base from '@beautinique/shared-date-format';",
    );
  });
});

/**
 * The real thing: create each kind in a throwaway monorepo (with this repo's configs and node_modules),
 * then run its own scripts and the full publish check (npm pack contents, publint, arethetypeswrong).
 * Nothing is installed, so this repo's node_modules is only read.
 */
describe('create: generated packages pass every check', () => {
  let registry: FakeRegistry;
  let repo: ReturnType<typeof makeRepo>;

  beforeAll(async () => {
    registry = await startRegistry();
    repo = makeRepo([]);
    cpSync(join(REPO_ROOT, 'configs'), join(repo.root, 'configs'), { recursive: true });
    cpSync(join(REPO_ROOT, '.prettierrc.json'), join(repo.root, '.prettierrc.json'));
    symlinkSync(join(REPO_ROOT, 'node_modules'), join(repo.root, 'node_modules'), 'junction');
  });
  afterAll(async () => {
    await registry.close();
    repo.cleanup();
  });

  const run = (file: string, args: string[]) => {
    const child = spawn(process.execPath, [file, ...args], {
      cwd: repo.root,
      env: {
        ...process.env,
        BEAUTINIQUE_ROOT: repo.root,
        BEAUTINIQUE_REGISTRY: registry.url,
        NO_COLOR: '1',
        FORCE_COLOR: '0',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let out = '';
    const collect = (chunk: Buffer) => {
      out += chunk.toString();
    };
    child.stdout.on('data', collect);
    child.stderr.on('data', collect);
    return new Promise<{ code: number | null; out: string }>((resolve) => {
      child.on('close', (code) => {
        resolve({ code, out });
      });
    });
  };
  const bin = (name: string) => join(REPO_ROOT, 'scripts', 'packages', 'bin', `${name}.ts`);

  for (const [category, kind, folder] of [
    ['shared', 'ts', 'money'],
    ['backend', 'ts', 'queue-names'],
    ['frontend', 'react', 'buttons'],
    ['frontend', 'css', 'tokens'],
  ] as const) {
    it(`${category} ${kind}`, async () => {
      const created = await run(bin('create'), [
        '--yes',
        '--skip-install',
        '--category',
        category,
        '--kind',
        kind,
        '--name',
        folder,
        '--description',
        `Test ${kind} package for ${category}.`,
        '--keywords',
        'test',
        '--visibility',
        'public',
        '--extends',
        'none',
      ]);
      expect(created.out).toContain(`Created packages/${category}/${folder}`);
      expect(created.code).toBe(0);
      expect(existsSync(join(repo.root, 'packages', category, `.${folder}.creating`))).toBe(false);

      // formatted exactly like the repo's Prettier config would
      const prettier = await run(
        join(REPO_ROOT, 'node_modules', 'prettier', 'bin', 'prettier.cjs'),
        ['--check', `packages/${category}/${folder}`],
      );
      expect(prettier.out).toContain('All matched files use Prettier code style');

      const verified = await run(bin('verify'), ['--packages', `${category}-${folder}`, '--yes']);
      expect(verified.out).toContain('ready to publish');
      expect(verified.code).toBe(0);
      if (kind !== 'css') {
        for (const step of ['build', 'typecheck', 'lint', 'test']) {
          expect(verified.out).toContain(step);
        }
        expect(
          readFileSync(join(repo.root, 'packages', category, folder, 'dist', 'index.js'), 'utf8'),
        ).toBeDefined();
      }
    });
  }
});
