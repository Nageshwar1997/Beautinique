import { describe, expect, it } from 'vitest';

import { readConfig } from '../src/config.ts';
import { start } from '../src/service.ts';

describe('core', () => {
  it('answers /health and turns unknown paths into the contracts error body', async () => {
    const config = readConfig({ env: { CORE__LOG_LEVEL: 'silent' } });
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

  it('reads CORE__* settings and names a bad one', () => {
    expect(readConfig({ env: {} })).toEqual({ port: 8084, logLevel: 'info' });
    expect(readConfig({ env: { CORE__PORT: '9001' } }).port).toBe(9001);
    expect(() => readConfig({ env: { CORE__PORT: 'abc' } })).toThrow('CORE__PORT');
  });
});
