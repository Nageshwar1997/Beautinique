import * as z from 'zod';

const BASE36 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Indian mobile number. Accepts what people type (`+91 98765 43210`, `098765-43210`, `(987) 654 3210`)
 * and outputs the 10 digits (`9876543210`). Mobile numbers start with 6, 7, 8 or 9.
 */
export const mobileNumber = z
  .string()
  .transform((value) => {
    const digits = value.replace(/[\s\-().]/g, '');
    if (/^\+91\d{10}$/.test(digits)) return digits.slice(3);
    if (/^91\d{10}$/.test(digits)) return digits.slice(2);
    if (/^0\d{10}$/.test(digits)) return digits.slice(1);
    return digits;
  })
  .pipe(z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'));

/** India Post PIN code: 6 digits, never starting with 0. */
export const pincode = z
  .string()
  .trim()
  .regex(/^[1-9]\d{5}$/, 'Enter a valid 6-digit PIN code');

/**
 * PAN: 5 letters, 4 digits, 1 letter; the 4th letter is the holder type (P person, C company,
 * F firm, H HUF, A AOP, B BOI, G government, J artificial juridical person, L local authority, T trust).
 */
export const pan = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{3}[ABCFGHJLPT][A-Z]\d{4}[A-Z]$/, 'Enter a valid PAN');

/**
 * The GSTIN check digit (15th character) for the first 14 characters: each character's base-36 value
 * is multiplied by 1 and 2 in turn, the quotient and remainder of each product by 36 are added, and
 * the check digit is (36 - sum mod 36) mod 36.
 */
export function gstinCheckDigit(first14: string): string {
  let sum = 0;
  for (let i = 0; i < 14; i += 1) {
    const value = BASE36.indexOf(first14.charAt(i));
    if (value < 0) {
      throw new RangeError(`Not a GSTIN character: "${first14.charAt(i)}"`);
    }
    const product = value * (i % 2 === 0 ? 1 : 2);
    sum += Math.floor(product / 36) + (product % 36);
  }
  return BASE36.charAt((36 - (sum % 36)) % 36);
}

/** GST state codes: 01-38, 97 (other territory) and 99 (centre jurisdiction). */
const isGstStateCode = (code: number) => (code >= 1 && code <= 38) || code === 97 || code === 99;

/**
 * GSTIN: state code + PAN + entity number + `Z` + check digit, and the check digit must match.
 * Lower case is accepted and upper-cased.
 */
export const gstin = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^\d{2}[A-Z]{3}[ABCFGHJLPT][A-Z]\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/, 'Enter a valid GSTIN')
  .refine((value) => isGstStateCode(Number(value.slice(0, 2))), 'GSTIN state code is not valid')
  .refine(
    (value) => gstinCheckDigit(value.slice(0, 14)) === value.charAt(14),
    'GSTIN check digit does not match; check for a typing mistake',
  );

/** IFSC: 4 letters (bank), 0, then 6 letters or digits (branch). */
export const ifsc = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Enter a valid IFSC');

/** Bank account number: 9 to 18 digits. */
export const bankAccountNumber = z
  .string()
  .trim()
  .regex(/^\d{9,18}$/, 'Enter a valid account number (9 to 18 digits)');

/** UPI ID (VPA), e.g. `name@okhdfcbank`; stored in lower case. */
export const upiId = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9][a-z0-9._-]{1,255}@[a-z][a-z0-9]{1,63}$/, 'Enter a valid UPI ID');
