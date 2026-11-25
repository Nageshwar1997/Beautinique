import { BPS_DENOMINATOR, toPaise, type Bps, type Paise } from './paise.ts';
import { roundedDivision } from './utils/rounded-division.ts';

/**
 * A rate of an amount, to the nearest paisa, a half paisa going up: TCS, TDS, a commission
 * (docs/ARCHITECTURE.md §1.8 rule 6). 50 bps of ₹1,000.00 is ₹5.00.
 */
export function applyBps(amount: Paise, rate: Bps): Paise {
  if (amount < 0) throw new RangeError('The amount a rate is taken of is not negative.');
  return toPaise(roundedDivision(BigInt(amount) * BigInt(rate), BigInt(BPS_DENOMINATOR)));
}
