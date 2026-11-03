import { act } from '@testing-library/react';
import { NavigationType, redirect } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import { resetPendingSearch } from '../../src/router/pending-search';
import { setupQueryParamInput as setup, SHORT_DELAY } from '../utils/query-param-input-harness';

// The search box sends its text to the URL, and remembers what it sent so that the URL coming back
// is not mistaken for somebody else changing it. `useBlocker` can hold what it sent (`proceed()` still
// delivers it, `reset()` never will); a loader can redirect it; another navigation can replace it.
// What can still arrive is an echo; what never will must not be remembered, or a later URL that
// happens to have the same text would be taken for an echo and the box would not follow it.
// These are the matrix B1-B4, B9 of HOOKS-10-OUT-OF-10-PLAN.md for the box.
const LONG_DELAY = 5000; // a text typed with this delay cannot be sent during a test

describe('useQueryParamInput with useBlocker', () => {
  afterEach(() => {
    resetPendingSearch();
  });

  describe('every navigation is blocked (useBlocker)', () => {
    it('B1: a text that was held and reset is not an echo any more: the box follows a later URL that has it', async () => {
      let blocking = true;
      const { router, input, blocker, blockerIs, urlIs, settled, setDelay } = setup('/products', {
        block: () => blocking,
      });
      await settled();

      act(() => {
        input().setValue('abc');
      });
      await blockerIs('blocked'); // the debounce fired and the router held the update
      expect(router.state.location.search).toBe('');
      expect(blocker().location?.search).toBe('?search=abc');

      act(() => {
        blocker().reset?.(); // the user chose to stay: "abc" will never arrive
      });
      await blockerIs('unblocked');
      blocking = false;

      setDelay(LONG_DELAY);
      act(() => {
        input().setValue('abcd'); // the user keeps typing
      });
      act(() => {
        void router.navigate('/products?search=abc'); // e.g. Back to an entry that has "abc"
      });
      await urlIs('?search=abc');
      await settled();

      expect(input().value).toBe('abc'); // somebody else changed the URL: the box follows it
    });

    it('B1b: typing the held text again sends nothing, so nothing is left behind when the blocker is reset', async () => {
      let blocking = true;
      const { router, input, blocker, blockerIs, urlIs, settled, setDelay } = setup('/products', {
        block: () => blocking,
      });
      await settled();

      act(() => {
        input().setValue('abc');
      });
      await blockerIs('blocked');

      act(() => {
        input().setValue('abc '); // the same text again: on top of the held update it changes nothing
      });
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, SHORT_DELAY * 3)); // its debounce fires
      });

      act(() => {
        blocker().reset?.();
      });
      await blockerIs('unblocked');
      blocking = false;

      setDelay(LONG_DELAY);
      act(() => {
        input().setValue('abcd');
      });
      act(() => {
        void router.navigate('/products?search=abc');
      });
      await urlIs('?search=abc');
      await settled();

      expect(input().value).toBe('abc');
    });

    it('B2: a text that was held and then let through is an echo: what is typed meanwhile stays', async () => {
      const { input, blocker, blockerIs, urlIs, settled, setDelay } = setup('/products', {
        block: true,
      });
      await settled();

      act(() => {
        input().setValue('abc');
      });
      await blockerIs('blocked');

      setDelay(LONG_DELAY);
      act(() => {
        input().setValue('abcd'); // typed while "abc" is held
      });
      act(() => {
        blocker().proceed?.();
      });
      await urlIs('?search=abc');
      await settled();

      expect(input().value).toBe('abcd'); // "abc" arrived as an echo, it did not overwrite the box
    });

    it('B3: a newer text replaces the held one, and proceed() delivers only the newer', async () => {
      const { input, blocker, blockerIs, urlIs, settled, seen } = setup('/products', {
        block: true,
      });
      await settled();

      act(() => {
        input().setValue('abc');
      });
      await blockerIs('blocked');
      expect(blocker().location?.search).toBe('?search=abc');

      act(() => {
        input().setValue('abcd'); // same delay: it is sent too, and held in place of "abc"
      });
      await waitForHeld(() => blocker().location?.search === '?search=abcd');

      act(() => {
        blocker().proceed?.();
      });
      await urlIs('?search=abcd');
      await settled();

      expect(input().value).toBe('abcd');
      expect(seen.slice(seen.indexOf('abcd'))).not.toContain('abc');
    });
  });

  describe('something else changes in the router while the update is on its way', () => {
    it('B5: the update is still expected when it lands', async () => {
      const { router, input, navigating, urlIs, settled, gate, setDelay } = setup('/products');
      await settled();

      gate.hold();
      act(() => {
        input().setValue('abc');
      });
      await navigating(); // "abc" is on its way

      setDelay(LONG_DELAY);
      act(() => {
        input().setValue('abcd');
      });
      act(() => {
        void router.revalidate(); // something unrelated updates the router (a refetch, a fetcher...)
      });
      gate.release();
      await urlIs('?search=abc');
      await settled();

      expect(input().value).toBe('abcd'); // "abc" was still recognised as the echo of what was sent
    });
  });

  describe('the browser Back button is blocked', () => {
    it('B4: a held Back does not move the box, and the box follows it once it is let through', async () => {
      const { router, input, blocker, blockerIs, urlIs, settled, setDelay } = setup('/products', {
        block: ({ historyAction }) => historyAction === NavigationType.Pop,
      });
      await settled();

      act(() => {
        input().setValue('abc');
      });
      await urlIs('?search=abc');
      await settled();

      setDelay(LONG_DELAY);
      act(() => {
        input().setValue('abcd'); // typed, still waiting for its debounce
      });
      act(() => {
        void router.navigate(-1); // Back: held, the page stays where it is
      });
      await blockerIs('blocked');

      expect(router.state.location.search).toBe('?search=abc');
      expect(input().value).toBe('abcd');

      act(() => {
        blocker().proceed?.();
      });
      await urlIs('');
      await settled();

      expect(input().value).toBe(''); // the URL went back: the box follows it, and "abcd" is dropped
    });

    it('B4b: a held Back that is reset changes nothing', async () => {
      const { router, input, blocker, blockerIs, settled, setDelay } = setup(
        '/products?search=abc',
        {
          block: ({ historyAction }) => historyAction === NavigationType.Pop,
        },
      );
      await settled();

      setDelay(LONG_DELAY);
      act(() => {
        input().setValue('abcd');
      });
      act(() => {
        void router.navigate(-1);
      });
      await blockerIs('blocked');
      act(() => {
        blocker().reset?.();
      });
      await blockerIs('unblocked');

      expect(router.state.location.search).toBe('?search=abc');
      expect(input().value).toBe('abcd');
    });
  });

  describe('a sensible blocker: only leaving the page is blocked', () => {
    it('typing works as if there were no blocker', async () => {
      const { input, urlIs, settled } = setup('/products', {
        block: ({ currentLocation, nextLocation }) =>
          currentLocation.pathname !== nextLocation.pathname,
      });
      await settled();

      act(() => {
        input().setValue('lip');
      });
      await urlIs('?search=lip');
      await settled();

      expect(input().value).toBe('lip');
    });
  });

  describe('a loader redirects the update', () => {
    it('B9: the text that was redirected away is not an echo: the box follows a later URL that has it', async () => {
      const { router, input, urlIs, settled, setDelay } = setup('/products', {
        onLoad: (url) =>
          url.searchParams.get('search') === 'abc' && !url.searchParams.has('landed')
            ? redirect('/products?landed=yes')
            : undefined,
      });
      await settled();

      act(() => {
        input().setValue('abc');
      });
      await urlIs('?landed=yes'); // the loader sent the user to another query string
      await settled();

      setDelay(LONG_DELAY);
      act(() => {
        input().setValue('abcd');
      });
      act(() => {
        void router.navigate('/products?landed=yes&search=abc');
      });
      await urlIs('?landed=yes&search=abc');
      await settled();

      expect(input().value).toBe('abc');
    });
  });

  describe('another navigation replaces the update', () => {
    it('B8: the text that was replaced is not an echo: the box follows a later URL that has it', async () => {
      const { router, input, navigating, urlIs, settled, gate, setDelay } = setup('/products');
      await settled();

      gate.hold();
      act(() => {
        input().setValue('abc');
      });
      await navigating(); // "abc" is on its way...
      act(() => {
        void router.navigate('/products?z=9'); // ...and a link click replaces it
      });
      gate.release();
      await urlIs('?z=9');
      await settled();

      setDelay(LONG_DELAY);
      act(() => {
        input().setValue('abcd');
      });
      act(() => {
        void router.navigate('/products?z=9&search=abc');
      });
      await urlIs('?z=9&search=abc');
      await settled();

      expect(input().value).toBe('abc');
    });
  });
});

/** Waits for a condition about the router that is not a state React re-renders for. */
const waitForHeld = async (condition: () => boolean) => {
  const { waitFor } = await import('@testing-library/react');

  await waitFor(() => {
    expect(condition()).toBe(true);
  });
};
