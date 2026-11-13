import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { type Column, DataTable } from '../src';
import { expectNoAxeViolations } from './axe';

interface Person {
  id: string;
  email: string;
  role: string;
  since: string;
}

const PEOPLE: Person[] = [
  { id: 'a', email: 'asha@beautinique.example', role: 'State Admin', since: '13 Nov 2026' },
  {
    id: 'b',
    email: 'ravi@beautinique.example',
    role: 'Fraud & Risk Analyst',
    since: '12 Nov 2026',
  },
];

const COLUMNS: Column<Person>[] = [
  { key: 'email', header: 'Email', cell: (p) => p.email, primary: true },
  { key: 'role', header: 'Role', cell: (p) => p.role },
  { key: 'since', header: 'Since', cell: (p) => p.since, align: 'end', hideOnCard: true },
];

/** The window is this wide: matchMedia answers min-width queries for it (jsdom has none). */
function widthIs(px: number) {
  vi.stubGlobal('matchMedia', (query: string) => {
    const min = /min-width:\s*([\d.]+)rem/.exec(query);
    const matches = min ? px >= Number(min[1]) * 16 : false;
    return {
      matches,
      media: query,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    };
  });
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const table = (props: Partial<Parameters<typeof DataTable<Person>>[0]> = {}) => (
  <DataTable
    label="Staff"
    columns={COLUMNS}
    rows={PEOPLE}
    rowKey={(p) => p.id}
    status="ready"
    {...props}
  />
);

describe('DataTable on a wide screen', () => {
  it('is a real table named by its label, the primary column as the row header', async () => {
    widthIs(1280);
    render(table());
    const grid = screen.getByRole('table', { name: 'Staff' });
    expect(
      within(grid)
        .getAllByRole('columnheader')
        .map((h) => h.textContent),
    ).toEqual(['Email', 'Role', 'Since']);
    expect(
      within(grid)
        .getAllByRole('rowheader')
        .map((h) => h.textContent),
    ).toEqual(['asha@beautinique.example', 'ravi@beautinique.example']);
    await expectNoAxeViolations();
  });

  it('opens a row by its name’s button, by keyboard too, and marks the open one', async () => {
    widthIs(1280);
    const opened: string[] = [];
    const { rerender } = render(table({ onOpen: (p) => opened.push(p.id) }));
    await userEvent.click(screen.getByRole('button', { name: 'asha@beautinique.example' }));
    screen.getByRole('button', { name: 'ravi@beautinique.example' }).focus();
    await userEvent.keyboard('{Enter}');
    expect(opened).toEqual(['a', 'b']);
    rerender(table({ onOpen: (p) => opened.push(p.id), openKey: 'b' }));
    const rows = screen.getAllByRole('row').slice(1);
    expect(rows.map((row) => row.getAttribute('aria-current'))).toEqual([null, 'true']);
    // one control per row: its name's button
    const [firstRow] = rows;
    if (!firstRow) throw new Error('no row');
    expect(within(firstRow).getAllByRole('button')).toHaveLength(1);
    await expectNoAxeViolations();
  });

  it('names the open buttons with openLabel when given', () => {
    widthIs(1280);
    render(table({ onOpen: () => undefined, openLabel: (p) => `Open ${p.email}` }));
    expect(screen.getByRole('button', { name: 'Open asha@beautinique.example' })).toBeDefined();
  });

  it('dims the rows while the next page comes, and keeps them', () => {
    widthIs(1280);
    const { container } = render(table({ refreshing: true }));
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(screen.getAllByRole('rowheader')).toHaveLength(2);
  });
});

describe('DataTable on a phone', () => {
  it('lists cards: the primary column as the title, the rest as a list, hideOnCard left out', async () => {
    widthIs(375);
    render(table({ onOpen: () => undefined }));
    expect(screen.queryByRole('table')).toBeNull();
    const list = screen.getByRole('list', { name: 'Staff' });
    const cards = within(list).getAllByRole('listitem');
    expect(cards).toHaveLength(2);
    const [first] = cards;
    if (!first) throw new Error('no card');
    expect(within(first).getByRole('button', { name: 'asha@beautinique.example' })).toBeDefined();
    expect(within(first).getByText('Role')).toBeDefined();
    expect(within(first).getByText('State Admin')).toBeDefined();
    expect(within(first).queryByText('Since')).toBeNull();
    await expectNoAxeViolations();
  });
});

describe('DataTable states', () => {
  it('says it is loading, for screen readers too', () => {
    widthIs(1280);
    render(table({ status: 'loading' }));
    // a status is named by no content: its words are inside it, for screen readers
    expect(screen.getByRole('status').textContent).toBe('Loading staff');
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('says a load failed, with Try again', async () => {
    widthIs(1280);
    const retry = vi.fn();
    render(table({ status: 'error', onRetry: retry, errorMessage: 'Staff could not be loaded.' }));
    expect(screen.getByRole('alert').textContent).toContain('Staff could not be loaded.');
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it('says there is nothing, in its own words or the default ones', () => {
    widthIs(1280);
    const { rerender } = render(table({ rows: [] }));
    expect(screen.getByText('Nothing here yet.')).toBeDefined();
    rerender(table({ rows: [], empty: 'No staff match these filters.' }));
    expect(screen.getByText('No staff match these filters.')).toBeDefined();
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('shows its footer under the rows', () => {
    widthIs(1280);
    render(table({ footer: <p>Footer here</p> }));
    expect(screen.getByText('Footer here')).toBeDefined();
  });
});
