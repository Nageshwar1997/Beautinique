import { NavList, ThemeSwitcher } from '@beautinique/frontend-app-shell';
import { AccountMenu } from '@beautinique/frontend-auth-ui';
import { BrandMark } from '@beautinique/frontend-icons';
import { Link } from 'react-router';

import { ACCOUNT_NAV, MAIN_NAV } from '../nav';

/** The account menu's pages, above "Sign out". */
const ACCOUNT_LINKS = ACCOUNT_NAV.map(({ to, label }) => ({ href: to, label }));

/**
 * The Master app's top bar: the mark and the app's name (home), the main nav, the theme switcher
 * and the account (sign in, or the account menu). On a phone the mark alone, as in the customer
 * and admin apps (QA-ADM-001: with the name the bar was wider than a 360 px screen); the link keeps
 * its full name for screen readers.
 */
export function MasterHeader() {
  return (
    <header className="border-border bg-surface/90 sticky top-0 z-10 border-b backdrop-blur">
      <div className="container-page flex min-h-16 items-center gap-3">
        <Link
          to="/"
          aria-label="Beautinique Master home"
          className="text-foreground min-h-touch mr-auto inline-flex items-center gap-2 rounded-md"
        >
          <BrandMark size={36} />
          <span className="font-display hidden text-lg font-medium sm:inline">Master</span>
        </Link>
        <NavList items={MAIN_NAV} label="Main" className="hidden md:block" />
        <ThemeSwitcher />
        <AccountMenu links={ACCOUNT_LINKS} />
      </div>
    </header>
  );
}
