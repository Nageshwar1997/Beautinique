import { useApiClient } from '@beautinique/frontend-api-client';
import {
  AppFrame,
  ErrorPage,
  ServerWake,
  ThemeScript,
  useReportError,
  WakeScript,
} from '@beautinique/frontend-app-shell';
import { Toaster } from '@beautinique/frontend-components';
import displayFont from '@beautinique/frontend-styles/fonts/fraunces-latin.woff2?url';
import sansFont from '@beautinique/frontend-styles/fonts/plus-jakarta-sans-latin.woff2?url';
import type { ReactNode } from 'react';
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';

import type { Route } from './+types/root';
import stylesheet from './app.css?url';
import { SiteFooter } from './components/SiteFooter';
import { SiteHeader } from './components/SiteHeader';
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
      app="customer"
      kickUrl={WAKE_KICK_URL}
      onReady={() => {
        client.serverReady();
      }}
    >
      {children}
    </ServerWake>
  );
}

/**
 * The stylesheet as a <link> (in development too, so it is never swapped for a <style> after hydration,
 * which would load the fonts again and flash the fallback font), and the brand fonts preloaded so the
 * first paint already uses them. Vite gives these files the same URLs the stylesheet uses.
 */
export const links: Route.LinksFunction = () => [
  { rel: 'preload', href: sansFont, as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
  { rel: 'preload', href: displayFont, as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' },
  { rel: 'stylesheet', href: stylesheet },
];

/**
 * Every page, error pages too: the saved theme applied before the first paint (ThemeScript; it sets
 * `<html theme>`, hence suppressHydrationWarning), and the loader marked on `<html>` too (WakeScript:
 * the prerendered page stays covered until the live server answers), then the shared frame with this
 * app's header and footer, which the wake-up screen covers while the live server starts.
 */
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
        <WakeScript />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#D6336C" />
        {/* .ico for browsers and tools that ask for /favicon.ico; the rest take the SVG */}
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        {/* install: the mark on ivory (home screen, app switcher, splash with the app's name) */}
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <Meta />
        <Links />
      </head>
      <body>
        {/* the free live server sleeps when idle: no page until it answers (a plain loader, the
            wake-up screen when it is slow); a sleeping one wakes only for a call straight to it,
            so its /wake is rung too */}
        <Providers>
          <AppWake>
            <AppFrame header={<SiteHeader />} footer={<SiteFooter />}>
              {children}
            </AppFrame>
          </AppWake>
          <Toaster />
        </Providers>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

const isNotFound = (error: unknown) => isRouteErrorResponse(error) && error.status === 404;

/** What a developer needs to see. Production shows none of it (React Router hides server errors there too). */
function technicalDetails(error: unknown): string | undefined {
  if (!import.meta.env.DEV) return undefined;
  if (isRouteErrorResponse(error)) {
    return `${String(error.status)} ${error.statusText}\n${JSON.stringify(error.data, null, 2)}`;
  }
  return error instanceof Error ? (error.stack ?? error.message) : String(error);
}

/** A route's answer below 500 (a 404 above all) is expected; anything else goes to monitoring. */
const unexpected = (error: unknown) => !isRouteErrorResponse(error) || error.status >= 500;

/**
 * Unknown paths (a real 404 status) and unexpected errors, inside the normal header and footer. An
 * unexpected one is reported (ARCHITECTURE §14): a route's error never reaches the browser's handlers.
 */
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  useReportError(error, unexpected(error));
  if (isNotFound(error)) {
    return (
      <ErrorPage
        status={404}
        title="Page not found"
        message="We looked everywhere, even under the vanity. The page may have moved, or the link may have a typo."
      />
    );
  }
  return (
    <ErrorPage
      kind="error"
      status={isRouteErrorResponse(error) ? error.status : undefined}
      title="Something went wrong"
      message="A little spill on our side. Please try again in a moment."
      details={technicalDetails(error)}
    />
  );
}

/**
 * Error pages get their own title and stay out of search results. React Router passes `error: null`
 * when nothing failed, and undefined when only another route did (QA-CUS-001).
 */
export const meta: Route.MetaFunction = ({ error }) =>
  error === null || error === undefined
    ? [{ title: 'Beautinique' }]
    : [
        { title: `${isNotFound(error) ? 'Page not found' : 'Something went wrong'} | Beautinique` },
        { name: 'robots', content: 'noindex' },
      ];
