import { ApiError } from '@beautinique/shared-contracts';

const SOMETHING_WENT_WRONG = 'Something went wrong. Please try again.';
const OFFLINE = 'We could not reach Beautinique. Check your connection and try again.';

/** `error` is an ApiError, with this code when one is given. */
export function isApiError(error: unknown, code?: string): error is ApiError {
  return error instanceof ApiError && (code === undefined || error.code === code);
}

/**
 * The sentence to show a person for a failed call. The server's messages are written for people
 * (RULES §4.15); the client's own ones (no answer, an answer that breaks the contract) are not.
 */
export function errorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return SOMETHING_WENT_WRONG;
  if (error.code === 'NETWORK_ERROR') return OFFLINE;
  if (error.code === 'INVALID_RESPONSE' || error.message.trim() === '') return SOMETHING_WENT_WRONG;
  return error.message;
}
