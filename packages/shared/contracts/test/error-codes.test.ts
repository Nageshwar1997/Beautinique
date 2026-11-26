import { describe, expect, expectTypeOf, it } from 'vitest';

import { COMMON_ERRORS, defineErrors, ERROR_STATUSES, errorBodySchema } from '../src/index.ts';

describe('the common error codes', () => {
  it('CR-18: have the statuses of docs/ARCHITECTURE.md §5 rule 9', () => {
    expect(COMMON_ERRORS).toMatchObject({
      VALIDATION_FAILED: 400,
      UNAUTHENTICATED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      CONFLICT: 409,
      IDEMPOTENCY_IN_PROGRESS: 409,
      PAYLOAD_TOO_LARGE: 413,
      UNPROCESSABLE: 422,
      IDEMPOTENCY_KEY_REUSED: 422,
      APP_VERSION_TOO_OLD: 426,
      RATE_LIMITED: 429,
      SERVICE_UNAVAILABLE: 503,
    });
    for (const status of Object.values(COMMON_ERRORS)) {
      expect(ERROR_STATUSES).toContain(status);
    }
  });
});

describe('defineErrors', () => {
  it('CR-18: puts the name of the service in front of each code', () => {
    const errors = defineErrors('commerce', { STOCK_UNAVAILABLE: 409, ORDER_CLOSED: 422 });

    expect(errors).toEqual({ COMMERCE_STOCK_UNAVAILABLE: 409, COMMERCE_ORDER_CLOSED: 422 });
    expect(Object.isFrozen(errors)).toBe(true);
    expectTypeOf(errors.COMMERCE_STOCK_UNAVAILABLE).toEqualTypeOf<409>();
  });

  it('CR-18: two services never share a code', () => {
    const left = defineErrors('catalog', { NOT_APPROVED: 422 });
    const right = defineErrors('commerce', { NOT_APPROVED: 422 });

    expect(Object.keys(left)).not.toEqual(Object.keys(right));
  });

  it('CR-18: a code is in capitals, digits and _, and has a status of the list', () => {
    expect(() => defineErrors('commerce', { stockUnavailable: 409 })).toThrow('capitals');
    expect(() => defineErrors('commerce', { '1_STOCK': 409 })).toThrow('capitals');
    expect(() => defineErrors('commerce', { STOCK_UNAVAILABLE: 418 as never })).toThrow(
      'status that is not in the list',
    );
    expect(defineErrors('commerce', {})).toEqual({});
  });
});

describe('errorBodySchema', () => {
  const body = {
    error: {
      code: 'COMMERCE_STOCK_UNAVAILABLE',
      message: 'Out of stock.',
      details: null,
      requestId: 'req_1',
    },
  };

  it('CR-18: is { error: { code, message, details, requestId } } and nothing else', () => {
    expect(errorBodySchema.safeParse(body).success).toBe(true);
    expect(errorBodySchema.safeParse({ error: { ...body.error, stack: 'at x' } }).success).toBe(
      false,
    );
    expect(errorBodySchema.safeParse({ ...body, extra: 1 }).success).toBe(false);
  });

  it('CR-18: the code is in capitals and the request id is not empty', () => {
    expect(errorBodySchema.safeParse({ error: { ...body.error, code: 'stock' } }).success).toBe(
      false,
    );
    expect(errorBodySchema.safeParse({ error: { ...body.error, requestId: '' } }).success).toBe(
      false,
    );
  });

  it('CR-18: says what is wrong, by the name of the field', () => {
    const messages = (value: unknown) =>
      errorBodySchema.safeParse(value).error?.issues.map((issue) => issue.message);

    expect(messages({ error: { ...body.error, code: undefined } })).toEqual(['code is required.']);
    expect(messages({ error: { ...body.error, code: 'stock' } })).toEqual([
      'code must be in capitals, digits and _, and start with a letter.',
    ]);
    expect(messages({ error: { ...body.error, message: undefined } })).toEqual([
      'message is required.',
    ]);
    expect(messages({ error: { ...body.error, requestId: '' } })).toEqual([
      'requestId is required.',
    ]);
  });
});
