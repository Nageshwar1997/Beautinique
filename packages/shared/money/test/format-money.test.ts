import { assert, integer, property } from 'fast-check';
import { describe, expect, it } from 'vitest';

import { formatMoney, paise } from '../src/index.ts';

const show = (amount: number, fraction?: 'auto' | 'always') =>
  formatMoney(paise(amount), fraction === undefined ? undefined : { fraction });

describe('formatMoney', () => {
  it('DS-4.5, CR-30: groups the Indian way, ₹1,299 and ₹1,29,999', () => {
    expect(show(129_900)).toBe('₹1,299');
    expect(show(12_999_900)).toBe('₹1,29,999');
    expect(show(100_000_000_000)).toBe('₹1,00,00,00,000');
    expect(show(500)).toBe('₹5');
  });

  it('DS-4.5: shows the paise only when there are some, ₹1,299.50', () => {
    expect(show(129_950)).toBe('₹1,299.50');
    expect(show(129_905)).toBe('₹1,299.05');
    expect(show(5)).toBe('₹0.05');
    expect(show(50)).toBe('₹0.50');
    expect(show(0)).toBe('₹0');
    expect(show(129_900, 'auto')).toBe('₹1,299');
  });

  it('DS-4.5: always shows two decimals for an invoice, a refund and the finance screens', () => {
    expect(show(129_900, 'always')).toBe('₹1,299.00');
    expect(show(129_950, 'always')).toBe('₹1,299.50');
    expect(show(0, 'always')).toBe('₹0.00');
    expect(show(12_999_900, 'always')).toBe('₹1,29,999.00');
  });

  it('DS-4.5: a negative amount has the sign in front of the rupee', () => {
    expect(show(-129_900)).toBe('-₹1,299');
    expect(show(-129_950)).toBe('-₹1,299.50');
    expect(show(-5, 'always')).toBe('-₹0.05');
  });

  it('SR-047: is exact for the biggest amount a float cannot hold exactly as rupees', () => {
    // 9007199254740991 paise = ₹90,071,992,547,409.91: a float of the rupees would be off.
    expect(show(Number.MAX_SAFE_INTEGER)).toBe('₹9,00,71,99,25,47,409.91');
    expect(show(Number.MIN_SAFE_INTEGER)).toBe('-₹9,00,71,99,25,47,409.91');
  });
});

describe('formatMoney: for any amount (property)', () => {
  const amount = integer({ min: Number.MIN_SAFE_INTEGER, max: Number.MAX_SAFE_INTEGER });

  it('SR-047, DS-4.5: the text holds the same rupees and paise as the amount, and groups in 3 then 2s', () => {
    assert(
      property(amount, (value) => {
        const text = show(value, 'always');
        // -₹1,29,999.50: sign, rupees in the Indian groups, and exactly two decimals.
        expect(text).toMatch(/^-?₹(\d{1,3}|\d{1,2}(,\d{2})*,\d{3})\.\d{2}$/);
        const digits = text.replace(/[^\d]/g, '');
        const absolute = String(Math.abs(value)).padStart(3, '0');
        expect(digits).toBe(absolute);
        expect(text.startsWith('-')).toBe(value < 0);
      }),
      { numRuns: 2000 },
    );
  });

  it('DS-4.5: "auto" is "always" without the .00 of whole rupees', () => {
    assert(
      property(amount, (value) => {
        const always = show(value, 'always');
        expect(show(value, 'auto')).toBe(value % 100 === 0 ? always.replace(/\.00$/, '') : always);
      }),
    );
  });
});
