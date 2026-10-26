import { AppFrame, ErrorPage, ServerWake, ThemeScript } from '@beautinique/frontend-app-shell';
import displayFont from '@beautinique/frontend-styles/fonts/fraunces-latin.woff2?url';
import sansFont from '@beautinique/frontend-styles/fonts/plus-jakarta-sans-latin.woff2?url';
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
 * `<html theme>`, hence suppressHydrationWarning), then the shared frame with this app's header and
 * footer, which the wake-up screen covers while the live server starts.
 */
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
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
        {/* the free live server sleeps when idle: wake it, behind a screen only when it is slow */}
        <ServerWake app="customer">
          <AppFrame header={<SiteHeader />} footer={<SiteFooter />}>
            {children}
          </AppFrame>
        </ServerWake>
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

/** Unknown paths (a real 404 status) and unexpected errors, inside the normal header and footer. */
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
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

/** Error pages get their own title and stay out of search results. */
export const meta: Route.MetaFunction = ({ error }) =>
  error === undefined
    ? [{ title: 'Beautinique' }]
    : [
        { title: `${isNotFound(error) ? 'Page not found' : 'Something went wrong'} | Beautinique` },
        { name: 'robots', content: 'noindex' },
      ];
