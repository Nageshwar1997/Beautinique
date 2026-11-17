import { cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { RedirectIfSignedIn, SignInForm } from '../src/index';
import { expectNoAxeViolations } from './axe';
import {
  dropHint,
  EMAIL,
  enrollNext,
  failure,
  fakeIdentity,
  GOOD_CODE,
  hintSet,
  json,
  LOGIN_ID,
  PASSWORD,
  totpNext,
  USER_ID,
} from './fake-identity';
import { describedBy, renderApp, where } from './render';

afterEach(() => {
  cleanup();
  dropHint('customer');
  dropHint('admin');
});

const pages = { '/sign-in': <SignInForm />, '/orders': <p>Your orders</p>, '/': <p>Home</p> };

async function typePassword(user: ReturnType<typeof userEvent.setup>, password = PASSWORD) {
  await user.type(screen.getByLabelText('Email'), EMAIL);
  await user.type(screen.getByLabelText('Password'), password);
  await user.click(screen.getByRole('button', { name: 'Sign in' }));
}

describe('SignInForm', () => {
  it('signs in with email and password and goes on to next', async () => {
    const identity = fakeIdentity('customer');
    const user = userEvent.setup();
    renderApp(pages, { identity, at: '/sign-in?next=%2Forders' });
    await expectNoAxeViolations();
    await typePassword(user);
    await screen.findByText('Your orders');
    expect(identity.sent[0]).toEqual({
      method: 'POST',
      path: '/auth/login',
      body: { email: EMAIL, password: PASSWORD },
    });
    // the session was read at once: the header knows who is signed in on the next page
    expect(identity.paths()).toContain('GET /iam/me');
    expect(hintSet('customer')).toBe(true);
  });

  it('checks the fields before asking, and shows the one answer for wrong details', async () => {
    const identity = fakeIdentity('customer');
    identity.on('POST /auth/login', () =>
      failure(401, 'INVALID_CREDENTIALS', 'The email or password is not right.'),
    );
    const user = userEvent.setup();
    renderApp(pages, { identity, at: '/sign-in' });
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText('Enter your password')).toBeTruthy();
    expect(identity.sent).toEqual([]);
    await typePassword(user, 'not it');
    expect((await screen.findByRole('alert')).textContent).toContain(
      'The email or password is not right.',
    );
    expect(where()).toBe('/sign-in');
    await expectNoAxeViolations();
  });

  it('a password found leaked after it was set asks for a new one, the email handed over (DR-002)', async () => {
    const identity = fakeIdentity('customer');
    const leaked =
      'This password appeared in a data breach. Please set a new one with an email code.';
    identity.on('POST /auth/login', () => failure(403, 'PASSWORD_RESET_REQUIRED', leaked));
    const user = userEvent.setup();
    const { router } = renderApp(
      { ...pages, '/forgot-password': <p>The code page</p> },
      { identity, at: '/sign-in?next=%2Forders' },
    );
    await typePassword(user);
    expect((await screen.findByRole('alert')).textContent).toBe(leaked);
    expect(hintSet('customer')).toBe(false);
    await expectNoAxeViolations();
    await user.click(screen.getByRole('link', { name: 'Set a new password' }));
    await screen.findByText('The code page');
    expect(where()).toBe('/forgot-password?next=%2Forders');
    expect(router.state.location.state).toEqual({ email: EMAIL });
  });

  it('keeps next on the forgot-password link', () => {
    renderApp(pages, { identity: fakeIdentity('customer'), at: '/sign-in?next=%2Forders' });
    expect(screen.getByRole('link', { name: 'Forgot password?' }).getAttribute('href')).toBe(
      '/forgot-password?next=%2Forders',
    );
  });

  it('asks the authenticator code next where the account has one; a wrong one on its field', async () => {
    const identity = fakeIdentity('customer');
    identity.on('POST /auth/login', totpNext);
    const user = userEvent.setup();
    renderApp(pages, { identity, at: '/sign-in?next=%2Forders' });
    await typePassword(user);
    const code = await screen.findByLabelText('Authenticator code');
    identity.on('POST /auth/login/:id/totp', () =>
      failure(400, 'TOTP_INVALID', 'That authenticator code is not right. You have 4 more tries.'),
    );
    await user.type(code, '000000');
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByText(/You have 4 more tries/)).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText('Authenticator code'));
    await expectNoAxeViolations();
    identity.on('POST /auth/login/:id/totp', () =>
      json(200, { data: { user: { userId: USER_ID, email: EMAIL } } }),
    );
    await user.clear(screen.getByLabelText('Authenticator code'));
    await user.type(screen.getByLabelText('Authenticator code'), '482913');
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await screen.findByText('Your orders');
    expect(identity.sent.find((s) => s.path.endsWith('/totp'))?.path).toBe(
      `/auth/login/${LOGIN_ID}/totp`,
    );
  });

  it('takes a recovery code instead, and says when few are left', async () => {
    const identity = fakeIdentity('customer');
    identity.on('POST /auth/login', totpNext);
    const user = userEvent.setup();
    renderApp(pages, { identity, at: '/sign-in' });
    await typePassword(user);
    await user.click(
      await screen.findByRole('button', { name: 'Lost your phone? Use a recovery code' }),
    );
    await user.type(screen.getByLabelText(/Recovery code/), 'abcde-fgh23');
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await screen.findByText('Home');
    expect(identity.sent.at(-2)).toMatchObject({
      path: `/auth/login/${LOGIN_ID}/recovery`,
      body: { code: 'ABCDE-FGH23' },
    });
    expect(await screen.findByText('2 recovery codes left')).toBeTruthy();
  });

  it('starts again with why, when the sign-in step ran out', async () => {
    const identity = fakeIdentity('customer');
    identity.on('POST /auth/login', totpNext);
    identity.on('POST /auth/login/:id/totp', () =>
      failure(400, 'LOGIN_EXPIRED', 'This sign-in has expired. Please sign in again.'),
    );
    const user = userEvent.setup();
    renderApp(pages, { identity, at: '/sign-in' });
    await typePassword(user);
    await user.type(await screen.findByLabelText('Authenticator code'), '482913');
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByText('This sign-in has expired. Please sign in again.')).toBeTruthy();
    expect(screen.getByLabelText('Password')).toBeTruthy();
  });

  it('moves to each step’s field, which says what it asks, and back to the email (QA-FE-008)', async () => {
    const identity = fakeIdentity('customer');
    identity.on('POST /auth/login', totpNext);
    const user = userEvent.setup();
    renderApp(pages, { identity, at: '/sign-in' });
    // a page that just opened takes no focus
    expect(document.activeElement).toBe(document.body);
    await typePassword(user);
    const code = await screen.findByLabelText('Authenticator code');
    await waitFor(() => {
      expect(document.activeElement).toBe(code);
    });
    expect(describedBy(code)).toBe(
      'Open your authenticator app and enter the 6-digit code for Beautinique.',
    );
    await user.click(screen.getByRole('button', { name: 'Lost your phone? Use a recovery code' }));
    const recovery = screen.getByLabelText(/Recovery code/);
    expect(document.activeElement).toBe(recovery);
    expect(describedBy(recovery)).toBe(
      'Enter one of the 10 recovery codes you saved when you set up the authenticator. Each code works once. | Like ABCDE-FGH23',
    );
    await user.click(screen.getByRole('button', { name: 'Use the authenticator code' }));
    expect(document.activeElement).toBe(screen.getByLabelText('Authenticator code'));
    await user.click(screen.getByRole('button', { name: 'Start again' }));
    expect(document.activeElement).toBe(screen.getByLabelText('Email'));
  });

  it('moves to the email, which says why, when the sign-in step ran out (QA-FE-008)', async () => {
    const identity = fakeIdentity('customer');
    identity.on('POST /auth/login', totpNext);
    identity.on('POST /auth/login/:id/totp', () =>
      failure(400, 'LOGIN_EXPIRED', 'This sign-in has expired. Please sign in again.'),
    );
    const user = userEvent.setup();
    renderApp(pages, { identity, at: '/sign-in' });
    await typePassword(user);
    await user.type(await screen.findByLabelText('Authenticator code'), '482913');
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await screen.findByText('This sign-in has expired. Please sign in again.');
    const email = screen.getByLabelText('Email');
    expect(document.activeElement).toBe(email);
    expect(describedBy(email)).toBe('This sign-in has expired. Please sign in again.');
  });

  it('starts with the email and the note another auth page handed over', async () => {
    const identity = fakeIdentity('customer');
    const { router } = renderApp(pages, { identity, at: '/' });
    await router.navigate('/sign-in', {
      state: { email: EMAIL, notice: 'Your password is set. Sign in with it.' },
    });
    await waitFor(() => {
      expect(screen.getByLabelText<HTMLInputElement>('Email').value).toBe(EMAIL);
    });
    expect(screen.getByText('Your password is set. Sign in with it.').getAttribute('role')).toBe(
      'status',
    );
  });

  it('starts again with the note of a new visit while it is open (signed out for being idle)', async () => {
    const identity = fakeIdentity('customer');
    identity.on('POST /auth/login', totpNext);
    const user = userEvent.setup();
    const { router } = renderApp(pages, { identity, at: '/sign-in' });
    await typePassword(user);
    await screen.findByLabelText('Authenticator code');
    await router.navigate('/sign-in?next=%2Forders', {
      state: { notice: 'You were signed out after 30 minutes without activity.' },
    });
    expect(
      await screen.findByText('You were signed out after 30 minutes without activity.'),
    ).toBeTruthy();
    expect(screen.getByLabelText('Password')).toBeTruthy();
    expect(screen.queryByLabelText('Authenticator code')).toBeNull();
  });
});

describe('SignInForm in an app that needs an authenticator', () => {
  // the auth page as the apps have it: someone signed in goes on to next
  const guarded = {
    ...pages,
    '/sign-in': (
      <RedirectIfSignedIn>
        <SignInForm />
      </RedirectIfSignedIn>
    ),
  };

  it('has an account without one set it up, and moves on only after the recovery codes', async () => {
    const identity = fakeIdentity('admin');
    identity.on('POST /auth/login', enrollNext);
    const user = userEvent.setup();
    renderApp(guarded, { identity, app: 'admin', at: '/sign-in?next=%2Forders' });
    await typePassword(user);
    expect(
      await screen.findByRole('img', {
        name: 'QR code to add Beautinique to your authenticator app',
      }),
    ).toBeTruthy();
    expect(screen.getByText('JBSW Y3DP EHPK 3PXP JBSW Y3DP EHPK 3PXP')).toBeTruthy();
    expect(screen.getByText('Step 1 of 3')).toBeTruthy();
    expect(identity.sent.at(-1)?.path).toBe(`/auth/login/${LOGIN_ID}/totp/enroll`);
    await expectNoAxeViolations();

    await user.click(screen.getByRole('button', { name: 'Next' }));
    identity.on('POST /auth/login/:id/totp/confirm', () =>
      failure(400, 'TOTP_INVALID', 'That authenticator code is not right.'),
    );
    await user.type(screen.getByLabelText('Authenticator code'), '000000');
    await user.click(screen.getByRole('button', { name: 'Turn on' }));
    expect(await screen.findByText('That authenticator code is not right.')).toBeTruthy();
    await expectNoAxeViolations();
    identity.off('POST /auth/login/:id/totp/confirm');
    await user.clear(screen.getByLabelText('Authenticator code'));
    await user.type(screen.getByLabelText('Authenticator code'), GOOD_CODE);
    await user.click(screen.getByRole('button', { name: 'Turn on' }));

    // signed in by now (the cookies), but the page waits for the codes to be saved
    expect(await screen.findByRole('list', { name: 'Recovery codes' })).toBeTruthy();
    expect(identity.sent.at(-1)).toEqual({
      method: 'POST',
      path: `/auth/login/${LOGIN_ID}/totp/confirm`,
      body: { code: GOOD_CODE },
    });
    expect(hintSet('admin')).toBe(true);
    expect(where()).toBe('/sign-in?next=%2Forders');
    expect(identity.paths()).not.toContain('GET /iam/me');
    await expectNoAxeViolations();
    await user.click(screen.getByRole('checkbox', { name: 'I’ve saved my recovery codes' }));
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await screen.findByText('Your orders');
    expect(identity.paths()).toContain('GET /iam/me');
  });

  it('moves through the set-up: a step’s heading where it has no field, else its field (QA-FE-008)', async () => {
    const identity = fakeIdentity('admin');
    identity.on('POST /auth/login', enrollNext);
    const user = userEvent.setup();
    renderApp(guarded, { identity, app: 'admin', at: '/sign-in' });
    await typePassword(user);
    const scan = await screen.findByRole('heading', {
      name: 'Add Beautinique to your authenticator app',
    });
    await waitFor(() => {
      expect(document.activeElement).toBe(scan);
    });
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(document.activeElement).toBe(screen.getByLabelText('Authenticator code'));
    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(document.activeElement).toBe(
      screen.getByRole('heading', { name: 'Add Beautinique to your authenticator app' }),
    );
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.type(screen.getByLabelText('Authenticator code'), GOOD_CODE);
    await user.click(screen.getByRole('button', { name: 'Turn on' }));
    const codes = await screen.findByRole('heading', { name: 'Save your recovery codes' });
    await waitFor(() => {
      expect(document.activeElement).toBe(codes);
    });
  });

  it('goes back to the password, with why, when the set-up ran out', async () => {
    const identity = fakeIdentity('admin');
    identity.on('POST /auth/login', enrollNext);
    identity.on('POST /auth/login/:id/totp/enroll', () =>
      failure(400, 'LOGIN_EXPIRED', 'This sign-in has expired. Please sign in again.'),
    );
    const user = userEvent.setup();
    renderApp(guarded, { identity, app: 'admin', at: '/sign-in' });
    await typePassword(user);
    expect(await screen.findByText('This sign-in has expired. Please sign in again.')).toBeTruthy();
    expect(screen.getByLabelText('Password')).toBeTruthy();
  });

  it('says what went wrong when the key does not come, and tries again', async () => {
    const identity = fakeIdentity('admin');
    identity.on('POST /auth/login', enrollNext);
    identity.on('POST /auth/login/:id/totp/enroll', () =>
      failure(
        503,
        'SERVICE_UNAVAILABLE',
        'Too many sign-ins right now. Please try again in a moment.',
      ),
    );
    const user = userEvent.setup();
    renderApp(guarded, { identity, app: 'admin', at: '/sign-in' });
    await typePassword(user);
    expect((await screen.findByRole('alert')).textContent).toContain('Too many sign-ins right now');
    identity.off('POST /auth/login/:id/totp/enroll');
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Step 1 of 3')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Start again' }));
    expect(screen.getByLabelText('Password')).toBeTruthy();
  });

  it('says so when the answer has no sign-in to go on with', async () => {
    const identity = fakeIdentity('admin');
    identity.on('POST /auth/login', () => json(200, { data: { next: 'totp-enroll' } }));
    const user = userEvent.setup();
    renderApp(guarded, { identity, app: 'admin', at: '/sign-in' });
    await typePassword(user);
    expect((await screen.findByRole('alert')).textContent).toContain(
      'Something went wrong on our side',
    );
  });
});
