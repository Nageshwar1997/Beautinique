/** Money in Beautinique is always integer paise (₹1 = 100) and rates are basis points (1% = 100). */

function assertPaise(value: number, name = 'paise'): void {
  if (!Number.isSafeInteger(value)) {
    throw new RangeError(`${name} must be a whole number of paise, got ${String(value)}`);
  }
}

function assertBasisPoints(value: number): void {
  if (!Number.isInteger(value) || value < 0 || value > 10_000) {
    throw new RangeError(`rate must be 0 to 10000 basis points, got ${String(value)}`);
  }
}

function toSafeNumber(value: bigint): number {
  const result = Number(value);
  if (!Number.isSafeInteger(result)) {
    throw new RangeError(`result ${value.toString()} is too large for paise`);
  }
  return result;
}

/** Rounds numerator / denominator to the nearest integer, halves away from zero. */
function divideRounded(numerator: bigint, denominator: bigint): bigint {
  const negative = numerator < 0n !== denominator < 0n;
  const n = numerator < 0n ? -numerator : numerator;
  const d = denominator < 0n ? -denominator : denominator;
  const rounded = (2n * n + d) / (2n * d);
  return negative ? -rounded : rounded;
}

export type ShowPaise = 'auto' | 'always' | 'never';

const formatters = new Map<number, Intl.NumberFormat>();
function inrFormatter(fractionDigits: number): Intl.NumberFormat {
  let formatter = formatters.get(fractionDigits);
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    });
    formatters.set(fractionDigits, formatter);
  }
  return formatter;
}

/**
 * Paise as Indian rupees: `formatINR(129900)` → `₹1,299`, `formatINR(129950)` → `₹1,299.50`.
 * `showPaise`: `auto` (default) shows paise only when there are some, `always` always shows them,
 * `never` rounds to whole rupees (halves up).
 */
export function formatINR(paise: number, options: { showPaise?: ShowPaise } = {}): string {
  assertPaise(paise);
  const { showPaise = 'auto' } = options;
  const fraction = showPaise === 'always' || (showPaise === 'auto' && paise % 100 !== 0) ? 2 : 0;
  return inrFormatter(fraction).format(paise / 100);
}

/** Paise to rupees as a number (for charts and inputs; use formatINR for display). */
export function paiseToRupees(paise: number): number {
  assertPaise(paise);
  return paise / 100;
}

/**
 * Rupees to paise without floating-point errors: `'1,299.50'` → 129950, `19.99` → 1999.
 * Accepts an optional ₹ sign and Indian digit grouping; more than 2 decimal places is an error,
 * not a silent rounding.
 */
export function rupeesToPaise(rupees: string | number): number {
  if (typeof rupees === 'number' && !Number.isFinite(rupees)) {
    throw new RangeError(`Not an amount in rupees: ${String(rupees)}`);
  }
  const text = String(rupees).trim().replace(/^₹\s?/, '').replaceAll(',', '');
  const match = /^(-)?(\d+)(?:\.(\d{1,2}))?$/.exec(text);
  if (!match) {
    throw new RangeError(`Not an amount in rupees (at most 2 decimal places): "${String(rupees)}"`);
  }
  const [, sign, whole = '0', fraction = ''] = match;
  const paise = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'));
  return toSafeNumber(sign ? -paise : paise);
}

/** `rate` of an amount, rounded to the nearest paisa (halves away from zero): 18% of ₹99.99 = 1800 paise. */
export function applyRate(paise: number, basisPoints: number): number {
  assertPaise(paise);
  assertBasisPoints(basisPoints);
  return toSafeNumber(divideRounded(BigInt(paise) * BigInt(basisPoints), 10_000n));
}

/**
 * Splits a tax-inclusive amount (MRP and selling prices include GST) into taxable value and tax.
 * The two always add up to the amount exactly.
 */
export function taxFromInclusive(
  grossPaise: number,
  basisPoints: number,
): { taxable: number; tax: number } {
  assertPaise(grossPaise, 'grossPaise');
  assertBasisPoints(basisPoints);
  if (grossPaise < 0) {
    throw new RangeError('grossPaise cannot be negative');
  }
  const taxable = toSafeNumber(
    divideRounded(BigInt(grossPaise) * 10_000n, 10_000n + BigInt(basisPoints)),
  );
  return { taxable, tax: grossPaise - taxable };
}

/**
 * Discount from MRP in whole percent, rounded down so it is never overstated (₹1,599 → ₹1,299 is
 * 18%, not 19%). 0 when there is no discount.
 */
export function discountPercent(mrpPaise: number, sellingPaise: number): number {
  assertPaise(mrpPaise, 'mrpPaise');
  assertPaise(sellingPaise, 'sellingPaise');
  if (mrpPaise <= 0 || sellingPaise >= mrpPaise) {
    return 0;
  }
  if (sellingPaise < 0) {
    throw new RangeError('sellingPaise cannot be negative');
  }
  return Number((BigInt(mrpPaise - sellingPaise) * 100n) / BigInt(mrpPaise));
}

/**
 * Splits `total` paise in proportion to `weights` (e.g. a coupon across order lines by their
 * value). Every part is whole paise and the parts add up to `total` exactly; leftover paise go to
 * the largest remainders (earlier lines first on a tie).
 */
export function allocate(total: number, weights: readonly number[]): number[] {
  assertPaise(total, 'total');
  if (total < 0) {
    throw new RangeError('total cannot be negative');
  }
  if (weights.length === 0) {
    throw new RangeError('weights cannot be empty');
  }
  for (const weight of weights) {
    if (!Number.isSafeInteger(weight) || weight < 0) {
      throw new RangeError(`weights must be whole numbers, 0 or more, got ${String(weight)}`);
    }
  }
  const sum = weights.reduce((a, b) => a + BigInt(b), 0n);
  if (sum === 0n) {
    throw new RangeError('weights cannot all be 0');
  }
  const exact = weights.map((w) => BigInt(total) * BigInt(w));
  const parts = exact.map((e) => e / sum);
  let left = BigInt(total) - parts.reduce((a, b) => a + b, 0n);
  const order = exact
    .map((e, index) => ({ index, remainder: e % sum }))
    .sort((a, b) =>
      b.remainder > a.remainder ? 1 : b.remainder < a.remainder ? -1 : a.index - b.index,
    );
  for (const { index } of order) {
    if (left === 0n) break;
    parts[index] = (parts[index] ?? 0n) + 1n;
    left -= 1n;
  }
  return parts.map(toSafeNumber);
}
