import { act } from '@testing-library/react';
import { NavigationType, redirect } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { resetPendingSearch } from '../../src/router/pending-search';
import { setupQueryParams } from '../utils/query-params-harness';

// Apps guard unsaved changes with `useBlocker`. A blocked `navigate()` resolves at once and commits
// nothing; `proceed()` later navigates to the *last* blocked target, and `reset()` forgets it. The
// router also redirects (a loader sends the user elsewhere) and interrupts (a newer navigation
// replaces the one in flight). In none of these cases may an update build on a URL that never
// happened. These tests are the matrix B1-B9 of HOOKS-10-OUT-OF-10-PLAN.md.
const tick = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

describe('useQueryParams with useBlocker', () => {
  afterEach(() => {
    resetPendingSearch();
  });

  describe('every navigation is blocked (useBlocker(true), search-param updates too)', () => {
    it('B1: a blocked update changes nothing, and after reset() the next update builds on the URL that is really there', async () => {
      const { router, query, blocker, blockerIs, settled } = setupQueryParams(
        '/products?sort=name',
        {
          block: true,
        },
      );
      await settled();

      act(() => {
        query().setParams({ status: 'draft' });
      });
      await blockerIs('blocked');
      expect(router.state.location.search).toBe('?sort=name');
      expect(blocker().location?.search).toBe('?sort=name&status=draft');

      act(() => {
        blocker().reset?.(); // the user chose to stay
      });
      await blockerIs('unblocked');

      act(() => {
        query().setParams({ page: '2' });
      });
      await blockerIs('blocked');

      // `status=draft` never happened, so it is not in the next target
      expect(blocker().location?.search).toBe('?sort=name&page=2');
    });

    it('B2: proceed() commits the blocked target, and the hook shows it', async () => {
      const { router, query, blocker, blockerIs, urlIs, settled } = setupQueryParams(
        '/products?sort=name',
        { block: true },
      );
      await settled();

      act(() => {
        query().setParams({ status: 'draft' });
      });
      await blockerIs('blocked');
      act(() => {
        blocker().proceed?.();
      });
      await urlIs('?sort=name&status=draft');
      await settled();

      expect(router.state.location.search).toBe('?sort=name&status=draft');
      expect(query().queryParams).toEqual({ sort: 'name', status: 'draft' });
    });

    it('B3a: a remove and a set in the same tick are one blocked target, and proceed() applies both', async () => {
      const { query, blocker, blockerIs, urlIs, settled } = setupQueryParams(
        '/products?search=lipstick&sort=name',
        { block: true },
      );
      await settled();

      act(() => {
        query().removeParams(['search']);
        query().setParams({ status: 'draft' });
      });
      await blockerIs('blocked');
      expect(blocker().location?.search).toBe('?sort=name&status=draft');

      act(() => {
        blocker().proceed?.();
      });
      await urlIs('?sort=name&status=draft');
    });

    it('B3b: a second update made while the first is still blocked builds on the blocked target, and proceed() applies both', async () => {
      const { query, blocker, blockerIs, urlIs, settled } = setupQueryParams('/products', {
        block: true,
      });
      await settled();

      act(() => {
        query().setParams({ a: '1' });
      });
      await blockerIs('blocked');
      await tick();
      act(() => {
        query().setParams({ b: '2' });
      });
      await tick();

      expect(blocker().location?.search).toBe('?a=1&b=2');

      act(() => {
        blocker().proceed?.();
      });
      await urlIs('?a=1&b=2');
    });

    it('B6: clearParams() that was blocked and reset does not leave the next update building on an empty URL', async () => {
      const { query, blocker, blockerIs, settled } = setupQueryParams('/products?a=1&b=2', {
        block: true,
      });
      await settled();

      act(() => {
        query().clearParams();
      });
      await blockerIs('blocked');
      act(() => {
        blocker().reset?.();
      });
      await blockerIs('unblocked');

      act(() => {
        query().setParams({ c: '3' });
      });
      await blockerIs('blocked');

      expect(blocker().location?.search).toBe('?a=1&b=2&c=3');
    });
  });

  describe('the browser Back button is blocked', () => {
    it('B4: an update made while Back is held builds on the page the user is on, not on where Back was going', async () => {
      const { router, query, blocker, blockerIs, urlIs, settled } = setupQueryParams(
        '/products?sort=name',
        {
          // only Back/Forward is held (a dirty form); the app's own updates go through
          block: ({ historyAction }) => historyAction === NavigationType.Pop,
        },
      );
      await settled();

      act(() => {
        query().setParams({ a: '1' });
      });
      await urlIs('?sort=name&a=1');

      act(() => {
        void router.navigate(-1); // the user presses Back: held, the page stays
      });
      await blockerIs('blocked');
      expect(router.state.location.search).toBe('?sort=name&a=1');
      expect(blocker().location?.search).toBe('?sort=name');

      act(() => {
        query().setParams({ b: '2' }); // e.g. a debounced search firing while the dialog is open
      });
      await urlIs('?sort=name&a=1&b=2');
    });
  });

  describe('a blocked link to another page', () => {
    it('B4b: is not ours, even when its query string happens to be the one we sent before', async () => {
      const { router, query, blockerIs, urlIs, settled } = setupQueryParams('/products', {
        // leaving the page is held (a dirty form), search-param updates are not
        block: ({ currentLocation, nextLocation }) =>
          currentLocation.pathname !== nextLocation.pathname,
      });
      await settled();

      act(() => {
        query().setParams({ x: '1' }); // our last update: ?x=1
      });
      await urlIs('?x=1');
      act(() => {
        void router.navigate('/products'); // the URL is empty again...
      });
      await urlIs('');
      act(() => {
        void router.navigate('/other?x=1'); // ...and a link to another page, with the same query string, is held
      });
      await blockerIs('blocked');

      act(() => {
        query().setParams({ y: '2' });
      });

      await urlIs('?y=2'); // built on the page the user is on, not on the held link
    });
  });

  describe('a navigation that fails', () => {
    it('B11: does not leave its update behind for the next one to build on', async () => {
      const { router, query, urlIs, settled } = setupQueryParams('/products?sort=name');
      await settled();

      const navigate = vi
        .spyOn(router, 'navigate')
        .mockRejectedValueOnce(new Error('navigation failed'));

      act(() => {
        query().setParams({ a: '1' }); // fails
      });
      await tick();
      expect(navigate).toHaveBeenCalledTimes(1);

      act(() => {
        query().setParams({ b: '2' }); // goes through
      });

      await urlIs('?sort=name&b=2'); // not '?sort=name&a=1&b=2'
    });
  });

  describe('the router is ahead of React', () => {
    it('B12: an update made after the router moved to another page, before React shows it, stays on the page React shows', async () => {
      const { router, query, settled } = setupQueryParams('/products');
      await settled();

      await act(async () => {
        await router.navigate('/elsewhere?q=1');
        query().setParams({ z: '1' }); // this hook was rendered for /products
      });
      await settled();

      expect(router.state.location.pathname).toBe('/products');
      expect(router.state.location.search).toBe('?z=1'); // not '?q=1&z=1': that query string is /elsewhere's
    });
  });

  describe('the router is ahead of React (the hash)', () => {
    it('B13: an update keeps the hash the router has now, before React has shown it', async () => {
      const { router, query, settled } = setupQueryParams('/products?a=1#reviews');
      await settled();

      await act(async () => {
        await router.navigate('/products?a=1#details'); // the user jumped to another section
        query().setParams({ b: '2' });
      });
      await settled();

      expect(router.state.location.search).toBe('?a=1&b=2');
      expect(router.state.location.hash).toBe('#details');
    });

    it('B13b: the hash of another page is not carried over', async () => {
      const { router, query, settled } = setupQueryParams('/products');
      await settled();

      await act(async () => {
        await router.navigate('/elsewhere#top');
        query().setParams({ z: '1' }); // this hook was rendered for /products
      });
      await settled();

      expect(router.state.location.pathname).toBe('/products');
      expect(router.state.location.hash).toBe('');
    });
  });

  describe('a sensible blocker: only leaving the page is blocked', () => {
    it('B5: search-param updates go through as if there were no blocker', async () => {
      const { router, query, blocker, urlIs, settled } = setupQueryParams('/products?sort=name', {
        block: ({ currentLocation, nextLocation }) =>
          currentLocation.pathname !== nextLocation.pathname,
      });
      await settled();

      act(() => {
        query().setParams({ status: 'draft' });
      });
      await urlIs('?sort=name&status=draft');
      act(() => {
        query().removeParams(['sort']);
      });
      await urlIs('?status=draft');

      expect(blocker().state).toBe('unblocked');
      expect(router.state.location.pathname).toBe('/products');
    });
  });

  describe('a loader redirects the navigation', () => {
    it('B9a: to another page, the hook keeps working there', async () => {
      const { router, query, urlIs, settled } = setupQueryParams('/products', {
        onLoad: (url) => {
          return url.searchParams.has('go') ? redirect('/elsewhere') : undefined;
        },
      });
      await settled();

      act(() => {
        query().setParams({ go: '1' });
      });
      await settled();
      expect(router.state.location.pathname).toBe('/elsewhere');

      act(() => {
        query().setParams({ x: '1' });
      });
      await urlIs('?x=1');
      expect(router.state.location.pathname).toBe('/elsewhere');
    });

    it('B9b: to the same page with another query string, the next update builds on where the user landed', async () => {
      const { router, query, urlIs, settled } = setupQueryParams('/products', {
        onLoad: (url) => {
          // e.g. a route that normalises a state it does not accept into a fixed one
          return url.searchParams.has('go') ? redirect('/products?landed=yes') : undefined;
        },
      });
      await settled();

      act(() => {
        query().setParams({ go: '1' });
      });
      await urlIs('?landed=yes');
      await settled();

      act(() => {
        query().setParams({ x: '1' });
      });
      await urlIs('?landed=yes&x=1');
      expect(router.state.location.pathname).toBe('/products');
    });
  });

  describe('another navigation interrupts the one in flight', () => {
    it('B8b: an update made while a link navigation is in flight builds on that link target', async () => {
      const { router, query, urlIs, settled, gate } = setupQueryParams('/products');
      await settled();

      gate.hold();
      act(() => {
        void router.navigate('/products?z=9'); // the user clicked a link, still loading
      });
      act(() => {
        query().setParams({ b: '2' }); // e.g. a debounced search firing right then
      });
      gate.release();

      await urlIs('?z=9&b=2'); // the link target is not lost
    });

    it('B8: the next update builds on where the user ended up, not on the interrupted update', async () => {
      const { router, query, urlIs, settled, gate } = setupQueryParams('/products');
      await settled();

      gate.hold();
      act(() => {
        query().setParams({ a: '1' }); // in flight...
      });
      act(() => {
        void router.navigate('/products?z=9'); // ...and replaced by a link click
      });
      gate.release();
      await urlIs('?z=9');
      await settled();

      act(() => {
        query().setParams({ b: '2' });
      });
      await urlIs('?z=9&b=2');
    });
  });
});
