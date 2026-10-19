import type { Plugin } from 'vite';

export interface BeautiniqueFontsOptions {
  /**
   * Fonts to preload on every page. Default `['sans']`.
   * Add `'display'` in apps whose first screen shows a `font-display` heading (the storefront).
   */
  preload?: Array<'sans' | 'display'>;
}

export declare function beautiniqueFonts(options?: BeautiniqueFontsOptions): Plugin;
export default beautiniqueFonts;
