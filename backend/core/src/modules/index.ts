import type { Logger, Passport } from '@beautinique/backend-server-kit';
import type { IndexSpec, Mongo } from '@beautinique/backend-server-mongo';
import type { Subscription } from '@beautinique/backend-server-queue';
import { type Request, Router } from 'express';

import * as platform from './platform/index.ts';

/**
 * Core's business modules (ARCHITECTURE §4), each in src/modules/<module>/ behind an index.ts facade.
 * A module adds its routes, its event subscribers and its subscriptions here. Modules use each
 * other only through those facades, never models.
 */
export interface ModuleDeps {
  mongo: Mongo;
  /** Who signed in (the gateway's passport; 401 without one) */
  passport: (req: Request) => Promise<Passport>;
  /** Core's logger, for what a route step cannot answer with (an idempotency answer not kept) */
  logger: Logger;
}

/** Which subscribers get which event type, for the outbox relay. Merge a module's list in here. */
export const subscribers: Readonly<Record<string, readonly string[]>> = {
  ...platform.platformSubscribers,
};

export function routerOf(deps: ModuleDeps): Router {
  const router = Router();
  router.use(platform.routerOf(deps));
  return router;
}

export function subscriptionsOf(deps: Pick<ModuleDeps, 'mongo'>): Subscription[] {
  return [...platform.subscriptionsOf(deps)];
}

/** Every module's indexes, for the release steps (src/release.ts). Merge a module's list in here. */
export const indexes: readonly IndexSpec[] = [...platform.indexes];
