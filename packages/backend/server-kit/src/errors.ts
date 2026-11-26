import { COMMON_ERRORS, type ErrorBody, type ErrorStatus } from '@beautinique/shared-contracts';

export interface AppErrorInit {
  status: ErrorStatus;
  /** Stable, in capitals: a common code, or one of the service (`COMMERCE_STOCK_UNAVAILABLE`). */
  code: string;
  /** For the person, in plain words (docs/ARCHITECTURE.md §5 rule 8). */
  message: string;
  details?: unknown;
  /** For a 429 or a 503: when to come back. */
  retryAfterSeconds?: number;
}

/**
 * An error that a route answers with: its status, its code and a message for the person, and
 * nothing else. What is thrown that is not an `AppError` answers 500 and says nothing of itself
 * (SR-077).
 */
export class AppError extends Error {
  readonly status: ErrorStatus;
  readonly code: string;
  readonly details: unknown;
  readonly retryAfterSeconds: number | undefined;

  constructor(init: AppErrorInit) {
    super(init.message);
    this.name = 'AppError';
    this.status = init.status;
    this.code = init.code;
    this.details = init.details;
    this.retryAfterSeconds = init.retryAfterSeconds;
  }
}

/** One field of a request that was refused, and why. The message never holds the value (CR-22). */
export interface FieldIssue {
  path: string;
  message: string;
}

type CommonCode = keyof typeof COMMON_ERRORS;

function common(
  code: CommonCode,
  message: string,
  extra: { details?: unknown; retryAfterSeconds?: number } = {},
): AppError {
  return new AppError({ status: COMMON_ERRORS[code], code, message, ...extra });
}

export const validationFailed = (issues: readonly FieldIssue[]): AppError =>
  common('VALIDATION_FAILED', 'The request is not valid.', { details: { issues } });
export const unauthenticated = (): AppError => common('UNAUTHENTICATED', 'Sign in to continue.');
export const forbidden = (): AppError => common('FORBIDDEN', 'You are not allowed to do this.');
export const stepUpRequired = (): AppError =>
  common('STEP_UP_REQUIRED', 'Enter your authenticator code to continue.');
export const notFound = (): AppError => common('NOT_FOUND', 'This was not found.');
export const payloadTooLarge = (): AppError =>
  common('PAYLOAD_TOO_LARGE', 'The request is too large.');
export const idempotencyInProgress = (): AppError =>
  common('IDEMPOTENCY_IN_PROGRESS', 'The same request is still being handled.');
export const idempotencyKeyReused = (): AppError =>
  common('IDEMPOTENCY_KEY_REUSED', 'This idempotency key was used for a different request.');
export const rateLimited = (retryAfterSeconds: number): AppError =>
  common('RATE_LIMITED', 'Too many requests. Try again in a little while.', { retryAfterSeconds });
export const serviceUnavailable = (retryAfterSeconds: number): AppError =>
  common('SERVICE_UNAVAILABLE', 'The service is busy. Try again in a moment.', {
    retryAfterSeconds,
  });
export const internalError = (): AppError => common('INTERNAL', 'Something went wrong.');

/**
 * The body of an error answer: `{ error: { code, message, details, requestId } }`. `details` is always
 * there (`null` when there is nothing), because a key that is `undefined` is not in the JSON, and
 * the contracts' `errorBodySchema` (so the typed client) refuses a body without it.
 */
export function errorBody(error: AppError, requestId: string): ErrorBody {
  return {
    error: { code: error.code, message: error.message, details: error.details ?? null, requestId },
  };
}

/** What a thrown value answers with: an `AppError` as it is, anything else as a 500 that says nothing of it. */
export function toAppError(thrown: unknown): AppError {
  return thrown instanceof AppError ? thrown : internalError();
}
