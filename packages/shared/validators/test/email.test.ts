import { describe, expect, it } from 'vitest';

import { emailSchema } from '../src/email.ts';
import { refusals } from './utils/refusals.ts';

const MESSAGE = 'Enter a valid email address.';

describe('emailSchema', () => {
  it('AC-PLATFORM-13: accepts a right email address', () => {
    for (const email of [
      'asha@example.com',
      'asha.k+orders@example.co.in',
      'a_b-c@sub.example.org',
      'someone@mail.example',
    ]) {
      expect(refusals(emailSchema, 'email', email), email).toEqual([]);
      expect(emailSchema.parse(email)).toBe(email);
    }
  });

  it('AC-PLATFORM-13: trims and lowercases, so one address is one value', () => {
    expect(emailSchema.parse('  Asha.K@Example.COM ')).toBe('asha.k@example.com');
  });

  it('AC-PLATFORM-13: a wrong email address fails with the field name', () => {
    const wrong = [
      '', // empty
      'asha', // no @
      'asha@', // no domain
      '@example.com', // no name
      'asha@example', // no dot in the domain
      'asha@example.c', // a 1-letter ending
      'asha@@example.com', // two @
      'as ha@example.com', // a space inside
      'asha..k@example.com', // two dots in a row
      '.asha@example.com', // starts with a dot
      'asha@-example.com', // a domain label that starts with a dash
      'asha@192.168.0.1', // an IP address, not a domain
      'ashā@example.com', // a letter outside A to Z
    ];
    for (const email of wrong) {
      expect(refusals(emailSchema, 'email', email), email).toEqual([`email: ${MESSAGE}`]);
    }
    expect(refusals(emailSchema, 'contactEmail', 'nope')).toEqual([`contactEmail: ${MESSAGE}`]);
  });

  it('AC-PLATFORM-13: accepts 254 characters and refuses 255 (RFC 5321)', () => {
    const domain = `${'b'.repeat(60)}.${'b'.repeat(60)}.${'b'.repeat(60)}.com`;
    const at254 = `${'a'.repeat(254 - domain.length - 1)}@${domain}`;
    expect(at254).toHaveLength(254);
    expect(refusals(emailSchema, 'email', at254)).toEqual([]);
    expect(refusals(emailSchema, 'email', `a${at254}`)).toEqual([`email: ${MESSAGE}`]);
  });

  it('AC-PLATFORM-13: refuses what is not text, with the field name', () => {
    for (const value of [undefined, null, 5, {}]) {
      expect(refusals(emailSchema, 'email', value)[0]).toMatch(
        /^email: Invalid input: expected string/,
      );
    }
  });

  it('CR-22, SR-077: never repeats the value it refused', () => {
    const issues = emailSchema.safeParse('asha.private@example').error?.issues;
    expect(JSON.stringify(issues)).not.toContain('asha.private');
  });
});
