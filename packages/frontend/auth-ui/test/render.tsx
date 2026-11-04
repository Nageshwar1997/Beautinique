import { ApiProvider, createApiClient, createQueryClient } from '@beautinique/frontend-api-client';
import { Toaster } from '@beautinique/frontend-components';
import type { AppId } from '@beautinique/shared-contracts';
import { render } from '@testing-library/react';
import { type ReactNode, StrictMode } from 'react';
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router';

import { SessionProvider, StepUpProvider } from '../src/index';
import { BASE_URL, type FakeIdentity } from './fake-identity';

/** Where the router is, for tests: the path, the search and what the page was handed. */
function Where() {
  const location = useLocation();
  return (
    <p hidden data-testid="where">
      {`${location.pathname}${location.search}`}
    </p>
  );
}

/**
 * `pages` (path → element) inside an app's API client, Query cache, session and toasts, starting at
 * `at`. Every page shows where the router is (`where()`).
 */
export function renderApp(
  pages: Record<string, ReactNode>,
  {
    identity,
    app = 'customer',
    at = '/',
    strict = false,
  }: { identity: FakeIdentity; app?: AppId; at?: string; strict?: boolean },
) {
  const client = createApiClient({ app, baseUrl: BASE_URL, fetch: identity.fetch });
  const queryClient = createQueryClient();
  const router = createMemoryRouter(
    Object.entries(pages).map(([path, element]) => ({
      path,
      element: (
        <StepUpProvider>
          {element}
          <Where />
        </StepUpProvider>
      ),
    })),
    { initialEntries: [at] },
  );
  const tree = (
    <ApiProvider client={client} queryClient={queryClient}>
      <SessionProvider>
        <RouterProvider router={router} />
        <Toaster />
      </SessionProvider>
    </ApiProvider>
  );
  const view = render(strict ? <StrictMode>{tree}</StrictMode> : tree);
  return { ...view, router, client, queryClient };
}

export const where = () => document.querySelector('[data-testid="where"]')?.textContent ?? '';
