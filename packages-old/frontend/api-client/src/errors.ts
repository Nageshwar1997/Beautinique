import { ApiError } from '@beautinique/shared-contracts';

const SOMETHING_WENT_WRONG = 'Something went wrong. Please try again.';
const OFFLINE = 'We could not reach Beautinique. Check your connection and try again.';
/** The words the account page uses for a server that did not answer (QA-FE-009). */
const SERVER_DID_NOT_ANSWER = 'The server did not answer. Please try again in a moment.';

/** `error` is an ApiError, with this code when one is given. */
export function isApiError(error: unknown, code?: string): error is ApiError {
  return error instanceof ApiError && (code === undefined || error.code === code);
}

/**
 * The sentence to show a person for a failed call. The server's messages are written for people
 * (RULES §4.15); the client's own ones are not: no answer, a proxy that answered for a server it
 * could not reach (QA-FE-007), any other answer that is not ours, or one that breaks the contract.
 */
export function errorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return SOMETHING_WENT_WRONG;
  if (error.code === 'NETWORK_ERROR') return OFFLINE;
  if (error.code === 'UPSTREAM_UNAVAILABLE') return SERVER_DID_NOT_ANSWER;
  if (
    error.code === 'UNEXPECTED_RESPONSE' ||
    error.code === 'INVALID_RESPONSE' ||
    error.message.trim() === ''
  ) {
    return SOMETHING_WENT_WRONG;
  }
  return error.message;
}
