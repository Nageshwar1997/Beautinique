import { MongoServerError, type ClientSession, type Db } from 'mongodb';
import { describe, expect, it, vi } from 'vitest';

import { cancelTimer, dailyDueAt, dailyJob, onTimer, scheduleTimer } from '../src/timers.ts';

const collection = vi.fn();
const noDb = { collection } as unknown as Db;

describe('timers and daily jobs (docs/ARCHITECTURE.md §4 rules 1 and 6)', () => {
  it('CR-19: a kind is <service>.<thing>.<work>, a ref is 1 to 128 characters, a due time a date', async () => {
    const dueAt = new Date('2026-11-27T00:00:00.000Z');
    await expect(scheduleTimer(noDb, { kind: 'expire', ref: 'r', dueAt })).rejects.toThrow(
      'The timer kind expire is not <service>.<thing>.<work>, like commerce.reservation.expire.',
    );
    await expect(
      scheduleTimer(noDb, { kind: 'commerce.reservation.expire', ref: '', dueAt }),
    ).rejects.toThrow('A timer ref is text of 1 to 128 characters.');
    await expect(
      scheduleTimer(noDb, { kind: 'commerce.reservation.expire', ref: 'x'.repeat(129), dueAt }),
    ).rejects.toThrow(RangeError);
    await expect(
      scheduleTimer(noDb, {
        kind: 'commerce.reservation.expire',
        ref: 'r',
        dueAt: new Date(Number.NaN),
      }),
    ).rejects.toThrow('dueAt must be a valid date.');
    await expect(cancelTimer(noDb, { kind: 'Commerce.x.y', ref: 'r' })).rejects.toThrow(RangeError);
    expect(() => onTimer('commerce.reservation', () => Promise.resolve())).toThrow(RangeError);
    expect(collection).not.toHaveBeenCalled();
  });

  it("AC-PLATFORM-6: a day's work is due at its time on the IST day after it", () => {
    expect(dailyDueAt({ at: { hour: 0, minute: 0 } }, '2026-11-26').toISOString()).toBe(
      '2026-11-26T18:30:00.000Z',
    );
    expect(dailyDueAt({ at: { hour: 9, minute: 15 } }, '2026-11-26').toISOString()).toBe(
      '2026-11-27T03:45:00.000Z',
    );
    expect(dailyDueAt({ at: { hour: 0, minute: 0 } }, '2026-12-31').toISOString()).toBe(
      '2026-12-31T18:30:00.000Z',
    );
  });

  it('AC-PLATFORM-6: a new daily job begins with the last whole IST day', () => {
    const job = dailyJob({
      kind: 'commerce.stats.daily',
      at: { hour: 2, minute: 0 },
      run: () => Promise.resolve(),
    });
    // 27 Nov, 10:00 IST: the last whole day is 26 Nov, due at 02:00 IST on 27 Nov.
    expect(job.start?.(new Date('2026-11-27T04:30:00.000Z'))).toEqual({
      kind: 'commerce.stats.daily',
      ref: '2026-11-26',
      dueAt: new Date('2026-11-26T20:30:00.000Z'),
    });
    // Just after midnight IST on 27 Nov: 26 Nov is whole now.
    expect(job.start?.(new Date('2026-11-26T18:31:00.000Z')).ref).toBe('2026-11-26');
    expect(job.mode).toBe('outside');
  });

  it('CR-19: the time of a daily job is an hour of 0 to 23 and a minute of 0 to 59', () => {
    const run = () => Promise.resolve();
    for (const at of [
      { hour: 24, minute: 0 },
      { hour: -1, minute: 0 },
      { hour: 1.5, minute: 0 },
      { hour: 1, minute: 60 },
    ]) {
      expect(() => dailyJob({ kind: 'commerce.stats.daily', at, run })).toThrow(
        'The time of commerce.stats.daily is an hour of 0 to 23 and a minute of 0 to 59.',
      );
    }
  });

  it('CR-19: a timer set by another at the same moment (a duplicate key) is set again; in a transaction the error stays', async () => {
    const duplicate = new MongoServerError({ code: 11000, errmsg: 'E11000 duplicate key' });
    const updateOne = vi
      .fn()
      .mockRejectedValueOnce(duplicate)
      .mockResolvedValue({ matchedCount: 1 });
    const db = { collection: () => ({ updateOne }) } as unknown as Db;
    const timer = { kind: 'commerce.reservation.expire', ref: 'r', dueAt: new Date() };

    await scheduleTimer(db, timer);
    expect(updateOne).toHaveBeenCalledTimes(2);

    updateOne.mockReset().mockRejectedValueOnce(duplicate);
    const session = {} as unknown as ClientSession;
    await expect(scheduleTimer(db, timer, { session })).rejects.toBe(duplicate);
    expect(updateOne).toHaveBeenCalledTimes(1);

    updateOne.mockReset().mockRejectedValueOnce(new TypeError('another'));
    await expect(scheduleTimer(db, timer)).rejects.toThrow('another');
  });
});
