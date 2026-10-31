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

/** A wrong (or used) recovery code at a step-up. */
export const stepUpRecoveryInvalid = (): AppError =>
  new AppError('RECOVERY_CODE_INVALID', 'That recovery code is not right, or was used already.', {
    status: IDENTITY_ERROR_CODES.RECOVERY_CODE_INVALID,
  });

/** An authenticator was saved meanwhile (another tab): replacing it needs a step-up first. */
export const authenticatorExists = (): AppError =>
  new AppError(
    'AUTHENTICATOR_EXISTS',
    'You already have an authenticator. Confirm with it (or a recovery code) to replace it.',
    { status: IDENTITY_ERROR_CODES.AUTHENTICATOR_EXISTS },
  );

/** The set-up is gone: expired, finished or out of tries. */
export const authenticatorSetupExpired = (): AppError =>
  new AppError(
    'AUTHENTICATOR_SETUP_EXPIRED',
    'This authenticator set-up has expired. Please start again.',
    { status: IDENTITY_ERROR_CODES.AUTHENTICATOR_SETUP_EXPIRED },
  );

/**
 * Turning the authenticator off while roles need it: their names (and apps) in the message and
 * `details`, for the person themself (signed in, stepped up).
 */
export const authenticatorRequiredByRole = (roles: { name: string; app: string }[]): AppError =>
  new AppError(
    'AUTHENTICATOR_REQUIRED_BY_ROLE',
    `Your ${roles.map((r) => `${r.name} role in the ${r.app} app`).join(', ')} ${roles.length === 1 ? 'needs' : 'need'} an authenticator, so it can't be turned off.`,
    {
      status: IDENTITY_ERROR_CODES.AUTHENTICATOR_REQUIRED_BY_ROLE,
      details: roles.map((r) => ({ path: ['roles', r.app], message: r.name })),
    },
  );

/** An account without a password (made with Google ...) sets one before an authenticator. */
export const passwordRequired = (): AppError =>
  new AppError(
    'PASSWORD_REQUIRED',
    'Set a password for your account first, then set up the authenticator.',
    { status: IDENTITY_ERROR_CODES.PASSWORD_REQUIRED },
  );

/** A wrong password while signed in. */
export const passwordInvalid = (): AppError =>
  new AppError('PASSWORD_INVALID', 'That password is not right.', {
    status: IDENTITY_ERROR_CODES.PASSWORD_INVALID,
    details: [{ path: ['password'], message: 'That password is not right' }],
  });

/** Too many wrong codes or passwords for this account lately: wait for the lock to end. */
export const stepUpLocked = (): AppError =>
  new AppError('TOTP_INVALID', 'Too many wrong codes. Please try again in an hour.', {
    status: IDENTITY_ERROR_CODES.TOTP_INVALID,
  });
