import { Writable } from 'node:stream';

import { coerce, object, string } from '@beautinique/shared-zod';
import type { Express } from 'express';
import { afterEach, describe, expect, it } from 'vitest';

import * as api from '../src/index';
import {
  AppError,
  ConfigError,
  createApp,
  createLogger,
  loadConfig,
  LOOPBACK_HOST,
  type RunningServer,
  startServer,
  toEnvKey,
} from '../src/index';

/** A logger whose JSON lines land in `lines`. */
function captureLogger() {
  const lines: Record<string, unknown>[] = [];
  const destination = new Writable({
    write(chunk: Buffer, _encoding, done) {
      for (const line of chunk.toString().split('\n').filter(Boolean)) {
        lines.push(JSON.parse(line) as Record<string, unknown>);
      }
      done();
    },
  });
  return { logger: createLogger({ name: 'test', level: 'debug', destination }), lines };
}

const servers: RunningServer[] = [];
afterEach(async () => {
  await Promise.all(servers.splice(0).map((s) => s.stop()));
});

async function serve(options: Parameters<typeof createApp>[0]) {
  const app = createApp(options);
  const server = await startServer(app, {
    port: 0,
    host: LOOPBACK_HOST,
    logger: options.logger,
    handleSignals: false,
  });
  servers.push(server);
  return server;
}

const routes = (app: Express) => {
  app.get('/conflict', () => {
    throw new AppError('CONFLICT', 'That order was already paid.');
  });
  app.post('/orders', (req, res) => {
    const body = object({ quantity: coerce.number().int().min(1) }).parse(req.body);
    res.json({ data: body });
  });
  app.get('/boom', () => {
    throw new Error('db password is hunter2');
  });
  app.all('/body-type', (req, res) => {
    res.json({ type: typeof req.body });
  });
};

describe('public API', () => {
  it('exports these', () => {
    expect(Object.keys(api).sort()).toEqual(
      [
        'AppError',
        'ConfigError',
        'REDACTED_PATHS',
        'accessLog',
        'createApp',
        'createLogger',
        'errorHandler',
        'flushMonitoring',
        'healthRoutes',
        'initMonitoring',
        'loadConfig',
        'mountRoute',
        'notFound',
        'reportError',
        'requestId',
        'requestIdOf',
        'startServer',
        'toEnvKey',
        'toErrorResponse',
        'LOOPBACK_HOST',
        'cookieOf',
        'jwksCache',
        'jwksFromUrl',
        'passportSigner',
        'passportVerifier',
        'tokenKeyId',
      ].sort(),
    );
  });
});

describe('createApp', () => {
  it('serves /health with security headers and a request id', async () => {
    const { logger } = captureLogger();
    const server = await serve({ logger });
    const res = await fetch(`${server.url}/health`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok' });
    expect(res.headers.get('x-request-id')).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-/);
    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    expect(res.headers.get('x-powered-by')).toBeNull();
  });

  it('keeps a valid incoming request id and replaces a bad one', async () => {
    const { logger } = captureLogger();
    const server = await serve({ logger });
    const kept = await fetch(`${server.url}/health`, {
      headers: { 'X-Request-Id': 'gw-0123456789' },
    });
    expect(kept.headers.get('x-request-id')).toBe('gw-0123456789');
    for (const bad of ['bad id!', 'short', 'x'.repeat(129)]) {
      const replaced = await fetch(`${server.url}/health`, { headers: { 'X-Request-Id': bad } });
      expect(replaced.headers.get('x-request-id')).not.toBe(bad);
    }
    const longest = 'x'.repeat(128);
    const kept128 = await fetch(`${server.url}/health`, { headers: { 'X-Request-Id': longest } });
    expect(kept128.headers.get('x-request-id')).toBe(longest);
  });

  it('/ready is 200 when every check passes, 503 with the failing check otherwise', async () => {
    const { logger } = captureLogger();
    const ok = await serve({
      logger,
      ready: { mongo: () => true, redis: () => Promise.resolve(true) },
    });
    const okRes = await fetch(`${ok.url}/ready`);
    expect(okRes.status).toBe(200);
    expect(await okRes.json()).toEqual({ status: 'ready', checks: { mongo: 'ok', redis: 'ok' } });
    const bad = await serve({
      logger,
      ready: {
        mongo: () => false,
        redis: () => {
          throw new Error('down');
        },
        queue: () => true,
      },
    });
    const badRes = await fetch(`${bad.url}/ready`);
    expect(badRes.status).toBe(503);
    expect(await badRes.json()).toEqual({
      status: 'not-ready',
      checks: { mongo: 'failing', redis: 'failing', queue: 'ok' },
    });
  });

  it('turns every error into the contracts error body with the request id', async () => {
    const { logger, lines } = captureLogger();
    const server = await serve({ logger, routes });
    const get = async (path: string, init?: RequestInit) => {
      const res = await fetch(`${server.url}${path}`, init);
      return {
        status: res.status,
        body: (await res.json()) as { error: Record<string, unknown> },
        id: res.headers.get('x-request-id'),
      };
    };

    const conflict = await get('/conflict');
    expect(conflict.status).toBe(409);
    expect(conflict.body).toEqual({
      error: { code: 'CONFLICT', message: 'That order was already paid.', requestId: conflict.id },
    });

    const invalid = await get('/orders', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ quantity: 0 }),
    });
    expect(invalid.status).toBe(400);
    expect(invalid.body.error).toMatchObject({
      code: 'VALIDATION_FAILED',
      details: [{ path: ['quantity'] }],
    });

    const notJson = await get('/orders', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{"quantity":',
    });
    expect(notJson.status).toBe(400);
    expect(notJson.body.error).toMatchObject({
      code: 'BAD_REQUEST',
      message: 'The request body is not valid JSON.',
    });

    const tooBig = await get('/orders', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ quantity: 1, note: 'x'.repeat(1_100_000) }),
    });
    expect(tooBig.status).toBe(413);
    expect(tooBig.body.error.code).toBe('PAYLOAD_TOO_LARGE');

    const missing = await get('/nope?token=abc');
    expect(missing.status).toBe(404);
    expect(missing.body.error).toMatchObject({
      code: 'NOT_FOUND',
      message: 'No route for GET /nope',
    });

    const boom = await get('/boom');
    expect(boom.status).toBe(500);
    expect(boom.body.error).toMatchObject({
      code: 'INTERNAL',
      message: 'Something went wrong on our side. Please try again.',
    });
    expect(JSON.stringify(boom.body)).not.toContain('hunter2');
    const failure = lines.find((l) => l.msg === 'request failed');
    expect(failure).toMatchObject({ requestId: boom.id, path: '/boom', level: 50 });
  });

  it('logs one line per request, without the query and without /health', async () => {
    const { logger, lines } = captureLogger();
    const server = await serve({ logger, routes });
    await fetch(`${server.url}/health`);
    await fetch(`${server.url}/body-type?phone=9876543210`);
    const requests = lines.filter((l) => l.msg === 'request');
    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({
      method: 'GET',
      path: '/body-type',
      status: 200,
      service: 'test',
    });
    expect(JSON.stringify(lines)).not.toContain('9876543210');
  });

  it('can leave bodies unparsed (the gateway streams them through)', async () => {
    const { logger } = captureLogger();
    const parsed = await serve({ logger, routes });
    const raw = await serve({ logger, routes, json: false });
    const send = (url: string) =>
      fetch(`${url}/body-type`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{"quantity":1}',
      }).then((r) => r.json());
    expect(await send(parsed.url)).toEqual({ type: 'object' });
    expect(await send(raw.url)).toEqual({ type: 'undefined' });
  });
});

describe('AppError', () => {
  it('takes its status from the common codes, or an explicit one for a module code', () => {
    expect(new AppError('RATE_LIMITED', 'Slow down').status).toBe(429);
    expect(new AppError('ORDER_NOT_CANCELLABLE', 'Too late', { status: 409 }).status).toBe(409);
    expect(() => new AppError('ORDER_NOT_CANCELLABLE', 'Too late')).toThrow(
      'needs a 4xx or 5xx status',
    );
    expect(() => new AppError('CONFLICT', 'x', { status: 200 })).toThrow(
      'needs a 4xx or 5xx status',
    );
  });
});

describe('logger', () => {
  it('redacts secrets at any depth and in headers', () => {
    const { logger, lines } = captureLogger();
    logger.info(
      {
        password: 'p1',
        user: { otp: '123456', name: 'Priya' },
        payment: { card: { accountNumber: '1234567890' } },
        headers: {
          authorization: 'Bearer t',
          cookie: 'sid=1',
          'set-cookie': 'sid=2',
          'x-origin-secret': 's',
        },
        req: { headers: { 'set-cookie': 'sid=3', 'x-origin-secret': 'origin-2' } },
      },
      'hello',
    );
    const line = lines[0] ?? {};
    expect(line).toMatchObject({
      msg: 'hello',
      service: 'test',
      user: { name: 'Priya', otp: '[redacted]' },
    });
    const text = JSON.stringify(line);
    const secrets = [
      'p1',
      '123456',
      '1234567890',
      'Bearer t',
      'sid=1',
      'sid=2',
      '"s"',
      'sid=3',
      'origin-2',
    ];
    for (const secret of secrets) {
      expect(text, secret).not.toContain(secret);
    }
    expect(typeof line.time).toBe('string');
  });
});

describe('loadConfig', () => {
  const schema = object({
    port: coerce.number().int().default(8081),
    mongoUri: string().min(1),
    logLevel: string().default('info'),
  });

  it('reads namespaced env vars into camelCase settings', () => {
    expect(toEnvKey('mongoUri')).toBe('MONGO_URI');
    const env = {
      IDENTITY__MONGO_URI: 'mongodb://localhost/bq_identity',
      IDENTITY__PORT: '9000',
      OTHER: 'x',
    };
    expect(loadConfig(schema, { prefix: 'IDENTITY', env })).toEqual({
      port: 9000,
      mongoUri: 'mongodb://localhost/bq_identity',
      logLevel: 'info',
    });
  });

  it('names the bad env vars without printing values, and catches typos', () => {
    const env = { IDENTITY__PORT: 'abc', IDENTITY__MONGO_URL: 'mongodb://secret@host' };
    let message = '';
    try {
      loadConfig(schema, { prefix: 'IDENTITY', env });
    } catch (error) {
      expect(error).toBeInstanceOf(ConfigError);
      message = (error as Error).message;
    }
    expect(message).toContain('IDENTITY__PORT:');
    expect(message).toContain('IDENTITY__MONGO_URI:');
    expect(message).toContain('IDENTITY__MONGO_URL: not a setting of IDENTITY (typo?)');
    expect(message).not.toContain('secret@host');
    expect(message).not.toContain('abc');
  });

  it('can strip its keys from env (bundle mode) and checks the prefix', () => {
    const env: Record<string, string | undefined> = {
      NOTIFY__MONGO_URI: 'mongodb://x',
      CORE__MONGO_URI: 'y',
    };
    loadConfig(schema, { prefix: 'NOTIFY', env, strip: true });
    expect(env).toEqual({ CORE__MONGO_URI: 'y' });
    expect(() => loadConfig(schema, { prefix: 'notify', env })).toThrow('UPPER case');
  });
});

describe('startServer', () => {
  it('finishes in-flight requests, runs onStop hooks in order, and stops once', async () => {
    const { logger } = captureLogger();
    const order: string[] = [];
    const app = createApp({
      logger,
      routes: (a) => {
        a.get('/slow', async (_req, res) => {
          await new Promise((r) => setTimeout(r, 150));
          res.json({ done: true });
        });
      },
    });
    const server = await startServer(app, {
      port: 0,
      host: LOOPBACK_HOST,
      logger,
      handleSignals: false,
      onStop: [
        async () => {
          await new Promise((r) => setTimeout(r, 20));
          order.push('db');
        },
        () => {
          order.push('queue');
        },
      ],
    });
    const inFlight = fetch(`${server.url}/slow`).then((r) => r.json());
    await new Promise((r) => setTimeout(r, 30));
    const first = server.stop();
    expect(server.stop()).toBe(first);
    expect(await inFlight).toEqual({ done: true });
    await first;
    expect(order).toEqual(['db', 'queue']);
    await expect(fetch(`${server.url}/health`)).rejects.toThrow();
  });

  it('listens for SIGTERM and SIGINT only when asked, and removes the listeners on stop', async () => {
    const { logger } = captureLogger();
    const before = process.listenerCount('SIGTERM');
    const server = await startServer(createApp({ logger }), {
      port: 0,
      host: LOOPBACK_HOST,
      logger,
    });
    expect(process.listenerCount('SIGTERM')).toBe(before + 1);
    expect(process.listenerCount('SIGINT')).toBeGreaterThan(0);
    await server.stop();
    expect(process.listenerCount('SIGTERM')).toBe(before);
    const quiet = await startServer(createApp({ logger }), {
      port: 0,
      host: LOOPBACK_HOST,
      logger,
      handleSignals: false,
    });
    expect(process.listenerCount('SIGTERM')).toBe(before);
    await quiet.stop();
  });

  it('fails clearly when the port is taken', async () => {
    const { logger } = captureLogger();
    const first = await serve({ logger });
    await expect(
      startServer(createApp({ logger }), {
        port: first.port,
        host: LOOPBACK_HOST,
        logger,
        handleSignals: false,
      }),
    ).rejects.toThrow(/EADDRINUSE/);
  });
});
