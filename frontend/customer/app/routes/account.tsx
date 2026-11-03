import { NavList } from '@beautinique/frontend-app-shell';
import { RequireSignIn } from '@beautinique/frontend-auth-ui';
import { Outlet } from 'react-router';

import { ACCOUNT_NAV } from '../nav';

/**
 * The account pages (ARCHITECTURE §9.2, owner 2026-11-03): signed in only, so on the server (no
 * session) a quiet spinner, and someone signed out goes to sign-in and comes back here.
 */
export default function AccountLayout() {
  return (
    <RequireSignIn>
      <div className="container-page max-w-3xl space-y-6 py-8 sm:py-12">
        <NavList items={ACCOUNT_NAV} label="Account" />
        <Outlet />
      </div>
    </RequireSignIn>
  );
}
