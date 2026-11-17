import { email, string } from 'zod';

/** Email address, trimmed and stored in lower case. */
export const emailZod = string('Email is required')
  .trim()
  .nonempty('Enter your email address')
  .toLowerCase()
  .max(254, 'Email address is too long')
  .pipe(email('Enter a valid email address'));

/** One-time code: 6 digits (email OTP and authenticator app codes). */
export const otpZod = string('Code is required')
  .trim()
  .regex(/^\d{6}$/, 'Enter the 6-digit code');

/**
 * Password, following NIST SP 800-63B: at least 12 characters (owner, ARCHITECTURE §7.1), up to
 * 128, any characters, no forced mix of character types. Spaces at the start and end are not part
 * of it (owner, 2026-10-27), so sign-in trims the same way. Checking it against known breached
 * passwords is the server's job.
 */
export const passwordZod = string('Password is required')
  .trim()
  .nonempty('Enter a password')
  .min(12, 'Use at least 12 characters')
  .max(128, 'Use at most 128 characters');

/**
 * A person's name as written: letters (any script's letters and accents), spaces, dots, apostrophes
 * and hyphens, starting with a letter. Trimmed, extra spaces collapsed. 1 to 100 characters.
 */
export const personNameZod = string('Name is required')
  .trim()
  .overwrite((value) => value.replace(/\s+/g, ' '))
  .nonempty('Enter a name')
  .max(100, 'Name is too long')
  .regex(/^\p{L}[\p{L}\p{M} .'-]*$/u, 'Use letters, spaces, dots, apostrophes and hyphens');
