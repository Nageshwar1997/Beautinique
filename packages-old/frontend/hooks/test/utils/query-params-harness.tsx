import { render, waitFor } from '@testing-library/react';
import { useState } from 'react';
import {
  type Blocker,
  type BlockerFunction,
  createMemoryRouter,
  RouterProvider,
} from 'react-router';
import { expect } from 'vitest';

import { useQueryParams } from '../../src/router/use-query-params';
import { BlockerGate } from './blocker-gate';
import { createNavigationGate } from './navigation-gate';

export interface SetupQueryParamsOptions {
  /** Puts a `useBlocker(block)` on the page, like an app guarding unsaved changes. */
  block?: boolean | BlockerFunction;
  /** Runs inside the route loader with the URL being loaded; return `redirect(...)` to send the user elsewhere. */
  onLoad?: (url: URL) => Response | undefined;
}

// The apps use a *data router* (`createBrowserRouter`): `navigate()` is asynchronous there - the new
// URL is only committed a moment later, after the router has finished the navigation. The tests
// that use `MemoryRouter` commit the update together with the next render instead.
/** Two components that each call `useQueryParams()` inside a data router whose navigations a test can hold back. */
export const setupQueryParams = (
  entry: string,
  { block, onLoad }: SetupQueryParamsOptions = {},
) => {
  const gate = createNavigationGate();
  const exposed: {
    query?: ReturnType<typeof useQueryParams>;
    other?: ReturnType<typeof useQueryParams>;
    blocker?: Blocker;
    blockerReady?: boolean;
    rerender?: () => void;
  } = {};

  // A second component using the hook, like a page with a filter bar and a search box that each
  // call useQueryParams() on their own.
  const Other = () => {
    exposed.other = useQueryParams();
    return null;
  };

  const Probe = () => {
    const [, force] = useState(0);
    exposed.rerender = () => {
      force((count) => count + 1);
    };
    exposed.query = useQueryParams();

    return (
      <>
        <Other />
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
        // like the apps' routes (middleware, lazy pages): the router commits a navigation later, not at once.
        // A test can hold it back with gate.hold() to keep that window open as long as it needs.
        loader: async ({ request }) => {
          await gate.pass();
          return onLoad?.(new URL(request.url)) ?? null;
        },
      },
    ],
    { initialEntries: [entry] },
  );
  render(<RouterProvider router={router} />);

  const query = () => {
    if (!exposed.query) throw new Error('hook not rendered yet');
    return exposed.query;
  };

  const other = () => {
    if (!exposed.other) throw new Error('hook not rendered yet');
    return exposed.other;
  };

  /** The router's blocker (only when the test asked for one with `block`). */
  const blocker = () => {
    if (!exposed.blocker) throw new Error('no blocker on this page');
    return exposed.blocker;
  };

  // with a loader the router needs a moment to initialise (and render the hook) before anything can be tested
  const settled = () =>
    waitFor(() => {
      expect(router.state.initialized).toBe(true);
      expect(router.state.navigation.state).toBe('idle');
      expect(exposed.query).toBeDefined();
      expect(exposed.other).toBeDefined();
      // a navigation made before the blocker is registered would not be blocked
      expect(block === undefined || exposed.blockerReady === true).toBe(true);
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

  return {
    router,
    query,
    other,
    blocker,
    settled,
    urlIs,
    blockerIs,
    gate,
    rerender: () => exposed.rerender?.(),
  };
};
