import { useCallback } from 'react';

import { type ParamsUpdate } from './query-string';
import { type QueryParamsUpdateOptions, useQueryParamsEngine } from './use-query-params-engine';

export type { StringRecord } from './query-string';
export type { QueryParamsUpdateOptions } from './use-query-params-engine';

/**
 * Read and update the URL query string (`?a=1&b=2`) of the current route.
 *
 * - `queryParams`: the current params as an object (a repeated key keeps its last value). It only
 *   changes identity when the URL's query string changes, so it is safe in dependency arrays.
 * - `setParams`: merges the given params into the current ones (or pass an updater function to
 *   build the next params from the previous). `''`, `null` and `undefined` values are dropped from
 *   the URL.
 * - `removeParams`: removes one key or a list of keys.
 * - `clearParams`: removes every param.
 *
 * Updates:
 * - Several updates in a row build on each other, like `setState` updaters do - also when they come
 *   from different components that each call `useQueryParams()`, and also while the router has not
 *   finished the previous navigation yet (with a data router that takes a few ms).
 * - A param an update does not touch keeps all its non-blank values (`?tag=a&tag=b`) and its
 *   position.
 * - Each update navigates to the same pathname with the new `search`, as a new history entry unless
 *   `{ replace: true }` is passed. An update that would leave the query string unchanged does not
 *   navigate at all. The hash is kept; the location `state` is not.
 * - With a data router an update builds on what the router says the URL is or is about to be:
 *   a navigation in flight, an update of ours held by `useBlocker` (until `reset()`), or else the
 *   committed URL - never on an update that was blocked and reset, replaced, redirected or failed.
 *
 * Needs to be rendered inside a React Router (`react-router-dom`) router.
 */
export const useQueryParams = () => {
  const engine = useQueryParamsEngine();
  const { setParams: send, removeParams: sendRemove, clearParams: sendClear } = engine;

  const setParams = useCallback(
    (params: ParamsUpdate, options?: QueryParamsUpdateOptions): void => {
      send(params, options);
    },
    [send],
  );

  const removeParams = useCallback(
    (keys: string | string[], options?: QueryParamsUpdateOptions): void => {
      sendRemove(keys, options);
    },
    [sendRemove],
  );

  const clearParams = useCallback(
    (options?: QueryParamsUpdateOptions): void => {
      sendClear(options);
    },
    [sendClear],
  );

  return { queryParams: engine.queryParams, setParams, removeParams, clearParams };
};
