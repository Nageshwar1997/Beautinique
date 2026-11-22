import { act, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { resetPendingSearch } from '../../src/router/pending-search';
import { setupQueryParams as setup } from '../utils/query-params-harness';

describe('useQueryParams with a data router (async navigation)', () => {
  // the pending-navigation store is shared by the whole module: start every test from a clean one
  afterEach(() => {
    resetPendingSearch();
  });

  it('two updates in the same tick compose', async () => {
    const { router, query, settled } = setup('/products?sortBy=name');
    await settled();

    act(() => {
      query().removeParams(['search']);
      query().setParams({ status: 'draft' });
    });
    await settled();

    expect(router.state.location.search).toBe('?sortBy=name&status=draft');
  });

  it('an update made after an unrelated re-render, before the first navigation committed, still builds on it', async () => {
    // e.g. the user picks a status, a re-render happens (a dropdown closing, a query refetching...),
    // then a debounced search update fires - all before the router has committed the status.
    const { router, query, rerender, settled } = setup('/products?sortBy=name');
    await settled();

    act(() => {
      query().setParams({ status: 'active' });
    });
    act(() => {
      rerender();
    });
    act(() => {
      query().setParams({ search: 'abc' });
    });
    await settled();

    expect(router.state.location.search).toBe('?sortBy=name&status=active&search=abc');
  });

  it('several re-renders in between do not lose the pending update either', async () => {
    const { router, query, rerender, settled } = setup('/products');
    await settled();

    act(() => {
      query().setParams({ a: '1' });
    });
    act(() => {
      rerender();
    });
    act(() => {
      rerender();
    });
    act(() => {
      query().setParams({ b: '2' });
    });
    act(() => {
      rerender();
    });
    act(() => {
      query().setParams({ c: '3' });
    });
    await settled();

    expect(router.state.location.search).toBe('?a=1&b=2&c=3');
  });

  describe('two components that each use the hook', () => {
    it('an update from one builds on an update the other just made (before the router committed it)', async () => {
      // e.g. the status select (in the page) and the debounced search box (in a child) of the products page
      const { router, query, other, settled } = setup('/products?sortBy=name');
      await settled();

      act(() => {
        query().setParams({ status: 'active' });
      });
      act(() => {
        other().setParams({ search: 'abc' });
      });
      await settled();

      expect(router.state.location.search).toBe('?sortBy=name&status=active&search=abc');
    });

    it('works the other way round too, with a re-render in between', async () => {
      const { router, query, other, rerender, settled } = setup('/products?sortBy=name');
      await settled();

      act(() => {
        other().setParams({ search: 'abc' });
      });
      act(() => {
        rerender();
      });
      act(() => {
        query().setParams({ status: 'active' });
      });
      await settled();

      expect(router.state.location.search).toBe('?sortBy=name&search=abc&status=active');
    });

    it('removing in one component and setting in the other in the same tick compose', async () => {
      const { router, query, other, settled } = setup('/products?search=lipstick&sortBy=name');
      await settled();

      act(() => {
        query().removeParams(['search']);
        other().setParams({ status: 'draft' });
      });
      await settled();

      expect(router.state.location.search).toBe('?sortBy=name&status=draft');
    });

    it('both components see the final URL once it is committed', async () => {
      const { router, query, other, settled } = setup('/products');
      await settled();

      act(() => {
        query().setParams({ a: '1' });
        other().setParams({ b: '2' });
      });
      await settled();

      await waitFor(() => {
        expect(query().queryParams).toEqual({ a: '1', b: '2' });
        expect(other().queryParams).toEqual({ a: '1', b: '2' });
      });
      expect(router.state.location.search).toBe('?a=1&b=2');
    });
  });

  it('keeps the hash through updates that are still in flight', async () => {
    const { router, query, other, settled, gate } = setup('/products?sort=name#reviews');
    await settled();

    gate.hold();
    act(() => {
      query().setParams({ status: 'draft' });
    });
    act(() => {
      other().removeParams(['sort']);
    });
    gate.release();
    await settled();

    expect(router.state.location.search).toBe('?status=draft');
    expect(router.state.location.hash).toBe('#reviews');
  });

  it('follows the real URL again once a navigation commits (Back)', async () => {
    const { router, query, settled } = setup('/products?a=1');
    await settled();

    act(() => {
      query().setParams({ b: '2' });
    });
    await settled();
    expect(router.state.location.search).toBe('?a=1&b=2');

    await act(async () => {
      await router.navigate(-1);
    });
    await settled();
    expect(router.state.location.search).toBe('?a=1');

    act(() => {
      query().setParams({ c: '3' });
    });
    await settled();

    expect(router.state.location.search).toBe('?a=1&c=3');
  });
});
