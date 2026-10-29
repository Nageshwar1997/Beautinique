import { useMediaQuery, type UseMediaQueryOptions } from './use-media-query';

export type UseIsSmallScreenOptions = UseMediaQueryOptions;

/**
 * Whether the viewport is at most `width` px wide (`(max-width: ${width}px)`), kept in sync with
 * the window as it is resized (useMediaQuery).
 *
 * - The first client render already has the right value (no `false` then `true` flash).
 * - Changing `width` gives the value for the new width straight away.
 * - Safe to render on the server: there it returns `options.serverValue` (`false` by default; no
 *   `window` is touched), and the real value is used once the page runs in the browser.
 * - Without `window.matchMedia` (a very old browser) it stays `false`.
 *
 * @param width - Breakpoint in px. @default 1023
 * @param options - `serverValue`: the value on the server and during hydration. @default false
 */
export const useIsSmallScreen = (width = 1023, options: UseIsSmallScreenOptions = {}): boolean =>
  useMediaQuery(`(max-width: ${String(width)}px)`, options);
