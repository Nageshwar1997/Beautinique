import { NavList, ThemeSwitcher } from '@beautinique/frontend-app-shell';
import { AccountMenu } from '@beautinique/frontend-auth-ui';
import { BrandMark } from '@beautinique/frontend-icons';
import { Link } from 'react-router';

import { ACCOUNT_NAV, MAIN_NAV } from '../nav';

/** The account menu's pages, above "Sign out". */
const ACCOUNT_LINKS = ACCOUNT_NAV.map(({ to, label }) => ({ href: to, label }));

/**
 * The admin app's top bar: the mark and the app's name (home), the main nav, the theme switcher
 * and the account (sign in, or the account menu).
 */
export function AdminHeader() {
  return (
    <header className="border-border bg-surface/90 sticky top-0 z-10 border-b backdrop-blur">
      <div className="container-page flex min-h-16 items-center gap-3">
        <Link
          to="/"
          aria-label="Beautinique Admin home"
          className="text-foreground min-h-touch mr-auto inline-flex items-center gap-2 rounded-md"
        >
          <BrandMark size={36} />
          <span className="font-display text-lg font-medium">Admin</span>
        </Link>
        <NavList items={MAIN_NAV} label="Main" className="hidden md:block" />
        <ThemeSwitcher />
        <AccountMenu links={ACCOUNT_LINKS} />
      </div>
    </header>
  );
}
