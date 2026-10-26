import type { Mongo } from '@beautinique/backend-server-mongo';
import { subscribe, type Subscription } from '@beautinique/backend-server-queue';
import { pingRecorded } from '@beautinique/shared-contracts';
import type { Router } from 'express';

import { PINGS, platformRouter } from './routes.ts';

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

/**
 * Pings and their audit copies are deleted 7 days after they were recorded: the ping route is
 * public for the live demo (owner, 2026-10-25), so nobody can fill the free Atlas cluster for good.
 */
export const PING_TTL_SECONDS = 7 * 24 * 60 * 60;

interface PingAudit {
  _id: string;
  pingId: string;
  note: string;
  recordedAt: Date;
}

export const routerOf = (deps: { mongo: Mongo }): Router => platformRouter(deps);

/** The module's indexes; safe to run on every start. */
export async function ensureIndexes({ mongo }: { mongo: Mongo }): Promise<void> {
  for (const name of [PINGS, PING_AUDIT_COLLECTION]) {
    await mongo.db
      .collection(name)
      .createIndex(
        { recordedAt: 1 },
        { name: 'recordedAt_ttl', expireAfterSeconds: PING_TTL_SECONDS },
      );
  }
}

/** What the queue worker runs for this module's subscribers: DB work only, safe to run again. */
export function subscriptionsOf({ mongo }: { mongo: Mongo }): Subscription[] {
  const audit = mongo.db.collection<PingAudit>(PING_AUDIT_COLLECTION);
  return [
    subscribe(PING_AUDIT, pingRecorded, async (event, session) => {
      await audit.insertOne(
        {
          _id: event.eventId,
          pingId: event.data.pingId,
          note: event.data.note,
          recordedAt: new Date(event.data.recordedAt),
        },
        { session },
      );
    }),
  ];
}
