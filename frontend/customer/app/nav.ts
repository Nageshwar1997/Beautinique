import type { NavItem } from '@beautinique/frontend-app-shell';

/**
 * The customer app's main nav. Only pages that exist go here, so the nav never has a dead link:
 * Categories, Search, Cart and Account (DESIGN §10, the phone's bottom nav too) join as they are built.
 * With one page there is nothing to navigate, so the header shows no nav yet.
 */
export const MAIN_NAV: readonly NavItem[] = [];

/** Footer links: pages every visitor may need. */
export const FOOTER_NAV: readonly NavItem[] = [{ label: 'Icon credits', to: '/credits' }];
