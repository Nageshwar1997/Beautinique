import type { ListRequest, Page } from '../ports.ts';

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 500;

/**
 * One page of `items` in the order of their keys, after `cursor` (the last key of the page
 * before). The items are sorted once per call; a binary search finds where the page starts.
 */
export function pageOf<T>(
  items: readonly T[],
  keyOf: (item: T) => string,
  { cursor = null, limit = DEFAULT_LIMIT }: ListRequest,
): Page<T> {
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    throw new RangeError(`limit must be a whole number from 1 to ${String(MAX_LIMIT)}.`);
  }
  const sorted = [...items].sort((a, b) => (keyOf(a) < keyOf(b) ? -1 : 1));
  let start = 0;
  if (cursor !== null) {
    let high = sorted.length;
    while (start < high) {
      const middle = (start + high) >>> 1;
      if (keyOf(sorted[middle] as T) <= cursor) start = middle + 1;
      else high = middle;
    }
  }
  const page = sorted.slice(start, start + limit);
  const last = page.at(-1);
  const next = start + limit < sorted.length && last !== undefined ? keyOf(last) : null;
  return { items: page, next };
}
