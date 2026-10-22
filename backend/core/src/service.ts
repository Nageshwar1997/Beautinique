import { createLogger, type RunningServer, startServer } from '@beautinique/backend-server-kit';

import { buildApp } from './app.ts';
import type { Config } from './config.ts';

export { type Config, readConfig } from './config.ts';

export interface StartOptions {
  /** default: config.port (0 picks a free one) */
  port?: number;
  /** default 0.0.0.0; backend/bundle keeps the internal deployables on 127.0.0.1 */
  host?: string;
  /** stop on SIGTERM and SIGINT (default true; backend/bundle does it for every deployable) */
  handleSignals?: boolean;
}

/** Starts core: src/server.ts in split mode, backend/bundle in bundle mode. */
export function start(config: Config, options: StartOptions = {}): Promise<RunningServer> {
  const logger = createLogger({ name: 'core', level: config.logLevel });
  return startServer(buildApp({ logger }), {
    port: options.port ?? config.port,
    host: options.host,
    logger,
    handleSignals: options.handleSignals,
  });
}
