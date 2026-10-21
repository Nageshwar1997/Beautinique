import { AppError } from '@beautinique/backend-server-kit';

/**
 * Queries of one transaction reached MongoDB at the same time (Promise.all), or a query was still
 * running when the work finished (a missing await). A bug in the calling code, so it is a plain Error:
 * the client gets a 500 and the log gets this message and the stack. Nothing is saved.
 */
export class ParallelTransactionError extends Error {
  constructor(options: { cause?: unknown } = {}) {
    super(
      'Queries inside one transaction ran at the same time (Promise.all?) or were not awaited. Run ' +
        'them one after another with await: MongoDB does not support parallel operations in a ' +
        'transaction.',
      options,
    );
    this.name = 'ParallelTransactionError';
  }
}

/**
 * A query inside the transaction failed and `work` caught the error and carried on, but MongoDB had
 * already cancelled the transaction, so nothing was saved. A bug in the calling code (500), raised at
 * once instead of retrying the same failure until the timeout.
 */
export class TransactionAbortedError extends Error {
  /** The MongoDB error code of the query that failed first (11000 = duplicate key ...). */
  readonly mongoCode: number;

  constructor(mongoCode: number, options: { cause?: unknown } = {}) {
    super(
      `A query in this transaction failed (MongoDB error ${String(mongoCode)}) and the error was ` +
        'caught inside the work, but MongoDB had already cancelled the transaction, so nothing was ' +
        'saved. Do not catch query errors inside withTransaction: for "insert if new" use an upsert ' +
        'with $setOnInsert, or read first.',
      options,
    );
    this.name = 'TransactionAbortedError';
    this.mongoCode = mongoCode;
  }
}

/**
 * The transaction could not commit in time: other writes kept conflicting, or MongoDB was too slow.
 * The client gets 503 SERVICE_UNAVAILABLE and may try again (with the same Idempotency-Key).
 */
export class TransactionTimeoutError extends AppError {
  readonly attempts: number;

  constructor(attempts: number, cause: unknown) {
    super('SERVICE_UNAVAILABLE', 'This is busy right now. Please try again in a moment.', {
      cause,
    });
    this.name = 'TransactionTimeoutError';
    this.attempts = attempts;
  }
}
