import { type Mongo, MongoServerError } from '@beautinique/backend-server-mongo';

/** Leases: one holder at a time per name, across instances (a deploy runs old and new together). */
export const LOCKS = 'platform_locks';

interface LockRecord {
  _id: string;
  owner: string;
  expiresAt: Date;
}

/**
 * Takes or renews the lease `name` for `owner` for `ttlMs`. True when `owner` now holds it. One
 * atomic update decides: the lease changes hands only when it is free, expired or already ours. Times
 * come from MongoDB's clock ($$NOW), so instances with different clocks still agree.
 */
export async function tryLease(
  mongo: Mongo,
  name: string,
  owner: string,
  ttlMs: number,
): Promise<boolean> {
  // a missing lease has no expiresAt, and missing sorts before any date: free
  const ours = { $or: [{ $eq: ['$owner', owner] }, { $lt: ['$expiresAt', '$$NOW'] }] };
  try {
    const lease = await mongo.db.collection<LockRecord>(LOCKS).findOneAndUpdate(
      { _id: name },
      [
        {
          $set: {
            owner: { $cond: [ours, owner, '$owner'] },
            expiresAt: { $cond: [ours, { $add: ['$$NOW', ttlMs] }, '$expiresAt'] },
          },
        },
      ],
      { upsert: true, returnDocument: 'after' },
    );
    return lease?.owner === owner;
  } catch (error) {
    // two instances created the missing lease at the same moment: the other one won
    if (error instanceof MongoServerError && error.code === 11000) return false;
    throw error;
  }
}

/** Gives the lease up at once (a clean stop), if `owner` still holds it. */
export async function releaseLease(mongo: Mongo, name: string, owner: string): Promise<void> {
  await mongo.db.collection<LockRecord>(LOCKS).deleteOne({ _id: name, owner });
}
