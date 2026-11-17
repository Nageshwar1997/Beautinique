import { act, render, waitFor } from '@testing-library/react';
import { useState } from 'react';
import {
  type Blocker,
  type BlockerFunction,
  createMemoryRouter,
  RouterProvider,
} from 'react-router';
import { expect } from 'vitest';

import { useQueryParamInput } from '../../src/router/use-query-param-input';
import { useQueryParams } from '../../src/router/use-query-params';
import { BlockerGate } from './blocker-gate';
import { createNavigationGate, type NavigationGateOptions } from './navigation-gate';

export const SHORT_DELAY = 40;

export interface SetupQueryParamInputOptions extends NavigationGateOptions {
  /** The debounce of the box. @default SHORT_DELAY */
  delay?: number;
  /** Puts a `useBlocker(block)` on the page, like an app guarding unsaved changes. */
  block?: boolean | BlockerFunction;
  /** Runs inside the route loader with the URL being loaded; return `redirect(...)` to send the user elsewhere. */
  onLoad?: (url: URL) => Response | undefined;
}

// The apps use a *data router* (`createBrowserRouter`): `navigate()` is asynchronous there - the new
// URL is only committed a moment later. The tests that care about the order of events keep a
// navigation "in flight" with `gate.hold()` and let it through with `gate.release()`, so nothing
// depends on how fast the machine is.
/** A search box (`useQueryParamInput('search')`) next to a second component that also updates the URL, in a data router. */
export const setupQueryParamInput = (
  entry: string,
  { delay = SHORT_DELAY, latencyMs, block, onLoad }: SetupQueryParamInputOptions = {},
) => {
  const gate = createNavigationGate({ latencyMs });
  // the debounce the box uses on its next render: a test can change it to make a typed text wait much longer
  const config = { delay };
  const exposed: {
    input?: ReturnType<typeof useQueryParamInput>;
    filters?: ReturnType<typeof useQueryParams>;
    blocker?: Blocker;
    blockerReady?: boolean;
    rerender?: () => void;
  } = {};
  // every value the box rendered with, in order
  const seen: string[] = [];

  // a second component that also uses the URL, like the status select next to a search box
  const Filters = () => {
    exposed.filters = useQueryParams();
    return null;
  };

  const Probe = () => {
    const [, force] = useState(0);
    exposed.rerender = () => {
      force((count) => count + 1);
    };
    exposed.input = useQueryParamInput('search', { delay: config.delay });
    seen.push(exposed.input.value);

    return (
      <>
        <Filters />
        {block !== undefined && (
          <BlockerGate
            block={block}
            onBlocker={(blocker) => {
              exposed.blocker = blocker;
            }}
            onReady={() => {
              exposed.blockerReady = true;
            }}
          />
        )}
      </>
    );
  };

  const router = createMemoryRouter(
    [
      {
        path: '*',
        Component: Probe,
        loader: async ({ request }) => {
          await gate.pass();

          return onLoad?.(new URL(request.url)) ?? null;
        },
      },
    ],
    { initialEntries: [entry] },
  );
  render(<RouterProvider router={router} />);

  const input = () => {
    if (!exposed.input) throw new Error('hook not rendered yet');
    return exposed.input;
  };

  const filters = () => {
    if (!exposed.filters) throw new Error('hook not rendered yet');
    return exposed.filters;
  };

  /** The router's blocker (only when the test asked for one with `block`). */
  const blocker = () => {
    if (!exposed.blocker) throw new Error('no blocker on this page');
    return exposed.blocker;
  };

  const settled = () =>
    waitFor(() => {
      expect(router.state.initialized).toBe(true);
      expect(router.state.navigation.state).toBe('idle');
      expect(exposed.input).toBeDefined();
      expect(exposed.filters).toBeDefined();
      // a navigation made before the blocker is registered would not be blocked
      expect(block === undefined || exposed.blockerReady === true).toBe(true);
    });

  // a navigation is in flight (only reachable on purpose after `gate.hold()`)
  const navigating = () =>
    waitFor(() => {
      expect(router.state.navigation.state).toBe('loading');
    });

  // a short timeout: when it is not true the test should fail with the URL it got, not hang
  const urlIs = (search: string) =>
    waitFor(
      () => {
        expect(router.state.location.search).toBe(search);
      },
      { timeout: 4000 },
    );

  /** Waits until the blocker is in `state`. */
  const blockerIs = (state: Blocker['state']) =>
    waitFor(() => {
      expect(blocker().state).toBe(state);
    });

  /** From now on a typed text waits this long before it is sent. */
  const setDelay = (ms: number) => {
    config.delay = ms;
    act(() => {
      exposed.rerender?.();
    });
  };

  return {
    router,
    input,
    filters,
    blocker,
    settled,
    navigating,
    urlIs,
    blockerIs,
    gate,
    seen,
    setDelay,
  };
};
