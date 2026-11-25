import { z } from 'zod';

// An Indian mobile number: 10 digits that start with 6, 7, 8 or 9, kept as +91 and the 10 digits.
const PHONE_FORMAT = /^\+91[6-9][0-9]{9}$/;

// People write the same number many ways: "98765 43210", "+91 98765 43210", "09876543210",
// "919876543210". Spaces and dashes go, and a +91, 91 or 0 in front of the 10 digits becomes +91.
// Anything else is left as it is, for the format check to refuse.
function toInternationalFormat(value: string): string {
  const compact = value.replaceAll(/[ -]/g, '');
  if (/^\+91[0-9]{10}$/.test(compact)) return compact;
  if (/^91[0-9]{10}$/.test(compact)) return `+${compact}`;
  if (/^0[0-9]{10}$/.test(compact)) return `+91${compact.slice(1)}`;
  if (/^[0-9]{10}$/.test(compact)) return `+91${compact}`;
  return compact;
}

/**
 * An Indian mobile number, as `+91` and 10 digits. Only the format is checked: a phone number is
 * for contact, and nothing is ever sent to it.
 */
export const phoneSchema = z
  .string()
  .trim()
  .overwrite(toInternationalFormat)
  .regex(PHONE_FORMAT, 'Enter a valid 10-digit mobile number.');
