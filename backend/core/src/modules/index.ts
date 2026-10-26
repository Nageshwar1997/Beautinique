import type { IndexSpec, Mongo } from '@beautinique/backend-server-mongo';
import type { Subscription } from '@beautinique/backend-server-queue';
import { Router } from 'express';

import * as platform from './platform/index.ts';

/**
 * Core's business modules (ARCHITECTURE §4), each in src/modules/<module>/ behind an index.ts facade.
 * A module adds its routes, its event subscribers and its subscriptions here. Modules use each
 * other only through those facades, never models.
 */
export interface ModuleDeps {
  mongo: Mongo;
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

export function subscriptionsOf(deps: ModuleDeps): Subscription[] {
  return [...platform.subscriptionsOf(deps)];
}

/** Every module's indexes, for the release steps (src/release.ts). Merge a module's list in here. */
export const indexes: readonly IndexSpec[] = [...platform.indexes];
