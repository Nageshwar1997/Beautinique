import type { Logger, Passport } from '@beautinique/backend-server-kit';
import type { IndexSpec, Mongo } from '@beautinique/backend-server-mongo';
import type { Schedule, Subscription, Task } from '@beautinique/backend-server-queue';
import { type Request, Router } from 'express';

import * as audit from './audit/index.ts';
import * as platform from './platform/index.ts';

export { auditIndexesStep, type AuditStore, auditStore } from './audit/index.ts';

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
  /** The audit log (its own database; TASKS T4.1 PR C) */
  audit: audit.AuditStore;
}

/** Which subscribers get which event type, for the outbox relay. Merge a module's list in here. */
export const subscribers: Readonly<Record<string, readonly string[]>> = {
  ...platform.platformSubscribers,
};

export function routerOf(deps: ModuleDeps): Router {
  const router = Router();
  router.use(platform.routerOf(deps));
  router.use(audit.routerOf(deps));
  return router;
}

export function subscriptionsOf(deps: Pick<ModuleDeps, 'mongo' | 'audit'>): Subscription[] {
  return [...platform.subscriptionsOf(deps), ...audit.subscriptionsOf(deps)];
}

/** Every module's indexes, for the release steps (src/release.ts). Merge a module's list in here. */
export const indexes: readonly IndexSpec[] = [...platform.indexes, ...audit.indexes];

/** Every module's scheduled tasks and their timing (BullMQ job schedulers, RULES §4.11). */
export const schedules: readonly Schedule[] = [audit.VERIFY_SCHEDULE];

export const tasksOf = (deps: Pick<ModuleDeps, 'audit' | 'logger'>): Task[] => [
  ...audit.tasksOf(deps),
];
