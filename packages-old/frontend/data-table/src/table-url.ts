import { useQueryParams } from '@beautinique/frontend-hooks/router';
import { useCallback, useMemo } from 'react';

// a cursor as the API gives it (an ObjectId, a token): anything else in the URL is a first page
const CURSOR = /^[A-Za-z0-9_-]{1,128}$/;
/** Pages kept in the URL: past this the trail starts again from the first page. */
export const MAX_PAGES = 50;

export interface TableUrlOptions<Filter extends string> {
  /** Each filter's URL param and its default (`''` = no filter); a default is left out of the URL */
  filters: Readonly<Record<Filter, string>>;
  /** The URL param of the pages' trail (default `pages`) */
  pagesParam?: string;
}

export interface TableUrl<Filter extends string> {
  /** Every filter's value now: from the URL, else its default */
  filters: Readonly<Record<Filter, string>>;
  /** Sets filters, and goes back to the first page: a default or `''` leaves the URL (the default again) */
  setFilters: (update: Partial<Record<Filter, string>>) => void;
  /** Every filter back to its default, the first page */
  clearFilters: () => void;
  /** Whether any filter differs from its default */
  filtered: boolean;
  /** The cursor of this page for the API; undefined on the first page */
  cursor: string | undefined;
  /** This page's number, from 1 */
  page: number;
  /** To the page after this one (the API's `nextCursor`) */
  next: (nextCursor: string) => void;
  /** To the page before this one */
  previous: () => void;
}

/**
 * A list page's filters and cursor pages, in the URL (ARCHITECTURE §9.2: URL-synced filters): a
 * reload, a shared link and the browser's Back show the same rows. The pages are a trail of the
 * API's cursors (`?pages=c1.c2`), so Previous works without the API paging backwards. Changing a
 * filter starts again from the first page.
 */
export function useTableUrl<Filter extends string>({
  filters: defaults,
  pagesParam = 'pages',
}: TableUrlOptions<Filter>): TableUrl<Filter> {
  const { queryParams, setParams } = useQueryParams();
  const keys = useMemo(() => Object.keys(defaults) as Filter[], [defaults]);

  const filters = useMemo(
    () =>
      Object.fromEntries(keys.map((key) => [key, queryParams[key] ?? defaults[key]])) as Record<
        Filter,
        string
      >,
    [keys, queryParams, defaults],
  );
  const trail = useMemo(() => {
    const cursors = (queryParams[pagesParam] ?? '').split('.').filter((part) => part !== '');
    return cursors.length <= MAX_PAGES && cursors.every((part) => CURSOR.test(part)) ? cursors : [];
  }, [queryParams, pagesParam]);

  const setFilters = useCallback(
    (update: Partial<Record<Filter, string>>) => {
      const changes: Record<string, string | null> = { [pagesParam]: null };
      for (const key of keys) {
        const value = update[key];
        if (value === undefined) continue;
        changes[key] = value === defaults[key] || value === '' ? null : value;
      }
      setParams(changes);
    },
    [keys, defaults, pagesParam, setParams],
  );

  const clearFilters = useCallback(() => {
    setParams(Object.fromEntries([...keys, pagesParam].map((key) => [key, null])));
  }, [keys, pagesParam, setParams]);

  const next = useCallback(
    (nextCursor: string) => {
      const more = [...trail, nextCursor];
      setParams({ [pagesParam]: more.length > MAX_PAGES ? null : more.join('.') });
    },
    [trail, pagesParam, setParams],
  );
  const previous = useCallback(() => {
    setParams({ [pagesParam]: trail.slice(0, -1).join('.') || null });
  }, [trail, pagesParam, setParams]);

  return {
    filters,
    setFilters,
    clearFilters,
    filtered: keys.some((key) => filters[key] !== defaults[key]),
    cursor: trail.at(-1),
    page: trail.length + 1,
    next,
    previous,
  };
}
