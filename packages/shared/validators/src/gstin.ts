import { z } from 'zod';

import { PAN_FORMAT } from './pan.ts';

// Digits, then capital letters: the value of a character is its place in this string.
const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BODY = /^[0-9A-Z]{14}$/;
// State (2 digits), the holder's PAN (10), the number of the registration under that PAN (1 to 9,
// then A to Z), the letter Z, and the check character.
const GSTIN_FORMAT = /^\d{2}[0-9A-Z]{10}[1-9A-Z]Z[0-9A-Z]$/;

// 01 to 38 are the states and union territories, 97 is "other territory" and 99 is the centre.
function isStateCode(code: string): boolean {
  const number = Number(code);
  return (number >= 1 && number <= 38) || number === 97 || number === 99;
}

/**
 * The check character of a GSTIN: the 14 characters before it, run through the Luhn mod 36
 * algorithm that the GST network uses. Useful to make a valid GSTIN for seed data and tests.
 */
export function gstinCheckCharacter(body: string): string {
  if (!BODY.test(body)) {
    throw new RangeError('The first 14 characters of a GSTIN are digits and capital letters.');
  }
  let sum = 0;
  for (let index = 0; index < body.length; index += 1) {
    const product = ALPHABET.indexOf(body.charAt(index)) * (index % 2 === 0 ? 1 : 2);
    sum += Math.floor(product / 36) + (product % 36);
  }
  return ALPHABET.charAt((36 - (sum % 36)) % 36);
}

function hasGstinFormat(value: string): boolean {
  return (
    GSTIN_FORMAT.test(value) &&
    isStateCode(value.slice(0, 2)) &&
    PAN_FORMAT.test(value.slice(2, 12))
  );
}

function hasRightCheckCharacter(value: string): boolean {
  return gstinCheckCharacter(value.slice(0, 14)) === value.slice(14);
}

/**
 * A GSTIN, trimmed and in capitals: the format, a real state code, the holder's PAN and the check
 * character. A wrong check character gets its own message, because it is usually one typo.
 */
export const gstinSchema = z
  .string()
  .trim()
  .toUpperCase()
  .refine(hasGstinFormat, { error: 'Enter a valid GSTIN.', abort: true })
  .refine(
    hasRightCheckCharacter,
    'The last character of this GSTIN does not match the rest. Check it for a typo.',
  );
