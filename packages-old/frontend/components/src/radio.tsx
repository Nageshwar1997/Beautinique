import { IconDanger } from '@beautinique/frontend-icons';
import type { ReactNode, Ref } from 'react';
import {
  FieldError,
  Label,
  RadioButton,
  RadioField,
  type RadioFieldProps,
  RadioGroup as AriaRadioGroup,
  type RadioGroupProps as AriaRadioGroupProps,
  Text,
} from 'react-aria-components';

import { cx } from './cx';

export interface RadioGroupProps extends Omit<
  AriaRadioGroupProps,
  'children' | 'className' | 'style'
> {
  /** The question, above the options. */
  label: ReactNode;
  hint?: ReactNode;
  /** What is wrong; the group is then invalid and described by it. */
  error?: ReactNode;
  children: ReactNode;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * One choice out of a few, all visible (React Aria: arrow keys move and choose, one tab stop).
 * Controlled with `value` + `onChange`, or `defaultValue`. Its options are `<Radio>`s.
 *
 * ```tsx
 * <RadioGroup label="Delivery" value={speed} onChange={setSpeed}>
 *   <Radio value="standard">Standard</Radio>
 *   <Radio value="express">Express</Radio>
 * </RadioGroup>
 * ```
 */
export function RadioGroup({
  label,
  hint,
  error,
  children,
  className,
  ref,
  isInvalid,
  orientation = 'vertical',
  ...rest
}: RadioGroupProps) {
  const hasError = error !== undefined && error !== null && error !== false && error !== '';
  return (
    <AriaRadioGroup
      {...rest}
      ref={ref}
      orientation={orientation}
      isInvalid={isInvalid ?? hasError}
      className={cx('flex flex-col gap-1.5', className)}
    >
      <Label className="text-foreground text-sm font-medium">{label}</Label>
      <div
        className={cx(
          'flex',
          orientation === 'horizontal' ? 'flex-row flex-wrap gap-x-6' : 'flex-col',
        )}
      >
        {children}
      </div>
      {hint !== undefined && (
        <Text slot="description" className="text-foreground-muted text-sm">
          {hint}
        </Text>
      )}
      {hasError && (
        <FieldError className="text-error-subtle-foreground flex items-start gap-1.5 text-sm">
          <IconDanger aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>{error}</span>
        </FieldError>
      )}
    </AriaRadioGroup>
  );
}

export interface RadioProps extends Omit<RadioFieldProps, 'children' | 'className' | 'style'> {
  /** The option's label. */
  children: ReactNode;
  /** A line under the label (e.g. "1–2 days"); the option is described by it. */
  hint?: ReactNode;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/** One option of a RadioGroup, with its label (and a hint under it). */
export function Radio({ children, hint, className, ref, ...rest }: RadioProps) {
  return (
    <RadioField {...rest} ref={ref} className={cx('flex flex-col', className)}>
      <RadioButton className="group text-foreground min-h-touch flex cursor-pointer items-center gap-3 py-2 data-disabled:cursor-not-allowed data-disabled:opacity-50">
        <span
          aria-hidden="true"
          className={cx(
            'border-border-strong bg-surface flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
            'group-data-focus-visible:ring-focus-ring group-data-focus-visible:ring-2 group-data-focus-visible:ring-offset-2',
            'group-data-invalid:border-error',
            'tone-brand group-data-selected:border-tone',
          )}
        >
          <span className="bg-tone hidden size-2.5 rounded-full group-data-selected:block" />
        </span>
        <span>{children}</span>
      </RadioButton>
      {hint !== undefined && (
        <Text slot="description" className="text-foreground-muted -mt-1 ps-8 text-sm">
          {hint}
        </Text>
      )}
    </RadioField>
  );
}
