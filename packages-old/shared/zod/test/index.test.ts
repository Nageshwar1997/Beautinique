import { describe, expect, it } from 'vitest';
import * as zod from 'zod';

import type { ZodType } from '../src/index';
import * as api from '../src/index';
import {
  bankAccountNumberZod,
  basisPointsZod,
  emailZod,
  enum as zodEnum,
  gstinCheckDigit,
  gstinZod,
  hexColorZod,
  httpsUrlZod,
  ifscZod,
  isoDateTimeZod,
  isoDateZod,
  mobileNumberZod,
  objectIdZod,
  otpZod,
  paiseZod,
  panZod,
  passwordZod,
  personNameZod,
  pincodeZod,
  signedPaiseZod,
  slugZod,
  upiIdZod,
  uuidv7Zod,
  uuidZod,
  z,
} from '../src/index';

/** The first error message zod gives for `value`, or null when it is valid. */
function errorOf(schema: ZodType, value: unknown): string | null {
  const result = schema.safeParse(value);
  return result.success ? null : (result.error.issues[0]?.message ?? 'invalid');
}

function expectValid(schema: ZodType, values: unknown[]) {
  for (const value of values) {
    expect(errorOf(schema, value), `${JSON.stringify(value)} should be valid`).toBeNull();
  }
}

function expectInvalid(schema: ZodType, values: unknown[], message?: string) {
  for (const value of values) {
    const error = errorOf(schema, value);
    expect(error, `${JSON.stringify(value)} should be invalid`).not.toBeNull();
    if (message) expect(error).toBe(message);
  }
}

const OURS = [
  'bankAccountNumberZod',
  'basisPointsZod',
  'emailZod',
  'gstinCheckDigit',
  'gstinZod',
  'hexColorZod',
  'httpsUrlZod',
  'ifscZod',
  'isoDateTimeZod',
  'isoDateZod',
  'mobileNumberZod',
  'objectIdZod',
  'otpZod',
  'paiseZod',
  'panZod',
  'passwordZod',
  'personNameZod',
  'pincodeZod',
  'signedPaiseZod',
  'slugZod',
  'upiIdZod',
  'uuidv7Zod',
  'uuidZod',
];

describe('public API', () => {
  it('exports all of zod plus our schemas, and our names never clash with zod', () => {
    // `export *` never re-exports a default export, so zod's `default` (the same as `z`) is left out
    const zodNamed = Object.keys(zod).filter((name) => name !== 'default');
    expect(Object.keys(api).sort()).toEqual([...zodNamed, ...OURS].sort());
    for (const name of OURS) {
      expect(Object.keys(zod), name).not.toContain(name);
    }
    // our schemas end in Zod (the one helper function is the exception)
    expect(OURS.filter((name) => !name.endsWith('Zod'))).toEqual(['gstinCheckDigit']);
  });

  it('the zod exports are the very same instance (one zod in the repo)', () => {
    expect(api.string).toBe(zod.string);
    expect(api.object).toBe(zod.object);
    expect(api.ZodType).toBe(zod.ZodType);
    expect(z).toBe(zod.z);
    // our schemas are built with it, so they compose with anything made from these exports
    const seller = api.object({
      phone: mobileNumberZod,
      gstin: gstinZod,
      type: zodEnum(['brand', 'distributor']),
    });
    expect(
      seller.parse({ phone: '+91 98765 43210', gstin: '27aapfu0939f1zv', type: 'brand' }),
    ).toEqual({ phone: '9876543210', gstin: '27AAPFU0939F1ZV', type: 'brand' });
    expect(mobileNumberZod).toBeInstanceOf(api.ZodType);
  });
});

describe('India', () => {
  it('mobile numbers: accepts what people type and outputs the 10 digits', () => {
    for (const input of [
      '9876543210',
      '+91 98765 43210',
      '+919876543210',
      '919876543210',
      '09876543210',
      '98765-43210',
      '(987) 654 3210',
      ' 98765 43210 ',
    ]) {
      expect(mobileNumberZod.parse(input), input).toBe('9876543210');
    }
    expectValid(mobileNumberZod, ['6000000000', '7123456789', '8999999999']);
    expectInvalid(
      mobileNumberZod,
      ['5876543210', '987654321', '98765432101', '+92 98765 43210', 'abcdefghij', '', '0987654321'],
      'Enter a valid 10-digit mobile number',
    );
  });

  it('PIN codes: 6 digits, not starting with 0', () => {
    expectValid(pincodeZod, ['411001', '110001', ' 560034 ']);
    expectInvalid(
      pincodeZod,
      ['011001', '41100', '4110011', '41 1001', 'abcdef'],
      'Enter a valid 6-digit PIN code',
    );
  });

  it('PAN: structure and holder type, upper-cased', () => {
    expect(panZod.parse('abcpd1234e')).toBe('ABCPD1234E');
    expectValid(panZod, ['AAACB1234C', 'AAAFB1234F', 'AAAHB1234H', 'AAATB1234T', 'AAAJB1234J']);
    expectInvalid(
      panZod,
      ['ABCXD1234E', 'ABCP1234E', 'ABCPD12345', '1BCPD1234E', 'ABCPD1234'],
      'Enter a valid PAN',
    );
  });

  it('GSTIN check digit: a known valid GSTIN passes, and any single changed character fails', () => {
    const valid = '27AAPFU0939F1ZV';
    expect(gstinCheckDigit(valid.slice(0, 14))).toBe('V');
    expect(gstinZod.parse(valid.toLowerCase())).toBe(valid);
    // change each of the first 14 characters to another allowed character: the check digit must catch it
    for (let i = 0; i < 14; i += 1) {
      const original = valid.charAt(i);
      const replacement = /\d/.test(original)
        ? String((Number(original) + 1) % 10)
        : original === 'Z'
          ? 'Y'
          : 'Z';
      const changed = valid.slice(0, i) + replacement + valid.slice(i + 1);
      expect(gstinZod.safeParse(changed).success, `changed position ${String(i)}: ${changed}`).toBe(
        false,
      );
    }
    expect(() => gstinCheckDigit('27aapfu0939f1z')).toThrow(RangeError);
  });

  it('GSTIN: state code, structure and check digit each give their own message', () => {
    const withDigit = (first14: string) => first14 + gstinCheckDigit(first14);
    expectValid(gstinZod, [
      withDigit('01AAPFU0939F1Z'),
      withDigit('38AAPFU0939F1Z'),
      withDigit('97AAPFU0939F1Z'),
      withDigit('99AAPFU0939F1Z'),
    ]);
    expectInvalid(
      gstinZod,
      [withDigit('00AAPFU0939F1Z'), withDigit('39AAPFU0939F1Z'), withDigit('96AAPFU0939F1Z')],
      'GSTIN state code is not valid',
    );
    expectInvalid(
      gstinZod,
      ['27AAPFU0939F1AV', '27AAPFU0939F0ZV', '27AAPXU0939F1ZV', '27AAPFU0939F1Z'],
      'Enter a valid GSTIN',
    );
    expectInvalid(
      gstinZod,
      ['27AAPFU0939F1ZW'],
      'GSTIN check digit does not match; check for a typing mistake',
    );
  });

  it('IFSC, bank account and UPI ID', () => {
    expect(ifscZod.parse('hdfc0001234')).toBe('HDFC0001234');
    expectValid(ifscZod, ['SBIN0005943', 'ICIC0ABC123']);
    expectInvalid(ifscZod, ['HDFC1001234', 'HDF0001234', 'HDFC00012345'], 'Enter a valid IFSC');
    expectValid(bankAccountNumberZod, ['123456789', '123456789012345678']);
    expectInvalid(
      bankAccountNumberZod,
      ['12345678', '1234567890123456789', '12345678A'],
      'Enter a valid account number (9 to 18 digits)',
    );
    expect(upiIdZod.parse(' Priya.Sharma@OKHDFCBank ')).toBe('priya.sharma@okhdfcbank');
    expectValid(upiIdZod, ['98765@ybl', 'shop-01@paytm', 'a_b@upi']);
    expectInvalid(
      upiIdZod,
      ['@ybl', 'name@', 'name@1bank', 'na me@ybl', 'x@ybl'],
      'Enter a valid UPI ID',
    );
  });
});

describe('identity', () => {
  it('email: trimmed, lower case, at most 254 characters', () => {
    expect(emailZod.parse('  Priya.Sharma@Beautinique.Example ')).toBe(
      'priya.sharma@beautinique.example',
    );
    expectInvalid(
      emailZod,
      ['priya', 'priya@', '@example.com', 'priya@example'],
      'Enter a valid email address',
    );
    expectInvalid(emailZod, [`${'a'.repeat(250)}@x.co`], 'Email address is too long');
    expectInvalid(emailZod, ['', '   '], 'Enter your email address');
    expectInvalid(emailZod, [undefined, 42], 'Email is required');
  });

  it('otp: exactly 6 digits', () => {
    expectValid(otpZod, ['123456', ' 000000 ']);
    expectInvalid(otpZod, ['12345', '1234567', '12a456', ''], 'Enter the 6-digit code');
    expectInvalid(otpZod, [undefined], 'Code is required');
  });

  it('password: 12 to 128 characters, no composition rules, trimmed', () => {
    expect(passwordZod.parse('  long enough!  ')).toBe('long enough!');
    expectValid(passwordZod, ['abcdefghijkl', 'correct horse battery staple', 'x'.repeat(128)]);
    expectInvalid(passwordZod, ['abcdefghijk', ' abcdefghijk '], 'Use at least 12 characters');
    expectInvalid(passwordZod, ['x'.repeat(129)], 'Use at most 128 characters');
    // only spaces trim to nothing
    expectInvalid(passwordZod, ['', ' '.repeat(12)], 'Enter a password');
    expectInvalid(passwordZod, [undefined, null], 'Password is required');
  });

  it('person names: letters of any script, common punctuation, extra spaces collapsed', () => {
    expect(personNameZod.parse('  Priya   Sharma ')).toBe('Priya Sharma');
    expectValid(personNameZod, ["D'Souza", 'A. R. Rahman', 'Anne-Marie', 'Zoë', 'José García']);
    expectInvalid(
      personNameZod,
      ['Priya2', '-Priya', '.Priya', 'Priya@Sharma'],
      'Use letters, spaces, dots, apostrophes and hyphens',
    );
    expectInvalid(personNameZod, ['', '   '], 'Enter a name');
    expectInvalid(personNameZod, ['a'.repeat(101)], 'Name is too long');
    expectInvalid(personNameZod, [undefined], 'Name is required');
  });
});

describe('common', () => {
  it('paise: whole, non-negative, safe integers', () => {
    expectValid(paiseZod, [0, 129_900, Number.MAX_SAFE_INTEGER]);
    expectInvalid(paiseZod, [12.5], 'Amount must be a whole number of paise');
    expectInvalid(paiseZod, [-1], 'Amount cannot be negative');
    expectInvalid(paiseZod, [Number.MAX_SAFE_INTEGER + 2, '100', null]);
    expectValid(signedPaiseZod, [-500, 0, 500]);
    expectInvalid(signedPaiseZod, [-0.5], 'Amount must be a whole number of paise');
  });

  it('basis points: 0 to 10000 whole', () => {
    expectValid(basisPointsZod, [0, 1800, 10_000]);
    expectInvalid(basisPointsZod, [-1], 'Rate cannot be negative');
    expectInvalid(basisPointsZod, [10_001], 'Rate cannot be more than 100%');
    expectInvalid(basisPointsZod, [18.5], 'Rate must be a whole number of basis points');
  });

  it('ids: ObjectId, UUID and UUIDv7', () => {
    expect(objectIdZod.parse('65F1A2B3C4D5E6F708192A3B')).toBe('65f1a2b3c4d5e6f708192a3b');
    expectInvalid(
      objectIdZod,
      ['65f1a2b3c4d5e6f708192a3', '65f1a2b3c4d5e6f708192a3g'],
      'Not a valid id',
    );
    const v4 = '3f6c2a1e-8b4d-4c2a-9f1e-2b3c4d5e6f70';
    const v7 = '0192f3a4-5b6c-7d8e-9f01-23456789abcd';
    expectValid(uuidZod, [v4, v7]);
    expectValid(uuidv7Zod, [v7]);
    expectInvalid(uuidv7Zod, [v4], 'Not a valid UUIDv7');
    expectInvalid(uuidZod, ['not-a-uuid'], 'Not a valid UUID');
  });

  it('slug, hex colour, https URL and ISO dates', () => {
    expectValid(slugZod, ['rose-glow-serum', 'spf50', 'a']);
    expectInvalid(
      slugZod,
      ['Rose-Glow', 'rose--glow', '-rose', 'rose-', 'rose glow'],
      'Use lower-case letters, digits and single hyphens',
    );
    expect(hexColorZod.parse('#d6336c')).toBe('#D6336C');
    expectInvalid(
      hexColorZod,
      ['#D63', 'D6336C', '#D6336CFF', '#G6336C'],
      'Use a colour like #D6336C',
    );
    expectValid(httpsUrlZod, ['https://beautinique.example/products/rose-glow']);
    expectInvalid(
      httpsUrlZod,
      ['http://beautinique.example', 'javascript:alert(1)', 'ftp://x.example'],
      'Enter an https:// link',
    );
    expectValid(isoDateTimeZod, ['2026-10-20T07:56:26.899Z', '2026-10-20T07:56:26Z']);
    expectInvalid(
      isoDateTimeZod,
      ['2026-10-20', '2026-10-20T07:56:26+05:30'],
      'Use an ISO date-time in UTC',
    );
    expectValid(isoDateZod, ['2026-10-20']);
    expectInvalid(isoDateZod, ['20-10-2026', '2026-13-01'], 'Use a date like 2026-10-20');
  });
});
