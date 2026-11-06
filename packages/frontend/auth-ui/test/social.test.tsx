import { cleanup, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { SecuritySettings, SignInForm, SocialSignIn, SocialSignUpFinish } from '../src/index';
import { expectNoAxeViolations } from './axe';
import {
  dropHint,
  EMAIL,
  failure,
  fakeIdentity,
  GOOD_CODE,
  json,
  LOGIN_ID,
  SESSION_ID,
  setHint,
  USER_ID,
} from './fake-identity';
import { renderApp, where } from './render';

afterEach(() => {
  cleanup();
  dropHint('customer');
});

/** The providers identity offers, from `origin`. */
const offering = (origin = window.location.origin, providers = ['google', 'linkedin', 'github']) =>
  json(200, { data: { providers, origin } });

/** /iam/me of an account that signs in with `providers`. */
const meWith = (providers: string[]) =>
  json(200, {
    data: {
      user: {
        userId: USER_ID,
        email: EMAIL,
        ageDeclaredAt: '2026-11-01T00:00:00.000Z',
        signUpApp: 'customer',
        providers,
        authenticator: false,
        recoveryCodesLeft: null,
      },
      session: { sessionId: SESSION_ID, app: 'customer', expiresAt: '2026-12-31T00:00:00.000Z' },
    },
  });

describe('SocialSignIn', () => {
  it('links to each provider where they work, keeping next', async () => {
    const identity = fakeIdentity('customer');
    identity.on('GET /auth/oauth/providers', () => offering());
    renderApp(
      {
        '/sign-in': (
          <SocialSignIn
            next="/orders?tab=1"
            icons={{ google: <svg data-testid="google-mark" /> }}
          />
        ),
      },
      { identity, at: '/sign-in' },
    );
    const google = await screen.findByRole('link', { name: 'Continue with Google' });
    // the mark is decoration: the link's text names the provider
    expect(google.contains(screen.getByTestId('google-mark'))).toBe(true);
    expect(screen.getByTestId('google-mark').parentElement?.getAttribute('aria-hidden')).toBe(
      'true',
    );
    expect(google.getAttribute('href')).toBe(
      '/api/v1/auth/oauth/google/start?next=%2Forders%3Ftab%3D1',
    );
    expect(screen.getByRole('link', { name: 'Continue with LinkedIn' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Continue with GitHub' })).toBeTruthy();
    await expectNoAxeViolations();
  });

  it('shows nothing on another origin (a preview), without providers, or with a next off the site', async () => {
    const elsewhere = fakeIdentity('customer');
    elsewhere.on('GET /auth/oauth/providers', () =>
      offering('https://beautinique-customer.vercel.app'),
    );
    renderApp({ '/': <SocialSignIn /> }, { identity: elsewhere });
    await waitFor(() => {
      expect(elsewhere.paths()).toContain('GET /auth/oauth/providers');
    });
    expect(screen.queryByRole('link')).toBeNull();
    cleanup();

    const none = fakeIdentity('customer');
    none.on('GET /auth/oauth/providers', () => offering(window.location.origin, []));
    renderApp({ '/': <SocialSignIn /> }, { identity: none });
    await waitFor(() => {
      expect(none.paths()).toContain('GET /auth/oauth/providers');
    });
    expect(screen.queryByText('or')).toBeNull();
    cleanup();

    const away = fakeIdentity('customer');
    away.on('GET /auth/oauth/providers', () => offering(window.location.origin, ['github']));
    renderApp({ '/': <SocialSignIn next="//evil.example" /> }, { identity: away });
    const github = await screen.findByRole('link', { name: 'Continue with GitHub' });
    expect(github.getAttribute('href')).toBe('/api/v1/auth/oauth/github/start');
  });
});

describe('the sign-in page after a provider', () => {
  it('says why a social sign-in came back', async () => {
    renderApp(
      { '/sign-in': <SignInForm /> },
      { identity: fakeIdentity('customer'), at: '/sign-in?oauth=email-unverified' },
    );
    expect(
      await screen.findByText(/That account has no verified email we can use\./),
    ).toHaveProperty('tagName', 'P');
    await expectNoAxeViolations();
  });

  it('goes straight to the authenticator code of an account that has one, then to next', async () => {
    const identity = fakeIdentity('customer');
    const user = userEvent.setup();
    const { router } = renderApp(
      { '/sign-in': <SignInForm />, '/orders': <p>Your orders</p> },
      { identity, at: `/sign-in?next=%2Forders#totp=${LOGIN_ID}` },
    );
    await user.type(await screen.findByLabelText('Authenticator code'), GOOD_CODE);
    // the sign-in's id leaves the address bar
    expect(window.location.hash).toBe('');
    expect(router.state.location.pathname).toBe('/sign-in');
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await screen.findByText('Your orders');
    expect(identity.sent.find((s) => s.path === `/auth/login/${LOGIN_ID}/totp`)?.body).toEqual({
      code: GOOD_CODE,
    });
  });
});

describe('SocialSignUpFinish', () => {
  const waiting = () =>
    json(200, {
      data: {
        provider: 'google',
        email: EMAIL,
        expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
        next: '/orders',
      },
    });

  it('asks the consent, then signs in and goes on to next', async () => {
    const identity = fakeIdentity('customer');
    identity.on('GET /auth/oauth/sign-up', waiting);
    identity.on('POST /auth/oauth/sign-up', () => {
      identity.state.signedIn = true;
      setHint('customer');
      return json(200, {
        data: { next: 'signed-in', user: { userId: USER_ID, email: EMAIL }, nextPath: '/orders' },
      });
    });
    const user = userEvent.setup();
    renderApp(
      { '/sign-up/finish': <SocialSignUpFinish />, '/orders': <p>Your orders</p> },
      { identity, at: '/sign-up/finish' },
    );
    expect((await screen.findByText(/You are signing up to Beautinique as/)).textContent).toContain(
      `${EMAIL} with Google`,
    );
    await expectNoAxeViolations();
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByText('Accept the terms and privacy notice')).toBeTruthy();
    expect(screen.getByText('Confirm that you are 18 or older')).toBeTruthy();
    expect(identity.paths()).not.toContain('POST /auth/oauth/sign-up');
    // the visible box sits over the hidden input (React Aria)
    await user.click(screen.getByText('I am 18 or older'));
    await user.click(screen.getByText(/I accept the/));
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    await screen.findByText('Your orders');
    expect(identity.sent.find((s) => s.method === 'POST')?.body).toEqual({
      consent: { terms: true, adult: true },
    });
    expect(identity.paths()).toContain('GET /iam/me');
  });

  it('sends an account with an authenticator to its code', async () => {
    const identity = fakeIdentity('customer');
    identity.on('GET /auth/oauth/sign-up', waiting);
    identity.on('POST /auth/oauth/sign-up', () =>
      json(200, { data: { next: 'totp', loginId: LOGIN_ID, nextPath: '/orders' } }),
    );
    const user = userEvent.setup();
    const { router } = renderApp(
      { '/sign-up/finish': <SocialSignUpFinish />, '/sign-in': <p>Sign-in page</p> },
      { identity, at: '/sign-up/finish' },
    );
    await screen.findByRole('button', { name: 'Create account' });
    await user.click(screen.getByText('I am 18 or older'));
    await user.click(screen.getByText(/I accept the/));
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    await screen.findByText('Sign-in page');
    expect(where()).toBe('/sign-in?next=%2Forders');
    expect(router.state.location.hash).toBe(`#totp=${LOGIN_ID}`);
  });

  it('says when the sign-up expired, with the ways back', async () => {
    const identity = fakeIdentity('customer');
    identity.on('GET /auth/oauth/sign-up', () =>
      failure(
        400,
        'OAUTH_SIGN_UP_EXPIRED',
        'This sign-up has expired. Please choose how to sign in again.',
      ),
    );
    renderApp({ '/sign-up/finish': <SocialSignUpFinish /> }, { identity, at: '/sign-up/finish' });
    expect((await screen.findByRole('alert')).textContent).toBe(
      'This sign-up has expired. Please choose how to sign in again.',
    );
    expect(screen.getByRole('link', { name: 'Sign in' }).getAttribute('href')).toBe('/sign-in');
    await expectNoAxeViolations();
  });
});

describe('sign-in methods', () => {
  it('lists the providers and takes one off after asking', async () => {
    const identity = fakeIdentity('customer', { signedIn: true });
    setHint('customer');
    let providers = ['google', 'password'];
    identity.on('GET /iam/me', () => meWith(providers));
    identity.on('DELETE /auth/sign-in-methods/google', () => {
      providers = ['password'];
      return json(200, { data: { removed: true, providers } });
    });
    const user = userEvent.setup();
    renderApp(
      { '/account/security': <SecuritySettings signInMethods /> },
      { identity, at: '/account/security' },
    );
    const card = await screen.findByRole('region', { name: 'Sign-in methods' });
    expect(within(card).getByText('Connected')).toBeTruthy();
    expect(within(card).getAllByText('Not connected')).toHaveLength(2);
    await expectNoAxeViolations();
    await user.click(within(card).getByRole('button', { name: 'Remove Google sign-in' }));
    const dialog = await screen.findByRole('alertdialog', { name: 'Remove Google sign-in?' });
    await user.click(within(dialog).getByRole('button', { name: 'Remove' }));
    expect(await screen.findAllByText('Google sign-in was removed.')).not.toHaveLength(0);
    await waitFor(() => {
      expect(within(card).getAllByText('Not connected')).toHaveLength(3);
    });
    expect(identity.paths()).toContain('DELETE /auth/sign-in-methods/google');
  });

  it('keeps the only way in, and shows the server’s refusal', async () => {
    const identity = fakeIdentity('customer', { signedIn: true });
    setHint('customer');
    identity.on('GET /iam/me', () => meWith(['github']));
    renderApp(
      { '/account/security': <SecuritySettings signInMethods /> },
      { identity, at: '/account/security' },
    );
    expect(await screen.findByText('Your only way in: set a password to remove it.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Remove/ })).toBeNull();
    // the password card offers to set one
    expect(screen.getByRole('link', { name: 'Set a password' })).toBeTruthy();
    cleanup();

    const raced = fakeIdentity('customer', { signedIn: true });
    setHint('customer');
    raced.on('GET /iam/me', () => meWith(['github', 'google']));
    raced.on('DELETE /auth/sign-in-methods/google', () =>
      failure(
        409,
        'LAST_SIGN_IN_METHOD',
        'This is the only way you sign in. Set a password first, then you can remove it.',
      ),
    );
    const user = userEvent.setup();
    renderApp(
      { '/account/security': <SecuritySettings signInMethods /> },
      { identity: raced, at: '/account/security' },
    );
    await user.click(await screen.findByRole('button', { name: 'Remove Google sign-in' }));
    const dialog = await screen.findByRole('alertdialog');
    await user.click(within(dialog).getByRole('button', { name: 'Remove' }));
    expect((await within(dialog).findByRole('alert')).textContent).toContain(
      'This is the only way you sign in.',
    );
  });

  it('is only where the app asks for it', async () => {
    const identity = fakeIdentity('customer', { signedIn: true });
    setHint('customer');
    renderApp({ '/account/security': <SecuritySettings /> }, { identity, at: '/account/security' });
    await screen.findByRole('heading', { name: 'Password' });
    expect(screen.queryByRole('heading', { name: 'Sign-in methods' })).toBeNull();
  });
});
