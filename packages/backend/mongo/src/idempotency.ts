import { createHash } from 'node:crypto';

import type {
  BeginResult,
  IdempotencyClaim,
  IdempotencyId,
  IdempotencyStore,
  StoredResponse,
} from '@beautinique/backend-server-kit';
import type { Db } from 'mongodb';

import { defineCollection } from './collections.ts';
import { isDuplicateKey, QUERY_MAX_TIME_MS } from './errors.ts';

/** The platform collection of idempotency records (docs/ARCHITECTURE.md §10.2: 48 hours TTL). */
export const IDEMPOTENCY_COLLECTION = 'idempotency_keys';

export interface IdempotencyRecord {
  /** The SHA-256 of the caller, the route and the key: never the key itself (§10.1 rule 4). */
  _id: string;
  fingerprint: string;
  leaseUntil: Date;
  /** The lease's end while it runs, the record's end once it has answered; the TTL index's field. */
  expiresAt: Date;
  /** The answer, its body as JSON text (`null` for no body), once it has one. */
  response: { status: number; body: string | null } | null;
}

/** The collection of idempotency records, for a service's `defineCollections`. */
export const idempotencyCollection = defineCollection({
  name: IDEMPOTENCY_COLLECTION,
  retention: 'tech',
  schema: {
    bsonType: 'object',
    required: ['_id', 'fingerprint', 'leaseUntil', 'expiresAt', 'response'],
    properties: {
      _id: { bsonType: 'string' },
      fingerprint: { bsonType: 'string' },
      leaseUntil: { bsonType: 'date' },
      expiresAt: { bsonType: 'date' },
      response: { bsonType: ['object', 'null'] },
    },
  },
  indexes: [{ name: 'expiresAt_ttl', key: { expiresAt: 1 }, expireAfterSeconds: 0 }],
  expiry: { ttlIndex: 'expiresAt_ttl' },
  accountDelete: {
    none: 'Class tech: an answer is kept 48 hours and then goes by itself (docs/ARCHITECTURE.md §10.3 rule 4, D-321).',
  },
});

// Between a `begin` that found the key taken and its read of the record, the record can go (its
// time ran out, or it was released); then it begins again, a few times at most.
const BEGIN_TRIES = 3;

const idOf = ({ caller, routeId, key }: IdempotencyId): string =>
  createHash('sha256')
    .update(JSON.stringify([caller, routeId, key]))
    .digest('hex');

/**
 * The idempotency store of a service's database, in `idempotency_keys` (the server kit's
 * `IdempotencyStore`). `begin` is one atomic step: an upsert on the unique `_id` that takes the
 * record only if it is not there or its time is out, so of two requests with one key at one moment
 * only one starts. The TTL index removes a record after its time; until then `begin` treats a
 * record whose time is out as not there. `complete` and `release` change the record only while it
 * is the claim's and has no answer.
 */
export function createMongoIdempotencyStore(db: Db): IdempotencyStore {
  const records = db.collection<IdempotencyRecord>(IDEMPOTENCY_COLLECTION);
  const options = { maxTimeMS: QUERY_MAX_TIME_MS };
  const heldBy = (id: IdempotencyId, claim: IdempotencyClaim) => ({
    _id: idOf(id),
    fingerprint: claim.fingerprint,
    leaseUntil: claim.leaseUntil,
    response: null,
  });

  return {
    async begin(id, { fingerprint, leaseUntil }, now): Promise<BeginResult> {
      const _id = idOf(id);
      for (let attempt = 1; ; attempt += 1) {
        try {
          await records.updateOne(
            { _id, expiresAt: { $lte: now } },
            { $set: { fingerprint, leaseUntil, expiresAt: leaseUntil, response: null } },
            { upsert: true, ...options },
          );
          return { kind: 'started' };
        } catch (thrown) {
          // The record is there and in force: it is another request's, or this one's before.
          if (!isDuplicateKey(thrown)) throw thrown;
        }
        const found = await records.findOne({ _id }, options);
        if (found !== null && found.expiresAt.getTime() > now.getTime()) {
          if (found.fingerprint !== fingerprint) return { kind: 'key-reused' };
          if (found.response === null) return { kind: 'in-progress' };
          const { status, body } = found.response;
          const response: StoredResponse = {
            status,
            body: body === null ? undefined : (JSON.parse(body) as unknown),
          };
          return { kind: 'replay', response };
        }
        if (attempt >= BEGIN_TRIES) {
          throw new Error('The idempotency record kept changing while the request began.');
        }
      }
    },
    async complete(id, claim, { status, body }, expiresAt) {
      await records.updateOne(
        heldBy(id, claim),
        {
          $set: {
            response: { status, body: body === undefined ? null : JSON.stringify(body) },
            expiresAt,
          },
        },
        options,
      );
    },
    async release(id, claim) {
      await records.deleteOne(heldBy(id, claim), options);
    },
  };
}
