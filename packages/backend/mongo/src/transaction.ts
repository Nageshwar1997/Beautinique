import { setTimeout as pause } from 'node:timers/promises';

import { serviceUnavailable } from '@beautinique/backend-server-kit';
import type { Clock } from '@beautinique/shared-clock';
import { MongoError, WriteConcern, type ClientSession, type TransactionOptions } from 'mongodb';

import { isMongoUnavailable, MAX_TIME_EXPIRED, RETRY_AFTER_SECONDS } from './errors.ts';

/** A transaction gives up trying again after this long, and the request is a 503 (§10.2 rule 1). */
export const TRANSACTION_DEADLINE_MS = 10_000;

/** A commit that has not ended in this long has an unknown result, and is not tried again. */
export const COMMIT_MAX_TIME_MS = 2_000;

const TRANSIENT = 'TransientTransactionError';
const UNKNOWN_COMMIT = 'UnknownTransactionCommitResult';

const OPTIONS: TransactionOptions = {
  readConcern: { level: 'snapshot' },
  writeConcern: new WriteConcern('majority'),
  readPreference: 'primary',
  maxCommitTimeMS: COMMIT_MAX_TIME_MS,
};

/** What a transaction needs of a session; the driver's `ClientSession` is one. */
export interface TransactionSession {
  startTransaction(options: TransactionOptions): void;
  commitTransaction(): Promise<unknown>;
  abortTransaction(): Promise<unknown>;
  endSession(): Promise<unknown>;
  inTransaction(): boolean;
}

/** What gives a session; the driver's `MongoClient` is one. */
export interface SessionSource<S extends TransactionSession> {
  startSession(): S;
}

export interface TransactionRunOptions {
  /** "Now" for the deadline (docs/RULES.md RT-13). */
  clock: Clock;
  /** How long it may keep trying; `TRANSACTION_DEADLINE_MS` when not given. */
  deadlineMs?: number;
}

const hasLabel = (thrown: unknown, label: string): boolean =>
  thrown instanceof MongoError && thrown.hasErrorLabel(label);
const ranOutOfTime = (thrown: unknown): boolean =>
  thrown instanceof MongoError && thrown.code === MAX_TIME_EXPIRED;

/**
 * Runs `work` in one transaction (docs/ARCHITECTURE.md §10.2 rules 1 to 3): a snapshot read and a
 * majority write. A transient error (a write conflict, a new primary) runs the whole work again;
 * a commit whose result is not known is committed again, and only the commit. After `deadlineMs`
 * it stops trying and throws a 503 (`SERVICE_UNAVAILABLE`), as it does for a query that ran out of
 * its `maxTimeMS` or a database out of reach; any other error is thrown as it is.
 *
 * The work may run more than once, so it does nothing outside the database (no call, no event that
 * is not in the outbox), passes the session to every query, and answers only from what it returns.
 */
export async function withTransaction<T, S extends TransactionSession = ClientSession>(
  client: SessionSource<S>,
  work: (session: S) => Promise<T>,
  { clock, deadlineMs = TRANSACTION_DEADLINE_MS }: TransactionRunOptions,
): Promise<T> {
  const start = clock.now().getTime();
  const outOfTime = (): boolean => clock.now().getTime() - start >= deadlineMs;
  const session = client.startSession();
  try {
    for (let attempt = 0; ; attempt += 1) {
      if (attempt > 0) {
        if (outOfTime()) throw serviceUnavailable(RETRY_AFTER_SECONDS);
        // A little wait, longer after each try and never the same for two, so that two
        // transactions that conflicted do not meet again at once.
        await pause(Math.random() * Math.min(2 ** attempt, 100));
      }
      session.startTransaction(OPTIONS);
      let result: T;
      try {
        result = await work(session);
      } catch (thrown) {
        // An abort that fails changes nothing: the server ends the transaction by itself.
        if (session.inTransaction()) await session.abortTransaction().catch(() => undefined);
        if (hasLabel(thrown, TRANSIENT)) continue;
        if (isMongoUnavailable(thrown)) throw serviceUnavailable(RETRY_AFTER_SECONDS);
        throw thrown;
      }
      if (await commit(session, outOfTime)) return result;
    }
  } finally {
    await session.endSession();
  }
}

// Commits; `false` when the whole work must run again.
async function commit(session: TransactionSession, outOfTime: () => boolean): Promise<boolean> {
  for (;;) {
    try {
      await session.commitTransaction();
      return true;
    } catch (thrown) {
      // Whether it committed is not known: the work has done its part, and only the commit is
      // tried again. One that ran out of its own time stays unknown, and the caller is told so.
      if (ranOutOfTime(thrown)) throw serviceUnavailable(RETRY_AFTER_SECONDS);
      if (hasLabel(thrown, UNKNOWN_COMMIT)) {
        if (outOfTime()) throw serviceUnavailable(RETRY_AFTER_SECONDS);
        continue;
      }
      if (hasLabel(thrown, TRANSIENT)) return false;
      throw thrown;
    }
  }
}
