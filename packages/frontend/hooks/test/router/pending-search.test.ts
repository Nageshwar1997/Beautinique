import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  clearPendingSearch,
  PENDING_SEARCH_MAX_AGE_MS,
  readLastStartedSearch,
  readPendingSearch,
  resetPendingSearch,
  setPendingSearch,
  settlePendingSearch,
} from '../../src/router/pending-search';

describe('pending search', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetPendingSearch();
  });

  afterEach(() => {
    resetPendingSearch();
    vi.useRealTimers();
  });

  it('is empty until a navigation is started', () => {
    expect(readPendingSearch('/products')).toBeNull();
  });

  it('remembers the query string a navigation is heading to', () => {
    setPendingSearch('/products', 'status=active');

    expect(readPendingSearch('/products')).toBe('status=active');
  });

  it('can be an empty query string (a cleared URL is still a pending navigation)', () => {
    setPendingSearch('/products', '');

    expect(readPendingSearch('/products')).toBe('');
  });

  it('only applies to the pathname it was started on', () => {
    setPendingSearch('/products', 'status=active');

    expect(readPendingSearch('/categories')).toBeNull();
    expect(readPendingSearch('/products')).toBe('status=active');
  });

  it('keeps only the newest pending navigation', () => {
    setPendingSearch('/products', 'a=1');
    setPendingSearch('/products', 'a=1&b=2');

    expect(readPendingSearch('/products')).toBe('a=1&b=2');
  });

  it('is forgotten after the max age, so a lost navigation cannot stick forever', () => {
    setPendingSearch('/products', 'status=active');

    vi.advanceTimersByTime(PENDING_SEARCH_MAX_AGE_MS);
    expect(readPendingSearch('/products')).toBe('status=active');

    vi.advanceTimersByTime(1);
    expect(readPendingSearch('/products')).toBeNull();
  });

  it('a newer navigation restarts the clock', () => {
    setPendingSearch('/products', 'a=1');
    vi.advanceTimersByTime(PENDING_SEARCH_MAX_AGE_MS - 100);
    setPendingSearch('/products', 'a=1&b=2');
    vi.advanceTimersByTime(500);

    expect(readPendingSearch('/products')).toBe('a=1&b=2');
  });

  describe('settling', () => {
    it('clears the pending navigation once the router shows that query string', () => {
      setPendingSearch('/products', 'status=active');

      settlePendingSearch('/products', '?status=active');

      expect(readPendingSearch('/products')).toBeNull();
    });

    it('compares the normalised query strings, so a different encoding of the same URL settles it', () => {
      setPendingSearch('/products', 'name=red+lipstick');

      settlePendingSearch('/products', '?name=red%20lipstick');

      expect(readPendingSearch('/products')).toBeNull();
    });

    it('settles an empty pending query string against an empty URL', () => {
      setPendingSearch('/products', '');

      settlePendingSearch('/products', '');

      expect(readPendingSearch('/products')).toBeNull();
    });

    it('keeps the pending navigation when the router shows a different URL (an older one committing, Back...)', () => {
      setPendingSearch('/products', 'status=active&search=abc');

      settlePendingSearch('/products', '?status=active');

      expect(readPendingSearch('/products')).toBe('status=active&search=abc');
    });

    it('keeps the pending navigation when another pathname commits', () => {
      setPendingSearch('/products', 'status=active');

      settlePendingSearch('/categories', '?status=active');

      expect(readPendingSearch('/products')).toBe('status=active');
    });

    it('does nothing when there is nothing pending', () => {
      expect(() => {
        settlePendingSearch('/products', '?a=1');
      }).not.toThrow();
      expect(readPendingSearch('/products')).toBeNull();
    });
  });

  describe('clearing a navigation that has finished (committed, replaced, blocked, redirected)', () => {
    it('forgets the navigation that got the token', () => {
      const token = setPendingSearch('/products', 'a=1');

      clearPendingSearch(token);

      expect(readPendingSearch('/products')).toBeNull();
    });

    it('gives every navigation its own token', () => {
      const first = setPendingSearch('/products', 'a=1');
      const second = setPendingSearch('/products', 'a=1&b=2');

      expect(second).not.toBe(first);
    });

    it('leaves a newer navigation alone when an older one finishes late', () => {
      const older = setPendingSearch('/products', 'a=1');
      setPendingSearch('/products', 'a=1&b=2');

      clearPendingSearch(older);

      expect(readPendingSearch('/products')).toBe('a=1&b=2');
    });

    it('does nothing when it is already gone', () => {
      const token = setPendingSearch('/products', 'a=1');
      clearPendingSearch(token);

      expect(() => {
        clearPendingSearch(token);
      }).not.toThrow();
    });
  });

  describe('the last navigation we started', () => {
    it('is remembered after the navigation has finished, so a blocked update can be recognised as ours', () => {
      const token = setPendingSearch('/products', 'a=1');
      clearPendingSearch(token);

      expect(readPendingSearch('/products')).toBeNull();
      expect(readLastStartedSearch('/products')).toBe('a=1');
    });

    it('is the newest one', () => {
      setPendingSearch('/products', 'a=1');
      setPendingSearch('/products', 'a=1&b=2');

      expect(readLastStartedSearch('/products')).toBe('a=1&b=2');
    });

    it('only applies to the pathname it was started on', () => {
      setPendingSearch('/products', 'a=1');

      expect(readLastStartedSearch('/categories')).toBeNull();
    });

    it('is empty until a navigation is started', () => {
      expect(readLastStartedSearch('/products')).toBeNull();
    });
  });

  it('reset forgets the pending navigation and the last one started', () => {
    setPendingSearch('/products', 'a=1');

    resetPendingSearch();

    expect(readPendingSearch('/products')).toBeNull();
    expect(readLastStartedSearch('/products')).toBeNull();
  });

  it('is shared by two copies of the package on the same page', async () => {
    setPendingSearch('/products', 'a=1');

    // a second bundle of the package: the module is evaluated again, with its own variables
    vi.resetModules();
    const otherCopy = await import('../../src/router/pending-search');

    expect(otherCopy.readPendingSearch).not.toBe(readPendingSearch);
    expect(otherCopy.readPendingSearch('/products')).toBe('a=1');

    otherCopy.setPendingSearch('/products', 'a=1&b=2');

    expect(readPendingSearch('/products')).toBe('a=1&b=2');
  });
});
