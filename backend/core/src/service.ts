import {
  createLogger,
  type Logger,
  type RunningServer,
  startServer,
} from '@beautinique/backend-server-kit';

import { buildApp } from './app.ts';
import type { Config } from './config.ts';
import { type Runtime, type RuntimeOptions, startRuntime } from './runtime.ts';

export { type Config, readConfig } from './config.ts';
export { release, releaseDefinition } from './release.ts';

export interface StartOptions {
  /** default: config.port (0 picks a free one) */
  port?: number;
  /** default 0.0.0.0; backend/bundle keeps the internal deployables on LOOPBACK_HOST */
  host?: string;
  /** stop on SIGTERM and SIGINT (default true; backend/bundle does it for every deployable) */
  handleSignals?: boolean;
  /** for tests: a logger whose lines the test can read (default: core's own, at config.logLevel) */
  logger?: Logger;
  /** for tests: another queue prefix, epoch key or poll time, or a worker that starts later */
  runtime?: Omit<RuntimeOptions, 'logger'>;
}

/** A running core. Its `runtime` is there for tests that look inside (MongoDB, Redis, the workers). */
export type RunningCore = RunningServer & { runtime: Runtime };

/** Starts core: src/server.ts in split mode, backend/bundle in bundle mode. */
export async function start(config: Config, options: StartOptions = {}): Promise<RunningCore> {
  const logger = options.logger ?? createLogger({ name: 'core', level: config.logLevel });
  const runtime = await startRuntime(config, { ...options.runtime, logger });
  try {
    const server = await startServer(buildApp({ logger, runtime }), {
      port: options.port ?? config.port,
      host: options.host,
      logger,
      handleSignals: options.handleSignals,
      onStop: [() => runtime.stop()],
    });
    return Object.assign(server, { runtime });
  } catch (error) {
    await runtime.stop();
    throw error;
  }
}
