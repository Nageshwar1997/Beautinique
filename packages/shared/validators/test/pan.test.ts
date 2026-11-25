import { describe, expect, it } from 'vitest';

import { panSchema } from '../src/pan.ts';
import { refusals } from './utils/refusals.ts';

describe('panSchema', () => {
  it('AC-PLATFORM-13: accepts a right PAN for every holder type', () => {
    for (const type of 'ABCFGHJKLPT') {
      const pan = `ABC${type}E1234F`;
      expect(refusals(panSchema, 'pan', pan), pan).toEqual([]);
      expect(panSchema.parse(pan)).toBe(pan);
    }
  });

  it('AC-PLATFORM-13: trims and capitalises what a person types', () => {
    expect(panSchema.parse(' abcpe1234f\t')).toBe('ABCPE1234F');
  });

  it('AC-PLATFORM-13: a wrong PAN fails with the field name', () => {
    const wrong = [
      '', // empty
      'ABCPE1234', // 9 characters
      'ABCPE1234FG', // 11 characters
      'ABCDE1234F', // D is no holder type
      'ABCXE1234F', // X is no holder type
      'ABCP11234F', // a digit where a letter goes
      'ABCPEA234F', // a letter where a digit goes
      'ABCPE12341', // the last character is a letter
      'AB CPE1234F', // a space inside
      'ABCPE1234F-', // a sign
    ];
    for (const pan of wrong) {
      expect(refusals(panSchema, 'pan', pan), pan).toEqual(['pan: Enter a valid PAN.']);
    }
    expect(refusals(panSchema, 'sellerPan', 'nope')).toEqual(['sellerPan: Enter a valid PAN.']);
  });

  it('AC-PLATFORM-13: refuses what is not text, with the field name', () => {
    for (const value of [undefined, null, 1234567890, {}]) {
      expect(refusals(panSchema, 'pan', value)[0]).toMatch(/^pan: Invalid input: expected string/);
    }
  });

  it('CR-22, SR-077: never repeats the value it refused', () => {
    const issues = panSchema.safeParse('ABCDE1234F').error?.issues;
    expect(JSON.stringify(issues)).not.toContain('ABCDE1234F');
  });
});
