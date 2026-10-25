import { createLogger, type RunningServer, startServer } from '@beautinique/backend-server-kit';
import { connectRedis } from '@beautinique/backend-server-queue';
import { createRateLimiter } from '@beautinique/backend-server-ratelimit';
import type { Deployable } from '@beautinique/shared-contracts';

import { buildApp } from './app.ts';
import { appRegistry } from './apps.ts';
import type { Config } from './config.ts';
import { manifest } from './manifest.ts';
import { DEFAULT_RATE_LIMITS, RATE_LIMIT_PREFIX } from './rate-limits.ts';
import { originSecretCheck } from './trust.ts';

export { type Config, readConfig } from './config.ts';

export interface StartOptions {
  /** default: config.port (0 picks a free one) */
  port?: number;
  /** default 0.0.0.0; backend/bundle keeps the internal deployables on 127.0.0.1 */
  host?: string;
  /** stop on SIGTERM and SIGINT (default true; backend/bundle does it for every deployable) */
  handleSignals?: boolean;
  /** origins that replace the configured ones (backend/bundle passes its internal servers) */
  upstreams?: Partial<Record<Deployable, string>>;
}

/** Starts gateway: src/server.ts in split mode, backend/bundle in bundle mode. */
export async function start(config: Config, options: StartOptions = {}): Promise<RunningServer> {
  const logger = createLogger({ name: 'gateway', level: config.logLevel });
  const redis = await connectRedis({ url: config.redisUrl, name: 'gateway', logger });
  try {
    return await startServer(
      buildApp({
        logger,
        manifest,
        upstreams: options.upstreams ?? {
          identity: config.identityUrl,
          payments: config.paymentsUrl,
          notify: config.notifyUrl,
          core: config.coreUrl,
        },
        upstreamTimeoutMs: config.upstreamTimeoutMs,
        apps: appRegistry({
          hosts: config.appHosts,
          vercelProjects: config.vercelProjects,
          vercelScope: config.vercelScope,
        }),
        isOriginSecret: originSecretCheck(config.originSecrets),
        limiter: createRateLimiter({ redis: redis.client, prefix: RATE_LIMIT_PREFIX }),
        rateLimits: { ...DEFAULT_RATE_LIMITS, ...config.rateLimits },
        redisReady: redis.ready,
      }),
      {
        port: options.port ?? config.port,
        host: options.host,
        logger,
        handleSignals: options.handleSignals,
        onStop: [() => redis.close()],
      },
    );
  } catch (error) {
    await redis.close();
    throw error;
  }
}
