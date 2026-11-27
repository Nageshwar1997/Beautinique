import { randomBytes } from 'node:crypto';

import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { fromBase64url, toBase64url } from '../src/utils/base64url.ts';

describe('base64url, strict', () => {
  it('every byte string goes there and back (property)', () => {
    fc.assert(
      fc.property(fc.uint8Array({ maxLength: 200 }), (bytes) => {
        const text = toBase64url(bytes);
        expect(text).toMatch(/^[A-Za-z0-9_-]*$/);
        expect(fromBase64url(text)).toEqual(Buffer.from(bytes));
      }),
    );
  });

  it('a view into a larger buffer is only its own bytes', () => {
    const big = randomBytes(64);
    const view = big.subarray(10, 20);
    expect(fromBase64url(toBase64url(view))).toEqual(Buffer.from(view));
  });

  it('padding, the other alphabet, spaces and texts that do not encode back are refused', () => {
    const text = toBase64url(randomBytes(32));
    expect(fromBase64url(`${text}=`)).toBeUndefined();
    expect(fromBase64url(text.replaceAll('-', '+').replaceAll('_', '/') + '+')).toBeUndefined();
    expect(fromBase64url(` ${text}`)).toBeUndefined();
    expect(fromBase64url(`${text.slice(0, 20)}.${text.slice(21)}`)).toBeUndefined();
    // 'AB' encodes 'AA' back: its last bits are not zero, so two texts would give one value.
    expect(fromBase64url('AB')).toBeUndefined();
    expect(fromBase64url('A')).toBeUndefined();
    expect(fromBase64url('')).toEqual(Buffer.alloc(0));
  });
});
