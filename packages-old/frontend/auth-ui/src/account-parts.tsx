import { cx, type Tone, TONE_CLASS } from '@beautinique/frontend-components';
import type { AppId } from '@beautinique/shared-contracts';
import { type ReactNode, useEffect, useId, useRef } from 'react';
import { Link, type LinkProps } from 'react-router';

/** How each app is named to the person (as in notify's emails): the customer app is the shop. */
export const APP_NAMES: Readonly<Record<AppId, string>> = {
  customer: 'Beautinique',
  seller: 'Beautinique Seller',
  admin: 'Beautinique Admin',
  superadmin: 'Beautinique Super Admin',
  master: 'Beautinique Master',
  support: 'Beautinique Support',
  finance: 'Beautinique Finance',
  logistics: 'Beautinique Logistics',
  delivery: 'Beautinique Delivery',
  growth: 'Beautinique Growth',
  creator: 'Beautinique Creator',
};

const LINK_BUTTON = {
  solid: 'bg-tone text-tone-foreground hover:bg-tone-hover',
  outline: 'border border-tone bg-transparent text-tone-subtle-foreground hover:bg-tone-subtle',
} as const;

/** A link that looks like a medium button (the components' Button is for actions, not pages). */
export function LinkButton({
  variant = 'outline',
  className,
  ...link
}: LinkProps & { variant?: keyof typeof LINK_BUTTON }) {
  return (
    <Link
      {...link}
      className={cx(
        'tone-brand focus-ring min-h-touch inline-flex shrink-0 items-center justify-center rounded-full px-5 text-base font-medium whitespace-nowrap',
        LINK_BUTTON[variant],
        className,
      )}
    />
  );
}

/** A short status next to a heading: "On", "This device". */
export function StatusBadge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span
      className={cx(
        TONE_CLASS[tone],
        'bg-tone-subtle text-tone-subtle-foreground inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      )}
    >
      {children}
    </span>
  );
}

export interface AccountCardProps {
  title: string;
  /** Next to the title: a StatusBadge. */
  status?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Moves the focus to the title when it appears (a view that replaced the one with the focus). */
  focusTitle?: boolean;
}

/** One part of an account page: a titled card. */
export function AccountCard({
  title,
  status,
  description,
  children,
  focusTitle,
}: AccountCardProps) {
  const titleId = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (focusTitle) heading.current?.focus();
  }, [focusTitle]);
  return (
    <section
      aria-labelledby={titleId}
      className="border-border bg-surface space-y-4 rounded-2xl border p-5 sm:p-6"
    >
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h2
            id={titleId}
            ref={heading}
            tabIndex={focusTitle ? -1 : undefined}
            className="font-display text-xl font-medium outline-hidden"
          >
            {title}
          </h2>
          {status}
        </div>
        {description !== undefined && (
          <p className="text-foreground-muted text-sm">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}
