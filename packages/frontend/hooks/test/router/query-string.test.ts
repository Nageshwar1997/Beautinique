import { describe, expect, it } from 'vitest';

import { buildSearch, normalizeSearch, parseParams } from '../../src/router/query-string';

describe('parseParams', () => {
  it('reads params with or without the leading ?', () => {
    expect(parseParams('?a=1&b=2')).toEqual({ a: '1', b: '2' });
    expect(parseParams('a=1&b=2')).toEqual({ a: '1', b: '2' });
  });

  it('returns an empty object for an empty query string', () => {
    expect(parseParams('')).toEqual({});
    expect(parseParams('?')).toEqual({});
  });

  it('decodes values and keeps the last value of a repeated key', () => {
    expect(parseParams('?name=red%20lipstick&tag=a&tag=b')).toEqual({
      name: 'red lipstick',
      tag: 'b',
    });
  });

  it('keeps a param that has no value as an empty string', () => {
    expect(parseParams('?flag&a=1')).toEqual({ flag: '', a: '1' });
  });
});

describe('normalizeSearch', () => {
  it('writes the canonical form, without ?', () => {
    expect(normalizeSearch('?name=red%20lipstick&b=2')).toBe('name=red+lipstick&b=2');
    expect(normalizeSearch('')).toBe('');
  });
});

describe('buildSearch with an object', () => {
  it('adds a new param after the existing ones', () => {
    expect(buildSearch('?a=1', { b: '2' })).toBe('a=1&b=2');
  });

  it('overwrites an existing param in place', () => {
    expect(buildSearch('?a=1&b=2&c=3', { b: '9' })).toBe('a=1&b=9&c=3');
  });

  it('works on an empty query string', () => {
    expect(buildSearch('', { a: '1' })).toBe('a=1');
  });

  it('leaves out blank values: empty string, null and undefined', () => {
    const update = { a: '', b: null, c: undefined, d: 'kept' } as unknown as Record<string, string>;

    expect(buildSearch('', update)).toBe('d=kept');
  });

  it('removes an existing param when it is set to a blank value', () => {
    expect(buildSearch('?a=1&b=2', { a: '' })).toBe('b=2');
  });

  it('also cleans blank values the URL already had', () => {
    expect(buildSearch('?a=&b=2', { c: '3' })).toBe('b=2&c=3');
  });

  it('encodes special characters', () => {
    expect(buildSearch('', { q: 'red lipstick & gloss' })).toBe('q=red+lipstick+%26+gloss');
  });

  it('keeps every value of a param it does not touch, and its position', () => {
    expect(buildSearch('?tag=a&tag=b&page=1', { page: '2' })).toBe('tag=a&tag=b&page=2');
    expect(buildSearch('?page=1&tag=a&tag=b', { page: '2' })).toBe('page=2&tag=a&tag=b');
  });

  it('gives a param it sets exactly one value, even when it ends up with the same last value', () => {
    expect(buildSearch('?tag=a&tag=b', { tag: 'z' })).toBe('tag=z');
    expect(buildSearch('?tag=a&tag=b', { tag: 'b' })).toBe('tag=b');
  });

  it('drops empty entries of a multi-valued param it does not touch', () => {
    expect(buildSearch('?tag=a&tag=&tag=b', { page: '1' })).toBe('tag=a&tag=b&page=1');
  });

  it('does not change anything for an empty update', () => {
    expect(buildSearch('?a=1&b=2', {})).toBe('a=1&b=2');
  });
});

describe('buildSearch with an updater function', () => {
  it('gives the function the current params', () => {
    let seen: Record<string, string> = {};

    buildSearch('?a=1&tag=x&tag=y', (prev) => {
      seen = prev;
      return prev;
    });

    expect(seen).toEqual({ a: '1', tag: 'y' });
  });

  it('uses what the function returns as the full set of params', () => {
    expect(buildSearch('?a=1&b=2', () => ({ c: '3' }))).toBe('c=3');
  });

  it('removes the params the function leaves out', () => {
    expect(buildSearch('?a=1&b=2', ({ a }) => ({ a }))).toBe('a=1');
  });

  it('keeps every value of a param whose value the function did not change', () => {
    expect(buildSearch('?tag=a&tag=b&page=1', (prev) => ({ ...prev, page: '2' }))).toBe(
      'tag=a&tag=b&page=2',
    );
  });

  it('gives a param the function changed exactly one value', () => {
    expect(buildSearch('?tag=a&tag=b&page=1', (prev) => ({ ...prev, tag: 'z' }))).toBe(
      'tag=z&page=1',
    );
  });

  it('removes every value of a param the function leaves out or blanks', () => {
    expect(buildSearch('?tag=a&tag=b&page=1', ({ page }) => ({ page }))).toBe('page=1');
    expect(buildSearch('?tag=a&tag=b&page=1', (prev) => ({ ...prev, tag: '' }))).toBe('page=1');
  });

  it('follows the order of the params the function returns', () => {
    expect(buildSearch('?a=1&b=2', () => ({ b: '2', a: '1' }))).toBe('b=2&a=1');
  });

  it('is a no-op for an identity function', () => {
    expect(buildSearch('?a=1&tag=x&tag=y', (prev) => prev)).toBe('a=1&tag=x&tag=y');
  });
});
