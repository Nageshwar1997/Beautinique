import { describe, expect, it } from 'vitest';

import { phoneSchema } from '../src/phone.ts';
import { refusals } from './utils/refusals.ts';
import { itAnswersRequired } from './utils/text-field-cases.ts';

const MESSAGE = 'Phone number must be a valid 10-digit Indian mobile number.';

describe('phoneSchema', () => {
  it('AC-PLATFORM-13: accepts the ways people write one mobile number, and keeps +91 and 10 digits', () => {
    for (const phone of [
      '9876543210',
      '98765 43210',
      '98765-43210',
      '+919876543210',
      '+91 98765 43210',
      '+91-98765-43210',
      '919876543210',
      '91 98765 43210',
      '09876543210',
      '0 98765 43210',
      '  9876543210\n',
    ]) {
      expect(refusals(phoneSchema, 'phone', phone), phone).toEqual([]);
      expect(phoneSchema.parse(phone), phone).toBe('+919876543210');
    }
  });

  it('AC-PLATFORM-13: accepts a number that starts with 6, 7, 8 or 9', () => {
    for (const first of '6789') {
      expect(phoneSchema.parse(`${first}123456789`)).toBe(`+91${first}123456789`);
    }
  });

  it('AC-PLATFORM-13: a number that begins with 91 is not mistaken for the country code', () => {
    expect(phoneSchema.parse('9123456789')).toBe('+919123456789');
    expect(phoneSchema.parse('919123456789')).toBe('+919123456789');
  });

  it('AC-PLATFORM-13: a wrong number fails with the field name', () => {
    const wrong = [
      '987654321', // 9 digits
      '98765432101', // 11 digits that do not start with 0
      '5876543210', // starts with 5
      '0123456789', // starts with 0 and has no 10 digits after it
      '+910987654321', // +91 then a number that starts with 0
      '+449876543210', // another country
      '+1 9876543210', // another country
      '9876543210 ext 5', // not just a number
      '98765x3210', // a letter
      '(98765) 43210', // brackets
      '+91+919876543210', // two country codes
      '9198765432101', // 13 digits
    ];
    for (const phone of wrong) {
      expect(refusals(phoneSchema, 'phone', phone), phone).toEqual([`phone: ${MESSAGE}`]);
    }
    expect(refusals(phoneSchema, 'contactPhone', 'nope')).toEqual([`contactPhone: ${MESSAGE}`]);
  });

  itAnswersRequired(phoneSchema, 'phone', 'Phone number');

  it('CR-22, SR-077: never repeats the value it refused', () => {
    const issues = phoneSchema.safeParse('5876543210').error?.issues;
    expect(JSON.stringify(issues)).not.toContain('5876543210');
  });
});
