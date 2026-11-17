import { act } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { resetPendingSearch } from '../../src/router/pending-search';
import { setupQueryParamInput as setup, SHORT_DELAY } from '../utils/query-param-input-harness';

const LONG_DELAY = 300;

describe('useQueryParamInput with a data router (async navigation)', () => {
  afterEach(() => {
    resetPendingSearch();
  });

  it('writes the text to the URL once the navigation has committed', async () => {
    const { input, settled, urlIs } = setup('/products?sortBy=name');
    await settled();

    act(() => {
      input().setValue('lip');
    });
    await urlIs('?sortBy=name&search=lip');

    expect(input().value).toBe('lip');
  });

  it('what the user types while their own URL update is committing is not overwritten', async () => {
    const { input, settled, navigating, urlIs, gate, seen, setDelay } = setup('/products');
    await settled();

    gate.hold();
    act(() => {
      input().setValue('abc');
    });
    await navigating(); // the debounce fired: the URL update for "abc" is in flight
    setDelay(LONG_DELAY); // "abcd" will wait so long that it cannot be sent during this test
    act(() => {
      input().setValue('abcd'); // typed while "abc" is on its way
    });
    gate.release();
    await urlIs('?search=abc'); // the echo of "abc" lands while "abcd" is still waiting...
    await settled();

    expect(input().value).toBe('abcd'); // ...and does not overwrite it
    // after "abcd" was typed the box never went back to showing "abc"
    expect(seen.slice(seen.indexOf('abcd'))).not.toContain('abc');
  });

  it('keeps a trailing space after its own URL update comes back', async () => {
    const { input, settled, urlIs } = setup('/products');
    await settled();

    act(() => {
      input().setValue('lip ');
    });
    await urlIs('?search=lip');
    await settled();

    expect(input().value).toBe('lip ');
  });

  describe('together with another component that updates the URL', () => {
    it('a status picked in the same moment as the text is typed: both end up in the URL', async () => {
      const { input, filters, settled, urlIs } = setup('/products?sortBy=name');
      await settled();

      act(() => {
        filters().setParams({ status: 'active' });
        input().setValue('abc');
      });

      await urlIs('?sortBy=name&status=active&search=abc');
    });

    it('a status picked while the search update is in flight: both end up in the URL', async () => {
      const { input, filters, settled, navigating, urlIs, gate } = setup('/products?sortBy=name');
      await settled();

      gate.hold();
      act(() => {
        input().setValue('abc');
      });
      await navigating(); // the search update is on its way
      act(() => {
        filters().setParams({ status: 'active' });
      });
      gate.release();

      await urlIs('?sortBy=name&search=abc&status=active');
    });

    it('a status picked while the text is still waiting for its debounce: both end up in the URL', async () => {
      const { input, filters, settled, urlIs } = setup('/products?sortBy=name', {
        delay: LONG_DELAY,
      });
      await settled();

      act(() => {
        input().setValue('abc'); // waiting for its debounce
        filters().setParams({ status: 'active' }); // in the same tick, so it is always first
      });

      // the text is sent on top of the status, whichever the router commits first
      await urlIs('?sortBy=name&status=active&search=abc');
    });
  });

  it('follows a URL change that happens while typed text is waiting, and drops that text', async () => {
    const { router, input, settled } = setup('/products?search=old');
    await settled();

    // fake timers (only for the debounce): the other URL lands first, and then time passes
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

    try {
      act(() => {
        input().setValue('new'); // waiting for its debounce
      });
      await act(async () => {
        await router.navigate('/products?search=other');
      });
      expect(input().value).toBe('other'); // the box followed the URL...

      await act(async () => {
        await vi.advanceTimersByTimeAsync(5000); // ...so "new" is dropped when its time comes
      });
    } finally {
      vi.useRealTimers();
    }

    expect(router.state.location.search).toBe('?search=other');
    expect(input().value).toBe('other');
  });

  // Fast typing with a navigation that takes about as long as the debounce: several updates are on
  // their way at once, and the router may commit an older one after a newer one was sent. Whatever
  // the timing, the box must never show older text than what was typed, and the last text must win.
  it.each([1, 2, 3])(
    'fast typing (seed %i): the box never goes back and the last text wins',
    async (seed) => {
      let state = seed * 7919;
      const random = () => {
        state = (state * 1664525 + 1013904223) % 4294967296;
        return state / 4294967296;
      };

      const { input, settled, urlIs, seen } = setup('/products', { latencyMs: 30 });
      await settled();

      const typed: string[] = [];
      let text = '';
      for (let i = 0; i < 20; i++) {
        text += String.fromCharCode(97 + (i % 26));
        typed.push(text);
        act(() => {
          input().setValue(text);
        });
        const gap = Math.floor(random() * 90); // around the debounce (40ms) and the navigation (30ms)
        await act(async () => {
          await new Promise((resolve) => setTimeout(resolve, gap));
        });
      }
      await urlIs(`?search=${text}`);
      await settled();
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, SHORT_DELAY * 3));
      });

      const shown = seen.filter((value) => value !== '').map((value) => typed.indexOf(value));
      expect(shown.every((index) => index >= 0)).toBe(true);
      expect(shown).toEqual([...shown].sort((a, b) => a - b));
      expect(input().value).toBe(text);
    },
    30_000,
  );

  describe('clear while a URL update of its own is on its way', () => {
    it('ends with the box showing what the URL ended up with', async () => {
      const { input, settled, navigating, urlIs, gate } = setup('/products');
      await settled();

      gate.hold();
      act(() => {
        input().setValue('abc');
      });
      await navigating(); // "abc" is on its way to the URL
      act(() => {
        input().clear(); // clear() never touches the URL, so "abc" still lands...
      });
      gate.release();
      await urlIs('?search=abc');
      await settled();

      expect(input().value).toBe('abc'); // ...and the box must not disagree with it
    });

    it('stays empty when the URL is cleared together with the box (a "Clear" button)', async () => {
      const { input, filters, settled, navigating, urlIs, gate } = setup('/products');
      await settled();

      gate.hold();
      act(() => {
        input().setValue('abc');
      });
      await navigating();
      act(() => {
        input().clear();
        filters().clearParams();
      });
      gate.release();
      await urlIs('');
      await settled();
      await new Promise((resolve) => setTimeout(resolve, SHORT_DELAY * 3));

      expect(input().value).toBe('');
    });
  });

  it('is emptied by a status change that removes the param, without writing anything back', async () => {
    const { input, filters, settled, urlIs } = setup('/products?search=lipstick&sortBy=name');
    await settled();
    expect(input().value).toBe('lipstick');

    act(() => {
      filters().removeParams(['search']);
      filters().setParams({ status: 'draft' });
    });
    await urlIs('?sortBy=name&status=draft');
    await settled();
    await new Promise((resolve) => setTimeout(resolve, SHORT_DELAY * 3));

    expect(input().value).toBe('');
    await urlIs('?sortBy=name&status=draft'); // still: nothing was written back
  });
});
