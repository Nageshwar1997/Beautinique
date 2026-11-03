import { useCallback, useMemo, useSyncExternalStore } from 'react';

export interface UseMediaQueryOptions {
  /**
   * What to return on the server and while the page is being hydrated, where there is no window to
   * ask. Pass what you know about the visitor to avoid a layout flash. The real value replaces it
   * right after hydration; a plain client render never uses it.
   * @default false
   */
  serverValue?: boolean;
}

/**
 * Whether a CSS media query matches, kept in sync as it changes (the window resized, the system
 * switched to dark, the user asked for less motion).
 *
 * ```tsx
 * const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
 * ```
 *
 * - The first client render already has the right value (no flash).
 * - A new `query` gives the value for it straight away.
 * - Safe to render on the server: there it returns `serverValue` (no `window` is touched).
 * - Without `window.matchMedia` (a very old browser) it stays `false`.
 */
export const useMediaQuery = (
  query: string,
  { serverValue = false }: UseMediaQueryOptions = {},
): boolean => {
  // One MediaQueryList per query: reading it is cheap, creating one on every snapshot read is not.
  const mediaQuery = useMemo(
    () =>
      typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia(query)
        : null,
    [query],
  );

  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!mediaQuery) return () => undefined;
      mediaQuery.addEventListener('change', onChange);
      return () => {
        mediaQuery.removeEventListener('change', onChange);
      };
    },
    [mediaQuery],
  );

  const getSnapshot = useCallback(() => mediaQuery?.matches ?? false, [mediaQuery]);

  return useSyncExternalStore(subscribe, getSnapshot, () => serverValue);
};
