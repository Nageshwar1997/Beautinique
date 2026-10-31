import { randomBytes, randomUUID } from 'node:crypto';
import { createServer, request, type RequestListener } from 'node:http';
import { type AddressInfo, connect } from 'node:net';

import { generateSigningKey, signJwt } from '@beautinique/backend-server-crypto';
import {
  ConfigError,
  createApp,
  createLogger,
  jwksCache,
  LOOPBACK_HOST,
  passportSigner,
  passportVerifier,
  type RunningServer,
  startServer,
} from '@beautinique/backend-server-kit';
import { connectRedis, type RedisConnection } from '@beautinique/backend-server-queue';
import {
  createRateLimiter,
  type RateLimiter,
  RateLimitUnavailableError,
} from '@beautinique/backend-server-ratelimit';
import {
  type AppId,
  appPermissionsKey,
  authzVersionKey,
  defineRoute,
  gatewayManifest,
  HEADERS,
  PASSPORT_JWKS_PATH,
  revokedSessionKey,
  revokedUserKey,
} from '@beautinique/shared-contracts';
import { object, string, unknown } from '@beautinique/shared-zod';
import type { Express } from 'express';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { buildApp, type GatewayAppOptions } from '../src/app.ts';
import { appRegistry } from '../src/apps.ts';
import { readConfig } from '../src/config.ts';
import { manifest as platformManifest } from '../src/manifest.ts';
import { API_PREFIX, stepUpFresh } from '../src/proxy.ts';
import { DEFAULT_RATE_LIMITS } from '../src/rate-limits.ts';
import { start } from '../src/service.ts';
import { sessionGate } from '../src/sessions.ts';
import type { StatusBody } from '../src/status.ts';
import { clientIp, originSecretCheck } from '../src/trust.ts';
import { REDIS_URL } from './env.ts';

// Rate limits need Valkey (test/env.ts); every key of this run has its own prefix.
const testPrefix = `bq:test:gw:${randomUUID().slice(0, 8)}:`;
const logger = createLogger({ name: 'test', level: 'silent' });
// made per run, so no secret-looking literal sits in the repo (gitleaks)
const SECRET = randomBytes(32).toString('base64url');
const OLD_SECRET = randomBytes(32).toString('base64url');

let redis: RedisConnection;
beforeAll(async () => {
  try {
    redis = await connectRedis({ url: REDIS_URL, name: 'gateway-test', logger });
  } catch (error) {
    throw new Error('These tests need Valkey: run `npm run infra:up` (or set REDIS_TEST_URL).', {
      cause: error,
    });
  }
});
afterAll(async () => {
  const keys = await redis.client.keys(`${testPrefix}*`);
  if (keys.length > 0) await redis.client.del(...keys);
  await redis.close();
});

const servers: RunningServer[] = [];
afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => server.stop()));
});

async function listen(app: RequestListener): Promise<RunningServer> {
  const server = await startServer(app, {
    port: 0,
    host: LOOPBACK_HOST,
    logger,
    handleSignals: false,
  });
  servers.push(server);
  return server;
}

const route = (
  fields: Pick<Parameters<typeof defineRoute>[0], 'id' | 'method' | 'path' | 'apps' | 'access'> &
    Partial<Parameters<typeof defineRoute>[0]>,
) =>
  defineRoute({
    summary: fields.id,
    rateLimit: 'public',
    idempotency: false,
    stepUp: false,
    owner: 'core',
    input: {},
    output: unknown(),
    ...fields,
  });

const manifest = gatewayManifest([
  route({
    id: 'catalog.products.get',
    method: 'GET',
    path: '/catalog/products/:productId',
    apps: ['customer', 'seller'],
    access: { type: 'public' },
    input: { params: object({ productId: string() }) },
  }),
  route({
    id: 'catalog.banners.list',
    method: 'GET',
    path: '/catalog/banners',
    apps: ['customer'],
    access: { type: 'public' },
    cache: { sMaxAge: 300, staleWhileRevalidate: 60 },
  }),
  route({
    id: 'commerce.orders.create',
    method: 'POST',
    path: '/commerce/orders',
    apps: ['customer'],
    access: { type: 'public' },
    rateLimit: 'write',
    idempotency: true,
    input: { body: object({ note: string() }) },
  }),
  route({
    id: 'customers.profile.get',
    method: 'GET',
    path: '/customers/profile',
    apps: ['customer', 'seller'],
    access: { type: 'signed-in' },
    rateLimit: 'read',
  }),
  route({
    id: 'customers.profile.secure',
    method: 'POST',
    path: '/customers/profile/secure',
    apps: ['customer'],
    access: { type: 'signed-in' },
    rateLimit: 'write',
    stepUp: true,
  }),
  route({
    id: 'payments.refunds.list',
    method: 'GET',
    path: '/payments/refunds',
    apps: ['finance'],
    access: { type: 'permission', permission: 'payments.refunds.read' },
    rateLimit: 'read',
    owner: 'payments',
  }),
  route({
    id: 'payments.refunds.approve',
    method: 'POST',
    path: '/payments/refunds/:refundId/approve',
    apps: ['finance'],
    access: { type: 'permission', permission: 'payments.refunds.approve' },
    rateLimit: 'write',
    stepUp: true,
    owner: 'payments',
    input: { params: object({ refundId: string() }) },
  }),
  route({
    id: 'payments.methods.list',
    method: 'GET',
    path: '/payments/methods',
    apps: ['customer'],
    access: { type: 'public' },
    owner: 'payments',
  }),
  route({
    id: 'identity.sessions.start',
    method: 'POST',
    path: '/identity/sessions',
    apps: ['customer'],
    access: { type: 'public' },
    rateLimit: 'auth',
    owner: 'identity',
    input: { body: object({}) },
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
          clientIp: req.get('x-bq-client-ip'),
          originSecret: req.get('x-origin-secret') ?? null,
          forwardedFor: req.get('x-forwarded-for') ?? null,
          realIp: req.get('x-real-ip') ?? null,
          cookie: req.get('cookie') ?? null,
          passport: req.get('x-bq-passport') ?? null,
        });
      });
      app.get('/catalog/banners', (req, res) => {
        res.setHeader('Set-Cookie', 'tracking=1');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Vercel-Cache-Tag', 'banners');
        res.json({
          cookie: req.get('cookie') ?? null,
          authorization: req.get('authorization') ?? null,
        });
      });
      app.get('/payments/refunds', (req, res) => {
        res.json({ refunds: [], passport: req.get('x-bq-passport') !== undefined });
      });
      app.post('/payments/refunds/:refundId/approve', (_req, res) => {
        res.json({ approved: true });
      });
      app.get('/customers/profile', (req, res) => {
        res.json({ passport: req.get('x-bq-passport') ?? null, cookie: req.get('cookie') ?? null });
      });
      app.post('/customers/profile/secure', (req, res) => {
        res.json({ passport: req.get('x-bq-passport') !== undefined });
      });
      app.post('/commerce/orders', (req, res) => {
        res.setHeader('Cache-Control', 'public, max-age=600');
        res.status(201).json({ received: req.body as unknown });
      });
      // paths the gateway must never reach for a route it did not match
      app.get(['/catalog', '/catalog/products', '/commerce/orders'], (_req, res) => {
        res.json({ leaked: true });
      });
    },
  });
}

const apps = appRegistry({
  hosts: new Map([
    ['customer.example', 'customer'],
    ['localhost:3001', 'customer'],
    ['seller.example', 'seller'],
  ]),
  vercelProjects: [
    ['customer', 'bq-customer'],
    ['seller', 'bq-seller'],
  ],
  vercelScope: 'team-slug',
});

// identity's token key in these tests, and the access tokens it would sign
const identityKey = generateSigningKey();
const identityKeys = jwksCache({ load: () => Promise.resolve({ keys: [identityKey.publicJwk] }) });
const accessToken = ({
  app = 'customer',
  sessionId = randomUUID(),
  userId = randomUUID(),
  issuedAt = Math.floor(Date.now() / 1000),
  seconds = 600,
  key = identityKey,
  av = 0,
  su,
}: {
  app?: AppId;
  sessionId?: string;
  userId?: string;
  issuedAt?: number;
  seconds?: number;
  key?: ReturnType<typeof generateSigningKey>;
  av?: number;
  /** when the session last stepped up (seconds) */
  su?: number;
} = {}) =>
  signJwt(
    {
      iss: 'bq:identity',
      sub: userId,
      aud: `bq:${app}`,
      iat: issuedAt,
      exp: issuedAt + seconds,
      sid: sessionId,
      amr: ['password'],
      av,
      ...(su === undefined ? {} : { su }),
    },
    { kid: key.kid, privateKey: key.privateKeyPem },
  );

interface GatewayOptions {
  timeoutMs?: number;
  limiter?: RateLimiter;
  rateLimits?: Partial<GatewayAppOptions['rateLimits']>;
  sessions?: GatewayAppOptions['sessions'];
  passport?: GatewayAppOptions['passport'];
}

async function gateway(
  upstreams: GatewayAppOptions['upstreams'],
  { timeoutMs = 2000, limiter, rateLimits, sessions, passport }: GatewayOptions = {},
) {
  return listen(
    buildApp({
      logger,
      manifest,
      upstreams,
      upstreamTimeoutMs: timeoutMs,
      apps,
      isOriginSecret: originSecretCheck([SECRET, OLD_SECRET]),
      // every gateway of a test gets fresh buckets
      limiter:
        limiter ??
        createRateLimiter({ redis: redis.client, prefix: `${testPrefix}${randomUUID()}:` }),
      rateLimits: { ...DEFAULT_RATE_LIMITS, ...rateLimits },
      redisReady: redis.ready,
      sessions: sessions ?? sessionGate({ keys: identityKeys, redis: redis.client }),
      passport: passport ?? passportSigner(),
    }),
  );
}

/** A request with exactly this path (a URL would clean up ".." first). */
function raw(url: string, path: string): Promise<number> {
  const { hostname, port } = new URL(url);
  return new Promise((resolve, reject) => {
    request(
      { hostname, port, path, headers: { 'X-BQ-App': 'customer', 'x-origin-secret': SECRET } },
      (res) => {
        res.resume();
        resolve(res.statusCode ?? 0);
      },
    )
      .on('error', reject)
      .end();
  });
}

const customer = { 'X-BQ-App': 'customer', 'x-origin-secret': SECRET };

const errorOf = async (res: Response) =>
  [res.status, ((await res.json()) as { error: { code: string } }).error.code] as const;

describe('gateway routing', () => {
  it('sends a request to its owner at the route path, with the query, request id and client IP', async () => {
    const core = await listen(fakeCore());
    const gw = await gateway({ core: core.url });
    const res = await fetch(`${gw.url}${API_PREFIX}/catalog/products/lip%20kit?shade=rose`, {
      headers: {
        ...customer,
        'X-Request-Id': 'test-request-0001',
        'x-real-ip': '203.0.113.7',
        'x-forwarded-for': '198.51.100.1',
        'x-bq-client-ip': '198.51.100.2',
      },
    });
    expect(res.status).toBe(200);
    expect(res.headers.get('x-request-id')).toBe('test-request-0001');
    expect(res.headers.get('content-type')).toContain('application/json');
    expect(await res.json()).toEqual({
      path: '/catalog/products/lip%20kit?shade=rose',
      productId: 'lip kit',
      app: 'customer',
      requestId: 'test-request-0001',
      // Vercel's x-real-ip, because the request carried the origin secret; nothing else the client sent
      clientIp: '203.0.113.7',
      originSecret: null,
      forwardedFor: null,
      realIp: null,
      cookie: null,
      passport: null,
    });
  });

  it('forwards its own request id and a re-encoded path', async () => {
    const core = await listen(fakeCore());
    const gw = await gateway({ core: core.url });
    const res = await fetch(`${gw.url}${API_PREFIX}/catalog/products/%6Cip`, {
      headers: { ...customer, 'X-Request-Id': 'bad id!', 'x-real-ip': 'not-an-ip' },
    });
    const body = (await res.json()) as { path: string; requestId: string; clientIp: string };
    expect(body.path).toBe('/catalog/products/lip');
    expect(body.requestId).not.toBe('bad id!');
    expect(body.requestId).toBe(res.headers.get('x-request-id'));
    // no usable x-real-ip: the socket address
    expect(body.clientIp).toBe('127.0.0.1');
  });

  it('streams the body there and the answer back', async () => {
    const core = await listen(fakeCore());
    const gw = await gateway({ core: core.url });
    const res = await fetch(`${gw.url}${API_PREFIX}/commerce/orders`, {
      method: 'POST',
      headers: { ...customer, 'content-type': 'application/json', 'Idempotency-Key': 'order-1' },
      body: JSON.stringify({ note: 'gift wrap' }),
    });
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ received: { note: 'gift wrap' } });
  });

  it('answers NOT_FOUND for unknown paths, other methods and dot segments', async () => {
    const core = await listen(fakeCore());
    const gw = await gateway({ core: core.url });
    const res = await fetch(`${gw.url}${API_PREFIX}/catalog/nope`, { headers: customer });
    expect(await errorOf(res)).toEqual([404, 'NOT_FOUND']);
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
      host: LOOPBACK_HOST,
      logger,
      handleSignals: false,
    });
    await down.stop();
    const slow = await listen(fakeCore(1000));
    const status = async (upstreams: GatewayAppOptions['upstreams'], path: string) => {
      const gw = await gateway(upstreams, { timeoutMs: 200 });
      return errorOf(await fetch(`${gw.url}${API_PREFIX}${path}`, { headers: customer }));
    };
    expect(await status({}, '/payments/methods')).toEqual([503, 'SERVICE_UNAVAILABLE']);
    expect(await status({ core: down.url }, '/catalog/products/a')).toEqual([
      503,
      'SERVICE_UNAVAILABLE',
    ]);
    expect(await status({ core: slow.url }, '/catalog/products/a')).toEqual([
      504,
      'UPSTREAM_TIMEOUT',
    ]);
  });

  it('serves the platform routes of the contracts catalogue', () => {
    const record = platformManifest.find((entry) => entry.id === 'platform.ping.record');
    expect(record).toMatchObject({
      method: 'POST',
      path: '/platform/pings',
      owner: 'core',
      access: { type: 'public' },
      rateLimit: 'write',
      idempotency: true,
    });
    expect(platformManifest.map((entry) => entry.id)).toContain('platform.ping.get');
  });
});

describe('who may call', () => {
  it('needs the origin secret of the apps (the current or, during a rotation, the old one)', async () => {
    const core = await listen(fakeCore());
    const gw = await gateway({ core: core.url });
    const path = `${gw.url}${API_PREFIX}/catalog/products/a`;
    const with_ = (headers: Record<string, string>) => fetch(path, { headers });
    expect(await errorOf(await with_({ 'X-BQ-App': 'customer' }))).toEqual([403, 'FORBIDDEN']);
    expect(
      await errorOf(await with_({ 'X-BQ-App': 'customer', 'x-origin-secret': `${SECRET}x` })),
    ).toEqual([403, 'FORBIDDEN']);
    for (const secret of [SECRET, OLD_SECRET]) {
      expect((await with_({ 'X-BQ-App': 'customer', 'x-origin-secret': secret })).status).toBe(200);
    }
    // Render and the monitors call these directly, without the secret
    for (const open of ['/health', '/ready', '/status']) {
      expect((await fetch(`${gw.url}${open}`)).status, open).toBe(200);
    }
    // and the apps' wake-up screen calls /wake straight from the browser: nothing in it, never cached
    const woken = await fetch(`${gw.url}/wake`);
    expect(woken.status).toBe(204);
    expect(woken.headers.get('cache-control')).toBe('no-store');
    // the apps' pages may receive it from their own host; every other answer stays same-origin
    expect(woken.headers.get('cross-origin-resource-policy')).toBe('cross-origin');
    expect((await fetch(`${gw.url}/health`)).headers.get('cross-origin-resource-policy')).toBe(
      'same-origin',
    );
    expect(await woken.text()).toBe('');
    expect((await fetch(`${gw.url}/wake`, { method: 'POST' })).status).toBe(404);
  });

  it('lets only a known app through, and only to its own routes', async () => {
    const core = await listen(fakeCore());
    const gw = await gateway({ core: core.url });
    const answer = async (headers: Record<string, string>, path = '/commerce/orders') => {
      const res = await fetch(`${gw.url}${API_PREFIX}${path}`, {
        method: 'POST',
        headers: { 'x-origin-secret': SECRET, 'Idempotency-Key': 'k1', ...headers },
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

  it("accepts only the app's own host and origin (CSRF)", async () => {
    const core = await listen(fakeCore());
    const gw = await gateway({ core: core.url });
    const status = async (headers: Record<string, string>) =>
      (
        await fetch(`${gw.url}${API_PREFIX}/catalog/products/a`, {
          headers: { ...customer, ...headers },
        })
      ).status;
    const preview = 'bq-customer-git-feat-landing-team-slug.vercel.app';
    // through Vercel: x-forwarded-host is the app's host
    expect(await status({ 'x-forwarded-host': 'customer.example' })).toBe(200);
    expect(await status({ 'x-forwarded-host': 'CUSTOMER.example.' })).toBe(200);
    expect(await status({ 'x-forwarded-host': preview })).toBe(200);
    expect(await status({ 'x-forwarded-host': 'bq-customer-abc123xyz-team-slug.vercel.app' })).toBe(
      200,
    );
    for (const host of [
      'seller.example',
      'bq-seller-git-main-team-slug.vercel.app',
      'bq-customer-git-main-other-team.vercel.app',
      'bq-customer.vercel.app',
      'evil.example',
      'customer.example, evil.example',
    ]) {
      expect(await status({ 'x-forwarded-host': host }), host).toBe(403);
    }
    // a browser's Origin must be the very host the request came through (same-origin API)
    const via = (host: string, origin: string) => status({ 'x-forwarded-host': host, origin });
    expect(await via('customer.example', 'https://customer.example')).toBe(200);
    expect(await via('customer.example', 'https://CUSTOMER.example')).toBe(200);
    expect(await via(preview, `https://${preview}`)).toBe(200);
    for (const origin of [
      'https://seller.example',
      'https://evil.example',
      'null',
      'file://x',
      'ftp://customer.example',
      `https://${preview}`,
      // another Vercel account whose scope ends in "-team-slug" fits the preview pattern
      'https://bq-customer-git-main-evil-team-slug.vercel.app',
    ]) {
      expect(await via('customer.example', origin), origin).toBe(403);
    }
    // an Origin without x-forwarded-host must match Host, which here is no app's
    expect(await status({ origin: 'https://customer.example' })).toBe(403);
    // no proxy in front (dev server): Host may be the app's own, or no app's (a direct caller)
    const direct = (host: string, extra: Record<string, string> = {}) =>
      new Promise<number>((resolve, reject) => {
        const { hostname, port } = new URL(gw.url);
        request(
          {
            hostname,
            port,
            path: `${API_PREFIX}/catalog/products/a`,
            headers: { ...customer, host, ...extra },
          },
          (res) => {
            res.resume();
            resolve(res.statusCode ?? 0);
          },
        )
          .on('error', reject)
          .end();
      });
    expect(await direct('localhost:3001')).toBe(200);
    expect(await direct('bq-live.onrender.com')).toBe(200);
    expect(await direct('seller.example')).toBe(403);
    // the dev server keeps Host, and the page's Origin is that same app host
    expect(await direct('localhost:3001', { origin: 'http://localhost:3001' })).toBe(200);
    // a page on a host that is no app's (the server itself) is not an app
    expect(await direct('bq-live.onrender.com', { origin: 'https://bq-live.onrender.com' })).toBe(
      403,
    );
  });

  it('answers 401 on every route that needs sign-in, to a request without the access cookie', async () => {
    const core = await listen(fakeCore());
    const gw = await gateway({ core: core.url, payments: core.url });
    expect(
      await errorOf(await fetch(`${gw.url}${API_PREFIX}/customers/profile`, { headers: customer })),
    ).toEqual([401, 'UNAUTHENTICATED']);
    expect(
      await errorOf(
        await fetch(`${gw.url}${API_PREFIX}/payments/refunds`, {
          headers: { ...customer, 'X-BQ-App': 'finance' },
        }),
      ),
    ).toEqual([401, 'UNAUTHENTICATED']);
  });

  it('needs the Idempotency-Key the route declares', async () => {
    const core = await listen(fakeCore());
    const gw = await gateway({ core: core.url });
    const post = (key?: string) =>
      fetch(`${gw.url}${API_PREFIX}/commerce/orders`, {
        method: 'POST',
        headers: {
          ...customer,
          'content-type': 'application/json',
          ...(key === undefined ? {} : { 'Idempotency-Key': key }),
        },
        body: JSON.stringify({ note: 'x' }),
      });
    for (const key of [undefined, '', 'has space', 'x'.repeat(256), 'ünïcode']) {
      expect(await errorOf(await post(key)), String(key)).toEqual([
        400,
        'IDEMPOTENCY_KEY_REQUIRED',
      ]);
    }
    expect((await post('x'.repeat(255))).status).toBe(201);
  });
});

describe('streams', () => {
  /** An owner that records every request it reads, body included. */
  const recordingOwner = () => {
    const seen: { method: string; url: string; body: string }[] = [];
    const app: RequestListener = (req, res) => {
      let body = '';
      req.on('data', (chunk: Buffer) => (body += chunk.toString()));
      req.on('end', () => {
        seen.push({ method: req.method ?? '', url: req.url ?? '', body });
        res.setHeader('content-type', 'application/json');
        res.end('{"data":{}}');
      });
    };
    return { app, seen };
  };

  /** Raw bytes to the gateway, so a body can go where fetch would never put one. */
  const rawRequest = (url: string, bytes: string) =>
    new Promise<string>((resolve, reject) => {
      const { hostname, port } = new URL(url);
      const socket = connect(Number(port), hostname, () => socket.end(bytes));
      let answer = '';
      socket.on('data', (chunk) => (answer += chunk.toString()));
      socket.on('end', () => {
        resolve(answer);
      });
      socket.on('error', reject);
    });

  it('refuses a body on a GET route, so nothing can be smuggled to the owner', async () => {
    const owner = recordingOwner();
    const server = await listen(owner.app);
    const gw = await gateway({ core: server.url });
    const smuggled =
      'POST /commerce/orders HTTP/1.1\r\nHost: x\r\nX-BQ-Client-Ip: 6.6.6.6\r\nContent-Length: 5\r\n\r\nhello';
    const head = `GET ${API_PREFIX}/catalog/products/a HTTP/1.1\r\nHost: x\r\nX-BQ-App: customer\r\nx-origin-secret: ${SECRET}\r\nConnection: close\r\n`;
    const chunked = await rawRequest(
      gw.url,
      `${head}Transfer-Encoding: chunked\r\n\r\n${smuggled.length.toString(16)}\r\n${smuggled}\r\n0\r\n\r\n`,
    );
    expect(chunked).toMatch(/^HTTP\/1\.1 400 /);
    const withLength = await rawRequest(gw.url, `${head}Content-Length: 5\r\n\r\nhello`);
    expect(withLength).toMatch(/^HTTP\/1\.1 400 /);
    expect(owner.seen).toEqual([]);
    // a GET without a body still goes through, as one request
    expect(
      (await fetch(`${gw.url}${API_PREFIX}/catalog/products/a`, { headers: customer })).status,
    ).toBe(200);
    expect(owner.seen).toEqual([{ method: 'GET', url: '/catalog/products/a', body: '' }]);
  });

  it('frames a streamed (chunked) body for the owner', async () => {
    const owner = recordingOwner();
    const server = await listen(owner.app);
    const gw = await gateway({ core: server.url });
    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('{"note":'));
        controller.enqueue(new TextEncoder().encode('"two parts"}'));
        controller.close();
      },
    });
    const res = await fetch(`${gw.url}${API_PREFIX}/commerce/orders`, {
      method: 'POST',
      headers: { ...customer, 'content-type': 'application/json', 'Idempotency-Key': 'stream-1' },
      body,
      duplex: 'half',
    });
    expect(res.status).toBe(200);
    expect(owner.seen).toEqual([
      { method: 'POST', url: '/commerce/orders', body: '{"note":"two parts"}' },
    ]);
  });

  it('sends nothing to the owner when the caller leaves while the gateway waits', async () => {
    let connections = 0;
    const owner = createServer((_req, res) => res.end('{"data":{}}'));
    owner.on('connection', () => {
      connections += 1;
    });
    await new Promise<void>((resolve) => owner.listen(0, LOOPBACK_HOST, resolve));
    try {
      // a slow Redis: the rate limit takes 300 ms
      const slow: RateLimiter = {
        take: async (_key, rule) => {
          await new Promise((resolve) => setTimeout(resolve, 300));
          return { allowed: true, limit: rule.limit, remaining: 1, resetMs: 1, retryAfterMs: 0 };
        },
        reset: () => Promise.resolve(),
      };
      const { port: ownerPort } = owner.address() as AddressInfo;
      const gw = await gateway(
        { core: `http://${LOOPBACK_HOST}:${String(ownerPort)}` },
        { limiter: slow },
      );
      const { hostname, port } = new URL(gw.url);
      const socket = connect(Number(port), hostname, () => {
        socket.write(
          `POST ${API_PREFIX}/commerce/orders HTTP/1.1\r\nHost: x\r\nX-BQ-App: customer\r\nx-origin-secret: ${SECRET}\r\nIdempotency-Key: k-gone\r\nContent-Type: application/json\r\nContent-Length: 12\r\n\r\n{"note":"x"}`,
        );
        // the caller gives up while the gateway still waits for the rate limit
        setTimeout(() => socket.destroy(), 100);
      });
      await new Promise((resolve) => setTimeout(resolve, 700));
      expect(connections).toBe(0);
    } finally {
      owner.closeAllConnections();
      await new Promise((resolve) => owner.close(resolve));
    }
  });

  it('cuts the answer off when the owner stops halfway, instead of leaving it hanging', async () => {
    const stuck = await listen((_req, res) => {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.write('{"data":');
      // the rest never comes
    });
    const gw = await gateway({ core: stuck.url }, { timeoutMs: 300 });
    const started = Date.now();
    const res = await fetch(`${gw.url}${API_PREFIX}/catalog/products/a`, { headers: customer });
    expect(res.status).toBe(200);
    await expect(res.text()).rejects.toThrow();
    expect(Date.now() - started).toBeLessThan(3000);
  });
});

describe('client IP', () => {
  /** Just what clientIp() reads of a request. */
  const fake = (headers: Record<string, string>, remoteAddress?: string) =>
    ({
      get: (name: string) => headers[name.toLowerCase()],
      socket: { remoteAddress },
    }) as unknown as Parameters<typeof clientIp>[0];

  it("takes Vercel's x-real-ip only with the origin secret, else the socket address", () => {
    const req = fake({ 'x-real-ip': ' 203.0.113.7 ' }, '10.0.0.5');
    expect(clientIp(req, true)).toBe('203.0.113.7');
    // anyone can send x-real-ip straight to the server
    expect(clientIp(req, false)).toBe('10.0.0.5');
    expect(clientIp(fake({ 'x-real-ip': 'nope' }, '::ffff:10.0.0.6'), true)).toBe('10.0.0.6');
    expect(clientIp(fake({ 'x-real-ip': '2401:4900::1' }), true)).toBe('2401:4900::1');
    expect(clientIp(fake({}), true)).toBe('0.0.0.0');
  });
});

describe('rate limits', () => {
  it('refuse a client over its class budget, with the wait, and keep clients apart', async () => {
    const core = await listen(fakeCore());
    const gw = await gateway(
      { core: core.url },
      { rateLimits: { public: { limit: 2, windowMs: 60_000 } } },
    );
    const get = (ip: string) =>
      fetch(`${gw.url}${API_PREFIX}/catalog/products/a`, {
        headers: { ...customer, 'x-real-ip': ip },
      });
    const first = await get('203.0.113.10');
    expect(first.status).toBe(200);
    expect(first.headers.get('ratelimit-policy')).toBe('"public";q=2;w=60');
    expect(first.headers.get('ratelimit')).toBe('"public";r=1;t=30');
    expect((await get('203.0.113.10')).status).toBe(200);
    const refused = await get('203.0.113.10');
    expect(await errorOf(refused.clone())).toEqual([429, 'RATE_LIMITED']);
    expect(refused.headers.get('retry-after')).toBe('30');
    expect(refused.headers.get('cache-control')).toBe('no-store');
    // another client has its own bucket; one IPv6 home network (/64) shares one
    expect((await get('203.0.113.11')).status).toBe(200);
    expect((await get('2401:4900:1c2a:7f00::1')).status).toBe(200);
    expect((await get('2401:4900:1c2a:7f00::2')).status).toBe(200);
    expect((await get('2401:4900:1c2a:7f00::3')).status).toBe(429);
  });

  it('when Redis is down, let ordinary classes through and refuse auth (fail closed)', async () => {
    const core = await listen(fakeCore());
    const identity = await listen(
      createApp({
        logger,
        routes: (app) => app.post('/identity/sessions', (_req, res) => res.json({ ok: true })),
      }),
    );
    const down: RateLimiter = {
      take: () => Promise.reject(new RateLimitUnavailableError('Redis failed')),
      reset: () => Promise.reject(new RateLimitUnavailableError('Redis failed')),
    };
    const gw = await gateway({ core: core.url, identity: identity.url }, { limiter: down });
    const open = await fetch(`${gw.url}${API_PREFIX}/catalog/products/a`, { headers: customer });
    expect(open.status).toBe(200);
    expect(open.headers.get('ratelimit')).toBeNull();
    const auth = await fetch(`${gw.url}${API_PREFIX}/identity/sessions`, {
      method: 'POST',
      headers: { ...customer, 'content-type': 'application/json' },
      body: '{}',
    });
    expect(await errorOf(auth)).toEqual([503, 'SERVICE_UNAVAILABLE']);
  });
});

describe('cache headers', () => {
  it('cache a cached route on the CDN only, with no cookie either way', async () => {
    const core = await listen(fakeCore());
    const gw = await gateway({ core: core.url });
    const res = await fetch(`${gw.url}${API_PREFIX}/catalog/banners`, {
      headers: { ...customer, cookie: '__Host-bq_customer_at=secret', authorization: 'Bearer t' },
    });
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe(
      'public, max-age=0, s-maxage=300, stale-while-revalidate=60',
    );
    expect(res.headers.get('set-cookie')).toBeNull();
    expect(res.headers.get('vercel-cache-tag')).toBe('banners');
    expect(await res.json()).toEqual({ cookie: null, authorization: null });
  });

  it('never let other answers be shared, whatever the owner says', async () => {
    const core = await listen(fakeCore());
    const gw = await gateway({ core: core.url });
    const order = await fetch(`${gw.url}${API_PREFIX}/commerce/orders`, {
      method: 'POST',
      headers: { ...customer, 'content-type': 'application/json', 'Idempotency-Key': 'k2' },
      body: JSON.stringify({ note: 'x' }),
    });
    expect(order.headers.get('cache-control')).toBe('private, no-store');
    const product = await fetch(`${gw.url}${API_PREFIX}/catalog/products/a`, {
      headers: { ...customer, cookie: 'a=1' },
    });
    expect(product.headers.get('cache-control')).toBe('private, no-store');
    // cookies still reach routes that are not cached (sign-in will use them)
    expect(((await product.json()) as { cookie: string }).cookie).toBe('a=1');
    const missing = await fetch(`${gw.url}${API_PREFIX}/nope`, { headers: customer });
    expect(missing.headers.get('cache-control')).toBe('no-store');
  });

  it("keep an owner's own private policy", async () => {
    const owner = await listen(
      createApp({
        logger,
        routes: (app) =>
          app.get('/catalog/products/:productId', (_req, res) => {
            res.setHeader('Cache-Control', 'private, no-cache');
            res.setHeader('ETag', '"v1"');
            res.json({});
          }),
      }),
    );
    const gw = await gateway({ core: owner.url });
    const res = await fetch(`${gw.url}${API_PREFIX}/catalog/products/a`, { headers: customer });
    expect(res.headers.get('cache-control')).toBe('private, no-cache');
    expect(res.headers.get('etag')).toBe('"v1"');
  });
});

describe('health', () => {
  /** A deployable whose /ready answers with these checks (any values, as a broken one might). */
  const deployable = (checks: Record<string, string>, ready = true) => {
    let calls = 0;
    const app: RequestListener = (req, res) => {
      if (req.url !== '/ready') {
        res.statusCode = 404;
        res.end();
        return;
      }
      calls += 1;
      res.statusCode = ready ? 200 : 503;
      res.setHeader('content-type', 'application/json');
      res.end(JSON.stringify({ status: ready ? 'ready' : 'not-ready', checks }));
    };
    return { app, calls: () => calls };
  };

  it('is ready only while Redis and every configured upstream answer', async () => {
    const core = await listen(fakeCore());
    const healthy = await gateway({ core: core.url, identity: undefined });
    const ok = await fetch(`${healthy.url}/ready`);
    expect(ok.status).toBe(200);
    expect(await ok.json()).toEqual({ status: 'ready', checks: { redis: 'ok', core: 'ok' } });
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

  it('/status shows every deployable and its checks: 200 when all that run are ok', async () => {
    const core = deployable({ mongo: 'ok', redis: 'ok', 'outbox.lag': 'ok' });
    const identity = deployable({});
    const coreServer = await listen(core.app);
    const identityServer = await listen(identity.app);
    const gw = await gateway({ core: coreServer.url, identity: identityServer.url });
    const res = await fetch(`${gw.url}/status`);
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(await res.json()).toEqual({
      status: 'ok',
      deployables: {
        gateway: { status: 'ok', checks: { redis: 'ok' } },
        identity: { status: 'ok', checks: {} },
        payments: { status: 'not-running' },
        notify: { status: 'not-running' },
        core: { status: 'ok', checks: { mongo: 'ok', redis: 'ok', 'outbox.lag': 'ok' } },
      },
    });
    // one answer serves the next requests for a few seconds: /status cannot flood the databases
    await fetch(`${gw.url}/status`);
    expect(core.calls()).toBe(1);
  });

  it('/status is degraded (503) when one deployable fails, and echoes only plain check names', async () => {
    const core = deployable(
      { mongo: 'failing', 'Bad Name <script>': 'ok', redis: 'surprise' },
      false,
    );
    const coreServer = await listen(core.app);
    const down = await startServer(fakeCore(), {
      port: 0,
      host: LOOPBACK_HOST,
      logger,
      handleSignals: false,
    });
    await down.stop();
    const gw = await gateway({ core: coreServer.url, identity: down.url });
    const res = await fetch(`${gw.url}/status`);
    expect(res.status).toBe(503);
    const body = (await res.json()) as StatusBody;
    expect(body.status).toBe('degraded');
    expect(body.deployables.core).toEqual({
      status: 'failing',
      checks: { mongo: 'failing', redis: 'failing' },
    });
    expect(body.deployables.identity).toEqual({ status: 'failing', checks: {} });
  });
});

describe('service', () => {
  it('connects to Redis at start, serves, and closes it at stop', async () => {
    const core = await listen(fakeCore());
    const config = readConfig({
      env: {
        GATEWAY__LOG_LEVEL: 'silent',
        GATEWAY__REDIS_URL: REDIS_URL,
        GATEWAY__ORIGIN_SECRETS: SECRET,
        GATEWAY__APP_HOSTS: 'customer=customer.example',
      },
    });
    const gw = await start(config, {
      port: 0,
      host: LOOPBACK_HOST,
      handleSignals: false,
      upstreams: { core: core.url },
    });
    try {
      expect(await (await fetch(`${gw.url}/ready`)).json()).toEqual({
        status: 'ready',
        checks: { redis: 'ok', core: 'ok' },
      });
      // the real catalogue (and the real rate-limit keys, so a roomy class): reading a ping needs
      // a permission, refused until sign-in exists
      const ping = await fetch(
        `${gw.url}${API_PREFIX}/platform/pings/0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b`,
        { headers: { ...customer, 'X-BQ-App': 'admin' } },
      );
      expect(await errorOf(ping)).toEqual([401, 'UNAUTHENTICATED']);
    } finally {
      await gw.stop();
    }
  });

  it('does not start without Redis', async () => {
    const config = readConfig({
      env: {
        GATEWAY__LOG_LEVEL: 'silent',
        GATEWAY__REDIS_URL: 'redis://127.0.0.1:1',
        GATEWAY__ORIGIN_SECRETS: SECRET,
      },
    });
    await expect(start(config, { port: 0, handleSignals: false })).rejects.toThrow(
      'Redis did not answer',
    );
  });
});

describe('config', () => {
  const required = { GATEWAY__REDIS_URL: REDIS_URL, GATEWAY__ORIGIN_SECRETS: SECRET };

  it('reads GATEWAY__* settings', () => {
    const config = readConfig({
      env: {
        ...required,
        GATEWAY__PORT: '9000',
        GATEWAY__CORE_URL: 'http://127.0.0.1:8084',
        GATEWAY__ORIGIN_SECRETS: `${SECRET}, ${OLD_SECRET}`,
        GATEWAY__APP_HOSTS:
          'customer=Customer.Example, customer=localhost:3001,admin=admin.example',
        GATEWAY__VERCEL_PROJECTS: 'customer=bq-customer',
        GATEWAY__VERCEL_SCOPE: 'team-slug',
        GATEWAY__RATE_LIMITS: 'write=5/1m, otp=3/15m,auth=100/1h,search=10/30s',
      },
    });
    expect(config).toMatchObject({
      port: 9000,
      coreUrl: 'http://127.0.0.1:8084',
      upstreamTimeoutMs: 30_000,
      originSecrets: [SECRET, OLD_SECRET],
      vercelProjects: [['customer', 'bq-customer']],
      vercelScope: 'team-slug',
      rateLimits: {
        write: { limit: 5, windowMs: 60_000 },
        otp: { limit: 3, windowMs: 900_000 },
        auth: { limit: 100, windowMs: 3_600_000 },
        search: { limit: 10, windowMs: 30_000 },
      },
    });
    expect([...config.appHosts]).toEqual([
      ['customer.example', 'customer'],
      ['localhost:3001', 'customer'],
      ['admin.example', 'admin'],
    ]);
    expect(config.identityUrl).toBeUndefined();
    const plain = readConfig({ env: required });
    expect(plain.appHosts.size).toBe(0);
    expect(plain.rateLimits).toEqual({});
  });

  it('refuses wrong or missing settings, naming the env var', () => {
    const bad: [Record<string, string>, string][] = [
      [{ GATEWAY__CORE_URL: 'ftp://127.0.0.1' }, 'GATEWAY__CORE_URL'],
      [{ GATEWAY__REDIS_URL: '' }, 'GATEWAY__REDIS_URL'],
      [{ GATEWAY__REDIS_URL: 'http://x' }, 'GATEWAY__REDIS_URL'],
      [{ GATEWAY__ORIGIN_SECRETS: '' }, 'GATEWAY__ORIGIN_SECRETS'],
      [{ GATEWAY__ORIGIN_SECRETS: 'short' }, 'GATEWAY__ORIGIN_SECRETS'],
      [
        { GATEWAY__ORIGIN_SECRETS: `${SECRET},${OLD_SECRET},${SECRET}2` },
        'GATEWAY__ORIGIN_SECRETS',
      ],
      [{ GATEWAY__APP_HOSTS: 'shop=shop.example' }, 'GATEWAY__APP_HOSTS'],
      [{ GATEWAY__APP_HOSTS: 'customer' }, 'GATEWAY__APP_HOSTS'],
      [{ GATEWAY__APP_HOSTS: 'customer=https://x.example' }, 'GATEWAY__APP_HOSTS'],
      [
        { GATEWAY__APP_HOSTS: 'customer=a.example,admin=a.example' },
        'belongs to both customer and admin',
      ],
      [{ GATEWAY__VERCEL_PROJECTS: 'customer=bq-customer' }, 'GATEWAY__VERCEL_SCOPE'],
      [
        { GATEWAY__VERCEL_PROJECTS: 'customer=BQ.*', GATEWAY__VERCEL_SCOPE: 's' },
        'GATEWAY__VERCEL_PROJECTS',
      ],
      [{ GATEWAY__VERCEL_SCOPE: 'a.*' }, 'GATEWAY__VERCEL_SCOPE'],
      [{ GATEWAY__RATE_LIMITS: 'fast=1/1m' }, 'GATEWAY__RATE_LIMITS'],
      [{ GATEWAY__RATE_LIMITS: 'write=0/1m' }, 'GATEWAY__RATE_LIMITS'],
      [{ GATEWAY__RATE_LIMITS: 'write=5/0s' }, 'GATEWAY__RATE_LIMITS'],
      [{ GATEWAY__RATE_LIMITS: 'write=5' }, 'GATEWAY__RATE_LIMITS'],
      [{ GATEWAY__TYPO: 'x' }, 'GATEWAY__TYPO'],
    ];
    for (const [env, message] of bad) {
      expect(() => readConfig({ env: { ...required, ...env } }), JSON.stringify(env)).toThrow(
        message,
      );
      expect(() => readConfig({ env: { ...required, ...env } })).toThrow(ConfigError);
    }
    // a secret never shows in the error
    expect(() =>
      readConfig({ env: { ...required, GATEWAY__ORIGIN_SECRETS: 'short-secret' } }),
    ).not.toThrow(/short-secret/);
  });
});

describe('sign-in at the gateway (T3.2)', () => {
  const profile = (gw: RunningServer, cookie?: string, more: Record<string, string> = {}) =>
    fetch(`${gw.url}${API_PREFIX}/customers/profile`, {
      headers: { ...customer, ...(cookie ? { cookie } : {}), ...more },
    });
  const atCookie = (token: string, app: AppId = 'customer') => `__Host-bq_${app}_at=${token}`;

  it('gives the owner a 60-second passport of who signed in, for that owner only', async () => {
    const core = await listen(fakeCore());
    const signer = passportSigner();
    const gw = await gateway({ core: core.url }, { passport: signer });
    const userId = randomUUID();
    const sessionId = randomUUID();
    const res = await profile(gw, atCookie(accessToken({ userId, sessionId })), {
      // a passport a client sends is dropped
      'X-BQ-Passport': 'forged',
    });
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe('private, no-store');
    const { passport } = (await res.json()) as { passport: string };
    expect(passport).not.toBe('forged');
    // the public key is served like /health, and checks the passport for core alone
    const jwks = await fetch(`${gw.url}${PASSPORT_JWKS_PATH}`);
    expect(jwks.headers.get('cache-control')).toBe('no-store');
    const keys = jwksCache({ load: () => jwks.json() });
    const request = { get: (name: string) => (name === HEADERS.passport ? passport : undefined) };
    const verify = (audience: string) =>
      passportVerifier({ keys, audience })(
        request as Parameters<ReturnType<typeof passportVerifier>>[0],
      );
    expect(await verify('bq:core')).toEqual({
      userId,
      sessionId,
      app: 'customer',
      methods: ['password'],
      authzVersion: 0,
    });
    await expect(verify('bq:identity')).rejects.toThrow('Please sign in');
  });

  it('sends no passport for a public route, even if a client sends one', async () => {
    const core = await listen(fakeCore());
    const gw = await gateway({ core: core.url });
    const res = await fetch(`${gw.url}${API_PREFIX}/catalog/products/p1`, {
      headers: { ...customer, 'X-BQ-Passport': 'forged', cookie: atCookie(accessToken()) },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as Record<string, unknown>;
    expect(JSON.stringify(body)).not.toContain('forged');
  });

  it('refuses another app’s token, an expired one, another key’s, and junk, with 401', async () => {
    const core = await listen(fakeCore());
    const gw = await gateway({ core: core.url });
    // a customer token in the seller app's own cookie is still the customer app's
    const asSeller = await profile(gw, atCookie(accessToken(), 'seller'), {
      'X-BQ-App': 'seller',
      host: 'seller.example',
    });
    expect(await errorOf(asSeller)).toEqual([401, 'UNAUTHENTICATED']);
    const seller = await profile(gw, atCookie(accessToken({ app: 'seller' }), 'seller'), {
      'X-BQ-App': 'seller',
      host: 'seller.example',
    });
    expect(seller.status).toBe(200);
    for (const cookie of [
      atCookie(accessToken({ app: 'seller' })),
      atCookie(accessToken({ app: 'seller' }), 'seller'),
      atCookie(accessToken({ issuedAt: Math.floor(Date.now() / 1000) - 700 })),
      atCookie(accessToken({ key: generateSigningKey() })),
      atCookie('not.a.token'),
      'other=1',
    ]) {
      expect(await errorOf(await profile(gw, cookie)), cookie.slice(0, 40)).toEqual([
        401,
        'UNAUTHENTICATED',
      ]);
    }
  });

  it('refuses a session ended in Redis, and every token of an account issued before its end', async () => {
    const core = await listen(fakeCore());
    const gw = await gateway({ core: core.url });
    const sessionId = randomUUID();
    const userId = randomUUID();
    const now = Math.floor(Date.now() / 1000);
    expect((await profile(gw, atCookie(accessToken({ sessionId, userId })))).status).toBe(200);
    await redis.client.set(revokedSessionKey(sessionId), '1', 'PX', 60_000);
    expect(await errorOf(await profile(gw, atCookie(accessToken({ sessionId, userId }))))).toEqual([
      401,
      'UNAUTHENTICATED',
    ]);
    // every session of another account ended a second ago
    const other = randomUUID();
    await redis.client.set(revokedUserKey(other), String((now - 1) * 1000), 'PX', 60_000);
    const before = atCookie(accessToken({ userId: other, issuedAt: now - 5 }));
    const after = atCookie(accessToken({ userId: other, issuedAt: now }));
    expect((await profile(gw, before)).status).toBe(401);
    expect((await profile(gw, after)).status).toBe(200);
    await redis.client.del(revokedSessionKey(sessionId), revokedUserKey(other));
  });

  it('refuses a token from before the account’s grants changed, so the app refreshes (T3.3)', async () => {
    const core = await listen(fakeCore());
    const gw = await gateway({ core: core.url });
    const userId = randomUUID();
    const at = (av: number) => atCookie(accessToken({ userId, av }));
    // no version in Redis: nothing changed lately
    expect((await profile(gw, at(3))).status).toBe(200);
    await redis.client.set(authzVersionKey(userId), '4', 'PX', 60_000);
    expect(await errorOf(await profile(gw, at(3)))).toEqual([401, 'UNAUTHENTICATED']);
    expect((await profile(gw, at(4))).status).toBe(200);
    expect((await profile(gw, at(5))).status).toBe(200);
    // another account is not touched
    expect((await profile(gw, atCookie(accessToken({ av: 0 })))).status).toBe(200);
    await redis.client.del(authzVersionKey(userId));
  });

  it('lets a permission route through only with its key in identity’s list for this token, and a step-up route only after a recent step-up (T3.3)', async () => {
    const payments = await listen(fakeCore());
    const gw = await gateway({ payments: payments.url });
    const userId = randomUUID();
    const key = appPermissionsKey(userId, 'finance');
    const token = (more: { av?: number; su?: number } = {}) =>
      accessToken({ app: 'finance', userId, av: 2, ...more });
    const call = (cookieToken: string, path = '/payments/refunds', method = 'GET') =>
      fetch(`${gw.url}${API_PREFIX}${path}`, {
        method,
        headers: {
          ...customer,
          'X-BQ-App': 'finance',
          cookie: atCookie(cookieToken, 'finance'),
        },
      });
    const list = (v: number, keys: string[]) =>
      redis.client.set(key, JSON.stringify({ v, keys }), 'PX', 60_000);

    // no list from identity (lost, or never written): refresh first
    expect(await errorOf(await call(token()))).toEqual([401, 'UNAUTHENTICATED']);
    // signed in to the app, but not this key
    await list(2, ['iam.app.sign_in']);
    expect(await errorOf(await call(token()))).toEqual([403, 'FORBIDDEN']);
    // the key, and the owner gets a passport
    await list(2, ['iam.app.sign_in', 'payments.refunds.read', 'payments.refunds.approve']);
    const read = await call(token());
    expect(read.status).toBe(200);
    expect(await read.json()).toMatchObject({ passport: true });
    // a list of another authz version, or one that does not read: refresh first
    expect(await errorOf(await call(token({ av: 1 })))).toEqual([401, 'UNAUTHENTICATED']);
    expect(await errorOf(await call(token({ av: 3 })))).toEqual([401, 'UNAUTHENTICATED']);

    // a step-up route: only within 5 minutes of a step-up
    const now = Math.floor(Date.now() / 1000);
    const approve = (su?: number) =>
      call(token(su === undefined ? {} : { su }), '/payments/refunds/r1/approve', 'POST');
    expect(await errorOf(await approve())).toEqual([401, 'STEP_UP_REQUIRED']);
    expect(await errorOf(await approve(now - 301))).toEqual([401, 'STEP_UP_REQUIRED']);
    expect(await errorOf(await approve(now + 120))).toEqual([401, 'STEP_UP_REQUIRED']);
    expect((await approve(now - 60)).status).toBe(200);
    // the key first: no step-up question for what one may not do at all
    await list(2, ['iam.app.sign_in', 'payments.refunds.read']);
    expect(await errorOf(await approve(now - 60))).toEqual([403, 'FORBIDDEN']);

    await redis.client.set(key, 'not json', 'PX', 60_000);
    expect(await errorOf(await call(token()))).toEqual([401, 'UNAUTHENTICATED']);
    await redis.client.del(key);
  });

  it('asks a recent step-up on a signed-in route of one’s own account too (ARCHITECTURE §9.2)', async () => {
    const core = await listen(fakeCore());
    const gw = await gateway({ core: core.url });
    const now = Math.floor(Date.now() / 1000);
    const secure = (su?: number) =>
      fetch(`${gw.url}${API_PREFIX}/customers/profile/secure`, {
        method: 'POST',
        headers: {
          ...customer,
          cookie: atCookie(accessToken(su === undefined ? {} : { su })),
        },
      });
    expect(await errorOf(await secure())).toEqual([401, 'STEP_UP_REQUIRED']);
    expect(await errorOf(await secure(now - 301))).toEqual([401, 'STEP_UP_REQUIRED']);
    const res = await secure(now - 60);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ passport: true });
    // a signed-in route without a step-up never asks one
    expect((await profile(gw, atCookie(accessToken()))).status).toBe(200);
  });

  it('counts a step-up fresh for 5 minutes, allowing 30 s of clock skew', () => {
    const now = 1_000_000_000;
    expect(stepUpFresh(null, now)).toBe(false);
    expect(stepUpFresh(now, now)).toBe(true);
    expect(stepUpFresh(now - 300_000, now)).toBe(true);
    expect(stepUpFresh(now - 300_001, now)).toBe(false);
    expect(stepUpFresh(now + 30_000, now)).toBe(true);
    expect(stepUpFresh(now + 30_001, now)).toBe(false);
  });

  it('fails closed with 503 when Redis or identity’s keys are away', async () => {
    const core = await listen(fakeCore());
    const down = await connectRedis({ url: REDIS_URL, name: 'gateway-test-down', logger });
    down.client.disconnect();
    const noRedis = await gateway(
      { core: core.url },
      { sessions: sessionGate({ keys: identityKeys, redis: down.client }) },
    );
    expect(await errorOf(await profile(noRedis, atCookie(accessToken())))).toEqual([
      503,
      'SERVICE_UNAVAILABLE',
    ]);
    await down.close();
    const noKeys = await gateway(
      { core: core.url },
      {
        sessions: sessionGate({
          keys: jwksCache({ load: () => Promise.reject(new Error('identity is away')) }),
          redis: redis.client,
        }),
      },
    );
    expect(await errorOf(await profile(noKeys, atCookie(accessToken())))).toEqual([
      503,
      'SERVICE_UNAVAILABLE',
    ]);
  });
});
