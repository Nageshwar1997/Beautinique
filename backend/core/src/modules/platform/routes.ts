import { AppError, mountRoute } from '@beautinique/backend-server-kit';
import { type Mongo, withTransaction } from '@beautinique/backend-server-mongo';
import { writeEvent } from '@beautinique/backend-server-queue';
import { getPing, pingRecorded, recordPing } from '@beautinique/shared-contracts';
import { uuidv7 } from '@beautinique/shared-utils';
import { Router } from 'express';

export const PINGS = 'platform_pings';

/**
 * Most pings kept at once. The route is public (live demo) and the gateway's limit is per client,
 * so many clients together could still fill the free Atlas cluster (512 MB) before the 7-day TTL
 * empties it; with this cap pings, their audit copies and events stay a few MB.
 */
export const PING_CAP = 5000;

interface PingRecord {
  _id: string;
  note: string;
  recordedAt: Date;
}

const dataOf = (ping: PingRecord) => ({
  pingId: ping._id,
  note: ping.note,
  recordedAt: ping.recordedAt.toISOString(),
});

/** The platform module's routes. Who may call them is the gateway's job (access in the contract). */
export function platformRouter({ mongo }: { mongo: Mongo }): Router {
  const router = Router();
  const pings = mongo.db.collection<PingRecord>(PINGS);

  mountRoute(
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
      const ping: PingRecord = { _id: uuidv7(), note: body.note, recordedAt: new Date() };
      // the ping and its event are written in one transaction, and the reply goes out after commit
      await withTransaction(mongo, async (session) => {
        await pings.insertOne(ping, { session });
        await writeEvent(mongo, session, pingRecorded, {
          aggregate: { type: 'ping', id: ping._id },
          // a public route: no signed-in user reaches core (sign-in comes with identity, M3)
          actor: { type: 'system', id: 'core.platform' },
          correlationId: requestId,
          data: dataOf(ping),
        });
      });
      return dataOf(ping);
    },
    { status: 201 },
  );

  mountRoute(router, getPing, async ({ params }) => {
    const ping = await pings.findOne({ _id: params.pingId });
    if (!ping) throw new AppError('NOT_FOUND', 'No such ping');
    return dataOf(ping);
  });

  return router;
}
