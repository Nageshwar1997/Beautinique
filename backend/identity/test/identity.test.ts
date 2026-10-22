import { describe, expect, it } from 'vitest';

import { readConfig } from '../src/config.ts';
import { start } from '../src/service.ts';

describe('identity', () => {
  it('answers /health and turns unknown paths into the contracts error body', async () => {
    const config = readConfig({ env: { IDENTITY__LOG_LEVEL: 'silent' } });
    const server = await start(config, { port: 0, host: '127.0.0.1', handleSignals: false });
    try {
      const health = await fetch(`${server.url}/health`);
      expect(await health.json()).toEqual({ status: 'ok' });
      const missing = await fetch(`${server.url}/nope`);
      expect(missing.status).toBe(404);
      expect(await missing.json()).toMatchObject({ error: { code: 'NOT_FOUND' } });
    } finally {
      await server.stop();
    }
  });

  it('reads IDENTITY__* settings and names a bad one', () => {
    expect(readConfig({ env: {} })).toEqual({ port: 8081, logLevel: 'info' });
    expect(readConfig({ env: { IDENTITY__PORT: '9001' } }).port).toBe(9001);
    expect(() => readConfig({ env: { IDENTITY__PORT: 'abc' } })).toThrow('IDENTITY__PORT');
  });
});
