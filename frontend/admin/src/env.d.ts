interface ImportMetaEnv {
  /**
   * The server's address (BQ_GATEWAY_URL, the one key vite.config.ts hands to the browser), without a
   * trailing slash: the wake-up screen calls its /wake straight. Empty where the env has none (CI);
   * undefined in unit tests, which do not load vite.config.ts.
   */
  readonly BQ_GATEWAY_URL: string | undefined;
}
