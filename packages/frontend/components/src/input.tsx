import { IconEye, IconEyeClosed } from '@beautinique/frontend-icons';
import { type InputHTMLAttributes, type ReactNode, type Ref, useState } from 'react';

import { cx } from './cx';
import { Field } from './field';

/** The box every text control shares: 44 px, a strong border, the focus ring around the box. */
export const CONTROL_BOX =
  'min-h-touch bg-surface text-foreground border-border-strong focus-ring-within flex w-full items-center rounded-lg border has-[[aria-invalid]]:border-error has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50';

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'children'
> {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  /** A decorative icon at the start of the box (search, email). */
  startIcon?: ReactNode;
  /** Something at the end of the box: a unit, a button. */
  end?: ReactNode;
  /** Classes of the outer field (label, box, hint). */
  className?: string;
  ref?: Ref<HTMLInputElement>;
}

/**
 * A labelled text box (DESIGN §4): label above, hint and error below (Field), 44 px tall, the
 * styles focus ring around the whole box. Every `<input>` attribute passes through.
 *
 * ```tsx
 * <Input label="Email" type="email" autoComplete="email" required error={errors.email} />
 * ```
 */
export function Input({
  label,
  hint,
  error,
  startIcon,
  end,
  className,
  id,
  required,
  ref,
  type = 'text',
  ...rest
}: InputProps) {
  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={required}
      id={id}
      className={className}
    >
      {(control) => (
        <div className={CONTROL_BOX}>
          {startIcon !== undefined && (
            <span aria-hidden="true" className="text-foreground-muted ps-3 inline-flex">
              {startIcon}
            </span>
          )}
          <input
            {...rest}
            {...control}
            ref={ref}
            type={type}
            className="placeholder:text-foreground-subtle h-full min-w-0 flex-1 bg-transparent px-3 py-2 outline-hidden disabled:cursor-not-allowed"
          />
          {end}
        </div>
      )}
    </Field>
  );
}

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'end'> {
  /** `current-password` to sign in, `new-password` to set one (password managers read it). */
  autoComplete: 'current-password' | 'new-password';
}

/**
 * A password box with a show/hide button (a pressed toggle, so screen readers hear its state).
 * Nothing is trimmed or checked here: that is the form's (shared-zod `passwordZod`).
 */
export function PasswordInput(props: PasswordInputProps) {
  const [shown, setShown] = useState(false);
  return (
    <Input
      {...props}
      type={shown ? 'text' : 'password'}
      // a shown password must not be offered to spell checkers or saved as text
      spellCheck={false}
      autoCapitalize="none"
      end={
        <button
          type="button"
          aria-label="Show password"
          aria-pressed={shown}
          disabled={props.disabled}
          onClick={() => {
            setShown((was) => !was);
          }}
          className="text-foreground-muted hover:text-foreground focus-ring size-touch inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg outline-hidden disabled:cursor-not-allowed"
        >
          {shown ? <IconEyeClosed size={20} /> : <IconEye size={20} />}
        </button>
      }
    />
  );
}

export interface CodeInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size' | 'children' | 'value' | 'onChange' | 'type' | 'maxLength'
> {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  value: string;
  onChange: (value: string) => void;
  /** Called once all digits are there (e.g. to send the code at once). */
  onComplete?: (value: string) => void;
  /** @default 6 */
  length?: number;
  className?: string;
  ref?: Ref<HTMLInputElement>;
}

/**
 * The email code and the authenticator code: digit boxes over one real `<input>` (one field for
 * screen readers, paste and the browser's one-time-code autofill work as in any input). Only
 * digits are kept, at most `length`.
 *
 * ```tsx
 * <CodeInput label="Code from the email" value={code} onChange={setCode} onComplete={verify} />
 * ```
 */
export function CodeInput({
  label,
  hint,
  error,
  value,
  onChange,
  onComplete,
  length = 6,
  className,
  id,
  required,
  disabled,
  ref,
  onFocus,
  onBlur,
  ...rest
}: CodeInputProps) {
  const [focused, setFocused] = useState(false);
  const digits = value.replace(/\D/g, '').slice(0, length);
  return (
    <Field
      label={label}
      hint={hint}
      error={error}
      required={required}
      id={id}
      className={className}
    >
      {(control) => (
        <div className="relative inline-flex w-fit gap-2">
          {Array.from({ length }, (_, index) => {
            const current = focused && index === Math.min(digits.length, length - 1);
            return (
              <span
                key={index}
                aria-hidden="true"
                className={cx(
                  'bg-surface text-foreground border-border-strong flex size-12 items-center justify-center rounded-lg border font-mono text-xl',
                  control['aria-invalid'] && 'border-error',
                  current && 'ring-focus-ring ring-2',
                  disabled && 'opacity-50',
                )}
              >
                {digits[index] ?? ''}
              </span>
            );
          })}
          <input
            {...rest}
            {...control}
            ref={ref}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={length}
            disabled={disabled}
            value={digits}
            onFocus={(event) => {
              setFocused(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setFocused(false);
              onBlur?.(event);
            }}
            onChange={(event) => {
              const next = event.target.value.replace(/\D/g, '').slice(0, length);
              onChange(next);
              if (next.length === length && digits.length !== length) onComplete?.(next);
            }}
            // over the boxes, invisible: clicks and taps land on it, the caret is not drawn
            className="absolute inset-0 h-full w-full cursor-text bg-transparent text-transparent caret-transparent opacity-0 outline-hidden disabled:cursor-not-allowed"
          />
        </div>
      )}
    </Field>
  );
}
