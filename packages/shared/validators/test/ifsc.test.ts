import { describe, expect, it } from 'vitest';

import { ifscSchema } from '../src/ifsc.ts';
import { refusals } from './utils/refusals.ts';

describe('ifscSchema', () => {
  it('AC-PLATFORM-13: accepts a right IFSC code', () => {
    for (const ifsc of ['HDFC0001234', 'SBIN0ABC123', 'ICIC0000001', 'KKBK0ZZZZZZ']) {
      expect(refusals(ifscSchema, 'ifsc', ifsc), ifsc).toEqual([]);
      expect(ifscSchema.parse(ifsc)).toBe(ifsc);
    }
  });

  it('AC-PLATFORM-13: trims and capitalises what a person types', () => {
    expect(ifscSchema.parse('  hdfc0abc12z ')).toBe('HDFC0ABC12Z');
  });

  it('AC-PLATFORM-13: a wrong IFSC code fails with the field name', () => {
    const wrong = [
      '', // empty
      'HDFC000123', // 10 characters
      'HDFC00012345', // 12 characters
      'HDF00001234', // the bank part is 3 letters
      'HDFC1001234', // the 5th character is always 0
      'HDFCO001234', // the letter O, not the digit 0
      '1DFC0001234', // a digit in the bank part
      'HDFC0001-34', // a sign
      'HDFC 001234', // a space inside
    ];
    for (const ifsc of wrong) {
      expect(refusals(ifscSchema, 'ifsc', ifsc), ifsc).toEqual(['ifsc: Enter a valid IFSC code.']);
    }
    expect(refusals(ifscSchema, 'bankIfsc', 'nope')).toEqual([
      'bankIfsc: Enter a valid IFSC code.',
    ]);
  });

  it('AC-PLATFORM-13: refuses what is not text, with the field name', () => {
    for (const value of [undefined, null, 12345678901, {}]) {
      expect(refusals(ifscSchema, 'ifsc', value)[0]).toMatch(
        /^ifsc: Invalid input: expected string/,
      );
    }
  });
});
