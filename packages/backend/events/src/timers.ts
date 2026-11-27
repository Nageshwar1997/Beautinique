import { defineCollection, isDuplicateKey, QUERY_MAX_TIME_MS } from '@beautinique/backend-mongo';
import { istDay } from '@beautinique/shared-clock';
import type { ClientSession, Db, ObjectId } from 'mongodb';

import { istDayStart, nextIstDay, previousIstDay } from './utils/ist.ts';

/** The platform collection of a service's timed work (docs/ARCHITECTURE.md §4 rule 1). */
export const TIMERS_COLLECTION = 'timers';

/** A timer that is done goes this long after (§10.2: 7 days). */
export const TIMER_DONE_TTL_SECONDS = 7 * 24 * 60 * 60;

export type TimerStatus = 'pending' | 'done' | 'failed';

export interface TimerRecord {
  _id: ObjectId;
  /** What kind of work: `<service>.<thing>.<work>`, like `commerce.reservation.expire`. */
  kind: string;
  /** What it is for: a record's id, or a day for a daily job. One pending timer of a kind for one ref. */
  ref: string;
  /** When it is due. */
  dueAt: Date;
  /** When it is next tried: `dueAt`, or later after a failed try. */
  runAt: Date;
  status: TimerStatus;
  attempts: number;
  /** The instance that runs a timer outside a transaction, and until when (a claim, so not two at once). */
  claimedBy: string | null;
  claimUntil: Date | null;
  doneAt: Date | null;
  lastError: string | null;
}

/** `timers`, for a service's `defineCollections`. */
export const timersCollection = defineCollection({
  name: TIMERS_COLLECTION,
  retention: 'tech',
  schema: {
    bsonType: 'object',
    required: ['_id', 'kind', 'ref', 'dueAt', 'runAt', 'status', 'attempts'],
    properties: {
      _id: { bsonType: 'objectId' },
      kind: { bsonType: 'string' },
      ref: { bsonType: 'string' },
      dueAt: { bsonType: 'date' },
      runAt: { bsonType: 'date' },
      status: { enum: ['pending', 'done', 'failed'] },
      attempts: { bsonType: 'int', minimum: 0 },
      doneAt: { bsonType: ['date', 'null'] },
    },
  },
  indexes: [
    // What the ticker takes: the pending timers that are due, soonest first.
    {
      name: 'runAt_id_pending',
      key: { runAt: 1, _id: 1 },
      partialFilterExpression: { status: 'pending' },
    },
    // One pending timer of a kind for one ref: setting it again moves it.
    {
      name: 'kind_ref_pending',
      key: { kind: 1, ref: 1 },
      unique: true,
      partialFilterExpression: { status: 'pending' },
    },
    { name: 'doneAt_ttl', key: { doneAt: 1 }, expireAfterSeconds: TIMER_DONE_TTL_SECONDS },
  ],
  expiry: { ttlIndex: 'doneAt_ttl' },
  accountDelete: {
    none: 'A timer holds a kind of work and the id it is for, never personal data; it goes 7 days after it is done.',
  },
});

const KIND = /^[a-z]+(\.[a-z][A-Za-z0-9]*){2}$/;

function checkKind(kind: string): void {
  if (!KIND.test(kind)) {
    throw new RangeError(
      `The timer kind ${kind} is not <service>.<thing>.<work>, like commerce.reservation.expire.`,
    );
  }
}

function checkRef(ref: string): void {
  if (typeof ref !== 'string' || ref.length === 0 || ref.length > 128) {
    throw new RangeError('A timer ref is text of 1 to 128 characters.');
  }
}

export interface TimerRequest {
  kind: string;
  ref: string;
  dueAt: Date;
}

/**
 * Sets a timer, in the transaction of the change that needs it (give its session). One pending
 * timer of a kind for one ref: setting it again moves it to the new time, with its count from 0.
 */
export async function scheduleTimer(
  db: Db,
  { kind, ref, dueAt }: TimerRequest,
  { session }: { session?: ClientSession } = {},
): Promise<void> {
  checkKind(kind);
  checkRef(ref);
  if (Number.isNaN(dueAt.getTime())) throw new RangeError('dueAt must be a valid date.');
  const timers = db.collection<TimerRecord>(TIMERS_COLLECTION);
  const set = () =>
    timers.updateOne(
      { kind, ref, status: 'pending' },
      {
        $set: {
          dueAt,
          runAt: dueAt,
          attempts: 0,
          claimedBy: null,
          claimUntil: null,
          lastError: null,
        },
        $setOnInsert: { kind, ref, status: 'pending', doneAt: null },
      },
      { upsert: true, ...(session === undefined ? { maxTimeMS: QUERY_MAX_TIME_MS } : { session }) },
    );
  try {
    await set();
  } catch (thrown) {
    // Two set it at once and the other one made it first: this one moves it. In a transaction the
    // driver's write conflict runs the whole transaction again instead.
    if (session !== undefined || !isDuplicateKey(thrown)) throw thrown;
    await set();
  }
}

/** Takes a pending timer away (the work is not needed any more); `true` when there was one. */
export async function cancelTimer(
  db: Db,
  { kind, ref }: Omit<TimerRequest, 'dueAt'>,
  { session }: { session?: ClientSession } = {},
): Promise<boolean> {
  checkKind(kind);
  checkRef(ref);
  const result = await db
    .collection<TimerRecord>(TIMERS_COLLECTION)
    .deleteOne(
      { kind, ref, status: 'pending' },
      session === undefined ? { maxTimeMS: QUERY_MAX_TIME_MS } : { session },
    );
  return result.deletedCount === 1;
}

/** What a timer's work has. In a transaction (the usual way) `session` is the transaction's. */
export interface TimerContext {
  db: Db;
  session: ClientSession | undefined;
}

export interface TimerHandler {
  kind: string;
  /**
   * `transaction`: the work and the timer's done are one transaction, so the work's effect is once
   * however many instances tick. `outside`: work too big for one transaction (a day's counts),
   * which is safe to run again (§4 rule 4); a claim keeps two from running it at once.
   */
  mode: 'transaction' | 'outside';
  run(timer: TimerRecord, context: TimerContext): Promise<void>;
  /** In the transaction that marks it done (both modes): the next timer of a chain. */
  after?(timer: TimerRecord, context: { db: Db; session: ClientSession }): Promise<void>;
  /** The first timer of a chain, set at boot when the kind has none pending (or failed). */
  start?(now: Date): TimerRequest;
}

/** The work of a kind of timer, in the transaction that marks it done. */
export function onTimer(
  kind: string,
  run: (timer: TimerRecord, context: { db: Db; session: ClientSession }) => Promise<void>,
): TimerHandler {
  checkKind(kind);
  return {
    kind,
    mode: 'transaction',
    run: (timer, context) =>
      run(timer, { db: context.db, session: context.session as ClientSession }),
  };
}

export interface DailyJob {
  /** `<service>.<thing>.<work>`, like `commerce.stats.daily`. */
  kind: string;
  /** The IST time of the next day after which a day's work runs, like `{ hour: 9, minute: 0 }`. */
  at: { hour: number; minute: number };
  /** Builds the work of one IST day (`YYYY-MM-DD`). Safe to run again for the same day. */
  run(day: string, context: { db: Db }): Promise<void>;
}

/** When the work of `day` is due: `at` on the IST day after it. */
export function dailyDueAt(job: Pick<DailyJob, 'at'>, day: string): Date {
  const start = istDayStart(nextIstDay(day)).getTime();
  return new Date(start + (job.at.hour * 60 + job.at.minute) * 60_000);
}

/**
 * A daily job (§4 rule 6): a chain of timers, one for each IST day. The timer of a day runs its
 * work and, as it is marked done, sets the next day's. So the last whole day is always known, and
 * after a long sleep every missed day is built, in order, one after the other.
 */
export function dailyJob(job: DailyJob): TimerHandler {
  checkKind(job.kind);
  const { hour, minute } = job.at;
  if (
    !Number.isInteger(hour) ||
    hour < 0 ||
    hour > 23 ||
    !Number.isInteger(minute) ||
    minute < 0 ||
    minute > 59
  ) {
    throw new RangeError(`The time of ${job.kind} is an hour of 0 to 23 and a minute of 0 to 59.`);
  }
  return {
    kind: job.kind,
    mode: 'outside',
    run: (timer, { db }) => job.run(timer.ref, { db }),
    async after(timer, { db, session }) {
      const next = nextIstDay(timer.ref);
      await scheduleTimer(
        db,
        { kind: job.kind, ref: next, dueAt: dailyDueAt(job, next) },
        { session },
      );
    },
    // A new job begins with the last whole IST day.
    start(now) {
      const day = previousIstDay(istDay(now));
      return { kind: job.kind, ref: day, dueAt: dailyDueAt(job, day) };
    },
  };
}
