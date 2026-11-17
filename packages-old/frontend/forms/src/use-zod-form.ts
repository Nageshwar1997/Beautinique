import type { input, output, ZodType } from '@beautinique/shared-zod';
import {
  type DefaultValues,
  type FieldValues,
  useForm,
  type UseFormProps,
  type UseFormReturn,
} from 'react-hook-form';

import { zodResolver } from './resolver';

export type ZodFormOptions<Schema extends ZodType<FieldValues, FieldValues>> = Omit<
  UseFormProps<input<Schema>, unknown, output<Schema>>,
  'resolver' | 'defaultValues'
> & {
  /** Every field's first value: the fields stay controlled and server errors find their field. */
  defaultValues: DefaultValues<input<Schema>>;
};

export type ZodForm<Schema extends ZodType<FieldValues, FieldValues>> = UseFormReturn<
  input<Schema>,
  unknown,
  output<Schema>
>;

/**
 * `useForm` checked by a zod schema: values typed from the schema, submit gets its output. A field
 * is first checked when it is left, then at every change (`onTouched`), so nobody sees an error
 * for a field they have not finished.
 */
export function useZodForm<Schema extends ZodType<FieldValues, FieldValues>>(
  schema: Schema,
  options: ZodFormOptions<Schema>,
): ZodForm<Schema> {
  return useForm<input<Schema>, unknown, output<Schema>>({
    mode: 'onTouched',
    ...options,
    resolver: zodResolver(schema),
  });
}
