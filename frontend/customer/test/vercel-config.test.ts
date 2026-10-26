import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

interface VercelRoute {
  src: string;
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

const config = JSON.parse(
  readFileSync(join(import.meta.dirname, '..', 'vercel.json'), 'utf8'),
) as Record<string, unknown> & { routes: VercelRoute[] };

describe('vercel.json (ARCHITECTURE §7.2, §9.3)', () => {
  it('sends /api to the gateway with the origin secret, both only from Vercel env', () => {
    const api = config.routes.find((route) => route.src === '/api/(.*)');
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
    // the first route: nothing else may answer /api before it
    expect(config.routes[0]).toBe(api);
  });

  it('holds no address or secret of its own', () => {
    const text = JSON.stringify(config);
    expect(text).not.toMatch(/onrender\.com|https?:\/\/(?!openapi\.vercel\.sh)/);
    expect(text).not.toMatch(/not-a-secret/);
  });

  it('installs with npm 12 and builds only this app and the packages it needs, from the repo root', () => {
    expect(config.installCommand).toBe('cd ../.. && npm install --global npm@12.2.0 && npm ci');
    expect(config.buildCommand).toBe('cd ../.. && npm run build -- --for customer');
  });
});
