// @vitest-environment node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

interface VercelRoute {
  src?: string;
  dest?: string;
  env?: string[];
  transforms?: {
    type: string;
    op: string;
    target: { key: string };
    args: string;
    env?: string[];
  }[];
}

interface VercelHeaders {
  source: string;
  headers: { key: string; value: string }[];
}

const config = JSON.parse(
  readFileSync(join(import.meta.dirname, '..', 'vercel.json'), 'utf8'),
) as Record<string, unknown> & {
  routes: VercelRoute[];
  headers?: VercelHeaders[];
  rewrites?: { source: string; destination: string }[];
};

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
    // routes hold only /api (only a route can set its header); noindex rides with the security
    // headers, which scripts/ci/test/vercel-headers.test.ts checks, with the order Vercel runs
    expect(config.routes).toHaveLength(1);
    const [pages] = config.headers ?? [];
    expect(pages?.source).toBe('/(.*)');
    expect(pages?.headers).toContainEqual({ key: 'X-Robots-Tag', value: 'noindex, nofollow' });
    // Vercel serves a file when there is one, before any rewrite
    expect(config.rewrites).toEqual([{ source: '/(.*)', destination: '/index.html' }]);
  });

  it('holds no address or secret of its own', () => {
    const text = JSON.stringify(config);
    expect(text).not.toMatch(/onrender\.com|https?:\/\/(?!openapi\.vercel\.sh)/);
    expect(text).not.toMatch(/not-a-secret/);
  });

  it('installs with npm 12 and builds only this app and the packages it needs, from the repo root', () => {
    expect(config.installCommand).toBe('cd ../.. && npm install --global npm@12.2.0 && npm ci');
    expect(config.buildCommand).toBe('cd ../.. && npm run build -- --for admin');
    expect(config.outputDirectory).toBe('dist');
    expect(config.regions).toEqual(['bom1']);
  });
});
