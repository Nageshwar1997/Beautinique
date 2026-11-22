import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';

import {
  clearPendingSearch,
  readLastStartedSearch,
  readPendingSearch,
  setPendingSearch,
  settlePendingSearch,
} from './pending-search';
import { buildSearch, normalizeSearch, type ParamsUpdate, parseParams } from './query-string';
import {
  classifyNavigation,
  type NavigationState,
  readRouterHash,
  readRouterSearch,
  useDataRouter,
} from './router-search';
import { usePathParams } from './use-path-params';

// The logic of `useQueryParams`, in a file of its own that the package index does not export:
// `useQueryParams` wraps it and `useQueryParamInput` is built on it. Only `QueryParamsUpdateOptions`
// is part of the public API, `useQueryParams.ts` passes it on.

export interface QueryParamsUpdateOptions {
  /**
   * Replace the current history entry instead of adding a new one, so the browser's Back button
   * does not return to the URL being replaced. Use it for updates that are not a step the user
   * should be able to go back to - e.g. closing a modal that was opened through a query param.
   *
   * @default false
   */
  replace?: boolean;
}

/**
 * What an update did. Only `useQueryParamInput` looks at it: it has to know whether its text really
 * went out, and how that ended.
 */
export interface UpdateResult {
  /** `false`: the update would have changed nothing, so nothing was sent. */
  sent: boolean;
  /** The query string that was navigated to (only when `sent`). */
  search: string;
  /**
   * With a data router: settles when `navigate()` has returned its promise. That is *not* always
   * the end of the navigation (a revalidation can take it over), so ask `navigationStateOf` what
   * became of it. `null` otherwise.
   */
  done: Promise<void> | null;
}

const NOTHING_SENT: UpdateResult = { sent: false, search: '', done: null };

/** A declarative router's `navigate()` returns nothing; a data router's returns a promise. (Not `instanceof Promise`: that fails for a promise made in another window/iframe.) */
const isThenable = (value: unknown): value is PromiseLike<unknown> =>
  typeof (value as PromiseLike<unknown> | undefined)?.then === 'function';

/**
 * The logic of `useQueryParams`. The public hook wraps it and returns nothing from the update
 * functions; `useQueryParamInput` uses the results.
 */
export const useQueryParamsEngine = () => {
  const { navigate, search, pathname, hash } = usePathParams();
  const router = useDataRouter();

  // The URL React showed in its latest render. Only used with a declarative router (see
  // `currentSearch`), which has no router state to ask.
  const committedSearchRef = useRef(search);
  const committedHashRef = useRef(hash);

  useLayoutEffect(() => {
    committedSearchRef.current = search;
    committedHashRef.current = hash;
  });

  // Once the router shows the URL we navigated to, that navigation is finished.
  useLayoutEffect(() => {
    settlePendingSearch(pathname, search);
  }, [pathname, search]);

  const queryParams = useMemo(() => parseParams(search), [search]);

  // The query string the next update has to build on - the URL as it is *about to be*, not as it was
  // rendered, or updates made before the router and React caught up would overwrite each other:
  // 1. an update of ours that has not finished yet (see `pending-search.ts`);
  // 2. with a data router, what the router says: our own update held by `useBlocker`, a navigation in
  //    flight, or else the committed URL - right even before React has rendered it;
  // 3. otherwise (declarative router) the URL React showed in its latest render.
  const currentSearch = useCallback(() => {
    const pending = readPendingSearch(pathname);

    if (pending !== null) return pending;

    const fromRouter = router
      ? readRouterSearch(router, pathname, readLastStartedSearch(pathname))
      : null;

    return fromRouter ?? committedSearchRef.current;
  }, [pathname, router]);

  // The hash (`#reviews`) is not a param, so an update keeps the one the page has now.
  const currentHash = useCallback(
    () => (router ? readRouterHash(router, pathname) : null) ?? committedHashRef.current,
    [pathname, router],
  );

  // `navigate()` of a data router returns a promise that settles when the navigation is over, however
  // it ended: committed, replaced by a newer navigation, blocked by `useBlocker`, or redirected. From
  // then on the router itself knows the truth, so a pending update must not linger and be built on.
  const navigateTo = useCallback(
    (nextSearch: string, options?: QueryParamsUpdateOptions): UpdateResult => {
      const token = setPendingSearch(pathname, nextSearch);
      const finished = navigate(
        { pathname, search: nextSearch, hash: currentHash() },
        { replace: options?.replace },
      );

      let done: Promise<void> | null = null;

      if (isThenable(finished)) {
        const forget = () => {
          clearPendingSearch(token);
        };

        done = Promise.resolve(finished).then(forget, forget);
      }

      return { sent: true, search: nextSearch, done };
    },
    [currentHash, navigate, pathname],
  );

  const setParams = useCallback(
    (params: ParamsUpdate, options?: QueryParamsUpdateOptions): UpdateResult => {
      const current = currentSearch();
      const nextSearch = buildSearch(current, params);

      // Nothing would change: don't add a duplicate entry for the very same URL.
      if (nextSearch === normalizeSearch(current)) return NOTHING_SENT;

      return navigateTo(nextSearch, options);
    },
    [currentSearch, navigateTo],
  );

  const removeParams = useCallback(
    (keys: string | string[], options?: QueryParamsUpdateOptions): UpdateResult =>
      // A blank value removes a key, and an object update keeps the other params exactly where they were.
      setParams(
        Object.fromEntries((Array.isArray(keys) ? keys : [keys]).map((key) => [key, ''])),
        options,
      ),
    [setParams],
  );

  const clearParams = useCallback(
    (options?: QueryParamsUpdateOptions): UpdateResult => {
      if (normalizeSearch(currentSearch()) === '') return NOTHING_SENT;

      return navigateTo('', options);
    },
    [currentSearch, navigateTo],
  );

  /** Where a navigation to `nextSearch` stands in the router (`null` without a data router). */
  const navigationStateOf = useCallback(
    (nextSearch: string): NavigationState | null =>
      router ? classifyNavigation(router, pathname, nextSearch) : null,
    [pathname, router],
  );

  return { queryParams, setParams, removeParams, clearParams, navigationStateOf };
};
