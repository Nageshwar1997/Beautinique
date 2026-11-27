import { randomBytes, randomInt } from 'node:crypto';

import { toBase64url } from './utils/base64url.ts';

// Random values for codes and tokens, from the operating system's secure source: never
// `Math.random` (docs/ARCHITECTURE.md §10.3 rule 7).

const MIN_TOKEN_BYTES = 16;
const MAX_TOKEN_BYTES = 1024;
const MIN_DIGITS = 4;
const MAX_DIGITS = 12;

/** `bytes` random bytes (16 to 1024, 32 by default) in base64url: an invite link's token. */
export function randomToken(bytes = 32): string {
  if (!Number.isInteger(bytes) || bytes < MIN_TOKEN_BYTES || bytes > MAX_TOKEN_BYTES) {
    throw new RangeError(
      `A token is ${String(MIN_TOKEN_BYTES)} to ${String(MAX_TOKEN_BYTES)} random bytes.`,
    );
  }
  return toBase64url(randomBytes(bytes));
}

/** `count` random digits (4 to 12), every one equally likely, leading zeros kept: an OTP. */
export function randomDigits(count: number): string {
  if (!Number.isInteger(count) || count < MIN_DIGITS || count > MAX_DIGITS) {
    throw new RangeError(`A code is ${String(MIN_DIGITS)} to ${String(MAX_DIGITS)} digits.`);
  }
  return String(randomInt(0, 10 ** count)).padStart(count, '0');
}
