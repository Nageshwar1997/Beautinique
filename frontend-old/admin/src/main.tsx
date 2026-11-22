import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';

import { routes } from './routes';

/**
 * Error monitoring (ARCHITECTURE §14): Sentry comes in its own file after the app has started, and
 * only where the build has a DSN (Vercel), so the app never waits for it. No Replay here: the
 * organization's 50 a month go to the customer app.
 */
const SENTRY_DSN = import.meta.env.BQ_SENTRY_DSN;
if (SENTRY_DSN !== undefined && SENTRY_DSN !== '') {
  void import('@beautinique/frontend-app-shell/monitoring')
    .then(({ initMonitoring }) => {
      initMonitoring({
        app: 'admin',
        dsn: SENTRY_DSN,
        environment: import.meta.env.BQ_SENTRY_ENVIRONMENT,
        release: import.meta.env.BQ_SENTRY_RELEASE,
      });
    })
    // its file did not load (offline): the app goes on without monitoring
    .catch(() => undefined);
}

const root = document.getElementById('root');
if (!root) {
  throw new Error('index.html has no #root element');
}

createRoot(root).render(
  <StrictMode>
    <RouterProvider router={createBrowserRouter(routes)} />
  </StrictMode>,
);
