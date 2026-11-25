import { array, assert, integer, property } from 'fast-check';
import { describe, expect, it } from 'vitest';

import { allocate, paise } from '../src/index.ts';

function share(total: number, weights: number[]): number[] {
  return allocate(paise(total), weights.map(paise));
}

describe('allocate', () => {
  it('AC-PLATFORM-9: a discount of ₹1.00 shared by three equal lines is 34, 33 and 33 paise', () => {
    expect(share(100, [1, 1, 1])).toEqual([34, 33, 33]);
    expect(share(100, [500, 500, 500])).toEqual([34, 33, 33]);
  });

  it('AC-PLATFORM-9: the paise that are left go to the biggest fractions', () => {
    // Exact shares are 1.67, 3.33 and 5.00: the only paisa left goes to the 0.67.
    expect(share(10, [1, 2, 3])).toEqual([2, 3, 5]);
    // 7 x [3, 3, 4] / 10 = 2.1, 2.1, 2.8: the only paisa left goes to the 0.8.
    expect(share(7, [3, 3, 4])).toEqual([2, 2, 3]);
    // 8 x [3, 3, 4] / 10 = 2.4, 2.4, 3.2: the two 0.4 are equal, so the earlier one gets it.
    expect(share(8, [3, 3, 4])).toEqual([3, 2, 3]);
  });

  it('AC-PLATFORM-9: between two equal fractions the earlier one gets the paisa, every time', () => {
    expect(share(1, [1, 1])).toEqual([1, 0]);
    expect(share(2, [1, 1, 1])).toEqual([1, 1, 0]);
    expect(share(5, [1, 1, 1, 1])).toEqual([2, 1, 1, 1]);
  });

  it('AC-PLATFORM-9: two equal weights with a paisa left: the earlier gets it, not the bigger index', () => {
    // Found by the property test: the shares are 499511716853.5 each, and the earlier line gets the half.
    expect(share(999_023_433_707, [999_999_981, 999_999_981])).toEqual([
      499_511_716_854, 499_511_716_853,
    ]);
  });

  it('AC-PLATFORM-9: a weight of 0 gets nothing', () => {
    expect(share(100, [0, 1, 0, 3])).toEqual([0, 25, 0, 75]);
    expect(share(1, [0, 5, 0])).toEqual([0, 1, 0]);
  });

  it('AC-PLATFORM-9: one line takes the whole amount, and 0 shares as 0', () => {
    expect(share(12_345, [999])).toEqual([12_345]);
    expect(share(0, [1, 2, 3])).toEqual([0, 0, 0]);
    expect(share(0, [0, 0])).toEqual([0, 0]);
    expect(share(0, [])).toEqual([]);
  });

  it('SR-047: is exact for amounts whose product is beyond a float', () => {
    const total = Number.MAX_SAFE_INTEGER;
    const parts = share(total, [total, total, total]);
    expect(parts.reduce((sum, part) => sum + part, 0)).toBe(total);
    expect(parts).toEqual([3_002_399_751_580_331, 3_002_399_751_580_330, 3_002_399_751_580_330]);
  });

  it('SR-047: refuses what cannot be shared', () => {
    expect(() => share(-1, [1, 2])).toThrow('not negative');
    expect(() => share(10, [1, -2])).toThrow('A weight is not negative');
    expect(() => share(10, [0, 0])).toThrow('every weight is 0');
    expect(() => share(10, [])).toThrow('every weight is 0');
  });
});

describe('allocate: for any amount and weights (property)', () => {
  const total = integer({ min: 0, max: 10 ** 12 });
  const weights = array(integer({ min: 0, max: 10 ** 9 }), { minLength: 1, maxLength: 12 }).filter(
    (list) => list.some((weight) => weight > 0),
  );

  it('AC-PLATFORM-9: the parts add up to the amount to the paisa, and none is negative', () => {
    assert(
      property(total, weights, (amount, list) => {
        const parts = share(amount, list);
        expect(parts).toHaveLength(list.length);
        expect(parts.reduce((sum, part) => sum + part, 0)).toBe(amount);
        for (const part of parts) {
          expect(Number.isSafeInteger(part)).toBe(true);
          expect(part).toBeGreaterThanOrEqual(0);
        }
      }),
      { numRuns: 2000 },
    );
  });

  it('AC-PLATFORM-9: each part is within one paisa of its exact share, and a weight of 0 gets 0', () => {
    assert(
      property(total, weights, (amount, list) => {
        const parts = share(amount, list);
        const weightSum = list.reduce((sum, weight) => sum + BigInt(weight), 0n);
        parts.forEach((part, index) => {
          // |part - amount x weight / sum| < 1, shown without a division.
          const gap = BigInt(part) * weightSum - BigInt(amount) * BigInt(list[index] ?? 0);
          expect((gap < 0n ? -gap : gap) < weightSum).toBe(true);
          if (list[index] === 0) expect(part).toBe(0);
        });
      }),
    );
  });

  it('AC-PLATFORM-9: a bigger weight never gets a smaller part; equal weights differ by a paisa at most, the earlier one first', () => {
    assert(
      property(total, weights, (amount, list) => {
        const parts = share(amount, list);
        for (const [i, weightI] of list.entries()) {
          for (const [j, weightJ] of list.entries()) {
            const partI = parts[i] ?? 0;
            const partJ = parts[j] ?? 0;
            if (weightI > weightJ) expect(partI).toBeGreaterThanOrEqual(partJ);
            if (weightI === weightJ) {
              expect(Math.abs(partI - partJ)).toBeLessThanOrEqual(1);
              if (i < j) expect(partI).toBeGreaterThanOrEqual(partJ);
            }
          }
        }
      }),
      { numRuns: 1000 },
    );
  });

  it('AC-PLATFORM-9: the same weights always give the same parts', () => {
    assert(
      property(total, weights, (amount, list) => {
        expect(share(amount, list)).toEqual(share(amount, [...list]));
      }),
    );
  });
});
