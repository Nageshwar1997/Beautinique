import { cleanup, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { createRoutesStub } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import { LEGAL_VERSION } from '../app/components/LegalPage';
import { Providers } from '../app/providers';
import ForgotPassword, { meta as forgotMeta } from '../app/routes/forgot-password';
import Invitation from '../app/routes/invitation';
import Privacy from '../app/routes/privacy';
import SignIn, { meta as signInMeta } from '../app/routes/sign-in';
import SignUp, { meta as signUpMeta } from '../app/routes/sign-up';
import SignUpFinish, { meta as finishMeta } from '../app/routes/sign-up-finish';
import Terms from '../app/routes/terms';

afterEach(cleanup);

/** The page at `at` (its path first), inside the app's providers, as the router renders it. */
function page(Component: React.ComponentType, at: string) {
  const path = at.split('?')[0] ?? at;
  const Stub = createRoutesStub([{ path, Component }]);
  return render(
    <Providers>
      <Stub initialEntries={[at]} />
    </Providers>,
  );
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

describe('the auth pages', () => {
  it('sign-in: one h1, the form, and sign-up keeping next', async () => {
    const { container } = page(SignIn, '/sign-in?next=%2Fcredits');
    expect(screen.getByRole('heading', { level: 1, name: 'Sign in' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Create an account' }).getAttribute('href')).toBe(
      '/sign-up?next=%2Fcredits',
    );
    expect(screen.getByRole('link', { name: 'Forgot password?' }).getAttribute('href')).toBe(
      '/forgot-password?next=%2Fcredits',
    );
    expect(await violations(container)).toEqual([]);
  });

  it('sign-up: the terms, privacy and 18+ consent, and sign-in keeping next', async () => {
    const { container } = page(SignUp, '/sign-up?next=%2Fcredits');
    expect(screen.getByRole('heading', { level: 1, name: 'Create an account' })).toBeTruthy();
    expect(screen.getByRole('checkbox', { name: 'I am 18 or older' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'privacy notice' }).getAttribute('href')).toBe(
      '/privacy',
    );
    expect(screen.getByRole('link', { name: 'Sign in' }).getAttribute('href')).toBe(
      '/sign-in?next=%2Fcredits',
    );
    expect(await violations(container)).toEqual([]);
  });

  it('forgot password and invitation: their forms', async () => {
    const forgot = page(ForgotPassword, '/forgot-password');
    expect(screen.getByRole('heading', { level: 1, name: 'Set a new password' })).toBeTruthy();
    expect(screen.queryByRole('checkbox')).toBeNull();
    expect(await violations(forgot.container)).toEqual([]);
    cleanup();
    const invited = page(Invitation, '/invitation');
    expect(screen.getByRole('heading', { level: 1, name: 'Accept an invitation' })).toBeTruthy();
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
    expect(await violations(invited.container)).toEqual([]);
  });

  it('finishing a sign-up with a provider: one h1, and the way back to email', async () => {
    const { container } = page(SignUpFinish, '/sign-up/finish');
    expect(screen.getByRole('heading', { level: 1, name: 'Finish signing up' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Create an account' }).getAttribute('href')).toBe(
      '/sign-up',
    );
    expect(await violations(container)).toEqual([]);
  });

  it('keep themselves out of search results', () => {
    const noindex = { name: 'robots', content: 'noindex' };
    expect(signInMeta({} as Parameters<typeof signInMeta>[0])).toContainEqual(noindex);
    expect(signUpMeta({} as Parameters<typeof signUpMeta>[0])).toContainEqual(noindex);
    expect(forgotMeta({} as Parameters<typeof forgotMeta>[0])).toContainEqual(noindex);
    expect(finishMeta({} as Parameters<typeof finishMeta>[0])).toContainEqual(noindex);
  });
});

describe('the dummy legal pages', () => {
  it('say they are dummies, with the version the consent records', async () => {
    for (const [Component, title] of [
      [Terms, 'Terms of use'],
      [Privacy, 'Privacy notice'],
    ] as const) {
      const { container } = page(Component, '/legal');
      expect(screen.getByRole('heading', { level: 1, name: title })).toBeTruthy();
      expect(container.textContent).toContain('DUMMY');
      expect(container.textContent).toContain(`Version ${LEGAL_VERSION}`);
      expect(await violations(container)).toEqual([]);
      cleanup();
    }
    expect(LEGAL_VERSION).toBe('dummy-1');
  });
});
