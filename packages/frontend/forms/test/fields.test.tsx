import { Radio } from '@beautinique/frontend-components';
import { array, enum as zodEnum, object, string } from '@beautinique/shared-zod';
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Form, RadioGroupField, SelectField, SubmitButton, useZodForm } from '../src/index';
import { expectNoAxeViolations } from './axe';

const SKIN = ['dry', 'oily', 'combination'] as const;
const profileZod = object({
  skin: zodEnum(SKIN, 'Choose your skin type'),
  delivery: zodEnum(['standard', 'express'], 'Choose a delivery speed'),
  concerns: array(string()).min(1, 'Choose at least one concern'),
});

const SKIN_OPTIONS = [
  { value: 'dry', label: 'Dry' },
  { value: 'oily', label: 'Oily' },
  { value: 'combination', label: 'Combination' },
];
const CONCERNS = [
  { value: 'acne', label: 'Acne' },
  { value: 'dullness', label: 'Dullness' },
];

function ProfileForm({ onSubmit }: { onSubmit: (values: unknown) => unknown }) {
  const form = useZodForm(profileZod, {
    // `undefined` until chosen: the schema then says what to do
    defaultValues: { skin: undefined, delivery: undefined, concerns: [] },
  });
  return (
    <Form form={form} onSubmit={onSubmit} aria-label="Beauty profile">
      <SelectField control={form.control} name="skin" label="Skin type" options={SKIN_OPTIONS} />
      <RadioGroupField control={form.control} name="delivery" label="Delivery">
        <Radio value="standard">Standard</Radio>
        <Radio value="express">Express</Radio>
      </RadioGroupField>
      <SelectField
        control={form.control}
        name="concerns"
        label="Concerns"
        selectionMode="multiple"
        options={CONCERNS}
      />
      <SubmitButton>Save</SubmitButton>
    </Form>
  );
}

/**
 * Opens a Select and picks an option from its list (the open list is the one thing screen readers
 * see; the hidden native `<select>` of the same name is not), then waits for it to close.
 */
async function choose(user: ReturnType<typeof userEvent.setup>, field: RegExp, option: string) {
  await user.click(screen.getByRole('button', { name: field }));
  const list = await screen.findByRole('listbox');
  await user.click(within(list).getByRole('option', { name: option }));
  await waitFor(() => {
    expect(screen.queryByRole('listbox')).toBeNull();
  });
}

afterEach(() => {
  cleanup();
});

describe('choice fields', () => {
  it('show their schema errors and focus the first one’s control', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ProfileForm onSubmit={onSubmit} />);
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Choose your skin type')).toBeTruthy();
    expect(screen.getByText('Choose a delivery speed')).toBeTruthy();
    expect(screen.getByText('Choose at least one concern')).toBeTruthy();
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('button', { name: /Skin type/ }));
    });
    expect(onSubmit).not.toHaveBeenCalled();
    await expectNoAxeViolations();
  });

  it('send what was chosen: one value, the radio, a list', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ProfileForm onSubmit={onSubmit} />);

    await choose(user, /Skin type/, 'Oily');
    await user.click(screen.getByRole('radio', { name: 'Express' }));
    await user.click(screen.getByRole('button', { name: /Concerns/ }));
    const list = await screen.findByRole('listbox');
    await user.click(within(list).getByRole('option', { name: 'Acne' }));
    await user.click(within(list).getByRole('option', { name: 'Dullness' }));
    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByRole('listbox')).toBeNull();
    });

    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        skin: 'oily',
        delivery: 'express',
        concerns: ['acne', 'dullness'],
      });
    });
  });

  it('a radio group takes the focus to its chosen radio when it is wrong', async () => {
    const user = userEvent.setup();
    render(<ProfileForm onSubmit={vi.fn()} />);
    await choose(user, /Skin type/, 'Dry');
    await user.click(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole('radio', { name: 'Standard' }));
    });
  });
});
