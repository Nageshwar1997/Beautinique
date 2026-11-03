import { act, cleanup, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { IdleNotice, RequireSignIn, SignInForm } from '../src/index';
import { expectNoAxeViolations } from './axe';
import { dropHint, fakeIdentity, setHint } from './fake-identity';
import { renderApp, where } from './render';

const MINUTE = 60_000;
// 10:00 am in India
const START = new Date('2026-11-03T04:30:00.000Z');

beforeEach(() => {
  // the clock and the page's interval only: the testing library's own waits stay real
  vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] });
  vi.setSystemTime(START);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  dropHint('admin');
  dropHint('customer');
});

const pages = {
  '/desk': (
    <>
      <RequireSignIn>
        <p>Desk</p>
      </RequireSignIn>
      <IdleNotice />
    </>
  ),
  '/sign-in': <SignInForm />,
};

/** Time passes on the page's clock, `ms` of it. */
const pass = async (ms: number) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
};

const refreshes = (identity: ReturnType<typeof fakeIdentity>) =>
  identity.paths().filter((path) => path === 'POST /auth/refresh').length;

async function signedInAtDesk(app: 'admin' | 'customer' = 'admin') {
  const identity = fakeIdentity(app, { signedIn: true });
  setHint(app);
  const view = renderApp(pages, { identity, app, at: '/desk' });
  await screen.findByText('Desk');
  return { identity, ...view };
}

describe('IdleNotice', () => {
  it('asks at 28 idle minutes, stays on "Stay signed in", and signs out at 30 with why', async () => {
    const { identity } = await signedInAtDesk();
    await pass(28 * MINUTE - 10_000);
    expect(screen.queryByRole('alertdialog')).toBeNull();
    // the session was renewed once on the way (the server ends it 30 minutes after a refresh)
    expect(refreshes(identity)).toBe(1);
    await pass(10_000);
    const dialog = await screen.findByRole('alertdialog', { name: 'Are you still there?' });
    expect(dialog.textContent).toContain(
      'For your security, you will be signed out at 10:30 am if there is no activity.',
    );
    await expectNoAxeViolations();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Stay signed in' }));
    await vi.waitFor(() => {
      expect(screen.queryByRole('alertdialog')).toBeNull();
    });
    expect(refreshes(identity)).toBe(2);

    // nobody does anything now: the question again, then the sign-out
    await pass(30 * MINUTE);
    await screen.findByText(
      'You were signed out after 30 minutes without activity. Please sign in again.',
    );
    expect(where()).toBe('/sign-in?next=%2Fdesk');
    expect(identity.paths()).toContain('POST /auth/logout');
    expect(identity.state.signedIn).toBe(false);
  });

  it('keeps a session in use: activity moves the question, the session is renewed before its end', async () => {
    const { identity } = await signedInAtDesk();
    await pass(20 * MINUTE);
    fireEvent.keyDown(window, { key: 'a' });
    await pass(21 * MINUTE);
    // 41 minutes in: renewed at 15 and at 40, no question (it comes 28 minutes after the key)
    expect(refreshes(identity)).toBe(2);
    expect(screen.queryByRole('alertdialog')).toBeNull();
    await pass(7 * MINUTE + 10_000);
    expect(await screen.findByRole('alertdialog')).toBeTruthy();
  });

  it('signs out from the question too, without the idle note', async () => {
    const { identity } = await signedInAtDesk();
    await pass(28 * MINUTE + 10_000);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Sign out' }));
    await vi.waitFor(() => {
      expect(where()).toBe('/sign-in?next=%2Fdesk');
    });
    expect(identity.paths()).toContain('POST /auth/logout');
    expect(screen.getAllByText('You are signed out.').length).toBeGreaterThan(0);
    expect(screen.queryByText(/without activity/)).toBeNull();
  });

  it('hears the other tabs: their activity closes the question, their idle sign-out signs out here', async () => {
    const { identity } = await signedInAtDesk();
    const otherTab = new BroadcastChannel('bq:admin:idle');
    try {
      await pass(28 * MINUTE + 10_000);
      expect(await screen.findByRole('alertdialog')).toBeTruthy();
      otherTab.postMessage({ type: 'active', at: Date.now() });
      await vi.waitFor(() => {
        expect(screen.queryByRole('alertdialog')).toBeNull();
      });

      otherTab.postMessage({ type: 'timed-out' });
      await screen.findByText(/signed out after 30 minutes without activity/);
      // the other tab asked the server already
      expect(identity.paths()).not.toContain('POST /auth/logout');
    } finally {
      otherTab.close();
    }
  });

  it('does nothing in an app without an idle limit', async () => {
    const { identity } = await signedInAtDesk('customer');
    await pass(120 * MINUTE);
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(refreshes(identity)).toBe(0);
    expect(screen.getByText('Desk')).toBeTruthy();
  });
});
