import { istDay } from '@beautinique/shared-clock';
import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { istDayStart, nextIstDay, previousIstDay } from '../src/utils/ist.ts';

describe('IST days of the daily jobs (docs/ARCHITECTURE.md §4 rule 5)', () => {
  it('RT-13: a day begins at 00:00 IST, which is 18:30 UTC the day before', () => {
    expect(istDayStart('2026-11-27').toISOString()).toBe('2026-11-26T18:30:00.000Z');
  });

  it('RT-13: the next and the day before, over a month, a year and a leap day', () => {
    expect(nextIstDay('2026-11-30')).toBe('2026-12-01');
    expect(nextIstDay('2026-12-31')).toBe('2027-01-01');
    expect(nextIstDay('2028-02-28')).toBe('2028-02-29');
    expect(nextIstDay('2028-02-29')).toBe('2028-03-01');
    expect(previousIstDay('2027-01-01')).toBe('2026-12-31');
    expect(previousIstDay('2028-03-01')).toBe('2028-02-29');
  });

  it('RT-13: a day that is not one is refused', () => {
    for (const day of ['2026-02-30', '2026-13-01', '26-11-27', '2026-11-27T00:00', '']) {
      expect(() => istDayStart(day)).toThrow(RangeError);
    }
  });

  it('RT-13: property: the start of a day is in that IST day, and the next day is a day later', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2000-01-01'), max: new Date('2099-12-31'), noInvalidDate: true }),
        (instant) => {
          const day = istDay(instant);
          const start = istDayStart(day);
          expect(istDay(start)).toBe(day);
          expect(istDay(new Date(start.getTime() - 1))).toBe(previousIstDay(day));
          expect(istDayStart(nextIstDay(day)).getTime() - start.getTime()).toBe(24 * 60 * 60_000);
        },
      ),
    );
  });
});
