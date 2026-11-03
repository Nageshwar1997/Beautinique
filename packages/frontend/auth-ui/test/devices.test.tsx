import { cleanup, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { ACCOUNT_PATHS, AccountMenu, MyDevices, RequireSignIn } from '../src/index';
import { expectNoAxeViolations } from './axe';
import {
  dropHint,
  EMAIL,
  failure,
  fakeIdentity,
  hintSet,
  json,
  OTHER_SESSION_ID,
  setHint,
} from './fake-identity';
import { renderApp, where } from './render';

afterEach(() => {
  cleanup();
  dropHint('customer');
});

const pages = {
  [ACCOUNT_PATHS.devices]: (
    <RequireSignIn>
      <MyDevices />
    </RequireSignIn>
  ),
  '/sign-in': <p>Sign-in page</p>,
};

function signedIn() {
  setHint('customer');
  return fakeIdentity('customer', { signedIn: true });
}

describe('MyDevices', () => {
  it('lists the devices in every app, this one first, with India dates', async () => {
    const identity = signedIn();
    renderApp(pages, { identity, at: ACCOUNT_PATHS.devices });
    const items = within(await screen.findByRole('list', { name: 'Devices' })).getAllByRole(
      'listitem',
    );
    expect(items).toHaveLength(2);
    expect(items[0]?.textContent).toContain('Chrome on Windows');
    expect(items[0]?.textContent).toContain('This device');
    expect(items[0]?.textContent).toContain('Last active 3 Nov 2026, 11:30 am');
    expect(items[1]?.textContent).toContain('Beautinique Seller · IP 198.51.100.20');
    await expectNoAxeViolations();
  });

  it('signs another device out, and reads the list again', async () => {
    const identity = signedIn();
    const user = userEvent.setup();
    renderApp(pages, { identity, at: ACCOUNT_PATHS.devices });
    await user.click(
      await screen.findByRole('button', { name: 'Sign out Safari on iPhone, Beautinique Seller' }),
    );
    expect(await screen.findByText('Safari on iPhone is signed out.')).toBeTruthy();
    expect(identity.sent.find((sent) => sent.method === 'DELETE')?.path).toBe(
      `/auth/sessions/${OTHER_SESSION_ID}`,
    );
    await waitFor(() => {
      expect(identity.paths().filter((path) => path === 'GET /auth/sessions')).toHaveLength(2);
    });
  });

  it('signs every other device out after asking', async () => {
    const identity = signedIn();
    const user = userEvent.setup();
    renderApp(pages, { identity, at: ACCOUNT_PATHS.devices });
    await user.click(await screen.findByRole('button', { name: 'Sign out all other devices' }));
    const ask = screen.getByRole('alertdialog', { name: 'Sign out every other device?' });
    expect(ask.textContent).toContain('1 device will need to sign in again.');
    await expectNoAxeViolations();
    await user.click(within(ask).getByRole('button', { name: 'Sign out others' }));
    expect(await screen.findByText('Signed out of 1 device.')).toBeTruthy();
    expect(identity.paths()).toContain('POST /auth/sessions/end-others');
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('signs this device out like the account menu, then sign-in', async () => {
    const identity = signedIn();
    const user = userEvent.setup();
    renderApp(pages, { identity, at: ACCOUNT_PATHS.devices });
    await user.click(
      await screen.findByRole('button', {
        name: 'Sign out Chrome on Windows, Beautinique (this device)',
      }),
    );
    expect(await screen.findByText('Sign-in page')).toBeTruthy();
    expect(identity.paths()).toContain('POST /auth/logout');
    expect(hintSet('customer')).toBe(false);
    expect(where()).toBe('/sign-in?next=%2Faccount%2Fdevices');
  });

  it('says when this is the only device', async () => {
    const identity = signedIn();
    identity.on('GET /auth/sessions', () =>
      json(200, {
        data: {
          sessions: [
            {
              sessionId: '01920000-0000-7000-8000-000000000002',
              app: 'customer',
              device: '',
              ip: '203.0.113.7',
              createdAt: '2026-11-01T04:30:00.000Z',
              lastSeenAt: '2026-11-03T06:00:00.000Z',
              expiresAt: '2026-12-01T04:30:00.000Z',
              current: true,
            },
          ],
        },
      }),
    );
    renderApp(pages, { identity, at: ACCOUNT_PATHS.devices });
    expect(await screen.findByText('This is the only device signed in to your account.'));
    expect(screen.getByText('Unknown device')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Sign out all other devices' })).toBeNull();
  });

  it('offers to try again when the list did not load', async () => {
    const identity = signedIn();
    identity.on('GET /auth/sessions', () =>
      failure(429, 'RATE_LIMITED', 'Please try again in a little while.'),
    );
    const user = userEvent.setup();
    renderApp(pages, { identity, at: ACCOUNT_PATHS.devices });
    expect((await screen.findByRole('alert')).textContent).toBe(
      'Please try again in a little while.',
    );
    identity.off('GET /auth/sessions');
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Chrome on Windows')).toBeTruthy();
  });
});

describe('AccountMenu links', () => {
  it('go through the app’s router (no page load)', async () => {
    const identity = signedIn();
    const user = userEvent.setup();
    renderApp(
      {
        '/': (
          <AccountMenu
            links={[
              { href: ACCOUNT_PATHS.security, label: 'Security' },
              { href: ACCOUNT_PATHS.devices, label: 'My Devices' },
            ]}
          />
        ),
        [ACCOUNT_PATHS.devices]: <p>Devices page</p>,
      },
      { identity },
    );
    await user.click(await screen.findByRole('button', { name: `Account (${EMAIL})` }));
    await user.click(screen.getByRole('menuitem', { name: 'My Devices' }));
    expect(await screen.findByText('Devices page')).toBeTruthy();
    expect(where()).toBe(ACCOUNT_PATHS.devices);
  });
});
