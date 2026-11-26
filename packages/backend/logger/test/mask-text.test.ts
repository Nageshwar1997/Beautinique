import { describe, expect, it } from 'vitest';

import { maskSensitiveText } from '../src/index.ts';
import { maskEmails } from '../src/utils/mask-emails.ts';

const mask = (text: string) => maskSensitiveText(text, 1000);

describe('maskEmails', () => {
  it('SR-077: takes out an email address, and keeps the words around it', () => {
    expect(maskEmails('mail asha.k+tag@example.co.in now')).toBe('mail <email> now');
    expect(maskEmails('a@b.com, c@d.org')).toBe('<email>, <email>');
    expect(maskEmails('(asha@example.com)')).toBe('(<email>)');
    expect(maskEmails('to=asha@example.com;')).toBe('to=<email>;');
  });

  it('SR-077: the dot that ends a sentence is not a part of the address', () => {
    expect(maskEmails('Write to asha@example.com.')).toBe('Write to <email>.');
    expect(maskEmails('asha@example.com..')).toBe('<email>..');
  });

  it('SR-077: leaves what is not an address: an @ with nothing on one side, or no dot in the domain', () => {
    for (const text of ['@mention', 'name@', '@', 'a@b', 'price @ 5', 'a@.com', '', 'no at sign']) {
      expect(maskEmails(text), text).toBe(text);
    }
  });

  it('SR-077: many addresses are all read, and two @ in a row make no address', () => {
    expect(maskEmails('a@@b.com')).toBe('a@@b.com');
    expect(maskEmails('x@a.com y@b.com z@c.com')).toBe('<email> <email> <email>');
  });
});

describe('maskSensitiveText', () => {
  it('SR-077: takes out emails, phone numbers, PAN and GSTIN', () => {
    expect(mask('asha@example.com 9876543210 ABCPE1234F 27ABCPE1234F1ZB')).toBe(
      '<email> <phone> <pan> <gstin>',
    );
  });

  it('SR-077: reads the ways a phone number is written', () => {
    expect(mask('call +91 98765 43210')).toBe('call <phone>');
    expect(mask('+91-98765-43210, 98765-43210 and 98765 43210')).toBe(
      '<phone>, <phone> and <phone>',
    );
    expect(mask('+919876543210 and 6123456789')).toBe('<phone> and <phone>');
  });

  it('SR-077: leaves other numbers alone: too short, too long, from 1 to 5, an order number, a port', () => {
    for (const text of [
      '987654321',
      '98765432101',
      '5876543210',
      '1700000000000',
      '4827-1930-56',
      'port 4010',
      '12 34567 89012',
    ]) {
      expect(mask(text), text).toBe(text);
    }
  });

  it('SR-077: takes out a bearer token and a JWT', () => {
    expect(mask('Authorization: Bearer abc.DEF-123_456~+/=')).toBe('Authorization: Bearer <token>');
    expect(mask('bearer abc123')).toBe('Bearer <token>');
    expect(mask('jwt eyJhbGciOi.eyJzdWIiOiIx.SflKxwRJSMeKKF2QT4 end')).toBe('jwt <token> end');
  });

  it('SR-098: the value of a duplicate key is taken out, and the index stays', () => {
    const message =
      'E11000 duplicate key error collection: shop.accounts index: email_1 dup key: { email: "x@y.com" }';

    expect(mask(message)).toBe(
      'E11000 duplicate key error collection: shop.accounts index: email_1 dup key: { <value> }',
    );
  });

  it('CR-40: cuts the text to the length first, so the work is bounded', () => {
    expect(maskSensitiveText('abcdefghij', 4)).toBe('abcd');
    expect(maskSensitiveText('abcd', 4)).toBe('abcd');
    expect(maskSensitiveText('', 4)).toBe('');
  });

  it('CR-40: a very long text with nothing to mask is done at once, and so is one made of the patterns', () => {
    const lots = 'a'.repeat(1_000_000);
    expect(maskSensitiveText(lots, 1_000_000)).toBe(lots);
    const atSigns = '@'.repeat(100_000);
    expect(maskSensitiveText(atSigns, 100_000)).toBe(atSigns);
    const tokens = 'eyJ'.repeat(30_000);
    expect(maskSensitiveText(tokens, 100_000)).toHaveLength(tokens.length);
    const dots = `a@${'b.'.repeat(50_000)}`;
    expect(maskSensitiveText(dots, dots.length)).toBe('<email>.');
  });
});
