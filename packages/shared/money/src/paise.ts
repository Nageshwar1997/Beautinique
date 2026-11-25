declare const PAISE: unique symbol;
declare const BPS: unique symbol;

/**
 * An amount of money: a whole number of paise (a rupee is 100 paise). Never a float, never a
 * decimal (docs/ARCHITECTURE.md §10.1 rule 5). A plain `number` is not a `Paise` until `paise()`
 * has checked it, so a float cannot slip in by mistake.
 */
export type Paise = number & { readonly [PAISE]: true };

/** A rate in basis points: a whole number from 0 to 10000 (18% is 1800, 0.5% is 50). */
export type Bps = number & { readonly [BPS]: true };

/** 100% in basis points. */
export const BPS_DENOMINATOR = 10_000;

export function paise(value: number): Paise {
  if (!Number.isSafeInteger(value)) {
    throw new RangeError("An amount is a whole number of paise, within JavaScript's safe range.");
  }
  return value as Paise;
}

export function bps(value: number): Bps {
  if (!Number.isInteger(value) || value < 0 || value > BPS_DENOMINATOR) {
    throw new RangeError('A rate is a whole number of basis points, from 0 to 10000.');
  }
  return value as Bps;
}

// The result of a BigInt calculation, back as `Paise`. Every calculation here is done in BigInt, so
// a product such as price x 10000 is exact, never a rounded float; this only checks that the
// answer fits a safe integer again.
export function toPaise(value: bigint): Paise {
  return paise(Number(value));
}
