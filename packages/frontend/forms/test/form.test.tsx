import { ApiError } from '@beautinique/frontend-api-client';
import { boolean, emailZod, object, otpZod, passwordZod } from '@beautinique/shared-zod';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  CheckboxField,
  CodeField,
  type ErrorFields,
  Form,
  PasswordField,
  SubmitButton,
  TextField,
  useZodForm,
} from '../src/index';
import { expectNoAxeViolations } from './axe';

const signUpZod = object({
  email: emailZod,
  password: passwordZod,
  code: otpZod,
  consent: object({
    terms: boolean().refine((accepted) => accepted, 'Accept the terms and privacy notice'),
  }),
});
type SignUp = typeof signUpZod;

function SignUpForm({
  onSubmit,
  errorFields,
}: {
  onSubmit: (values: ReturnType<SignUp['parse']>) => unknown;
  errorFields?: ErrorFields<{
    email: string;
    password: string;
    code: string;
    consent: { terms: boolean };
  }>;
}) {
  const form = useZodForm(signUpZod, {
    defaultValues: { email: '', password: '', code: '', consent: { terms: false } },
  });
  return (
    <Form form={form} onSubmit={onSubmit} errorFields={errorFields} aria-label="Create an account">
      <TextField
        control={form.control}
        name="email"
        label="Email"
        type="email"
        autoComplete="email"
      />
      <PasswordField
        control={form.control}
        name="password"
        label="Password"
        autoComplete="new-password"
      />
      <CodeField control={form.control} name="code" label="Code from the email" />
      <CheckboxField control={form.control} name="consent.terms">
        I accept the terms and privacy notice
      </CheckboxField>
      <SubmitButton>Create account</SubmitButton>
    </Form>
  );
}

const email = () => screen.getByLabelText('Email');
const password = () => screen.getByLabelText('Password');
const code = () => screen.getByLabelText('Code from the email');
const terms = () => screen.getByRole('checkbox', { name: /I accept the terms/ });
const submit = () => screen.getByRole('button', { name: 'Create account' });
const alertText = () => screen.getByRole('alert').textContent;

async function fillIn(user: ReturnType<typeof userEvent.setup>) {
  await user.type(email(), '  Asha@Beautinique.Example ');
  await user.type(password(), 'correct horse battery');
  await user.type(code(), '123456');
  await user.click(terms());
}

const setOnline = (online: boolean) => {
  Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => online });
  act(() => {
    window.dispatchEvent(new Event(online ? 'online' : 'offline'));
  });
};

afterEach(() => {
  cleanup();
  setOnline(true);
});

describe('Form', () => {
  it('checks every field on submit, puts each message under its field, and focuses the first', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<SignUpForm onSubmit={onSubmit} />);
    expect(screen.queryByText('Enter your email address')).toBeNull();

    await user.click(submit());

    expect(await screen.findByText('Enter your email address')).toBeTruthy();
    expect(screen.getByText('Enter a password')).toBeTruthy();
    expect(screen.getByText('Enter the 6-digit code')).toBeTruthy();
    expect(screen.getByText('Accept the terms and privacy notice')).toBeTruthy();
    expect(email().getAttribute('aria-invalid')).toBe('true');
    expect(email().getAttribute('aria-describedby')).toContain(
      screen.getByText('Enter your email address').closest('p')?.id,
    );
    await waitFor(() => {
      expect(document.activeElement).toBe(email());
    });
    expect(onSubmit).not.toHaveBeenCalled();
    // the browser's own bubbles are off: their text is the browser's, ours is on the field
    expect(screen.getByRole('form').hasAttribute('novalidate')).toBe(true);
  });

  it('checks a field first when it is left, then at every change', async () => {
    const user = userEvent.setup();
    render(<SignUpForm onSubmit={vi.fn()} />);

    await user.type(email(), 'asha@');
    expect(screen.queryByText('Enter a valid email address')).toBeNull();
    await user.tab();
    expect(await screen.findByText('Enter a valid email address')).toBeTruthy();

    await user.type(email(), 'beautinique.example');
    await waitFor(() => {
      expect(screen.queryByText('Enter a valid email address')).toBeNull();
    });
  });

  it('submits the schema’s output: trimmed and lower-cased as the schema says', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<SignUpForm onSubmit={onSubmit} />);
    await fillIn(user);
    await user.click(submit());
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'asha@beautinique.example',
        password: 'correct horse battery',
        code: '123456',
        consent: { terms: true },
      });
    });
  });

  it('shows the server’s field problems on their fields, and the rest above the form', async () => {
    const user = userEvent.setup();
    const onSubmit = vi
      .fn()
      .mockRejectedValueOnce(
        new ApiError({
          code: 'VALIDATION_FAILED',
          message: 'Some fields are not valid.',
          status: 400,
          details: [
            { path: ['email'], message: 'This email cannot be used' },
            { path: ['consent', 'terms'], message: 'Accept the terms first' },
          ],
        }),
      )
      .mockRejectedValueOnce(
        new ApiError({
          code: 'VALIDATION_FAILED',
          message: 'Some fields are not valid.',
          status: 400,
          details: [{ path: ['nickname'], message: 'Too long' }],
        }),
      );
    render(<SignUpForm onSubmit={onSubmit} />);
    await fillIn(user);

    await user.click(submit());
    expect(await screen.findByText('This email cannot be used')).toBeTruthy();
    expect(screen.getByText('Accept the terms first')).toBeTruthy();
    expect(alertText()).toBe('');
    await waitFor(() => {
      expect(document.activeElement).toBe(email());
    });

    // a problem with no field of its own goes above the form, with the server's sentence
    await user.click(submit());
    await waitFor(() => {
      expect(alertText()).toBe('Some fields are not valid.');
    });
  });

  it('puts an error code on the field it belongs to, and focuses it', async () => {
    const user = userEvent.setup();
    const onSubmit = vi
      .fn()
      .mockRejectedValue(
        new ApiError({ code: 'OTP_INVALID', message: 'That code is not right.', status: 400 }),
      );
    render(<SignUpForm onSubmit={onSubmit} errorFields={{ OTP_INVALID: 'code' }} />);
    await fillIn(user);
    await user.click(submit());
    expect(await screen.findByText('That code is not right.')).toBeTruthy();
    expect(code().getAttribute('aria-invalid')).toBe('true');
    expect(alertText()).toBe('');
    await waitFor(() => {
      expect(document.activeElement).toBe(code());
    });
  });

  it('shows any other failure above the form, read out, and clears it on the next submit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi
      .fn()
      .mockRejectedValueOnce(
        new ApiError({
          code: 'INVALID_CREDENTIALS',
          message: 'The email or password is not right.',
          status: 401,
        }),
      )
      .mockRejectedValueOnce(
        new ApiError({
          code: 'NETWORK_ERROR',
          message: 'The server could not be reached',
          status: 0,
        }),
      )
      .mockRejectedValueOnce(new TypeError('boom'))
      .mockResolvedValueOnce(undefined);
    render(<SignUpForm onSubmit={onSubmit} />);
    await fillIn(user);

    await user.click(submit());
    await waitFor(() => {
      expect(alertText()).toBe('The email or password is not right.');
    });
    await user.click(submit());
    await waitFor(() => {
      expect(alertText()).toBe(
        'We could not reach Beautinique. Check your connection and try again.',
      );
    });
    await user.click(submit());
    await waitFor(() => {
      expect(alertText()).toBe('Something went wrong. Please try again.');
    });
    await user.click(submit());
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(4);
    });
    expect(alertText()).toBe('');
  });

  it('has no axe problems with every error showing', async () => {
    const user = userEvent.setup();
    render(
      <SignUpForm
        onSubmit={() => Promise.reject(new ApiError({ code: 'X', message: 'No', status: 400 }))}
      />,
    );
    await user.click(submit());
    await screen.findByText('Enter your email address');
    await expectNoAxeViolations();
    await fillIn(user);
    await user.click(submit());
    await waitFor(() => {
      expect(alertText()).toBe('No');
    });
    await expectNoAxeViolations();
  });
});

describe('SubmitButton', () => {
  it('is busy while the submit runs, and a second press sends nothing', async () => {
    const user = userEvent.setup();
    let finish: () => void = () => undefined;
    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        }),
    );
    render(<SignUpForm onSubmit={onSubmit} />);
    await fillIn(user);
    await user.click(submit());
    await waitFor(() => {
      expect(submit().getAttribute('aria-busy')).toBe('true');
    });
    await user.click(submit());
    expect(onSubmit).toHaveBeenCalledTimes(1);
    act(() => {
      finish();
    });
    await waitFor(() => {
      expect(submit().getAttribute('aria-busy')).toBeNull();
    });
  });

  it('says so while the device is offline, and stays pressable', async () => {
    render(<SignUpForm onSubmit={vi.fn()} />);
    expect(screen.getByRole('status').textContent).toBe('');
    setOnline(false);
    await waitFor(() => {
      expect(screen.getByRole('status').textContent).toBe(
        'You are offline. This will work once you are back online.',
      );
    });
    expect(submit().getAttribute('aria-describedby')).toBe(screen.getByRole('status').id);
    expect(submit().hasAttribute('disabled')).toBe(false);
    setOnline(true);
  });
});
