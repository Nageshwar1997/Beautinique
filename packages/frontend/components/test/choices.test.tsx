import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Checkbox, Radio, RadioGroup } from '../src/index';
import { expectNoAxeViolations } from './axe';

afterEach(() => {
  cleanup();
});

const described = (element: HTMLElement) =>
  (element.getAttribute('aria-describedby') ?? '')
    .split(' ')
    .map((id) => document.getElementById(id)?.textContent ?? '')
    .join(' | ');

describe('Checkbox', () => {
  it('toggles by click on the label and by Space, controlled', async () => {
    const onChange = vi.fn();
    function Terms() {
      const [on, setOn] = useState(false);
      return (
        <Checkbox
          isSelected={on}
          onChange={(next) => {
            setOn(next);
            onChange(next);
          }}
        >
          I accept the terms
        </Checkbox>
      );
    }
    render(<Terms />);
    const box = screen.getByRole('checkbox', { name: 'I accept the terms' });
    expect(box).toHaveProperty('checked', false);
    await userEvent.click(screen.getByText('I accept the terms'));
    expect(box).toHaveProperty('checked', true);
    await userEvent.keyboard(' ');
    expect(box).toHaveProperty('checked', false);
    expect(onChange.mock.calls).toEqual([[true], [false]]);
    await expectNoAxeViolations();
  });

  it('draws the check when selected and the dash when indeterminate', () => {
    const { container, rerender } = render(<Checkbox isSelected>All</Checkbox>);
    const mark = () => container.querySelector('path')?.getAttribute('d') ?? null;
    expect(mark()).toContain('6.5 11.5');
    rerender(
      <Checkbox isSelected={false} isIndeterminate>
        All
      </Checkbox>,
    );
    expect(mark()).toBe('M3.5 8h9');
    expect(screen.getByRole('checkbox')).toHaveProperty('indeterminate', true);
    rerender(<Checkbox isSelected={false}>All</Checkbox>);
    expect(mark()).toBeNull();
  });

  it('is described by its hint and its error, and invalid with an error', async () => {
    render(
      <Checkbox hint="You can unsubscribe any time" error="Please accept to go on" isRequired>
        Send me offers
      </Checkbox>,
    );
    const box = screen.getByRole('checkbox', { name: 'Send me offers' });
    expect(box.getAttribute('aria-invalid')).toBe('true');
    expect(described(box)).toContain('You can unsubscribe any time');
    expect(described(box)).toContain('Please accept to go on');
    expect(box.hasAttribute('required')).toBe(true);
    await expectNoAxeViolations();
  });

  it('without an error it is valid; isInvalid alone still marks it', () => {
    const { rerender } = render(<Checkbox error="">Offers</Checkbox>);
    expect(screen.getByRole('checkbox').hasAttribute('aria-invalid')).toBe(false);
    rerender(<Checkbox isInvalid>Offers</Checkbox>);
    expect(screen.getByRole('checkbox').getAttribute('aria-invalid')).toBe('true');
  });

  it('disabled does not toggle; ref, inputRef and className pass through', async () => {
    const ref = createRef<HTMLDivElement>();
    const inputRef = createRef<HTMLInputElement>();
    render(
      <Checkbox isDisabled ref={ref} inputRef={inputRef} className="mt-3" name="news" value="yes">
        News
      </Checkbox>,
    );
    const box = screen.getByRole('checkbox', { name: 'News' });
    await userEvent.click(screen.getByText('News'));
    expect(box).toHaveProperty('checked', false);
    expect(box).toHaveProperty('disabled', true);
    expect(inputRef.current).toBe(box);
    expect(ref.current?.classList).toContain('mt-3');
    expect(box.getAttribute('name')).toBe('news');
  });
});

function Delivery({ error, onChange }: { error?: string; onChange?: (value: string) => void }) {
  const [value, setValue] = useState('standard');
  return (
    <RadioGroup
      label="Delivery"
      hint="Free above ₹499"
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
      {...(error === undefined ? {} : { error })}
    >
      <Radio value="standard" hint="3–5 days">
        Standard
      </Radio>
      <Radio value="express" hint="1–2 days">
        Express
      </Radio>
      <Radio value="same-day" isDisabled>
        Same day
      </Radio>
    </RadioGroup>
  );
}

describe('RadioGroup + Radio', () => {
  it('a labelled group, described by its hint; each option by its own hint', async () => {
    render(<Delivery />);
    const group = screen.getByRole('radiogroup', { name: 'Delivery' });
    expect(described(group)).toBe('Free above ₹499');
    // React Aria describes each option by its own hint and the group's
    expect(described(screen.getByRole('radio', { name: 'Express' }))).toBe(
      '1–2 days | Free above ₹499',
    );
    expect(described(screen.getByRole('radio', { name: 'Same day' }))).toBe('Free above ₹499');
    await expectNoAxeViolations();
  });

  it('one tab stop; arrows move and choose, skipping the disabled option', async () => {
    const onChange = vi.fn();
    render(
      <>
        <Delivery onChange={onChange} />
        <button type="button">After</button>
      </>,
    );
    await userEvent.tab();
    const standard = screen.getByRole('radio', { name: 'Standard' });
    const express = screen.getByRole('radio', { name: 'Express' });
    expect(document.activeElement).toBe(standard);
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(express);
    expect(express).toHaveProperty('checked', true);
    // the disabled "Same day" is skipped: back round to the first
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(standard);
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'After' }));
    expect(onChange.mock.calls).toEqual([['express'], ['standard']]);
  });

  it('a click chooses; a disabled option cannot be chosen', async () => {
    render(<Delivery />);
    await userEvent.click(screen.getByText('Express'));
    expect(screen.getByRole('radio', { name: 'Express' })).toHaveProperty('checked', true);
    await userEvent.click(screen.getByText('Same day'));
    expect(screen.getByRole('radio', { name: 'Same day' })).toHaveProperty('checked', false);
  });

  it('with an error the group is invalid and says what is wrong', async () => {
    render(<Delivery error="Choose a delivery speed" />);
    const group = screen.getByRole('radiogroup');
    expect(group.getAttribute('aria-invalid')).toBe('true');
    expect(described(group)).toContain('Choose a delivery speed');
    await expectNoAxeViolations();
  });

  it('lays out in a row when horizontal; ref and className pass through', () => {
    const ref = createRef<HTMLDivElement>();
    const optionRef = createRef<HTMLDivElement>();
    render(
      <RadioGroup label="Size" orientation="horizontal" ref={ref} className="my-2">
        <Radio value="s" ref={optionRef} className="pe-2">
          S
        </Radio>
        <Radio value="m">M</Radio>
      </RadioGroup>,
    );
    expect(ref.current?.classList).toContain('my-2');
    expect(ref.current?.getAttribute('aria-orientation')).toBe('horizontal');
    expect(screen.getByText('S').closest('.flex-row')).not.toBeNull();
    expect(optionRef.current?.classList).toContain('pe-2');
  });
});
