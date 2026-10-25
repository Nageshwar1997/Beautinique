import { createApp, type Logger } from '@beautinique/backend-server-kit';
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
