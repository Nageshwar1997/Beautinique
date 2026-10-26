import { afterEach, describe, expect, it } from 'vitest';

import config from '../vite.config';

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
});
