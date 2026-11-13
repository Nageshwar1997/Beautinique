// @vitest-environment node
import { THEME_SCRIPT } from '@beautinique/frontend-app-shell';
import type { HtmlTagDescriptor, Plugin } from 'vite';
import { afterEach, describe, expect, it } from 'vitest';

import config, { devKeys, themeScript } from '../vite.config';

/** The keys these tests set, as Vercel's build env does: put back after each. */
const KEYS = ['BQ_GATEWAY_URL', 'BQ_SENTRY_DSN', 'VERCEL_ENV', 'VERCEL_GIT_COMMIT_SHA'] as const;
const saved = Object.fromEntries(KEYS.map((key) => [key, process.env[key]]));

afterEach(() => {
  for (const key of KEYS) {
    const value = saved[key];
    if (value === undefined) Reflect.deleteProperty(process.env, key);
    else process.env[key] = value;
  }
});

describe('vite.config.ts', () => {
  it('leaves the Sentry keys empty without them (laptop, CI): monitoring stays off', () => {
    for (const key of KEYS.slice(1)) Reflect.deleteProperty(process.env, key);
    const built = config({ command: 'build', mode: 'production' });
    expect(built.define).toMatchObject({
      'import.meta.env.BQ_SENTRY_DSN': JSON.stringify(''),
      'import.meta.env.BQ_SENTRY_ENVIRONMENT': JSON.stringify(''),
      'import.meta.env.BQ_SENTRY_RELEASE': JSON.stringify(''),
    });
  });

  it('hands the browser only the server address and the Sentry keys, and builds source maps', () => {
    // a value in the process env wins over any .env file, as Vercel's build env does
    process.env.BQ_GATEWAY_URL = 'https://bq-live.example.test///';
    process.env.BQ_SENTRY_DSN = ' https://public@o1.ingest.sentry.example.test/2 ';
    process.env.VERCEL_ENV = 'production';
    process.env.VERCEL_GIT_COMMIT_SHA = 'abc123';
    const built = config({ command: 'build', mode: 'production' });
    expect(built.define).toEqual({
      'import.meta.env.BQ_GATEWAY_URL': JSON.stringify('https://bq-live.example.test'),
      'import.meta.env.BQ_SENTRY_DSN': JSON.stringify(
        'https://public@o1.ingest.sentry.example.test/2',
      ),
      'import.meta.env.BQ_SENTRY_ENVIRONMENT': JSON.stringify('production'),
      'import.meta.env.BQ_SENTRY_RELEASE': JSON.stringify('abc123'),
    });
    expect(built.build?.sourcemap).toBe(true);
    // a build has no dev proxy, so it needs no .env
    expect(built.server?.proxy).toBeUndefined();
  });

  it('sends /api to the .env gateway with its origin secret in the dev server', () => {
    process.env.BQ_GATEWAY_URL = 'http://localhost:8091';
    const dev = config({ command: 'serve', mode: 'development' });
    expect(dev.server?.proxy).toMatchObject({ '/api': { target: 'http://localhost:8091' } });
  });

  it('stops the dev server, and only it, with the missing key named', () => {
    const start = (env: Record<string, string>) => {
      const plugin = devKeys(env);
      expect(plugin.apply).toBe('serve');
      (plugin.configureServer as () => void)();
    };
    expect(() => {
      start({});
    }).toThrow('BQ_GATEWAY_URL is missing in frontend/master/.env');
    expect(() => {
      start({ BQ_GATEWAY_URL: 'http://localhost:8080', ORIGIN_SECRET: ' ' });
    }).toThrow('ORIGIN_SECRET is missing');
    expect(() => {
      start({ BQ_GATEWAY_URL: 'http://localhost:8080', ORIGIN_SECRET: 'x' });
    }).not.toThrow();
  });

  it('puts the theme script first in <head>, byte for byte (its CSP hash)', () => {
    const plugin: Plugin = themeScript();
    const tags = (plugin.transformIndexHtml as () => HtmlTagDescriptor[])();
    expect(tags).toEqual([{ tag: 'script', children: THEME_SCRIPT, injectTo: 'head-prepend' }]);
  });
});
