import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, expectTypeOf, it } from 'vitest';

import { usePathParams } from '../../src/router/use-path-params';

// The keys of a route's params are known by the page that renders it, so it can say them once and
// get `pathParams.slug` instead of a loose index signature. Without a type argument nothing changes.
const createWrapper = () => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={['/c/skin/serum']}>
      <Routes>
        <Route path="/c/:categoryL1/:slug" element={children} />
      </Routes>
    </MemoryRouter>
  );

  return Wrapper;
};

describe('usePathParams: the type of pathParams', () => {
  it('by default any key is allowed, and a value may be missing', () => {
    const { result } = renderHook(() => usePathParams(), { wrapper: createWrapper() });

    expectTypeOf(result.current.pathParams.anything).toEqualTypeOf<string | undefined>();
    expect(result.current.pathParams.anything).toBeUndefined();
  });

  it('with keys, only those keys are there', () => {
    type TParams = ReturnType<typeof usePathParams<'categoryL1' | 'slug'>>['pathParams'];

    expectTypeOf<TParams['slug']>().toEqualTypeOf<string | undefined>();
    expectTypeOf<TParams['categoryL1']>().toEqualTypeOf<string | undefined>();
    expectTypeOf<TParams>().toHaveProperty('slug');
    expectTypeOf<TParams>().not.toHaveProperty('nope');
  });

  it('with a record type, the keys are optional', () => {
    type TParams = ReturnType<typeof usePathParams<{ productId: string }>>['pathParams'];

    expectTypeOf<TParams>().toEqualTypeOf<Readonly<Partial<{ productId: string }>>>();
  });

  it('does not change anything else that the hook returns', () => {
    type TKeyed = ReturnType<typeof usePathParams<'slug'>>;
    type TDefault = ReturnType<typeof usePathParams<string>>;

    expectTypeOf<TKeyed['paths']>().toEqualTypeOf<TDefault['paths']>();
    expectTypeOf<TKeyed['navigate']>().toEqualTypeOf<TDefault['navigate']>();
    expectTypeOf<TKeyed['location']>().toEqualTypeOf<TDefault['location']>();
    expectTypeOf<TKeyed['pathname']>().toEqualTypeOf<string>();
  });

  it('gives the same values at runtime, typed or not', () => {
    const wrapper = createWrapper();
    const typed = renderHook(() => usePathParams<'categoryL1' | 'slug'>(), { wrapper });
    const loose = renderHook(() => usePathParams(), { wrapper });

    expect(typed.result.current.pathParams.slug).toBe('serum');
    expect(typed.result.current.pathParams.categoryL1).toBe('skin');
    expect(typed.result.current.pathParams).toEqual(loose.result.current.pathParams);
  });
});
