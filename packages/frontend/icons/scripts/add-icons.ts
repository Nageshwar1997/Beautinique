/**
 * Adds icons to the package from an Iconify JSON file (no network here, and never at runtime):
 *
 *   curl -o solar.json "https://api.iconify.design/solar.json?icons=sun-2-linear,moon-linear"
 *   node scripts/add-icons.ts solar.json sun-2-linear=IconSun moon-linear=IconMoon
 *
 * Writes src/icons/<name>.tsx for each, then src/icons/index.ts (every icon file, sorted). The set
 * must be credited in src/credits.ts first (its license travels with the copied icons).
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { format, resolveConfig } from 'prettier';

import { ICON_CREDITS } from '../src/credits.ts';
import { fileNameOf, iconFile, type IconifyIcon } from './convert.ts';

interface IconifySet {
  prefix: string;
  width?: number;
  height?: number;
  icons: Record<string, IconifyIcon>;
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const iconsDir = join(root, 'src', 'icons');

async function write(path: string, source: string): Promise<void> {
  const options = (await resolveConfig(path)) ?? {};
  writeFileSync(path, await format(source, { ...options, filepath: path }));
}

async function main(): Promise<void> {
  const [file, ...pairs] = process.argv.slice(2);
  if (file === undefined || pairs.length === 0) {
    throw new Error(
      'Usage: node scripts/add-icons.ts <iconify.json> <icon-name>=<IconComponent> ...',
    );
  }
  const set = JSON.parse(readFileSync(file, 'utf8')) as IconifySet;
  if (!ICON_CREDITS.some((credit) => credit.prefix === set.prefix)) {
    throw new Error(
      `Add the "${set.prefix}" set (author, license) to src/credits.ts and LICENSES.md first`,
    );
  }
  for (const pair of pairs) {
    const [name = '', component = ''] = pair.split('=');
    const icon = set.icons[name];
    if (icon === undefined) throw new Error(`${set.prefix}:${name} is not in ${file}`);
    const source = iconFile({
      id: `${set.prefix}:${name}`,
      component,
      icon,
      setWidth: set.width,
      setHeight: set.height,
    });
    await write(join(iconsDir, `${fileNameOf(component)}.tsx`), source);
    process.stdout.write(
      `${set.prefix}:${name} -> src/icons/${fileNameOf(component)}.tsx (${component})\n`,
    );
  }
  const exports = readdirSync(iconsDir)
    .filter((entry) => entry.endsWith('.tsx'))
    // sorted without ".tsx", as ESLint sorts the paths: "eye" before "eye-closed"
    .map((entry) => entry.replace(/\.tsx$/, ''))
    .toSorted()
    .map((name) => {
      const component = /export const (Icon\w+)/.exec(
        readFileSync(join(iconsDir, `${name}.tsx`), 'utf8'),
      )?.[1];
      if (component === undefined)
        throw new Error(`src/icons/${name}.tsx exports no Icon component`);
      return `export { ${component} } from './${name}';`;
    });
  await write(
    join(iconsDir, 'index.ts'),
    `// Every icon of the package. Written by scripts/add-icons.ts; do not edit.\n${exports.join('\n')}\n`,
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
