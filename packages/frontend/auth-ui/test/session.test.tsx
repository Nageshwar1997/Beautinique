import { clearToasts } from '@beautinique/frontend-components';
import { cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { AccountMenu, RedirectIfSignedIn, RequireSignIn, useSession } from '../src/index';
import { expectNoAxeViolations } from './axe';
import { dropHint, EMAIL, failure, fakeIdentity, hintSet, setHint } from './fake-identity';
import { renderApp, where } from './render';

afterEach(() => {
  cleanup();
  clearToasts();
  dropHint('customer');
});

function Status() {
  const { state } = useSession();
  return <p data-testid="status">{state.status}</p>;
}
const status = () => screen.getByTestId('status').textContent;

describe('the session', () => {
  it('asks nothing without the hint cookie: an anonymous visit costs no call', async () => {
    const identity = fakeIdentity('customer');
    renderApp({ '/': <Status /> }, { identity });
    await waitFor(() => {
      expect(status()).toBe('signed-out');
    });
    expect(identity.sent).toEqual([]);
  });

  it('reads /iam/me when the hint is there, and is signed in', async () => {
    setHint('customer');
    const identity = fakeIdentity('customer', { signedIn: true });
    renderApp({ '/': <Status /> }, { identity });
    await waitFor(() => {
      expect(status()).toBe('signed-in');
    });
    expect(identity.paths()).toEqual(['GET /iam/me']);
  });

  it('is signed out, and drops the hint, when the session turned out to be gone', async () => {
    setHint('customer');
    const identity = fakeIdentity('customer');
    // a session ended on another device: identity never cleared this browser's hint
    identity.on('POST /auth/refresh', () =>
      failure(401, 'SESSION_EXPIRED', 'Please sign in again.'),
    );
    renderApp({ '/': <Status /> }, { identity });
    await waitFor(() => {
      expect(status()).toBe('signed-out');
    });
    expect(identity.paths()).toEqual(['GET /iam/me', 'POST /auth/refresh']);
    expect(hintSet('customer')).toBe(false);
  });

  it('is unavailable, not signed out, when /iam/me cannot be reached after two more tries', async () => {
    setHint('customer');
    const identity = fakeIdentity('customer', { signedIn: true });
    identity.on('GET /iam/me', () => failure(503, 'SERVICE_UNAVAILABLE'));
    renderApp({ '/': <Status /> }, { identity });
    await waitFor(
      () => {
        expect(status()).toBe('unavailable');
      },
      { timeout: 8000 },
    );
    expect(identity.paths()).toEqual(['GET /iam/me', 'GET /iam/me', 'GET /iam/me']);
    expect(hintSet('customer')).toBe(true);
  });

  it('asks /iam/me again when the server did not answer, and is signed in without a focus or reload (QA-FE-009)', async () => {
    setHint('customer');
    const identity = fakeIdentity('customer', { signedIn: true });
    // a server restarting (Render's deploy): one 502, then it answers
    identity.on('GET /iam/me', () => {
      identity.off('GET /iam/me');
      return failure(502, 'INTERNAL');
    });
    renderApp({ '/': <Status /> }, { identity });
    await waitFor(
      () => {
        expect(status()).toBe('signed-in');
      },
      { timeout: 5000 },
    );
    expect(identity.paths()).toEqual(['GET /iam/me', 'GET /iam/me']);
  });
});

describe('RequireSignIn and RedirectIfSignedIn', () => {
  it('sends someone signed out to sign-in, with the page to come back to', async () => {
    const identity = fakeIdentity('customer');
    renderApp(
      {
        '/orders': (
          <RequireSignIn>
            <p>Your orders</p>
          </RequireSignIn>
        ),
        '/sign-in': <p>Sign in page</p>,
      },
      { identity, at: '/orders?page=2' },
    );
    await screen.findByText('Sign in page');
    expect(where()).toBe('/sign-in?next=%2Forders%3Fpage%3D2');
  });

  it('shows the page to someone signed in, a spinner until it is known', async () => {
    setHint('customer');
    const identity = fakeIdentity('customer', { signedIn: true });
    renderApp(
      {
        '/orders': (
          <RequireSignIn>
            <p>Your orders</p>
          </RequireSignIn>
        ),
      },
      { identity, at: '/orders' },
    );
    expect(screen.getByRole('status').textContent).toContain('Loading');
    await screen.findByText('Your orders');
  });

  it('says the account could not be loaded when the server never answered, and tries again on request (QA-FE-009)', async () => {
    setHint('customer');
    const identity = fakeIdentity('customer', { signedIn: true });
    identity.on('GET /iam/me', () => failure(503, 'SERVICE_UNAVAILABLE'));
    renderApp(
      {
        '/orders': (
          <RequireSignIn>
            <p>Your orders</p>
          </RequireSignIn>
        ),
      },
      { identity, at: '/orders' },
    );
    const heading = await screen.findByRole(
      'heading',
      { name: 'We could not load your account' },
      { timeout: 8000 },
    );
    // the app-shell's error page (owner, 2026-11-07), said at once to screen readers
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('The server did not answer. Please try again in a moment.');
    expect(alert.querySelector('[data-error-code="Oops"]')).toBeTruthy();
    // "Try again" first (the main way), then the home page
    const ways = [...alert.querySelectorAll('a, button')].map((way) => way.textContent);
    expect(ways.slice(0, 2)).toEqual(['Try again', 'Go to the home page']);
    // still signed in: no trip to sign-in, the hint stays
    expect(where()).toBe('/orders');
    expect(hintSet('customer')).toBe(true);
    await expectNoAxeViolations(heading.closest('[role="alert"]') ?? document.body);
    // the server is back: "Try again" asks /iam/me at once, and the page shows
    identity.off('GET /iam/me');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    await screen.findByText('Your orders');
  });

  it('sends someone signed in from an auth page straight on to next', async () => {
    setHint('customer');
    const identity = fakeIdentity('customer', { signedIn: true });
    renderApp(
      {
        '/sign-in': (
          <RedirectIfSignedIn>
            <p>Sign in page</p>
          </RedirectIfSignedIn>
        ),
        '/orders': <p>Your orders</p>,
      },
      { identity, at: '/sign-in?next=%2Forders' },
    );
    // the page is there first (server render, first paint), then the person moves on
    expect(screen.getByText('Sign in page')).toBeTruthy();
    await screen.findByText('Your orders');
  });
});

describe('AccountMenu', () => {
  it('keeps its place while the session is not known, then offers sign-in back to this page', async () => {
    setHint('customer');
    const identity = fakeIdentity('customer');
    identity.on('POST /auth/refresh', () => failure(401, 'SESSION_EXPIRED'));
    const { container } = renderApp(
      { '/products/rose': <AccountMenu />, '/sign-in': <p>Sign in page</p> },
      { identity, at: '/products/rose?v=2' },
    );
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
    const link = await screen.findByRole('link', { name: 'Sign in' });
    expect(link.getAttribute('href')).toBe('/sign-in?next=%2Fproducts%2Frose%3Fv%3D2');
    await expectNoAxeViolations();
  });

  it('shows who is signed in, the account pages, and signs out (no call left cached)', async () => {
    setHint('customer');
    const identity = fakeIdentity('customer', { signedIn: true });
    const user = userEvent.setup();
    const { queryClient } = renderApp(
      { '/': <AccountMenu links={[{ href: '/account/security', label: 'Security' }]} /> },
      { identity },
    );
    const button = await screen.findByRole('button', { name: `Account (${EMAIL})` });
    await user.click(button);
    expect(screen.getByRole('menu').textContent).toContain(EMAIL);
    expect(screen.getByRole('menuitem', { name: 'Security' }).getAttribute('href')).toBe(
      '/account/security',
    );
    await expectNoAxeViolations();
    await user.click(screen.getByRole('menuitem', { name: 'Sign out' }));
    await screen.findByRole('link', { name: 'Sign in' });
    expect(identity.paths()).toContain('POST /auth/logout');
    expect(hintSet('customer')).toBe(false);
    // the me query is still watched (the menu is on screen), but holds nothing of the person
    expect(
      queryClient
        .getQueryCache()
        .getAll()
        .map((query) => query.state.data),
    ).toEqual(
      queryClient
        .getQueryCache()
        .getAll()
        .map(() => undefined),
    );
    expect(await screen.findByText('You are signed out.')).toBeTruthy();
  });

  it('keeps the person signed in when the server did not end the session, and tries again from the toast (QA-FE-004)', async () => {
    setHint('customer');
    const identity = fakeIdentity('customer', { signedIn: true });
    identity.on('POST /auth/logout', () =>
      failure(503, 'SERVICE_UNAVAILABLE', 'Beautinique is not answering right now.'),
    );
    const user = userEvent.setup();
    renderApp(
      {
        '/': (
          <>
            <AccountMenu />
            <Status />
          </>
        ),
      },
      { identity },
    );
    await user.click(await screen.findByRole('button', { name: `Account (${EMAIL})` }));
    await user.click(screen.getByRole('menuitem', { name: 'Sign out' }));
    expect(await screen.findByText('You are still signed in.')).toBeTruthy();
    expect(screen.getByText('Beautinique is not answering right now.')).toBeTruthy();
    // the session, its cookies and the hint are all still there: nothing says otherwise
    expect(status()).toBe('signed-in');
    expect(hintSet('customer')).toBe(true);
    expect(screen.getByRole('button', { name: `Account (${EMAIL})` })).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Sign in' })).toBeNull();

    // the server answers again: "Try again" signs out, and the "still signed in" toast goes
    identity.off('POST /auth/logout');
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    await screen.findByRole('link', { name: 'Sign in' });
    expect(identity.paths().filter((path) => path === 'POST /auth/logout')).toHaveLength(2);
    expect(hintSet('customer')).toBe(false);
    expect((await screen.findAllByText('You are signed out.')).length).toBeGreaterThan(0);
    await waitFor(() => {
      expect(screen.queryByText('You are still signed in.')).toBeNull();
    });
  });

  it('takes the "still signed in" toast away once another tab signed out (QA-FE-004)', async () => {
    setHint('customer');
    const identity = fakeIdentity('customer', { signedIn: true });
    identity.on('POST /auth/logout', () => Promise.reject(new TypeError('Failed to fetch')));
    const user = userEvent.setup();
    renderApp({ '/': <AccountMenu /> }, { identity });
    await user.click(await screen.findByRole('button', { name: `Account (${EMAIL})` }));
    await user.click(screen.getByRole('menuitem', { name: 'Sign out' }));
    await screen.findByText('You are still signed in.');
    const otherTab = new BroadcastChannel('bq:customer:session');
    try {
      // the other tab's sign-out reached the server, which cleared the cookies
      dropHint('customer');
      otherTab.postMessage('signed-out');
      await screen.findByRole('link', { name: 'Sign in' });
      await waitFor(() => {
        expect(screen.queryByText('You are still signed in.')).toBeNull();
      });
    } finally {
      otherTab.close();
    }
  });
});
