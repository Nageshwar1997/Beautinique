/** Dates are stored in UTC and shown in India time. */
export const IST = 'Asia/Kolkata';

export type DateInput = Date | string | number;

function toDate(input: DateInput): Date {
  const date = input instanceof Date ? new Date(input.getTime()) : new Date(input);
  if (Number.isNaN(date.getTime())) {
    throw new RangeError(`Not a date: ${String(input)}`);
  }
  return date;
}

const formatters = new Map<string, Intl.DateTimeFormat>();
function formatter(
  key: string,
  timeZone: string,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const id = `${key}|${timeZone}`;
  let f = formatters.get(id);
  if (!f) {
    f = new Intl.DateTimeFormat('en-IN', { ...options, timeZone });
    formatters.set(id, f);
  }
  return f;
}

const DATE: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
const TIME: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true };

/** `20 Oct 2026` (India time unless `timeZone` says otherwise). */
export function formatDate(input: DateInput, options: { timeZone?: string } = {}): string {
  return formatter('date', options.timeZone ?? IST, DATE).format(toDate(input));
}

/** `1:26 pm` */
export function formatTime(input: DateInput, options: { timeZone?: string } = {}): string {
  return formatter('time', options.timeZone ?? IST, TIME).format(toDate(input));
}

/** `20 Oct 2026, 1:26 pm` */
export function formatDateTime(input: DateInput, options: { timeZone?: string } = {}): string {
  const date = toDate(input);
  return `${formatDate(date, options)}, ${formatTime(date, options)}`;
}

/**
 * The calendar day in India time as `YYYY-MM-DD`, for per-day rules (cut-offs, holidays, daily
 * limits): 2026-10-19T20:00Z is already `2026-10-20` in India.
 */
export function istDateKey(input: DateInput): string {
  const parts = formatter('key', IST, { year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(toDate(input))
    .reduce<Record<string, string>>((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});
  return `${parts.year ?? ''}-${parts.month ?? ''}-${parts.day ?? ''}`;
}
