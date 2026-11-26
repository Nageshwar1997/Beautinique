import { join } from 'node:path';

import { check, resolveConfig } from 'prettier';
import { describe, expect, it } from 'vitest';

import { packageFiles } from '../src/template.ts';
import { CATEGORIES } from '../src/workspace.ts';

// The repository's root, where its .prettierrc is.
const ROOT = join(import.meta.dirname, '../../..');
const FORMATTED = /\.(json|ts|tsx|js|md|css|html)$/;

describe('the template of create', () => {
  it('AC-PACKAGES-1: every file a new package gets is already in the Prettier format, so format:check passes', async () => {
    for (const category of CATEGORIES) {
      const files = packageFiles({
        category,
        name: 'money',
        packageName: `@beautinique/${category}-money`,
        description: 'Paise, GST and the en-IN format.',
        version: '1.0.0',
        node: '24.22.3',
        license: 'MIT',
      });
      for (const [path, text] of Object.entries(files)) {
        if (!FORMATTED.test(path)) continue;
        const filepath = join(ROOT, 'packages', category, 'money', path);
        const options = { ...(await resolveConfig(filepath)), filepath };
        expect(await check(text, options), `${category}/${path}`).toBe(true);
      }
    }
  });
});
