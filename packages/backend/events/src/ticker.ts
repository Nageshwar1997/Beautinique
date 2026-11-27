import { serializeError } from '@beautinique/backend-logger';
import {
  acquireLease,
  QUERY_MAX_TIME_MS,
  releaseLease,
  withTransaction,
} from '@beautinique/backend-mongo';
import type { Clock } from '@beautinique/shared-clock';
import type { ClientSession, Db, MongoClient } from 'mongodb';

import type { Alert, EventsLogger } from './inbox.ts';
import { isUnavailable, MAX_ATTEMPTS, retryDelay, UNAVAILABLE_RETRY_MS } from './retry.ts';
import { scheduleTimer, TIMERS_COLLECTION, type TimerHandler, type TimerRecord } from './timers.ts';
import { startLoop, type Loop } from './utils/loop.ts';

/** The lease that one instance holds to run a service's timers (§4 rule 4). */
export const TICKER_LEASE = 'ticker';

/** How long the lease is held from each renewal. */
export const TICKER_LEASE_MS = 120_000;

/** How often the ticker looks for due timers (docs/ARCHITECTURE.md §4 rule 1). */
export const TICK_MS = 60_000;

/** The first tick after boot: a whole sweep, once the service is up (§4 rule 1). */
export const BOOT_SWEEP_DELAY_MS = 30_000;

/** How many due timers one read takes; a tick reads again until none is due. */
export const TIMER_BATCH_SIZE = 50;

/** How long a timer run outside a transaction is held by its instance. */
export const TIMER_CLAIM_MS = 10 * 60_000;

/** A tick stops taking new timers after this long, so it ends before the next. */
export const TICK_BUDGET_MS = 50_000;

/** What puts the pending work back on the job queues (`createJobQueues`'s `requeuePending`). */
export interface Requeue {
  requeuePending(): Promise<number>;
}

export interface TickResult {
  /** Whether this instance held the lease; without it the tick did nothing. */
  held: boolean;
  done: number;
  failed: number;
  /** Timers that were done by another instance, or moved, before this one got to them. */
  skipped: number;
  /** Jobs put back on the queues. */
  requeued: number;
}

export interface Ticker {
  /** One tick: every due timer, then the job queues. The loop runs it; a test may call it. */
  tick(): Promise<TickResult>;
  /** Starts the loop: the first tick after `BOOT_SWEEP_DELAY_MS`, then every `TICK_MS`. */
  start(): void;
  stop(): Promise<void>;
}

export interface TickerOptions {
  client: MongoClient;
  db: Db;
  clock: Clock;
  owner: string;
  /** The service whose timers these are (for its alerts). */
  service: string;
  handlers: readonly TimerHandler[];
  queues?: Requeue;
  logger: EventsLogger;
  alert: Alert;
  tickMs?: number;
  bootDelayMs?: number;
}

// The timer was done by another instance, or moved, after it was read: nothing to write.
class TimerGone extends Error {}

/**
 * The ticker of a service (docs/ARCHITECTURE.md §4 rules 1, 2, 4 and 6): behind the `ticker`
 * lease, it runs each due timer once, the soonest first, until none is due; a sleeping server that
 * wakes catches up (late, never lost). Then it puts back on the queues the work that is pending in
 * the database but not on a queue (an empty Valkey).
 */
export function createTicker(options: TickerOptions): Ticker {
  const { client, db, clock, owner, service, logger, alert } = options;
  const byKind = new Map<string, TimerHandler>();
  for (const handler of options.handlers) {
    if (byKind.has(handler.kind))
      throw new RangeError(`The timer kind ${handler.kind} has two handlers.`);
    byKind.set(handler.kind, handler);
  }
  const timers = db.collection<TimerRecord>(TIMERS_COLLECTION);
  const lease = (now: Date) =>
    acquireLease(db, { name: TICKER_LEASE, owner, now, ttlMs: TICKER_LEASE_MS });
  let chainsStarted = false;

  // The first timer of each chain (a daily job) that has none.
  async function startChains(now: Date): Promise<void> {
    for (const handler of byKind.values()) {
      if (handler.start === undefined) continue;
      const open = await timers.findOne(
        { kind: handler.kind, status: { $in: ['pending', 'failed'] } },
        { projection: { _id: 1 }, maxTimeMS: QUERY_MAX_TIME_MS },
      );
      if (open === null) await scheduleTimer(db, handler.start(now));
    }
  }

  // Marks the timer done, in the given transaction; `TimerGone` when it was not still this read.
  async function markDone(
    timer: TimerRecord,
    handler: TimerHandler,
    session: ClientSession,
    claimed: boolean,
  ): Promise<void> {
    const marked = await timers.updateOne(
      {
        _id: timer._id,
        status: 'pending',
        attempts: timer.attempts,
        ...(claimed ? { claimedBy: owner } : {}),
      },
      { $set: { status: 'done', doneAt: clock.now(), claimedBy: null, claimUntil: null } },
      { session },
    );
    if (marked.matchedCount === 0) throw new TimerGone();
    await handler.after?.(timer, { db, session });
  }

  // A try that failed: tried again later, or failed for good after the last try (and an alert).
  async function failed(timer: TimerRecord, thrown: unknown): Promise<'failed' | 'retry'> {
    const now = clock.now();
    const down = isUnavailable(thrown);
    const attempts = down ? timer.attempts : timer.attempts + 1;
    const last = !down && attempts >= MAX_ATTEMPTS;
    const { type, message } = serializeError(thrown);
    await timers.updateOne(
      { _id: timer._id, status: 'pending', attempts: timer.attempts },
      {
        $set: {
          attempts,
          status: last ? 'failed' : 'pending',
          runAt: new Date(now.getTime() + (down ? UNAVAILABLE_RETRY_MS : retryDelay(attempts))),
          claimedBy: null,
          claimUntil: null,
          lastError: `${type}: ${message}`,
        },
      },
      { maxTimeMS: QUERY_MAX_TIME_MS },
    );
    const details = { kind: timer.kind, ref: timer.ref, attempts };
    if (!last) {
      logger.warn({ ...details, err: thrown }, 'A timer failed and will be tried again.');
      return 'retry';
    }
    logger.error({ ...details, err: thrown }, 'A timer failed after its last try.');
    try {
      await alert({
        kind: 'events.timerFailed',
        severity: 2,
        service,
        message: `The timer ${timer.kind} failed after ${String(attempts)} tries.`,
        details,
      });
    } catch (raised) {
      logger.error({ ...details, err: raised }, 'The alert of a failed timer could not be raised.');
    }
    return 'failed';
  }

  async function runOne(timer: TimerRecord): Promise<'done' | 'failed' | 'retry' | 'skipped'> {
    const handler = byKind.get(timer.kind);
    try {
      if (handler === undefined)
        throw new RangeError(`No handler takes the timer kind ${timer.kind}.`);
      if (handler.mode === 'transaction') {
        await withTransaction(
          client,
          async (session) => {
            // Done first: of two instances, the second finds it done and writes nothing.
            await markDone(timer, handler, session, false);
            await handler.run(timer, { db, session });
          },
          { clock },
        );
        return 'done';
      }
      // Outside a transaction: claimed first, so no other instance runs it at the same time.
      const now = clock.now();
      const claim = await timers.updateOne(
        {
          _id: timer._id,
          status: 'pending',
          attempts: timer.attempts,
          $or: [{ claimUntil: null }, { claimUntil: { $lte: now } }],
        },
        { $set: { claimedBy: owner, claimUntil: new Date(now.getTime() + TIMER_CLAIM_MS) } },
        { maxTimeMS: QUERY_MAX_TIME_MS },
      );
      if (claim.matchedCount === 0) return 'skipped';
      await handler.run(timer, { db, session: undefined });
      await withTransaction(client, (session) => markDone(timer, handler, session, true), {
        clock,
      });
      return 'done';
    } catch (thrown) {
      if (thrown instanceof TimerGone) return 'skipped';
      return failed(timer, thrown);
    }
  }

  async function tick(): Promise<TickResult> {
    const result: TickResult = { held: false, done: 0, failed: 0, skipped: 0, requeued: 0 };
    const start = clock.now();
    if (!(await lease(start))) return result;
    result.held = true;
    let renewedAt = start.getTime();
    if (!chainsStarted) {
      await startChains(start);
      chainsStarted = true;
    }
    // A timer another instance holds stays due; this tick does not read it again.
    const passedOver: TimerRecord['_id'][] = [];
    for (;;) {
      const now = clock.now();
      if (now.getTime() - start.getTime() > TICK_BUDGET_MS) break;
      const due = await timers
        .find(
          {
            status: 'pending',
            runAt: { $lte: now },
            ...(passedOver.length > 0 ? { _id: { $nin: passedOver } } : {}),
          },
          { sort: { runAt: 1, _id: 1 }, limit: TIMER_BATCH_SIZE, maxTimeMS: QUERY_MAX_TIME_MS },
        )
        .toArray();
      if (due.length === 0) break;
      for (const timer of due) {
        const at = clock.now().getTime();
        if (at - renewedAt > TICKER_LEASE_MS / 3) {
          if (!(await lease(new Date(at)))) return result;
          renewedAt = at;
        }
        const outcome = await runOne(timer);
        if (outcome === 'done') result.done += 1;
        else if (outcome === 'failed') result.failed += 1;
        else if (outcome === 'skipped') {
          result.skipped += 1;
          passedOver.push(timer._id);
        }
      }
    }
    if (options.queues !== undefined) result.requeued = await options.queues.requeuePending();
    return result;
  }

  let loop: Loop | undefined;
  return {
    tick,
    start() {
      if (loop !== undefined) return;
      loop = startLoop({
        run: tick,
        everyMs: options.tickMs ?? TICK_MS,
        firstInMs: options.bootDelayMs ?? BOOT_SWEEP_DELAY_MS,
        onError: (thrown) => {
          logger.error({ err: thrown }, 'A tick failed.');
        },
      });
    },
    async stop() {
      if (loop === undefined) return;
      const stopping = loop;
      loop = undefined;
      await stopping.stop();
      await releaseLease(db, { name: TICKER_LEASE, owner }).catch(() => undefined);
    },
  };
}
