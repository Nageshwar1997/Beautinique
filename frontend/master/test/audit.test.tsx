// T4.1 PR C: the Master app's audit log, against the pretend API (fake-api.ts): each day's chain
// check, the entries with who and what, the filters in the URL, one entry's details, and the page
// only for those who read the audit log.
import { cleanup, configure, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { actionText, checkOf, rangeOf } from '../src/audit/audit-log';
import { renderAs, violations } from './render';

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

configure({ asyncUtilTimeout: 10_000 });

describe('the audit log, as Master', () => {
  it("lists the entries, newest first, and each day's chain check, with the link in the nav", async () => {
    const { container, api } = renderAs('master', '/audit');
    const table = await screen.findByRole('table', { name: 'Audit entries' });
    await waitFor(() => {
      expect(within(table).getAllByRole('row')).toHaveLength(4);
    });
    // the time is the row header; the action is the second cell
    const rows = within(table).getAllByRole('row').slice(1);
    expect(rows.map((row) => within(row).getAllByRole('cell')[1]?.textContent)).toEqual([
      'Copied session stopped',
      'Role ended',
      'Role given',
    ]);
    expect(within(table).getAllByText('m•••@beautinique.example (Master)')).toHaveLength(2);
    expect(within(table).getByText('System')).toBeTruthy();
    expect(within(table).getByText('Refused')).toBeTruthy();
    const days = screen.getByRole('list', { name: 'Days' });
    expect(within(days).getByText('Not checked yet')).toBeTruthy();
    expect(within(days).getByText('Broken at #2')).toBeTruthy();
    expect(within(days).getByText('Checked')).toBeTruthy();
    const main = screen.getByRole('navigation', { name: 'Main' });
    expect(within(main).getByRole('link', { name: 'Audit log' })).toBeTruthy();
    // 14 days back, today included
    expect(api.paths().find((path) => path.startsWith('GET /audit/days'))).toMatch(
      /from=\d{4}-\d{2}-\d{2}&to=\d{4}-\d{2}-\d{2}/,
    );
    expect(await violations(container)).toEqual([]);
  });

  it('filters by result, in the URL, and shows what changed in one entry', async () => {
    const { api, where } = renderAs('master', '/audit?result=denied');
    const table = await screen.findByRole('table', { name: 'Audit entries' });
    await waitFor(() => {
      expect(within(table).getAllByRole('row')).toHaveLength(2);
    });
    expect(api.paths()).toContain('GET /audit/entries?limit=25&result=denied');
    expect(where()).toBe('/audit?result=denied');
    await userEvent.click(
      within(table).getByRole('button', { name: /^Details of Copied session stopped/ }),
    );
    const dialog = await screen.findByRole('dialog', { name: 'Copied session stopped' });
    expect(within(dialog).getByText('203.0.113.9')).toBeTruthy();
    expect(within(dialog).getByText('Maharashtra')).toBeTruthy();
    expect(within(dialog).getByText('2026-11-15 #3')).toBeTruthy();
    expect(within(dialog).getByText(/"email": "a•••@beautinique.example"/)).toBeTruthy();
  });
});

describe('the filters', () => {
  it("sends only an action it names, never one of Object's own", async () => {
    const { api } = renderAs('master', '/audit?action=constructor');
    await screen.findByRole('table', { name: 'Audit entries' });
    await waitFor(() => {
      expect(api.paths()).toContain('GET /audit/entries?limit=25');
    });
    expect(api.paths().some((path) => path.includes('action=constructor'))).toBe(false);
  });
});

describe('the CSV (T4.1 PR D)', () => {
  it('downloads the entries the filters show, India days as times, and says it is done', async () => {
    const made = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:audit');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const clicked = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);
    const { api } = renderAs('master', '/audit?result=denied&from=2026-11-01&to=2026-11-15');
    await screen.findByRole('table', { name: 'Audit entries' });
    const range = 'from=2026-10-31T18%3A30%3A00.000Z&to=2026-11-15T18%3A29%3A59.999Z';
    await waitFor(() => {
      expect(api.paths()).toContain(`GET /audit/entries?limit=25&${range}&result=denied`);
    });
    await userEvent.click(screen.getByRole('button', { name: 'Download CSV' }));
    // the toast (and its words for screen readers)
    expect((await screen.findAllByText('Audit log downloaded')).length).toBeGreaterThan(0);
    expect(api.paths()).toContain(`GET /audit/entries/export?${range}&result=denied`);
    expect(made).toHaveBeenCalledTimes(1);
    const link = clicked.mock.contexts[0] as HTMLAnchorElement;
    expect(link.download).toBe('beautinique-audit-log-2026-11-15.csv');
  });

  it('says so when more than 50,000 entries match, and the Internal Auditor has the button too', async () => {
    const { api } = renderAs('auditor', '/audit');
    api.state.exportAnswer = 'too-large';
    await screen.findByRole('table', { name: 'Audit entries' });
    await userEvent.click(screen.getByRole('button', { name: 'Download CSV' }));
    expect((await screen.findByRole('alert')).textContent).toBe(
      'More than 50,000 entries match. Narrow the dates or filters.',
    );
  });

  it('turns picked India days into the time range, and leaves out what is no day', () => {
    expect(rangeOf('2026-11-01', '2026-11-15')).toEqual({
      from: '2026-10-31T18:30:00.000Z',
      to: '2026-11-15T18:29:59.999Z',
    });
    expect(rangeOf('', 'x')).toEqual({});
  });
});

describe('the audit log, for others', () => {
  it('opens for the Internal Auditor too', async () => {
    renderAs('auditor', '/audit');
    expect(await screen.findByRole('table', { name: 'Audit entries' })).toBeTruthy();
  });

  it('stays closed to a role that does not read it, and is not in its nav', async () => {
    renderAs('officer', '/audit');
    expect(await screen.findByRole('heading', { name: 'Not for your role' })).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Audit log' })).toBeNull();
  });
});

describe('the labels', () => {
  it('names the actions it knows, and shows a new one as its key', () => {
    expect(actionText('iam.grants.give')).toBe('Role given');
    expect(actionText('finance.payout.approve')).toBe('finance.payout.approve');
  });

  it("says where a day's chain stands", () => {
    const day = (check: Parameters<typeof checkOf>[0]['check'], entries = 3) =>
      checkOf({ day: '2026-11-15', entries, check });
    expect(day(null).label).toBe('Not checked yet');
    const at = '2026-11-15T00:15:00.000Z';
    expect(day({ ok: true, entries: 3, brokenAtSeq: null, checkedAt: at })).toEqual({
      label: 'Checked',
      tone: 'success',
    });
    expect(day({ ok: true, entries: 2, brokenAtSeq: null, checkedAt: at }).label).toBe(
      'Grew since its check',
    );
    expect(day({ ok: false, entries: 3, brokenAtSeq: 2, checkedAt: at })).toEqual({
      label: 'Broken at #2',
      tone: 'error',
    });
  });
});
