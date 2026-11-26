import { COMMON_ERRORS, errorBodySchema } from '@beautinique/shared-contracts';
import { describe, expect, it } from 'vitest';

import {
  AppError,
  errorBody,
  forbidden,
  idempotencyInProgress,
  idempotencyKeyReused,
  internalError,
  notFound,
  payloadTooLarge,
  rateLimited,
  serviceUnavailable,
  stepUpRequired,
  toAppError,
  unauthenticated,
  validationFailed,
} from '../src/errors.ts';

describe('the errors of the kit (docs/ARCHITECTURE.md §5 rules 8 and 9)', () => {
  const made = [
    validationFailed([{ path: 'body.email', message: 'email is required.' }]),
    unauthenticated(),
    forbidden(),
    stepUpRequired(),
    notFound(),
    payloadTooLarge(),
    idempotencyInProgress(),
    idempotencyKeyReused(),
    rateLimited(7),
    serviceUnavailable(5),
    internalError(),
  ];

  it('CR-18: each one has the code and the status of the common codes of the contracts', () => {
    for (const error of made) {
      expect(error.status, error.code).toBe(
        COMMON_ERRORS[error.code as keyof typeof COMMON_ERRORS],
      );
    }
    expect(made.map((error) => error.code)).toEqual([
      'VALIDATION_FAILED',
      'UNAUTHENTICATED',
      'FORBIDDEN',
      'STEP_UP_REQUIRED',
      'NOT_FOUND',
      'PAYLOAD_TOO_LARGE',
      'IDEMPOTENCY_IN_PROGRESS',
      'IDEMPOTENCY_KEY_REUSED',
      'RATE_LIMITED',
      'SERVICE_UNAVAILABLE',
      'INTERNAL',
    ]);
  });

  it('SR-008: a 429 and a 503 say when to come back', () => {
    expect(rateLimited(7).retryAfterSeconds).toBe(7);
    expect(serviceUnavailable(5).retryAfterSeconds).toBe(5);
    expect(notFound().retryAfterSeconds).toBeUndefined();
  });

  it('CR-18: the body is the one error shape of the contracts, with the request id', () => {
    for (const error of made) {
      const body = errorBody(error, 'req-1');

      expect(errorBodySchema.safeParse(body).success, error.code).toBe(true);
      // As it is on the wire: a key that is undefined is gone from the JSON, and the client needs it.
      expect(errorBodySchema.safeParse(JSON.parse(JSON.stringify(body))).success, error.code).toBe(
        true,
      );
      expect(body.error.requestId).toBe('req-1');
    }
    expect(errorBody(made[0] as AppError, 'req-1').error.details).toEqual({
      issues: [{ path: 'body.email', message: 'email is required.' }],
    });
  });

  it('SR-077: what is thrown that is not an AppError answers 500 and says nothing of itself', () => {
    const answer = toAppError(new Error('connect ECONNREFUSED 10.0.0.5:27017 password=hunter2'));

    expect(answer.status).toBe(500);
    expect(JSON.stringify(errorBody(answer, 'req-1'))).not.toContain('hunter2');
    expect(JSON.stringify(errorBody(answer, 'req-1'))).not.toContain('ECONNREFUSED');
    expect(toAppError('a string').code).toBe('INTERNAL');
    expect(toAppError(undefined).code).toBe('INTERNAL');
  });

  it('CR-18: an AppError of a service keeps its own code, status and details', () => {
    const own = new AppError({
      status: 409,
      code: 'COMMERCE_STOCK_UNAVAILABLE',
      message: 'Not enough stock.',
      details: { variantId: 'v1' },
    });

    expect(toAppError(own)).toBe(own);
    expect(errorBody(own, 'req-2').error).toEqual({
      code: 'COMMERCE_STOCK_UNAVAILABLE',
      message: 'Not enough stock.',
      details: { variantId: 'v1' },
      requestId: 'req-2',
    });
  });
});
