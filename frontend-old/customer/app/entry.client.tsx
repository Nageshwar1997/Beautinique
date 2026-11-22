import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';

/**
 * React Router's own client entry, plus error monitoring (ARCHITECTURE §14): Sentry comes in its own
 * file after the page has started, and only where the build has a DSN (Vercel), so the page never
 * waits for it. Replay records only sessions that hit an error, with every text masked.
 */
const SENTRY_DSN = import.meta.env.BQ_SENTRY_DSN;
if (SENTRY_DSN !== undefined && SENTRY_DSN !== '') {
  void import('@beautinique/frontend-app-shell/monitoring')
    .then(({ initMonitoring, replay }) => {
      initMonitoring({
        app: 'customer',
        dsn: SENTRY_DSN,
        environment: import.meta.env.BQ_SENTRY_ENVIRONMENT,
        release: import.meta.env.BQ_SENTRY_RELEASE,
        integrations: [replay()],
      });
    })
    // its file did not load (offline): the page goes on without monitoring
    .catch(() => undefined);
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>,
  );
});
