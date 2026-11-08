import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import {
  ForgotPasswordForm,
  InvitationForm,
  RedirectIfSignedIn,
  SignInForm,
  SignUpForm,
  useSession,
} from '../src/index';
import { expectNoAxeViolations } from './axe';
import {
  CHALLENGE_ID,
  challengeNow,
  dropHint,
  EMAIL,
  failure,
  fakeIdentity,
  hintSet,
  json,
  PASSWORD,
  passwordKept,
  setHint,
  USER_ID,
} from './fake-identity';
import { describedBy, renderApp, where } from './render';

afterEach(() => {
  cleanup();
  dropHint('customer');
  dropHint('seller');
});

type User = ReturnType<typeof userEvent.setup>;

const pages = {
  '/sign-up': <SignUpForm />,
  '/forgot-password': <ForgotPasswordForm />,
  '/invitation': <InvitationForm />,
  '/sign-in': <SignInForm />,
  '/orders': <p>Your orders</p>,
  '/': <p>Home</p>,
};

async function code(user: User, password = PASSWORD, label = 'Create account') {
  await user.type(await screen.findByLabelText('Code from the email'), '482913');
  await user.type(screen.getByLabelText('Password'), password);
  await user.click(screen.getByRole('button', { name: label }));
}

describe('SignUpForm', () => {
  it('asks the terms and 18 or older in the customer app, then makes the account and goes on', async () => {
    const identity = fakeIdentity('customer');
    const user = userEvent.setup();
    renderApp(pages, { identity, at: '/sign-up?next=%2Forders' });
    await user.type(screen.getByLabelText('Email'), EMAIL);
    await user.click(screen.getByRole('button', { name: 'Send code' }));
    expect(await screen.findByText('Accept the terms and privacy notice')).toBeTruthy();
    expect(screen.getByText('Confirm that you are 18 or older')).toBeTruthy();
    expect(identity.sent).toEqual([]);
    await expectNoAxeViolations();
    // the legal pages open beside the form, which keeps what was typed
    const terms = screen.getByRole('link', { name: 'terms of use' });
    expect([terms.getAttribute('href'), terms.getAttribute('target')]).toEqual([
      '/terms',
      '_blank',
    ]);
    // and a click on them opens them, not the box (a browser's click: see components' Checkbox test)
    for (const name of ['terms of use', 'privacy notice']) {
      const link = screen.getByRole('link', { name });
      fireEvent.pointerDown(link, { pointerType: 'mouse', pointerId: 1, button: 0 });
      fireEvent.pointerUp(link, { pointerType: 'mouse', pointerId: 1, button: 0 });
      expect(fireEvent.click(link)).toBe(true);
    }
    expect(screen.getByRole('checkbox', { name: /I accept the/ })).toHaveProperty('checked', false);
    await user.click(screen.getByRole('checkbox', { name: /I accept the/ }));
    await user.click(screen.getByRole('checkbox', { name: 'I am 18 or older' }));
    await user.click(screen.getByRole('button', { name: 'Send code' }));
    expect(await screen.findByText(EMAIL)).toBeTruthy();
    expect(identity.sent[0]).toEqual({
      method: 'POST',
      path: '/auth/sign-up/code',
      body: { email: EMAIL, consent: { terms: true, adult: true } },
    });
    await expectNoAxeViolations();
    await code(user);
    await screen.findByText('Your orders');
    expect(identity.sent.find((s) => s.path.endsWith('/verify'))).toEqual({
      method: 'POST',
      path: `/auth/otp/${CHALLENGE_ID}/verify`,
      body: { code: '482913', password: PASSWORD },
    });
    expect(identity.paths()).toContain('GET /iam/me');
  });

  it('asks only the terms in the seller app', async () => {
    const identity = fakeIdentity('seller');
    const user = userEvent.setup();
    renderApp(pages, { identity, app: 'seller', at: '/sign-up' });
    expect(screen.queryByRole('checkbox', { name: 'I am 18 or older' })).toBeNull();
    await user.type(screen.getByLabelText('Email'), EMAIL);
    await user.click(screen.getByRole('checkbox', { name: /I accept the/ }));
    await user.click(screen.getByRole('button', { name: 'Send code' }));
    await screen.findByLabelText('Code from the email');
    expect(identity.sent[0]?.body).toEqual({ email: EMAIL, consent: { terms: true } });
  });

  it('puts a wrong code and a leaked password on their fields', async () => {
    const identity = fakeIdentity('seller');
    const user = userEvent.setup();
    renderApp(pages, { identity, app: 'seller', at: '/sign-up' });
    await user.type(screen.getByLabelText('Email'), EMAIL);
    await user.click(screen.getByRole('checkbox', { name: /I accept the/ }));
    await user.click(screen.getByRole('button', { name: 'Send code' }));
    identity.on('POST /auth/otp/:id/verify', () =>
      failure(400, 'OTP_INVALID', 'That code is not right. You have 4 more tries.'),
    );
    await code(user);
    expect(await screen.findByText('That code is not right. You have 4 more tries.')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText('Code from the email'));
    identity.on('POST /auth/otp/:id/verify', () =>
      failure(400, 'PASSWORD_BREACHED', 'This password has appeared in a data breach.', [
        { path: ['password'], message: 'Choose a password that has not been leaked' },
      ]),
    );
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByText('Choose a password that has not been leaked')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText('Password'));
  });

  it('sends an email that has an account to sign-in, filled in, with why', async () => {
    const identity = fakeIdentity('seller');
    identity.on('POST /auth/otp/:id/verify', passwordKept);
    const user = userEvent.setup();
    renderApp(pages, { identity, app: 'seller', at: '/sign-up?next=%2Forders' });
    await user.type(screen.getByLabelText('Email'), EMAIL);
    await user.click(screen.getByRole('checkbox', { name: /I accept the/ }));
    await user.click(screen.getByRole('button', { name: 'Send code' }));
    await code(user);
    expect(
      await screen.findByText(
        'You already have an account with this email. Sign in with your password.',
      ),
    ).toBeTruthy();
    expect(where()).toBe('/sign-in?next=%2Forders');
    // in the page's state, never in the URL
    expect(where()).not.toContain('asha');
    expect(screen.getByLabelText<HTMLInputElement>('Email').value).toBe(EMAIL);
  });

  it('asks a new code only after the wait, and goes back to fix the email', async () => {
    const identity = fakeIdentity('seller');
    const user = userEvent.setup();
    renderApp(pages, { identity, app: 'seller', at: '/sign-up' });
    await user.type(screen.getByLabelText('Email'), EMAIL);
    await user.click(screen.getByRole('checkbox', { name: /I accept the/ }));
    await user.click(screen.getByRole('button', { name: 'Send code' }));
    const later = await screen.findByRole('button', { name: /Send a new code in \d+ s/ });
    expect((later as HTMLButtonElement).disabled).toBe(true);
    await user.click(screen.getByRole('button', { name: 'Use another email' }));
    expect(screen.getByLabelText<HTMLInputElement>('Email').value).toBe(EMAIL);
    // this time the code may be asked again at once
    identity.on('POST /auth/sign-up/code', challengeNow);
    await user.click(screen.getByRole('checkbox', { name: /I accept the/ }));
    await user.click(screen.getByRole('button', { name: 'Send code' }));
    await user.click(await screen.findByRole('button', { name: 'Send a new code' }));
    expect(await screen.findByText(`We sent a new code to ${EMAIL}.`)).toBeTruthy();
    expect(identity.paths().at(-1)).toBe(`POST /auth/otp/${CHALLENGE_ID}/resend`);
  });

  it('moves to the code, which says where it went, and back to the email (QA-FE-008)', async () => {
    const identity = fakeIdentity('seller');
    const user = userEvent.setup();
    renderApp(pages, { identity, app: 'seller', at: '/sign-up' });
    // a page that just opened takes no focus
    expect(document.activeElement).toBe(document.body);
    await user.type(screen.getByLabelText('Email'), EMAIL);
    await user.click(screen.getByRole('checkbox', { name: /I accept the/ }));
    await user.click(screen.getByRole('button', { name: 'Send code' }));
    const code = await screen.findByLabelText('Code from the email');
    await waitFor(() => {
      expect(document.activeElement).toBe(code);
    });
    // heard as the field gets focus: the new step and that the code was sent
    expect(describedBy(code)).toMatch(
      new RegExp(`^We sent a 6-digit code to ${EMAIL}\\. It works`),
    );
    await user.click(screen.getByRole('button', { name: 'Use another email' }));
    expect(document.activeElement).toBe(screen.getByLabelText('Email'));
  });
});

describe('ForgotPasswordForm', () => {
  it('asks no consent, sets the new password and sends to sign-in with why', async () => {
    const identity = fakeIdentity('customer');
    identity.on('POST /auth/otp/:id/verify', () =>
      json(200, {
        data: { userId: USER_ID, email: EMAIL, outcome: 'password-set', signedIn: false },
      }),
    );
    const user = userEvent.setup();
    renderApp(pages, { identity, at: '/forgot-password?next=%2Forders' });
    expect(screen.queryByRole('checkbox')).toBeNull();
    await user.type(screen.getByLabelText('Email'), EMAIL);
    await user.click(screen.getByRole('button', { name: 'Send code' }));
    await code(user, PASSWORD, 'Set password');
    expect(
      await screen.findByText(
        'Your password is set, and every device was signed out. Sign in with your new password.',
      ),
    ).toBeTruthy();
    expect(identity.sent[0]).toEqual({
      method: 'POST',
      path: '/auth/password/code',
      body: { email: EMAIL },
    });
    expect(where()).toBe('/sign-in?next=%2Forders');
    await expectNoAxeViolations();
  });

  it('forgets a signed-in session here too: a new password ended every one', async () => {
    setHint('customer');
    const identity = fakeIdentity('customer', { signedIn: true });
    identity.on('POST /auth/otp/:id/verify', () => {
      // identity ended every session of the account, this browser's too
      identity.state.signedIn = false;
      return json(200, {
        data: { userId: USER_ID, email: EMAIL, outcome: 'password-set', signedIn: false },
      });
    });
    const user = userEvent.setup();
    renderApp(
      { ...pages, '/sign-in': <SignInFormWhenSignedOut />, '/': <HomeWithStatus /> },
      { identity, at: '/forgot-password' },
    );
    await user.type(screen.getByLabelText('Email'), EMAIL);
    await user.click(screen.getByRole('button', { name: 'Send code' }));
    await code(user, PASSWORD, 'Set password');
    // not sent on as someone signed in: the sign-in form, with why
    expect(await screen.findByText(/every device was signed out/)).toBeTruthy();
    expect(where()).toBe('/sign-in');
    expect(hintSet('customer')).toBe(false);
    // and signing in with the new password makes it signed in again
    await user.type(screen.getByLabelText('Password'), PASSWORD);
    await user.click(screen.getByRole('button', { name: 'Sign in' }));
    await screen.findByText('Home');
    await waitFor(() => {
      expect(screen.getByTestId('status').textContent).toBe('signed-in');
    });
  });

  it('checks a new password: 12 characters at least', async () => {
    const identity = fakeIdentity('customer');
    const user = userEvent.setup();
    renderApp(pages, { identity, at: '/forgot-password' });
    await user.type(screen.getByLabelText('Email'), EMAIL);
    await user.click(screen.getByRole('button', { name: 'Send code' }));
    await code(user, 'too short', 'Set password');
    await waitFor(() => {
      expect(screen.getByLabelText('Password').getAttribute('aria-invalid')).toBe('true');
    });
    expect(identity.paths()).not.toContain(`POST /auth/otp/${CHALLENGE_ID}/verify`);
  });
});

describe('InvitationForm', () => {
  it('asks the consent in a sign-up app, accepts, and sends to sign-in', async () => {
    const identity = fakeIdentity('customer');
    identity.on('POST /auth/otp/:id/verify', () =>
      json(200, {
        data: { userId: USER_ID, email: EMAIL, outcome: 'invite-accepted', signedIn: false },
      }),
    );
    const user = userEvent.setup();
    renderApp(pages, { identity, at: '/invitation' });
    await user.type(screen.getByLabelText(/Email/), EMAIL);
    await user.click(screen.getByRole('checkbox', { name: /I accept the/ }));
    await user.click(screen.getByRole('checkbox', { name: 'I am 18 or older' }));
    await user.click(screen.getByRole('button', { name: 'Send code' }));
    await code(user, PASSWORD, 'Accept invitation');
    expect(await screen.findByText('Invitation accepted. Sign in to start.')).toBeTruthy();
    expect(identity.sent[0]).toEqual({
      method: 'POST',
      path: '/auth/invitations/code',
      body: { email: EMAIL, consent: { terms: true, adult: true } },
    });
  });

  it('asks no consent where nobody signs up (an internal app)', async () => {
    const identity = fakeIdentity('admin');
    const user = userEvent.setup();
    renderApp(pages, { identity, app: 'admin', at: '/invitation' });
    expect(screen.queryByRole('checkbox')).toBeNull();
    await user.type(screen.getByLabelText(/Email/), EMAIL);
    await user.click(screen.getByRole('button', { name: 'Send code' }));
    await screen.findByLabelText('Code from the email');
    expect(identity.sent[0]?.body).toEqual({ email: EMAIL });
  });
});

/** The sign-in page as the apps have it: someone still signed in would be sent on. */
function SignInFormWhenSignedOut() {
  return (
    <RedirectIfSignedIn>
      <SignInForm />
    </RedirectIfSignedIn>
  );
}

/** The home page with what the session says, for the tests that come back to it. */
function HomeWithStatus() {
  const { state } = useSession();
  return (
    <>
      <p>Home</p>
      <p data-testid="status">{state.status}</p>
    </>
  );
}
