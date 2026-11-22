import { AppError } from '@beautinique/backend-server-kit';
import { ObjectId, toObjectId, withTransaction } from '@beautinique/backend-server-mongo';
import { writeEvent } from '@beautinique/backend-server-queue';
import { getPing, pingRead, pingRecorded, recordPing, wake } from '@beautinique/shared-contracts';
import { Router } from 'express';

import { accessOf, authorize } from './authz.ts';
import { type IdempotencyDeps, mountCoreRoute } from './idempotency.ts';

export const PINGS = 'platform_pings';

/**
 * Most pings kept at once. The route is public (live demo) and the gateway's limit is per client,
 * so many clients together could still fill the free Atlas cluster (512 MB) before the 7-day TTL
 * empties it; with this cap pings, their audit copies and events stay a few MB.
 */
export const PING_CAP = 5000;

interface PingRecord {
  _id: ObjectId;
  note: string;
  recordedAt: Date;
}

const dataOf = (ping: PingRecord) => ({
  pingId: ping._id.toHexString(),
  note: ping.note,
  recordedAt: ping.recordedAt.toISOString(),
});

/**
 * The platform module's routes. The gateway checks the contract's access first (a key some grant
 * holds); a permission route checks it again here with authorize(), on core's copy of the grants
 * at the request's time and scope (RULES §4.6).
 */
export function platformRouter(deps: IdempotencyDeps): Router {
  const { mongo } = deps;
  const router = Router();
  const pings = mongo.db.collection<PingRecord>(PINGS);

  mountCoreRoute(
    router,
    recordPing,
    async ({ body }, { requestId }) => {
      // the collection's own count (no scan); a few parallel requests may pass it by a few, that is fine
      if ((await pings.estimatedDocumentCount()) >= PING_CAP) {
        throw new AppError(
          'PING_LIMIT_REACHED',
          'The demo has all the pings it can keep for now. Please try again in a few days.',
          { status: 503 },
        );
      }
      const ping: PingRecord = { _id: new ObjectId(), note: body.note, recordedAt: new Date() };
      // the ping and its event are written in one transaction, and the reply goes out after commit
      await withTransaction(mongo, async (session) => {
        await pings.insertOne(ping, { session });
        await writeEvent(mongo, session, pingRecorded, {
          aggregate: { type: 'ping', id: ping._id.toHexString() },
          // a public route: no signed-in user reaches core (sign-in comes with identity, M3)
          actor: { type: 'system', id: 'core.platform' },
          correlationId: requestId,
          data: dataOf(ping),
        });
      });
      return dataOf(ping);
    },
    deps,
    { status: 201 },
  );

  // answering is the whole job: the request itself woke the server (ARCHITECTURE §11.1)
  mountCoreRoute(router, wake, () => ({ awakeAt: new Date().toISOString() }), deps);

  mountCoreRoute(
    router,
    getPing,
    async ({ params }, { req }) => {
      // a global permission: no resource scope to check
      authorize(await accessOf(mongo, await deps.passport(req)), pingRead.key);
      const ping = await pings.findOne({
        _id: toObjectId(params.pingId, { notFound: 'No such ping' }),
      });
      if (!ping) throw new AppError('NOT_FOUND', 'No such ping');
      return dataOf(ping);
    },
    deps,
  );

  return router;
}
