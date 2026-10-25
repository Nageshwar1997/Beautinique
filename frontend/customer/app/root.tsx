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

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#D6336C" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <Meta />
        <Links />
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

/** Unknown paths (a real 404 status) and unexpected errors. */
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <main id="main" className="container-page py-10">
      <h1 className="font-display text-3xl font-medium">
        {notFound ? 'Page not found' : 'Something went wrong'}
      </h1>
      <p className="text-foreground-muted mt-2">
        <a href="/" className="text-brand-text underline">
          Go to the home page
        </a>
      </p>
    </main>
  );
}

export const meta: Route.MetaFunction = () => [{ title: 'Beautinique' }];
