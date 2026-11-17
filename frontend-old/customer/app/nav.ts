import type { NavItem } from '@beautinique/frontend-app-shell';
import { ACCOUNT_PATHS } from '@beautinique/frontend-auth-ui';

/**
 * The customer app's main nav. Only pages that exist go here, so the nav never has a dead link:
 * Categories, Search, Cart and Account (DESIGN §10, the phone's bottom nav too) join as they are built.
 * With one page there is nothing to navigate, so the header shows no nav yet.
 */
export const MAIN_NAV: readonly NavItem[] = [];

/** Footer links: pages every visitor may need. */
export const FOOTER_NAV: readonly NavItem[] = [
  { label: 'Terms of use', to: '/terms' },
  { label: 'Privacy notice', to: '/privacy' },
  { label: 'Icon credits', to: '/credits' },
];

/** The account's pages: the account menu in the header, and the nav on the account pages. */
export const ACCOUNT_NAV: readonly NavItem[] = [
  { label: 'Security', to: ACCOUNT_PATHS.security },
  { label: 'My Devices', to: ACCOUNT_PATHS.devices },
];
