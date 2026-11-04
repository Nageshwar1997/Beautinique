import { afterEach, describe, expect, it } from 'vitest';

import config, { devKeys } from '../vite.config';

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

  it('gives the preview server the prerender runs no dev proxy, so it asks no .env (CI has none)', () => {
    const preview = config({ command: 'serve', mode: 'production', isPreview: true });
    expect(preview.server?.proxy).toBeUndefined();
    // React Router loads the config again for it without saying it is a preview: loading never
    // asks the keys (on CI, with no .env, this threw)
    expect(() => config({ command: 'serve', mode: 'production' })).not.toThrow();
  });

  it('stops the dev server, and only it, with the missing key named', () => {
    const start = (env: Record<string, string>) => {
      const plugin = devKeys(env);
      expect(plugin.apply).toBe('serve');
      // Vite calls it for the dev server only (a preview server has configurePreviewServer)
      (plugin.configureServer as () => void)();
    };
    expect(() => {
      start({});
    }).toThrow('BQ_GATEWAY_URL is missing in frontend/customer/.env');
    expect(() => {
      start({ BQ_GATEWAY_URL: 'http://localhost:8080', ORIGIN_SECRET: ' ' });
    }).toThrow('ORIGIN_SECRET is missing');
    expect(() => {
      start({ BQ_GATEWAY_URL: 'http://localhost:8080', ORIGIN_SECRET: 'a-secret' });
    }).not.toThrow();
  });
});
