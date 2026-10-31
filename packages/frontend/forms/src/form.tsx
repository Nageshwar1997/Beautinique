import { cx } from '@beautinique/frontend-components';
import { IconDanger } from '@beautinique/frontend-icons';
import type { FormHTMLAttributes, ReactNode } from 'react';
import { type FieldValues, FormProvider, type UseFormReturn, useFormState } from 'react-hook-form';

import { type ErrorFields, showServerError } from './server-errors';

export interface FormProps<Values extends FieldValues, Output> extends Omit<
  FormHTMLAttributes<HTMLFormElement>,
  'onSubmit' | 'children'
> {
  /** From useZodForm. */
  form: UseFormReturn<Values, unknown, Output>;
  /**
   * Runs with the schema's output once every field is right. What it throws is shown where it
   * belongs (showServerError); the button shows it is busy until it settles.
   */
  onSubmit: (values: Output) => unknown;
  /** Server error codes that belong to one field, e.g. `{ OTP_INVALID: 'code' }`. */
  errorFields?: ErrorFields<Values>;
  children: ReactNode;
}

/**
 * A form with our checks: no browser bubbles (`noValidate`: their text is the browser's, ours is
 * on the field), the zod schema on submit, and a failed call shown on its field or above the form.
 */
export function Form<Values extends FieldValues, Output>({
  form,
  onSubmit,
  errorFields,
  children,
  ...rest
}: FormProps<Values, Output>) {
  const submit = form.handleSubmit(async (values) => {
    try {
      await onSubmit(values);
    } catch (error) {
      showServerError(form, error, errorFields);
    }
  });
  return (
    <FormProvider {...form}>
      <form
        noValidate
        {...rest}
        onSubmit={(event) => {
          void submit(event);
        }}
      >
        <FormError />
        {children}
      </form>
    </FormProvider>
  );
}

/**
 * The form-wide error of the last submit (wrong email or password, no connection): a box at the top
 * of the form that screen readers read out when it appears. Form renders it.
 */
export function FormError({ className }: { className?: string }) {
  const { errors } = useFormState();
  const server = errors.root?.server;
  return (
    <div role="alert" className={cx('empty:hidden', className)}>
      {server?.message !== undefined && server.message !== '' && (
        <p className="bg-error-subtle text-error-subtle-foreground mb-4 flex items-start gap-2 rounded-lg px-4 py-3 text-sm">
          <IconDanger aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>{server.message}</span>
        </p>
      )}
    </div>
  );
}
