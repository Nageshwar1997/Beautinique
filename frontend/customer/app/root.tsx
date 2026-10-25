import { AppFrame, ErrorPage, ThemeScript } from '@beautinique/frontend-app-shell';
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
 * `<html theme>`, hence suppressHydrationWarning), then the shared frame with this app's header and footer.
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
        <AppFrame header={<SiteHeader />} footer={<SiteFooter />}>
          {children}
        </AppFrame>
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
  return isRouteErrorResponse(error) && error.status === 404 ? (
    <ErrorPage title="Page not found" message="We could not find this page." />
  ) : (
    <ErrorPage title="Something went wrong" message="Please try again in a moment." />
  );
}

export const meta: Route.MetaFunction = () => [{ title: 'Beautinique' }];
