import type { Category } from './workspace.ts';

// What `create` writes for a new package (docs/tasks/28-packages/TASK.md §3.1). The tool versions
// are exact pins like the rest of the repo; react and react-dom are a peer range with the same
// range in devDependencies (RULES CR-35).
const FRONTEND_DEV_DEPENDENCIES = {
  '@tailwindcss/vite': '4.3.5',
  '@types/react': '19.3.0',
  '@types/react-dom': '19.3.0',
  '@vitejs/plugin-react': '6.3.0',
  react: '^19.3.1',
  'react-dom': '^19.3.1',
  tailwindcss: '4.3.5',
  vite: '8.3.8',
};
const REACT_PEERS = { react: '^19.3.1', 'react-dom': '^19.3.1' };

export interface TemplateInput {
  category: Category;
  /** The folder name, `money` in packages/shared/money. */
  name: string;
  /** `@beautinique/<category>-<name>`. */
  packageName: string;
  description: string;
  version: string;
  node: string;
  license: string;
}

function json(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function readme({ packageName, description, category }: TemplateInput): string {
  const tailwind =
    category === 'frontend'
      ? `\nImport the package's Tailwind CSS in every app and playground that shows its components, or the classes are dropped (docs/RULES.md CR-33):\n\n\`\`\`css\n@import '${packageName}/tailwind.css';\n\`\`\`\n`
      : '';
  return `# ${packageName}

${description}

## Install

\`\`\`sh
npm install ${packageName}
\`\`\`
${tailwind}
## Usage

\`\`\`ts
import { PACKAGE_NAME } from '${packageName}';
\`\`\`

## API

- \`PACKAGE_NAME\`: the name of this package. Replace it with the real API.

## Visibility

Write here whether this package should really be private or public for security, and why (docs/RULES.md CR-36). Every package is published publicly; this is only to understand it.
`;
}

// Every file of the new package, path relative to the package folder.
export function packageFiles(input: TemplateInput): Record<string, string> {
  const { category, name, packageName, description, version, node, license } = input;
  const frontend = category === 'frontend';
  const files = [
    'dist',
    'README.md',
    'CHANGELOG.md',
    'LICENSE',
    ...(frontend ? ['tailwind.css'] : []),
  ];
  const exports: Record<string, unknown> = {
    '.': { types: './dist/index.d.mts', import: './dist/index.mjs' },
    './package.json': './package.json',
    ...(frontend ? { './tailwind.css': './tailwind.css' } : {}),
  };

  const manifest = {
    name: packageName,
    version,
    description,
    license: 'MIT',
    type: 'module',
    exports,
    files,
    engines: { node },
    repository: {
      type: 'git',
      url: 'git+https://github.com/Nageshwar1997/Beautinique.git',
      directory: `packages/${category}/${name}`,
    },
    publishConfig: { access: 'public', provenance: true },
    scripts: {
      build: 'tsdown',
      typecheck: 'tsc -p tsconfig.json',
      lint: 'eslint .',
      test: 'vitest run --coverage',
      ...(frontend ? { playground: 'vite playground' } : {}),
    },
    ...(frontend
      ? { peerDependencies: REACT_PEERS, devDependencies: FRONTEND_DEV_DEPENDENCIES }
      : {}),
  };

  const tsconfig = {
    $schema: 'https://json.schemastore.org/tsconfig',
    extends: `../../../configs/typescript/${frontend ? 'react' : 'node'}.json`,
    compilerOptions: frontend ? { types: ['node', 'vite/client'] } : {},
    include: [
      'src',
      'test',
      'tsdown.config.ts',
      'vitest.config.ts',
      ...(frontend ? ['playground'] : []),
    ],
  };

  const result: Record<string, string> = {
    'package.json': json(manifest),
    'tsconfig.json': json(tsconfig),
    'tsdown.config.ts': `import { defineConfig } from 'tsdown';

export default defineConfig({ entry: ['src/index.ts'], format: 'esm', dts: true, clean: true });
`,
    'vitest.config.ts': `import { workspaceTestConfig } from '../../../configs/vitest/workspace.ts';

export default workspaceTestConfig();
`,
    'src/index.ts': `export const PACKAGE_NAME = '${packageName}';\n`,
    'test/index.test.ts': `import { describe, expect, it } from 'vitest';

import { PACKAGE_NAME } from '../src/index.ts';

describe('${packageName}', () => {
  it('exports its name', () => {
    expect(PACKAGE_NAME).toBe('${packageName}');
  });
});
`,
    'README.md': readme(input),
    'CHANGELOG.md': `# Changelog: ${packageName}\n`,
    LICENSE: license,
  };

  if (frontend) {
    result['tailwind.css'] =
      `/* Import this in every app and playground that shows this package's components (docs/RULES.md CR-33). */\n@source './dist';\n`;
    result['playground/index.html'] = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${packageName} playground</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./main.tsx"></script>
  </body>
</html>
`;
    result['playground/main.tsx'] = `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { PACKAGE_NAME } from '../src/index.ts';
import './styles.css';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <p className="p-4 font-medium">{PACKAGE_NAME}</p>
    </StrictMode>,
  );
}
`;
    result['playground/styles.css'] = `@import 'tailwindcss';
@source '../src';
`;
    result['playground/vite.config.ts'] = `import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({ plugins: [react(), tailwindcss()] });
`;
  }
  return result;
}
