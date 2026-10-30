import { IconCalendar, IconChevronLeft, IconChevronRight } from '@beautinique/frontend-icons';
import {
  type DateValue,
  parseAbsolute,
  parseDate,
  toCalendarDate,
  today,
  toZoned,
} from '@internationalized/date';
import { type ReactNode, type Ref, useContext, useSyncExternalStore } from 'react';
import {
  Button as AriaButton,
  Calendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  CalendarStateContext,
  DateInput,
  DatePicker as AriaDatePicker,
  DateRangePicker as AriaDateRangePicker,
  DateSegment,
  Dialog as AriaDialog,
  Group,
  Heading,
  I18nProvider,
  Modal,
  ModalOverlay,
  Popover,
  RangeCalendar,
  RangeCalendarStateContext,
} from 'react-aria-components';

import { cx } from './cx';
import { CONTROL_BOX } from './input';
import { FieldErrorText, FieldHint, FieldLabel, invalidProps, POPOVER } from './picker-parts';

/** India's time zone: dates with a time are shown and typed in it, whatever the device says. */
export const INDIA_TIME_ZONE = 'Asia/Kolkata';

/** Today in India as `YYYY-MM-DD` (e.g. `minValue={todayInIndia()}` for "not in the past"). */
export const todayInIndia = (): string => today(INDIA_TIME_ZONE).toString();

/** A date as text: `YYYY-MM-DD` without a time; an ISO instant (`…Z`) with one. */
const toDateValue = (text: string, withTime: boolean): DateValue =>
  withTime ? parseAbsolute(text, INDIA_TIME_ZONE) : parseDate(text);

const fromDateValue = (value: DateValue, withTime: boolean): string =>
  withTime && 'timeZone' in value ? value.toAbsoluteString() : toCalendarDate(value).toString();

/** What an empty date-time field starts from: today at midnight in India (so its type is right). */
const placeholderFor = (withTime: boolean): DateValue =>
  withTime ? toZoned(today(INDIA_TIME_ZONE), INDIA_TIME_ZONE) : today(INDIA_TIME_ZONE);

const SEGMENT =
  'tone-brand rounded-sm px-0.5 caret-transparent outline-hidden data-focused:bg-tone data-focused:text-tone-foreground data-placeholder:text-foreground-subtle data-[type=literal]:px-0 data-[type=literal]:text-foreground-muted';

const ICON_BUTTON =
  'text-foreground-muted hover:text-foreground focus-ring size-touch inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg outline-hidden data-disabled:cursor-not-allowed';

const NAV_BUTTON =
  'text-foreground hover:bg-surface-muted focus-ring size-touch inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full outline-hidden data-disabled:cursor-not-allowed data-disabled:opacity-40';

const CELL_BASE =
  'tone-brand flex size-11 cursor-pointer items-center justify-center text-sm tabular-nums outline-hidden data-hovered:bg-surface-muted data-outside-month:invisible data-disabled:cursor-not-allowed data-disabled:text-foreground-subtle data-unavailable:cursor-not-allowed data-unavailable:text-foreground-subtle data-unavailable:line-through data-focus-visible:ring-focus-ring data-focus-visible:ring-2 data-focus-visible:ring-inset data-today:font-semibold';

const CELL = cx(CELL_BASE, 'rounded-full data-selected:bg-tone data-selected:text-tone-foreground');

const RANGE_CELL = cx(
  CELL_BASE,
  'data-selected:bg-tone-subtle data-selected:text-tone-subtle-foreground data-selection-start:bg-tone data-selection-start:text-tone-foreground data-selection-end:bg-tone data-selection-end:text-tone-foreground rounded-none data-selection-end:rounded-e-full data-selection-start:rounded-s-full [&:not([data-selected])]:rounded-full',
);

const MONTHS = Array.from({ length: 12 }, (_, index) =>
  new Intl.DateTimeFormat('en-IN', { month: 'long', timeZone: 'UTC' }).format(
    new Date(Date.UTC(2000, index, 1)),
  ),
);

const NATIVE_SELECT =
  'bg-surface text-foreground border-border-strong focus-ring min-h-touch cursor-pointer rounded-lg border px-2 text-sm font-medium';

/**
 * Month and year as two native selects (a phone shows its own wheel), so a date far away (a date
 * of birth) is two choices, not dozens of presses. Years: `minValue`..`maxValue`, or 100 years back
 * and 10 ahead.
 */
function MonthYear() {
  const single = useContext(CalendarStateContext);
  const range = useContext(RangeCalendarStateContext);
  const state = single ?? range;
  if (state === null) return null;
  const focused = state.focusedDate;
  const now = today(INDIA_TIME_ZONE);
  const firstYear = state.minValue?.year ?? now.year - 100;
  const lastYear = state.maxValue?.year ?? now.year + 10;
  const years = Array.from({ length: lastYear - firstYear + 1 }, (_, index) => firstYear + index);
  return (
    <div className="flex min-w-0 flex-1 justify-center gap-1.5">
      <select
        aria-label="Month"
        value={focused.month}
        disabled={state.isDisabled}
        onChange={(event) => {
          state.setFocusedDate(focused.set({ month: Number(event.target.value) }));
        }}
        className={NATIVE_SELECT}
      >
        {MONTHS.map((name, index) => (
          <option key={name} value={index + 1}>
            {name}
          </option>
        ))}
      </select>
      <select
        aria-label="Year"
        value={focused.year}
        disabled={state.isDisabled}
        onChange={(event) => {
          state.setFocusedDate(focused.set({ year: Number(event.target.value) }));
        }}
        className={NATIVE_SELECT}
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
}

function CalendarHeader() {
  return (
    <header className="flex items-center gap-1 pb-2">
      <AriaButton slot="previous" className={NAV_BUTTON}>
        <IconChevronLeft aria-hidden="true" size={20} />
      </AriaButton>
      {/* the month's name stays for screen readers; eyes get the two selects */}
      <Heading className="sr-only" />
      <MonthYear />
      <AriaButton slot="next" className={NAV_BUTTON}>
        <IconChevronRight aria-hidden="true" size={20} />
      </AriaButton>
    </header>
  );
}

/** The time zone after a time: plain text, so typing runs on to the next field. */
function IstMark() {
  return <span className="text-foreground-muted text-sm">IST</span>;
}

/** A phone: the calendar (~385 px) would not fit beside the field, so it opens as a sheet. */
const SMALL_SCREEN = '(max-width: 639px)';

const watchSmallScreen = (onChange: () => void) => {
  if (typeof window.matchMedia !== 'function') return () => undefined;
  const query = window.matchMedia(SMALL_SCREEN);
  query.addEventListener('change', onChange);
  return () => {
    query.removeEventListener('change', onChange);
  };
};

const isSmallScreen = () =>
  typeof window.matchMedia === 'function' && window.matchMedia(SMALL_SCREEN).matches;

/**
 * Where the calendar opens: a popover by the field, or on a phone a sheet from the bottom (the
 * page behind dimmed, Escape or a press outside closes it). Focus moves into it either way.
 */
function CalendarOverlay({ children }: { children: ReactNode }) {
  const small = useSyncExternalStore(watchSmallScreen, isSmallScreen, () => false);
  if (small) {
    return (
      <ModalOverlay
        isDismissable
        className="data-entering:animate-fade-in data-exiting:animate-fade-out fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3"
      >
        <Modal className="bg-surface text-foreground data-entering:animate-rise-in data-exiting:animate-sink-out w-full max-w-sm rounded-2xl p-3 shadow-xl">
          <AriaDialog className="flex justify-center outline-hidden">{children}</AriaDialog>
        </Modal>
      </ModalOverlay>
    );
  }
  return (
    <Popover offset={6} placement="bottom end" className={cx(POPOVER, 'p-3')}>
      <AriaDialog className="outline-hidden">{children}</AriaDialog>
    </Popover>
  );
}

function CalendarDays({ range = false }: { range?: boolean }) {
  return (
    <CalendarGrid
      className={cx(
        'border-separate',
        range ? 'border-spacing-x-0 border-spacing-y-0.5' : 'border-spacing-0.5',
      )}
    >
      <CalendarGridHeader>
        {(day) => (
          <CalendarHeaderCell className="text-foreground-muted pb-1 text-xs font-medium">
            {day}
          </CalendarHeaderCell>
        )}
      </CalendarGridHeader>
      <CalendarGridBody>
        {(date) => <CalendarCell date={date} className={range ? RANGE_CELL : CELL} />}
      </CalendarGridBody>
    </CalendarGrid>
  );
}

interface DateFieldBaseProps {
  /** The visible label (every field has one). */
  label: ReactNode;
  /** A time too (hour and minute, India time); the value is then an ISO instant. */
  withTime?: boolean;
  /** The first day that can be chosen, `YYYY-MM-DD` (e.g. `todayInIndia()`). */
  minValue?: string;
  /** The last day that can be chosen, `YYYY-MM-DD`. */
  maxValue?: string;
  /** Days that cannot be chosen (they show struck out), given as `YYYY-MM-DD`. */
  isDateUnavailable?: (date: string) => boolean;
  hint?: ReactNode;
  /** What is wrong; the field is then invalid and described by it. */
  error?: ReactNode;
  isInvalid?: boolean;
  isRequired?: boolean;
  isDisabled?: boolean;
  autoFocus?: boolean;
  id?: string;
  onOpenChange?: (isOpen: boolean) => void;
  /** Classes of the outer element (label, field, hint, error). */
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

/** `YYYY-MM-DD` as people read it here: dd/mm/yyyy. */
const showDay = (day: string): string => {
  const [year = '', month = '', date = ''] = day.split('-');
  return `${date}/${month}/${year}`;
};

/**
 * What is wrong with a chosen day, in our words. React Aria has the same checks, but writes them in
 * the browser's language and date format; ours always win (they come first).
 */
function dayProblem(value: DateValue | null, props: DateFieldBaseProps): string | null {
  if (value === null) return null;
  const day = toCalendarDate(value).toString();
  // YYYY-MM-DD strings sort as the days do
  if (props.minValue !== undefined && day < props.minValue) {
    return `Choose ${showDay(props.minValue)} or later.`;
  }
  if (props.maxValue !== undefined && day > props.maxValue) {
    return `Choose ${showDay(props.maxValue)} or earlier.`;
  }
  if (props.isDateUnavailable?.(day) === true) return 'This date is not available.';
  return null;
}

/** The props React Aria's date pickers share, from ours. */
function sharedProps(props: DateFieldBaseProps) {
  const withTime = props.withTime ?? false;
  const unavailable = props.isDateUnavailable;
  return {
    granularity: withTime ? ('minute' as const) : ('day' as const),
    placeholderValue: placeholderFor(withTime),
    shouldForceLeadingZeros: true,
    // as a segment, "IST" takes the focus after am/pm and typing stops there; IstMark shows it
    hideTimeZone: true,
    isRequired: props.isRequired ?? false,
    ...invalidProps(props.isInvalid, props.error),
    ...(props.minValue === undefined ? {} : { minValue: parseDate(props.minValue) }),
    // with a time, the whole last day can be chosen (to its last minute)
    ...(props.maxValue === undefined
      ? {}
      : {
          maxValue: withTime
            ? toZoned(parseDate(props.maxValue), INDIA_TIME_ZONE).set({
                hour: 23,
                minute: 59,
                second: 59,
                millisecond: 999,
              })
            : parseDate(props.maxValue),
        }),
    ...(unavailable === undefined
      ? {}
      : { isDateUnavailable: (date: DateValue) => unavailable(toCalendarDate(date).toString()) }),
    ...(props.isDisabled === undefined ? {} : { isDisabled: props.isDisabled }),
    ...(props.autoFocus === undefined ? {} : { autoFocus: props.autoFocus }),
    ...(props.id === undefined ? {} : { id: props.id }),
    ...(props.onOpenChange === undefined ? {} : { onOpenChange: props.onOpenChange }),
    ...(props.ref === undefined ? {} : { ref: props.ref }),
    className: cx('group flex flex-col gap-1.5', props.className),
  };
}

export interface DatePickerProps extends DateFieldBaseProps {
  /** `YYYY-MM-DD`, or with `withTime` an ISO instant (`2026-10-30T04:30:00.000Z`); null = empty. */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  /** Sends the value with a native form (a hidden input). */
  name?: string;
}

/**
 * A date (and, with `withTime`, a time) in the Indian way: dd/mm/yyyy, India time (React Aria's
 * DatePicker in `en-IN`). Each part can be typed (or changed with the arrow keys), and the button
 * opens a month calendar. The value is text a form and the API take as it is: `YYYY-MM-DD`, or an
 * ISO instant with a time.
 *
 * ```tsx
 * <DatePicker label="Date of birth" value={dob} onChange={setDob} maxValue={todayInIndia()} />
 * <DatePicker label="Offer starts" withTime minValue={todayInIndia()} value={start} onChange={setStart} />
 * ```
 */
export function DatePicker(props: DatePickerProps) {
  const withTime = props.withTime ?? false;
  const { value, defaultValue, onChange, name } = props;
  return (
    <I18nProvider locale="en-IN">
      <AriaDatePicker
        {...sharedProps(props)}
        validate={(next) => dayProblem(next, props)}
        {...(value === undefined
          ? {}
          : { value: value === null ? null : toDateValue(value, withTime) })}
        {...(defaultValue === undefined
          ? {}
          : { defaultValue: defaultValue === null ? null : toDateValue(defaultValue, withTime) })}
        onChange={(next: DateValue | null) => {
          onChange?.(next === null ? null : fromDateValue(next, withTime));
        }}
        {...(name === undefined ? {} : { name })}
      >
        <FieldLabel required={props.isRequired}>{props.label}</FieldLabel>
        <Group className={cx(CONTROL_BOX, 'data-invalid:border-error')}>
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-1.5 px-3 py-2 tabular-nums">
            <DateInput className="flex flex-wrap items-center">
              {(segment) => <DateSegment segment={segment} className={SEGMENT} />}
            </DateInput>
            {withTime && <IstMark />}
          </div>
          <AriaButton className={ICON_BUTTON}>
            <IconCalendar aria-hidden="true" size={20} />
          </AriaButton>
        </Group>
        <FieldHint>{props.hint}</FieldHint>
        <FieldErrorText error={props.error} />
        <CalendarOverlay>
          <Calendar>
            <CalendarHeader />
            <CalendarDays />
          </Calendar>
        </CalendarOverlay>
      </AriaDatePicker>
    </I18nProvider>
  );
}

/** A range of dates: both ends, as in DatePicker's value. */
export interface DateRange {
  start: string;
  end: string;
}

export interface DateRangePickerProps extends DateFieldBaseProps {
  value?: DateRange | null;
  defaultValue?: DateRange | null;
  onChange?: (value: DateRange | null) => void;
  /** Send the two ends with a native form (hidden inputs). */
  startName?: string;
  endName?: string;
}

/**
 * A from–to range (offer validity, a report's period): two date fields in one box and a calendar
 * where the first press starts the range and the second ends it. Same formats as DatePicker.
 *
 * ```tsx
 * <DateRangePicker label="Valid" withTime minValue={todayInIndia()} value={validity} onChange={setValidity} />
 * ```
 */
export function DateRangePicker(props: DateRangePickerProps) {
  const withTime = props.withTime ?? false;
  const { value, defaultValue, onChange, startName, endName } = props;
  const toRange = (range: DateRange) => ({
    start: toDateValue(range.start, withTime),
    end: toDateValue(range.end, withTime),
  });
  return (
    <I18nProvider locale="en-IN">
      <AriaDateRangePicker
        {...sharedProps(props)}
        // typed as never empty, but React Aria calls it with null while the field is empty
        validate={(range: { start: DateValue; end: DateValue } | null) =>
          range === null
            ? null
            : (dayProblem(range.start, props) ??
              dayProblem(range.end, props) ??
              (range.end.compare(range.start) < 0 ? 'The end must not be before the start.' : null))
        }
        {...(value === undefined ? {} : { value: value === null ? null : toRange(value) })}
        {...(defaultValue === undefined
          ? {}
          : { defaultValue: defaultValue === null ? null : toRange(defaultValue) })}
        onChange={(next) => {
          onChange?.(
            next === null
              ? null
              : {
                  start: fromDateValue(next.start, withTime),
                  end: fromDateValue(next.end, withTime),
                },
          );
        }}
        {...(startName === undefined ? {} : { startName })}
        {...(endName === undefined ? {} : { endName })}
      >
        <FieldLabel required={props.isRequired}>{props.label}</FieldLabel>
        <Group className={cx(CONTROL_BOX, 'data-invalid:border-error')}>
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 px-3 py-2 tabular-nums">
            <DateInput slot="start" className="flex flex-wrap items-center">
              {(segment) => <DateSegment segment={segment} className={SEGMENT} />}
            </DateInput>
            {withTime && <IstMark />}
            <span aria-hidden="true" className="text-foreground-muted">
              –
            </span>
            <DateInput slot="end" className="flex flex-wrap items-center">
              {(segment) => <DateSegment segment={segment} className={SEGMENT} />}
            </DateInput>
            {withTime && <IstMark />}
          </div>
          <AriaButton className={ICON_BUTTON}>
            <IconCalendar aria-hidden="true" size={20} />
          </AriaButton>
        </Group>
        <FieldHint>{props.hint}</FieldHint>
        <FieldErrorText error={props.error} />
        <CalendarOverlay>
          <RangeCalendar>
            <CalendarHeader />
            <CalendarDays range />
          </RangeCalendar>
        </CalendarOverlay>
      </AriaDateRangePicker>
    </I18nProvider>
  );
}
