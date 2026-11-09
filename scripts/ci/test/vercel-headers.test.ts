// Every app on Vercel sends the same security headers with its pages (ARCHITECTURE §9.3, QA audit
// Q-011): no other site may frame it, the browser never guesses a file's type, other sites get only
// our origin as the referrer, no camera, microphone or location until a feature's own task opens
// them, and HTTPS only. The full CSP waits for T6.6. The /api route answers first (the gateway's
// helmet sets the headers of that answer). This test is where the list lives.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const frontend = join(import.meta.dirname, '../../../frontend');

const SECURITY_HEADERS = {
  'Content-Security-Policy': "frame-ancestors 'none'",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
};

/** The storefront is the one app search engines may list; the others say noindex (§9.3). */
const PUBLIC_APPS = new Set(['customer']);

interface VercelRoute {
  src?: string;
  dest?: string;
  handle?: string;
  continue?: boolean;
  headers?: Record<string, string>;
}

const apps = readdirSync(frontend, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(join(frontend, entry.name, 'package.json')))
  .map((entry) => entry.name)
  .sort();

function vercelConfig(app: string) {
  return JSON.parse(readFileSync(join(frontend, app, 'vercel.json'), 'utf8')) as Record<
    string,
    unknown
  > & { routes: VercelRoute[] };
}

describe('security headers of the apps on Vercel', () => {
  it('cover all 11 apps', () => {
    expect(apps).toEqual([
      'admin',
      'creator',
      'customer',
      'delivery',
      'finance',
      'growth',
      'logistics',
      'master',
      'seller',
      'superadmin',
      'support',
    ]);
  });

  it.each(apps)('%s sends them with every page, right after the /api route', (app) => {
    const config = vercelConfig(app);
    expect(config.routes[0]?.src).toBe('/api/(.*)');
    expect(config.routes[1]).toEqual({
      src: '/(.*)',
      headers: PUBLIC_APPS.has(app)
        ? SECURITY_HEADERS
        : { ...SECURITY_HEADERS, 'X-Robots-Tag': 'noindex, nofollow' },
      continue: true,
    });
    // headers only there: Vercel takes no top-level `headers` next to `routes`, and no later route
    // may add or change one
    expect(config).not.toHaveProperty('headers');
    expect(config.routes.slice(2).filter((route) => route.headers !== undefined)).toEqual([]);
  });
});
