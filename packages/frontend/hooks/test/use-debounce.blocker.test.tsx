import { act, cleanup, render } from '@testing-library/react';
import type { Blocker } from 'react-router';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDebounce } from '../src/use-debounce';
import { BlockerGate } from './utils/blocker-gate';

// B7 of the useBlocker matrix: a debounced call that is waiting while the router has a navigation
// blocked ("leave this page?" is open) must not crash or be lost, and it must not run after the page
// that owns it has been left.
describe('useDebounce with useBlocker (B7)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  const setup = () => {
    const calls: string[] = [];
    const exposed: {
      blocker?: Blocker;
      ready?: boolean;
      api?: ReturnType<typeof useDebounce<[string]>>;
    } = {};

    const Page = () => {
      exposed.api = useDebounce<[string]>({
        callback: (value) => {
          calls.push(value);
        },
        delay: 300,
      });

      return (
        <BlockerGate
          block
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
        { path: '/', element: <Page /> },
        { path: '/other', element: <div data-testid="other" /> },
      ],
      { initialEntries: ['/'] },
    );
    const view = render(<RouterProvider router={router} />);

    return { calls, exposed, router, ...view };
  };

  const ready = async (exposed: { ready?: boolean }) => {
    await vi.waitFor(() => {
      expect(exposed.ready).toBe(true);
    });
  };

  const api = (exposed: { api?: ReturnType<typeof useDebounce<[string]>> }) => {
    if (!exposed.api) throw new Error('not rendered');

    return exposed.api;
  };

  it('a call that is waiting still runs once while a navigation is blocked', async () => {
    const { calls, exposed, router } = setup();
    await ready(exposed);

    act(() => {
      api(exposed).trigger('typed');
    });
    await act(async () => {
      await router.navigate('/other');
    });
    expect(exposed.blocker?.state).toBe('blocked');

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(calls).toEqual(['typed']);
    expect(router.state.location.pathname).toBe('/');
  });

  it('flush() and isPending() work while a navigation is blocked', async () => {
    const { calls, exposed, router } = setup();
    await ready(exposed);

    act(() => {
      api(exposed).trigger('typed');
    });
    await act(async () => {
      await router.navigate('/other');
    });
    expect(api(exposed).isPending()).toBe(true);

    act(() => {
      api(exposed).flush();
    });

    expect(calls).toEqual(['typed']);
    expect(api(exposed).isPending()).toBe(false);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(calls).toEqual(['typed']);
  });

  it('after "reset" the same debounce keeps working', async () => {
    const { calls, exposed, router } = setup();
    await ready(exposed);
    await act(async () => {
      await router.navigate('/other');
    });
    act(() => {
      exposed.blocker?.reset?.();
    });

    act(() => {
      api(exposed).trigger('again');
      vi.advanceTimersByTime(300);
    });

    expect(calls).toEqual(['again']);
  });

  it('a call that is waiting never runs once "proceed" has left the page', async () => {
    const { calls, exposed, router, queryByTestId } = setup();
    await ready(exposed);

    act(() => {
      api(exposed).trigger('typed');
    });
    await act(async () => {
      await router.navigate('/other');
    });
    act(() => {
      exposed.blocker?.proceed?.();
    });
    await vi.waitFor(() => {
      expect(queryByTestId('other')).not.toBeNull();
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(calls).toEqual([]);
  });
});
