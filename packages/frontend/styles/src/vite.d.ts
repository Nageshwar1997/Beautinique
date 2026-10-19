import type { Plugin } from 'vite';

export interface BeautiniqueFontsOptions {
  /**
   * Latin fonts to preload on every page. Default `['sans']`.
   * Add `'display'` in apps whose first screen shows a `font-display` heading (the storefront).
   */
  preload?: Array<'sans' | 'display'>;
  /**
   * Preload the Devanagari font only for visitors whose saved language is Hindi or Marathi.
   * `storageKey` is the localStorage key the app stores the language in; `values` default `['hi', 'mr']`.
   * Uses a small inline script: with a strict Content-Security-Policy, allow it by hash.
   */
  devanagari?: false | { storageKey: string; values?: string[] };
}

export declare function beautiniqueFonts(options?: BeautiniqueFontsOptions): Plugin;
export default beautiniqueFonts;
