import {
  type Deployable,
  DEPLOYABLES,
} from '../../../../packages/shared/contracts/src/platform.ts';
import { pickVersions } from './scaffold.ts';

/** A folder in backend/: one of the 5 deployables, or the bundle that runs them in one process. */
export type BackendTarget = Deployable | 'bundle';
export const BACKEND_TARGETS: readonly BackendTarget[] = [...DEPLOYABLES, 'bundle'];

export type BackendKind = 'gateway' | 'service' | 'monolith' | 'bundle';

/** ARCHITECTURE §3. */
export const BACKEND_KIND: Record<BackendTarget, BackendKind> = {
  gateway: 'gateway',
  identity: 'service',
  payments: 'service',
  notify: 'service',
  core: 'monolith',
  bundle: 'bundle',
};

export const BACKEND_KIND_LABELS: Record<BackendKind, string> = {
  gateway: 'Gateway (the one public entry, routes to the owner)',
  service: 'Microservice (own database)',
  monolith: 'Modular monolith (every other business module)',
  bundle: 'Bundle (every deployable in one Node process, for Render)',
};

/** package.json descriptions (ARCHITECTURE §3, §4, §11.1). */
const SUMMARIES: Record<BackendTarget, string> = {
  gateway:
    'The one public entry: checks the app, finds the route and streams it to the deployable that owns it.',
  identity: 'Sign-in, sessions, tokens, apps, roles and scoped grants.',
  payments: 'Razorpay orders, webhooks, refunds and payouts; the only place with payment secrets.',
  notify: 'Email, SMS, WhatsApp, web push and the in-app inbox.',
  core: 'Every other business module, as a modular monolith.',
  bundle: 'Runs every deployable in one Node process (bundle mode, the Render live server).',
};

/** Local ports: gateway 8080, identity 8081 ... core 8084, in the order of DEPLOYABLES. */
export const deployablePort = (deployable: Deployable): number =>
  8080 + DEPLOYABLES.indexOf(deployable);

/**
 * The export condition under which a deployable resolves to its TypeScript source (bundle dev and
 * tests); production resolves to dist. Our own name, so no library's "development" build is picked.
 */
export const SOURCE_CONDITION = 'beautinique-source';

/** IDENTITY__PORT ...: every deployable's env vars start with its name (ARCHITECTURE §3). */
export const envPrefix = (deployable: Deployable): string => deployable.toUpperCase();

export interface BackendSpec {
  target: BackendTarget;
  /** ranges for every library it uses */
  versions: Record<string, string>;
  /** the deployables in backend/ (the bundle runs them) */
  deployables: readonly Deployable[];
}

/** The libraries each target needs, for resolveVersions. The bundle also depends on the deployables. */
export function backendLibraries(
  target: BackendTarget,
  deployables: readonly Deployable[] = [],
): { dependencies: string[]; devDependencies: string[] } {
  const devDependencies = ['@types/node', 'tsdown', 'typescript', 'vitest'];
  const kit = ['@beautinique/backend-server-kit', '@beautinique/shared-zod'];
  if (target === 'bundle') {
    return {
      dependencies: [...kit, ...deployables],
      devDependencies: [...devDependencies, 'vite'],
    };
  }
  return {
    dependencies: [
      ...kit,
      'express',
      ...(target === 'gateway' ? ['@beautinique/shared-contracts'] : []),
    ],
    devDependencies: [...devDependencies, '@types/express'],
  };
}

function manifest(spec: BackendSpec): Record<string, unknown> {
  const libs = backendLibraries(spec.target, spec.deployables);
  const checks = { typecheck: 'tsc --noEmit', lint: 'eslint .', test: 'vitest run' };
  const head = {
    name: spec.target,
    version: '0.0.0',
    private: true,
    description: SUMMARIES[spec.target],
    type: 'module',
  };
  const deps = {
    dependencies: pickVersions(spec.versions, libs.dependencies),
    devDependencies: pickVersions(spec.versions, libs.devDependencies),
  };
  if (spec.target === 'bundle') {
    return {
      ...head,
      scripts: {
        dev: `node --env-file-if-exists=.env --conditions=${SOURCE_CONDITION} --watch src/start.ts`,
        build: 'tsdown',
        start: 'node --enable-source-maps --max-old-space-size=300 dist/start.js',
        ...checks,
      },
      ...deps,
    };
  }
  return {
    ...head,
    exports: {
      '.': {
        types: './src/service.ts',
        [SOURCE_CONDITION]: './src/service.ts',
        default: './dist/service.js',
      },
    },
    scripts: {
      dev: 'node --env-file-if-exists=.env --watch src/server.ts',
      build: 'tsdown',
      start: 'node --enable-source-maps dist/server.js',
      ...checks,
    },
    ...deps,
  };
}

/* ---------------- shared files ---------------- */

const tsconfig = `{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "../../configs/tsconfig/backend-app.json",
  "include": ["src", "test", "*.config.ts"]
}
`;

const eslintConfig = `// @ts-check
import { packageConfig } from '../../configs/eslint-config.js';

export default packageConfig({
  platform: 'node',
  tsconfigRootDir: import.meta.dirname,
  envFiles: ['src/config.ts'],
});
`;

const tsdownConfig = (entries: string[]) => `import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ${JSON.stringify(entries)},
  format: 'esm',
  platform: 'node',
  target: 'node24',
  fixedExtension: false,
  dts: false,
  sourcemap: true,
  clean: true,
});
`;

/** The bundle's tests run the deployables from source, as `npm run dev` does. */
const bundleVitestConfig = `import { defaultServerConditions } from 'vite';
import { defineConfig } from 'vitest/config';

// the deployables from source, like npm run dev (node --conditions=${SOURCE_CONDITION})
export default defineConfig({
  ssr: { resolve: { conditions: ['${SOURCE_CONDITION}', ...defaultServerConditions] } },
});
`;

const LOG_LEVELS = "['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']";

/* ---------------- deployables ---------------- */

const others = (): Deployable[] => DEPLOYABLES.filter((d) => d !== 'gateway');

function configTs(deployable: Deployable): string {
  const prefix = envPrefix(deployable);
  const gateway =
    deployable === 'gateway'
      ? `
  // origin of each deployable behind the gateway; one that is left out answers 503
${others()
  .map((d) => `  ${d}Url: url({ protocol: /^https?$/ }).optional(),`)
  .join('\n')}
  // an upstream that sends nothing back for this long gets a 504
  upstreamTimeoutMs: coerce.number().int().min(1000).max(120_000).default(30_000),`
      : '';
  const zodImports =
    deployable === 'gateway'
      ? 'coerce, enum as zodEnum, object, type output, url'
      : 'coerce, enum as zodEnum, object, type output';
  return `import { loadConfig, type LoadConfigOptions } from '@beautinique/backend-server-kit';
import { ${zodImports} } from '@beautinique/shared-zod';

/**
 * ${deployable} settings from ${prefix}__* env vars, namespaced so backend/bundle can run every deployable
 * in one process (ARCHITECTURE §3). Every key is in .env.example. Only this file may read env.
 */
export const configZod = object({
  port: coerce.number().int().min(0).max(65_535).default(${String(deployablePort(deployable))}),
  logLevel: zodEnum(${LOG_LEVELS}).default('info'),${gateway}
});
export type Config = output<typeof configZod>;

/** Reads and checks the settings. \`strip\` removes the ${prefix}__* keys from env afterwards (bundle mode). */
export function readConfig(options: Omit<LoadConfigOptions, 'prefix'> = {}): Config {
  return loadConfig(configZod, { prefix: '${prefix}', ...options });
}
`;
}

function envExample(deployable: Deployable): string {
  const prefix = envPrefix(deployable);
  const gateway =
    deployable === 'gateway'
      ? `
# Origin of each deployable behind the gateway. Empty = not running: its routes answer 503.
# (backend/bundle passes the URLs of its own internal servers instead.)
${others()
  .map((d) => `GATEWAY__${envPrefix(d)}_URL=http://127.0.0.1:${String(deployablePort(d))}`)
  .join('\n')}
# An upstream that sends nothing back for this many milliseconds gets a 504
GATEWAY__UPSTREAM_TIMEOUT_MS=30000
`
      : '';
  return `# ${deployable} settings: ${prefix}__<SETTING>, namespaced so backend/bundle can run every deployable in
# one process (ARCHITECTURE §3). Copy this file to .env for local runs. Never commit .env.
${prefix}__PORT=${String(deployablePort(deployable))}
# fatal, error, warn, info, debug, trace or silent
${prefix}__LOG_LEVEL=info
${gateway}`;
}

const serverTs = (
  deployable: Deployable,
) => `import { createLogger } from '@beautinique/backend-server-kit';

import { readConfig, start } from './service.ts';

// Split mode: ${deployable} alone in its process (laptop Docker, paid Render). Stops on SIGTERM.
try {
  await start(readConfig());
} catch (error) {
  createLogger({ name: '${deployable}' }).fatal({ err: error }, '${deployable} failed to start');
  process.exitCode = 1;
}
`;

const serviceTs = (deployable: Deployable) => {
  const gateway = deployable === 'gateway';
  const imports = gateway
    ? `import { createLogger, type RunningServer, startServer } from '@beautinique/backend-server-kit';
import type { Deployable } from '@beautinique/shared-contracts';

import { buildApp } from './app.ts';
import type { Config } from './config.ts';
import { manifest } from './manifest.ts';`
    : `import { createLogger, type RunningServer, startServer } from '@beautinique/backend-server-kit';

import { buildApp } from './app.ts';
import type { Config } from './config.ts';`;
  const upstreamOption = gateway
    ? `
  /** origins that replace the configured ones (backend/bundle passes its internal servers) */
  upstreams?: Partial<Record<Deployable, string>>;`
    : '';
  const app = gateway
    ? `buildApp({
    logger,
    manifest,
    upstreams: options.upstreams ?? {
${others()
  .map((d) => `      ${d}: config.${d}Url,`)
  .join('\n')}
    },
    upstreamTimeoutMs: config.upstreamTimeoutMs,
  })`
    : 'buildApp({ logger })';
  return `${imports}

export { type Config, readConfig } from './config.ts';

export interface StartOptions {
  /** default: config.port (0 picks a free one) */
  port?: number;
  /** default 0.0.0.0; backend/bundle keeps the internal deployables on 127.0.0.1 */
  host?: string;
  /** stop on SIGTERM and SIGINT (default true; backend/bundle does it for every deployable) */
  handleSignals?: boolean;${upstreamOption}
}

/** Starts ${deployable}: src/server.ts in split mode, backend/bundle in bundle mode. */
export function start(config: Config, options: StartOptions = {}): Promise<RunningServer> {
  const logger = createLogger({ name: '${deployable}', level: config.logLevel });
  return startServer(${app}, {
    port: options.port ?? config.port,
    host: options.host,
    logger,
    handleSignals: options.handleSignals,
  });
}
`;
};

const serviceApp = (
  deployable: Deployable,
  routesFile: string,
) => `import { createApp, type Logger } from '@beautinique/backend-server-kit';
import type { Express } from 'express';

import { router } from './${routesFile}';

/** The ${deployable} HTTP app: the server-kit basics (health, errors, logs) and ${deployable}'s routes. */
export function buildApp({ logger }: { logger: Logger }): Express {
  return createApp({
    logger,
    routes: (app) => {
      app.use(router);
    },
  });
}
`;

const serviceRoutes = (deployable: Deployable) => `import { Router } from 'express';

/**
 * ${deployable}'s routes. Each one implements a route from @beautinique/shared-contracts with owner
 * '${deployable}', at the same path: the gateway forwards /api/v1<path> here as <path>.
 */
export const router = Router();
`;

const coreModules = `import { Router } from 'express';

/**
 * Core's business modules (ARCHITECTURE §4), each in src/modules/<module>/ behind an index.ts facade.
 * A module mounts its router here. Modules use each other only through those facades, never models.
 */
export const router = Router();
`;

const serviceTest = (deployable: Deployable) => {
  const prefix = envPrefix(deployable);
  return `import { describe, expect, it } from 'vitest';

import { readConfig } from '../src/config.ts';
import { start } from '../src/service.ts';

describe('${deployable}', () => {
  it('answers /health and turns unknown paths into the contracts error body', async () => {
    const config = readConfig({ env: { ${prefix}__LOG_LEVEL: 'silent' } });
    const server = await start(config, { port: 0, host: '127.0.0.1', handleSignals: false });
    try {
      const health = await fetch(\`\${server.url}/health\`);
      expect(await health.json()).toEqual({ status: 'ok' });
      const missing = await fetch(\`\${server.url}/nope\`);
      expect(missing.status).toBe(404);
      expect(await missing.json()).toMatchObject({ error: { code: 'NOT_FOUND' } });
    } finally {
      await server.stop();
    }
  });

  it('reads ${prefix}__* settings and names a bad one', () => {
    expect(readConfig({ env: {} })).toEqual({ port: ${String(deployablePort(deployable))}, logLevel: 'info' });
    expect(readConfig({ env: { ${prefix}__PORT: '9001' } }).port).toBe(9001);
    expect(() => readConfig({ env: { ${prefix}__PORT: 'abc' } })).toThrow('${prefix}__PORT');
  });
});
`;
};

/* ---------------- gateway ---------------- */

const gatewayApp = `import { createApp, type Logger } from '@beautinique/backend-server-kit';
import { type Deployable, DEPLOYABLES } from '@beautinique/shared-contracts';
import type { Express } from 'express';

import { API_PREFIX, type GatewayRoute, proxy } from './proxy.ts';

export interface GatewayAppOptions {
  logger: Logger;
  /** contracts gatewayManifest() of every platform route */
  manifest: readonly GatewayRoute[];
  /** origin of each deployable that runs; the routes of the others answer 503 */
  upstreams: Partial<Record<Deployable, string | undefined>>;
  upstreamTimeoutMs: number;
}

/** Does the deployable's /health answer within 2 seconds? */
async function isHealthy(origin: string): Promise<boolean> {
  try {
    const res = await fetch(new URL('/health', origin), { signal: AbortSignal.timeout(2000) });
    await res.arrayBuffer();
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * The gateway: the server-kit basics, /ready over every upstream, and the proxy under /api/v1.
 * Bodies are not parsed here; they stream to the owner unchanged.
 */
export function buildApp({
  logger,
  manifest,
  upstreams,
  upstreamTimeoutMs,
}: GatewayAppOptions): Express {
  const running = DEPLOYABLES.flatMap((name) => {
    const origin = upstreams[name];
    return origin === undefined ? [] : [[name, origin] as const];
  });
  return createApp({
    logger,
    json: false,
    ready: Object.fromEntries(running.map(([name, origin]) => [name, () => isHealthy(origin)])),
    routes: (app) => {
      app.use(API_PREFIX, proxy({ manifest, upstreams, timeoutMs: upstreamTimeoutMs }));
    },
  });
}
`;

const gatewayProxy = `import { request } from 'node:http';

import { AppError, requestIdOf } from '@beautinique/backend-server-kit';
import {
  type AppId,
  APPS,
  buildPath,
  type Deployable,
  type gatewayManifest,
  HEADERS,
  matchPath,
} from '@beautinique/shared-contracts';
import type { Request, RequestHandler } from 'express';

/** One route as the gateway sees it (contracts gatewayManifest). */
export type GatewayRoute = ReturnType<typeof gatewayManifest>[number];

/** The public API: every app's /api/* reaches the gateway through the Vercel rewrite (ARCHITECTURE §9.3). */
export const API_PREFIX = '/api/v1';

/** Headers of one connection, or for the gateway only: never passed on. */
const NOT_FORWARDED = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'host',
  'x-origin-secret',
]);

const UNAVAILABLE = 'This part of Beautinique is not available right now. Please try again soon.';
const TOO_SLOW = 'This is taking too long. Please try again.';

export interface ProxyOptions {
  manifest: readonly GatewayRoute[];
  upstreams: Partial<Record<Deployable, string | undefined>>;
  timeoutMs: number;
}

/** The route for a method and a path below API_PREFIX, with its decoded parameters. */
export function findRoute(
  manifest: readonly GatewayRoute[],
  method: string,
  path: string,
): { route: GatewayRoute; params: Record<string, string> } | null {
  for (const route of manifest) {
    if (route.method !== method) {
      continue;
    }
    const params = matchPath(route.path, path);
    // "." and ".." would move the forwarded path onto another route
    if (params && !Object.values(params).some((value) => value === '.' || value === '..')) {
      return { route, params };
    }
  }
  return null;
}

const isApp = (value: string | undefined): value is AppId =>
  value !== undefined && (APPS as readonly string[]).includes(value);

function forwardHeaders(req: Request, requestId: string): Record<string, string | string[]> {
  const headers: Record<string, string | string[]> = {};
  for (const [name, value] of Object.entries(req.headers)) {
    if (value !== undefined && !NOT_FORWARDED.has(name)) {
      headers[name] = value;
    }
  }
  headers[HEADERS.requestId.toLowerCase()] = requestId;
  headers['x-forwarded-for'] = [req.get('x-forwarded-for'), req.socket.remoteAddress]
    .filter((part) => part !== undefined)
    .join(', ');
  return headers;
}

/**
 * Checks the app (X-BQ-App), finds the route in the manifest and streams the request to the
 * deployable that owns it, at the route's own path (re-encoded, so it cannot change shape), then
 * streams the answer back.
 */
export function proxy({ manifest, upstreams, timeoutMs }: ProxyOptions): RequestHandler {
  return (req, res, next) => {
    const app = req.get(HEADERS.app);
    if (!isApp(app)) {
      next(new AppError('APP_NOT_ALLOWED', 'This request does not come from a Beautinique app.'));
      return;
    }
    const match = findRoute(manifest, req.method, req.path);
    if (!match) {
      next(new AppError('NOT_FOUND', \`No route for \${req.method} \${req.path}\`));
      return;
    }
    if (!match.route.apps.includes(app)) {
      next(new AppError('APP_NOT_ALLOWED', 'This app cannot use this feature.'));
      return;
    }
    const origin = upstreams[match.route.owner];
    if (origin === undefined) {
      next(new AppError('SERVICE_UNAVAILABLE', UNAVAILABLE));
      return;
    }
    const queryAt = req.originalUrl.indexOf('?');
    const query = queryAt === -1 ? '' : req.originalUrl.slice(queryAt);
    const target = new URL(buildPath(match.route.path, match.params) + query, origin);

    let timedOut = false;
    const upstream = request(
      target,
      { method: req.method, headers: forwardHeaders(req, requestIdOf(res)) },
      (answer) => {
        res.status(answer.statusCode ?? 502);
        for (const [name, value] of Object.entries(answer.headers)) {
          if (value !== undefined && !NOT_FORWARDED.has(name)) {
            res.setHeader(name, value);
          }
        }
        answer.pipe(res);
      },
    );
    upstream.setTimeout(timeoutMs, () => {
      timedOut = true;
      upstream.destroy();
    });
    upstream.on('error', (error) => {
      if (res.headersSent) {
        res.destroy();
        return;
      }
      next(
        timedOut
          ? new AppError('UPSTREAM_TIMEOUT', TOO_SLOW, { cause: error })
          : new AppError('SERVICE_UNAVAILABLE', UNAVAILABLE, { cause: error }),
      );
    });
    // the caller went away: stop the upstream work too
    res.on('close', () => {
      if (!res.writableFinished) {
        upstream.destroy();
      }
    });
    req.pipe(upstream);
  };
}
`;

const gatewayManifestTs = `import { gatewayManifest, type RouteDefinition } from '@beautinique/shared-contracts';

/**
 * Every platform route the gateway serves. The route table lives in @beautinique/shared-contracts
 * (TASKS T1.5); until it is there this list is empty and every /api/v1 path answers NOT_FOUND.
 */
const routes: readonly RouteDefinition[] = [];

export const manifest = gatewayManifest(routes);
`;

const gatewayTest = `import { request, type RequestListener } from 'node:http';

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
  const server = await startServer(app, { port: 0, host: '127.0.0.1', logger, handleSignals: false });
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
    const res = await fetch(\`\${gw.url}\${API_PREFIX}/catalog/products/lip%20kit?shade=rose\`, {
      headers: { ...customer, 'X-Request-Id': 'test-request-0001', 'x-origin-secret': 'not-for-core' },
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
    const res = await fetch(\`\${gw.url}\${API_PREFIX}/catalog/products/%6Cip\`, {
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
    const res = await fetch(\`\${gw.url}\${API_PREFIX}/commerce/orders\`, {
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
      const res = await fetch(\`\${gw.url}\${API_PREFIX}\${path}\`, {
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
    const res = await fetch(\`\${gw.url}\${API_PREFIX}/catalog/nope\`, { headers: customer });
    expect(res.status).toBe(404);
    expect(await res.json()).toMatchObject({ error: { code: 'NOT_FOUND' } });
    const get = await fetch(\`\${gw.url}\${API_PREFIX}/commerce/orders\`, { headers: customer });
    expect(get.status).toBe(404);
    expect(await raw(gw.url, \`\${API_PREFIX}/catalog/products/lip\`)).toBe(200);
    for (const segment of ['..', '%2e%2e', '.', '%2E']) {
      expect(await raw(gw.url, \`\${API_PREFIX}/catalog/products/\${segment}\`), segment).toBe(404);
    }
  });

  it('answers 503 when the owner does not run or is down, and 504 when it is too slow', async () => {
    const down = await startServer(fakeCore(), { port: 0, host: '127.0.0.1', logger, handleSignals: false });
    await down.stop();
    const slow = await listen(fakeCore(1000));
    const status = async (upstreams: GatewayAppOptions['upstreams'], path: string, app: string) => {
      const gw = await gateway(upstreams, 200);
      const res = await fetch(\`\${gw.url}\${API_PREFIX}\${path}\`, { headers: { 'X-BQ-App': app } });
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
    const ok = await fetch(\`\${healthy.url}/ready\`);
    expect(ok.status).toBe(200);
    expect(await ok.json()).toEqual({ status: 'ready', checks: { core: 'ok' } });
    await core.stop();
    const failing = await fetch(\`\${healthy.url}/ready\`);
    expect(failing.status).toBe(503);
    const sick = await listen((_req, res) => {
      res.statusCode = 500;
      res.end();
    });
    const withSick = await gateway({ core: sick.url });
    expect(await (await fetch(\`\${withSick.url}/ready\`)).json()).toMatchObject({
      checks: { core: 'failing' },
    });
  });

  it('reads GATEWAY__* settings', () => {
    const config = readConfig({
      env: { GATEWAY__PORT: '9000', GATEWAY__CORE_URL: 'http://127.0.0.1:8084' },
    });
    expect(config).toMatchObject({ port: 9000, coreUrl: 'http://127.0.0.1:8084', upstreamTimeoutMs: 30_000 });
    expect(config.identityUrl).toBeUndefined();
    expect(() => readConfig({ env: { GATEWAY__CORE_URL: 'ftp://127.0.0.1' } })).toThrow(
      'GATEWAY__CORE_URL',
    );
  });
});
`;

/* ---------------- bundle ---------------- */

/** backend/bundle/src/deployables.ts: the generator rewrites it whenever a deployable is created. */
export function bundleRegistry(deployables: readonly Deployable[]): string {
  const present = DEPLOYABLES.filter((d) => deployables.includes(d));
  const internal = present.filter((d) => d !== 'gateway');
  const names = [...internal, 'gateway'];
  return `// Written by \`npm run create -- --type backend\`: creating a deployable adds it here. Do not edit.
${present
  .toSorted()
  .map((d) => `import * as ${d} from '${d}';`)
  .join('\n')}

import { type Env, prepare, type Prepared, type StartOptions } from './prepare.ts';

/** Every deployable in backend/, in start order: the internal ones, then the gateway. */
export const names: readonly string[] = ${JSON.stringify(names).replaceAll('"', "'").replaceAll(',', ', ')};

/** Reads every deployable's config (each one's keys then leave env). Nothing starts yet. */
export function prepareAll(env: Env) {
  const internal: Prepared<StartOptions>[] = [${internal.map((d) => `prepare('${d}', ${d}, env)`).join(', ')}];
  return { internal, gateway: prepare('gateway', gateway, env) };
}
`;
}

const bundlePrepare = `import type { RunningServer } from '@beautinique/backend-server-kit';

export type Env = Record<string, string | undefined>;

export interface StartOptions {
  port?: number;
  host?: string;
  handleSignals?: boolean;
}

/** What every backend/<deployable> exports from src/service.ts. */
export interface DeployableModule<Config, Options extends StartOptions> {
  readConfig(options?: { env?: Env; strip?: boolean }): Config;
  start(config: Config, options?: Options): Promise<RunningServer>;
}

/** A deployable whose config is read, ready to start. */
export interface Prepared<Options extends StartOptions> {
  name: string;
  start(options: Options): Promise<RunningServer>;
}

/** Reads the deployable's config now and strips its keys from env (ARCHITECTURE §3). */
export function prepare<Config, Options extends StartOptions>(
  name: string,
  deployable: DeployableModule<Config, Options>,
  env: Env,
): Prepared<Options> {
  const config = deployable.readConfig({ env, strip: true });
  return { name, start: (options) => deployable.start(config, options) };
}
`;

const bundleTs = `import type { RunningServer } from '@beautinique/backend-server-kit';

import { prepareAll } from './deployables.ts';
import type { Env } from './prepare.ts';

export interface Bundle {
  /** the gateway, the only server reachable from outside */
  url: string;
  port: number;
  /** the deployables that run, in start order */
  names: string[];
  /** stops the gateway first, then the others (last started first); safe to call twice */
  stop(): Promise<void>;
}

/**
 * Bundle mode (ARCHITECTURE §3, §11.1): every deployable in this one process. All configs are read
 * before anything starts, and each deployable's keys leave env. The internal deployables listen on
 * free 127.0.0.1 ports, and the gateway, on the public port, gets their URLs.
 */
export async function startBundle({ port, env }: { port: number; env: Env }): Promise<Bundle> {
  const { internal, gateway } = prepareAll(env);
  const running: { name: string; server: RunningServer }[] = [];
  const stopAll = async () => {
    for (const { server } of running.toReversed()) {
      await server.stop();
    }
  };
  let front: RunningServer;
  try {
    for (const deployable of internal) {
      const server = await deployable.start({ port: 0, host: '127.0.0.1', handleSignals: false });
      running.push({ name: deployable.name, server });
    }
    const upstreams = Object.fromEntries(running.map(({ name, server }) => [name, server.url]));
    front = await gateway.start({ port, upstreams, handleSignals: false });
    running.push({ name: gateway.name, server: front });
  } catch (error) {
    await stopAll();
    throw error;
  }
  let stopping: Promise<void> | undefined;
  return {
    url: front.url,
    port: front.port,
    names: running.map(({ name }) => name),
    stop: () => (stopping ??= stopAll()),
  };
}
`;

const bundleConfig = `import { ConfigError } from '@beautinique/backend-server-kit';
import { coerce, object } from '@beautinique/shared-zod';

import type { Env } from './prepare.ts';

const bundleZod = object({ port: coerce.number().int().min(0).max(65_535).default(8080) });

/**
 * The bundle's own setting is the public port, which Render passes as PORT (ARCHITECTURE §11.1).
 * Each deployable reads its own <NAME>__* keys from the same env. Only this file may read env.
 */
export function readBundleConfig(env: Env = process.env): { port: number; env: Env } {
  const parsed = bundleZod.safeParse({ port: env.PORT === '' ? undefined : env.PORT });
  if (!parsed.success) {
    throw new ConfigError('Invalid bundle configuration:\\n  PORT: not a port number');
  }
  return { port: parsed.data.port, env };
}
`;

const bundleStart = `import { createLogger } from '@beautinique/backend-server-kit';

import { startBundle } from './bundle.ts';
import { readBundleConfig } from './config.ts';

const logger = createLogger({ name: 'bundle' });

try {
  const bundle = await startBundle(readBundleConfig());
  logger.info({ port: bundle.port, deployables: bundle.names }, 'bundle running');
  const stop = (signal: NodeJS.Signals) => {
    logger.info({ signal }, 'stopping');
    bundle.stop().then(
      () => process.exit(0),
      (error: unknown) => {
        logger.error({ err: error }, 'stop failed');
        process.exit(1);
      },
    );
  };
  process.once('SIGTERM', stop);
  process.once('SIGINT', stop);
} catch (error) {
  logger.fatal({ err: error }, 'bundle failed to start');
  process.exitCode = 1;
}
`;

const bundleTest = `import { type AddressInfo, createServer } from 'node:net';

import { ConfigError } from '@beautinique/backend-server-kit';
import { describe, expect, it } from 'vitest';

import { startBundle } from '../src/bundle.ts';
import { readBundleConfig } from '../src/config.ts';
import { names } from '../src/deployables.ts';

const quiet = () =>
  Object.fromEntries(names.map((name) => [\`\${name.toUpperCase()}__LOG_LEVEL\`, 'silent']));

describe('bundle', () => {
  it('runs every deployable behind the gateway, then stops them all', async () => {
    const env: Record<string, string | undefined> = { ...quiet(), UNRELATED: 'kept' };
    const bundle = await startBundle({ port: 0, env });
    try {
      expect(bundle.names).toEqual(names);
      expect(env).toEqual({ UNRELATED: 'kept' });
      const ready = await fetch(\`\${bundle.url}/ready\`);
      expect(ready.status).toBe(200);
      expect(await ready.json()).toEqual({
        status: 'ready',
        checks: Object.fromEntries(names.filter((n) => n !== 'gateway').map((n) => [n, 'ok'])),
      });
    } finally {
      await bundle.stop();
    }
    await expect(fetch(\`\${bundle.url}/health\`)).rejects.toThrow();
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
`;

const bundleEnvExample = `# backend/bundle runs every deployable in one process (ARCHITECTURE §3). Copy this file to .env for
# local runs; never commit .env. Each deployable reads its own <NAME>__* keys from the same env, so
# put them here too (see backend/<name>/.env.example).
# The public port (Render sets PORT itself, plus UV_THREADPOOL_SIZE=2 in its environment, §11.1)
PORT=8080
`;

/* ---------------- READMEs (Hinglish) ---------------- */

function readme(spec: BackendSpec): string {
  const { target } = spec;
  if (target === 'bundle') {
    return `# bundle

${SUMMARIES.bundle} Live server (Render \`bq-live\`) aur laptop pe jaldi edit-reload ke liye (ARCHITECTURE §3, §11.1, §12).

## Kaise chalta hai

1. Har deployable ka config pehle padha jata hai, aur uski \`<NAME>__*\` keys env se hata di jati hain.
2. Gateway ke peeche wale deployables \`127.0.0.1\` ke khaali ports pe chalte hain (bahar se pahunch nahi).
3. Gateway public port (\`PORT\`, default 8080) pe chalta hai aur unke URLs leta hai.
4. SIGTERM pe pehle gateway rukta hai, phir baaki (ulte order me).

Kaunse deployables chalenge, ye [src/deployables.ts](src/deployables.ts) me hai. Use haath se mat badlo:
\`npm run create -- --type backend\` naya deployable banate hi use yahan jod deta hai.

## Commands

| Command                              | Kaam                                                       |
| ------------------------------------ | ---------------------------------------------------------- |
| \`npm run dev:backend\` (repo root)    | Sab deployables, source se, file badalte hi restart        |
| \`npm run build --workspace bundle\`   | \`dist/\` (deployables ka build \`npm run build\` deta hai)    |
| \`npm run start --workspace bundle\`   | Production jaisa: compiled JS, \`--max-old-space-size=300\` |
| \`npm run test --workspace bundle\`    | Sab deployables ek saath start/stop ka test                |

## Settings

\`.env.example\` ko \`.env\` me copy karo (commit kabhi nahi). Har deployable ki keys (\`backend/<name>/.env.example\`) bhi isi \`.env\` me daalo, kyunki bundle ek hi process hai.

Boot ke release steps (lease lock, migrations, index sync) TASKS T2.5 me jodne hain.
`;
  }
  const kind = BACKEND_KIND[target];
  const port = String(deployablePort(target));
  const prefix = envPrefix(target);
  const where =
    kind === 'gateway'
      ? `- \`src/proxy.ts\`: \`X-BQ-App\` check, manifest se route, owner tak stream (path dobara encode hota hai, \`..\` nahi chalta).
- \`src/manifest.ts\`: platform ke routes (contracts \`gatewayManifest\`). Route table contracts me aate hi (T1.5) yahan import hogi.
- Abhi baaki: JWKS aur passport, origin secret, \`clientIp()\` (T2.2), Redis rate limits aur Sentry (T2.3).`
      : kind === 'monolith'
        ? `- \`src/modules/<module>/\`: har business module ka folder (ARCHITECTURE §4): \`index.ts\` facade, \`http\`, \`application\`, \`domain\`, \`infra\`, \`events\`, \`jobs\`, \`permissions.ts\`, \`settings.ts\`.
- \`src/modules/index.ts\`: har module apna router yahan mount karta hai. Ek module doosre ke models import nahi karta, sirf facade se baat karta hai.`
        : `- \`src/routes/index.ts\`: ${target} ke routes. Har route contracts me declare hota hai (owner \`${target}\`), yahan sirf handler.`;
  return `# ${target}

${SUMMARIES[target]} (ARCHITECTURE §3${kind === 'monolith' ? ', §4' : ''})

## Commands

| Command                                 | Kaam                                                     |
| --------------------------------------- | -------------------------------------------------------- |
| \`npm run dev --workspace ${target}\`       | Akela (split mode), http://localhost:${port}, file badalte hi restart |
| \`npm run build --workspace ${target}\`     | \`dist/\` (compiled JS, production isi ko chalata hai)      |
| \`npm run start --workspace ${target}\`     | \`dist/server.js\` chalao                                  |
| \`npm run test --workspace ${target}\`      | Tests                                                    |

Sab deployables ek process me: \`npm run dev:backend\` (\`backend/bundle\`).

## Settings

\`.env.example\` ko \`.env\` me copy karo (commit kabhi nahi). Har key \`${prefix}__\` se shuru hoti hai, taaki bundle mode me ek process me sab deployables ki keys alag rahein. Settings sirf [src/config.ts](src/config.ts) padhta hai (zod se check; ESLint baaki jagah \`process.env\` rokta hai). Nayi setting = \`configZod\` me key + \`.env.example\` me line.

## Code kahan hai

- \`src/service.ts\`: \`readConfig\` + \`start\` (split mode me \`src/server.ts\`, bundle mode me \`backend/bundle\` isse chalata hai).
- \`src/app.ts\`: \`@beautinique/backend-server-kit\` ka \`createApp\` (health, errors, logs, request id).
${where}

Node 24 TypeScript seedha chalata hai: imports me \`.ts\` likho, enum ya parameter properties nahi.
`;
}

/** Every file of backend/<target>, by path. */
export function renderBackend(spec: BackendSpec): Map<string, string> {
  const files = new Map<string, string>();
  files.set('package.json', `${JSON.stringify(manifest(spec), null, 2)}\n`);
  files.set('README.md', readme(spec));
  files.set('tsconfig.json', tsconfig);
  files.set('eslint.config.js', eslintConfig);
  const { target } = spec;
  if (target === 'bundle') {
    files.set('tsdown.config.ts', tsdownConfig(['src/start.ts']));
    files.set('vitest.config.ts', bundleVitestConfig);
    files.set('.env.example', bundleEnvExample);
    files.set('src/config.ts', bundleConfig);
    files.set('src/prepare.ts', bundlePrepare);
    files.set('src/deployables.ts', bundleRegistry(spec.deployables));
    files.set('src/bundle.ts', bundleTs);
    files.set('src/start.ts', bundleStart);
    files.set('test/bundle.test.ts', bundleTest);
    return files;
  }
  files.set('tsdown.config.ts', tsdownConfig(['src/server.ts', 'src/service.ts']));
  files.set('.env.example', envExample(target));
  files.set('src/config.ts', configTs(target));
  files.set('src/service.ts', serviceTs(target));
  files.set('src/server.ts', serverTs(target));
  const kind = BACKEND_KIND[target];
  if (kind === 'gateway') {
    files.set('src/app.ts', gatewayApp);
    files.set('src/proxy.ts', gatewayProxy);
    files.set('src/manifest.ts', gatewayManifestTs);
    files.set('test/gateway.test.ts', gatewayTest);
    return files;
  }
  if (kind === 'monolith') {
    files.set('src/app.ts', serviceApp(target, 'modules/index.ts'));
    files.set('src/modules/index.ts', coreModules);
  } else {
    files.set('src/app.ts', serviceApp(target, 'routes/index.ts'));
    files.set('src/routes/index.ts', serviceRoutes(target));
  }
  files.set(`test/${target}.test.ts`, serviceTest(target));
  return files;
}
