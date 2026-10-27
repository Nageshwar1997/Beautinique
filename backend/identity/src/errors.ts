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
