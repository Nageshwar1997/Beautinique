import { toPaise, type Paise } from './paise.ts';

/**
 * Shares `total` among the `weights` in proportion, by the largest remainder, so that the parts add
 * up to `total` to the paisa (docs/ARCHITECTURE.md §1.8 rule 3): a discount of a combo is shared
 * among its lines, and no paisa is lost or made.
 *
 * Each part first gets the whole paise of its exact share. The paise still left go one each to the
 * parts with the biggest fraction left, and between two equal fractions to the earlier one, so the
 * answer is always the same. A weight of 0 gets nothing.
 */
export function allocate(total: Paise, weights: readonly Paise[]): Paise[] {
  if (total < 0) throw new RangeError('The amount to share is not negative.');
  if (weights.some((weight) => weight < 0)) throw new RangeError('A weight is not negative.');

  const totalBig = BigInt(total);
  const weightSum = weights.reduce((sum, weight) => sum + BigInt(weight), 0n);
  if (weightSum === 0n) {
    if (totalBig !== 0n) {
      throw new RangeError('There is nothing to share this amount by: every weight is 0.');
    }
    return weights.map(() => toPaise(0n));
  }

  const parts = weights.map((weight) => {
    const exact = totalBig * BigInt(weight);
    return { whole: exact / weightSum, remainder: exact % weightSum };
  });
  const left = totalBig - parts.reduce((sum, part) => sum + part.whole, 0n);

  const byRemainder = parts
    .map((part, index) => ({ index, remainder: part.remainder }))
    .sort((a, b) =>
      a.remainder === b.remainder ? a.index - b.index : a.remainder > b.remainder ? -1 : 1,
    );
  const extra = new Set(byRemainder.slice(0, Number(left)).map((entry) => entry.index));

  return parts.map((part, index) => toPaise(part.whole + (extra.has(index) ? 1n : 0n)));
}
