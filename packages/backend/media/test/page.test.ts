import { describe, expect, it } from 'vitest';

import { pageOf } from '../src/utils/page.ts';

const key = (item: { id: string }) => item.id;

describe('pageOf', () => {
  it('gives the items in key order, a page at a time, until the last page', () => {
    const items = ['d', 'a', 'c', 'b', 'e'].map((id) => ({ id }));
    const first = pageOf(items, key, { limit: 2 });
    expect(first.items.map(key)).toEqual(['a', 'b']);
    const second = pageOf(items, key, { cursor: first.next, limit: 2 });
    expect(second.items.map(key)).toEqual(['c', 'd']);
    const last = pageOf(items, key, { cursor: second.next, limit: 2 });
    expect(last).toEqual({ items: [{ id: 'e' }], next: null });
  });

  it('starts after a cursor that is no longer there, and gives nothing past the end', () => {
    const items = ['a', 'c', 'e'].map((id) => ({ id }));
    expect(pageOf(items, key, { cursor: 'b' }).items.map(key)).toEqual(['c', 'e']);
    expect(pageOf(items, key, { cursor: 'z' })).toEqual({ items: [], next: null });
  });

  it('a page as long as what is left is the last one', () => {
    const items = ['a', 'b'].map((id) => ({ id }));
    expect(pageOf(items, key, { limit: 2 })).toEqual({ items, next: null });
  });

  it('refuses a limit that is not 1 to 500', () => {
    for (const limit of [0, 501, 1.5]) {
      expect(() => pageOf([], key, { limit })).toThrow(RangeError);
    }
  });

  it('CR-40: 100,000 items page fast', () => {
    const items = Array.from({ length: 100_000 }, (_, i) => ({ id: String(i).padStart(6, '0') }));
    const started = performance.now();
    const page = pageOf(items, key, { cursor: '049999', limit: 3 });
    expect(page.items.map(key)).toEqual(['050000', '050001', '050002']);
    expect(performance.now() - started).toBeLessThan(2_000);
  });
});
