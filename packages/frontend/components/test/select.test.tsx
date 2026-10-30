import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ComboBox, type PickerOption, Select } from '../src/index';
import { expectNoAxeViolations } from './axe';

afterEach(() => {
  cleanup();
});

const SKIN: PickerOption[] = [
  { value: 'dry', label: 'Dry' },
  { value: 'oily', label: 'Oily' },
  { value: 'combination', label: 'Combination', description: 'Oily T-zone' },
  { value: 'sensitive', label: 'Sensitive', disabled: true },
];

const described = (element: HTMLElement) =>
  (element.getAttribute('aria-describedby') ?? '')
    .split(' ')
    .map((id) => document.getElementById(id)?.textContent ?? '')
    .join(' | ');

// options with a second line are named by their label and described by the line (React Aria);
// axe's label-content-name-mismatch wants the whole text in the name
const OPTION_DESCRIPTIONS = ['label-content-name-mismatch'];

describe('Select', () => {
  it('opens on press, chooses an option and shows it', async () => {
    const onChange = vi.fn();
    function Skin() {
      const [value, setValue] = useState<string | null>(null);
      return (
        <Select
          label="Skin type"
          options={SKIN}
          value={value}
          onChange={(next) => {
            setValue(next);
            onChange(next);
          }}
        />
      );
    }
    render(<Skin />);
    const trigger = screen.getByRole('button', { name: /Skin type/ });
    expect(trigger.textContent).toContain('Select an option');
    await expectNoAxeViolations();
    await userEvent.click(trigger);
    const listbox = screen.getByRole('listbox');
    expect(
      within(listbox)
        .getAllByRole('option')
        .map((option) => option.textContent),
    ).toEqual(['Dry', 'Oily', 'CombinationOily T-zone', 'Sensitive']);
    await expectNoAxeViolations(document.body, OPTION_DESCRIPTIONS);
    await userEvent.click(within(listbox).getByRole('option', { name: 'Oily' }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith('oily');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(trigger.textContent).toContain('Oily');
  });

  it('works from the keyboard and skips a disabled option', async () => {
    const onChange = vi.fn();
    render(
      <Select label="Skin type" options={SKIN} defaultValue="combination" onChange={onChange} />,
    );
    const trigger = screen.getByRole('button', { name: /Skin type/ });
    await userEvent.tab();
    expect(document.activeElement).toBe(trigger);
    await userEvent.keyboard('{ArrowDown}');
    const listbox = screen.getByRole('listbox');
    // the chosen option has the focus
    expect(document.activeElement?.textContent).toBe('CombinationOily T-zone');
    expect(
      within(listbox).getByRole('option', { name: 'Sensitive' }).getAttribute('aria-disabled'),
    ).toBe('true');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    // Sensitive is disabled: still Combination (and Enter closed the list)
    expect(onChange).not.toHaveBeenCalled();
    // each step waits: on a slow machine (CI) the list is still closing or opening, and React
    // Aria gives the focus back to the field a frame after the list goes
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).toBeNull();
      expect(document.activeElement).toBe(trigger);
    });
    await userEvent.keyboard('{ArrowUp}');
    await waitFor(() => {
      expect(document.activeElement?.textContent).toBe('CombinationOily T-zone');
    });
    await userEvent.keyboard('{ArrowUp}');
    await waitFor(() => {
      expect(document.activeElement?.textContent).toBe('Oily');
    });
    await userEvent.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledExactlyOnceWith('oily');
  });

  it('clearable: a button empties it, only while something is chosen', async () => {
    const onChange = vi.fn();
    function Skin() {
      const [value, setValue] = useState<string | null>('dry');
      return (
        <Select
          label="Skin type"
          options={SKIN}
          value={value}
          onChange={(next) => {
            setValue(next);
            onChange(next);
          }}
          clearable
        />
      );
    }
    render(<Skin />);
    await userEvent.click(screen.getByRole('button', { name: 'Clear the choice' }));
    expect(onChange).toHaveBeenCalledExactlyOnceWith(null);
    expect(screen.queryByRole('button', { name: 'Clear the choice' })).toBeNull();
    expect(screen.getByRole('button', { name: /Skin type/ }).textContent).toContain(
      'Select an option',
    );
  });

  it('has no clear button when disabled', () => {
    render(<Select label="Skin type" options={SKIN} defaultValue="dry" clearable isDisabled />);
    expect(screen.queryByRole('button', { name: 'Clear the choice' })).toBeNull();
  });

  it('multiple: boxes, stays open, every choice in onChange and in the field', async () => {
    const onChange = vi.fn();
    function Concerns() {
      const [value, setValue] = useState<string[]>(['dry']);
      return (
        <Select
          label="Concerns"
          selectionMode="multiple"
          options={SKIN}
          value={value}
          onChange={(next) => {
            setValue(next);
            onChange(next);
          }}
        />
      );
    }
    render(<Concerns />);
    const trigger = screen.getByRole('button', { name: /Concerns/ });
    await userEvent.click(trigger);
    const listbox = screen.getByRole('listbox');
    expect(listbox.getAttribute('aria-multiselectable')).toBe('true');
    await userEvent.click(within(listbox).getByRole('option', { name: 'Oily' }));
    expect(screen.getByRole('listbox')).toBe(listbox);
    await userEvent.click(within(listbox).getByRole('option', { name: 'Dry' }));
    expect(onChange.mock.calls).toEqual([[['dry', 'oily']], [['oily']]]);
    await userEvent.keyboard('{Escape}');
    expect(trigger.textContent).toContain('Oily');
  });

  it('is described by its hint and its error, and invalid with an error', async () => {
    render(
      <Select label="Skin type" options={SKIN} hint="For the quiz" error="Choose one" isRequired />,
    );
    const trigger = screen.getByRole('button', { name: /Skin type/ });
    expect(described(trigger)).toContain('For the quiz');
    expect(described(trigger)).toContain('Choose one');
    expect(screen.getByText('*').getAttribute('aria-hidden')).toBe('true');
    await expectNoAxeViolations();
  });

  it('sends its value with a native form', async () => {
    render(
      <form data-testid="form">
        <Select label="Skin type" options={SKIN} name="skin" defaultValue="oily" />
      </form>,
    );
    await waitFor(() => {
      const data = new FormData(screen.getByTestId<HTMLFormElement>('form'));
      expect(data.get('skin')).toBe('oily');
    });
  });
});

const STATES: PickerOption[] = ['Assam', 'Goa', 'Karnataka', 'Kerala', 'Maharashtra'].map(
  (label) => ({ value: label.toLowerCase(), label }),
);

describe('ComboBox', () => {
  it('suggests what matches the typed text and chooses with the keyboard', async () => {
    const onChange = vi.fn();
    render(<ComboBox label="State" options={STATES} onChange={onChange} placeholder="Search" />);
    const input = screen.getByRole('combobox', { name: 'State' });
    await userEvent.type(input, 'ker');
    const listbox = screen.getByRole('listbox');
    expect(
      within(listbox)
        .getAllByRole('option')
        .map((option) => option.textContent),
    ).toEqual(['Kerala']);
    await expectNoAxeViolations();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onChange).toHaveBeenCalledExactlyOnceWith('kerala');
    expect(input).toHaveProperty('value', 'Kerala');
  });

  it('says so when nothing matches, and puts the chosen option back on blur', async () => {
    render(
      <>
        <ComboBox label="State" options={STATES} defaultValue="goa" />
        <button type="button">After</button>
      </>,
    );
    const input = screen.getByRole('combobox', { name: 'State' });
    expect(input).toHaveProperty('value', 'Goa');
    await userEvent.type(input, 'zz');
    expect(screen.getByRole('listbox').textContent).toBe('No matches');
    // the open list hides the rest of the page from screen readers, so by its text
    await userEvent.click(screen.getByText('After'));
    expect(input).toHaveProperty('value', 'Goa');
  });

  it('an emptied box empties the choice', async () => {
    const onChange = vi.fn();
    render(<ComboBox label="State" options={STATES} defaultValue="goa" onChange={onChange} />);
    await userEvent.clear(screen.getByRole('combobox', { name: 'State' }));
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('the button shows every option', async () => {
    render(<ComboBox label="State" options={STATES} />);
    await userEvent.click(screen.getByRole('button', { name: /^Show suggestions/ }));
    expect(within(screen.getByRole('listbox')).getAllByRole('option')).toHaveLength(5);
  });

  it('server search: hands over the text, shows the options as given, says when it is searching', async () => {
    const onSearch = vi.fn();
    const { rerender } = render(
      <ComboBox label="Brand" options={[]} onSearch={onSearch} loading />,
    );
    const input = screen.getByRole('combobox', { name: 'Brand' });
    await userEvent.type(input, 'gl');
    expect(onSearch).toHaveBeenLastCalledWith('gl');
    expect(screen.getByRole('listbox').textContent).toBe('Searching…');
    expect(input.closest('div')?.querySelector('.animate-spin')).not.toBeNull();
    // the server's answer is shown as it is, even what does not contain "gl"
    rerender(
      <ComboBox
        label="Brand"
        options={[
          { value: 'kesar', label: 'Kesar Glow' },
          { value: 'plum', label: 'Plum Petal' },
        ]}
        onSearch={onSearch}
      />,
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(
      within(screen.getByRole('listbox'))
        .getAllByRole('option')
        .map((option) => option.textContent),
    ).toEqual(['Kesar Glow', 'Plum Petal']);
    expect(input.closest('div')?.querySelector('.animate-spin')).toBeNull();
  });

  it('is described by its hint and error; disabled does nothing', async () => {
    const { rerender } = render(
      <ComboBox label="State" options={STATES} hint="Where you live" error="Choose a state" />,
    );
    const input = screen.getByRole('combobox', { name: 'State' });
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(described(input)).toContain('Where you live');
    expect(described(input)).toContain('Choose a state');
    await expectNoAxeViolations();
    rerender(<ComboBox label="State" options={STATES} isDisabled />);
    expect(input).toHaveProperty('disabled', true);
  });
});
