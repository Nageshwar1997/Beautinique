import { setErrorReporter } from '@beautinique/frontend-app-shell';
import { ACCOUNT_PATHS } from '@beautinique/frontend-auth-ui';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import axe from 'axe-core';
import { createMemoryRouter, data, type RouteObject, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import { ACCOUNT_NAV, FOOTER_NAV, MAIN_NAV } from '../src/nav';
import { Providers } from '../src/providers';
import { Frame, PageError, RootError } from '../src/root';
import { routes } from '../src/routes';

afterEach(cleanup);

// the app's routes with the frame inside the providers, but no wake-up screen (it would call the
// server): someone signed out (no hint cookie), so nothing asks the API
const [root] = routes as [RouteObject];
const testRoutes: RouteObject[] = [
  {
    ...root,
    element: (
      <Providers>
        <Frame />
      </Providers>
    ),
  },
];

function renderAt(at: string) {
  const router = createMemoryRouter(testRoutes, { initialEntries: [at] });
  const view = render(<RouterProvider router={router} />);
  return {
    ...view,
    router,
    where: () => `${router.state.location.pathname}${router.state.location.search}`,
  };
}

/**
 * axe on what is rendered. Colour contrast needs a real layout, and label in name a canvas (jsdom
 * has none: the rule only errors here); the browser check covers both.
 */
async function violations(container: HTMLElement) {
  const results = await axe.run(container, {
    rules: {
      'color-contrast': { enabled: false },
      'label-content-name-mismatch': { enabled: false },
    },
  });
  return results.violations.map((violation) => `${violation.id}: ${violation.help}`);
}

describe('admin, signed out', () => {
  it('sends the home page to sign-in: the team only, no sign-up', async () => {
    const { container, where } = renderAt('/');
    expect(await screen.findByRole('heading', { level: 1, name: 'Sign in' })).toBeTruthy();
    expect(where()).toBe('/sign-in');
    expect(screen.queryByRole('link', { name: /Create an account/ })).toBeNull();
    expect(screen.getByRole('link', { name: 'Accept your invitation' }).getAttribute('href')).toBe(
      '/invitation',
    );
    expect(screen.getByRole('link', { name: 'Forgot password?' })).toBeTruthy();
    expect(document.title).toBe('Sign in | Beautinique Admin');
    expect(await violations(container)).toEqual([]);
  });

  it.each([ACCOUNT_PATHS.security, ACCOUNT_PATHS.authenticator, ACCOUNT_PATHS.devices, '/account'])(
    '%s asks to sign in first, and comes back after',
    async (path) => {
      const { where } = renderAt(path);
      await screen.findByRole('heading', { level: 1, name: 'Sign in' });
      expect(where()).toBe(`/sign-in?next=${encodeURIComponent(path)}`);
      // the invitation link keeps where to come back to
      expect(
        screen.getByRole('link', { name: 'Accept your invitation' }).getAttribute('href'),
      ).toBe(`/invitation?next=${encodeURIComponent(path)}`);
    },
  );

  it('has the invitation and the forgotten password open, each back to sign-in', async () => {
    const invitation = renderAt('/invitation?next=%2Faccount%2Fdevices');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Accept an invitation' }),
    ).toBeTruthy();
    expect(screen.getByLabelText('Email')).toBeTruthy();
    // the page's own link (the header has one too)
    expect(
      within(screen.getByRole('main')).getByRole('link', { name: 'Sign in' }).getAttribute('href'),
    ).toBe('/sign-in?next=%2Faccount%2Fdevices');
    expect(await violations(invitation.container)).toEqual([]);
    invitation.unmount();

    const forgot = renderAt('/forgot-password');
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Set a new password' }),
    ).toBeTruthy();
    expect(await violations(forgot.container)).toEqual([]);
  });

  it('has the icon credits open, linked from the footer', async () => {
    const { container } = renderAt('/credits');
    expect(await screen.findByRole('heading', { level: 1, name: 'Icon credits' })).toBeTruthy();
    const footer = screen.getByRole('navigation', { name: 'Footer' });
    expect(footer.querySelector('a')?.getAttribute('href')).toBe('/credits');
    expect(await violations(container)).toEqual([]);
  });

  it('shows "Page not found" for unknown paths, signed in or not', async () => {
    const { container } = renderAt('/no-such-page');
    expect(await screen.findByRole('heading', { level: 1, name: 'Page not found' })).toBeTruthy();
    expect(document.title).toBe('Page not found | Beautinique Admin');
    expect(await violations(container)).toEqual([]);
  });

  it('has the frame: skip link first, the app home, the theme and "Sign in"', async () => {
    renderAt('/credits');
    await screen.findByRole('heading', { level: 1, name: 'Icon credits' });
    const skip = screen.getAllByRole('link')[0];
    expect(skip?.textContent).toBe('Skip to content');
    expect(screen.getByRole('link', { name: 'Beautinique Admin home' }).getAttribute('href')).toBe(
      '/',
    );
    expect(screen.getByRole('radio', { name: 'Dark theme' })).toBeTruthy();
    await waitFor(() => {
      expect(
        within(screen.getByRole('banner'))
          .getByRole('link', { name: 'Sign in' })
          .getAttribute('href'),
      ).toBe('/sign-in?next=%2Fcredits');
    });
  });

  it('reports a page that broke to monitoring, and not an expected answer like a 404', async () => {
    const got: unknown[] = [];
    setErrorReporter((error) => got.push(error));
    try {
      const crash = new Error('page exploded');
      const broken: RouteObject[] = [
        {
          element: (
            <Providers>
              <Frame />
            </Providers>
          ),
          errorElement: <RootError />,
          children: [
            {
              errorElement: <PageError />,
              children: [
                {
                  path: '/boom',
                  Component: () => {
                    throw crash;
                  },
                },
                {
                  path: '/gone',
                  loader: () => {
                    // eslint-disable-next-line @typescript-eslint/only-throw-error -- React Router's way to answer 404
                    throw data('Not here', { status: 404 });
                  },
                  Component: () => null,
                },
              ],
            },
          ],
        },
      ];
      for (const at of ['/boom', '/gone']) {
        render(<RouterProvider router={createMemoryRouter(broken, { initialEntries: [at] })} />);
        await screen.findByRole('heading', { level: 1, name: 'Something went wrong' });
        cleanup();
      }
      expect(got).toEqual([crash]);
    } finally {
      setErrorReporter(undefined);
    }
  });

  it('links only pages that exist', () => {
    expect(MAIN_NAV).toEqual([]);
    expect(FOOTER_NAV.map((item) => item.to)).toEqual(['/credits']);
    expect(ACCOUNT_NAV.map((item) => item.to)).toEqual([
      ACCOUNT_PATHS.security,
      ACCOUNT_PATHS.devices,
    ]);
  });
});
