import { email, string } from 'zod';

/** Email address, trimmed and stored in lower case. */
export const emailZod = string()
  .trim()
  .toLowerCase()
  .max(254, 'Email address is too long')
  .pipe(email('Enter a valid email address'));

/** One-time code: 6 digits (email OTP and authenticator app codes). */
export const otpZod = string()
  .trim()
  .regex(/^\d{6}$/, 'Enter the 6-digit code');

/**
 * Password, following NIST SP 800-63B: at least 8 characters, up to 128, any characters (spaces
 * too), and no forced mix of character types. Never trimmed: what the user typed is the password.
 * Checking it against known breached passwords is the server's job.
 */
export const passwordZod = string()
  .min(8, 'Use at least 8 characters')
  .max(128, 'Use at most 128 characters')
  .refine((value) => value.trim().length > 0, 'Password cannot be only spaces');

/**
 * A person's name as written: letters (any script's letters and accents), spaces, dots, apostrophes
 * and hyphens, starting with a letter. Extra spaces are collapsed. 1 to 100 characters.
 */
export const personNameZod = string()
  .transform((value) => value.trim().replace(/\s+/g, ' '))
  .pipe(
    string()
      .min(1, 'Enter a name')
      .max(100, 'Name is too long')
      .regex(/^\p{L}[\p{L}\p{M} .'-]*$/u, 'Use letters, spaces, dots, apostrophes and hyphens'),
  );
