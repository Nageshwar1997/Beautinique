import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { join } from 'node:path';
import { gunzipSync } from 'node:zlib';

import { describe, expect, it } from 'vitest';

import { monitoringOptions } from '../src/monitoring.ts';

const root = join(import.meta.dirname, '..');

describe('monitoring settings', () => {
  it('are off without SENTRY_DSN, live on Render, and carry the deployed commit', () => {
    expect(monitoringOptions({})).toEqual({
      dsn: undefined,
      environment: 'development',
      release: undefined,
    });
    expect(
      monitoringOptions({
        SENTRY_DSN: 'https://k@o1.ingest.sentry.io/2',
        RENDER: 'true',
        RENDER_GIT_COMMIT: 'abc',
      }),
    ).toEqual({ dsn: 'https://k@o1.ingest.sentry.io/2', environment: 'live', release: 'abc' });
    expect(monitoringOptions({ RENDER: 'true', SENTRY_ENVIRONMENT: 'staging' }).environment).toBe(
      'staging',
    );
    // left empty, as in .env.example
    expect(monitoringOptions({ RENDER: 'true', SENTRY_ENVIRONMENT: '' }).environment).toBe('live');
  });
});

describe('the bundle process with Sentry preloaded (node --import)', () => {
  it('reports a start that fails, and sends it before the process exits', async () => {
    const envelopes: string[] = [];
    const sentry = createServer((req, res) => {
      const chunks: Buffer[] = [];
      req.on('data', (chunk: Buffer) => chunks.push(chunk));
      req.on('end', () => {
        const body = Buffer.concat(chunks);
        envelopes.push(
          (req.headers['content-encoding'] === 'gzip' ? gunzipSync(body) : body).toString(),
        );
        res.writeHead(200).end('{}');
      });
    });
    await new Promise<void>((resolve) => sentry.listen(0, '127.0.0.1', resolve));
    const { port } = sentry.address() as AddressInfo;
    try {
      // a wrong setting: the bundle refuses to start, as on a broken Render deploy
      const child = spawn(
        process.execPath,
        ['--conditions=beautinique-source', '--import', './src/instrument.ts', 'src/start.ts'],
        {
          cwd: root,
          // only these settings: nothing from the developer's own environment
          env: {
            SENTRY_DSN: `http://public@127.0.0.1:${String(port)}/1`,
            RENDER: 'true',
            RENDER_GIT_COMMIT: 'commit-under-test',
            GATEWAY__PORT: 'not-a-port',
            GATEWAY__LOG_LEVEL: 'silent',
          },
          stdio: 'ignore',
        },
      );
      const code = await new Promise<number | null>((resolve) => child.on('exit', resolve));
      expect(code).toBe(1);
      const sent = envelopes.join('\n');
      expect(sent).toContain('ConfigError');
      expect(sent).toContain('"environment":"live"');
      expect(sent).toContain('"release":"commit-under-test"');
    } finally {
      await new Promise<void>((resolve) => {
        sentry.close(() => {
          resolve();
        });
      });
    }
  }, 60_000);
});
