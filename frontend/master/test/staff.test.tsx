import { ApiProvider, createApiClient, createQueryClient } from '@beautinique/frontend-api-client';
import { SessionProvider, StepUpProvider } from '@beautinique/frontend-auth-ui';
import { Toaster } from '@beautinique/frontend-components';
import { cleanup, configure, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axe from 'axe-core';
import { createMemoryRouter, type RouteObject, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Frame } from '../src/root';
import { routes } from '../src/routes';
import { BASE_URL, fakeApi, type Who } from './fake-api';

// a laptop's screen: the lists are tables (jsdom has no matchMedia; the data-table package tests
// the phone's cards)
beforeEach(() => {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('min-width'),
    media: query,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  }));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

// the first call of a fresh worker runs cold code (axios, schemas, React Aria): over 1 s when every
// worker is busy, as in auth-ui (nothing here depends on the time)
configure({ asyncUtilTimeout: 10_000 });

const [root] = routes as [RouteObject];

/** The app's pages, signed in as `who`, against the pretend API; starting at `at`. */
function renderAs(who: Who, at: string) {
  const api = fakeApi(who);
  const client = createApiClient({ app: 'master', baseUrl: BASE_URL, fetch: api.fetch });
  const queryClient = createQueryClient();
  const router = createMemoryRouter(
    [
      {
        ...root,
        element: (
          <ApiProvider client={client} queryClient={queryClient}>
            <SessionProvider>
              <StepUpProvider>
                <Frame />
              </StepUpProvider>
            </SessionProvider>
            <Toaster />
          </ApiProvider>
        ),
      },
    ],
    { initialEntries: [at] },
  );
  const view = render(<RouterProvider router={router} />);
  return {
    ...view,
    api,
    router,
    where: () => `${router.state.location.pathname}${router.state.location.search}`,
  };
}

async function violations(container: HTMLElement) {
  const results = await axe.run(container, {
    rules: {
      'color-contrast': { enabled: false },
      'label-content-name-mismatch': { enabled: false },
      region: { enabled: false },
    },
  });
  return results.violations.map((violation) => `${violation.id}: ${violation.help}`);
}

describe('People, as Master', () => {
  it('lists the staff with role names, where and how, and the Staff link in the nav', async () => {
    const { container } = renderAs('master', '/staff');
    const table = await screen.findByRole('table', { name: 'Staff' });
    await waitFor(() => {
      expect(within(table).getAllByText('State Admin')).toHaveLength(1);
    });
    expect(within(table).getByText('Maharashtra, Gujarat')).toBeTruthy();
    expect(within(table).getAllByText('Fraud & Risk Analyst')).toHaveLength(2);
    const main = screen.getByRole('navigation', { name: 'Main' });
    expect(within(main).getByRole('link', { name: 'Staff' })).toBeTruthy();
    const section = screen.getByRole('navigation', { name: 'Staff' });
    expect(within(section).getByRole('link', { name: 'People' }).getAttribute('aria-current')).toBe(
      'page',
    );
    expect(screen.getByRole('button', { name: 'Invite someone' })).toBeTruthy();
    expect(await violations(container)).toEqual([]);
  });

  it('opens a person: their roles, ending one after asking, and giving another', async () => {
    const { api } = renderAs('master', '/staff');
    await userEvent.click(
      await screen.findByRole('button', { name: 'asha@beautinique.example, State Admin' }),
    );
    const panel = await screen.findByRole('dialog', { name: 'asha@beautinique.example' });
    await within(panel).findByText('Maharashtra, Gujarat · No end', { exact: false });
    expect(within(panel).getByRole('button', { name: 'Give another role' })).toBeTruthy();
    // Master resets authenticators, but ends no one's sessions (the Security Officer does)
    expect(within(panel).getByRole('button', { name: 'Reset authenticator' })).toBeTruthy();
    expect(within(panel).queryByRole('button', { name: 'End all sessions' })).toBeNull();
    await userEvent.click(
      within(panel).getByRole('button', { name: 'End State Admin for asha@beautinique.example' }),
    );
    const ask = await screen.findByRole('alertdialog', { name: 'End State Admin?' });
    await userEvent.click(within(ask).getByRole('button', { name: 'End role' }));
    await waitFor(() => {
      expect(api.paths()).toContain(`POST /iam/grants/${String(api.state.grants[0]?.grantId)}/end`);
    });
    expect(await screen.findByText('State Admin ended for asha@beautinique.example.')).toBeTruthy();
  });

  it('keeps the filters in the URL, from the first page', async () => {
    const { api, where } = renderAs('master', '/staff?status=ended');
    await screen.findByText('No one matches these filters.');
    expect(api.paths()).toContain('GET /iam/grants?limit=25&status=ended');
    await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    await waitFor(() => {
      expect(where()).toBe('/staff');
    });
  });
});

describe('Giving a role from a person', () => {
  it('gives a role Master appoints to someone on the staff', async () => {
    const { api } = renderAs('master', '/staff');
    await userEvent.click(
      await screen.findByRole('button', { name: 'ravi@beautinique.example, Fraud & Risk Analyst' }),
    );
    const panel = await screen.findByRole('dialog', { name: 'ravi@beautinique.example' });
    await userEvent.click(within(panel).getByRole('button', { name: 'Give another role' }));
    const form = await screen.findByRole('dialog', { name: 'Give a role' });
    await userEvent.click(within(form).getByRole('button', { name: /App/ }));
    await userEvent.click(await screen.findByRole('option', { name: 'Admin' }));
    await userEvent.click(within(form).getByRole('button', { name: /Role/ }));
    await userEvent.click(await screen.findByRole('option', { name: /Fraud/ }));
    await userEvent.click(within(form).getByRole('button', { name: 'Give role' }));
    await waitFor(() => {
      expect(
        api.sent.find((s) => s.method === 'POST' && s.path === '/iam/grants')?.body,
      ).toMatchObject({
        role: 'admin.fraud_risk',
        scope: { type: 'global', ids: [] },
      });
    });
  });
});

describe('People, by role', () => {
  it('shows a Security Officer the person read-only, with both security actions', async () => {
    renderAs('officer', '/staff');
    expect(screen.queryByRole('button', { name: 'Invite someone' })).toBeNull();
    await userEvent.click(
      await screen.findByRole('button', { name: 'ravi@beautinique.example, Fraud & Risk Analyst' }),
    );
    const panel = await screen.findByRole('dialog', { name: 'ravi@beautinique.example' });
    await within(panel).findByText('Fraud & Risk Analyst');
    expect(within(panel).queryByRole('button', { name: /^End .* for / })).toBeNull();
    expect(within(panel).queryByRole('button', { name: 'Give another role' })).toBeNull();
    await userEvent.click(within(panel).getByRole('button', { name: 'End all sessions' }));
    const ask = await screen.findByRole('alertdialog', { name: 'End all their sessions?' });
    await userEvent.click(within(ask).getByRole('button', { name: 'End all sessions' }));
    expect(await screen.findByText('3 session(s) of ravi@beautinique.example ended.')).toBeTruthy();
  });

  it('shows a Security Officer no reset for a Master (only another Master may), and says when there was nothing to reset', async () => {
    renderAs('officer', '/staff');
    await userEvent.click(
      await screen.findByRole('button', { name: 'mona@beautinique.example, Master' }),
    );
    const mona = await screen.findByRole('dialog', { name: 'mona@beautinique.example' });
    await within(mona).findByText('Master');
    expect(within(mona).queryByRole('button', { name: 'Reset authenticator' })).toBeNull();
    expect(within(mona).getByRole('button', { name: 'End all sessions' })).toBeTruthy();
    await userEvent.keyboard('{Escape}');
    await userEvent.click(
      await screen.findByRole('button', { name: 'ravi@beautinique.example, Fraud & Risk Analyst' }),
    );
    const ravi = await screen.findByRole('dialog', { name: 'ravi@beautinique.example' });
    await userEvent.click(await within(ravi).findByRole('button', { name: 'Reset authenticator' }));
    const ask = await screen.findByRole('alertdialog', { name: 'Reset their authenticator?' });
    await userEvent.click(within(ask).getByRole('button', { name: 'Reset authenticator' }));
    expect(
      await screen.findByText('ravi@beautinique.example has no authenticator; nothing changed.'),
    ).toBeTruthy();
  });

  it('keeps a part of an email out of the URL, and says why', async () => {
    const { where } = renderAs('master', '/staff');
    await screen.findByRole('table', { name: 'Staff' });
    await userEvent.type(screen.getByLabelText('Email'), 'asha@{Enter}');
    expect(await screen.findByText('Enter the whole email address')).toBeTruthy();
    expect(where()).toBe('/staff');
  });

  it('shows an Internal Auditor the list and nothing to change', async () => {
    renderAs('auditor', '/staff');
    await userEvent.click(
      await screen.findByRole('button', { name: 'ravi@beautinique.example, Fraud & Risk Analyst' }),
    );
    const panel = await screen.findByRole('dialog', { name: 'ravi@beautinique.example' });
    await within(panel).findByText('Fraud & Risk Analyst');
    expect(
      within(panel)
        .queryAllByRole('button')
        .map((b) => b.getAttribute('aria-label') ?? b.textContent),
    ).toEqual(['Close']);
  });

  it('keeps the Staff pages from a role that does not read grants, and says so', async () => {
    renderAs('head', '/staff');
    expect(await screen.findByRole('heading', { name: 'Not for your role' })).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Staff' })).toBeNull();
  });

  it('greets a role with no section yet plainly, and Master with the Staff sections', async () => {
    const head = renderAs('head', '/');
    expect(
      await screen.findByText('There is nothing to manage here for your role yet.'),
    ).toBeTruthy();
    head.unmount();
    const master = renderAs('master', '/');
    expect(await screen.findByRole('link', { name: /People/ })).toBeTruthy();
    expect(screen.getByRole('link', { name: /Invitations/ })).toBeTruthy();
    expect(screen.queryByText(/Coming soon/)).toBeNull();
    expect(await violations(master.container)).toEqual([]);
  });
});

describe('Invitations', () => {
  it('lists them by status, and takes back a pending one after asking', async () => {
    const { api, container } = renderAs('master', '/staff/invitations');
    const table = await screen.findByRole('table', { name: 'Invitations' });
    expect(within(table).getByText('Pending')).toBeTruthy();
    expect(within(table).getByText('Accepted')).toBeTruthy();
    // only the pending one can be taken back
    expect(within(table).getAllByRole('button', { name: /Take back/ })).toHaveLength(1);
    expect(await violations(container)).toEqual([]);
    await userEvent.click(
      within(table).getByRole('button', {
        name: 'Take back the invitation of neel@beautinique.example',
      }),
    );
    const ask = await screen.findByRole('alertdialog', { name: 'Take back this invitation?' });
    await userEvent.click(within(ask).getByRole('button', { name: 'Take back' }));
    await waitFor(() => {
      expect(api.paths()).toContain(
        `POST /iam/invitations/${String(api.state.invitations[0]?.invitationId)}/revoke`,
      );
    });
  });

  it('invites an email to a role in states: the app, a role Master gives, where', async () => {
    const { api } = renderAs('master', '/staff/invitations');
    await screen.findByRole('table', { name: 'Invitations' });
    await userEvent.click(screen.getByRole('button', { name: 'Invite someone' }));
    const form = await screen.findByRole('dialog', { name: 'Invite someone' });
    await userEvent.type(within(form).getByLabelText('Email'), 'Zoya@Beautinique.example');
    await userEvent.click(within(form).getByRole('button', { name: /App/ }));
    await userEvent.click(await screen.findByRole('option', { name: 'Admin' }));
    await userEvent.click(within(form).getByRole('button', { name: /Role/ }));
    // a role whose places do not exist yet is shown, not chosen
    const later = await screen.findByRole('option', { name: /Category Manager/ });
    expect(later.getAttribute('aria-disabled')).toBe('true');
    await userEvent.click(screen.getByRole('option', { name: /State Admin/ }));
    // the Where field shows 'States' too: the states picker is the empty one
    await userEvent.click(within(form).getByRole('button', { name: /Choose states/ }));
    await userEvent.click(await screen.findByRole('option', { name: /Maharashtra/ }));
    await userEvent.keyboard('{Escape}');
    await userEvent.click(within(form).getByRole('button', { name: 'Send invitation' }));
    await waitFor(() => {
      expect(
        api.sent.find((s) => s.method === 'POST' && s.path === '/iam/invitations')?.body,
      ).toEqual({
        email: 'zoya@beautinique.example',
        role: 'admin.state_admin',
        scope: { type: 'state', ids: ['MH'] },
        validFrom: null,
        validTo: null,
      });
    });
  });
});

describe('Roles', () => {
  it('lists the roles with what they allow, and makes a sub-role', async () => {
    const { api, container } = renderAs('master', '/staff/roles');
    const table = await screen.findByRole('table', { name: 'Roles' });
    expect(within(table).getByText('Made by Master')).toBeTruthy();
    expect(await violations(container)).toEqual([]);
    await userEvent.click(within(table).getByRole('button', { name: 'State Admin' }));
    const panel = await screen.findByRole('dialog', { name: 'State Admin' });
    expect(within(panel).getByText('Give roles, invite people to them and end them')).toBeTruthy();
    // a shipped role changes only in code
    expect(within(panel).queryByRole('button', { name: 'Change' })).toBeNull();
    await userEvent.keyboard('{Escape}');
    await userEvent.click(screen.getByRole('button', { name: 'New sub-role' }));
    const editor = await screen.findByRole('dialog', { name: 'New sub-role' });
    await userEvent.click(within(editor).getByRole('button', { name: /App/ }));
    await userEvent.click(await screen.findByRole('option', { name: 'Support Desk' }));
    await userEvent.type(within(editor).getByLabelText('Key name'), 'night_desk');
    await userEvent.type(within(editor).getByLabelText('Name'), 'Night Desk');
    await userEvent.click(within(editor).getByRole('button', { name: 'Make sub-role' }));
    await waitFor(() => {
      expect(api.sent.find((s) => s.method === 'POST' && s.path === '/iam/roles')?.body).toEqual({
        app: 'support',
        slug: 'night_desk',
        name: 'Night Desk',
        scopeTypes: ['global'],
        permissions: ['iam.app.sign_in'],
        appointedBy: ['master.master'],
        mfaRequired: false,
      });
    });
  });
});
