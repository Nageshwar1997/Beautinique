import { describe, expect, it } from 'vitest';

import { ApiError, errorMessage, isApiError } from '../src/index';

const apiError = (code: string, message: string, status = 400) =>
  new ApiError({ code, message, status });

describe('errorMessage', () => {
  it('shows the server’s message, which is written for people', () => {
    expect(errorMessage(apiError('OTP_INVALID', 'That code is not right.'))).toBe(
      'That code is not right.',
    );
  });

  it('says the connection failed when there was no answer', () => {
    expect(errorMessage(apiError('NETWORK_ERROR', 'The server could not be reached', 0))).toBe(
      'We could not reach Beautinique. Check your connection and try again.',
    );
  });

  it('hides the client’s own technical messages and anything that is not an ApiError', () => {
    const fallback = 'Something went wrong. Please try again.';
    expect(errorMessage(apiError('INVALID_RESPONSE', 'The response does not match x', 200))).toBe(
      fallback,
    );
    expect(errorMessage(apiError('INTERNAL', '  ', 500))).toBe(fallback);
    expect(errorMessage(new Error('boom'))).toBe(fallback);
    expect(errorMessage('boom')).toBe(fallback);
  });
});

describe('isApiError', () => {
  it('checks the class, and the code when one is given', () => {
    const error = apiError('OTP_INVALID', 'Wrong code');
    expect(isApiError(error)).toBe(true);
    expect(isApiError(error, 'OTP_INVALID')).toBe(true);
    expect(isApiError(error, 'OTP_EXPIRED')).toBe(false);
    expect(isApiError(new Error('x'))).toBe(false);
  });
});
