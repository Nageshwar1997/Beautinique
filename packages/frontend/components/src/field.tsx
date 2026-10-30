import { IconDanger } from '@beautinique/frontend-icons';
import { type ReactNode, useId } from 'react';

import { cx } from './cx';

/** What a field gives its control: its id and how it is described. */
export interface FieldControlProps {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
  required?: boolean;
}

export interface FieldProps {
  /** The visible label: every control has one (placeholder text is not a label). */
  label: ReactNode;
  /** Help under the control, e.g. "At least 12 characters". */
  hint?: ReactNode;
  /** What is wrong; the control is then `aria-invalid` and described by it. */
  error?: ReactNode;
  required?: boolean;
  /** The control's id; one is made when left out. */
  id?: string;
  className?: string;
  children: (control: FieldControlProps) => ReactNode;
}

/**
 * Label, control, hint and error in one place, wired for screen readers (the control is labelled
 * by the label and described by the hint and the error). Inputs use it; a custom control gets the
 * same through `children`.
 *
 * ```tsx
 * <Field label="Shade name" hint="As on the pack" error={errors.shade}>
 *   {(control) => <MyControl {...control} />}
 * </Field>
 * ```
 */
export function Field({ label, hint, error, required, id, className, children }: FieldProps) {
  const own = useId();
  const controlId = id ?? own;
  const hintId = `${controlId}-hint`;
  const errorId = `${controlId}-error`;
  const hasError = error !== undefined && error !== null && error !== false && error !== '';
  const describedBy =
    [hint !== undefined && hintId, hasError && errorId].filter(Boolean).join(' ') || undefined;
  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      <label htmlFor={controlId} className="text-foreground text-sm font-medium">
        {label}
        {required && (
          <span aria-hidden="true" className="text-error ms-0.5">
            *
          </span>
        )}
      </label>
      {children({
        id: controlId,
        'aria-describedby': describedBy,
        ...(hasError ? { 'aria-invalid': true as const } : {}),
        ...(required ? { required: true } : {}),
      })}
      {hint !== undefined && (
        <p id={hintId} className="text-foreground-muted text-sm">
          {hint}
        </p>
      )}
      {hasError && (
        <p id={errorId} className="text-error-subtle-foreground flex items-start gap-1.5 text-sm">
          <IconDanger aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
