import { describe, expect, it } from 'vitest';
import type * as z from 'zod';

import * as api from '../src/index';
import {
  bankAccountNumber,
  basisPoints,
  email,
  gstin,
  gstinCheckDigit,
  hexColor,
  httpsUrl,
  ifsc,
  isoDate,
  isoDateTime,
  mobileNumber,
  objectId,
  otp,
  paise,
  pan,
  password,
  personName,
  pincode,
  signedPaise,
  slug,
  upiId,
  uuid,
  uuidv7,
} from '../src/index';

/** The first error message zod gives for `value`, or null when it is valid. */
function errorOf(schema: z.ZodType, value: unknown): string | null {
  const result = schema.safeParse(value);
  return result.success ? null : (result.error.issues[0]?.message ?? 'invalid');
}

function expectValid(schema: z.ZodType, values: unknown[]) {
  for (const value of values) {
    expect(errorOf(schema, value), `${JSON.stringify(value)} should be valid`).toBeNull();
  }
}

function expectInvalid(schema: z.ZodType, values: unknown[], message?: string) {
  for (const value of values) {
    const error = errorOf(schema, value);
    expect(error, `${JSON.stringify(value)} should be invalid`).not.toBeNull();
    if (message) expect(error).toBe(message);
  }
}

describe('public API', () => {
  it('exports exactly these validators', () => {
    expect(Object.keys(api).sort()).toEqual(
      [
        'bankAccountNumber',
        'basisPoints',
        'email',
        'gstin',
        'gstinCheckDigit',
        'hexColor',
        'httpsUrl',
        'ifsc',
        'isoDate',
        'isoDateTime',
        'mobileNumber',
        'objectId',
        'otp',
        'paise',
        'pan',
        'password',
        'personName',
        'pincode',
        'signedPaise',
        'slug',
        'upiId',
        'uuid',
        'uuidv7',
      ].sort(),
    );
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
      expect(mobileNumber.parse(input), input).toBe('9876543210');
    }
    expectValid(mobileNumber, ['6000000000', '7123456789', '8999999999']);
    expectInvalid(
      mobileNumber,
      ['5876543210', '987654321', '98765432101', '+92 98765 43210', 'abcdefghij', '', '0987654321'],
      'Enter a valid 10-digit mobile number',
    );
  });

  it('PIN codes: 6 digits, not starting with 0', () => {
    expectValid(pincode, ['411001', '110001', ' 560034 ']);
    expectInvalid(
      pincode,
      ['011001', '41100', '4110011', '41 1001', 'abcdef'],
      'Enter a valid 6-digit PIN code',
    );
  });

  it('PAN: structure and holder type, upper-cased', () => {
    expect(pan.parse('abcpd1234e')).toBe('ABCPD1234E');
    expectValid(pan, ['AAACB1234C', 'AAAFB1234F', 'AAAHB1234H', 'AAATB1234T', 'AAAJB1234J']);
    expectInvalid(
      pan,
      ['ABCXD1234E', 'ABCP1234E', 'ABCPD12345', '1BCPD1234E', 'ABCPD1234'],
      'Enter a valid PAN',
    );
  });

  it('GSTIN check digit: a known valid GSTIN passes, and any single changed character fails', () => {
    const valid = '27AAPFU0939F1ZV';
    expect(gstinCheckDigit(valid.slice(0, 14))).toBe('V');
    expect(gstin.parse(valid.toLowerCase())).toBe(valid);
    // change each of the first 14 characters to another allowed character: the check digit must catch it
    for (let i = 0; i < 14; i += 1) {
      const original = valid.charAt(i);
      const replacement = /\d/.test(original)
        ? String((Number(original) + 1) % 10)
        : original === 'Z'
          ? 'Y'
          : 'Z';
      const changed = valid.slice(0, i) + replacement + valid.slice(i + 1);
      expect(gstin.safeParse(changed).success, `changed position ${String(i)}: ${changed}`).toBe(
        false,
      );
    }
    expect(() => gstinCheckDigit('27aapfu0939f1z')).toThrow(RangeError);
  });

  it('GSTIN: state code, structure and check digit each give their own message', () => {
    const withDigit = (first14: string) => first14 + gstinCheckDigit(first14);
    expectValid(gstin, [
      withDigit('01AAPFU0939F1Z'),
      withDigit('38AAPFU0939F1Z'),
      withDigit('97AAPFU0939F1Z'),
      withDigit('99AAPFU0939F1Z'),
    ]);
    expectInvalid(
      gstin,
      [withDigit('00AAPFU0939F1Z'), withDigit('39AAPFU0939F1Z'), withDigit('96AAPFU0939F1Z')],
      'GSTIN state code is not valid',
    );
    expectInvalid(
      gstin,
      ['27AAPFU0939F1AV', '27AAPFU0939F0ZV', '27AAPXU0939F1ZV', '27AAPFU0939F1Z'],
      'Enter a valid GSTIN',
    );
    expectInvalid(
      gstin,
      ['27AAPFU0939F1ZW'],
      'GSTIN check digit does not match; check for a typing mistake',
    );
  });

  it('IFSC, bank account and UPI ID', () => {
    expect(ifsc.parse('hdfc0001234')).toBe('HDFC0001234');
    expectValid(ifsc, ['SBIN0005943', 'ICIC0ABC123']);
    expectInvalid(ifsc, ['HDFC1001234', 'HDF0001234', 'HDFC00012345'], 'Enter a valid IFSC');
    expectValid(bankAccountNumber, ['123456789', '123456789012345678']);
    expectInvalid(
      bankAccountNumber,
      ['12345678', '1234567890123456789', '12345678A'],
      'Enter a valid account number (9 to 18 digits)',
    );
    expect(upiId.parse(' Priya.Sharma@OKHDFCBank ')).toBe('priya.sharma@okhdfcbank');
    expectValid(upiId, ['98765@ybl', 'shop-01@paytm', 'a_b@upi']);
    expectInvalid(
      upiId,
      ['@ybl', 'name@', 'name@1bank', 'na me@ybl', 'x@ybl'],
      'Enter a valid UPI ID',
    );
  });
});

describe('identity', () => {
  it('email: trimmed, lower case, at most 254 characters', () => {
    expect(email.parse('  Priya.Sharma@Beautinique.Example ')).toBe(
      'priya.sharma@beautinique.example',
    );
    expectInvalid(
      email,
      ['priya', 'priya@', '@example.com', 'priya@example'],
      'Enter a valid email address',
    );
    expectInvalid(email, [`${'a'.repeat(250)}@x.co`], 'Email address is too long');
  });

  it('otp: exactly 6 digits', () => {
    expectValid(otp, ['123456', ' 000000 ']);
    expectInvalid(otp, ['12345', '1234567', '12a456', ''], 'Enter the 6-digit code');
  });

  it('password: 8 to 128 characters, no composition rules, never trimmed', () => {
    expect(password.parse('  long enough  ')).toBe('  long enough  ');
    expectValid(password, ['abcdefgh', 'correct horse battery staple', 'x'.repeat(128)]);
    expectInvalid(password, ['abc1234'], 'Use at least 8 characters');
    expectInvalid(password, ['x'.repeat(129)], 'Use at most 128 characters');
    expectInvalid(password, ['         '], 'Password cannot be only spaces');
  });

  it('person names: letters of any script, common punctuation, extra spaces collapsed', () => {
    expect(personName.parse('  Priya   Sharma ')).toBe('Priya Sharma');
    expectValid(personName, ["D'Souza", 'A. R. Rahman', 'Anne-Marie', 'Zoë', 'José García']);
    expectInvalid(
      personName,
      ['Priya2', '-Priya', '.Priya', 'Priya@Sharma'],
      'Use letters, spaces, dots, apostrophes and hyphens',
    );
    expectInvalid(personName, ['   '], 'Enter a name');
    expectInvalid(personName, ['a'.repeat(101)], 'Name is too long');
  });
});

describe('common', () => {
  it('paise: whole, non-negative, safe integers', () => {
    expectValid(paise, [0, 129_900, Number.MAX_SAFE_INTEGER]);
    expectInvalid(paise, [12.5], 'Amount must be a whole number of paise');
    expectInvalid(paise, [-1], 'Amount cannot be negative');
    expectInvalid(paise, [Number.MAX_SAFE_INTEGER + 2, '100', null]);
    expectValid(signedPaise, [-500, 0, 500]);
    expectInvalid(signedPaise, [-0.5], 'Amount must be a whole number of paise');
  });

  it('basis points: 0 to 10000 whole', () => {
    expectValid(basisPoints, [0, 1800, 10_000]);
    expectInvalid(basisPoints, [-1], 'Rate cannot be negative');
    expectInvalid(basisPoints, [10_001], 'Rate cannot be more than 100%');
    expectInvalid(basisPoints, [18.5], 'Rate must be a whole number of basis points');
  });

  it('ids: ObjectId, UUID and UUIDv7', () => {
    expect(objectId.parse('65F1A2B3C4D5E6F708192A3B')).toBe('65f1a2b3c4d5e6f708192a3b');
    expectInvalid(
      objectId,
      ['65f1a2b3c4d5e6f708192a3', '65f1a2b3c4d5e6f708192a3g'],
      'Not a valid id',
    );
    const v4 = '3f6c2a1e-8b4d-4c2a-9f1e-2b3c4d5e6f70';
    const v7 = '0192f3a4-5b6c-7d8e-9f01-23456789abcd';
    expectValid(uuid, [v4, v7]);
    expectValid(uuidv7, [v7]);
    expectInvalid(uuidv7, [v4], 'Not a valid UUIDv7');
    expectInvalid(uuid, ['not-a-uuid'], 'Not a valid UUID');
  });

  it('slug, hex colour, https URL and ISO dates', () => {
    expectValid(slug, ['rose-glow-serum', 'spf50', 'a']);
    expectInvalid(
      slug,
      ['Rose-Glow', 'rose--glow', '-rose', 'rose-', 'rose glow'],
      'Use lower-case letters, digits and single hyphens',
    );
    expect(hexColor.parse('#d6336c')).toBe('#D6336C');
    expectInvalid(
      hexColor,
      ['#D63', 'D6336C', '#D6336CFF', '#G6336C'],
      'Use a colour like #D6336C',
    );
    expectValid(httpsUrl, ['https://beautinique.example/products/rose-glow']);
    expectInvalid(
      httpsUrl,
      ['http://beautinique.example', 'javascript:alert(1)', 'ftp://x.example'],
      'Enter an https:// link',
    );
    expectValid(isoDateTime, ['2026-10-20T07:56:26.899Z', '2026-10-20T07:56:26Z']);
    expectInvalid(
      isoDateTime,
      ['2026-10-20', '2026-10-20T07:56:26+05:30'],
      'Use an ISO date-time in UTC',
    );
    expectValid(isoDate, ['2026-10-20']);
    expectInvalid(isoDate, ['20-10-2026', '2026-13-01'], 'Use a date like 2026-10-20');
  });
});
