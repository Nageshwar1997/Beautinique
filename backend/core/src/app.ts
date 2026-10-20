import { createApp, type Logger } from '@beautinique/backend-server-kit';
import type { Express } from 'express';

import { router } from './modules/index.ts';

/** The core HTTP app: the server-kit basics (health, errors, logs) and core's routes. */
export function buildApp({ logger }: { logger: Logger }): Express {
  return createApp({
    logger,
    routes: (app) => {
      app.use(router);
    },
  });
}
