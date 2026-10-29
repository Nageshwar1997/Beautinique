import { AppError } from '@beautinique/backend-server-kit';
import { IDENTITY_ERROR_CODES } from '@beautinique/shared-contracts';

/**
 * identity's errors, their English text in one place (RULES §4.15). None tells whether an email has
 * an account: an unknown one fails like a wrong code.
 */
export const otpExpired = (): AppError =>
  new AppError('OTP_EXPIRED', 'This code has expired. Ask for a new one.', {
    status: IDENTITY_ERROR_CODES.OTP_EXPIRED,
  });

export const otpInvalid = (triesLeft: number): AppError =>
  new AppError(
    'OTP_INVALID',
    triesLeft === 1
      ? 'That code is not right. You have 1 more try.'
      : `That code is not right. You have ${String(triesLeft)} more tries.`,
    { status: IDENTITY_ERROR_CODES.OTP_INVALID },
  );

export const otpResendTooSoon = (): AppError =>
  new AppError('OTP_RESEND_TOO_SOON', 'Please wait a minute before asking for a new code.', {
    status: IDENTITY_ERROR_CODES.OTP_RESEND_TOO_SOON,
  });

export const otpResendLimit = (): AppError =>
  new AppError('OTP_RESEND_LIMIT', 'No more new codes for this request. Start again.', {
    status: IDENTITY_ERROR_CODES.OTP_RESEND_LIMIT,
  });

export const otpEmailLimit = (): AppError =>
  new AppError(
    'OTP_EMAIL_LIMIT',
    'Too many codes were asked for this email. Please try again in an hour.',
    { status: IDENTITY_ERROR_CODES.OTP_EMAIL_LIMIT },
  );

/** Redis is away: no code can be kept, so none is sent (ARCHITECTURE §6.6). */
export const otpUnavailable = (cause: unknown): AppError =>
  new AppError(
    'SERVICE_UNAVAILABLE',
    'Sign-in codes are not available right now. Please try again in a little while.',
    {
      cause,
    },
  );

/** Wrong email, wrong password, or a locked account: one answer for all three (ARCHITECTURE §7.1). */
export const invalidCredentials = (): AppError =>
  new AppError('INVALID_CREDENTIALS', 'The email or password is not right.', {
    status: IDENTITY_ERROR_CODES.INVALID_CREDENTIALS,
  });

/** The new password is in a known data breach (Have I Been Pwned). */
export const passwordBreached = (): AppError =>
  new AppError(
    'PASSWORD_BREACHED',
    'This password has appeared in a data breach. Please choose another one.',
    {
      status: IDENTITY_ERROR_CODES.PASSWORD_BREACHED,
      details: [{ path: ['password'], message: 'Choose a password that has not been leaked' }],
    },
  );

/** The sign-in step is gone: expired, finished, or out of tries. */
export const loginExpired = (): AppError =>
  new AppError('LOGIN_EXPIRED', 'This sign-in has expired. Please sign in again.', {
    status: IDENTITY_ERROR_CODES.LOGIN_EXPIRED,
  });

export const totpInvalid = (triesLeft: number): AppError =>
  new AppError(
    'TOTP_INVALID',
    triesLeft === 1
      ? 'That authenticator code is not right. You have 1 more try.'
      : `That authenticator code is not right. You have ${String(triesLeft)} more tries.`,
    { status: IDENTITY_ERROR_CODES.TOTP_INVALID },
  );

export const recoveryCodeInvalid = (triesLeft: number): AppError =>
  new AppError(
    'RECOVERY_CODE_INVALID',
    triesLeft === 1
      ? 'That recovery code is not right, or was used already. You have 1 more try.'
      : `That recovery code is not right, or was used already. You have ${String(triesLeft)} more tries.`,
    { status: IDENTITY_ERROR_CODES.RECOVERY_CODE_INVALID },
  );

/** Too many passwords being checked at once (one at a time on the free server, ARCHITECTURE §11.1). */
export const passwordsBusy = (): AppError =>
  new AppError('SERVICE_UNAVAILABLE', 'Too many sign-ins right now. Please try again in a moment.');

/** Redis is away: wrong tries cannot be counted, so no sign-in goes on (ARCHITECTURE §6.6). */
export const signInUnavailable = (cause: unknown): AppError =>
  new AppError(
    'SERVICE_UNAVAILABLE',
    'Sign-in is not available right now. Please try again in a little while.',
    { cause },
  );

/** A step-up needs an authenticator, and the account has none. */
export const authenticatorRequired = (): AppError =>
  new AppError('AUTHENTICATOR_REQUIRED', 'Set up an authenticator app first, then try again.', {
    status: IDENTITY_ERROR_CODES.AUTHENTICATOR_REQUIRED,
  });

/** A wrong (or used) authenticator code at a step-up. */
export const stepUpCodeInvalid = (): AppError =>
  new AppError('TOTP_INVALID', 'That authenticator code is not right.', {
    status: IDENTITY_ERROR_CODES.TOTP_INVALID,
  });

/** Too many wrong codes or passwords for this account lately: wait for the lock to end. */
export const stepUpLocked = (): AppError =>
  new AppError('TOTP_INVALID', 'Too many wrong codes. Please try again in an hour.', {
    status: IDENTITY_ERROR_CODES.TOTP_INVALID,
  });
