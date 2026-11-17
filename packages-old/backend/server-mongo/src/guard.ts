import {
  type CommandFailedEvent,
  type CommandStartedEvent,
  type CommandSucceededEvent,
  type MongoClient,
  MongoError,
} from 'mongodb';

/** A session id (the `lsid` commands carry, or `session.id`) as hex, or undefined. */
export function sessionKey(lsid: unknown): string | undefined {
  const id = (lsid as { id?: { toString(encoding: 'hex'): string } } | undefined)?.id;
  return id?.toString('hex');
}

interface Watch {
  inFlight: number;
  parallel: boolean;
  failedCode: number | undefined;
  /** `work` has finished: from now on only the commit (or abort) may run on this session. */
  settled: boolean;
}

/** What the guard saw of one attempt's queries. */
export interface Seen {
  /**
   * Two queries were on the wire together, a query was still running when the work finished, or a
   * query started after it finished (a missing await).
   */
  parallel: boolean;
  /**
   * The MongoDB error code of the first query that failed for a reason a retry does not change
   * (duplicate key, validation, bad query ...). Only the code: messages can hold personal data.
   */
  failedCode: number | undefined;
}

/** The commands withTransaction itself sends once `work` has finished. */
const END_COMMANDS = new Set(['commitTransaction', 'abortTransaction']);

/** Failures a retry may fix (write conflict, failover, overload): not a caught-and-ignored bug. */
const RETRY_LABELS = [
  'TransientTransactionError',
  'RetryableError',
  'RetryableWriteError',
  'SystemOverloadedError',
];

const failureCode = (failure: unknown): number | undefined => {
  if (failure instanceof MongoError && RETRY_LABELS.some((label) => failure.hasErrorLabel(label)))
    return undefined;
  const code = (failure as { code?: unknown } | undefined)?.code;
  return typeof code === 'number' ? code : undefined;
};

/**
 * Watches the queries of each running withTransaction attempt. MongoDB does not support parallel
 * operations in a transaction (Promise.all over queries): they then fail at random, with errors that
 * hide the cause, so any overlap becomes ParallelTransactionError. This sees only queries that reach
 * MongoDB together (a Promise.all whose queries happen to go one after another is not seen); the ESLint
 * rule against Promise.all inside withTransaction is the sure check. It also notes the first failed
 * query, so a caught-and-ignored query error is named instead of retried. Only sessions in a running
 * attempt are watched; command contents are never kept or logged.
 */
export class ParallelGuard {
  private readonly watches = new Map<string, Watch>();
  private readonly requests = new Map<number, Watch>();

  constructor(client: MongoClient) {
    client.on('commandStarted', (event: CommandStartedEvent) => {
      if (this.watches.size === 0) return;
      const key = sessionKey(event.command.lsid);
      const watch = key === undefined ? undefined : this.watches.get(key);
      if (!watch) return;
      if (watch.settled) {
        if (END_COMMANDS.has(event.commandName)) return;
        watch.parallel = true;
      }
      if (watch.inFlight > 0) watch.parallel = true;
      watch.inFlight += 1;
      this.requests.set(event.requestId, watch);
    });
    const finished = (event: CommandSucceededEvent | CommandFailedEvent, failedCode?: number) => {
      const watch = this.requests.get(event.requestId);
      if (!watch) return;
      this.requests.delete(event.requestId);
      watch.inFlight -= 1;
      watch.failedCode ??= failedCode;
    };
    client.on('commandSucceeded', (event: CommandSucceededEvent) => {
      // a write that failed per document (duplicate key ...) still answers ok: 1, with writeErrors
      const writeErrors = (event.reply as { writeErrors?: unknown[] } | undefined)?.writeErrors;
      finished(event, failureCode(writeErrors?.[0]));
    });
    client.on('commandFailed', (event: CommandFailedEvent) => {
      finished(event, failureCode(event.failure));
    });
  }

  /** How many sessions are watched right now: 0 whenever no withTransaction is running. */
  get watching(): number {
    return this.watches.size;
  }

  /** Starts watching a session (fresh state: the driver reuses session ids from a pool). */
  watch(key: string): void {
    this.watches.set(key, { inFlight: 0, parallel: false, failedCode: undefined, settled: false });
  }

  /** `work` has finished: says what was seen, and keeps watching for late queries until release. */
  settle(key: string): Seen {
    const watch = this.watches.get(key);
    if (watch) watch.settled = true;
    return this.seen(watch);
  }

  /** Stops watching and says what it saw. */
  release(key: string): Seen {
    const watch = this.watches.get(key);
    this.watches.delete(key);
    return this.seen(watch);
  }

  private seen(watch: Watch | undefined): Seen {
    return {
      parallel: watch ? watch.parallel || watch.inFlight > 0 : false,
      failedCode: watch?.failedCode,
    };
  }
}
