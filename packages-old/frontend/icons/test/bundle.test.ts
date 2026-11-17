// @vitest-environment node
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import react from '@vitejs/plugin-react';
import { build, type Rolldown } from 'vite';
import { describe, expect, it } from 'vitest';

const at = (...parts: string[]) => join(import.meta.dirname, '..', ...parts).replaceAll('\\', '/');
/** What apps get (after `npm run build`; CI builds before it tests), and the source. */
const ENTRIES = [
  { name: 'dist', file: at('dist', 'index.js') },
  { name: 'src', file: at('src', 'index.ts') },
];

/** Builds a tiny app that imports `names` from `from`, and returns its JavaScript. */
async function appImporting(from: string, names: string[]): Promise<string> {
  const dir = mkdtempSync(join(tmpdir(), 'bq-icons-'));
  try {
    const entry = join(dir, 'app.js');
    writeFileSync(
      entry,
      `import { ${names.join(', ')} } from '${from}';\nexport default [${names.join(', ')}];\n`,
    );
    const output = (await build({
      configFile: false,
      logLevel: 'silent',
      plugins: [react()],
      build: {
        write: false,
        minify: false,
        lib: { entry, formats: ['es'], fileName: 'app' },
        rolldownOptions: { external: ['react', 'react/jsx-runtime'] },
      },
    })) as Rolldown.RolldownOutput | Rolldown.RolldownOutput[];
    const outputs = Array.isArray(output) ? output : [output];
    return outputs
      .flatMap((result) => result.output)
      .map((chunk) => ('code' in chunk ? chunk.code : ''))
      .join('\n');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe('bundling', () => {
  for (const { name, file } of ENTRIES) {
    it.skipIf(!existsSync(file))(`an app gets only the icons it imports (${name})`, async () => {
      const code = await appImporting(file, ['IconSun']);
      // the sun's rays are there; the moon, monitor and box are not
      expect(code).toContain('M19.7778 4.22266');
      expect(code).not.toContain('IconMoon');
      expect(code).not.toContain('IconMonitor');
      expect(code).not.toContain('IconBox');
      const two = await appImporting(file, ['IconSun', 'IconMoon']);
      expect(two).toContain('IconMoon');
      expect(two).not.toContain('IconBox');
    });

    it.skipIf(!existsSync(file))(`the logo's paths come only with the logo (${name})`, async () => {
      const markPath = 'M33.9 0.1C28.8';
      const namePath = 'M1.5 0.1C0.9';
      const icon = await appImporting(file, ['IconSun']);
      expect(icon).not.toContain(markPath);
      expect(icon).not.toContain(namePath);
      const mark = await appImporting(file, ['BrandMark']);
      expect(mark).toContain(markPath);
      expect(mark).not.toContain(namePath);
      const logo = await appImporting(file, ['BrandLogo']);
      expect(logo).toContain(markPath);
      expect(logo).toContain(namePath);
    });
  }
});
