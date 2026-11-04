import { ACCOUNT_PATHS } from '@beautinique/frontend-auth-ui';
import { cleanup, render, screen } from '@testing-library/react';
import { createRoutesStub, useLocation } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';

import { ACCOUNT_NAV } from '../app/nav';
import { Providers } from '../app/providers';
import routes from '../app/routes';
import Account from '../app/routes/account';
import AccountAuthenticator, {
  meta as authenticatorMeta,
} from '../app/routes/account-authenticator';
import AccountDevices, { meta as devicesMeta } from '../app/routes/account-devices';
import AccountIndex from '../app/routes/account-index';
import AccountSecurity, { meta as securityMeta } from '../app/routes/account-security';

afterEach(cleanup);

function SignInPage() {
  const location = useLocation();
  return <p>{`Sign-in page ${location.pathname}${location.search}`}</p>;
}

/** The account pages as the app's routes nest them, for someone signed out (no hint cookie). */
function account(at: string) {
  const Stub = createRoutesStub([
    {
      path: '/account',
      Component: Account,
      children: [
        { index: true, Component: AccountIndex },
        { path: 'security', Component: AccountSecurity },
        { path: 'security/authenticator', Component: AccountAuthenticator },
        { path: 'devices', Component: AccountDevices },
      ],
    },
    { path: '/sign-in', Component: SignInPage },
  ]);
  return render(
    <Providers>
      <Stub initialEntries={[at]} />
    </Providers>,
  );
}

describe('the account pages', () => {
  it.each([ACCOUNT_PATHS.security, ACCOUNT_PATHS.authenticator, ACCOUNT_PATHS.devices])(
    '%s sends someone signed out to sign-in, and back here after',
    async (path) => {
      account(path);
      expect(
        await screen.findByText(`Sign-in page /sign-in?next=${encodeURIComponent(path)}`),
      ).toBeTruthy();
    },
  );

  it('/account (the security page, once signed in) asks to sign in first', async () => {
    account('/account');
    expect(await screen.findByText('Sign-in page /sign-in?next=%2Faccount')).toBeTruthy();
  });

  it('are in the route table, and never in a search engine', () => {
    const paths = JSON.stringify(routes);
    for (const file of ['account-security', 'account-authenticator', 'account-devices']) {
      expect(paths).toContain(`routes/${file}.tsx`);
    }
    for (const meta of [securityMeta, authenticatorMeta, devicesMeta]) {
      expect(meta({} as never)).toContainEqual({ name: 'robots', content: 'noindex' });
    }
  });

  it('are the account menu and the account nav', () => {
    expect(ACCOUNT_NAV).toEqual([
      { label: 'Security', to: '/account/security' },
      { label: 'My Devices', to: '/account/devices' },
    ]);
  });
});
