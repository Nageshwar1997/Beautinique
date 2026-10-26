import { createApp, type Logger, type ReadyCheck } from '@beautinique/backend-server-kit';
import type { RateLimiter, RateLimitRule } from '@beautinique/backend-server-ratelimit';
import { type Deployable, DEPLOYABLES, type RateLimitClass } from '@beautinique/shared-contracts';
import type { Express } from 'express';

import type { AppRegistry } from './apps.ts';
import { API_PREFIX, type GatewayRoute, proxy } from './proxy.ts';
import { statusRoute } from './status.ts';

export interface GatewayAppOptions {
  logger: Logger;
  /** contracts gatewayManifest() of every platform route */
  manifest: readonly GatewayRoute[];
  /** origin of each deployable that runs; the routes of the others answer 503 */
  upstreams: Partial<Record<Deployable, string | undefined>>;
  upstreamTimeoutMs: number;
  /** which host belongs to which app */
  apps: AppRegistry;
  /** true for the x-origin-secret of the apps' Vercel routes */
  isOriginSecret: (given: string | undefined) => boolean;
  limiter: RateLimiter;
  rateLimits: Readonly<Record<RateLimitClass, RateLimitRule>>;
  /** the gateway's own dependency (Redis) for /ready and /status */
  redisReady: ReadyCheck;
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
 * The gateway: the server-kit basics (security headers, request id, access log, /health), /ready
 * over Redis and every upstream, /status, and the proxy under /api/v1. /health, /ready and /status
 * stay outside the origin-secret check: Render and the monitors call them directly (§7.2, §11.1).
 * Bodies are not parsed here; they stream to the owner unchanged.
 */
export function buildApp({
  logger,
  manifest,
  upstreams,
  upstreamTimeoutMs,
  apps,
  isOriginSecret,
  limiter,
  rateLimits,
  redisReady,
}: GatewayAppOptions): Express {
  const running = DEPLOYABLES.flatMap((name) => {
    const origin = upstreams[name];
    return origin === undefined ? [] : [[name, origin] as const];
  });
  return createApp({
    logger,
    json: false,
    ready: {
      redis: redisReady,
      ...Object.fromEntries(running.map(([name, origin]) => [name, () => isHealthy(origin)])),
    },
    routes: (app) => {
      app.get('/status', statusRoute({ own: { redis: redisReady }, upstreams }));
      app.use(
        API_PREFIX,
        proxy({
          manifest,
          upstreams,
          timeoutMs: upstreamTimeoutMs,
          apps,
          isOriginSecret,
          limiter,
          rateLimits,
          logger,
        }),
      );
    },
  });
}
