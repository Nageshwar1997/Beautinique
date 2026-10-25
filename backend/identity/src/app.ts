import { createApp, type Logger } from '@beautinique/backend-server-kit';
import type { Express } from 'express';

import { router } from './routes/index.ts';

/** The identity HTTP app: the server-kit basics (health, errors, logs) and identity's routes. */
export function buildApp({ logger }: { logger: Logger }): Express {
  return createApp({
    logger,
    routes: (app) => {
      app.use(router);
    },
  });
}
