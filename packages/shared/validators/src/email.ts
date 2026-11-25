import { z } from 'zod';

// RFC 5321: an address is at most 254 characters.
const MAX_LENGTH = 254;

/**
 * An email address, trimmed and in small letters, so that "Asha@Example.com" and "asha@example.com"
 * are one address. Only the format is checked: whether the mailbox exists is for a mail to prove.
 */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(MAX_LENGTH, 'Enter a valid email address.')
  .pipe(z.email('Enter a valid email address.'));
