# @beautinique/shared-money

Integer paise and basis points: GST split, discount allocation, TCS and TDS rounding, and en-IN rupee formatting. Never a float.

## Install

```sh
npm install @beautinique/shared-money
```

## Usage

An amount is a whole number of paise (a rupee is 100 paise), a rate is a whole number of basis points (18% is 1800). A plain `number` is not an amount until `paise()` or `bps()` has checked it, so a float cannot slip in.

```ts
import { allocate, applyBps, bps, formatMoney, lineTax, paise } from '@beautinique/shared-money';

// ₹49 with 5% GST in it, sold inside one state.
lineTax({ unitPrice: paise(4900), quantity: 1, rate: bps(500), supply: 'intra-state' });
// { total: 4900, taxable: 4666, cgst: 117, sgst: 117, igst: 0 }   (₹46.66 + ₹1.17 + ₹1.17)

// A discount of ₹1.00 shared by three lines, with no paisa lost or made.
allocate(paise(100), [paise(1), paise(1), paise(1)]); // [34, 33, 33]

// 0.5% TCS on ₹1,000.00.
applyBps(paise(100_000), bps(50)); // 500

formatMoney(paise(12_999_950)); // '₹1,29,999.50'
```

## API

- `paise(value)`, `bps(value)`: check a number and give it its type, `Paise` or `Bps`. They throw a `RangeError` for a fraction, `NaN`, a number beyond the safe integers, or (for `bps`) a rate outside 0 to 10000.
- `lineTax({ unitPrice, quantity, rate, supply })`: splits the price of a line, GST in it (the MRP rule), into `total`, `taxable`, `cgst`, `sgst` and `igst`, and `taxable + cgst + sgst + igst` is `total` to the paisa. `supply` is `'intra-state'` (CGST and SGST, half the rate each) or `'inter-state'` (IGST).
  1. The tax is worked out on the whole line (the unit price times the quantity), not on a unit.
  2. The taxable value is `price x 10000 / (10000 + rate)` to the paisa, a half going up. CGST and SGST are each half the rate of it (IGST the whole rate), to the paisa, a half going up.
  3. The taxable value is then set to what is left of the price, so it moves by a paisa or so and the tax does not.

  It throws a `RangeError` for a negative price, a quantity that is not a whole number from 1, a line beyond the safe integers, or a price so small that the tax would be more than it.

- `allocate(total, weights)`: shares `total` among the `weights` in proportion, by the largest remainder, so the parts add up to `total`. The paise left after the whole shares go one each to the biggest fractions, and between two equal fractions to the earlier one, so the answer is always the same. A weight of 0 gets 0. It throws a `RangeError` for a negative amount or weight, or for an amount that is not 0 when every weight is 0.
- `applyBps(amount, rate)`: a rate of an amount (TCS, TDS, a commission, GST on a base without the tax), to the nearest paisa, a half going up.
- `formatMoney(amount, { fraction })`: the amount as rupees for people, the Indian way, with `Intl` (`en-IN`): `₹1,299`, `₹1,29,999`. `fraction: 'auto'` (the default) shows the paise only when there are some (`₹1,299.50`); `fraction: 'always'` shows two decimals (`₹1,299.00`), for an invoice, a refund or a finance screen.

Every calculation is done in `BigInt`, so a product such as price x 10000 is exact even where a float would lose the last digits, and nothing here makes a float.

## Visibility

Public is fine. This is the arithmetic of paise, GST and rounding that the Indian tax rules and the invoice already show to everybody, and the en-IN format of a rupee. It holds no price, no rate table and nothing about how Beautinique sells. Every package is published publicly; this is only to understand it (docs/RULES.md CR-36).
