// @vitest-environment node
import { THEME_SCRIPT } from '@beautinique/frontend-app-shell';
import type { HtmlTagDescriptor, Plugin } from 'vite';
import { afterEach, describe, expect, it } from 'vitest';

import config, { devKeys, themeScript } from '../vite.config';

const saved = process.env.BQ_GATEWAY_URL;

afterEach(() => {
  if (saved === undefined) delete process.env.BQ_GATEWAY_URL;
  else process.env.BQ_GATEWAY_URL = saved;
});

describe('vite.config.ts', () => {
  it('hands the browser only the server address, without a trailing slash, for the wake-up call', () => {
    // a value in the process env wins over any .env file, as Vercel's build env does
    process.env.BQ_GATEWAY_URL = 'https://bq-live.example.test///';
    const built = config({ command: 'build', mode: 'production' });
    expect(built.define).toEqual({
      'import.meta.env.BQ_GATEWAY_URL': JSON.stringify('https://bq-live.example.test'),
    });
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
    }).toThrow('BQ_GATEWAY_URL is missing in frontend/admin/.env');
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
