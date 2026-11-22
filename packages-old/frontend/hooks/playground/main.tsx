// Playground: each hook in a small working example, inside the shell (theme switcher for light and
// dark). `npm run playground --workspace @beautinique/frontend-hooks`, http://localhost:5183.
import './playground.css';

import { AppFrame, THEME_SCRIPT, ThemeSwitcher } from '@beautinique/frontend-app-shell';
import { type ReactNode, StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';

import {
  useCopyToClipboard,
  useCountdown,
  useDebouncedValue,
  useIsSmallScreen,
  useMediaQuery,
  useOnlineStatus,
  useOutsideClick,
} from '../src/index';
import { useQueryParamInput, useQueryParams } from '../src/router/index';

const BUTTON =
  'min-h-touch inline-flex items-center justify-center rounded-full px-5 font-medium border border-border-strong bg-surface text-foreground hover:bg-surface-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
const INPUT =
  'min-h-touch w-full rounded-lg border border-border-strong bg-surface px-3 text-foreground';

function Card({ title, hook, children }: { title: string; hook: string; children: ReactNode }) {
  return (
    <section className="border-border bg-surface rounded-2xl border p-5" aria-labelledby={hook}>
      <h2 id={hook} className="font-display text-xl font-medium">
        {title}
      </h2>
      <p className="text-foreground-muted mt-1 font-mono text-sm">{hook}</p>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

const Value = ({ children }: { children: ReactNode }) => (
  <output className="bg-surface-muted block rounded-lg px-3 py-2 font-mono text-sm">
    {children}
  </output>
);

function MediaQueries() {
  const small = useIsSmallScreen();
  const dark = useMediaQuery('(prefers-color-scheme: dark)');
  const lessMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  return (
    <Card title="Media queries" hook="useMediaQuery, useIsSmallScreen">
      <p className="text-sm">Resize the window, or change the system theme.</p>
      <Value>
        small screen: {String(small)} · system dark: {String(dark)} · less motion:{' '}
        {String(lessMotion)}
      </Value>
    </Card>
  );
}

function Debounced() {
  const [text, setText] = useState('');
  const query = useDebouncedValue(text.trim(), 400);
  return (
    <Card title="Debounced value" hook="useDebouncedValue">
      <label className="block text-sm font-medium" htmlFor="debounce-input">
        Search
      </label>
      <input
        id="debounce-input"
        className={INPUT}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
        }}
      />
      <Value>sent after 400 ms of quiet: “{query}”</Value>
    </Card>
  );
}

function Countdown() {
  const [until, setUntil] = useState<number | null>(null);
  const left = useCountdown(until);
  const waiting = left !== null && left > 0;
  return (
    <Card title="Countdown" hook="useCountdown">
      <button
        type="button"
        className={BUTTON}
        disabled={waiting}
        onClick={() => {
          setUntil(Date.now() + 30_000);
        }}
      >
        {waiting ? `Send a new code in ${String(left)} s` : 'Send a code'}
      </button>
      <Value>seconds left: {String(left)}</Value>
    </Card>
  );
}

const CODES = ['K7QD-2MXR', 'P4ZT-9WLB', 'H2NV-6CJS', 'R8YG-3TFK'];

function Copy() {
  const { copy, copied } = useCopyToClipboard();
  const [failed, setFailed] = useState(false);
  return (
    <Card title="Copy to clipboard" hook="useCopyToClipboard">
      <ul className="grid grid-cols-2 gap-2 font-mono text-sm">
        {CODES.map((code) => (
          <li key={code} className="bg-surface-muted rounded-lg px-3 py-2">
            {code}
          </li>
        ))}
      </ul>
      <button
        type="button"
        className={BUTTON}
        onClick={() => {
          void copy(CODES.join('\n')).then((ok) => {
            setFailed(!ok);
          });
        }}
      >
        {copied ? 'Copied' : 'Copy codes'}
      </button>
      <p role="status" className="text-sm">
        {failed ? 'The browser did not allow copying: select the codes and copy them.' : ''}
      </p>
    </Card>
  );
}

function Online() {
  const { status } = useOnlineStatus();
  return (
    <Card title="Online status" hook="useOnlineStatus">
      <p className="text-sm">DevTools → Network → Offline, then back online.</p>
      <Value>status: {status}</Value>
    </Card>
  );
}

function OutsideClick() {
  const [open, setOpen] = useState(false);
  const panel = useOutsideClick<HTMLDivElement>(
    () => {
      setOpen(false);
    },
    { enabled: open },
  );
  return (
    <Card title="Outside click" hook="useOutsideClick">
      <div ref={panel} className="relative inline-block">
        <button
          type="button"
          className={BUTTON}
          aria-expanded={open}
          onClick={() => {
            setOpen((was) => !was);
          }}
        >
          {open ? 'Close the menu' : 'Open a menu'}
        </button>
        {open && (
          <div className="border-border bg-surface absolute top-full left-0 z-10 mt-2 w-56 rounded-xl border p-3 shadow-lg">
            Click or tap anywhere outside: it closes.
          </div>
        )}
      </div>
    </Card>
  );
}

function QueryParams() {
  const { queryParams, setParams, clearParams } = useQueryParams();
  const search = useQueryParamInput('search');
  const tone = queryParams.tone ?? '';
  return (
    <Card title="URL query params" hook="useQueryParams, useQueryParamInput">
      <label className="block text-sm font-medium" htmlFor="search-input">
        Search (in the URL as ?search=)
      </label>
      <input
        id="search-input"
        className={INPUT}
        value={search.value}
        onChange={(event) => {
          search.setValue(event.target.value);
        }}
      />
      <div className="flex flex-wrap gap-2" role="group" aria-label="Tone">
        {['warm', 'cool', 'neutral'].map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={tone === value}
            className={`${BUTTON} ${tone === value ? 'bg-surface-muted' : ''}`}
            onClick={() => {
              setParams({ tone: tone === value ? null : value });
            }}
          >
            {value}
          </button>
        ))}
        <button
          type="button"
          className={BUTTON}
          onClick={() => {
            clearParams();
          }}
        >
          Clear
        </button>
      </div>
      <Value>{JSON.stringify(queryParams)}</Value>
    </Card>
  );
}

function Page() {
  return (
    <AppFrame
      header={
        <header className="border-border border-b">
          <div className="container-page flex min-h-16 items-center gap-4">
            <span className="font-display text-brand-gradient mr-auto text-2xl font-medium">
              Hooks
            </span>
            <ThemeSwitcher />
          </div>
        </header>
      }
    >
      <div className="container-page grid gap-5 py-8 md:grid-cols-2">
        <MediaQueries />
        <Debounced />
        <Countdown />
        <Copy />
        <Online />
        <OutsideClick />
        <QueryParams />
      </div>
    </AppFrame>
  );
}

const router = createBrowserRouter([{ path: '/', Component: Page }]);

// what a server-rendered app puts in <head> (ThemeScript)
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
