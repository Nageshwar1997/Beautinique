import { createApp, type Logger } from '@beautinique/backend-server-kit';
import type { Express } from 'express';

import { routesOf } from './routes/index.ts';
import type { Runtime } from './runtime.ts';

/** The identity HTTP app: the server-kit basics (health, errors, logs), the ready checks and identity's routes. */
export function buildApp({ logger, runtime }: { logger: Logger; runtime: Runtime }): Express {
  return createApp({
    logger,
    ready: runtime.ready,
    routes: (app) => {
      app.use(routesOf(runtime.otp));
    },
  });
}
