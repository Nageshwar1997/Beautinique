import type { Db } from 'mongodb';

import { defineCollection } from './collections.ts';
import { isDuplicateKey, QUERY_MAX_TIME_MS } from './errors.ts';

/** The platform collection of leases (docs/ARCHITECTURE.md §10.2: the dispatcher, the ticker, the release). */
export const LEASES_COLLECTION = 'leases';

export interface LeaseRecord {
  /** The lease's name: `release`, `dispatcher`. */
  _id: string;
  /** Who holds it: one process (an instance id), never shared. */
  owner: string;
  until: Date;
}

/** The collection of leases, for a service's `defineCollections`. */
export const leasesCollection = defineCollection({
  name: LEASES_COLLECTION,
  retention: 'tech',
  schema: {
    bsonType: 'object',
    required: ['_id', 'owner', 'until'],
    properties: {
      _id: { bsonType: 'string' },
      owner: { bsonType: 'string' },
      until: { bsonType: 'date' },
    },
  },
  indexes: [],
  expiry: { never: 'One small record per lease name, taken again and again.' },
  accountDelete: { none: 'No personal data: a lease names a process.' },
});

export interface LeaseRequest {
  name: string;
  owner: string;
  now: Date;
  /** How long it is held from `now`. */
  ttlMs: number;
}

/**
 * Takes the lease, or holds it longer when the owner has it: `true` when the owner holds it until
 * `now + ttlMs`, `false` when another owner holds it and its time is not out. It is one atomic step
 * (a unique `_id`), so two processes never both hold one lease.
 */
export async function acquireLease(
  db: Db,
  { name, owner, now, ttlMs }: LeaseRequest,
): Promise<boolean> {
  if (!Number.isInteger(ttlMs) || ttlMs < 1) {
    throw new RangeError('ttlMs must be a whole number of milliseconds, 1 or more.');
  }
  try {
    await db
      .collection<LeaseRecord>(LEASES_COLLECTION)
      .updateOne(
        { _id: name, $or: [{ owner }, { until: { $lte: now } }] },
        { $set: { owner, until: new Date(now.getTime() + ttlMs) } },
        { upsert: true, maxTimeMS: QUERY_MAX_TIME_MS },
      );
    return true;
  } catch (thrown) {
    // The lease is there, of another owner, and in force.
    if (isDuplicateKey(thrown)) return false;
    throw thrown;
  }
}

/** Gives the lease up, if the owner still holds it, so the next one need not wait for its time. */
export async function releaseLease(
  db: Db,
  { name, owner }: { name: string; owner: string },
): Promise<void> {
  await db
    .collection<LeaseRecord>(LEASES_COLLECTION)
    .deleteOne({ _id: name, owner }, { maxTimeMS: QUERY_MAX_TIME_MS });
}
