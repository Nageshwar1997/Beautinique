import { type ContextType, useContext } from 'react';
import { UNSAFE_DataRouterContext } from 'react-router';

import { normalizeSearch } from './query-string';

export type DataRouter = NonNullable<ContextType<typeof UNSAFE_DataRouterContext>>['router'];

/** Where a navigation of ours stands, according to the router. */
export type NavigationState =
  /** The router shows the URL we navigated to. */
  | 'committed'
  /** `useBlocker` is holding it: `proceed()` will still deliver it, `reset()` will not. */
  | 'held'
  /** The router is still loading it (also after a revalidation took the navigation over). */
  | 'coming'
  /** It will not arrive: replaced by a newer navigation, redirected, or it failed. */
  | 'lost';

/**
 * The data router (`createBrowserRouter`, `createMemoryRouter`...) this component is rendered in, or
 * `null` with a declarative router (`BrowserRouter`, `MemoryRouter`), which has no router state to ask.
 *
 * `UNSAFE_DataRouterContext` is the only way to reach the router from a hook; React Router's own
 * internals and other libraries use it the same way. If it ever changes shape, the hooks fall back to
 * the behaviour they have with a declarative router.
 */
export const useDataRouter = (): DataRouter | null =>
  useContext(UNSAFE_DataRouterContext)?.router ?? null;

/**
 * The hash (`#reviews`) the router is on right now, read from the router so it is right even before
 * React has rendered the latest navigation. `null` when the router is on another pathname.
 */
export const readRouterHash = (router: DataRouter, pathname: string): string | null =>
  router.state.location.pathname === pathname ? router.state.location.hash : null;

/**
 * Is a navigation to exactly `search` (on `pathname`) being held (`blocked`) or let through
 * (`proceeding`) by `useBlocker`? A blocked Back/Forward or link is a different `search`, so it is
 * not mistaken for ours.
 */
export const isHeldByBlocker = (router: DataRouter, pathname: string, search: string): boolean => {
  for (const blocker of router.state.blockers.values()) {
    if (
      blocker.state !== 'unblocked' &&
      blocker.location.pathname === pathname &&
      normalizeSearch(blocker.location.search) === normalizeSearch(search)
    ) {
      return true;
    }
  }

  return false;
};

/** How the navigation to `search` (on `pathname`) stands right now. */
export const classifyNavigation = (
  router: DataRouter,
  pathname: string,
  search: string,
): NavigationState => {
  const { location, navigation } = router.state;
  const wanted = normalizeSearch(search);

  if (location.pathname === pathname && normalizeSearch(location.search) === wanted) {
    return 'committed';
  }

  if (isHeldByBlocker(router, pathname, search)) return 'held';

  if (
    navigation.state !== 'idle' &&
    navigation.location.pathname === pathname &&
    normalizeSearch(navigation.location.search) === wanted
  ) {
    return 'coming';
  }

  return 'lost';
};

/**
 * What the router says the query string of `pathname` is, or is about to be - read from the router,
 * so it is right even before React has rendered the latest navigation. In this order:
 *
 * 1. a navigation `useBlocker` is holding (`blocked`) or letting through (`proceeding`), when it is
 *    one of ours (`ownSearch` is the last query string we navigated to): `proceed()` goes to the
 *    *last* blocked target, so our next update has to build on that one. A blocked Back/Forward or
 *    link click is not ours - the page stays where it is, so it is ignored;
 * 2. a navigation in flight (made by us or by anyone else: a link, `navigate()`...);
 * 3. the committed URL.
 *
 * Returns `null` when the router is on another pathname than `pathname` (React has not caught up yet).
 */
export const readRouterSearch = (
  router: DataRouter,
  pathname: string,
  ownSearch: string | null,
): string | null => {
  const { navigation, location } = router.state;

  if (ownSearch !== null && isHeldByBlocker(router, pathname, ownSearch)) {
    return ownSearch;
  }

  if (navigation.state !== 'idle' && navigation.location.pathname === pathname) {
    return navigation.location.search;
  }

  return location.pathname === pathname ? location.search : null;
};
