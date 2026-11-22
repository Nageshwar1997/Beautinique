import { useMemo } from 'react';
import { type NavigateFunction, useLocation, useNavigate, useParams } from 'react-router';

/**
 * Current route info in one place: the route's dynamic `pathParams`, the `location` (also spread
 * flat: `pathname`, `search`, `hash`, `state`, `key`), `paths` (the pathname split into its
 * non-empty segments) and `navigate`.
 *
 * - `location` is the router's own object, for code that passes a whole location on (`<Navigate
 *   state={location} />`, `useBlocker`, comparing two locations). The flat copies are for the common
 *   case of needing one field, so `const { pathname } = usePathParams()` works. Both are the same
 *   values and change together.
 * - The returned object keeps its identity until the location changes, and `pathParams` and `paths`
 *   only change when their content does, so they are safe in dependency arrays.
 * - While a `useBlocker` blocks a navigation nothing here changes, because the router's location
 *   does not: `reset()` leaves it as it was and `proceed()` moves it.
 *
 * The keys of `pathParams` can be given once, by the page that knows its route:
 * `usePathParams<'categoryL1' | 'slug'>()` types `pathParams.slug` as `string | undefined` and
 * rejects a misspelt key. A record type works too (`usePathParams<{ slug?: string }>()`). Without a
 * type argument any key is allowed, as before.
 *
 * Needs to be rendered inside a React Router (`react-router-dom`) router.
 */
export const usePathParams = <
  TParams extends string | Record<string, string | undefined> = string,
>() => {
  const navigate: NavigateFunction = useNavigate();
  const routerParams = useParams<TParams>();
  const location = useLocation();
  const { pathname } = location;

  // React Router builds a brand-new `params` object whenever its <Routes> re-renders. Keying on the
  // content gives callers an object that only changes when a param value does.
  const paramsKey = JSON.stringify(routerParams);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by content on purpose
  const pathParams = useMemo(() => routerParams, [paramsKey]);

  // Only the pathname decides the segments, so a query-string or hash change keeps the same array.
  const paths = useMemo(() => pathname.split('/').filter((path) => path !== ''), [pathname]);

  return useMemo(
    () => ({ pathParams, location, ...location, paths, navigate }),
    [pathParams, location, paths, navigate],
  );
};
