import { assertValidDate } from './utils/assert-valid-date.ts';

// India has one time zone and no daylight saving: IST is always UTC+05:30.
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const IST = 'Asia/Kolkata';

// Timestamps are stored in UTC, but a "day" is the Indian calendar day (docs/ARCHITECTURE.md §4
// rule 5, §10.1 rule 7): an invoice made at 11:30 pm IST belongs to that day, not to the next UTC day.
/** The IST calendar day of `instant` as `YYYY-MM-DD`, the `istDay` field of a record. */
export function istDay(instant: Date): string {
  assertValidDate(instant, 'The instant');
  return new Date(instant.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

// Display text comes from `Intl` (en-IN) and is never built by hand (docs/RULES.md CR-30). The
// formatters are made once: building one is much slower than using it.
const DATE = new Intl.DateTimeFormat('en-IN', {
  timeZone: IST,
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
const TIME = new Intl.DateTimeFormat('en-IN', {
  timeZone: IST,
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

/** The IST date for people, like "21 Nov 2026" (docs/DESIGN.md DS-4.5). */
export function formatDate(instant: Date): string {
  assertValidDate(instant, 'The instant');
  return DATE.format(instant);
}

/** The IST time for people, like "2:30 pm" (docs/DESIGN.md DS-4.5). */
export function formatTime(instant: Date): string {
  assertValidDate(instant, 'The instant');
  return TIME.format(instant);
}
