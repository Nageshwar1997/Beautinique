import { AppFrame, ErrorPage, ServerWake } from '@beautinique/frontend-app-shell';
import { Toaster } from '@beautinique/frontend-components';
import { isRouteErrorResponse, Outlet, ScrollRestoration, useRouteError } from 'react-router';

import { AdminFooter } from './components/AdminFooter';
import { AdminHeader } from './components/AdminHeader';
import { Providers } from './providers';

/** The server's own wake address (gateway /wake), straight; none where the build had no address. */
const GATEWAY_URL = import.meta.env.BQ_GATEWAY_URL;
const WAKE_KICK_URL =
  GATEWAY_URL === undefined || GATEWAY_URL === '' ? undefined : `${GATEWAY_URL}/wake`;

/** The shared frame with this app's top bar and footer, around the page. */
export function Frame() {
  return (
    <AppFrame header={<AdminHeader />} footer={<AdminFooter />}>
      <Outlet />
    </AppFrame>
  );
}

/**
 * Every page: the providers, then the frame, which a plain loader covers until the live server
 * answers, and the wake-up screen while it starts (it sleeps when idle). Rendered only in the
 * browser, so no head script is needed: ServerWake marks `<html>` before its first paint.
 */
export function AppRoot() {
  return (
    <Providers>
      <ServerWake app="admin" kickUrl={WAKE_KICK_URL}>
        <Frame />
      </ServerWake>
      <Toaster />
      <ScrollRestoration />
    </Providers>
  );
}

/** What a developer needs to see. Production shows none of it. */
function technicalDetails(error: unknown): string | undefined {
  if (!import.meta.env.DEV) return undefined;
  if (isRouteErrorResponse(error)) {
    return `${String(error.status)} ${error.statusText}\n${JSON.stringify(error.data, null, 2)}`;
  }
  return error instanceof Error ? (error.stack ?? error.message) : String(error);
}

/** An unexpected error in a page, inside the normal top bar and footer. */
export function PageError() {
  const error = useRouteError();
  return (
    <>
      <title>Something went wrong | Beautinique Admin</title>
      <ErrorPage
        kind="error"
        status={isRouteErrorResponse(error) ? error.status : undefined}
        title="Something went wrong"
        message="A little spill on our side. Please try again in a moment."
        details={technicalDetails(error)}
      />
    </>
  );
}

/** The frame itself failed: the error alone, without it. */
export function RootError() {
  const error = useRouteError();
  return (
    <main id="main">
      <title>Something went wrong | Beautinique Admin</title>
      <ErrorPage
        kind="error"
        title="Something went wrong"
        message="The app could not start. Please reload the page."
        details={technicalDetails(error)}
      />
    </main>
  );
}
