// Every backend deployable's settings and its .env.example agree (T0.9, RULES §2.4). The schema in
// src/config.ts (zod, read with loadConfig) is the truth: each of its keys is in the deployable's
// .env.example under its env name (`mongoUri` → NOTIFY__MONGO_URI), and the file names no key the
// schema does not know (loadConfig refuses one at boot: "not a setting of NOTIFY (typo?)"). The
// files keep their three parts: LOCAL, OPTIONAL, PRODUCTION. backend/bundle runs them all and sets
// ports, upstream URLs and defaults itself, so its file need not list every key, but it may name no
// unknown one either. A new deployable (payments) is picked up from its src/config.ts.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { toEnvKey } from '@beautinique/backend-server-kit';
import { describe, expect, it } from 'vitest';

const backend = join(import.meta.dirname, '../../../backend');

/** The deployables with a settings schema (all of backend/ but bundle, which reads only PORT). */
const deployables = readdirSync(backend, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => {
    const config = join(backend, name, 'src/config.ts');
    return existsSync(config) && /^export const configZod = /m.test(readFileSync(config, 'utf8'));
  })
  .sort();

const example = (name: string) => readFileSync(join(backend, name, '.env.example'), 'utf8');

/** The keys a .env.example sets, commented out or not: `KEY=value` or `# KEY=value`. */
const keysIn = (text: string) =>
  new Set(
    [...text.matchAll(/^#?\s*([A-Z][A-Z0-9]*__[A-Z0-9_]+)=/gm)].map((match) => match[1] ?? ''),
  );

/** A deployable's env names, from its schema the way loadConfig maps them. */
async function envNames(name: string): Promise<string[]> {
  const url = pathToFileURL(join(backend, name, 'src/config.ts')).href;
  const { configZod } = (await import(url)) as { configZod: { shape: Record<string, unknown> } };
  return Object.keys(configZod.shape).map((key) => `${name.toUpperCase()}__${toEnvKey(key)}`);
}

const PARTS = ['═══ LOCAL', '═══ OPTIONAL', '═══ PRODUCTION'];

describe('the backend .env.example files', () => {
  it('cover the deployables that read settings', () => {
    expect(deployables).toEqual(expect.arrayContaining(['core', 'gateway', 'identity', 'notify']));
  });

  it.each([...deployables, 'bundle'])(
    '%s: has the LOCAL, OPTIONAL and PRODUCTION parts',
    (name) => {
      const text = example(name);
      for (const part of PARTS) expect(text, `${name}/.env.example`).toContain(part);
    },
  );

  it.each(deployables)('%s: names every key of its schema, and only those', async (name) => {
    const names = await envNames(name);
    const listed = [...keysIn(example(name))].filter((key) =>
      key.startsWith(`${name.toUpperCase()}__`),
    );
    expect(names.filter((key) => !listed.includes(key))).toEqual([]);
    expect(listed.filter((key) => !names.includes(key))).toEqual([]);
  });

  it("bundle: names no key its deployables' schemas do not know", async () => {
    const known = new Set((await Promise.all(deployables.map(envNames))).flat());
    const prefixes = deployables.map((name) => `${name.toUpperCase()}__`);
    const unknown = [...keysIn(example('bundle'))].filter(
      (key) => prefixes.some((prefix) => key.startsWith(prefix)) && !known.has(key),
    );
    expect(unknown).toEqual([]);
  });
});
