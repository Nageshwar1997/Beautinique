import { createApp, type Logger } from '@beautinique/backend-server-kit';
import type { Express } from 'express';

import { routesOf } from './routes/index.ts';
import type { Runtime } from './runtime.ts';

/** Where the gateway reads identity's JWKS (ARCHITECTURE §7.2). */
export const JWKS_PATH = '/.well-known/jwks.json';

/** The identity HTTP app: the server-kit basics (health, errors, logs), the ready checks and identity's routes. */
export function buildApp({ logger, runtime }: { logger: Logger; runtime: Runtime }): Express {
  return createApp({
    logger,
    ready: runtime.ready,
    routes: (app) => {
      // the public keys of identity's tokens, for the gateway (not an /api route: never via Vercel)
      app.get(JWKS_PATH, async (_req, res) => {
        res.set('Cache-Control', 'no-store').json({ keys: await runtime.signing.jwks() });
      });
      app.use(routesOf(runtime.otp));
    },
  });
}
