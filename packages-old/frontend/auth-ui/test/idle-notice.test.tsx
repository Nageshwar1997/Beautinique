import { clearToasts } from '@beautinique/frontend-components';
import { act, cleanup, fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { IdleNotice, RequireSignIn, SignInForm } from '../src/index';
import { expectNoAxeViolations } from './axe';
import { dropHint, failure, fakeIdentity, json, setHint } from './fake-identity';
import { renderApp, where } from './render';

const NOTICE = 'You were signed out after 30 minutes without activity. Please sign in again.';

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
  clearToasts();
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

const logouts = (identity: ReturnType<typeof fakeIdentity>) =>
  identity.paths().filter((path) => path === 'POST /auth/logout').length;

const serverDown = () =>
  failure(503, 'SERVICE_UNAVAILABLE', 'Beautinique is not answering right now.');

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

  it('counts opening the app in a new tab as activity in every tab (Q-009)', async () => {
    const identity = fakeIdentity('admin', { signedIn: true });
    setHint('admin');
    const first = renderApp(pages, { identity, app: 'admin', at: '/desk' });
    await within(first.container).findByText('Desk');
    // the first tab sits idle; at 29 minutes the person opens the app in a new tab and reads
    await pass(29 * MINUTE);
    const second = renderApp(pages, { identity, app: 'admin', at: '/desk' });
    await within(second.container).findByText('Desk');
    // the first tab's question closes, and nobody is signed out at 30 minutes
    await vi.waitFor(() => {
      expect(within(first.container).queryByRole('alertdialog')).toBeNull();
    });
    await pass(MINUTE + 10_000);
    for (const tab of [first, second]) {
      expect(within(tab.container).queryByText(NOTICE)).toBeNull();
      expect(within(tab.container).getByTestId('where').textContent).toBe('/desk');
    }
    expect(logouts(identity)).toBe(0);
  });

  it('says why in the tab that went idle too, with another tab open (QA-FE-010)', async () => {
    const identity = fakeIdentity('admin', { signedIn: true });
    setHint('admin');
    const idle = renderApp(pages, { identity, app: 'admin', at: '/desk' });
    await within(idle.container).findByText('Desk');
    // the other tab opened a minute later, which counts as activity in both (Q-009): both reach the
    // limit a minute after that, and the first to see it tells the other
    await pass(MINUTE);
    const other = renderApp(pages, { identity, app: 'admin', at: '/desk' });
    await within(other.container).findByText('Desk');
    // a slow sign-out: the other tab hears "timed out" long before the server answers
    let answer: (response: Response) => void = () => undefined;
    identity.on(
      'POST /auth/logout',
      () =>
        new Promise<Response>((resolve) => {
          answer = resolve;
        }),
    );
    await pass(30 * MINUTE + 10_000);
    for (const tab of [idle, other]) {
      await within(tab.container).findByText(NOTICE);
      expect(within(tab.container).getByTestId('where').textContent).toBe('/sign-in?next=%2Fdesk');
    }
    // one sign-out for both tabs
    expect(logouts(identity)).toBe(1);
    answer(json(200, { data: { signedOut: true } }));
  });

  it('signs out at 30 though the server cannot be reached, and ends the session there once it can (QA-FE-004)', async () => {
    const { identity } = await signedInAtDesk();
    identity.on('POST /auth/logout', serverDown);
    await pass(30 * MINUTE);
    await screen.findByText(NOTICE);
    await vi.waitFor(() => {
      expect(logouts(identity)).toBe(1);
    });
    expect(identity.state.signedIn).toBe(true);
    // back online: asked again at once
    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    await vi.waitFor(() => {
      expect(logouts(identity)).toBe(2);
    });
    // and every 30 s while the tab is open, until the server ends the session
    await pass(30_000);
    await vi.waitFor(() => {
      expect(logouts(identity)).toBe(3);
    });
    identity.off('POST /auth/logout');
    await pass(30_000);
    await vi.waitFor(() => {
      expect(identity.state.signedIn).toBe(false);
    });
    expect(logouts(identity)).toBe(4);
    await pass(5 * MINUTE);
    expect(logouts(identity)).toBe(4);
  });

  it('stops asking the server to end the old session once the app is signed in again (QA-FE-004)', async () => {
    const { identity } = await signedInAtDesk();
    identity.on('POST /auth/logout', serverDown);
    await pass(30 * MINUTE);
    await screen.findByText(NOTICE);
    await vi.waitFor(() => {
      expect(logouts(identity)).toBe(1);
    });
    // another tab signs in again (the person, or someone else): the retry must not end that session
    const otherTab = new BroadcastChannel('bq:admin:session');
    try {
      const reads = identity.paths().filter((path) => path === 'GET /iam/me').length;
      setHint('admin');
      otherTab.postMessage('signed-in');
      await vi.waitFor(() => {
        expect(identity.paths().filter((path) => path === 'GET /iam/me').length).toBe(reads + 1);
      });
      await pass(5 * MINUTE);
      expect(logouts(identity)).toBe(1);
    } finally {
      otherTab.close();
    }
  });

  it('gives up on the old session when the server’s own idle limit has ended it (QA-FE-004)', async () => {
    const { identity } = await signedInAtDesk();
    identity.on('POST /auth/logout', serverDown);
    await pass(30 * MINUTE);
    await screen.findByText(NOTICE);
    await pass(30 * MINUTE);
    // let the last try's answer land
    await vi.waitFor(() => {
      expect(logouts(identity)).toBeGreaterThan(50);
    });
    const tried = logouts(identity);
    await pass(10 * MINUTE);
    expect(logouts(identity)).toBe(tried);
  });

  it('keeps the person signed in, and the clock running, when "Sign out" in the question fails (QA-FE-004)', async () => {
    const { identity } = await signedInAtDesk();
    identity.on('POST /auth/logout', serverDown);
    await pass(28 * MINUTE + 10_000);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Sign out' }));
    expect(await screen.findByText('You are still signed in.')).toBeTruthy();
    expect(where()).toBe('/desk');
    expect(screen.getByRole('alertdialog')).toBeTruthy();
    // nobody does anything: the idle sign-out still comes at 30
    await pass(2 * MINUTE);
    await screen.findByText(NOTICE);
    expect(where()).toBe('/sign-in?next=%2Fdesk');
  });

  it('does nothing in an app without an idle limit', async () => {
    const { identity } = await signedInAtDesk('customer');
    await pass(120 * MINUTE);
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(refreshes(identity)).toBe(0);
    expect(screen.getByText('Desk')).toBeTruthy();
  });
});
