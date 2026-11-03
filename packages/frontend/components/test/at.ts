/** The item at `index`, or a failed test when there is none (so no `!` in the tests). */
export function at<T>(items: readonly T[], index = 0): T {
  const item = items[index];
  if (item === undefined) throw new Error(`No item at ${String(index)} of ${String(items.length)}`);
  return item;
}
