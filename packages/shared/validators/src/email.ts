import { email, string } from 'zod';

// RFC 5321: an address is at most 254 characters.
const MAX_LENGTH = 254;

/**
 * An email address, trimmed and in small letters, so that "Asha@Example.com" and "asha@example.com"
 * are one address. Only the format is checked: whether the mailbox exists is for a mail to prove.
 */
export const emailSchema = string('Email is required.')
  .trim()
  .min(1, 'Email is required.')
  .toLowerCase()
  .max(MAX_LENGTH, `Email must be at most ${String(MAX_LENGTH)} characters.`)
  .pipe(email('Email must be a valid email address.'));
