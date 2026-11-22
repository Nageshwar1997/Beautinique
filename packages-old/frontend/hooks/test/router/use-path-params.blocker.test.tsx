import { act, cleanup, render, waitFor } from '@testing-library/react';
import type { Blocker } from 'react-router';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import { usePathParams } from '../../src/router/use-path-params';
import { BlockerGate } from '../utils/blocker-gate';

// B1, B2, B4 of the useBlocker matrix for the hook that only reads the route: while a navigation is
// blocked nothing it returns moves, `reset()` leaves it there and `proceed()` moves it.
describe('usePathParams with useBlocker', () => {
  afterEach(() => {
    cleanup();
  });

  type TValues = ReturnType<typeof usePathParams>;

  const setup = (entries: string[], index: number, block: boolean) => {
    const exposed: { values?: TValues; blocker?: Blocker; ready?: boolean; renders: number } = {
      renders: 0,
    };

    const Page = () => {
      exposed.values = usePathParams();
      exposed.renders += 1;

      return (
        <BlockerGate
          block={block}
          onBlocker={(blocker) => {
            exposed.blocker = blocker;
          }}
          onReady={() => {
            exposed.ready = true;
          }}
        />
      );
    };

    const router = createMemoryRouter(
      [
        { path: '/products/:productId', element: <Page /> },
        { path: '*', element: <Page /> },
      ],
      { initialEntries: entries, initialIndex: index },
    );
    render(<RouterProvider router={router} />);

    const values = () => {
      if (!exposed.values) throw new Error('not rendered');

      return exposed.values;
    };

    return {
      router,
      exposed,
      values,
      ready: () =>
        waitFor(() => {
          expect(exposed.ready).toBe(true);
        }),
    };
  };

  it('B1: a blocked navigation changes nothing; reset() leaves everything where it was', async () => {
    const { router, exposed, values, ready } = setup(['/products/1?tab=info#top'], 0, true);
    await ready();
    const before = values();

    await act(async () => {
      await router.navigate('/products/2');
    });
    expect(exposed.blocker?.state).toBe('blocked');
    expect(values()).toBe(before); // not even a new object
    expect(values().pathParams).toEqual({ productId: '1' });

    act(() => {
      exposed.blocker?.reset?.();
    });
    await waitFor(() => {
      expect(exposed.blocker?.state).toBe('unblocked');
    });

    expect(values().pathname).toBe('/products/1');
    expect(values().paths).toEqual(['products', '1']);
    expect(values().search).toBe('?tab=info');
    expect(values().hash).toBe('#top');
  });

  it('B2: proceed() moves the route, and everything the hook returns follows', async () => {
    const { router, exposed, values, ready } = setup(['/products/1'], 0, true);
    await ready();

    await act(async () => {
      await router.navigate('/products/2?tab=x');
    });
    act(() => {
      exposed.blocker?.proceed?.();
    });

    await waitFor(() => {
      expect(values().pathname).toBe('/products/2');
    });
    expect(values().pathParams).toEqual({ productId: '2' });
    expect(values().paths).toEqual(['products', '2']);
    expect(values().search).toBe('?tab=x');
  });

  it('B4: a blocked Back keeps the hook where it is, and proceed() takes it Back', async () => {
    const { router, exposed, values, ready } = setup(['/products/1', '/products/2'], 1, true);
    await ready();
    expect(values().pathParams).toEqual({ productId: '2' });

    await act(async () => {
      await router.navigate(-1);
    });
    await waitFor(() => {
      expect(exposed.blocker?.state).toBe('blocked');
    });

    expect(values().pathname).toBe('/products/2');
    expect(values().pathParams).toEqual({ productId: '2' });
    expect(router.state.location.pathname).toBe('/products/2'); // the router restored its own URL

    act(() => {
      exposed.blocker?.proceed?.();
    });
    await waitFor(() => {
      expect(values().pathname).toBe('/products/1');
    });
    expect(values().pathParams).toEqual({ productId: '1' });
  });

  it('B4b: after a blocked Back is reset, the hook is still on the same route', async () => {
    const { router, exposed, values, ready } = setup(['/products/1', '/products/2'], 1, true);
    await ready();

    await act(async () => {
      await router.navigate(-1);
    });
    await waitFor(() => {
      expect(exposed.blocker?.state).toBe('blocked');
    });
    act(() => {
      exposed.blocker?.reset?.();
    });
    await waitFor(() => {
      expect(exposed.blocker?.state).toBe('unblocked');
    });

    expect(values().pathname).toBe('/products/2');
    expect(values().paths).toEqual(['products', '2']);
  });

  it('B5: a blocker that only blocks a change of path lets query-string changes through', async () => {
    const exposed: { values?: TValues; ready?: boolean } = {};
    const Page = () => {
      exposed.values = usePathParams();

      return (
        <BlockerGate
          block={({ currentLocation, nextLocation }) =>
            currentLocation.pathname !== nextLocation.pathname
          }
          onBlocker={() => undefined}
          onReady={() => {
            exposed.ready = true;
          }}
        />
      );
    };
    const router = createMemoryRouter([{ path: '*', element: <Page /> }], {
      initialEntries: ['/products/1'],
    });
    render(<RouterProvider router={router} />);
    await waitFor(() => {
      expect(exposed.ready).toBe(true);
    });

    await act(async () => {
      await router.navigate('/products/1?tab=x');
    });
    expect(exposed.values?.search).toBe('?tab=x');

    await act(async () => {
      await router.navigate('/products/2');
    });
    expect(exposed.values?.pathname).toBe('/products/1'); // the path change is blocked
  });
});
