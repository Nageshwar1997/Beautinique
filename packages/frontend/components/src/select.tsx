import { IconChevronDown, IconClose } from '@beautinique/frontend-icons';
import { type ReactNode, type Ref, useContext } from 'react';
import {
  Button as AriaButton,
  type Key,
  ListBox,
  Popover,
  Select as AriaSelect,
  type SelectProps as AriaSelectProps,
  SelectStateContext,
  SelectValue,
} from 'react-aria-components';

import { Button } from './button';
import { cx } from './cx';
import {
  EmptyList,
  FieldErrorText,
  FieldHint,
  FieldLabel,
  invalidProps,
  OptionItem,
  type PickerOption,
  POPOVER,
  TRIGGER,
} from './picker-parts';

export type { PickerOption } from './picker-parts';

interface SelectBaseProps {
  /** The visible label (every field has one). */
  label: ReactNode;
  options: readonly PickerOption[];
  /** What the field says while nothing is chosen. @default 'Select an option' */
  placeholder?: string;
  hint?: ReactNode;
  /** What is wrong; the field is then invalid and described by it. */
  error?: ReactNode;
  isInvalid?: boolean;
  isRequired?: boolean;
  isDisabled?: boolean;
  /** Sends the value with a native form (a hidden `<select>`). */
  name?: string;
  autoFocus?: boolean;
  id?: string;
  onOpenChange?: (isOpen: boolean) => void;
  /** Classes of the outer element (label, field, hint, error). */
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

export interface SingleSelectProps extends SelectBaseProps {
  selectionMode?: 'single';
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  /** A button that empties the field, for one that may stay empty. */
  clearable?: boolean;
}

export interface MultipleSelectProps extends SelectBaseProps {
  /** Several choices: the list stays open, each option has a box. */
  selectionMode: 'multiple';
  value?: readonly string[];
  defaultValue?: readonly string[];
  onChange?: (value: string[]) => void;
  clearable?: never;
}

export type SelectProps = SingleSelectProps | MultipleSelectProps;

/** Empties a single Select from inside it (works controlled and uncontrolled). */
function ClearButton() {
  const state = useContext(SelectStateContext);
  if (state === null) return null;
  if (state.value === null) return null;
  return (
    <Button
      variant="ghost"
      tone="neutral"
      size="sm"
      icon={<IconClose size={16} />}
      aria-label="Clear the choice"
      onClick={() => {
        state.setValue(null);
      }}
      className="absolute end-10 top-1/2 -translate-y-1/2"
    />
  );
}

/**
 * A field that opens a short list (5–20 options; a long one is a ComboBox): React Aria's Select,
 * so the keyboard (arrows, typing a letter, Enter, Escape), screen readers and touch work, and the
 * list is drawn above the page (never cut by a parent). One choice by default; `selectionMode=
 * "multiple"` keeps the list open and gives each option a box.
 *
 * ```tsx
 * <Select label="Skin type" options={SKIN_TYPES} value={skin} onChange={setSkin} />
 * <Select label="Concerns" selectionMode="multiple" options={CONCERNS} value={concerns} onChange={setConcerns} />
 * ```
 */
export function Select(props: SelectProps) {
  const {
    label,
    options,
    placeholder = 'Select an option',
    hint,
    error,
    isInvalid,
    isRequired,
    className,
    ref,
    clearable = false,
    // the value props are handed over below, with their keys made strings
    selectionMode: _selectionMode,
    value: _value,
    defaultValue: _defaultValue,
    onChange: _onChange,
    ...rest
  } = props;
  const selection =
    props.selectionMode === 'multiple'
      ? {
          selectionMode: 'multiple' as const,
          value: props.value,
          defaultValue: props.defaultValue,
          onChange: (keys: Key[]) => {
            props.onChange?.(keys.map(String));
          },
        }
      : {
          selectionMode: 'single' as const,
          value: props.value,
          defaultValue: props.defaultValue,
          onChange: (key: Key | null) => {
            props.onChange?.(key === null ? null : String(key));
          },
        };
  return (
    <AriaSelect<PickerOption, 'single' | 'multiple'>
      {...rest}
      {...(selection as Partial<AriaSelectProps<PickerOption, 'single' | 'multiple'>>)}
      ref={ref}
      placeholder={placeholder}
      isRequired={isRequired ?? false}
      {...invalidProps(isInvalid, error)}
      className={cx('group flex flex-col gap-1.5', className)}
    >
      <FieldLabel required={isRequired}>{label}</FieldLabel>
      <div className="relative">
        <AriaButton className={TRIGGER}>
          <SelectValue<PickerOption>
            className={cx(
              'data-placeholder:text-foreground-subtle min-w-0 flex-1 truncate',
              clearable && 'me-9',
            )}
          >
            {({ isPlaceholder, selectedText }) => (isPlaceholder ? placeholder : selectedText)}
          </SelectValue>
          <IconChevronDown
            aria-hidden="true"
            size={18}
            className="text-foreground-muted shrink-0 transition-transform group-data-open:rotate-180"
          />
        </AriaButton>
        {clearable && props.isDisabled !== true && <ClearButton />}
      </div>
      <FieldHint>{hint}</FieldHint>
      <FieldErrorText error={error} />
      <Popover offset={6} className={cx(POPOVER, 'max-h-72 min-w-(--trigger-width) p-1')}>
        <ListBox<PickerOption>
          items={options}
          className="outline-hidden"
          renderEmptyState={() => <EmptyList>No options</EmptyList>}
        >
          {(option) => <OptionItem option={option} />}
        </ListBox>
      </Popover>
    </AriaSelect>
  );
}
