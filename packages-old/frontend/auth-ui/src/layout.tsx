import { cx } from '@beautinique/frontend-components';
import { type ReactNode, useId } from 'react';
import { Link, type LinkProps } from 'react-router';

/** A text link in the auth screens: the brand colour, underlined, with the focus ring. */
export const TEXT_LINK =
  'text-brand-text focus-ring rounded-sm font-medium underline underline-offset-4 hover:no-underline';

/** A react-router Link styled as TEXT_LINK. */
export function TextLink({ className, ...link }: LinkProps) {
  return <Link {...link} className={cx(TEXT_LINK, className)} />;
}

export interface AuthLayoutProps {
  /** The page's heading (one h1 per page). */
  title: string;
  /** One line under it. */
  description?: ReactNode;
  children: ReactNode;
  /** Under the card: "New to Beautinique? Create an account". */
  footer?: ReactNode;
}

/**
 * An auth page: a narrow card in the middle, full width on a phone, the heading naming the form
 * (the form is labelled by it).
 */
export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  const titleId = useId();
  return (
    <div className="container-page flex justify-center py-8 sm:py-14">
      <section
        aria-labelledby={titleId}
        className="w-full max-w-md sm:border-border sm:bg-surface sm:rounded-2xl sm:border sm:p-8 sm:shadow-sm"
      >
        <h1 id={titleId} className="font-display text-3xl font-medium">
          {title}
        </h1>
        {description !== undefined && (
          <p className="text-foreground-muted mt-2 text-sm">{description}</p>
        )}
        <div className="mt-6">{children}</div>
        {footer !== undefined && (
          <div className="border-border text-foreground-muted mt-6 border-t pt-5 text-sm">
            {footer}
          </div>
        )}
      </section>
    </div>
  );
}
