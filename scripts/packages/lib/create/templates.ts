import type { Category, Repository } from '../context.ts';

/** ts: TypeScript library. react: React component/hook library. css: plain CSS (no build). */
export type Kind = 'ts' | 'react' | 'css';
export type Visibility = 'public' | 'private';

export const KINDS_BY_CATEGORY: Record<Category, Kind[]> = {
  shared: ['ts'],
  frontend: ['ts', 'react', 'css'],
  backend: ['ts'],
};

export const KIND_LABELS: Record<Kind, string> = {
  ts: 'TypeScript library',
  react: 'React library (components / hooks)',
  css: 'CSS package (no build step)',
};

const PLATFORM: Record<Category, 'neutral' | 'browser' | 'node'> = {
  shared: 'neutral',
  frontend: 'browser',
  backend: 'node',
};

export interface PackageSpec {
  scope: string;
  category: Category;
  folder: string;
  kind: Kind;
  visibility: Visibility;
  description: string;
  keywords: string[];
  version: string;
  /** a shared package this one re-exports and builds on */
  extendsPackage: { name: string; version: string } | null;
  author: string;
  license: string;
  repository: Repository;
  defaultBranch: string;
  /** versions used for peer/dev deps, taken from the root package.json */
  toolVersions: Record<string, string>;
  rootLicenseText: string;
}

export const packageName = (spec: Pick<PackageSpec, 'scope' | 'category' | 'folder'>) =>
  `${spec.scope}/${spec.category}-${spec.folder}`;

const relDir = (spec: PackageSpec) => `packages/${spec.category}/${spec.folder}`;

function manifest(spec: PackageSpec): Record<string, unknown> {
  const name = packageName(spec);
  const isPublic = spec.visibility === 'public';
  const base: Record<string, unknown> = {
    name,
    version: spec.version,
    ...(isPublic ? {} : { private: true }),
    description: spec.description,
    keywords: [...new Set(['beautinique', spec.category, ...spec.keywords])],
    author: spec.author,
    license: spec.license,
    repository: { type: 'git', url: spec.repository.url, directory: relDir(spec) },
    homepage: `${spec.repository.web}/tree/${spec.defaultBranch}/${relDir(spec)}#readme`,
    bugs: { url: `${spec.repository.web}/issues` },
    type: 'module',
  };

  if (spec.kind === 'css') {
    return {
      ...base,
      sideEffects: ['*.css'],
      style: './src/index.css',
      exports: {
        '.': { style: './src/index.css', default: './src/index.css' },
        './*.css': './src/*.css',
        './package.json': './package.json',
      },
      files: ['src'],
      engines: { node: '>=24' },
      ...(isPublic ? { publishConfig: { access: 'public' } } : {}),
    };
  }

  const react = spec.kind === 'react';
  const tool = (n: string) => spec.toolVersions[n] ?? '*';
  return {
    ...base,
    sideEffects: false,
    main: './dist/index.js',
    types: './dist/index.d.ts',
    exports: {
      '.': { types: './dist/index.d.ts', default: './dist/index.js' },
      './package.json': './package.json',
    },
    files: ['dist'],
    scripts: {
      build: 'tsdown',
      typecheck: 'tsc --noEmit',
      lint: 'eslint .',
      test: 'vitest run',
    },
    ...(spec.extendsPackage
      ? { dependencies: { [spec.extendsPackage.name]: `^${spec.extendsPackage.version}` } }
      : {}),
    ...(react
      ? {
          peerDependencies: { react: tool('react') },
          devDependencies: { react: tool('react'), '@types/react': tool('@types/react') },
        }
      : {}),
    engines: { node: '>=24' },
    ...(isPublic ? { publishConfig: { access: 'public' } } : {}),
  };
}

function readme(spec: PackageSpec): string {
  const name = packageName(spec);
  const lines = [`# ${name}`, '', spec.description, ''];
  if (spec.visibility === 'public') {
    lines.push('## Install', '', '```bash', `npm install ${name}`, '```', '');
    if (spec.kind === 'react') {
      lines.push('Needs `react` 19 in the app.', '');
    }
    if (spec.kind === 'css') {
      lines.push('```css', `@import '${name}';`, '```', '');
    }
  } else {
    lines.push('Private workspace package: used inside the monorepo, never published to npm.', '');
  }
  if (spec.extendsPackage) {
    lines.push(
      `Builds on [\`${spec.extendsPackage.name}\`](../../shared/${spec.extendsPackage.name.split('-').slice(1).join('-')}) and re-exports all of it.`,
      '',
    );
  }
  lines.push(
    '## API',
    '',
    '_Describe every export here when you add it._',
    '',
    '## License',
    '',
    `${spec.license} © ${spec.author}`,
    '',
  );
  return lines.join('\n');
}

const tsconfig = (spec: PackageSpec) => ({
  $schema: 'https://json.schemastore.org/tsconfig',
  extends: `../../../configs/tsconfig/${spec.category}.json`,
  include: ['src', 'test', '*.config.ts'],
});

const eslintConfig = (spec: PackageSpec) => `// @ts-check
import { packageConfig } from '../../../configs/eslint-config.js';

export default packageConfig({
  platform: '${PLATFORM[spec.category]}',${spec.kind === 'react' ? '\n  react: true,' : ''}
  tsconfigRootDir: import.meta.dirname,
});
`;

const tsdownConfig = (spec: PackageSpec) => `import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: 'esm',
  platform: '${PLATFORM[spec.category]}',
  fixedExtension: false,
  dts: true,
  sourcemap: true,
  clean: true,
});
`;

const vitestConfig = `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { environment: 'jsdom' },
});
`;

const indexTs = (spec: PackageSpec) =>
  spec.extendsPackage ? `export * from '${spec.extendsPackage.name}';\n` : 'export {};\n';

/** A first test, so `npm test` has something real to run; replace it as the API grows. */
const indexTest = (spec: PackageSpec) =>
  spec.extendsPackage
    ? `import * as base from '${spec.extendsPackage.name}';
import { describe, expect, it } from 'vitest';

import * as api from '../src/index';

describe('${packageName(spec)}', () => {
  it('re-exports everything from ${spec.extendsPackage.name}', () => {
    for (const key of Object.keys(base)) {
      expect(api).toHaveProperty(key);
    }
  });
});
`
    : `import { describe, expect, it } from 'vitest';

import * as api from '../src/index';

describe('${packageName(spec)}', () => {
  it('loads its entry point', () => {
    expect(api).toBeTypeOf('object');
  });
});
`;

/** Every file of a new package: relative path -> content. */
export function renderPackage(spec: PackageSpec): Map<string, string> {
  const files = new Map<string, string>();
  files.set('package.json', `${JSON.stringify(manifest(spec), null, 2)}\n`);
  files.set('README.md', readme(spec));
  if (spec.visibility === 'public') {
    files.set('LICENSE', spec.rootLicenseText);
  }
  if (spec.kind === 'css') {
    files.set('src/index.css', `/* ${packageName(spec)} */\n`);
    return files;
  }
  files.set('tsconfig.json', `${JSON.stringify(tsconfig(spec), null, 2)}\n`);
  files.set('eslint.config.js', eslintConfig(spec));
  files.set('tsdown.config.ts', tsdownConfig(spec));
  if (spec.kind === 'react') {
    files.set('vitest.config.ts', vitestConfig);
  }
  files.set('src/index.ts', indexTs(spec));
  files.set('test/index.test.ts', indexTest(spec));
  return files;
}
