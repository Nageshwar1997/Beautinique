import { assertValidDate } from './utils/assert-valid-date.ts';

// The port business code takes "now" from (docs/RULES.md RT-13): a service receives a `Clock` and
// never calls `Date.now()` or `new Date()` itself, so every time rule can be tested at any moment.
export interface Clock {
  /** The current instant (UTC). A new `Date` on every call, so a caller cannot change the clock. */
  now(): Date;
}

/** The real clock, for production wiring only. Tests use `createFakeClock`. */
export const systemClock: Clock = Object.freeze({ now: () => new Date() });

export interface FakeClock extends Clock {
  /** Jumps to `instant`, forwards or backwards. */
  set(instant: Date): void;
  /** Moves forward by `ms` milliseconds (never backwards: use `set` for that). */
  advance(ms: number): void;
}

// A clock that stands still until a test moves it. It has no default start on purpose: a default
// would be the real "now", and a test that depends on the real "now" is a flaky test (RT-25).
export function createFakeClock(start: Date): FakeClock {
  assertValidDate(start, 'The start of the fake clock');
  let current = start.getTime();
  return {
    now: () => new Date(current),
    set(instant) {
      assertValidDate(instant, 'The instant to set');
      current = instant.getTime();
    },
    advance(ms) {
      if (!Number.isFinite(ms) || ms < 0) {
        throw new RangeError('A fake clock only advances by a finite, non-negative number of ms.');
      }
      current += ms;
    },
  };
}
