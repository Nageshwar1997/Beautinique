// Every app on Vercel sends the same security headers with its pages (ARCHITECTURE §9.3, QA audit
// Q-011): no other site may frame it, the browser never guesses a file's type, other sites get only
// our origin as the referrer, no camera, microphone or location until a feature's own task opens
// them, and HTTPS only. The full CSP waits for T6.6. This test is where the list lives.
//
// Each vercel.json keeps in `routes` only the /api proxy (only a route can set the x-origin-secret
// request header), the headers in `headers` and the SPA fallback in `rewrites` (no deprecated
// `handle`). Vercel's own @vercel/routing-utils turns that into the routes it runs, so the test
// checks those: /api first and alone (its answer keeps the gateway's helmet headers), then the
// headers on every other path, then a file if there is one, then the SPA.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { getTransformedRoutes } from '@vercel/routing-utils';
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
/** Server-rendered: React Router answers every page itself, so no SPA fallback. */
const SSR_APPS = new Set(['customer']);

const apps = readdirSync(frontend, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(join(frontend, entry.name, 'package.json')))
  .map((entry) => entry.name)
  .sort();

function vercelConfig(app: string) {
  return JSON.parse(readFileSync(join(frontend, app, 'vercel.json'), 'utf8')) as Parameters<
    typeof getTransformedRoutes
  >[0];
}

/** The /api proxy as Vercel runs it (ARCHITECTURE §7.2). */
const API_ROUTE = {
  src: '^/api/(.*)$',
  dest: '${BQ_GATEWAY_URL}/api/$1',
  env: ['BQ_GATEWAY_URL'],
  transforms: [
    {
      type: 'request.headers',
      op: 'set',
      target: { key: 'x-origin-secret' },
      args: '$ORIGIN_SECRET',
      env: ['ORIGIN_SECRET'],
    },
  ],
};

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

  it.each(apps)(
    '%s sends them with every page but /api, and keeps routes to the /api proxy',
    (app) => {
      const config = vercelConfig(app);
      expect(config.routes).toHaveLength(1);
      expect(config.routes?.some((route) => 'handle' in route)).toBe(false);

      const { routes, error } = getTransformedRoutes(config);
      expect(error).toBeNull();
      const headers = PUBLIC_APPS.has(app)
        ? SECURITY_HEADERS
        : { ...SECURITY_HEADERS, 'X-Robots-Tag': 'noindex, nofollow' };
      expect(routes).toEqual([
        API_ROUTE,
        { src: '^(?:/(.*))$', headers, continue: true },
        ...(SSR_APPS.has(app)
          ? []
          : [{ handle: 'filesystem' }, { src: '^(?:/(.*))$', dest: '/index.html', check: true }]),
      ]);
    },
  );
});
