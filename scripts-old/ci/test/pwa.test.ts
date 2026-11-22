// Delivery's service worker answers page navigations with the app shell (offline), but never a path
// under /api: a download or a sign-in redirect there must reach the server, or the app would show
// its own "Page not found" (QA audit Q-013; seen in Chromium before the fix). The generator writes
// the same option (scripts/packages/test/create-apps.test.ts checks the built sw.js).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const config = readFileSync(
  join(import.meta.dirname, '../../../frontend/delivery/vite.config.ts'),
  'utf8',
);

describe("delivery's service worker", () => {
  it('leaves navigations under /api to the server', () => {
    expect(config).toContain('workbox: { navigateFallbackDenylist: [/^\\/api\\//] }');
  });
});
