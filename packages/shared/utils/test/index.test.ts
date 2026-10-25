import { describe, expect, it } from 'vitest';

import * as api from '../src/index';
import {
  allocate,
  applyRate,
  assertNever,
  discountPercent,
  formatDate,
  formatDateTime,
  formatINR,
  formatNumber,
  formatTime,
  initials,
  invariant,
  IST,
  istDateKey,
  maskEmail,
  maskPhone,
  paiseToRupees,
  plural,
  rupeesToPaise,
  slugify,
  taxFromInclusive,
  truncate,
  uuidv7,
  uuidv7Time,
} from '../src/index';

/** Intl may use narrow no-break spaces; compare with plain spaces. */
const plain = (text: string) => text.replace(/\s/g, ' ');

describe('public API', () => {
  it('exports exactly these helpers', () => {
    expect(Object.keys(api).sort()).toEqual(
      [
        'IST',
        'allocate',
        'applyRate',
        'assertNever',
        'discountPercent',
        'formatDate',
        'formatDateTime',
        'formatINR',
        'formatNumber',
        'formatTime',
        'initials',
        'invariant',
        'istDateKey',
        'maskEmail',
        'maskPhone',
        'paiseToRupees',
        'plural',
        'rupeesToPaise',
        'slugify',
        'taxFromInclusive',
        'truncate',
        'uuidv7',
        'uuidv7Time',
      ].sort(),
    );
  });
});

describe('money', () => {
  it('formats paise as rupees with Indian grouping', () => {
    expect(formatINR(129_900)).toBe('₹1,299');
    expect(formatINR(129_950)).toBe('₹1,299.50');
    expect(formatINR(129_905)).toBe('₹1,299.05');
    expect(formatINR(10_000_000)).toBe('₹1,00,000');
    expect(formatINR(0)).toBe('₹0');
    expect(formatINR(-50_000)).toBe('-₹500');
    expect(formatINR(129_900, { showPaise: 'always' })).toBe('₹1,299.00');
    expect(formatINR(129_950, { showPaise: 'never' })).toBe('₹1,300');
    expect(formatINR(129_949, { showPaise: 'never' })).toBe('₹1,299');
    expect(() => formatINR(12.5)).toThrow(RangeError);
    expect(() => formatINR(Number.NaN)).toThrow('must be a whole number of paise');
  });

  it('converts rupees to paise exactly and refuses what it cannot convert', () => {
    expect(rupeesToPaise('₹1,299.50')).toBe(129_950);
    expect(rupeesToPaise('₹ 1,00,000')).toBe(10_000_000);
    expect(rupeesToPaise(19.99)).toBe(1999); // 19.99 * 100 is 1998.9999... in floating point
    expect(rupeesToPaise(0.1)).toBe(10);
    expect(rupeesToPaise('0.5')).toBe(50);
    expect(rupeesToPaise('-12.05')).toBe(-1205);
    expect(rupeesToPaise(' 7 ')).toBe(700);
    for (const bad of ['1.005', '', 'abc', '1.2.3', '.5', '1e3', Number.POSITIVE_INFINITY, 1e21]) {
      expect(() => rupeesToPaise(bad), String(bad)).toThrow(RangeError);
    }
    expect(paiseToRupees(129_950)).toBe(1299.5);
    expect(() => paiseToRupees(0.5)).toThrow(RangeError);
  });

  it('applies a rate in basis points, rounding halves away from zero', () => {
    expect(applyRate(9999, 1800)).toBe(1800); // 1799.82
    expect(applyRate(250, 200)).toBe(5);
    expect(applyRate(25, 200)).toBe(1); // 0.5 → 1
    expect(applyRate(24, 200)).toBe(0); // 0.48 → 0
    expect(applyRate(-25, 200)).toBe(-1);
    expect(applyRate(100_000, 10_000)).toBe(100_000);
    expect(applyRate(Number.MAX_SAFE_INTEGER, 1)).toBe(900_719_925_474); // BigInt maths, no overflow
    expect(() => applyRate(100, 10_001)).toThrow('basis points');
    expect(() => applyRate(100, -1)).toThrow('basis points');
    expect(() => applyRate(100, 1.5)).toThrow('basis points');
  });

  it('splits a tax-inclusive price into taxable value and tax that add up exactly', () => {
    expect(taxFromInclusive(129_900, 1800)).toEqual({ taxable: 110_085, tax: 19_815 });
    expect(taxFromInclusive(118, 1800)).toEqual({ taxable: 100, tax: 18 });
    expect(taxFromInclusive(0, 1800)).toEqual({ taxable: 0, tax: 0 });
    expect(taxFromInclusive(500, 0)).toEqual({ taxable: 500, tax: 0 });
    for (let gross = 1; gross < 2000; gross += 7) {
      for (const rate of [500, 1200, 1800, 2800]) {
        const { taxable, tax } = taxFromInclusive(gross, rate);
        expect(taxable + tax).toBe(gross);
        expect(Math.abs(taxable * (10_000 + rate) - gross * 10_000)).toBeLessThanOrEqual(
          (10_000 + rate) / 2,
        );
      }
    }
    expect(() => taxFromInclusive(-1, 1800)).toThrow('cannot be negative');
  });

  it('never overstates a discount', () => {
    expect(discountPercent(159_900, 129_900)).toBe(18); // 18.76%
    expect(discountPercent(100_000, 50_000)).toBe(50);
    expect(discountPercent(100_000, 100_000)).toBe(0);
    expect(discountPercent(100_000, 120_000)).toBe(0);
    expect(discountPercent(0, 0)).toBe(0);
    expect(discountPercent(1000, 0)).toBe(100);
    expect(() => discountPercent(1000, -1)).toThrow('cannot be negative');
  });

  it('allocates paise in proportion, adding up exactly', () => {
    expect(allocate(1000, [1, 1, 1])).toEqual([334, 333, 333]);
    expect(allocate(100, [50_000, 30_000, 20_000])).toEqual([50, 30, 20]);
    expect(allocate(10, [1, 2])).toEqual([3, 7]); // 3.33 + 6.67: the larger remainder gets the paisa
    expect(allocate(5, [0, 3])).toEqual([0, 5]);
    expect(allocate(0, [1, 2])).toEqual([0, 0]);
    for (const [total, weights] of [
      [997, [3, 5, 7, 11]],
      [1, [1, 1, 1]],
      [12_345, [999, 1, 50]],
    ] as const) {
      const parts = allocate(total, weights);
      expect(parts.reduce((a, b) => a + b, 0)).toBe(total);
    }
    expect(() => allocate(10, [])).toThrow('cannot be empty');
    expect(() => allocate(10, [0, 0])).toThrow('cannot all be 0');
    expect(() => allocate(10, [1, -1])).toThrow('0 or more');
    expect(() => allocate(-10, [1])).toThrow('cannot be negative');
  });
});

describe('dates (India time)', () => {
  const at = '2026-10-20T07:56:26.899Z'; // 1:26 pm in India

  it('formats dates and times in India time', () => {
    expect(IST).toBe('Asia/Kolkata');
    expect(formatDate(at)).toBe('20 Oct 2026');
    expect(plain(formatTime(at))).toBe('1:26 pm');
    expect(plain(formatDateTime(at))).toBe('20 Oct 2026, 1:26 pm');
    expect(formatDate(new Date(at))).toBe('20 Oct 2026');
    expect(formatDate(Date.parse(at))).toBe('20 Oct 2026');
    expect(plain(formatTime(at, { timeZone: 'UTC' }))).toBe('7:56 am');
  });

  it('uses the India calendar day across the UTC midnight', () => {
    expect(istDateKey('2026-10-19T18:29:59Z')).toBe('2026-10-19');
    expect(istDateKey('2026-10-19T18:30:00Z')).toBe('2026-10-20');
    expect(formatDate('2026-10-19T20:00:00Z')).toBe('20 Oct 2026');
  });

  it('refuses things that are not dates', () => {
    expect(() => formatDate('not a date')).toThrow('Not a date');
    expect(() => istDateKey(Number.NaN)).toThrow(RangeError);
  });
});

describe('text', () => {
  it('numbers and plurals', () => {
    expect(formatNumber(123_456)).toBe('1,23,456');
    expect(formatNumber(4.567)).toBe('4.57');
    expect(() => formatNumber(Number.POSITIVE_INFINITY)).toThrow(RangeError);
    expect(plural(1, 'item')).toBe('1 item');
    expect(plural(0, 'item')).toBe('0 items');
    expect(plural(2341, 'rating')).toBe('2,341 ratings');
    expect(plural(3, 'box', 'boxes')).toBe('3 boxes');
  });

  it('slugs', () => {
    expect(slugify('Rosé Glow & Vitamin C — 30 ml!')).toBe('rose-glow-and-vitamin-c-30-ml');
    expect(slugify('  --Hello__World--  ')).toBe('hello-world');
    expect(slugify('!!!')).toBe('');
    const long = slugify(`${'word '.repeat(40)}end`);
    expect(long.length).toBeLessThanOrEqual(120);
    expect(long).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    expect(slugify('x'.repeat(130))).toHaveLength(120);
  });

  it('masks phone numbers and emails', () => {
    expect(maskPhone('9876543210')).toBe('98******10');
    expect(maskPhone('+91 98765 43210')).toBe('91********10');
    expect(maskPhone('1234')).toBe('****');
    expect(maskEmail('priya.sharma@example.com')).toBe('pr**********@example.com');
    expect(maskEmail('ab@example.com')).toBe('a*@example.com');
    expect(maskEmail('a@example.com')).toBe('a@example.com');
    expect(maskEmail('no-at-sign')).toBe('**********');
  });

  it('initials and truncation', () => {
    expect(initials('Priya Sharma')).toBe('PS');
    expect(initials('  priya  ')).toBe('P');
    expect(initials('A. R. Rahman')).toBe('AR');
    expect(initials('Anne Marie Smith', 3)).toBe('AMS');
    expect(initials('')).toBe('');
    expect(truncate('Rose Glow Vitamin C Serum', 10)).toBe('Rose Glow…');
    expect(truncate('Short', 10)).toBe('Short');
    expect(truncate('Zoë 😀 smiles', 6)).toBe('Zoë 😀…');
    expect(() => truncate('x', 0)).toThrow(RangeError);
  });
});

describe('uuidv7', () => {
  it('has the v7 layout and carries its creation time', () => {
    const now = Date.parse('2026-10-20T07:56:26.899Z');
    const id = uuidv7(now);
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(uuidv7Time(id)).toBe(now);
    expect(() => uuidv7Time('3f6c2a1e-8b4d-4c2a-9f1e-2b3c4d5e6f70')).toThrow('Not a UUIDv7');
  });

  it('sorts in creation order, within a millisecond and when the clock steps back', () => {
    const now = Date.parse('2030-01-01T00:00:00Z');
    const ids = [uuidv7(now), uuidv7(now), uuidv7(now), uuidv7(now - 5_000), uuidv7(now + 1)];
    expect([...ids].sort()).toEqual(ids);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('moves to the next millisecond when the counter runs out', () => {
    const now = Date.parse('2031-01-01T00:00:00Z');
    const ids = Array.from({ length: 5000 }, () => uuidv7(now));
    expect([...ids].sort()).toEqual(ids);
    expect(uuidv7Time(ids.at(-1) ?? '')).toBeGreaterThan(now);
  });
});

describe('assertions', () => {
  it('invariant throws only when the condition is false', () => {
    expect(() => {
      invariant(1 + 1 === 2, 'maths');
    }).not.toThrow();
    expect(() => {
      invariant(null, 'Order must exist');
    }).toThrow('Order must exist');
  });

  it('assertNever throws with the unexpected value', () => {
    expect(() => assertNever('x' as never, 'Unknown status')).toThrow('Unknown status: "x"');
  });
});

describe('money: limits and bad input', () => {
  it('refuses an amount too large to be whole paise, instead of rounding it', () => {
    expect(rupeesToPaise('90071992547409.91')).toBe(Number.MAX_SAFE_INTEGER);
    expect(() => rupeesToPaise('90071992547409.92')).toThrow('too large for paise');
  });

  it('names a number that is not an amount at all', () => {
    expect(() => rupeesToPaise(Infinity)).toThrow('Not an amount in rupees: Infinity');
    expect(() => rupeesToPaise(Number.NaN)).toThrow('Not an amount in rupees: NaN');
  });

  it('refuses a negative selling price whatever the MRP is', () => {
    expect(() => discountPercent(0, -100)).toThrow('sellingPaise cannot be negative');
    expect(() => discountPercent(100_000, -100)).toThrow('sellingPaise cannot be negative');
  });

  it('refuses weights that are not whole numbers, saying so', () => {
    expect(() => allocate(100, [1.5, 2])).toThrow('weights must be whole numbers');
    expect(() => allocate(100, [-1, 2])).toThrow('weights must be whole numbers');
  });
});
