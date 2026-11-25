# @beautinique/shared-clock

Injected clock and IST date helpers for business code, with a fake clock for tests and en-IN date and time formatting.

## Install

```sh
npm install @beautinique/shared-clock
```

## Usage

Business code never calls `Date.now()` or `new Date()`. It receives a `Clock` and asks it for "now", so a test can put the clock at any moment.

```ts
import {
  createFakeClock,
  formatDate,
  istDay,
  systemClock,
  type Clock,
} from '@beautinique/shared-clock';

function isExpired(expiresAt: Date, clock: Clock): boolean {
  return clock.now() >= expiresAt;
}

// Production wiring: the real clock.
isExpired(new Date('2026-11-21T09:00:00.000Z'), systemClock);

// A test: the clock stands still until the test moves it.
const clock = createFakeClock(new Date('2026-11-21T09:00:00.000Z'));
clock.advance(11 * 60 * 60 * 1000);

istDay(clock.now()); // '2026-11-21'
formatDate(clock.now()); // '21 Nov 2026'
```

## API

- `Clock`: `now(): Date`, the current instant. A new `Date` on every call.
- `systemClock`: the real `Clock`, for production wiring only.
- `createFakeClock(start)`: a `FakeClock` that stands still at `start` until moved. `advance(ms)` moves it forward (a finite, non-negative number), `set(instant)` jumps to any instant. It has no default start, because a default would be the real "now".
- `istDay(instant)`: the Indian calendar day as `YYYY-MM-DD`. A timestamp is kept in UTC, but a day is an IST day: 11:30 pm IST on 21 Nov is `2026-11-21`, though UTC is already 18:00 of the same day.
- `formatDate(instant)`: the date for people in IST, like `21 Nov 2026`.
- `formatTime(instant)`: the time for people in IST, like `2:30 pm`.

An invalid `Date` throws a `RangeError` everywhere. The date and time text comes from `Intl` with the `en-IN` locale, so the month names are the ones of that locale on your Node version (for example `Sept`).

## Visibility

Public is fine. Nothing here is specific to Beautinique: an injectable clock, the IST calendar day and the en-IN date and time format are general-purpose code and give an attacker no map of the product. Every package is published publicly; this is only to understand it (docs/RULES.md CR-36).
