import { IconDanger } from '@beautinique/frontend-icons';
import type { ReactNode, Ref } from 'react';
import {
  CheckboxButton,
  CheckboxField,
  type CheckboxFieldProps,
  FieldError,
  Text,
} from 'react-aria-components';

import { cx } from './cx';

export interface CheckboxProps extends Omit<
  CheckboxFieldProps,
  'children' | 'className' | 'style'
> {
  /** The label, next to the box (clicking it toggles too). */
  children: ReactNode;
  /** A line under the label. */
  hint?: ReactNode;
  /** What is wrong; the checkbox is then invalid and described by it. */
  error?: ReactNode;
  className?: string;
  /** The outer element (label, hint, error); `inputRef` reaches the `<input>`. */
  ref?: Ref<HTMLDivElement>;
}

/**
 * A checkbox with its label (React Aria: keyboard, screen reader and touch behaviour; the styles
 * tokens for the look). Controlled with `isSelected` + `onChange`, or uncontrolled with
 * `defaultSelected`; `isIndeterminate` for "some of them"; `error` (or `isInvalid`) turns it red.
 *
 * ```tsx
 * <Checkbox isSelected={terms} onChange={setTerms} isRequired error={errors.terms}>
 *   I accept the terms
 * </Checkbox>
 * ```
 */
export function Checkbox({
  children,
  hint,
  error,
  className,
  ref,
  isInvalid,
  ...rest
}: CheckboxProps) {
  const hasError = error !== undefined && error !== null && error !== false && error !== '';
  return (
    <CheckboxField
      {...rest}
      ref={ref}
      isInvalid={isInvalid ?? hasError}
      className={cx('flex flex-col', className)}
    >
      <CheckboxButton className="group text-foreground min-h-touch flex cursor-pointer items-center gap-3 py-2 data-disabled:cursor-not-allowed data-disabled:opacity-50">
        {({ isSelected, isIndeterminate }) => (
          <>
            <span
              aria-hidden="true"
              className={cx(
                'border-border-strong bg-surface flex size-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors',
                'group-data-focus-visible:ring-focus-ring group-data-focus-visible:ring-2 group-data-focus-visible:ring-offset-2',
                'group-data-invalid:border-error',
                (isSelected || isIndeterminate) &&
                  'tone-brand bg-tone border-tone text-tone-foreground',
              )}
            >
              {isIndeterminate ? (
                <svg viewBox="0 0 16 16" className="size-3.5" fill="none">
                  <path
                    d="M3.5 8h9"
                    stroke="currentColor"
                    strokeWidth="2.25"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                isSelected && (
                  <svg viewBox="0 0 16 16" className="size-3.5" fill="none">
                    <path
                      d="M3.25 8.25 6.5 11.5l6.25-7"
                      stroke="currentColor"
                      strokeWidth="2.25"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )
              )}
            </span>
            <span>{children}</span>
          </>
        )}
      </CheckboxButton>
      {hint !== undefined && (
        <Text slot="description" className="text-foreground-muted -mt-1 ps-8 text-sm">
          {hint}
        </Text>
      )}
      {hasError && (
        <FieldError className="text-error-subtle-foreground flex items-start gap-1.5 ps-8 text-sm">
          <IconDanger aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </FieldError>
      )}
    </CheckboxField>
  );
}
