import { iso, number, string, url, uuid } from 'zod';

/** Money in integer paise (₹1 = 100). Every amount in Beautinique is stored and sent this way. */
export const paiseZod = number()
  .int('Amount must be a whole number of paise')
  .nonnegative('Amount cannot be negative')
  .max(Number.MAX_SAFE_INTEGER);

/** Paise that may be negative: ledger entries, refunds, adjustments. */
export const signedPaiseZod = number()
  .int('Amount must be a whole number of paise')
  .min(Number.MIN_SAFE_INTEGER)
  .max(Number.MAX_SAFE_INTEGER);

/** A rate in basis points (1% = 100): GST rates, commissions, discounts. 0 to 10000. */
export const basisPointsZod = number()
  .int('Rate must be a whole number of basis points')
  .min(0, 'Rate cannot be negative')
  .max(10_000, 'Rate cannot be more than 100%');

/** MongoDB ObjectId (24 hex characters), stored in lower case. */
export const objectIdZod = string()
  .trim()
  .toLowerCase()
  .regex(/^[0-9a-f]{24}$/, 'Not a valid id');

/** Any RFC 9562 UUID. */
export const uuidZod = uuid('Not a valid UUID');

/** UUIDv7 (time-ordered): event ids, offline action ids. */
export const uuidv7Zod = uuid({ version: 'v7', error: 'Not a valid UUIDv7' });

/** URL slug: lower-case letters and digits in groups joined by single hyphens. */
export const slugZod = string()
  .trim()
  .min(1, 'Enter a slug')
  .max(120, 'Slug is too long')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lower-case letters, digits and single hyphens');

/** Colour as #RRGGBB (shade swatches), stored in upper case. */
export const hexColorZod = string()
  .trim()
  .toUpperCase()
  .regex(/^#[0-9A-F]{6}$/, 'Use a colour like #D6336C');

/** An https URL (links we show or fetch; plain http is refused). */
export const httpsUrlZod = url({ protocol: /^https$/, error: 'Enter an https:// link' });

/** Date and time in ISO 8601, UTC (`2026-10-20T07:56:26.899Z`). */
export const isoDateTimeZod = iso.datetime({ error: 'Use an ISO date-time in UTC' });

/** Calendar date in ISO 8601 (`2026-10-20`). */
export const isoDateZod = iso.date('Use a date like 2026-10-20');
