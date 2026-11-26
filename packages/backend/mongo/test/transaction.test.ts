import { AppError } from '@beautinique/backend-server-kit';
import { createFakeClock, type FakeClock } from '@beautinique/shared-clock';
import { MongoError, MongoNetworkError, MongoServerError, type TransactionOptions } from 'mongodb';
import { describe, expect, it, vi } from 'vitest';

import {
  TRANSACTION_DEADLINE_MS,
  withTransaction,
  type TransactionSession,
} from '../src/transaction.ts';

const START = new Date('2026-11-26T10:00:00.000Z');

function labelled(label: string, code = 112): MongoServerError {
  const error = new MongoServerError({ errmsg: label, code });
  error.addErrorLabel(label);
  return error;
}
const transient = () => labelled('TransientTransactionError');
const unknownCommit = () => labelled('UnknownTransactionCommitResult', 91);
const commitOutOfTime = () => {
  const error = new MongoServerError({ errmsg: 'operation exceeded time limit', code: 50 });
  error.addErrorLabel('UnknownTransactionCommitResult');
  return error;
};

// A session that does what it is told: each commit takes the next of `commits` (an error to throw,
// or `ok`), and it counts what was called.
function fakeSession(commits: (Error | 'ok')[] = []) {
  let active = false;
  const calls = { start: 0, commit: 0, abort: 0, end: 0 };
  const options: TransactionOptions[] = [];
  const session: TransactionSession & { failAbort: boolean } = {
    failAbort: false,
    startTransaction(given) {
      calls.start += 1;
      options.push(given);
      active = true;
    },
    commitTransaction() {
      calls.commit += 1;
      const next = commits.shift() ?? 'ok';
      if (next === 'ok') {
        active = false;
        return Promise.resolve();
      }
      return Promise.reject(next);
    },
    abortTransaction() {
      calls.abort += 1;
      active = false;
      return session.failAbort ? Promise.reject(new Error('abort failed')) : Promise.resolve();
    },
    endSession() {
      calls.end += 1;
      return Promise.resolve();
    },
    inTransaction: () => active,
  };
  return { client: { startSession: () => session }, session, calls, options };
}

const clockAt = (): FakeClock => createFakeClock(START);

describe('withTransaction (AC-PLATFORM-1, docs/ARCHITECTURE.md §10.2 rules 1 to 3)', () => {
  it('AC-PLATFORM-1: runs the work once, commits, gives its result and ends the session', async () => {
    const { client, calls, options } = fakeSession();
    const work = vi.fn().mockResolvedValue('placed');

    expect(await withTransaction(client, work, { clock: clockAt() })).toBe('placed');
    expect(work).toHaveBeenCalledTimes(1);
    expect(calls).toEqual({ start: 1, commit: 1, abort: 0, end: 1 });
    // A snapshot read and a majority write, from the primary.
    expect(options[0]).toMatchObject({
      readConcern: { level: 'snapshot' },
      writeConcern: { w: 'majority' },
      readPreference: 'primary',
    });
  });

  it('AC-PLATFORM-1: a transient error in the work aborts it and runs the whole work again', async () => {
    const { client, calls } = fakeSession();
    const work = vi.fn().mockRejectedValueOnce(transient()).mockResolvedValueOnce('placed');

    expect(await withTransaction(client, work, { clock: clockAt() })).toBe('placed');
    expect(work).toHaveBeenCalledTimes(2);
    expect(calls).toEqual({ start: 2, commit: 1, abort: 1, end: 1 });
  });

  it('AC-PLATFORM-1: a transient error at the commit runs the whole work again', async () => {
    const { client, calls } = fakeSession([transient(), 'ok']);
    const work = vi.fn().mockResolvedValue('placed');

    expect(await withTransaction(client, work, { clock: clockAt() })).toBe('placed');
    expect(work).toHaveBeenCalledTimes(2);
    expect(calls).toMatchObject({ start: 2, commit: 2 });
  });

  it('AC-PLATFORM-1: a commit whose result is not known is committed again, and only the commit', async () => {
    const { client, calls } = fakeSession([unknownCommit(), unknownCommit(), 'ok']);
    const work = vi.fn().mockResolvedValue('placed');

    expect(await withTransaction(client, work, { clock: clockAt() })).toBe('placed');
    expect(work).toHaveBeenCalledTimes(1);
    expect(calls).toEqual({ start: 1, commit: 3, abort: 0, end: 1 });
  });

  it('AC-PLATFORM-1: after 10 seconds of trying it is a 503, and the session ends', async () => {
    const { client, calls } = fakeSession();
    const clock = clockAt();
    // Each try takes 3 seconds and meets a conflict.
    const work = vi.fn(() => {
      clock.advance(3_000);
      return Promise.reject(transient());
    });

    const thrown = await withTransaction(client, work, { clock }).catch((error: unknown) => error);
    expect(thrown).toBeInstanceOf(AppError);
    expect(thrown).toMatchObject({
      status: 503,
      code: 'SERVICE_UNAVAILABLE',
      retryAfterSeconds: 5,
    });
    // Tries at 0, 3, 6 and 9 seconds; at 12 the 10 are past.
    expect(work).toHaveBeenCalledTimes(4);
    expect(calls.end).toBe(1);
    expect(TRANSACTION_DEADLINE_MS).toBe(10_000);
  });

  it('AC-PLATFORM-1: a commit that stays unknown past the deadline is a 503', async () => {
    const clock = clockAt();
    const { client, session, calls } = fakeSession();
    session.commitTransaction = () => {
      calls.commit += 1;
      clock.advance(4_000);
      return Promise.reject(unknownCommit());
    };

    await expect(
      withTransaction(client, () => Promise.resolve(1), { clock, deadlineMs: 10_000 }),
    ).rejects.toMatchObject({ status: 503 });
    expect(calls.commit).toBe(3);
  });

  it('AC-PLATFORM-1: a commit that ran out of its own time is a 503 at once: whether it committed is not known', async () => {
    const { client, calls } = fakeSession([commitOutOfTime()]);
    const work = vi.fn().mockResolvedValue('placed');

    await expect(withTransaction(client, work, { clock: clockAt() })).rejects.toMatchObject({
      status: 503,
    });
    expect(work).toHaveBeenCalledTimes(1);
    expect(calls.commit).toBe(1);
  });

  it('SR-077: any other error of the work aborts the transaction and is thrown as it is, not tried again', async () => {
    const { client, calls } = fakeSession();
    const boom = new Error('stock is short');
    const work = vi.fn().mockRejectedValue(boom);

    await expect(withTransaction(client, work, { clock: clockAt() })).rejects.toBe(boom);
    expect(work).toHaveBeenCalledTimes(1);
    expect(calls).toEqual({ start: 1, commit: 0, abort: 1, end: 1 });
  });

  it('SR-077: an error at the commit with no label is thrown as it is', async () => {
    const duplicate = new MongoServerError({ errmsg: 'E11000', code: 11000 });
    const { client } = fakeSession([duplicate]);

    await expect(
      withTransaction(client, () => Promise.resolve(1), { clock: clockAt() }),
    ).rejects.toBe(duplicate);
  });

  it('AC-PLATFORM-1: a query out of its time or a database out of reach is a 503, not a 500', async () => {
    for (const thrown of [
      new MongoServerError({ errmsg: 'operation exceeded time limit', code: 50 }),
      new MongoNetworkError('connection closed'),
    ]) {
      const { client } = fakeSession();
      await expect(
        withTransaction(client, () => Promise.reject(thrown), { clock: clockAt() }),
      ).rejects.toMatchObject({ status: 503, code: 'SERVICE_UNAVAILABLE' });
    }
  });

  it('AC-PLATFORM-1: an abort that fails changes nothing; a work that ended the transaction itself is not aborted', async () => {
    const failing = fakeSession();
    failing.session.failAbort = true;
    const work = vi.fn().mockRejectedValueOnce(transient()).mockResolvedValueOnce(2);
    expect(await withTransaction(failing.client, work, { clock: clockAt() })).toBe(2);

    const ended = fakeSession();
    const boom = new MongoError('not in a transaction');
    await expect(
      withTransaction(
        ended.client,
        async (session) => {
          await session.abortTransaction();
          throw boom;
        },
        { clock: clockAt() },
      ),
    ).rejects.toBe(boom);
    expect(ended.calls.abort).toBe(1);
  });
});
