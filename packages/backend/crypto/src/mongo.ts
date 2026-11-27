import { defineCollection, type Collections } from '@beautinique/backend-mongo';
import type { Clock } from '@beautinique/shared-clock';
import type { ClientSession, Db, ObjectId } from 'mongodb';

import type { Sealer } from './sealing.ts';

// `@beautinique/backend-crypto/mongo`: the held copies of a MongoDB service, in its own
// `sealed_records` (docs/ARCHITECTURE.md §10.2 table, §10.3 rules 3 and 4). An erase takes the
// fields out and writes their sealed copy and its event in one transaction (AC-PLATFORM-11). A
// service without MongoDB (finance) uses only the main entry.

export const SEALED_RECORDS_COLLECTION = 'sealed_records';

/** One held copy: the record it is of, and its sealed fields. Only ids are in the clear. */
export interface SealedRecord {
  _id: ObjectId;
  collection: string;
  recordId: string;
  /** The account the data was of, so a legal request about an account finds every copy. */
  accountId?: ObjectId;
  /** The id of the sealing key: which private key opens it. */
  keyId: string;
  sealed: string;
  sealedAt: Date;
  /** When the copy goes, from the hold setting (180 days now, D-250); its TTL index removes it. */
  eraseAt: Date;
}

export const sealedRecordsCollection = defineCollection({
  name: SEALED_RECORDS_COLLECTION,
  retention: 'case',
  schema: {
    bsonType: 'object',
    required: ['_id', 'collection', 'recordId', 'keyId', 'sealed', 'sealedAt', 'eraseAt'],
    properties: {
      _id: { bsonType: 'objectId' },
      collection: { bsonType: 'string' },
      recordId: { bsonType: 'string' },
      accountId: { bsonType: 'objectId' },
      keyId: { bsonType: 'string' },
      sealed: { bsonType: 'string', pattern: '^s1\\.' },
      sealedAt: { bsonType: 'date' },
      eraseAt: { bsonType: 'date' },
    },
  },
  indexes: [
    { name: 'eraseAt_ttl', key: { eraseAt: 1 }, expireAfterSeconds: 0 },
    // The break-glass command finds the copies of one record, or of one account.
    { name: 'collection_recordId', key: { collection: 1, recordId: 1 } },
    {
      name: 'accountId',
      key: { accountId: 1 },
      partialFilterExpression: { accountId: { $exists: true } },
    },
  ],
  expiry: { ttlIndex: 'eraseAt_ttl' },
  accountDelete: {
    none: 'A held copy stays until its eraseAt, after the account is deleted too: that is the legal hold (D-250).',
  },
});

export interface HoldOptions {
  /** The service's sealer, with its public `hold` key. */
  sealer: Sealer;
  /** The service's collections: the registry says which ones are held. */
  collections: Collections;
  clock: Clock;
}

export interface HoldInput {
  collection: string;
  recordId: string;
  accountId?: ObjectId;
  /** The fields taken out of the record, as they were. */
  fields: Readonly<Record<string, unknown>>;
  eraseAt: Date;
}

export interface Hold {
  /**
   * Seals the fields taken out of a record and writes the copy, in the transaction that takes them
   * out (outside one it is refused). A record of a `tech` collection is not held (D-321).
   */
  hold(db: Db, session: ClientSession, input: HoldInput): Promise<ObjectId>;
}

export function createHold({ sealer, collections, clock }: HoldOptions): Hold {
  const { service } = collections;
  if (sealer.service !== service) {
    throw new RangeError(`The sealer is of ${sealer.service}, and the collections of ${service}.`);
  }

  return Object.freeze({
    async hold(db: Db, session: ClientSession, input: HoldInput) {
      const { collection, recordId, accountId, fields, eraseAt } = input;
      const where = `${service}.${collection}`;
      if (!session.inTransaction()) {
        throw new RangeError(
          `The held copy of ${where} must be written in the transaction of its erase.`,
        );
      }
      const spec = collections.specs.get(collection);
      if (spec === undefined || collection === SEALED_RECORDS_COLLECTION) {
        throw new RangeError(`${where} is not a collection of ${service} that is held.`);
      }
      if (spec.retention === 'tech') {
        throw new RangeError(`${where} is of the tech class: its records are not held (D-321).`);
      }
      const now = clock.now();
      if (!(eraseAt instanceof Date) || !(eraseAt.getTime() > now.getTime())) {
        throw new RangeError(`The eraseAt of the held copy of ${where} must be a date after now.`);
      }
      const sealed = sealer.seal(fields, { collection, recordId });
      const record: Omit<SealedRecord, '_id'> = {
        collection,
        recordId,
        ...(accountId === undefined ? {} : { accountId }),
        keyId: sealer.keyId,
        sealed,
        sealedAt: now,
        eraseAt,
      };
      const { insertedId } = await db
        .collection<Omit<SealedRecord, '_id'>>(SEALED_RECORDS_COLLECTION)
        .insertOne(record, { session });
      return insertedId;
    },
  });
}
