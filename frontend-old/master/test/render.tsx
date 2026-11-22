// The Master app signed in as someone, against the pretend API (fake-api.ts), for the page tests.
import { ApiProvider, createApiClient, createQueryClient } from '@beautinique/frontend-api-client';
import { SessionProvider, StepUpProvider } from '@beautinique/frontend-auth-ui';
import { Toaster } from '@beautinique/frontend-components';
import { render } from '@testing-library/react';
import axe from 'axe-core';
import { createMemoryRouter, type RouteObject, RouterProvider } from 'react-router';

import { Frame } from '../src/root';
import { routes } from '../src/routes';
import { BASE_URL, fakeApi, type Who } from './fake-api';

const [root] = routes as [RouteObject];

/** The app's pages, signed in as `who`, against the pretend API; starting at `at`. */
export function renderAs(who: Who, at: string) {
  const api = fakeApi(who);
  const client = createApiClient({ app: 'master', baseUrl: BASE_URL, fetch: api.fetch });
  const queryClient = createQueryClient();
  const router = createMemoryRouter(
    [
      {
        ...root,
        element: (
          <ApiProvider client={client} queryClient={queryClient}>
            <SessionProvider>
              <StepUpProvider>
                <Frame />
              </StepUpProvider>
            </SessionProvider>
            <Toaster />
          </ApiProvider>
        ),
      },
    ],
    { initialEntries: [at] },
  );
  const view = render(<RouterProvider router={router} />);
  return {
    ...view,
    api,
    router,
    where: () => `${router.state.location.pathname}${router.state.location.search}`,
  };
}

export async function violations(container: HTMLElement) {
  const results = await axe.run(container, {
    rules: {
      'color-contrast': { enabled: false },
      'label-content-name-mismatch': { enabled: false },
      region: { enabled: false },
    },
  });
  return results.violations.map((violation) => `${violation.id}: ${violation.help}`);
}
