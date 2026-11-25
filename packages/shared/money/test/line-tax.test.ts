import { assert, constantFrom, integer, oneof, property } from 'fast-check';
import { describe, expect, it } from 'vitest';

import { bps, lineTax, paise, type Supply } from '../src/index.ts';

const GST_SLABS = [0, 500, 1200, 1800, 2800];
const SUPPLIES: Supply[] = ['intra-state', 'inter-state'];

function split(unitPrice: number, quantity: number, rate: number, supply: Supply) {
  return lineTax({ unitPrice: paise(unitPrice), quantity, rate: bps(rate), supply });
}

describe('lineTax: the numbers of the docs', () => {
  it('AC-PLATFORM-9: ₹49 at 5% is ₹46.66 taxable, ₹1.17 CGST and ₹1.17 SGST', () => {
    expect(split(4900, 1, 500, 'intra-state')).toEqual({
      total: 4900,
      taxable: 4666,
      cgst: 117,
      sgst: 117,
      igst: 0,
    });
  });

  it('AC-PLATFORM-9: ₹1,180 at 18% is ₹1,000.00 taxable, ₹90.00 CGST and ₹90.00 SGST', () => {
    expect(split(118_000, 1, 1800, 'intra-state')).toEqual({
      total: 118_000,
      taxable: 100_000,
      cgst: 9000,
      sgst: 9000,
      igst: 0,
    });
  });

  it('AC-PLATFORM-9: a fee of ₹29.00 at 18% is ₹24.58 and ₹4.42 of GST', () => {
    const fee = split(2900, 1, 1800, 'intra-state');
    expect(fee.taxable).toBe(2458);
    expect(fee.cgst + fee.sgst).toBe(442);
  });

  it('AC-PLATFORM-9: between two states the same price carries one IGST', () => {
    expect(split(4900, 1, 500, 'inter-state')).toEqual({
      total: 4900,
      taxable: 4667,
      cgst: 0,
      sgst: 0,
      igst: 233,
    });
    expect(split(118_000, 1, 1800, 'inter-state')).toEqual({
      total: 118_000,
      taxable: 100_000,
      cgst: 0,
      sgst: 0,
      igst: 18_000,
    });
  });

  it('AC-PLATFORM-9: a 0% line is all taxable value', () => {
    expect(split(4900, 1, 0, 'intra-state')).toEqual({
      total: 4900,
      taxable: 4900,
      cgst: 0,
      sgst: 0,
      igst: 0,
    });
  });
});

describe('lineTax: many units and odd rates', () => {
  it('AC-PLATFORM-9: the tax is worked out on the line, not on a unit', () => {
    // One unit of ₹49 at 5% pays 2 x ₹1.17 = ₹2.34. Three units pay on the line of ₹147: ₹7.00,
    // not 3 x ₹2.34 = ₹7.02.
    const perUnit = split(4900, 1, 500, 'intra-state');
    const line = split(4900, 3, 500, 'intra-state');
    expect(line.total).toBe(14_700);
    expect(line).toEqual(split(14_700, 1, 500, 'intra-state'));
    expect(line.cgst + line.sgst).toBe(700);
    expect((perUnit.cgst + perUnit.sgst) * 3).toBe(702);
  });

  it('AC-PLATFORM-9: a rate of an odd number of bps splits into two halves without losing a half bps', () => {
    // 25 bps = 0.25%: each of CGST and SGST is 12.5 bps of the taxable value.
    const line = split(10_000_000, 1, 25, 'intra-state');
    expect(line.total).toBe(10_000_000);
    expect(line.cgst).toBe(line.sgst);
    expect(line.cgst + line.sgst + line.taxable).toBe(10_000_000);
    expect(line.cgst).toBe(12_469); // round(9975062 x 12.5 / 10000)
  });

  it('SR-047: is exact where a float of the price x 10000 would not be', () => {
    // 9e15 paise x 10000 is 9e19, beyond 2^53 where a float loses the last digits.
    const line = split(9_000_000_000_000, 1000, 1800, 'intra-state');
    expect(line.total).toBe(9_000_000_000_000_000);
    expect(line.taxable + line.cgst + line.sgst).toBe(9_000_000_000_000_000);
    expect(line.cgst).toBe(line.sgst);
  });
});

describe('lineTax: refused', () => {
  it('SR-047: a negative price, or a quantity that is not a whole number from 1', () => {
    expect(() => split(-1, 1, 500, 'intra-state')).toThrow('not negative');
    for (const quantity of [0, -1, 1.5, Number.NaN, 2 ** 53]) {
      expect(() => split(4900, quantity, 500, 'intra-state'), String(quantity)).toThrow(
        'whole number, from 1',
      );
    }
  });

  it('SR-047: a price so small that the tax would be more than it', () => {
    expect(() => split(1, 1, 10_000, 'intra-state')).toThrow('too small');
  });

  it('SR-047: a line that is beyond the safe range', () => {
    expect(() => split(2 ** 52, 4, 500, 'intra-state')).toThrow(RangeError);
  });
});

describe('lineTax: for any price, rate and quantity (property)', () => {
  const unitPrice = integer({ min: 0, max: 10 ** 12 });
  const quantity = integer({ min: 1, max: 9000 });
  const rate = oneof(constantFrom(...GST_SLABS), integer({ min: 0, max: 4000 }));
  const supply = constantFrom(...SUPPLIES);

  it('AC-PLATFORM-9: taxable + CGST + SGST + IGST is the price to the paisa, and nothing is a fraction or negative', () => {
    assert(
      property(unitPrice, quantity, rate, supply, (price, units, bpsRate, kind) => {
        const line = split(price, units, bpsRate, kind);
        expect(line.total).toBe(price * units);
        expect(line.taxable + line.cgst + line.sgst + line.igst).toBe(line.total);
        for (const amount of Object.values(line)) {
          expect(Number.isSafeInteger(amount)).toBe(true);
          expect(amount).toBeGreaterThanOrEqual(0);
        }
      }),
      { numRuns: 2000 },
    );
  });

  it('AC-PLATFORM-9: CGST and SGST are equal inside a state, IGST is the only tax between two', () => {
    assert(
      property(unitPrice, quantity, rate, supply, (price, units, bpsRate, kind) => {
        const line = split(price, units, bpsRate, kind);
        if (kind === 'intra-state') {
          expect(line.cgst).toBe(line.sgst);
          expect(line.igst).toBe(0);
        } else {
          expect(line.cgst).toBe(0);
          expect(line.sgst).toBe(0);
        }
      }),
    );
  });

  it('AC-PLATFORM-9: the taxable value is within a paisa of price x 10000 / (10000 + rate)', () => {
    assert(
      property(unitPrice, quantity, rate, supply, (price, units, bpsRate, kind) => {
        const line = split(price, units, bpsRate, kind);
        // |taxable - exact| < 2 paise, shown without a division: |taxable x (10000 + r) - total x 10000| < 2 x (10000 + r).
        const denominator = 10_000n + BigInt(bpsRate);
        const gap = BigInt(line.taxable) * denominator - BigInt(line.total) * 10_000n;
        const absoluteGap = gap < 0n ? -gap : gap;
        expect(absoluteGap < 2n * denominator).toBe(true);
      }),
    );
  });

  it('AC-PLATFORM-9: the same line in one unit or in many gives the same answer', () => {
    assert(
      property(unitPrice, quantity, rate, supply, (price, units, bpsRate, kind) => {
        expect(split(price, units, bpsRate, kind)).toEqual(split(price * units, 1, bpsRate, kind));
      }),
    );
  });

  it('AC-PLATFORM-9: even at any rate up to 100%, the answer is a right split or a refusal, never a negative part', () => {
    assert(
      property(
        integer({ min: 0, max: 10_000 }),
        integer({ min: 0, max: 10_000 }),
        supply,
        (price, bpsRate, kind) => {
          try {
            const line = split(price, 1, bpsRate, kind);
            expect(line.taxable + line.cgst + line.sgst + line.igst).toBe(price);
            expect(line.taxable).toBeGreaterThanOrEqual(0);
          } catch (error) {
            expect(error).toBeInstanceOf(RangeError);
          }
        },
      ),
      { numRuns: 2000 },
    );
  });
});
