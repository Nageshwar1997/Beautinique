import { NavList } from '@beautinique/frontend-app-shell';
import { RequireSignIn } from '@beautinique/frontend-auth-ui';
import { Outlet } from 'react-router';

import { ACCOUNT_NAV } from '../nav';
import type { Route } from './+types/account';

/**
 * `/account` itself (on its way to Security), and any account page without a meta of its own:
 * signed in only, so never in a search engine (QA-CUS-001).
 */
export const meta: Route.MetaFunction = () => [
  { title: 'Account | Beautinique' },
  { name: 'robots', content: 'noindex' },
];

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
