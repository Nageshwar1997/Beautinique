import { describe, expect, it } from 'vitest';

import { gstinCheckCharacter, gstinSchema } from '../src/gstin.ts';
import { refusals } from './utils/refusals.ts';
import { itAnswersRequired } from './utils/text-field-cases.ts';

const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const FORMAT_MESSAGE = 'gstin: GSTIN must be a valid 15-character GSTIN, like 27ABCPE1234F1ZB.';
const CHECK_MESSAGE = 'gstin: GSTIN check character is wrong, check it for a typo.';

// The PAN is made up. The check character of each was worked out by hand with the Luhn mod 36
// rule; the first one below is a GSTIN that is widely published as an example, so the rule is
// checked against a number that did not come from this code.
const PUBLISHED_EXAMPLE = '27AAPFU0939F1ZV';
const VALID = [
  PUBLISHED_EXAMPLE,
  '27ABCPE1234F1ZB',
  '29ABCPE1234F1Z7',
  '07ABCPE1234F2ZC',
  '33ABCPE1234FAZ9',
];

describe('gstinSchema', () => {
  it('AC-PLATFORM-13: accepts a right GSTIN', () => {
    for (const gstin of VALID) {
      expect(refusals(gstinSchema, 'gstin', gstin)).toEqual([]);
      expect(gstinSchema.parse(gstin)).toBe(gstin);
    }
  });

  it('AC-PLATFORM-13: accepts every state code, the centre and "other territory"', () => {
    expect(refusals(gstinSchema, 'gstin', '01ABCPE1234F1ZP')).toEqual([]);
    expect(refusals(gstinSchema, 'gstin', '38ABCPE1234F1Z8')).toEqual([]);
    expect(refusals(gstinSchema, 'gstin', '97ABCPE1234F1Z4')).toEqual([]);
    expect(refusals(gstinSchema, 'gstin', '99ABCPE1234F1Z0')).toEqual([]);
  });

  it('AC-PLATFORM-13: trims and capitalises what a person types', () => {
    expect(gstinSchema.parse('  27abcpe1234f1zb ')).toBe('27ABCPE1234F1ZB');
  });

  it('AC-PLATFORM-13: a wrong check character fails with the field name and its own message', () => {
    expect(refusals(gstinSchema, 'gstin', '27ABCPE1234F1ZA')).toEqual([CHECK_MESSAGE]);
    expect(refusals(gstinSchema, 'sellerGstin', '27ABCPE1234F1Z0')).toEqual([
      CHECK_MESSAGE.replace('gstin:', 'sellerGstin:'),
    ]);
  });

  it('AC-PLATFORM-13: every other check character is wrong, and so is any single typo', () => {
    for (const valid of VALID) {
      const rightCharacter = valid.slice(14);
      for (const character of ALPHABET) {
        if (character === rightCharacter) continue;
        expect(refusals(gstinSchema, 'gstin', `${valid.slice(0, 14)}${character}`)).not.toEqual([]);
      }
      // A different character in any of the first 14 places, with the same check character.
      for (let place = 0; place < 14; place += 1) {
        for (const character of ALPHABET) {
          if (character === valid.charAt(place)) continue;
          const typo = `${valid.slice(0, place)}${character}${valid.slice(place + 1)}`;
          expect(refusals(gstinSchema, 'gstin', typo), typo).not.toEqual([]);
        }
      }
    }
  });

  it('AC-PLATFORM-13: a wrong shape fails with the field name and says nothing about the check', () => {
    const wrong = [
      '27ABCPE1234F1Z', // 14 characters
      '27ABCPE1234F1ZBB', // 16 characters
      'ABABCPE1234F1ZB', // the state is letters
      '00ABCPE1234F1ZR', // no state 00
      '39ABCPE1234F1Z6', // no state 39
      '98ABCPE1234F1Z2', // no state 98
      '27ABCPE1234F0ZC', // the registration number is never 0
      '27ABCPE1234F1XB', // the 14th character is always Z
      '27ABCXE1234F1ZV', // not a PAN: X is no holder type
      '27ABCPE123XF1ZB', // not a PAN: a letter where a digit goes
      '27ABCPE1234F1Z-', // a sign
    ];
    for (const gstin of wrong) {
      expect(refusals(gstinSchema, 'gstin', gstin), gstin).toEqual([FORMAT_MESSAGE]);
    }
  });

  itAnswersRequired(gstinSchema, 'gstin', 'GSTIN');

  it('CR-22: never repeats the value it refused', () => {
    const issues = gstinSchema.safeParse('27ABCPE1234F1ZA').error?.issues;
    expect(JSON.stringify(issues)).not.toContain('27ABCPE1234F1ZA');
  });
});

describe('gstinCheckCharacter', () => {
  it('AC-PLATFORM-13: gives the check character of the first 14 characters', () => {
    expect(gstinCheckCharacter(PUBLISHED_EXAMPLE.slice(0, 14))).toBe('V');
    expect(gstinCheckCharacter('27ABCPE1234F1Z')).toBe('B');
    expect(gstinCheckCharacter('99ABCPE1234F1Z')).toBe('0');
    expect(gstinCheckCharacter('01ABCPE1234F1Z')).toBe('P');
  });

  it('AC-PLATFORM-13: refuses anything but 14 digits and capital letters', () => {
    for (const body of [
      '',
      '27ABCPE1234F1',
      '27ABCPE1234F1ZB',
      '27abcpe1234f1z',
      '27ABCPE1234F1-',
    ]) {
      expect(() => gstinCheckCharacter(body), body).toThrow(RangeError);
    }
  });
});
