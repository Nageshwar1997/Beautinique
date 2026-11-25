import { afterEach, describe, expect, it, vi } from 'vitest';

import { createFakeClock, systemClock } from '../src/clock.ts';

const START = new Date('2026-11-21T09:00:00.000Z');

afterEach(() => {
  vi.useRealTimers();
});

describe('systemClock', () => {
  it('RT-13: answers with the current instant, as a new Date every time', () => {
    vi.useFakeTimers();
    vi.setSystemTime(START);

    const first = systemClock.now();
    expect(first).toEqual(START);

    first.setUTCFullYear(2000);
    expect(systemClock.now()).toEqual(START);
    expect(systemClock.now()).not.toBe(systemClock.now());
  });

  it('RT-13: cannot be changed by the code that receives it', () => {
    expect(Object.isFrozen(systemClock)).toBe(true);
  });
});

describe('createFakeClock', () => {
  it('RT-13: stands still at its start until a test moves it', () => {
    const clock = createFakeClock(START);

    expect(clock.now()).toEqual(START);
    expect(clock.now()).toEqual(START);
  });

  it('RT-13: advance moves it forward by milliseconds', () => {
    const clock = createFakeClock(START);

    clock.advance(11 * 60 * 60 * 1000);
    expect(clock.now()).toEqual(new Date('2026-11-21T20:00:00.000Z'));

    clock.advance(0);
    expect(clock.now()).toEqual(new Date('2026-11-21T20:00:00.000Z'));
  });

  it('RT-13: set jumps to an instant, backwards too', () => {
    const clock = createFakeClock(START);

    clock.set(new Date('2027-01-01T00:00:00.000Z'));
    expect(clock.now()).toEqual(new Date('2027-01-01T00:00:00.000Z'));

    clock.set(new Date('2026-01-01T00:00:00.000Z'));
    expect(clock.now()).toEqual(new Date('2026-01-01T00:00:00.000Z'));
  });

  it('RT-13: a Date handed in or out never changes the clock', () => {
    const start = new Date(START);
    const clock = createFakeClock(start);
    start.setUTCFullYear(2000);
    expect(clock.now()).toEqual(START);

    clock.now().setUTCFullYear(2000);
    expect(clock.now()).toEqual(START);

    const instant = new Date('2026-12-01T00:00:00.000Z');
    clock.set(instant);
    instant.setUTCFullYear(2000);
    expect(clock.now()).toEqual(new Date('2026-12-01T00:00:00.000Z'));
  });

  it('RT-13: an invalid start or instant is refused', () => {
    const invalid = new Date('not a date');

    expect(() => createFakeClock(invalid)).toThrow(RangeError);
    expect(() => createFakeClock(invalid)).toThrow('The start of the fake clock');

    const clock = createFakeClock(START);
    expect(() => {
      clock.set(invalid);
    }).toThrow('The instant to set is not a valid date.');
    expect(clock.now()).toEqual(START);
  });

  it('RT-13: advance refuses a negative, infinite or missing number and keeps the time', () => {
    const clock = createFakeClock(START);

    for (const ms of [-1, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => {
        clock.advance(ms);
      }).toThrow(RangeError);
    }
    expect(clock.now()).toEqual(START);
  });
});
