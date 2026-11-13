import type { NavItem } from '@beautinique/frontend-app-shell';
import { ACCOUNT_PATHS } from '@beautinique/frontend-auth-ui';

/**
 * The Master app's main nav. Only pages that exist go here, so the nav never has a dead link: roles,
 * approvals and the emergency controls join as they are built. With one page there is nothing to
 * navigate, so the header shows no nav yet.
 */
export const MAIN_NAV: readonly NavItem[] = [];

/** Footer links: pages everyone may need, signed in or not. */
export const FOOTER_NAV: readonly NavItem[] = [{ label: 'Icon credits', to: '/credits' }];

/** The account's pages: the account menu in the header, and the nav on the account pages. */
export const ACCOUNT_NAV: readonly NavItem[] = [
  { label: 'Security', to: ACCOUNT_PATHS.security },
  { label: 'My Devices', to: ACCOUNT_PATHS.devices },
];

/** The browser tab's title of a page. */
export const pageTitle = (page: string): string => `${page} | Beautinique Master`;
