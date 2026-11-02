import { cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { SignInForm } from '../src/index';
import { expectNoAxeViolations } from './axe';
import {
  dropHint,
  EMAIL,
  failure,
  fakeIdentity,
  hintSet,
  json,
  LOGIN_ID,
  PASSWORD,
  totpNext,
} from './fake-identity';
import { renderApp, where } from './render';

afterEach(() => {
  cleanup();
  dropHint('customer');
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
      json(200, { data: { user: { userId: LOGIN_ID, email: EMAIL } } }),
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
});
