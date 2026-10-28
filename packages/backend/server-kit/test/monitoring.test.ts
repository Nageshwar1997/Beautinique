// Sentry keeps one client per process, so these tests have a file (and so a worker) of their own.
import { randomBytes } from 'node:crypto';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { gunzipSync } from 'node:zlib';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  AppError,
  createApp,
  createLogger,
  flushMonitoring,
  initMonitoring,
  LOOPBACK_HOST,
  reportError,
  type RunningServer,
  startServer,
} from '../src/index';
import { scrubEvent, scrubSpan } from '../src/monitoring';

/** A stand-in for Sentry's ingest: keeps every envelope it is sent, as text. */
async function fakeSentry() {
  const envelopes: string[] = [];
  const server: Server = createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      const body = Buffer.concat(chunks);
      envelopes.push(
        (req.headers['content-encoding'] === 'gzip' ? gunzipSync(body) : body).toString('utf8'),
      );
      res.writeHead(200, { 'content-type': 'application/json' }).end('{}');
    });
  });
  await new Promise<void>((resolve) => server.listen(0, LOOPBACK_HOST, resolve));
  const { port } = server.address() as AddressInfo;
  return {
    dsn: `http://public@${LOOPBACK_HOST}:${String(port)}/1`,
    envelopes,
    close: () =>
      new Promise<void>((resolve) => {
        server.close(() => {
          resolve();
        });
      }),
  };
}

const logger = createLogger({ name: 'monitoring-test', level: 'silent' });
let sentry: Awaited<ReturnType<typeof fakeSentry>>;
let other: Awaited<ReturnType<typeof fakeSentry>>;
let running: RunningServer;

beforeAll(async () => {
  sentry = await fakeSentry();
  other = await fakeSentry();
  const app = createApp({
    logger,
    routes: (express) => {
      express.get('/boom', () => {
        throw new Error('boom: the database said no');
      });
      express.get('/missing', () => {
        throw new AppError('NOT_FOUND', 'No such thing');
      });
    },
  });
  running = await startServer(app, { port: 0, host: LOOPBACK_HOST, logger, handleSignals: false });
});
afterAll(async () => {
  await running.stop();
  await Promise.all([sentry.close(), other.close()]);
});

// made per run, so no secret-looking literal sits in the repo (gitleaks)
const ORIGIN_SECRET = randomBytes(24).toString('base64url');
const SESSION = randomBytes(12).toString('hex');

const call = (path: string) =>
  fetch(`${running.url}${path}?email=someone%40example.com`, {
    headers: { 'x-origin-secret': ORIGIN_SECRET, cookie: `session=${SESSION}` },
  });

describe('monitoring (Sentry)', () => {
  it('stays off without a DSN, and reporting then sends nothing', async () => {
    expect(initMonitoring({})).toBe(false);
    expect(initMonitoring({ dsn: '  ' })).toBe(false);
    reportError(new Error('nobody hears this'));
    await flushMonitoring();
    expect((await call('/boom')).status).toBe(500);
    expect(sentry.envelopes).toEqual([]);
  });

  it('starts once per process: a second init keeps the first', async () => {
    expect(
      initMonitoring({
        dsn: sentry.dsn,
        environment: 'test',
        release: 'abc123',
        tracesSampleRate: 0,
      }),
    ).toBe(true);
    expect(initMonitoring({ dsn: other.dsn, environment: 'other' })).toBe(true);
    reportError(new Error('first client'), { requestId: 'req-1' });
    await flushMonitoring();
    expect(other.envelopes).toEqual([]);
    const sent = sentry.envelopes.join('\n');
    expect(sent).toContain('first client');
    expect(sent).toContain('"environment":"test"');
    expect(sent).toContain('"release":"abc123"');
    expect(sent).toContain('"request_id":"req-1"');
  });

  it('reports a server error with its request id, and nothing the request carried', async () => {
    sentry.envelopes.length = 0;
    const response = await call('/boom');
    expect(response.status).toBe(500);
    const requestId = response.headers.get('x-request-id');
    await flushMonitoring();
    const sent = sentry.envelopes.join('\n');
    expect(sent).toContain('boom: the database said no');
    expect(sent).toContain(`"request_id":"${String(requestId)}"`);
    expect(sent).toContain('"route":"GET /boom"');
    // Sentry adds the request it saw: only its method and its path may be there
    const event = sent.split('\n').find((line) => line.includes('"exception"')) ?? '{}';
    expect((JSON.parse(event) as { request?: unknown }).request).toEqual({
      method: 'GET',
      url: `${running.url}/boom`,
    });
    // (the event also holds source lines around the throw, from this file, far from the values)
    for (const secret of [ORIGIN_SECRET, SESSION, 'someone']) {
      expect(sent).not.toContain(secret);
    }
  });

  it('does not report client errors (4xx)', async () => {
    sentry.envelopes.length = 0;
    expect((await call('/missing')).status).toBe(404);
    await flushMonitoring();
    expect(sentry.envelopes.join('\n')).not.toContain('No such thing');
  });
});

describe('scrubEvent', () => {
  it('keeps only the method and the path of a request', () => {
    const event = scrubEvent({
      request: {
        method: 'POST',
        url: 'https://bq.test/api/v1/x?email=a@b.c',
        headers: { 'x-origin-secret': 's' },
        cookies: { session: 'c' },
        data: { password: 'p' },
        query_string: 'email=a@b.c',
      },
    });
    expect(event.request).toEqual({ method: 'POST', url: 'https://bq.test/api/v1/x' });
    expect(scrubEvent({ message: 'no request' })).toEqual({ message: 'no request' });
  });
});

describe('scrubSpan', () => {
  it('keeps a span’s timings and route, never a header, an IP, a user or a query', () => {
    const span = {
      trace_id: 't',
      span_id: 's',
      name: 'GET /api/v1/x?email=a@b.c',
      start_timestamp: 1,
      end_timestamp: 2,
      status: 'ok' as const,
      is_segment: true,
      attributes: {
        'http.request.method': 'GET',
        'http.route': '/api/v1/x',
        'http.response.status_code': 200,
        'url.full': 'https://bq.test/api/v1/x?email=a@b.c',
        'http.target': '/api/v1/x?email=a@b.c',
        'url.query': 'email=a@b.c',
        'http.request.header.x_origin_secret': 's',
        'http.request.header.cookie': 'session=c',
        'client.address': '203.0.113.7',
        'user.email': 'a@b.c',
      },
    };
    expect(scrubSpan(span)).toEqual({
      ...span,
      name: 'GET /api/v1/x',
      attributes: {
        'http.request.method': 'GET',
        'http.route': '/api/v1/x',
        'http.response.status_code': 200,
        'url.full': 'https://bq.test/api/v1/x',
        'http.target': '/api/v1/x',
      },
    });
  });
});
