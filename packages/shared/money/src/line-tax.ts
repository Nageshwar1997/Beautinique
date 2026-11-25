import { BPS_DENOMINATOR, toPaise, type Bps, type Paise } from './paise.ts';
import { roundedDivision } from './utils/rounded-division.ts';

/** Inside one state a sale carries CGST and SGST; between two states it carries IGST. */
export type Supply = 'intra-state' | 'inter-state';

export interface LineTaxInput {
  /** The price of one unit with the GST in it (the MRP rule). */
  unitPrice: Paise;
  quantity: number;
  /** The GST rate, 18% as 1800. */
  rate: Bps;
  supply: Supply;
}

export interface LineTax {
  /** The price of the line, the unit price times the quantity. */
  total: Paise;
  taxable: Paise;
  cgst: Paise;
  sgst: Paise;
  igst: Paise;
}

const DENOMINATOR = BigInt(BPS_DENOMINATOR);

/**
 * Splits the price of a line, GST in it, into the taxable value and the tax (docs/ARCHITECTURE.md
 * §1.8 rules 1 and 2). The tax is worked out on the whole line, not on a unit.
 *
 * 1. The taxable value is the price x 10000 / (10000 + rate), to the paisa.
 * 2. CGST and SGST are each half the rate of that, to the paisa, a half going up; IGST is the
 *    whole rate. The tax does not move after this.
 * 3. The taxable value is then set to what is left of the price, so that taxable + CGST + SGST +
 *    IGST is the price to the paisa, and what moves is the taxable value, by a paisa or so.
 *
 * ₹49 at 5% is ₹46.66 taxable, ₹1.17 CGST and ₹1.17 SGST.
 */
export function lineTax({ unitPrice, quantity, rate, supply }: LineTaxInput): LineTax {
  if (unitPrice < 0) throw new RangeError('A unit price is not negative.');
  if (!Number.isSafeInteger(quantity) || quantity < 1) {
    throw new RangeError('A quantity is a whole number, from 1.');
  }
  const total = BigInt(unitPrice) * BigInt(quantity);
  const rateBig = BigInt(rate);
  const taxable = roundedDivision(total * DENOMINATOR, DENOMINATOR + rateBig);

  const igst = supply === 'inter-state' ? roundedDivision(taxable * rateBig, DENOMINATOR) : 0n;
  // The half rate is worked out as rate / 20000, so an odd number of bps (25 bps) loses nothing.
  const halfTax =
    supply === 'intra-state' ? roundedDivision(taxable * rateBig, 2n * DENOMINATOR) : 0n;
  const tax = igst + 2n * halfTax;
  if (tax > total) {
    throw new RangeError('The price is too small for this rate: the tax would be more than it.');
  }

  return {
    total: toPaise(total),
    taxable: toPaise(total - tax),
    cgst: toPaise(halfTax),
    sgst: toPaise(halfTax),
    igst: toPaise(igst),
  };
}
