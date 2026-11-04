import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  branchValues,
  descendantsOf,
  filterTree,
  indexTree,
  isBranch,
  withoutCovered,
} from '../src/hierarchy-tree';
import { type HierarchyOption, HierarchySelect } from '../src/index';
import { at } from './at';
import { expectNoAxeViolations } from './axe';

afterEach(() => {
  cleanup();
});

const TREE: HierarchyOption[] = [
  {
    value: 'makeup',
    label: 'Makeup',
    children: [
      {
        value: 'lips',
        label: 'Lips',
        children: [
          { value: 'lipstick', label: 'Lipstick' },
          { value: 'lip-gloss', label: 'Lip gloss' },
          { value: 'lip-liner', label: 'Lip liner', disabled: true },
        ],
      },
      { value: 'eyes', label: 'Eyes', children: [{ value: 'kajal', label: 'Kajal' }] },
    ],
  },
  { value: 'skincare', label: 'Skincare', children: [{ value: 'serums', label: 'Serums' }] },
  { value: 'gift-cards', label: 'Gift cards' },
];

describe('tree helpers', () => {
  it('indexTree: every option with its ancestors and its path', () => {
    const index = indexTree(TREE);
    expect(index.size).toBe(10);
    expect(index.get('lipstick')?.ancestors).toEqual(['makeup', 'lips']);
    expect(index.get('lipstick')?.path).toEqual(['Makeup', 'Lips', 'Lipstick']);
    expect(index.get('makeup')?.ancestors).toEqual([]);
  });

  it('isBranch, descendantsOf, branchValues', () => {
    const makeup = at(TREE);
    expect(isBranch(makeup)).toBe(true);
    expect(isBranch(at(TREE, 2))).toBe(false);
    expect(isBranch({ value: 'x', label: 'X', children: [] })).toBe(false);
    expect(descendantsOf(makeup)).toEqual([
      'lips',
      'lipstick',
      'lip-gloss',
      'lip-liner',
      'eyes',
      'kajal',
    ]);
    expect(branchValues(TREE)).toEqual(['makeup', 'lips', 'eyes', 'skincare']);
  });

  it('filterTree: matches (any case) keep what is under them and the branches above', () => {
    expect(filterTree(TREE, '  ')).toEqual({ tree: TREE, matches: 0 });
    const lip = filterTree(TREE, 'LIP');
    // Lips matches (with all under it, which also match), nothing else
    expect(lip.matches).toBe(4);
    expect(lip.tree.map((option) => option.value)).toEqual(['makeup']);
    expect(lip.tree[0]?.children?.map((option) => option.value)).toEqual(['lips']);
    expect(lip.tree[0]?.children?.[0]?.children).toHaveLength(3);
    const kajal = filterTree(TREE, 'kaj');
    expect(kajal.matches).toBe(1);
    expect(kajal.tree[0]?.children?.[0]?.value).toBe('eyes');
    expect(filterTree(TREE, 'zzz')).toEqual({ tree: [], matches: 0 });
  });

  it('withoutCovered drops what a chosen branch already covers, in order', () => {
    const index = indexTree(TREE);
    expect(withoutCovered(['kajal', 'skincare', 'makeup', 'serums'], index)).toEqual([
      'skincare',
      'makeup',
    ]);
    expect(withoutCovered(['lipstick', 'kajal'], index)).toEqual(['lipstick', 'kajal']);
  });
});

// hidden too: an open picker hides the page (and its own field) from screen readers
const trigger = (name: RegExp) => screen.getByRole('button', { name, hidden: true });
const rows = () =>
  within(screen.getByRole('dialog'))
    .getAllByRole('row')
    .map((row) => row.textContent);

function Category({ onChange }: { onChange?: (value: string | null) => void }) {
  const [value, setValue] = useState<string | null>('lipstick');
  return (
    <>
      <HierarchySelect
        label="Category"
        options={TREE}
        value={value}
        onChange={(next) => {
          setValue(next);
          onChange?.(next);
        }}
        hint="The last level"
      />
      <output data-testid="value">{String(value)}</output>
    </>
  );
}

describe('HierarchySelect, one choice', () => {
  it('shows the path of the choice; opens with the search focused and the choice in view', async () => {
    render(<Category />);
    const button = trigger(/Category/);
    expect(button.textContent).toContain('Makeup › Lips › Lipstick');
    await expectNoAxeViolations();
    await userEvent.click(button);
    expect(document.activeElement).toBe(
      screen.getByRole('searchbox', { name: 'Search the options' }),
    );
    expect(rows()).toEqual([
      'Makeup1 chosen',
      'Lips1 chosen',
      'Lipstick',
      'Lip gloss',
      'Lip liner',
      'Eyes',
      'Skincare',
      'Gift cards',
    ]);
    const lipstick = within(screen.getByRole('dialog')).getByRole('row', { name: 'Lipstick' });
    expect(lipstick.getAttribute('aria-selected')).toBe('true');
    await expectNoAxeViolations();
  });

  it('a press on an option chooses it and closes; on a branch it opens instead', async () => {
    const onChange = vi.fn();
    render(<Category onChange={onChange} />);
    await userEvent.click(trigger(/Category/));
    const dialog = screen.getByRole('dialog');
    await userEvent.click(within(dialog).getByText('Eyes'));
    expect(onChange).not.toHaveBeenCalled();
    expect(rows()).toContain('Kajal');
    await userEvent.click(within(dialog).getByText('Kajal'));
    expect(onChange).toHaveBeenCalledExactlyOnceWith('kajal');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(trigger(/Category/).textContent).toContain('Makeup › Eyes › Kajal');
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger(/Category/));
    });
  });

  it('a disabled option cannot be chosen', async () => {
    const onChange = vi.fn();
    render(<Category onChange={onChange} />);
    await userEvent.click(trigger(/Category/));
    await userEvent.click(within(screen.getByRole('dialog')).getByText('Lip liner'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('search: matches with their branches open, a count for screen readers, then the keyboard', async () => {
    const onChange = vi.fn();
    render(<Category onChange={onChange} />);
    await userEvent.click(trigger(/Category/));
    await userEvent.keyboard('kaj');
    expect(rows()).toEqual(['Makeup', 'Eyes', 'Kajal']);
    const dialog = screen.getByRole('dialog');
    expect(dialog.querySelector('[aria-live="polite"]')?.textContent).toBe('1 option found');
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement?.textContent).toBe('Makeup');
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenCalledExactlyOnceWith('kajal');
  });

  it('a search that finds nothing says so', async () => {
    render(<Category />);
    await userEvent.click(trigger(/Category/));
    await userEvent.keyboard('zzz');
    const dialog = screen.getByRole('dialog');
    expect(dialog.textContent).toContain('No matching options');
    expect(dialog.querySelector('[aria-live="polite"]')?.textContent).toBe('0 options found');
  });

  it('Right and Left open and close a branch; Escape closes and gives the focus back', async () => {
    render(<HierarchySelect label="Category" options={TREE} />);
    const button = trigger(/Category/);
    expect(button.textContent).toContain('Select an option');
    await userEvent.click(button);
    await userEvent.keyboard('{ArrowDown}');
    expect(rows()).toEqual(['Makeup', 'Skincare', 'Gift cards']);
    await userEvent.keyboard('{ArrowRight}');
    expect(rows()).toEqual(['Makeup', 'Lips', 'Eyes', 'Skincare', 'Gift cards']);
    await userEvent.keyboard('{ArrowLeft}');
    expect(rows()).toEqual(['Makeup', 'Skincare', 'Gift cards']);
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    await waitFor(() => {
      expect(document.activeElement).toBe(button);
    });
  });

  it('selectable="any": a branch can be chosen', async () => {
    const onChange = vi.fn();
    render(<HierarchySelect label="Filter" options={TREE} selectable="any" onChange={onChange} />);
    await userEvent.click(trigger(/Filter/));
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenCalledExactlyOnceWith('makeup');
    expect(trigger(/Filter/).textContent).toContain('Makeup');
  });

  it('is described by its hint and error, invalid and required; sends its value with a form', async () => {
    render(
      <form data-testid="form">
        <HierarchySelect
          label="Category"
          options={TREE}
          defaultValue="serums"
          name="category"
          hint="The last level"
          error="Choose a category"
          isRequired
        />
      </form>,
    );
    const button = trigger(/Category/);
    const described = (button.getAttribute('aria-describedby') ?? '')
      .split(' ')
      .map((id) => document.getElementById(id)?.textContent);
    expect(described).toEqual(['The last level', 'Choose a category']);
    // a button has no aria-required: the name says it, and the error describes it
    expect(button.textContent).not.toContain('(required)');
    const named = (button.getAttribute('aria-labelledby') ?? '')
      .split(' ')
      .map((id) => document.getElementById(id)?.textContent)
      .join(' | ');
    expect(named).toBe('Category*, required | Skincare › Serums');
    // the asterisk is hidden: screen readers hear "Category, required Skincare › Serums"
    expect(
      screen.getByRole('button', { name: (name) => name.startsWith('Category, required') }),
    ).toBe(button);
    expect(new FormData(screen.getByTestId<HTMLFormElement>('form')).getAll('category')).toEqual([
      'serums',
    ]);
    await expectNoAxeViolations();
  });
});

function Areas({ onChange }: { onChange?: (value: string[]) => void }) {
  const [value, setValue] = useState<string[]>(['lipstick']);
  return (
    <HierarchySelect
      label="Categories"
      selectionMode="multiple"
      selectable="any"
      options={TREE}
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
}

describe('HierarchySelect, several choices', () => {
  it('boxes; a chosen branch covers what is under it and drops it from the value', async () => {
    const onChange = vi.fn();
    render(<Areas onChange={onChange} />);
    await userEvent.click(trigger(/Categories/));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('treegrid').getAttribute('aria-multiselectable')).toBe('true');
    await userEvent.click(within(dialog).getByText('Lip gloss'));
    expect(onChange).toHaveBeenLastCalledWith(['lipstick', 'lip-gloss']);
    // the box stays open
    expect(screen.getByRole('dialog')).toBe(dialog);
    await userEvent.click(within(dialog).getByText('Makeup'));
    expect(onChange).toHaveBeenLastCalledWith(['makeup']);
    // what Makeup covers shows ticked and dimmed, and cannot be chosen apart
    const lips = within(dialog).getByRole('row', { name: 'Lips' });
    expect(lips.querySelector('.opacity-60')).not.toBeNull();
    await userEvent.click(within(dialog).getByText('Lip gloss'));
    expect(onChange).toHaveBeenLastCalledWith(['makeup']);
    expect(trigger(/Categories/).textContent).toContain('Makeup');
  });

  it('Enter ticks and unticks like Space; Clear all; Done closes', async () => {
    const onChange = vi.fn();
    render(<Areas onChange={onChange} />);
    await userEvent.click(trigger(/Categories/));
    await userEvent.keyboard('{ArrowDown}');
    // Makeup, then down to Skincare past the open Makeup branch
    await userEvent.keyboard('{End}{ArrowUp}{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(['lipstick', 'skincare']);
    await userEvent.keyboard('{Enter}');
    expect(onChange).toHaveBeenLastCalledWith(['lipstick']);
    await userEvent.keyboard(' ');
    expect(onChange).toHaveBeenLastCalledWith(['lipstick', 'skincare']);
    const dialog = screen.getByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Clear all' }));
    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(within(dialog).getByRole('button', { name: 'Clear all' })).toHaveProperty(
      'disabled',
      true,
    );
    await userEvent.click(within(dialog).getByRole('button', { name: 'Done' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    await expectNoAxeViolations();
  });

  it('leaf only: a branch shows how many are chosen under it and cannot be chosen', async () => {
    const onChange = vi.fn();
    render(
      <HierarchySelect
        label="Categories"
        selectionMode="multiple"
        options={TREE}
        defaultValue={['lipstick', 'lip-gloss']}
        onChange={onChange}
      />,
    );
    expect(trigger(/Categories/).textContent).toContain('Lipstick, Lip gloss');
    await userEvent.click(trigger(/Categories/));
    expect(rows()).toContain('Lips2 chosen');
    await userEvent.click(within(screen.getByRole('dialog')).getByText('Skincare'));
    // it opened instead
    expect(onChange).not.toHaveBeenCalled();
    expect(rows()).toContain('Serums');
  });
});
