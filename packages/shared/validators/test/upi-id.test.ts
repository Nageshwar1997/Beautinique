import { describe, expect, it } from 'vitest';

import { upiIdSchema } from '../src/upi-id.ts';
import { refusals } from './utils/refusals.ts';

describe('upiIdSchema', () => {
  it('AC-PLATFORM-13: accepts a right UPI id', () => {
    for (const upiId of [
      'asha.k@okaxis',
      '9876543210@ybl',
      'asha_k-1@paytm',
      'ab@upi',
      `${'a'.repeat(256)}@${'b'.repeat(64)}`,
    ]) {
      expect(refusals(upiIdSchema, 'upiId', upiId), upiId).toEqual([]);
      expect(upiIdSchema.parse(upiId)).toBe(upiId);
    }
  });

  it('AC-PLATFORM-13: trims and lowercases what a person types, as UPI ids ignore case', () => {
    expect(upiIdSchema.parse('  Asha.K@OkAxis ')).toBe('asha.k@okaxis');
  });

  it('AC-PLATFORM-13: a wrong UPI id fails with the field name', () => {
    const wrong = [
      '', // empty
      'asha.k', // no handle
      'asha.k@', // empty handle
      '@okaxis', // empty name
      'a@okaxis', // a name of 1 character
      'asha@k@okaxis', // two @
      'asha k@okaxis', // a space inside
      'asha!@okaxis', // a sign in the name
      'asha@1axis', // the handle starts with a digit
      'asha@o', // a handle of 1 character
      'asha@ok-axis', // a sign in the handle
      `${'a'.repeat(257)}@okaxis`, // a name that is too long
      `asha@${'b'.repeat(65)}`, // a handle that is too long
    ];
    for (const upiId of wrong) {
      expect(refusals(upiIdSchema, 'upiId', upiId), upiId).toEqual([
        'upiId: Enter a valid UPI ID.',
      ]);
    }
    expect(refusals(upiIdSchema, 'payoutUpi', 'nope')).toEqual([
      'payoutUpi: Enter a valid UPI ID.',
    ]);
  });

  it('AC-PLATFORM-13: refuses what is not text, with the field name', () => {
    for (const value of [undefined, null, 9876543210, {}]) {
      expect(refusals(upiIdSchema, 'upiId', value)[0]).toMatch(
        /^upiId: Invalid input: expected string/,
      );
    }
  });
});
