// Pieces the pickers share (not exported from the package): the field's label, hint and error on
// React Aria's slots, the box a picker opens, and one option of a list.
import { IconDanger } from '@beautinique/frontend-icons';
import type { ReactNode } from 'react';
import { FieldError, Label, ListBoxItem, Text } from 'react-aria-components';

import { cx } from './cx';

/** One choice of a Select or a ComboBox. `value` is what the form gets; `label` what people see. */
export interface PickerOption {
  value: string;
  label: string;
  /** A second line, e.g. "3–5 days". */
  description?: string;
  disabled?: boolean;
}

/** An error worth showing: not undefined, null, false or ''. */
export const hasError = (error: ReactNode): boolean =>
  error !== undefined && error !== null && error !== false && error !== '';

/** The label of a React Aria field (its `Label` slot), with the asterisk of a required one. */
export function FieldLabel({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <Label className="text-foreground text-sm font-medium">
      {children}
      {required && (
        <span aria-hidden="true" className="text-error ms-0.5">
          *
        </span>
      )}
    </Label>
  );
}

/** The hint under a React Aria field (its `description` slot: the field is described by it). */
export function FieldHint({ children }: { children?: ReactNode }) {
  if (children === undefined) return null;
  return (
    <Text slot="description" className="text-foreground-muted text-sm">
      {children}
    </Text>
  );
}

/**
 * The props that make a React Aria field invalid: our `error` (or `isInvalid`) when there is one;
 * otherwise nothing, so its own checks (a date before `minValue`, an unavailable day) still count.
 * `aria` validation: shown as the value changes, in the field's English words, never the
 * browser's (which follow the browser's language).
 */
export const invalidProps = (isInvalid: boolean | undefined, error: ReactNode) => ({
  validationBehavior: 'aria' as const,
  ...(isInvalid !== undefined ? { isInvalid } : hasError(error) ? { isInvalid: true } : {}),
});

/**
 * The error under a React Aria field, shown while the field is invalid: our `error`, or else the
 * field's own message (e.g. "Value must be 30/10/2026 or later.").
 */
export function FieldErrorText({ error }: { error?: ReactNode }) {
  return (
    <FieldError className="text-error-subtle-foreground flex items-start gap-1.5 text-sm">
      {({ validationErrors }) => {
        const message = hasError(error) ? error : validationErrors.join(' ');
        if (!hasError(message)) return null;
        return (
          <>
            <IconDanger aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <span>{message}</span>
          </>
        );
      }}
    </FieldError>
  );
}

/** The box a picker opens: a surface over the page, its own scroll, the styles fade. */
export const POPOVER =
  'bg-surface text-foreground border-border overflow-auto rounded-xl border shadow-lg outline-hidden data-entering:animate-fade-in data-exiting:animate-fade-out';

/** The button that opens a picker: the text-field box (44 px, strong border), the focus ring on it. */
export const TRIGGER =
  'min-h-touch bg-surface text-foreground border-border-strong focus-ring flex w-full cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-start data-disabled:cursor-not-allowed data-disabled:opacity-50 group-data-invalid:border-error';

/** A tick, in the current text colour. */
export function CheckMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={cx('size-4 shrink-0', className)}
    >
      <path
        d="M3.25 8.25 6.5 11.5l6.25-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The square of a multiple choice: empty, ticked, or a dash for "some of them". */
export function CheckBoxMark({
  checked,
  mixed = false,
  dim = false,
}: {
  checked: boolean;
  mixed?: boolean;
  dim?: boolean;
}) {
  const on = checked || mixed;
  return (
    <span
      aria-hidden="true"
      className={cx(
        'border-border-strong bg-surface flex size-5 shrink-0 items-center justify-center rounded-md border-2',
        on && 'tone-brand bg-tone border-tone text-tone-foreground',
        dim && 'opacity-60',
      )}
    >
      {mixed ? (
        <svg viewBox="0 0 16 16" className="size-3.5" fill="none">
          <path d="M3.5 8h9" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
        </svg>
      ) : (
        checked && <CheckMark className="size-3.5" />
      )}
    </span>
  );
}

/** Classes of one row of a list: 44 px, the focused row tinted, a ring for keyboard focus. */
export const ROW =
  'text-foreground min-h-touch flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 outline-hidden data-disabled:cursor-not-allowed data-disabled:opacity-50 data-focused:bg-surface-muted data-hovered:bg-surface-muted data-focus-visible:ring-focus-ring data-focus-visible:ring-2 data-focus-visible:ring-inset';

/** One option of a ListBox (Select, ComboBox): a box for multiple choice, a tick for one. */
export function OptionItem({ option }: { option: PickerOption }) {
  return (
    <ListBoxItem
      id={option.value}
      textValue={option.label}
      isDisabled={option.disabled ?? false}
      className={ROW}
    >
      {({ isSelected, selectionMode }) => (
        <>
          {selectionMode === 'multiple' && <CheckBoxMark checked={isSelected} />}
          <span className="flex min-w-0 flex-1 flex-col">
            <Text slot="label" className={cx('truncate', isSelected && 'font-medium')}>
              {option.label}
            </Text>
            {option.description !== undefined && (
              <Text slot="description" className="text-foreground-muted text-sm">
                {option.description}
              </Text>
            )}
          </span>
          {selectionMode !== 'multiple' && isSelected && <CheckMark className="text-brand" />}
        </>
      )}
    </ListBoxItem>
  );
}

/** What an empty list says. */
export function EmptyList({ children }: { children: ReactNode }) {
  return <p className="text-foreground-muted px-3 py-4 text-center text-sm">{children}</p>;
}
