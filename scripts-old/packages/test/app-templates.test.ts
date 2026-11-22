/**
 * The generator's Vercel files are the ones the 11 apps run with (QA Q-015): a new app gets the
 * /api route with the origin secret, the security headers, noindex (all but the storefront) and
 * the test that keeps them, never a hand-made copy that may miss one. Fast: no npm, nothing built.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { APPS } from '@beautinique/shared-contracts';
import { describe, expect, it } from 'vitest';

import { APP_KIND, APP_TITLES, appLibraries, renderApp } from '../lib/create/app-templates.ts';

const FRONTEND = join(import.meta.dirname, '..', '..', '..', 'frontend');

describe('a new app’s Vercel files', () => {
  it.each(APPS)('%s: vercel.json and its test, as the app has them', (app) => {
    const kind = APP_KIND[app];
    const libs = appLibraries(kind);
    const versions = Object.fromEntries(
      [...libs.dependencies, ...libs.devDependencies].map((name) => [name, '^1.0.0']),
    );
    const files = renderApp({ app, kind, title: APP_TITLES[app], port: 3000, versions });
    for (const file of ['vercel.json', 'test/vercel-config.test.ts']) {
      expect(files.get(file), `${app}/${file}`).toBe(
        readFileSync(join(FRONTEND, app, file), 'utf8'),
      );
    }
  });
});
