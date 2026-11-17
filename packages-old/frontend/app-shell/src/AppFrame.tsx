import type { ReactNode } from 'react';

export interface AppFrameProps {
  /** The app's own header (customer: logo and nav; internal apps: top bar). */
  header?: ReactNode;
  /** The app's own footer. */
  footer?: ReactNode;
  children: ReactNode;
  /** Text of the skip link (default "Skip to content"). */
  skipLinkLabel?: string;
}

/**
 * The frame of every page: a skip link that is the first thing a keyboard reaches, the app's header,
 * one `<main id="main">` (the skip link's target) that grows to fill the screen, and the footer.
 */
export function AppFrame({
  header,
  footer,
  children,
  skipLinkLabel = 'Skip to content',
}: AppFrameProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="skip-link">
        {skipLinkLabel}
      </a>
      {header}
      {/* tabIndex -1: the skip link moves focus here, so the next Tab starts inside the content */}
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      {footer}
    </div>
  );
}
