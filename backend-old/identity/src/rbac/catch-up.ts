import { randomUUID } from 'node:crypto';

import type { Logger } from '@beautinique/backend-server-kit';
import { type Mongo, withTransaction } from '@beautinique/backend-server-mongo';
import { releaseLease, tryLease } from '@beautinique/backend-server-queue';

import { type User, USERS, writeUserSnapshot } from '../users.ts';
import { writeAccessSnapshot } from './grants.ts';
import { readRoles, writeRoleSnapshots } from './sync.ts';

/**
 * The catch-up sweep (owner, 2026-11-14; TASKS T3.5, T4.1): during a deploy the old instance keeps
 * serving for a while, and when it runs code from before T3.5 what it changes then (a grant, a
 * role's permissions, a new account) sends no snapshot to core, so core's copy misses it. A while
 * after each start, identity sends again the snapshot of every role and every account changed since
 * a while before that start: the roles first, so a grants copy core gets from the sweep never meets
 * an older copy of its role (a stale grants copy fails closed with a 503, a stale role would not).
 * It runs on identity's own queue as a delayed job, so a restart does not lose it.
 */
export const CATCH_UP_TASK = 'identity.catchUpSweep';
/** How long after a start the sweep runs: the old instance has stopped serving by then. */
export const CATCH_UP_DELAY_MS = 5 * 60_000;
/** The roles and accounts changed from this long before the start get their snapshot again. */
export const CATCH_UP_WINDOW_MS = 30 * 60_000;
/** The sweep's lease: two instances of a deploy never sweep at once. */
const LEASE = 'identity.catchUpSweep';
export const CATCH_UP_LEASE_MS = 5 * 60_000;
/** Tries of one sweep: a failed one (a long database outage) runs again, its backoff the lease. */
export const CATCH_UP_ATTEMPTS = 4;
/** Roles or accounts per transaction. */
const BATCH = 50;

type SweptUser = Pick<
  User,
  '_id' | 'email' | 'status' | 'createdAt' | 'updatedAt' | 'authzVersion'
>;

/**
 * Sends again the snapshots of every role and account changed from `windowMs` before `startedAt`
 * (the start that asked for the sweep, so a retry later still covers it). How many accounts.
 */
export async function catchUpSweep(
  mongo: Mongo,
  logger: Logger,
  {
    startedAt = new Date(),
    windowMs = CATCH_UP_WINDOW_MS,
  }: { startedAt?: Date; windowMs?: number } = {},
): Promise<number> {
  const owner = randomUUID();
  if (!(await tryLease(mongo, LEASE, owner, CATCH_UP_LEASE_MS))) {
    logger.info('catch-up sweep skipped: another instance runs it');
    return 0;
  }
  try {
    const since = new Date(startedAt.getTime() - windowMs);
    const roles = await readRoles(
      mongo,
      { updatedAt: { $gte: since } },
      { comment: 'full read: roles are few (about 80), none indexed by updatedAt' },
    );
    for (let start = 0; start < roles.length; start += BATCH) {
      const part = roles.slice(start, start + BATCH);
      await withTransaction(mongo, (session) => writeRoleSnapshots(mongo, session, part));
    }
    let sent = 0;
    let batch: SweptUser[] = [];
    const flush = async () => {
      const part = batch;
      batch = [];
      if (part.length === 0) return;
      await withTransaction(mongo, async (session) => {
        for (const user of part) {
          await writeUserSnapshot(mongo, session, user);
          await writeAccessSnapshot(mongo, session, user._id, user.authzVersion ?? 0, new Date());
        }
      });
      sent += part.length;
    };
    for await (const user of mongo.db.collection<User>(USERS).find(
      { updatedAt: { $gte: since } },
      {
        projection: { _id: 1, email: 1, status: 1, createdAt: 1, updatedAt: 1, authzVersion: 1 },
      },
    )) {
      batch.push(user);
      if (batch.length === BATCH) await flush();
    }
    await flush();
    logger.info(
      { roles: roles.length, accounts: sent, since: since.toISOString() },
      'catch-up sweep sent snapshots',
    );
    return sent;
  } finally {
    await releaseLease(mongo, LEASE, owner);
  }
}
