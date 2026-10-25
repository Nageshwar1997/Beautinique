// Playground: the shell with a sample header and footer, as an app would build them.
import './playground.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Link, Outlet, RouterProvider } from 'react-router';

import { AppFrame, ErrorPage, NavList, THEME_SCRIPT, ThemeSwitcher } from '../src/index';

const NAV = [
  { label: 'Home', to: '/', end: true },
  { label: '404', to: '/missing' },
  { label: 'Error', to: '/error' },
  { label: '503', to: '/503' },
];

function Shell() {
  return (
    <AppFrame
      header={
        <header className="border-border border-b">
          <div className="container-page flex min-h-16 items-center gap-4">
            <Link to="/" className="font-display text-brand-gradient mr-auto text-2xl font-medium">
              App shell
            </Link>
            <NavList items={NAV} label="Main" />
            <ThemeSwitcher />
          </div>
        </header>
      }
      footer={
        <footer className="surface-inverse">
          <div className="container-page py-8 text-sm">Each app brings its own footer.</div>
        </footer>
      }
    >
      <Outlet />
    </AppFrame>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    Component: Shell,
    children: [
      {
        index: true,
        Component: () => (
          <section className="container-page py-10">
            <h1 className="font-display text-3xl font-medium">Shell playground</h1>
            <p className="text-foreground-muted mt-2 max-w-prose">
              Press Tab: the skip link comes first. Switch the theme with the arrow keys; it is
              remembered after a reload, without a flash.
            </p>
          </section>
        ),
      },
      {
        path: 'error',
        Component: () => (
          <ErrorPage
            kind="error"
            title="Something went wrong"
            message="A little spill on our side. Please try again in a moment."
            details={[
              'TypeError: Cannot read properties of undefined',
              '    at ProductCard (product-card.tsx:12:7)',
            ].join('\n')}
          />
        ),
      },
      {
        path: '503',
        Component: () => (
          <ErrorPage
            kind="error"
            status={503}
            title="We will be right back"
            message="The store is taking a short break. Please try again in a minute."
          />
        ),
      },
      {
        path: '*',
        Component: () => (
          <ErrorPage
            status={404}
            title="Page not found"
            message="We looked everywhere, even under the vanity. The page may have moved, or the link may have a typo."
          />
        ),
      },
    ],
  },
]);

// what a server-rendered app puts in <head> (ThemeScript): an inline script runs when inserted
const themeScript = document.createElement('script');
themeScript.textContent = THEME_SCRIPT;
document.head.prepend(themeScript);

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}
