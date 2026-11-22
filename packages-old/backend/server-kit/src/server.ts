import { createServer, type RequestListener } from 'node:http';
import type { AddressInfo } from 'node:net';

import type { Logger } from 'pino';

/**
 * The machine's own loopback address: a server that listens here is reached from this machine only,
 * never from the network. backend/bundle keeps the internal deployables on it (on the laptop and on
 * Render alike, every container has it), so every request from outside goes through the gateway on
 * the public port; tests keep their servers on it too. Not a setting: 0.0.0.0 would open them up.
 */
export const LOOPBACK_HOST = '127.0.0.1';

export interface StartServerOptions {
  /** 0 picks a free port (tests) */
  port: number;
  host?: string;
  logger: Logger;
  /** run after the server stopped taking requests (close database, queues ...), in order */
  onStop?: readonly (() => Promise<void> | void)[];
  /** stop on SIGTERM and SIGINT (default true; the bundle handles signals for all services itself) */
  handleSignals?: boolean;
  /** open connections are cut after this long (default 10 s) */
  stopTimeoutMs?: number;
}

export interface RunningServer {
  port: number;
  url: string;
  /** stops taking requests, finishes the ones in flight, runs onStop; safe to call twice */
  stop(): Promise<void>;
}

/** Starts the HTTP server and stops it gracefully (Render sends SIGTERM before a deploy swap). */
export async function startServer(
  app: RequestListener,
  {
    port,
    host = '0.0.0.0',
    logger,
    onStop = [],
    handleSignals = true,
    stopTimeoutMs = 10_000,
  }: StartServerOptions,
): Promise<RunningServer> {
  const server = createServer(app);
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => {
      server.off('error', reject);
      resolve();
    });
  });
  const actual = (server.address() as AddressInfo).port;
  logger.info({ port: actual }, 'listening');

  let stopping: Promise<void> | undefined;
  const signals = ['SIGTERM', 'SIGINT'] as const;
  const onSignal = (signal: NodeJS.Signals) => {
    logger.info({ signal }, 'signal received');
    stop().then(
      () => process.exit(0),
      (error: unknown) => {
        logger.error({ err: error }, 'stop failed');
        process.exit(1);
      },
    );
  };
  const stop = (): Promise<void> => {
    stopping ??= (async () => {
      if (handleSignals) {
        for (const signal of signals) process.off(signal, onSignal);
      }
      logger.info('stopping');
      const closed = new Promise<void>((resolve) => {
        server.close(() => {
          resolve();
        });
      });
      server.closeIdleConnections();
      const timer = setTimeout(() => {
        server.closeAllConnections();
      }, stopTimeoutMs);
      timer.unref();
      await closed;
      clearTimeout(timer);
      for (const hook of onStop) {
        await hook();
      }
      logger.info('stopped');
    })();
    return stopping;
  };
  if (handleSignals) {
    for (const signal of signals) process.once(signal, onSignal);
  }
  const shown = host === '0.0.0.0' || host === '::' ? LOOPBACK_HOST : host;
  return { port: actual, url: `http://${shown}:${String(actual)}`, stop };
}
