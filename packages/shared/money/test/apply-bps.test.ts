import { assert, integer, property } from 'fast-check';
import { describe, expect, it } from 'vitest';

import { applyBps, bps, paise } from '../src/index.ts';

describe('applyBps', () => {
  it('AC-PLATFORM-9: gives the numbers of docs/ARCHITECTURE.md §1.8 and the worked example', () => {
    // GST on a commission and a fee, worked out on the amount without the tax.
    expect(applyBps(paise(11_500), bps(1800))).toBe(2070); // (₹100 + ₹15) at 18% = ₹20.70
    expect(applyBps(paise(1000), bps(500))).toBe(50); // ₹10 at 5% = ₹0.50
    // TCS at 0.5% and TDS at 0.1% of ₹1,000.00.
    expect(applyBps(paise(100_000), bps(50))).toBe(500);
    expect(applyBps(paise(100_000), bps(10))).toBe(100);
  });

  it('AC-PLATFORM-9: a half paisa goes up, less than a half goes down', () => {
    expect(applyBps(paise(1), bps(5000))).toBe(1); // 0.5 paisa
    expect(applyBps(paise(1), bps(4999))).toBe(0); // 0.4999 paisa
    expect(applyBps(paise(3), bps(5000))).toBe(2); // 1.5 paise
    expect(applyBps(paise(5), bps(1000))).toBe(1); // 0.5 paisa
    expect(applyBps(paise(4), bps(1000))).toBe(0); // 0.4 paisa
  });

  it('AC-PLATFORM-9: 0% is nothing, 100% is the whole amount', () => {
    expect(applyBps(paise(123_456), bps(0))).toBe(0);
    expect(applyBps(paise(123_456), bps(10_000))).toBe(123_456);
    expect(applyBps(paise(0), bps(1800))).toBe(0);
  });

  it('SR-047: is exact for an amount a float could not hold times the rate', () => {
    const big = paise(Number.MAX_SAFE_INTEGER);
    expect(applyBps(big, bps(10_000))).toBe(Number.MAX_SAFE_INTEGER);
    expect(applyBps(big, bps(5000))).toBe(4_503_599_627_370_496); // 2^52, the half of 2^53 - 1 up
  });

  it('SR-047: refuses a negative amount', () => {
    expect(() => applyBps(paise(-1), bps(500))).toThrow(RangeError);
  });

  it('AC-PLATFORM-9: is within half a paisa of the exact answer, and a half goes up (property)', () => {
    assert(
      property(
        integer({ min: 0, max: 10 ** 12 }),
        integer({ min: 0, max: 10_000 }),
        (amount, rate) => {
          const result = applyBps(paise(amount), bps(rate));
          // result is round(amount x rate / 10000): -5000 < result x 10000 - amount x rate <= 5000.
          const difference = BigInt(result) * 10_000n - BigInt(amount) * BigInt(rate);
          expect(difference > -5000n && difference <= 5000n).toBe(true);
          expect(Number.isInteger(result)).toBe(true);
        },
      ),
      { numRuns: 1000 },
    );
  });

  it('AC-PLATFORM-9: a bigger amount never gives a smaller answer (property)', () => {
    assert(
      property(
        integer({ min: 0, max: 10 ** 12 }),
        integer({ min: 0, max: 10 ** 6 }),
        integer({ min: 0, max: 10_000 }),
        (amount, more, rate) => {
          expect(applyBps(paise(amount + more), bps(rate))).toBeGreaterThanOrEqual(
            applyBps(paise(amount), bps(rate)),
          );
        },
      ),
    );
  });
});
