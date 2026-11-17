import { createLogger, type RunningServer, startServer } from '@beautinique/backend-server-kit';

import { buildApp } from './app.ts';
import type { Config } from './config.ts';
import { type Runtime, type RuntimeOptions, startRuntime } from './runtime.ts';

export { type Config, readConfig } from './config.ts';
export { grantMaster, type MasterGrantOutcome } from './rbac/bootstrap.ts';
export { release, releaseDefinition } from './release.ts';

export interface StartOptions {
  /** default: config.port (0 picks a free one) */
  port?: number;
  /** default 0.0.0.0; backend/bundle keeps the internal deployables on LOOPBACK_HOST */
  host?: string;
  /** stop on SIGTERM and SIGINT (default true; backend/bundle does it for every deployable) */
  handleSignals?: boolean;
  /** Runtime knobs for tests (own queue prefix, faster relay ...). */
  runtime?: Omit<RuntimeOptions, 'logger'>;
  /** The gateway's passport keys (backend/bundle hands them over in memory) */
  passportJwks?: RuntimeOptions['passportJwks'];
}

/** A running identity. Its `runtime` is there for tests that look inside (MongoDB, Redis). */
export type RunningIdentity = RunningServer & { runtime: Runtime };

/** Starts identity: src/server.ts in split mode, backend/bundle in bundle mode. */
export async function start(config: Config, options: StartOptions = {}): Promise<RunningIdentity> {
  const logger = createLogger({ name: 'identity', level: config.logLevel });
  const runtime = await startRuntime(config, {
    passportJwks: options.passportJwks,
    ...options.runtime,
    logger,
  });
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
