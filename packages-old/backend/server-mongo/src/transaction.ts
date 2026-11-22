import { type ClientSession, MongoError } from 'mongodb';

import type { Mongo } from './connect';
import {
  ParallelTransactionError,
  TransactionAbortedError,
  TransactionTimeoutError,
} from './errors';
import { type Seen, sessionKey } from './guard';

export interface WithTransactionOptions {
  /** Total time for every attempt and the commit (default 10 s); after it, TransactionTimeoutError (503). */
  timeoutMs?: number;
}

/** MongoDB's answer when the transaction is gone (it aborted it after a failed query, or it timed out). */
const NO_SUCH_TRANSACTION = 251;

const hasLabel = (error: unknown, label: string): boolean =>
  error instanceof MongoError && error.hasErrorLabel(label);

const codeOf = (error: unknown): unknown => (error instanceof MongoError ? error.code : undefined);

/**
 * The pause after attempt `attempt`: 10, 20, 40 ... ms up to 200, times a jitter of 0.5–1 (so two
 * clashing requests do not retry in step), and never longer than the time left.
 */
export function backoffMs(
  attempt: number,
  msLeft: number,
  random: () => number = Math.random,
): number {
  const wait = Math.min(10 * 2 ** (attempt - 1), 200) * (0.5 + random() / 2);
  return Math.max(0, Math.min(wait, msLeft));
}

function pause(attempt: number, deadline: number): Promise<void> {
  const ms = backoffMs(attempt, deadline - Date.now());
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Commits. An unknown result (network error, timeout) retries only the commit after a short pause;
 * a transient error is handed back, so the caller can run the work again.
 */
async function commit(
  session: ClientSession,
  deadline: number,
  attempt: number,
): Promise<'committed' | { transient: unknown }> {
  for (let retry = 1; ; retry += 1) {
    try {
      await session.commitTransaction();
      return 'committed';
    } catch (error) {
      if (hasLabel(error, 'UnknownTransactionCommitResult')) {
        if (Date.now() >= deadline) throw new TransactionTimeoutError(attempt, error);
        await pause(retry, deadline);
        continue;
      }
      if (hasLabel(error, 'TransientTransactionError')) return { transient: error };
      throw error;
    }
  }
}

/**
 * A query failed earlier in this attempt for a reason a retry does not change, `work` caught it, and
 * MongoDB now says the transaction is gone: that is the swallowed error, not a reason to retry. (The
 * guard never records retryable failures, NoSuchTransaction included, so a transaction MongoDB dropped
 * by itself still retries.)
 */
function swallowed(seen: Seen, error: unknown): TransactionAbortedError | undefined {
  if (seen.failedCode === undefined || codeOf(error) !== NO_SUCH_TRANSACTION) return undefined;
  return new TransactionAbortedError(seen.failedCode, { cause: error });
}

/** One attempt on its own session: the value once committed, or 'retry' after a transient error. */
async function attemptOnce<T>(
  mongo: Mongo,
  session: ClientSession,
  work: (session: ClientSession) => Promise<T>,
  deadline: number,
  attempt: number,
): Promise<{ value: T } | 'retry'> {
  session.startTransaction({
    readConcern: { level: 'snapshot' },
    writeConcern: { w: 'majority' },
    readPreference: 'primary',
  });
  const key = sessionKey(session.id) ?? '';
  mongo.guard.watch(key);
  let value: T;
  try {
    value = await work(session);
  } catch (error) {
    const seen = mongo.guard.release(key);
    if (seen.parallel) throw new ParallelTransactionError({ cause: error });
    const caught = swallowed(seen, error);
    if (caught) throw caught;
    if (!hasLabel(error, 'TransientTransactionError')) throw error;
    if (Date.now() >= deadline) throw new TransactionTimeoutError(attempt, error);
    return 'retry';
  }
  // one turn of the event loop: a query that work started without await reaches the wire, and is seen
  await new Promise<void>((resolve) => setImmediate(resolve));
  if (mongo.guard.settle(key).parallel) {
    mongo.guard.release(key);
    throw new ParallelTransactionError();
  }
  // still watched while committing: a late query (pool busy) shows up here
  let result: Awaited<ReturnType<typeof commit>>;
  let seen: Seen;
  try {
    result = await commit(session, deadline, attempt);
  } finally {
    seen = mongo.guard.release(key);
  }
  if (result === 'committed') {
    // committed already, so it cannot be undone; a bug to fix: that query may have run outside it
    if (seen.parallel)
      mongo.logger.error(
        'a query in the transaction was not awaited: it may have run outside the transaction',
      );
    return { value };
  }
  if (seen.parallel) throw new ParallelTransactionError({ cause: result.transient });
  const caught = swallowed(seen, result.transient);
  if (caught) throw caught;
  if (Date.now() >= deadline) throw new TransactionTimeoutError(attempt, result.transient);
  return 'retry';
}

/**
 * Ends sessions whose transaction may still be open on the server: after a network error the driver
 * throws such a session away (it never goes back to the pool, so no other request uses its id), and if
 * its abort did not get through, its transaction keeps its writes locked for up to a minute. Best
 * effort: on failure the ids stay in the list and the next call tries again.
 */
async function killOrphans(mongo: Mongo, orphans: unknown[]): Promise<void> {
  if (orphans.length === 0) return;
  try {
    await mongo.client.db('admin').command({ killSessions: orphans });
    orphans.length = 0;
  } catch {
    // MongoDB still out of reach: kept for the next try
  }
}

/**
 * Runs `work` in a MongoDB transaction and returns its value only after the commit, so a handler that
 * replies with that value never answers for data that was not saved (ARCHITECTURE §6.2). Reads see one
 * snapshot, writes wait for a majority. A transient error (two writers on one document, a failover)
 * runs `work` again after a short pause, until `timeoutMs`; an unknown commit result retries only the
 * commit. Every attempt gets its own session, ended before the next one starts: a query left over from
 * a failed attempt then fails instead of saving outside the transaction. A session the driver threw
 * away after a network error is killed on the server, so its open transaction cannot block the rows.
 *
 * Inside `work`: pass `{ session }` to every query, await each query before the next (never
 * Promise.all: ESLint stops it, and queries that reach MongoDB together throw
 * ParallelTransactionError), do not catch query errors and carry on (TransactionAbortedError), keep
 * outside side effects (email, payment calls) out of it because it may run again, and write the outbox
 * and audit rows there too.
 */
export async function withTransaction<T>(
  mongo: Mongo,
  work: (session: ClientSession) => Promise<T>,
  { timeoutMs = 10_000 }: WithTransactionOptions = {},
): Promise<T> {
  const deadline = Date.now() + timeoutMs;
  const orphans: unknown[] = [];
  try {
    for (let attempt = 1; ; attempt += 1) {
      await killOrphans(mongo, orphans);
      const session = mongo.client.startSession();
      let outcome: { value: T } | 'retry';
      try {
        outcome = await attemptOnce(mongo, session, work, deadline, attempt);
      } finally {
        const dirty = session.serverSession.isDirty;
        const lsid = session.id;
        // aborts the transaction if it is still open; never hides the error being thrown
        await session.endSession().catch(() => undefined);
        if (dirty && lsid) orphans.push(lsid);
      }
      if (outcome !== 'retry') {
        if (attempt > 1)
          mongo.logger.info({ attempts: attempt }, 'transaction committed after retrying');
        return outcome.value;
      }
      await pause(attempt, deadline);
    }
  } finally {
    await killOrphans(mongo, orphans);
  }
}
