import { describe, expect, expectTypeOf, it } from 'vitest';

import { bps, paise, type Bps, type Paise } from '../src/index.ts';

describe('paise', () => {
  it('SR-047: takes a whole number of paise, zero and a negative one too', () => {
    for (const value of [0, 1, 4900, -250, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]) {
      expect(paise(value)).toBe(value);
    }
  });

  it('SR-047: refuses anything that is not a whole number within the safe range', () => {
    const wrong = [
      1.5,
      0.1,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      2 ** 53,
      -(2 ** 53),
      4900.0000001,
    ];
    for (const value of wrong) {
      expect(() => paise(value), String(value)).toThrow(RangeError);
    }
  });

  it('SR-047: a plain number is not an amount until it has been checked', () => {
    expectTypeOf(paise(100)).toEqualTypeOf<Paise>();
    // @ts-expect-error a plain number must go through paise() first
    const unchecked: Paise = 100;
    expect(unchecked).toBe(100);
  });
});

describe('bps', () => {
  it('SR-047: takes a whole number of basis points from 0 to 10000', () => {
    for (const value of [0, 1, 25, 500, 1800, 2800, 10_000]) {
      expect(bps(value)).toBe(value);
    }
  });

  it('SR-047: refuses a fraction, a negative rate and a rate above 100%', () => {
    for (const value of [-1, 10_001, 0.5, 18.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      expect(() => bps(value), String(value)).toThrow(RangeError);
    }
  });

  it('SR-047: a rate and an amount are not the same type', () => {
    expectTypeOf(bps(500)).toEqualTypeOf<Bps>();
    expectTypeOf<Bps>().not.toEqualTypeOf<Paise>();
  });
});
