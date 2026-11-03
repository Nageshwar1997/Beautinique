import type { ButtonHTMLAttributes, MouseEvent, ReactNode, Ref } from 'react';

import { cx, type Tone, TONE_CLASS } from './cx';
import { Spinner } from './spinner';

/**
 * How a button looks (owner, 2026-10-30): `primary` the one main action of a screen (the brand
 * gradient, no tone), `solid` an important one, `outline` a second one, `soft` a light one in
 * lists and toolbars, `ghost` the lightest. A link that only looks like a button is a link.
 */
export const BUTTON_VARIANTS = ['primary', 'solid', 'outline', 'soft', 'ghost'] as const;
export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];

/** `md` (44 px, a finger) by default; `lg` for big main actions and the Delivery app; `sm` only in dense desktop tables and toolbars (its touch area stays 44 px). */
export const BUTTON_SIZES = ['sm', 'md', 'lg'] as const;
export type ButtonSize = (typeof BUTTON_SIZES)[number];

const VARIANT: Readonly<Record<ButtonVariant, string>> = {
  primary:
    'bg-brand-gradient text-gradient-foreground shadow-brand enabled:hover:brightness-110 aria-busy:brightness-100',
  solid: 'bg-tone text-tone-foreground enabled:hover:bg-tone-hover',
  outline:
    'border border-tone bg-transparent text-tone-subtle-foreground enabled:hover:bg-tone-subtle',
  soft: 'bg-tone-subtle text-tone-subtle-foreground enabled:hover:brightness-95',
  ghost: 'bg-transparent text-tone-subtle-foreground enabled:hover:bg-tone-subtle',
};

const SIZE: Readonly<Record<ButtonSize, string>> = {
  sm: 'min-h-9 gap-1.5 px-3.5 text-sm touch-target',
  md: 'min-h-touch gap-2 px-5 text-base',
  lg: 'min-h-12 gap-2.5 px-7 text-lg',
};

const ICON_ONLY: Readonly<Record<ButtonSize, string>> = {
  sm: 'size-9 text-sm touch-target',
  md: 'size-touch text-base',
  lg: 'size-12 text-lg',
};

const SPINNER = { sm: 'sm', md: 'md', lg: 'md' } as const;

interface CommonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** @default 'solid' */
  variant?: ButtonVariant;
  /** The colour, from the styles tones (no effect on `primary`). @default 'brand' */
  tone?: Tone;
  /** @default 'md' */
  size?: ButtonSize;
  /**
   * Working on it: a spinner in place of the start icon (or of the icon of an icon-only button;
   * the end icon hides), no second click, and `aria-busy` for screen readers. Keeps the focus and
   * the text (unlike `disabled`).
   */
  loading?: boolean;
  /** Takes the whole width of its row. */
  fullWidth?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

interface TextButtonProps extends CommonProps {
  children: ReactNode;
  /** An icon before the text (decorative: the text says it all). */
  startIcon?: ReactNode;
  /** An icon after the text. */
  endIcon?: ReactNode;
  icon?: never;
}

interface IconButtonProps extends CommonProps {
  /** A button that is only an icon: square, and `aria-label` is required. */
  icon: ReactNode;
  'aria-label': string;
  children?: never;
  startIcon?: never;
  endIcon?: never;
}

export type ButtonProps = TextButtonProps | IconButtonProps;

/**
 * The button of every app (DESIGN §4): a pill, the styles tokens and tones, a 44 px touch target,
 * the keyboard focus ring of styles base.css. `type="button"` unless given: a button in a form
 * submits only when it says so.
 *
 * ```tsx
 * <Button variant="primary" loading={saving}>Sign in</Button>
 * <Button variant="solid" tone="error" startIcon={<IconTrash />}>Delete</Button>
 * <Button variant="ghost" icon={<IconClose />} aria-label="Close" />
 * ```
 */
const preventWhileBusy = (event: MouseEvent<HTMLButtonElement>) => {
  event.preventDefault();
};

export function Button(props: ButtonProps) {
  const {
    variant = 'solid',
    tone = 'brand',
    size = 'md',
    loading = false,
    fullWidth = false,
    className,
    type = 'button',
    disabled,
    onClick,
    ref,
    icon,
    startIcon,
    endIcon,
    children,
    ...rest
  } = props;
  const iconOnly = icon !== undefined;
  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      disabled={disabled}
      aria-busy={loading || undefined}
      // a busy button keeps its focus and its place in the tab order, but does nothing: not even
      // the browser's own action, so a busy submit button (or Enter in its form) does not submit again
      onClick={loading ? preventWhileBusy : onClick}
      className={cx(
        'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full font-medium whitespace-nowrap transition-[background-color,filter,color] select-none',
        'disabled:cursor-not-allowed disabled:opacity-50 aria-busy:cursor-progress',
        variant !== 'primary' && TONE_CLASS[tone],
        VARIANT[variant],
        iconOnly ? ICON_ONLY[size] : SIZE[size],
        fullWidth && 'w-full',
        className,
      )}
    >
      {loading ? (
        <Spinner size={SPINNER[size]} />
      ) : iconOnly ? (
        <span aria-hidden="true" className="inline-flex">
          {icon}
        </span>
      ) : (
        startIcon !== undefined && (
          <span aria-hidden="true" className="inline-flex">
            {startIcon}
          </span>
        )
      )}
      {!iconOnly && children}
      {!iconOnly && !loading && endIcon !== undefined && (
        <span aria-hidden="true" className="inline-flex">
          {endIcon}
        </span>
      )}
    </button>
  );
}
