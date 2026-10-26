// Playground: the shell with a sample header and footer, as an app would build them.
import './playground.css';

import { StrictMode, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Link, Outlet, RouterProvider } from 'react-router';

import {
  AppFrame,
  ErrorPage,
  NavList,
  ServerWake,
  THEME_SCRIPT,
  ThemeSwitcher,
} from '../src/index';

const NAV = [
  { label: 'Home', to: '/', end: true },
  { label: '404', to: '/missing' },
  { label: 'Error', to: '/error' },
  { label: '503', to: '/503' },
  { label: 'Wake-up', to: '/wake' },
];

/** A pretend server for the wake-up screen: it answers after `ms`, or never (null). */
const pretendServer =
  (ms: number | null): typeof fetch =>
  (_url, init) =>
    new Promise((resolve, reject) => {
      const timer =
        ms === null
          ? undefined
          : setTimeout(() => {
              resolve(new Response(null, { status: 200 }));
            }, ms);
      init?.signal?.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      });
    });

function WakeDemo() {
  const [run, setRun] = useState<{ key: number; ms: number | null } | null>(null);
  // the hook starts over when fetch changes, so one per run
  const fetchStub = useMemo(() => (run ? pretendServer(run.ms) : undefined), [run]);
  const button = 'border-border-strong min-h-touch rounded-full border px-5 font-medium';
  return (
    <section className="container-page py-10">
      <h1 className="font-display text-3xl font-medium">Wake-up screen</h1>
      <p className="text-foreground-muted mt-2 max-w-prose">
        Apps wrap their frame in ServerWake. A server that answers within 1.5 s shows nothing; a
        slow one shows the screen until it answers; one that never answers (here after 10 s instead
        of 150 s) offers to try again or to continue.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          className={button}
          onClick={() => {
            setRun({ key: Date.now(), ms: 8000 });
          }}
        >
          Slow server (8 s)
        </button>
        <button
          type="button"
          className={button}
          onClick={() => {
            setRun({ key: Date.now(), ms: null });
          }}
        >
          No answer
        </button>
      </div>
      {run && (
        <ServerWake
          key={run.key}
          app="customer"
          fetch={fetchStub}
          attemptTimeoutMs={10_000}
          giveUpAfterMs={10_000}
        >
          <span />
        </ServerWake>
      )}
    </section>
  );
}

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
      { path: 'wake', Component: WakeDemo },
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
