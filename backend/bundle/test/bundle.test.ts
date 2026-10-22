import { type AddressInfo, createServer } from 'node:net';

import { ConfigError } from '@beautinique/backend-server-kit';
import { describe, expect, it } from 'vitest';

import { startBundle } from '../src/bundle.ts';
import { readBundleConfig } from '../src/config.ts';
import { names } from '../src/deployables.ts';

const quiet = () =>
  Object.fromEntries(names.map((name) => [`${name.toUpperCase()}__LOG_LEVEL`, 'silent']));

describe('bundle', () => {
  it('runs every deployable behind the gateway, then stops them all', async () => {
    const env: Record<string, string | undefined> = { ...quiet(), UNRELATED: 'kept' };
    const bundle = await startBundle({ port: 0, env });
    try {
      expect(bundle.names).toEqual(names);
      expect(env).toEqual({ UNRELATED: 'kept' });
      const ready = await fetch(`${bundle.url}/ready`);
      expect(ready.status).toBe(200);
      expect(await ready.json()).toEqual({
        status: 'ready',
        checks: Object.fromEntries(names.filter((n) => n !== 'gateway').map((n) => [n, 'ok'])),
      });
    } finally {
      await bundle.stop();
    }
    await expect(fetch(`${bundle.url}/health`)).rejects.toThrow();
  });

  it('starts nothing when a config is wrong', async () => {
    await expect(
      startBundle({ port: 0, env: { ...quiet(), GATEWAY__PORT: 'abc' } }),
    ).rejects.toThrow(ConfigError);
  });

  it('stops what it started when the gateway cannot start', async () => {
    // listening servers in this process; a closed one leaves the list a moment later
    const listening = async () => {
      const count = () =>
        process.getActiveResourcesInfo().filter((resource) => resource === 'TCPServerWrap').length;
      let last = -1;
      let now = count();
      while (now !== last) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        last = now;
        now = count();
      }
      return now;
    };
    const blocker = createServer();
    await new Promise<void>((resolve) => blocker.listen(0, '0.0.0.0', resolve));
    try {
      const before = await listening();
      const { port } = blocker.address() as AddressInfo;
      await expect(startBundle({ port, env: quiet() })).rejects.toThrow('EADDRINUSE');
      expect(await listening()).toBe(before);
    } finally {
      blocker.close();
    }
  });

  it('takes the public port from PORT', () => {
    expect(readBundleConfig({}).port).toBe(8080);
    expect(readBundleConfig({ PORT: '10000' }).port).toBe(10_000);
    expect(() => readBundleConfig({ PORT: 'x' })).toThrow('PORT');
  });
});
