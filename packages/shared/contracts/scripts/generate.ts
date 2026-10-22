// `npm run generate` writes generated/, `npm run check` fails when it is out of date (CI). Runs
// against the built package, so `npm run build` comes first.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import { staleGenerated, writeGenerated } from '../dist/codegen.js';
import { events, permissions, routes } from '../dist/index.js';

const root = new URL('../', import.meta.url);
const directory = fileURLToPath(new URL('generated/', root));
const { version } = JSON.parse(await readFile(new URL('package.json', root), 'utf8')) as {
  version: string;
};
const input = { routes, events, permissions, info: { title: 'Beautinique API', version } };

if (process.argv.includes('--check')) {
  const stale = await staleGenerated(directory, input);
  if (stale.length > 0) {
    process.stderr.write(`Out of date: ${stale.join(', ')}. Run "npm run generate".\n`);
    process.exit(1);
  }
  process.stdout.write('generated/ is up to date\n');
} else {
  process.stdout.write(`Wrote ${(await writeGenerated(directory, input)).join(', ')}\n`);
}
