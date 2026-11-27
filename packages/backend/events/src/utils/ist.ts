// IST is UTC+05:30 all the year (no summer time).
const IST_OFFSET_MS = (5 * 60 + 30) * 60_000;
const DAY_MS = 24 * 60 * 60_000;
const DAY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** The UTC instant at which an IST calendar day (`YYYY-MM-DD`) begins. */
export function istDayStart(day: string): Date {
  const match = DAY.exec(day);
  const start =
    match === null
      ? Number.NaN
      : Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (Number.isNaN(start) || new Date(start).toISOString().slice(0, 10) !== day) {
    throw new RangeError('A day is YYYY-MM-DD, and a day of the calendar.');
  }
  return new Date(start - IST_OFFSET_MS);
}

/** The IST calendar day after `day`. */
export function nextIstDay(day: string): string {
  return new Date(istDayStart(day).getTime() + IST_OFFSET_MS + DAY_MS).toISOString().slice(0, 10);
}

/** The IST calendar day before `day`. */
export function previousIstDay(day: string): string {
  return new Date(istDayStart(day).getTime() + IST_OFFSET_MS - DAY_MS).toISOString().slice(0, 10);
}
