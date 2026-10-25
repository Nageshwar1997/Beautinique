import type { Mongo } from '@beautinique/backend-server-mongo';
import { subscribe, type Subscription } from '@beautinique/backend-server-queue';
import { pingRecorded } from '@beautinique/shared-contracts';
import type { Router } from 'express';

import { platformRouter } from './routes.ts';

export const PING_AUDIT = 'core.pingAudit';
export const PING_AUDIT_COLLECTION = 'platform_ping_audit';

/**
 * The platform module is Milestone 1's sample (ARCHITECTURE §16): record a ping, and the
 * `platform.ping.recorded` event goes out through the outbox, the queue and the inbox. It is also
 * the pattern every module follows: routes on contracts, events in the same transaction.
 */
export { PINGS } from './routes.ts';

/** Which subscribers get which event (the relay's list). */
export const platformSubscribers = { [pingRecorded.type]: [PING_AUDIT] };

export const routerOf = (deps: { mongo: Mongo }): Router => platformRouter(deps);

/** What the queue worker runs for this module's subscribers: DB work only, safe to run again. */
export function subscriptionsOf({ mongo }: { mongo: Mongo }): Subscription[] {
  const audit = mongo.db.collection<{ _id: string; pingId: string; note: string }>(
    PING_AUDIT_COLLECTION,
  );
  return [
    subscribe(PING_AUDIT, pingRecorded, async (event, session) => {
      await audit.insertOne(
        { _id: event.eventId, pingId: event.data.pingId, note: event.data.note },
        { session },
      );
    }),
  ];
}
