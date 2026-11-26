import { describe, expect, it } from 'vitest';

import {
  isSensitiveKey,
  MAX_DEPTH,
  MAX_ITEMS,
  normalizedKeys,
  redactFields,
} from '../src/index.ts';

const NONE = new Set<string>();

describe('isSensitiveKey', () => {
  it('SR-098: the keys of secrets and personal data, in any case and with -, _ or space', () => {
    for (const key of [
      'password',
      'Password',
      'newPassword',
      'passwordHash',
      'password_reset_token',
      'codeHash',
      'tokenHash',
      'secretKey',
      'token',
      'accessToken',
      'refresh_token',
      'csrf-token',
      'secret',
      'clientSecret',
      'client_secret',
      'apiKey',
      'x-api-key',
      'api-key',
      'authorization',
      'Authorization',
      'proxy-authorization',
      'cookie',
      'Cookie',
      'set-cookie',
      'Set-Cookie',
      'code',
      'otp',
      'OTP',
      'otpCode',
      'recoveryCode',
      'recovery_codes',
      'deliveryCode',
      'pan',
      'PAN',
      'panNumber',
      'bankAccount',
      'account_number',
      'email',
      'phone',
      'mobile',
      'address',
      'addressLine1',
      'fullAddress',
      'x-razorpay-signature',
      'signature',
      'my key with spaces token',
    ]) {
      expect(isSensitiveKey(key, NONE), key).toBe(true);
    }
  });

  it('SR-098: the keys that a log needs are not taken out', () => {
    for (const key of [
      'statusCode',
      'errorCode',
      'orderId',
      'requestId',
      'route',
      'status',
      'durationMs',
      'tokenCount',
      'codeVersion',
      'panel',
      'addressId',
      'emailSent',
      'phoneme',
      'accountId',
    ]) {
      expect(isSensitiveKey(key, NONE), key).toBe(false);
    }
  });

  it('SR-098: a service can add the names of its own secret headers', () => {
    const extra = normalizedKeys(['X-Edge-Key', 'x_app_header']);

    expect(isSensitiveKey('x-edge-key', extra)).toBe(true);
    expect(isSensitiveKey('X_EDGE_KEY', extra)).toBe(true);
    expect(isSensitiveKey('xappheader', extra)).toBe(true);
    expect(isSensitiveKey('x-edge-key', NONE)).toBe(false);
  });
});

describe('redactFields', () => {
  it('AC-PLATFORM-14: takes the key and its value out at every depth, and in lists', () => {
    const result = redactFields({
      orderId: 'o1',
      password: 'pw-1',
      user: { id: 'u1', otp: '123456', profile: { pan: 'ABCPE1234F', city: 'Pune' } },
      list: [{ token: 't', ok: 1 }, 'plain', [{ cookie: 'c', ok: 2 }]],
      req: { headers: { authorization: 'Bearer x', 'set-cookie': ['s=1'], accept: 'json' } },
    });

    expect(result).toEqual({
      orderId: 'o1',
      user: { id: 'u1', profile: { city: 'Pune' } },
      list: [{ ok: 1 }, 'plain', [{ ok: 2 }]],
      req: { headers: { accept: 'json' } },
    });
  });

  it('SR-098: the key is gone, not set to a mask', () => {
    const result = redactFields({ password: 'pw', ok: true }) as Record<string, unknown>;

    expect(Object.keys(result)).toEqual(['ok']);
    expect('password' in result).toBe(false);
  });

  it('AC-PLATFORM-14: never changes what it was given', () => {
    const input = { password: 'pw', nested: { token: 't', list: [{ otp: '1' }] } };
    const before = JSON.stringify(input);

    redactFields(input);

    expect(JSON.stringify(input)).toBe(before);
  });

  it('SR-098: an object that is the same twice side by side is read twice, and a loop is cut', () => {
    const shared = { id: 1, password: 'x' };
    expect(redactFields({ a: shared, b: shared })).toEqual({ a: { id: 1 }, b: { id: 1 } });

    const loop: Record<string, unknown> = { id: 1 };
    loop.self = loop;
    expect(redactFields(loop)).toEqual({ id: 1, self: '<circular>' });
  });

  it('SR-098: cuts the depth, so a long chain cannot fill the stack', () => {
    let deep: Record<string, unknown> = { leaf: 'x' };
    for (let level = 0; level < 100_000; level += 1) deep = { next: deep };

    let result: unknown = redactFields(deep);
    let levels = 0;
    while (typeof result === 'object' && result !== null) {
      result = (result as Record<string, unknown>).next;
      levels += 1;
    }

    expect(levels).toBe(MAX_DEPTH);
    expect(result).toBe('<too deep>');
  });

  it('CR-40: a list is cut at 100 items with a note, and an object with many keys is read once', () => {
    const list = Array.from({ length: 100_000 }, (_, index) => index);
    const cut = redactFields({ list }) as { list: unknown[] };

    expect(cut.list).toHaveLength(MAX_ITEMS + 1);
    expect(cut.list.at(-1)).toBe('<99900 more items>');
    expect(redactFields({ list: [1, 2] })).toEqual({ list: [1, 2] });
    expect(redactFields({ list: Array.from({ length: MAX_ITEMS }, (_, index) => index) })).toEqual({
      list: Array.from({ length: MAX_ITEMS }, (_, index) => index),
    });

    const wide: Record<string, number> = {};
    for (let key = 0; key < 100_000; key += 1) wide[`key${String(key)}`] = key;
    wide.password = 1;
    const result = redactFields(wide) as Record<string, number>;
    expect(Object.keys(result)).toHaveLength(100_000);
    expect('password' in result).toBe(false);
  });

  it('SR-077: bytes are written as their size, never as themselves', () => {
    const result = redactFields({
      buffer: Buffer.from('secret-bytes'),
      array: new Uint8Array(4),
      raw: new ArrayBuffer(8),
    });

    expect(result).toEqual({
      buffer: '<binary 12 bytes>',
      array: '<binary 4 bytes>',
      raw: '<binary 8 bytes>',
    });
  });

  it('SR-098: an error anywhere in a log is written as its type, message and stack, and nothing of its fields', () => {
    const error = Object.assign(new Error('Request failed for asha@example.com'), {
      code: 'ECONNRESET',
      config: { headers: { Authorization: 'Bearer secret-token' } },
      response: { headers: { 'set-cookie': 's=1' } },
    });

    const result = redactFields({ details: { cause: error } }) as {
      details: { cause: Record<string, unknown> };
    };

    expect(Object.keys(result.details.cause).sort()).toEqual(['code', 'message', 'stack', 'type']);
    expect(result.details.cause.message).toBe('Request failed for <email>');
    expect(JSON.stringify(result)).not.toContain('secret-token');
  });

  it('SR-098: a value that says how it is written, a date, and what is not an object are left as they are', () => {
    const date = new Date('2026-11-26T09:00:00.000Z');
    class ObjectIdLike {
      toJSON(): string {
        return '66f0a1b2c3d4e5f6a7b8c9d0';
      }
    }
    const id = new ObjectIdLike();
    class Money {
      paise: number;
      token = 'x';
      constructor(paise: number) {
        this.paise = paise;
      }
    }

    expect(redactFields({ date, id, n: 5, s: 'text', b: true, none: null, u: undefined })).toEqual({
      date,
      id,
      n: 5,
      s: 'text',
      b: true,
      none: null,
      u: undefined,
    });
    // An instance of a class is read by its fields, like a plain object.
    expect(redactFields({ money: new Money(4900) })).toEqual({ money: { paise: 4900 } });
    expect(redactFields('text')).toBe('text');
    expect(redactFields(undefined)).toBeUndefined();
    expect(redactFields(null)).toBeNull();
    expect(
      redactFields(Object.assign(Object.create(null) as object, { password: 'x', ok: 1 })),
    ).toEqual({
      ok: 1,
    });
  });

  it('SR-098: the keys that a service adds are taken out too', () => {
    const result = redactFields(
      { 'x-edge-key': 'k', ok: 1, nested: { 'X-Edge-Key': 'k' } },
      normalizedKeys(['x-edge-key']),
    );

    expect(result).toEqual({ ok: 1, nested: {} });
  });
});
