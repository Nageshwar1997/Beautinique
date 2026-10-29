import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';

import { usePathParams } from '../../src/router/use-path-params';

const createWrapper = (entry: string | { pathname: string; search?: string; hash?: string }) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/products/:productId/reviews/:reviewId" element={children} />
        <Route path="/products/:productId" element={children} />
        <Route path="*" element={children} />
      </Routes>
    </MemoryRouter>
  );

  return Wrapper;
};

describe('usePathParams', () => {
  it('splits the pathname into its non-empty segments', () => {
    const { result } = renderHook(() => usePathParams(), {
      wrapper: createWrapper('/seller/products//list/'),
    });

    expect(result.current.paths).toEqual(['seller', 'products', 'list']);
  });

  it('returns no segments for the root path', () => {
    const { result } = renderHook(() => usePathParams(), { wrapper: createWrapper('/') });

    expect(result.current.paths).toEqual([]);
  });

  it('exposes the dynamic route params as pathParams', () => {
    const { result } = renderHook(() => usePathParams(), {
      wrapper: createWrapper('/products/42/reviews/7'),
    });

    expect(result.current.pathParams).toEqual({ productId: '42', reviewId: '7' });
  });

  it('exposes the location, both nested and spread flat', () => {
    const { result } = renderHook(() => usePathParams(), {
      wrapper: createWrapper({ pathname: '/products/42', search: '?tab=info', hash: '#top' }),
    });

    expect(result.current.location.pathname).toBe('/products/42');
    expect(result.current.pathname).toBe('/products/42');
    expect(result.current.search).toBe('?tab=info');
    expect(result.current.hash).toBe('#top');
    expect(result.current.location.search).toBe(result.current.search);
  });

  it('navigate() moves to the new path and the hook values follow', () => {
    const { result } = renderHook(() => usePathParams(), { wrapper: createWrapper('/products/1') });
    expect(result.current.pathParams).toEqual({ productId: '1' });

    act(() => {
      void result.current.navigate('/products/2');
    });

    expect(result.current.pathname).toBe('/products/2');
    expect(result.current.paths).toEqual(['products', '2']);
    expect(result.current.pathParams).toEqual({ productId: '2' });
  });

  describe('identities', () => {
    it('returns the very same object while the route does not change', () => {
      const { result, rerender } = renderHook(() => usePathParams(), {
        wrapper: createWrapper('/products/1?tab=info'),
      });
      const first = result.current;

      rerender();
      rerender();

      expect(result.current).toBe(first);
      expect(result.current.paths).toBe(first.paths);
      expect(result.current.navigate).toBe(first.navigate);
      expect(result.current.pathParams).toBe(first.pathParams);
    });

    it('keeps the same pathParams object while the param values stay the same, even across navigations', () => {
      const { result } = renderHook(() => usePathParams(), {
        wrapper: createWrapper('/products/1'),
      });
      const first = result.current.pathParams;

      act(() => {
        void result.current.navigate('/products/1?tab=reviews');
      });

      expect(result.current.pathParams).toBe(first);
    });

    it('gives a new pathParams object when a param value changes', () => {
      const { result } = renderHook(() => usePathParams(), {
        wrapper: createWrapper('/products/1'),
      });
      const first = result.current.pathParams;

      act(() => {
        void result.current.navigate('/products/2');
      });

      expect(result.current.pathParams).not.toBe(first);
      expect(result.current.pathParams).toEqual({ productId: '2' });
    });

    it('gives a new object when the location changes', () => {
      const { result } = renderHook(() => usePathParams(), {
        wrapper: createWrapper('/products/1'),
      });
      const first = result.current;

      act(() => {
        void result.current.navigate('/products/2');
      });

      expect(result.current).not.toBe(first);
      expect(result.current.paths).not.toBe(first.paths);
    });

    it('keeps the same paths array when only the query string or hash changes', () => {
      const { result } = renderHook(() => usePathParams(), {
        wrapper: createWrapper('/products/1'),
      });
      const first = result.current;

      act(() => {
        void result.current.navigate('/products/1?tab=reviews#top');
      });

      expect(result.current.search).toBe('?tab=reviews');
      expect(result.current).not.toBe(first); // the location changed...
      expect(result.current.paths).toBe(first.paths); // ...but the path segments did not
    });
  });
});
