import { normalizeSearch } from './query-string';

/**
 * The query string that `useQueryParams` has navigated to but nothing shows yet.
 *
 * `navigate()` does not change the URL in the same tick: with a data router (`createBrowserRouter`) it
 * commits a few ms later, and with a declarative router React renders it a moment later. Until then,
 * every `useQueryParams()` on the page - however many components use it - must build its next update
 * on this one, not on the old URL, or the updates overwrite each other (status picked in one
 * component, search typed in another, `removeParams` and `setParams` in the same handler...). So it
 * is kept here, shared by all instances, instead of inside each hook.
 *
 * It lives only for that moment. With a data router `useQueryParams` clears it as soon as the
 * navigation has finished one way or another (committed, replaced by a newer navigation, blocked by
 * `useBlocker`, redirected) and then asks the router itself, so it never outlives the navigation.
 * With a declarative router there is nothing to ask, so it is cleared when the URL shows it, or
 * forgotten after `PENDING_SEARCH_MAX_AGE_MS`. Updates are made from event handlers and timers, never
 * while rendering, so nothing here runs on the server.
 */
interface PendingSearch {
  token: number;
  pathname: string;
  search: string;
  startedAt: number;
}

interface PendingStore {
  pending: PendingSearch | null;
  /** The last navigation started, even after it has finished: tells our own updates apart from other navigations. */
  lastStarted: { pathname: string; search: string } | null;
  nextToken: number;
}

/** A navigation that has not committed after this long is assumed lost; the router's URL is trusted again. */
export const PENDING_SEARCH_MAX_AGE_MS = 2000;

// Kept on `globalThis`: if a page ends up with two copies of this package (two bundles, two versions),
// they must still see the same pending navigation, or they would overwrite each other's updates.
const STORE_KEY = Symbol.for('@beautinique/frontend-hooks:pending-search');

const getStore = (): PendingStore => {
  const holder = globalThis as { [STORE_KEY]?: PendingStore };

  holder[STORE_KEY] ??= { pending: null, lastStarted: null, nextToken: 1 };

  return holder[STORE_KEY];
};

/** The query string a navigation on `pathname` is on its way to, or `null` when none is in flight. */
export const readPendingSearch = (pathname: string): string | null => {
  const { pending } = getStore();

  if (!pending) return null;

  if (pending.pathname !== pathname || Date.now() - pending.startedAt > PENDING_SEARCH_MAX_AGE_MS) {
    return null;
  }

  return pending.search;
};

/**
 * Remember that a navigation to `search` (on `pathname`) has just been started. Returns a token for
 * `clearPendingSearch`.
 */
export const setPendingSearch = (pathname: string, search: string): number => {
  const store = getStore();
  const token = store.nextToken++;

  store.pending = { token, pathname, search, startedAt: Date.now() };
  store.lastStarted = { pathname, search };

  return token;
};

/**
 * The query string of the last navigation we started on `pathname` (even if it has finished), or
 * `null`. A blocker holding exactly this one is holding *our* update.
 */
export const readLastStartedSearch = (pathname: string): string | null => {
  const { lastStarted } = getStore();

  return lastStarted?.pathname === pathname ? lastStarted.search : null;
};

/**
 * The navigation that got `token` has finished (committed, replaced, blocked, redirected): forget it.
 * Does nothing if a newer navigation has been started since - that one is still on its way.
 */
export const clearPendingSearch = (token: number): void => {
  const store = getStore();

  if (store.pending?.token === token) {
    store.pending = null;
  }
};

/**
 * Call with the URL React shows: once it is the one we were navigating to, the navigation is done
 * and that URL is the truth again. A different URL (an older navigation committing, the user
 * pressing Back...) leaves the pending one alone: a newer update may still be on its way.
 */
export const settlePendingSearch = (pathname: string, committedSearch: string): void => {
  const store = getStore();
  const { pending } = store;

  if (
    pending?.pathname === pathname &&
    normalizeSearch(pending.search) === normalizeSearch(committedSearch)
  ) {
    store.pending = null;
  }
};

/** For tests: forget any pending navigation. */
export const resetPendingSearch = (): void => {
  const store = getStore();

  store.pending = null;
  store.lastStarted = null;
};
