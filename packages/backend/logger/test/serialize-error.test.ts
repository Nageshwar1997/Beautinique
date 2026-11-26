import { describe, expect, it } from 'vitest';

import { ERROR_MESSAGE_MAX, serializeError } from '../src/index.ts';

function stackFrames(stack: string | undefined): string {
  return (stack ?? '').slice((stack ?? '').indexOf('\n    at '));
}

describe('serializeError', () => {
  it('SR-098: gives the type, the code, the message and the stack, and nothing else', () => {
    const error = Object.assign(new TypeError('Cannot read the order'), {
      code: 'ERR_ORDER',
      statusCode: 500,
      config: { headers: { Authorization: 'Bearer secret-token' }, data: '{"password":"pw"}' },
      request: { _header: 'Cookie: s=1' },
      response: { status: 500, headers: { 'set-cookie': 'a=b' }, data: { email: 'x@y.com' } },
      keyValue: { email: 'asha@example.com' },
    });

    const serialized = serializeError(error);

    expect(Object.keys(serialized).sort()).toEqual(['code', 'message', 'stack', 'type']);
    expect(serialized.type).toBe('TypeError');
    expect(serialized.code).toBe('ERR_ORDER');
    expect(serialized.message).toBe('Cannot read the order');
    expect(serialized.stack).toMatch(/^TypeError: Cannot read the order\n {4}at /);
    expect(JSON.stringify(serialized)).not.toMatch(/secret-token|set-cookie|asha@example|Cookie/);
  });

  it('SR-098: keeps a number code and drops a code that is anything else', () => {
    expect(serializeError(Object.assign(new Error('x'), { code: 11000 })).code).toBe(11000);
    const others: [string, unknown][] = [
      ['undefined', undefined],
      ['null', null],
      ['object', {}],
      ['array', []],
      ['NaN', Number.NaN],
      ['Infinity', Number.POSITIVE_INFINITY],
      ['boolean', true],
    ];
    for (const [label, code] of others) {
      expect(serializeError(Object.assign(new Error('x'), { code })), label).not.toHaveProperty(
        'code',
      );
    }
  });

  it('SR-098: cuts the message at 300 characters and masks the patterns of SR-077 in it', () => {
    const long = serializeError(new Error('x'.repeat(5000)));
    expect(ERROR_MESSAGE_MAX).toBe(300);
    expect(long.message).toHaveLength(300);

    const masked = serializeError(
      new Error('Send to asha@example.com, 9876543210, ABCPE1234F, Bearer abc.def failed'),
    );
    expect(masked.message).toBe('Send to <email>, <phone>, <pan>, Bearer <token> failed');
  });

  it('SR-098: a duplicate key error has the index and no value', () => {
    const error = Object.assign(
      new Error(
        'E11000 duplicate key error collection: shop.accounts index: email_1 dup key: { email: "x@y.com" }',
      ),
      { code: 11000, keyValue: { email: 'x@y.com' }, keyPattern: { email: 1 } },
    );

    const serialized = serializeError(error);

    expect(serialized.message).toContain('index: email_1');
    expect(serialized.message).toContain('dup key: { <value> }');
    expect(JSON.stringify(serialized)).not.toContain('x@y.com');
  });

  it('SR-098: a validation error has the names of the fields and no value', () => {
    const error = Object.assign(new Error('[{"message":"Invalid email asha@example.com"}]'), {
      name: 'ZodError',
      issues: [
        { path: ['email'], message: 'Email must be a valid email address.' },
        { path: ['items', 0, 'quantity'], message: 'Too small' },
        { path: ['email'], message: 'again' },
        { path: [], message: 'whole value' },
        'not an issue',
        null,
      ],
    });

    const serialized = serializeError(error);

    expect(serialized.type).toBe('ZodError');
    expect(serialized.message).toBe('Validation failed at email, items.0.quantity, (value)');
    expect(serialized.stack).toMatch(/^ZodError: Validation failed at email/);
    expect(JSON.stringify(serialized)).not.toContain('asha@example.com');
  });

  it('SR-098: the first line of the stack is the cleaned message, not the one the error had', () => {
    const error = new Error('Failed for asha@example.com');

    const serialized = serializeError(error);

    expect(serialized.stack?.split('\n')[0]).toBe('Error: Failed for <email>');
    expect(stackFrames(serialized.stack)).toBe(stackFrames(error.stack));
  });

  it('SR-098: an error without frames has the first line only, and one without a stack has none', () => {
    const noFrames = Object.assign(new Error('boom'), { stack: 'Error: boom' });
    expect(serializeError(noFrames).stack).toBe('Error: boom');
    const noStack = Object.assign(new Error('boom'), { stack: undefined });
    expect(serializeError(noStack)).not.toHaveProperty('stack');
  });

  it('CR-22: a very long stack is cut', () => {
    const error = Object.assign(new Error('boom'), {
      stack: `Error: boom${'\n    at x (y.ts:1:1)'.repeat(10_000)}`,
    });

    expect(serializeError(error).stack).toHaveLength(4000);
  });

  it('SR-098: is the same when it is applied to its own result', () => {
    const error = Object.assign(new Error('Failed for asha@example.com 9876543210'), {
      code: 'E1',
    });

    const once = serializeError(error);

    expect(serializeError(once)).toEqual(once);
    expect(serializeError(serializeError(once))).toEqual(once);
  });

  it('SR-098: what is not an error is written as a short message, never as the object', () => {
    expect(serializeError('plain asha@example.com')).toEqual({
      type: 'NonError',
      message: 'plain <email>',
    });
    expect(serializeError(42)).toEqual({ type: 'NonError', message: '42' });
    expect(serializeError(undefined)).toEqual({ type: 'NonError', message: 'undefined' });
    expect(serializeError(null)).toEqual({ type: 'NonError', message: 'null' });
  });

  it('SR-098: an object that looks like an error is read as one, and one without a message has an empty message', () => {
    expect(serializeError({ name: 'CustomError', message: 'bad', code: 3, extra: 'x' })).toEqual({
      type: 'CustomError',
      message: 'bad',
      code: 3,
    });
    expect(serializeError({ password: 'pw' })).toEqual({ type: 'Error', message: '' });
    expect(serializeError({ type: '', name: '' })).toEqual({ type: 'Error', message: '' });
  });
});
