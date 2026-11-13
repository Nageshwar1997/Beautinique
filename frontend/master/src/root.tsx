import { useApiClient } from '@beautinique/frontend-api-client';
import { AppFrame, ErrorPage, ServerWake, useReportError } from '@beautinique/frontend-app-shell';
import { Toaster } from '@beautinique/frontend-components';
import type { ReactNode } from 'react';
import { isRouteErrorResponse, Outlet, ScrollRestoration, useRouteError } from 'react-router';

import { MasterFooter } from './components/MasterFooter';
import { MasterHeader } from './components/MasterHeader';
import { Providers } from './providers';

/** The server's own wake address (gateway /wake), straight; none where the build had no address. */
const GATEWAY_URL = import.meta.env.BQ_GATEWAY_URL;
const WAKE_KICK_URL =
  GATEWAY_URL === undefined || GATEWAY_URL === '' ? undefined : `${GATEWAY_URL}/wake`;

/**
 * The wake-up (ServerWake) tells the API client when the server has answered: until then no call
 * goes out, so no page asks a sleeping server and keeps its failure (QA-FE-009, owner 2026-11-07).
 */
function AppWake({ children }: { children: ReactNode }) {
  const client = useApiClient();
  return (
    <ServerWake
      app="master"
      kickUrl={WAKE_KICK_URL}
      onReady={() => {
        client.serverReady();
      }}
    >
      {children}
    </ServerWake>
  );
}

/** The shared frame with this app's top bar and footer, around the page. */
export function Frame() {
  return (
    <AppFrame header={<MasterHeader />} footer={<MasterFooter />}>
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
      <AppWake>
        <Frame />
      </AppWake>
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

/** A route's answer below 500 is expected; anything else goes to monitoring (ARCHITECTURE §14). */
const unexpected = (error: unknown) => !isRouteErrorResponse(error) || error.status >= 500;

/**
 * An unexpected error in a page, inside the normal top bar and footer; reported, as a route's error
 * never reaches the browser's handlers.
 */
export function PageError() {
  const error = useRouteError();
  useReportError(error, unexpected(error));
  return (
    <>
      <title>Something went wrong | Beautinique Master</title>
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

/** The frame itself failed: the error alone, without it (reported like a page's). */
export function RootError() {
  const error = useRouteError();
  useReportError(error, unexpected(error));
  return (
    <main id="main">
      <title>Something went wrong | Beautinique Master</title>
      <ErrorPage
        kind="error"
        title="Something went wrong"
        message="The app could not start. Please reload the page."
        details={technicalDetails(error)}
      />
    </main>
  );
}
