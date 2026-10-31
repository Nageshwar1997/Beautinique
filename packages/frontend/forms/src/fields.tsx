import {
  Checkbox,
  type CheckboxProps,
  CodeInput,
  type CodeInputProps,
  Input,
  type InputProps,
  PasswordInput,
  type PasswordInputProps,
  RadioGroup,
  type RadioGroupProps,
  Select,
  type SelectProps,
} from '@beautinique/frontend-components';
import {
  type Control,
  type FieldPath,
  type FieldValues,
  type RefCallBack,
  useController,
} from 'react-hook-form';

/** Every field: the form's `control` (useZodForm) and a name the schema has, checked by TypeScript. */
export interface FieldBinding<Values extends FieldValues, Output> {
  control: Control<Values, unknown, Output>;
  name: FieldPath<Values>;
}

/**
 * A field's state for its control. The ref comes apart from the rest: it is only handed on (the
 * form focuses the first wrong field with it), never read while rendering.
 */
function useBoundField<Values extends FieldValues, Output>({
  control,
  name,
}: FieldBinding<Values, Output>) {
  const {
    field: { ref, value, ...field },
    fieldState,
  } = useController({ control, name });
  return { ref, value: value as unknown, field, error: fieldState.error?.message };
}

const text = (value: unknown): string => (typeof value === 'string' ? value : '');

/**
 * For controls whose ref is their outer box: the form focuses the first field with an error, so it
 * gets the box's first control matching `selector` (the checkbox, the chosen radio, the button).
 */
const focusInside =
  (fieldRef: RefCallBack, selector: string) =>
  (element: HTMLElement | null): void => {
    fieldRef(
      element === null
        ? null
        : { focus: () => element.querySelector<HTMLElement>(selector)?.focus() },
    );
  };

type TextProps = Omit<
  InputProps,
  'name' | 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'error' | 'ref'
>;

/** Input bound to a form field (text, email, number as text ...); its error shows under it. */
export function TextField<Values extends FieldValues, Output>({
  control,
  name,
  ...input
}: FieldBinding<Values, Output> & TextProps) {
  const { ref, value, field, error } = useBoundField({ control, name });
  return (
    <Input
      {...input}
      {...field}
      ref={ref}
      value={text(value)}
      disabled={field.disabled ?? input.disabled}
      error={error}
    />
  );
}

type PasswordProps = Omit<
  PasswordInputProps,
  'name' | 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'error' | 'ref'
>;

/** PasswordInput bound to a form field; `autoComplete` says sign-in or a new password. */
export function PasswordField<Values extends FieldValues, Output>({
  control,
  name,
  ...input
}: FieldBinding<Values, Output> & PasswordProps) {
  const { ref, value, field, error } = useBoundField({ control, name });
  return (
    <PasswordInput
      {...input}
      {...field}
      ref={ref}
      value={text(value)}
      disabled={field.disabled ?? input.disabled}
      error={error}
    />
  );
}

type CodeProps = Omit<CodeInputProps, 'name' | 'value' | 'onChange' | 'onBlur' | 'error' | 'ref'>;

/** CodeInput bound to a form field; `onComplete` can submit the form once every digit is in. */
export function CodeField<Values extends FieldValues, Output>({
  control,
  name,
  ...input
}: FieldBinding<Values, Output> & CodeProps) {
  const { ref, value, field, error } = useBoundField({ control, name });
  return (
    <CodeInput
      {...input}
      {...field}
      ref={ref}
      value={text(value)}
      disabled={field.disabled ?? input.disabled}
      error={error}
    />
  );
}

type CheckProps = Omit<
  CheckboxProps,
  'name' | 'isSelected' | 'defaultSelected' | 'onChange' | 'onBlur' | 'error' | 'ref'
>;

/** Checkbox bound to a true/false field (consent: terms, 18 or older). */
export function CheckboxField<Values extends FieldValues, Output>({
  control,
  name,
  ...checkbox
}: FieldBinding<Values, Output> & CheckProps) {
  const { ref, value, field, error } = useBoundField({ control, name });
  return (
    <Checkbox
      {...checkbox}
      name={field.name}
      ref={focusInside(ref, 'input')}
      isSelected={value === true}
      onChange={field.onChange}
      onBlur={field.onBlur}
      isDisabled={field.disabled ?? checkbox.isDisabled}
      error={error}
    />
  );
}

type RadiosProps = Omit<
  RadioGroupProps,
  'name' | 'value' | 'defaultValue' | 'onChange' | 'onBlur' | 'error' | 'ref'
>;

/** RadioGroup bound to a field holding the chosen value; `children` are its Radios. */
export function RadioGroupField<Values extends FieldValues, Output>({
  control,
  name,
  ...group
}: FieldBinding<Values, Output> & RadiosProps) {
  const { ref, value, field, error } = useBoundField({ control, name });
  return (
    <RadioGroup
      {...group}
      name={field.name}
      ref={focusInside(ref, 'input:checked, input')}
      value={typeof value === 'string' ? value : null}
      onChange={field.onChange}
      onBlur={field.onBlur}
      isDisabled={field.disabled ?? group.isDisabled}
      error={error}
    />
  );
}

type DistributiveOmit<Type, Key extends PropertyKey> = Type extends unknown
  ? Omit<Type, Key>
  : never;
type PickProps = DistributiveOmit<
  SelectProps,
  'name' | 'value' | 'defaultValue' | 'onChange' | 'error' | 'ref'
>;

/** Select bound to a field: one value (`string | null`), or a list with `selectionMode="multiple"`. */
export function SelectField<Values extends FieldValues, Output>({
  control,
  name,
  ...select
}: FieldBinding<Values, Output> & PickProps) {
  const { ref, value, field, error } = useBoundField({ control, name });
  const shared = {
    name: field.name,
    ref: focusInside(ref, 'button'),
    // a Select has no blur of its own: closing its list is leaving it
    onOpenChange: (isOpen: boolean) => {
      if (!isOpen) field.onBlur();
      select.onOpenChange?.(isOpen);
    },
    isDisabled: field.disabled ?? select.isDisabled,
    error,
  };
  return select.selectionMode === 'multiple' ? (
    <Select
      {...select}
      {...shared}
      value={Array.isArray(value) ? value.filter((item) => typeof item === 'string') : []}
      onChange={field.onChange}
    />
  ) : (
    <Select
      {...select}
      {...shared}
      value={typeof value === 'string' ? value : null}
      onChange={field.onChange}
    />
  );
}
