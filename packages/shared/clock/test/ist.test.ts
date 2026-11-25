import { describe, expect, it } from 'vitest';

import { formatDate, formatTime, istDay } from '../src/ist.ts';

const INVALID = new Date('not a date');

describe('istDay', () => {
  it('RT-13: is the IST calendar day, not the UTC one', () => {
    expect(istDay(new Date('2026-11-21T09:00:00.000Z'))).toBe('2026-11-21');
    // 11:30 pm IST on 21 Nov is still 21 Nov, though UTC is already 18:00 of the same day.
    expect(istDay(new Date('2026-11-21T18:00:00.000Z'))).toBe('2026-11-21');
    // 01:30 am IST on 22 Nov, while UTC is still 21 Nov.
    expect(istDay(new Date('2026-11-21T20:00:00.000Z'))).toBe('2026-11-22');
  });

  it('RT-13: changes exactly at midnight IST (18:30 UTC)', () => {
    expect(istDay(new Date('2026-11-21T18:29:59.999Z'))).toBe('2026-11-21');
    expect(istDay(new Date('2026-11-21T18:30:00.000Z'))).toBe('2026-11-22');
  });

  it('RT-13: crosses a month, a year and a leap day', () => {
    expect(istDay(new Date('2026-11-30T18:30:00.000Z'))).toBe('2026-12-01');
    expect(istDay(new Date('2026-12-31T18:30:00.000Z'))).toBe('2027-01-01');
    expect(istDay(new Date('2028-02-28T18:30:00.000Z'))).toBe('2028-02-29');
    expect(istDay(new Date('2027-02-28T18:30:00.000Z'))).toBe('2027-03-01');
  });

  it('RT-13: refuses an invalid Date', () => {
    expect(() => istDay(INVALID)).toThrow(RangeError);
  });
});

describe('formatDate and formatTime', () => {
  it('DS-4.5: the date reads like "21 Nov 2026", in IST', () => {
    expect(formatDate(new Date('2026-11-21T09:00:00.000Z'))).toBe('21 Nov 2026');
    // 01:30 am IST on 22 Nov: the Indian date, not the UTC one.
    expect(formatDate(new Date('2026-11-21T20:00:00.000Z'))).toBe('22 Nov 2026');
    expect(formatDate(new Date('2027-01-05T09:00:00.000Z'))).toBe('5 Jan 2027');
  });

  it('DS-4.5: the time reads like "2:30 pm", in IST', () => {
    expect(formatTime(new Date('2026-11-21T09:00:00.000Z'))).toBe('2:30 pm');
    expect(formatTime(new Date('2026-11-21T18:29:00.000Z'))).toBe('11:59 pm');
    expect(formatTime(new Date('2026-11-21T18:30:00.000Z'))).toBe('12:00 am');
    expect(formatTime(new Date('2026-11-21T06:30:00.000Z'))).toBe('12:00 pm');
    expect(formatTime(new Date('2026-11-21T03:35:00.000Z'))).toBe('9:05 am');
  });

  it('DS-4.5: refuses an invalid Date instead of printing "Invalid Date"', () => {
    expect(() => formatDate(INVALID)).toThrow('The instant is not a valid date.');
    expect(() => formatTime(INVALID)).toThrow('The instant is not a valid date.');
  });
});
