import { createLogger, type RunningServer, startServer } from '@beautinique/backend-server-kit';
import type { Deployable } from '@beautinique/shared-contracts';

import { buildApp } from './app.ts';
import type { Config } from './config.ts';
import { manifest } from './manifest.ts';

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
export function start(config: Config, options: StartOptions = {}): Promise<RunningServer> {
  const logger = createLogger({ name: 'gateway', level: config.logLevel });
  return startServer(
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
    }),
    {
      port: options.port ?? config.port,
      host: options.host,
      logger,
      handleSignals: options.handleSignals,
    },
  );
}
