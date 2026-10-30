import { IconChevronDown, IconSearch } from '@beautinique/frontend-icons';
import type { ReactNode, Ref } from 'react';
import {
  Button as AriaButton,
  ComboBox as AriaComboBox,
  Input as AriaInput,
  type Key,
  ListBox,
  Popover,
} from 'react-aria-components';

import { cx } from './cx';
import { CONTROL_BOX } from './input';
import {
  EmptyList,
  FieldErrorText,
  FieldHint,
  FieldLabel,
  invalidProps,
  OptionItem,
  type PickerOption,
  POPOVER,
} from './picker-parts';
import { Spinner } from './spinner';

export interface ComboBoxProps {
  /** The visible label (every field has one). */
  label: ReactNode;
  /** The options; with `onSearch` they are the server's answer, shown as they are. */
  options: readonly PickerOption[];
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  /** What the empty box says, e.g. "Search brands". */
  placeholder?: string;
  hint?: ReactNode;
  /** What is wrong; the field is then invalid and described by it. */
  error?: ReactNode;
  isInvalid?: boolean;
  isRequired?: boolean;
  isDisabled?: boolean;
  /** Sends the value with a native form (a hidden input). */
  name?: string;
  autoFocus?: boolean;
  id?: string;
  /**
   * Search on the server: called with each typed text (debounce it in the app, e.g. hooks
   * `useDebouncedValue`). The list then shows `options` as given, without filtering them here.
   */
  onSearch?: (text: string) => void;
  /** A server search is running: a spinner in the box and "Searching…" in an empty list. */
  loading?: boolean;
  /** What an empty list says. @default 'No matches' */
  emptyText?: string;
  /** Classes of the outer element (label, field, hint, error). */
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/**
 * A text box that suggests options as the person types (React Aria's ComboBox): for a long list
 * (states, brands) or a server search. Arrows move through the suggestions, Enter chooses, Escape
 * closes; the button at the end shows every option. Only an option can be chosen: typed text that
 * matches none goes back to the chosen option when the box loses focus, and an emptied box
 * empties the choice.
 *
 * ```tsx
 * <ComboBox label="State" options={STATES} value={state} onChange={setState} />
 * <ComboBox label="Brand" options={found} onSearch={setQuery} loading={isFetching} value={brand} onChange={setBrand} />
 * ```
 */
export function ComboBox({
  label,
  options,
  value,
  defaultValue,
  onChange,
  placeholder,
  hint,
  error,
  isInvalid,
  isRequired,
  onSearch,
  loading = false,
  emptyText = 'No matches',
  className,
  ref,
  ...rest
}: ComboBoxProps) {
  return (
    <AriaComboBox<PickerOption>
      {...rest}
      ref={ref}
      {...(value === undefined ? {} : { value })}
      {...(defaultValue === undefined ? {} : { defaultValue })}
      onChange={(key: Key | null) => {
        onChange?.(key === null ? null : String(key));
      }}
      // React Aria filters `defaultItems` itself; `items` are shown as given (the server filtered them)
      {...(onSearch === undefined
        ? { defaultItems: options }
        : { items: options, onInputChange: onSearch })}
      allowsEmptyCollection
      isRequired={isRequired ?? false}
      {...invalidProps(isInvalid, error)}
      className={cx('group flex flex-col gap-1.5', className)}
    >
      <FieldLabel required={isRequired}>{label}</FieldLabel>
      {/* the icon sits over the input, so the list lines up with the whole box */}
      <div className={cx(CONTROL_BOX, 'relative')}>
        <IconSearch
          aria-hidden="true"
          size={18}
          className="text-foreground-muted pointer-events-none absolute start-3 top-1/2 -translate-y-1/2"
        />
        <AriaInput
          {...(placeholder === undefined ? {} : { placeholder })}
          className="placeholder:text-foreground-subtle h-full min-w-0 flex-1 bg-transparent py-2 ps-10 pe-3 outline-hidden disabled:cursor-not-allowed"
        />
        {loading && <Spinner size="sm" className="text-foreground-muted me-1" />}
        <AriaButton className="text-foreground-muted hover:text-foreground size-touch inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg outline-hidden data-disabled:cursor-not-allowed">
          <IconChevronDown
            aria-hidden="true"
            size={18}
            className="transition-transform group-data-open:rotate-180"
          />
        </AriaButton>
      </div>
      <FieldHint>{hint}</FieldHint>
      <FieldErrorText error={error} />
      <Popover offset={6} className={cx(POPOVER, 'max-h-72 min-w-(--trigger-width) p-1')}>
        <ListBox<PickerOption>
          className="outline-hidden"
          renderEmptyState={() => <EmptyList>{loading ? 'Searching…' : emptyText}</EmptyList>}
        >
          {(option) => <OptionItem option={option} />}
        </ListBox>
      </Popover>
    </AriaComboBox>
  );
}
