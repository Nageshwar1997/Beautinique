import express, { type Express } from 'express';
import helmet from 'helmet';
import type { Logger } from 'pino';

import { errorHandler, notFound } from './errors';
import { healthRoutes, type ReadyCheck } from './health';
import { accessLog, requestId } from './request';

export interface CreateAppOptions {
  logger: Logger;
  /** adds the service's routes (after health, before the 404 and error handlers) */
  routes?: (app: Express) => void;
  /** checks for GET /ready */
  ready?: Readonly<Record<string, ReadyCheck>>;
  /** parse JSON bodies (default true; the gateway streams bodies through, so it turns this off) */
  json?: boolean;
  /** largest JSON body (default 1mb) */
  bodyLimit?: string;
}

/**
 * An Express app in the order every service needs: security headers, request id, access log,
 * health routes, JSON body, the service's routes, then NOT_FOUND and the error body.
 */
export function createApp({
  logger,
  routes,
  ready,
  json = true,
  bodyLimit = '1mb',
}: CreateAppOptions): Express {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(requestId());
  app.use(accessLog(logger, { quietPaths: ['/health'] }));
  app.use(healthRoutes(ready));
  if (json) {
    app.use(express.json({ limit: bodyLimit }));
  }
  routes?.(app);
  app.use(notFound());
  app.use(errorHandler(logger));
  return app;
}
