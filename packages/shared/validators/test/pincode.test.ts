import { describe, expect, it } from 'vitest';

import { pincodeSchema } from '../src/pincode.ts';
import { refusals } from './utils/refusals.ts';

describe('pincodeSchema', () => {
  it('AC-PLATFORM-13: accepts a right pincode', () => {
    for (const pincode of ['400001', '110001', '560001', '999999', '100000']) {
      expect(refusals(pincodeSchema, 'pincode', pincode), pincode).toEqual([]);
      expect(pincodeSchema.parse(pincode)).toBe(pincode);
    }
  });

  it('AC-PLATFORM-13: trims what a person types', () => {
    expect(pincodeSchema.parse(' 400001\n')).toBe('400001');
  });

  it('AC-PLATFORM-13: a wrong pincode fails with the field name', () => {
    const wrong = [
      '', // empty
      '40001', // 5 digits
      '4000011', // 7 digits
      '000001', // never starts with 0
      '40000A', // a letter
      '400 001', // a space inside
      '400-001', // a sign
      '४००००१', // Devanagari digits
    ];
    for (const pincode of wrong) {
      expect(refusals(pincodeSchema, 'pincode', pincode), pincode).toEqual([
        'pincode: Enter a valid 6-digit pincode.',
      ]);
    }
    expect(refusals(pincodeSchema, 'shipToPincode', 'nope')).toEqual([
      'shipToPincode: Enter a valid 6-digit pincode.',
    ]);
  });

  it('AC-PLATFORM-13: refuses what is not text, with the field name', () => {
    for (const value of [undefined, null, 400001, {}]) {
      expect(refusals(pincodeSchema, 'pincode', value)[0]).toMatch(
        /^pincode: Invalid input: expected string/,
      );
    }
  });
});
