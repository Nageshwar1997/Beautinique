import { request, type RequestListener } from 'node:http';

import {
  createApp,
  createLogger,
  type RunningServer,
  startServer,
} from '@beautinique/backend-server-kit';
import { defineRoute, gatewayManifest } from '@beautinique/shared-contracts';
import { object, string, unknown } from '@beautinique/shared-zod';
import type { Express } from 'express';
import { afterEach, describe, expect, it } from 'vitest';

import { buildApp, type GatewayAppOptions } from '../src/app.ts';
import { readConfig } from '../src/config.ts';
import { API_PREFIX } from '../src/proxy.ts';

const logger = createLogger({ name: 'test', level: 'silent' });
const servers: RunningServer[] = [];
afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => server.stop()));
});

async function listen(app: RequestListener): Promise<RunningServer> {
  const server = await startServer(app, {
    port: 0,
    host: '127.0.0.1',
    logger,
    handleSignals: false,
  });
  servers.push(server);
  return server;
}

const manifest = gatewayManifest([
  defineRoute({
    id: 'catalog.products.get',
    method: 'GET',
    path: '/catalog/products/:productId',
    summary: 'One product',
    apps: ['customer', 'seller'],
    access: { type: 'public' },
    rateLimit: 'public',
    idempotency: false,
    stepUp: false,
    owner: 'core',
    input: { params: object({ productId: string() }) },
    output: unknown(),
  }),
  defineRoute({
    id: 'commerce.orders.create',
    method: 'POST',
    path: '/commerce/orders',
    summary: 'Place an order',
    apps: ['customer'],
    access: { type: 'signed-in' },
    rateLimit: 'write',
    idempotency: true,
    stepUp: false,
    owner: 'core',
    input: { body: object({ note: string() }) },
    output: unknown(),
  }),
  defineRoute({
    id: 'payments.refunds.list',
    method: 'GET',
    path: '/payments/refunds',
    summary: 'Refunds',
    apps: ['finance'],
    access: { type: 'permission', permission: 'payments.refunds.read' },
    rateLimit: 'read',
    idempotency: false,
    stepUp: false,
    owner: 'payments',
    input: {},
    output: unknown(),
  }),
]);

/** A stand-in for core: echoes what reached it. */
function fakeCore(delayMs = 0): Express {
  return createApp({
    logger,
    routes: (app) => {
      app.get('/catalog/products/:productId', async (req, res) => {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        res.json({
          path: req.originalUrl,
          productId: req.params.productId,
          app: req.get('x-bq-app'),
          requestId: req.get('x-request-id'),
          originSecret: req.get('x-origin-secret') ?? null,
          forwardedFor: req.get('x-forwarded-for'),
        });
      });
      app.post('/commerce/orders', (req, res) => {
        res.status(201).json({ received: req.body as unknown });
      });
      // paths the gateway must never reach for a route it did not match
      app.get(['/catalog', '/catalog/products', '/commerce/orders'], (_req, res) => {
        res.json({ leaked: true });
      });
    },
  });
}

async function gateway(upstreams: GatewayAppOptions['upstreams'], upstreamTimeoutMs = 2000) {
  return listen(buildApp({ logger, manifest, upstreams, upstreamTimeoutMs }));
}

/** A request with exactly this path (a URL would clean up ".." first). */
function raw(url: string, path: string): Promise<number> {
  const { hostname, port } = new URL(url);
  return new Promise((resolve, reject) => {
    request({ hostname, port, path, headers: { 'X-BQ-App': 'customer' } }, (res) => {
      res.resume();
      resolve(res.statusCode ?? 0);
    })
      .on('error', reject)
      .end();
  });
}

const customer = { 'X-BQ-App': 'customer' };

describe('gateway', () => {
  it('sends a request to its owner at the route path, with the query and the request id', async () => {
    const core = await listen(fakeCore());
    const gw = await gateway({ core: core.url });
    const res = await fetch(`${gw.url}${API_PREFIX}/catalog/products/lip%20kit?shade=rose`, {
      headers: {
        ...customer,
        'X-Request-Id': 'test-request-0001',
        'x-origin-secret': 'not-for-core',
      },
    });
    expect(res.status).toBe(200);
    expect(res.headers.get('x-request-id')).toBe('test-request-0001');
    expect(res.headers.get('content-type')).toContain('application/json');
    expect(await res.json()).toMatchObject({
      path: '/catalog/products/lip%20kit?shade=rose',
      productId: 'lip kit',
      app: 'customer',
      requestId: 'test-request-0001',
      originSecret: null,
      forwardedFor: expect.stringContaining('127.0.0.1') as unknown,
    });
  });

  it('forwards its own request id and a re-encoded path', async () => {
    const core = await listen(fakeCore());
    const gw = await gateway({ core: core.url });
    const res = await fetch(`${gw.url}${API_PREFIX}/catalog/products/%6Cip`, {
      headers: { ...customer, 'X-Request-Id': 'bad id!' },
    });
    const body = (await res.json()) as { path: string; requestId: string };
    expect(body.path).toBe('/catalog/products/lip');
    expect(body.requestId).not.toBe('bad id!');
    expect(body.requestId).toBe(res.headers.get('x-request-id'));
  });

  it('streams the body there and the answer back', async () => {
    const core = await listen(fakeCore());
    const gw = await gateway({ core: core.url });
    const res = await fetch(`${gw.url}${API_PREFIX}/commerce/orders`, {
      method: 'POST',
      headers: { ...customer, 'content-type': 'application/json' },
      body: JSON.stringify({ note: 'gift wrap' }),
    });
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ received: { note: 'gift wrap' } });
  });

  it('lets only a known app through, and only to its own routes', async () => {
    const core = await listen(fakeCore());
    const gw = await gateway({ core: core.url });
    const answer = async (headers: Record<string, string>, path = '/commerce/orders') => {
      const res = await fetch(`${gw.url}${API_PREFIX}${path}`, {
        method: 'POST',
        headers: { ...headers, 'content-type': 'application/json' },
        body: '{}',
      });
      const { error } = (await res.json()) as { error: { code: string; message: string } };
      return [res.status, error.code, error.message];
    };
    const notAnApp = [403, 'APP_NOT_ALLOWED', 'This request does not come from a Beautinique app.'];
    expect(await answer({})).toEqual(notAnApp);
    expect(await answer({ 'X-BQ-App': 'shop' })).toEqual(notAnApp);
    // the app is checked before the route, so unknown paths tell a stranger nothing
    expect(await answer({}, '/no/such/path')).toEqual(notAnApp);
    expect(await answer({ 'X-BQ-App': 'seller' })).toEqual([
      403,
      'APP_NOT_ALLOWED',
      'This app cannot use this feature.',
    ]);
  });

  it('answers NOT_FOUND for unknown paths, other methods and dot segments', async () => {
    const core = await listen(fakeCore());
    const gw = await gateway({ core: core.url });
    const res = await fetch(`${gw.url}${API_PREFIX}/catalog/nope`, { headers: customer });
    expect(res.status).toBe(404);
    expect(await res.json()).toMatchObject({ error: { code: 'NOT_FOUND' } });
    const get = await fetch(`${gw.url}${API_PREFIX}/commerce/orders`, { headers: customer });
    expect(get.status).toBe(404);
    expect(await raw(gw.url, `${API_PREFIX}/catalog/products/lip`)).toBe(200);
    for (const segment of ['..', '%2e%2e', '.', '%2E']) {
      expect(await raw(gw.url, `${API_PREFIX}/catalog/products/${segment}`), segment).toBe(404);
    }
  });

  it('answers 503 when the owner does not run or is down, and 504 when it is too slow', async () => {
    const down = await startServer(fakeCore(), {
      port: 0,
      host: '127.0.0.1',
      logger,
      handleSignals: false,
    });
    await down.stop();
    const slow = await listen(fakeCore(1000));
    const status = async (upstreams: GatewayAppOptions['upstreams'], path: string, app: string) => {
      const gw = await gateway(upstreams, 200);
      const res = await fetch(`${gw.url}${API_PREFIX}${path}`, { headers: { 'X-BQ-App': app } });
      return [res.status, ((await res.json()) as { error: { code: string } }).error.code];
    };
    expect(await status({}, '/payments/refunds', 'finance')).toEqual([503, 'SERVICE_UNAVAILABLE']);
    expect(await status({ core: down.url }, '/catalog/products/a', 'customer')).toEqual([
      503,
      'SERVICE_UNAVAILABLE',
    ]);
    expect(await status({ core: slow.url }, '/catalog/products/a', 'customer')).toEqual([
      504,
      'UPSTREAM_TIMEOUT',
    ]);
  });

  it('is ready only while every configured upstream answers /health', async () => {
    const core = await listen(fakeCore());
    const healthy = await gateway({ core: core.url, identity: undefined });
    const ok = await fetch(`${healthy.url}/ready`);
    expect(ok.status).toBe(200);
    expect(await ok.json()).toEqual({ status: 'ready', checks: { core: 'ok' } });
    await core.stop();
    const failing = await fetch(`${healthy.url}/ready`);
    expect(failing.status).toBe(503);
    const sick = await listen((_req, res) => {
      res.statusCode = 500;
      res.end();
    });
    const withSick = await gateway({ core: sick.url });
    expect(await (await fetch(`${withSick.url}/ready`)).json()).toMatchObject({
      checks: { core: 'failing' },
    });
  });

  it('reads GATEWAY__* settings', () => {
    const config = readConfig({
      env: { GATEWAY__PORT: '9000', GATEWAY__CORE_URL: 'http://127.0.0.1:8084' },
    });
    expect(config).toMatchObject({
      port: 9000,
      coreUrl: 'http://127.0.0.1:8084',
      upstreamTimeoutMs: 30_000,
    });
    expect(config.identityUrl).toBeUndefined();
    expect(() => readConfig({ env: { GATEWAY__CORE_URL: 'ftp://127.0.0.1' } })).toThrow(
      'GATEWAY__CORE_URL',
    );
  });
});
