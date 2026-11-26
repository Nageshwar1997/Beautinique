import { serviceUnavailable } from '@beautinique/backend-server-kit';
import {
  MongoError,
  MongoNetworkError,
  MongoServerError,
  MongoServerSelectionError,
} from 'mongodb';

/** What a 503 of a database that did not answer tells the caller to wait. */
export const RETRY_AFTER_SECONDS = 5;

/** Every query and write has this much time on the server (docs/ARCHITECTURE.md §10.2 rule 3). */
export const QUERY_MAX_TIME_MS = 2_000;

const DUPLICATE_KEY = 11000;

/** MaxTimeMSExpired: a query or a commit ran out of its time (`maxTimeMS`). */
export const MAX_TIME_EXPIRED = 50;

/**
 * A database that did not answer in its time, or is out of reach: the service is busy (a 503 with
 * `Retry-After`), not broken (a 500).
 */
export function isMongoUnavailable(thrown: unknown): boolean {
  return (
    thrown instanceof MongoServerSelectionError ||
    thrown instanceof MongoNetworkError ||
    (thrown instanceof MongoError && thrown.code === MAX_TIME_EXPIRED)
  );
}

/** A second document with the value of a unique index (E11000). */
export function isDuplicateKey(thrown: unknown): boolean {
  return thrown instanceof MongoServerError && thrown.code === DUPLICATE_KEY;
}

/**
 * Runs a database call; when the database does not answer, a 503 (`SERVICE_UNAVAILABLE`). Inside a
 * transaction the error stays as it is, so that `withTransaction` sees its label and tries again.
 */
export async function mongoCall<T>(
  run: () => Promise<T>,
  session?: { inTransaction(): boolean },
): Promise<T> {
  try {
    return await run();
  } catch (thrown) {
    if (session?.inTransaction() !== true && isMongoUnavailable(thrown)) {
      throw serviceUnavailable(RETRY_AFTER_SECONDS);
    }
    throw thrown;
  }
}
