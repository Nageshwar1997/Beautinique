import { NavList, ThemeSwitcher } from '@beautinique/frontend-app-shell';
import { Link } from 'react-router';

import { MAIN_NAV } from '../nav';

/** The customer app's header: the wordmark (home), the main nav, and the theme switcher. */
export function SiteHeader() {
  return (
    <header className="border-border bg-surface/90 sticky top-0 z-10 border-b backdrop-blur">
      <div className="container-page flex min-h-16 items-center gap-3">
        <Link
          to="/"
          aria-label="Beautinique home"
          className="font-display text-brand-gradient min-h-touch mr-auto inline-flex items-center rounded-md text-2xl font-medium"
        >
          Beautinique
        </Link>
        <NavList items={MAIN_NAV} label="Main" className="hidden md:block" />
        <ThemeSwitcher />
      </div>
    </header>
  );
}
