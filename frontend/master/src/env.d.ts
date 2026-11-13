interface ImportMetaEnv {
  /**
   * The server's address (BQ_GATEWAY_URL, the one key vite.config.ts hands to the browser), without a
   * trailing slash: the wake-up screen calls its /wake straight. Empty where the env has none (CI);
   * undefined in unit tests, which do not load vite.config.ts.
   */
  readonly BQ_GATEWAY_URL: string | undefined;
  /** The Sentry DSN of `bq-frontend` (BQ_SENTRY_DSN; public by design). Empty = no monitoring. */
  readonly BQ_SENTRY_DSN: string | undefined;
  /** Vercel's VERCEL_ENV (`production`, `preview`); empty elsewhere. */
  readonly BQ_SENTRY_ENVIRONMENT: string | undefined;
  /** The deployed commit (Vercel's VERCEL_GIT_COMMIT_SHA); empty elsewhere. */
  readonly BQ_SENTRY_RELEASE: string | undefined;
}
