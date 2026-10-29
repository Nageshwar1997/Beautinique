import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CodeInput, Field, Input, PasswordInput } from '../src/index';
import { expectNoAxeViolations } from './axe';

afterEach(() => {
  cleanup();
});

describe('Field', () => {
  it('labels the control and describes it by the hint and the error', async () => {
    render(
      <Field label="Shade" hint="As on the pack" error="Pick a shade" required>
        {(control) => <input {...control} />}
      </Field>,
    );
    const input = screen.getByRole('textbox', { name: 'Shade' });
    const [hintId, errorId] = (input.getAttribute('aria-describedby') ?? '').split(' ');
    expect(document.getElementById(hintId ?? '')?.textContent).toBe('As on the pack');
    expect(document.getElementById(errorId ?? '')?.textContent).toBe('Pick a shade');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.hasAttribute('required')).toBe(true);
    // the asterisk is only for eyes: "required" is said by the input itself
    expect(screen.getByText('*').getAttribute('aria-hidden')).toBe('true');
    await expectNoAxeViolations();
  });

  it('with no hint and no error the control is not described and not invalid', () => {
    render(<Field label="Name">{(control) => <input {...control} />}</Field>);
    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(input.hasAttribute('aria-describedby')).toBe(false);
    expect(input.hasAttribute('aria-invalid')).toBe(false);
    expect(input.hasAttribute('required')).toBe(false);
    expect(screen.queryByText('*')).toBeNull();
  });

  it('an empty or false error is no error', () => {
    for (const error of ['', false, null]) {
      const { unmount } = render(
        <Field label="Name" error={error}>
          {(control) => <input {...control} />}
        </Field>,
      );
      expect(screen.getByRole('textbox').hasAttribute('aria-invalid')).toBe(false);
      unmount();
    }
  });

  it('uses the given id, and a different own id per field otherwise', () => {
    render(
      <>
        <Field label="A" id="email">
          {(control) => <input {...control} />}
        </Field>
        <Field label="B">{(control) => <input {...control} />}</Field>
        <Field label="C">{(control) => <input {...control} />}</Field>
      </>,
    );
    expect(screen.getByRole('textbox', { name: 'A' }).id).toBe('email');
    expect(screen.getByRole('textbox', { name: 'B' }).id).not.toBe(
      screen.getByRole('textbox', { name: 'C' }).id,
    );
  });
});

describe('Input', () => {
  it('is a labelled text box; attributes, the ref and typing pass through', async () => {
    const ref = createRef<HTMLInputElement>();
    const onChange = vi.fn();
    render(
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        hint="We send the code here"
        ref={ref}
        onChange={onChange}
        startIcon={<svg data-testid="start" />}
        end={<span>@</span>}
        className="mb-2"
      />,
    );
    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(ref.current).toBe(input);
    expect(input.getAttribute('type')).toBe('email');
    expect(input.getAttribute('autocomplete')).toBe('email');
    expect(screen.getByTestId('start').parentElement?.getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByText('@')).not.toBeNull();
    expect(input.closest('.mb-2')).not.toBeNull();
    await userEvent.type(input, 'a@b.in');
    expect(input).toHaveProperty('value', 'a@b.in');
    expect(onChange).toHaveBeenCalledTimes(6);
    await expectNoAxeViolations();
  });

  it('is type text by default and shows the error', () => {
    render(<Input label="Name" error="Enter your name" />);
    const input = screen.getByRole('textbox', { name: 'Name' });
    expect(input.getAttribute('type')).toBe('text');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByText('Enter your name')).not.toBeNull();
  });
});

describe('PasswordInput', () => {
  it('hides the password until the pressed toggle shows it, and back', async () => {
    render(<PasswordInput label="Password" autoComplete="current-password" />);
    const input = screen.getByLabelText('Password', { selector: 'input' });
    const toggle = screen.getByRole('button', { name: 'Show password' });
    expect(input.getAttribute('type')).toBe('password');
    expect(input.getAttribute('autocomplete')).toBe('current-password');
    expect(input.getAttribute('spellcheck')).toBe('false');
    expect(input.getAttribute('autocapitalize')).toBe('none');
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    expect(toggle).toHaveProperty('type', 'button');

    await userEvent.type(input, 'secret pass');
    await userEvent.click(toggle);
    expect(input.getAttribute('type')).toBe('text');
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    // nothing is trimmed here: that is the form's job
    expect(input).toHaveProperty('value', 'secret pass');

    await userEvent.click(toggle);
    expect(input.getAttribute('type')).toBe('password');
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    await expectNoAxeViolations();
  });

  it('a disabled password box has a disabled toggle', () => {
    render(<PasswordInput label="Password" autoComplete="new-password" disabled />);
    expect(screen.getByRole('button', { name: 'Show password' })).toHaveProperty('disabled', true);
  });
});

function Code({ onComplete, length }: { onComplete?: (value: string) => void; length?: number }) {
  const [value, setValue] = useState('');
  return (
    <CodeInput
      label="Code from the email"
      value={value}
      onChange={setValue}
      {...(onComplete === undefined ? {} : { onComplete })}
      {...(length === undefined ? {} : { length })}
    />
  );
}

describe('CodeInput', () => {
  it('is one input for one-time codes, with a box per digit', async () => {
    const { container } = render(<Code />);
    const input = screen.getByRole('textbox', { name: 'Code from the email' });
    expect(input.getAttribute('autocomplete')).toBe('one-time-code');
    expect(input.getAttribute('inputmode')).toBe('numeric');
    expect(input.getAttribute('maxlength')).toBe('6');
    const boxes = container.querySelectorAll('span[aria-hidden="true"]');
    expect(boxes).toHaveLength(6);
    await expectNoAxeViolations();
  });

  it('keeps only digits and calls onComplete once, when the last one comes', async () => {
    const onComplete = vi.fn();
    const { container } = render(<Code onComplete={onComplete} />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, '1a2-3 45');
    expect(input).toHaveProperty('value', '12345');
    expect(onComplete).not.toHaveBeenCalled();
    await userEvent.type(input, '6');
    expect(onComplete).toHaveBeenCalledExactlyOnceWith('123456');
    const boxes = [...container.querySelectorAll('span[aria-hidden="true"]')];
    expect(boxes.map((box) => box.textContent).join('')).toBe('123456');
    // a seventh digit is not taken, and a full code does not complete again
    await userEvent.type(input, '7');
    expect(input).toHaveProperty('value', '123456');
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it('a pasted code is cut to its length and completes at once', () => {
    const onComplete = vi.fn();
    render(<Code onComplete={onComplete} length={4} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: ' 98-76 54' } });
    expect(input).toHaveProperty('value', '9876');
    expect(onComplete).toHaveBeenCalledExactlyOnceWith('9876');
  });

  it('marks the box where the next digit goes while focused, and only then', async () => {
    const { container } = render(<Code />);
    const input = screen.getByRole('textbox');
    const ringed = () =>
      [...container.querySelectorAll('span[aria-hidden="true"]')].findIndex((box) =>
        box.classList.contains('ring-2'),
      );
    expect(ringed()).toBe(-1);
    await userEvent.click(input);
    expect(ringed()).toBe(0);
    await userEvent.type(input, '12');
    expect(ringed()).toBe(2);
    await userEvent.type(input, '3456');
    // full: the last box stays marked
    expect(ringed()).toBe(5);
    await userEvent.tab();
    expect(ringed()).toBe(-1);
  });

  it('shows its error on every box and is invalid', () => {
    const { container } = render(
      <CodeInput label="Code" value="12" onChange={vi.fn()} error="That code is wrong" />,
    );
    expect(screen.getByRole('textbox').getAttribute('aria-invalid')).toBe('true');
    const boxes = container.querySelectorAll('span[aria-hidden="true"].border-error');
    expect(boxes).toHaveLength(6);
  });

  it('passes its own onFocus and onBlur on', async () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    render(
      <CodeInput label="Code" value="" onChange={vi.fn()} onFocus={onFocus} onBlur={onBlur} />,
    );
    await userEvent.click(screen.getByRole('textbox'));
    await userEvent.tab();
    expect(onFocus).toHaveBeenCalledOnce();
    expect(onBlur).toHaveBeenCalledOnce();
  });
});
