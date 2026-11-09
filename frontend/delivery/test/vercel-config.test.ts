// @vitest-environment node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

interface VercelRoute {
  src?: string;
  dest?: string;
  env?: string[];
  handle?: string;
  continue?: boolean;
  headers?: Record<string, string>;
  transforms?: {
    type: string;
    op: string;
    target: { key: string };
    args: string;
    env?: string[];
  }[];
}

const config = JSON.parse(
  readFileSync(join(import.meta.dirname, '..', 'vercel.json'), 'utf8'),
) as Record<string, unknown> & { routes: VercelRoute[] };

describe('vercel.json (ARCHITECTURE §7.2, §9.2, §9.3)', () => {
  it('sends /api to the gateway with the origin secret, both only from Vercel env, first', () => {
    const api = config.routes[0];
    expect(api?.src).toBe('/api/(.*)');
    expect(api?.dest).toBe('${BQ_GATEWAY_URL}/api/$1');
    expect(api?.env).toEqual(['BQ_GATEWAY_URL']);
    // `set` replaces whatever the browser sent in the same header
    expect(api?.transforms).toEqual([
      {
        type: 'request.headers',
        op: 'set',
        target: { key: 'x-origin-secret' },
        args: '$ORIGIN_SECRET',
        env: ['ORIGIN_SECRET'],
      },
    ]);
  });

  it('keeps every page out of search results, then serves the files, then the SPA for any path', () => {
    const [pages, ...rest] = config.routes.slice(1);
    // the same route sends the security headers: scripts/ci/test/vercel-headers.test.ts checks them
    // for every app
    expect(pages).toMatchObject({
      src: '/(.*)',
      headers: { 'X-Robots-Tag': 'noindex, nofollow' },
      continue: true,
    });
    expect(rest).toEqual([{ handle: 'filesystem' }, { src: '/(.*)', dest: '/index.html' }]);
  });

  it('holds no address or secret of its own', () => {
    const text = JSON.stringify(config);
    expect(text).not.toMatch(/onrender\.com|https?:\/\/(?!openapi\.vercel\.sh)/);
    expect(text).not.toMatch(/not-a-secret/);
  });

  it('installs with npm 12 and builds only this app and the packages it needs, from the repo root', () => {
    expect(config.installCommand).toBe('cd ../.. && npm install --global npm@12.2.0 && npm ci');
    expect(config.buildCommand).toBe('cd ../.. && npm run build -- --for delivery');
    expect(config.outputDirectory).toBe('dist');
    expect(config.regions).toEqual(['bom1']);
  });
});
