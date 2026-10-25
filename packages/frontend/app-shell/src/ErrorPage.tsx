import { useSyncExternalStore } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';

import { ErrorCode, PowderBackdrop } from './error-art';

/** A way out of the error page: a link, or a button (e.g. reload). */
export type ErrorPageAction =
  { label: string; to: string } | { label: string; onClick: () => void };

export interface ErrorPageProps {
  /** The page's one `h1`, e.g. "Page not found". */
  title: string;
  message?: string;
  /**
   * `not-found` (default): the big code's zeros are empty compacts. `error`: they are cracked and
   * spill powder, and the default actions offer "Try again".
   */
  kind?: 'not-found' | 'error';
  /** HTTP status: shown as "Error 404" and drawn big. Without it: 404 for not-found, "Oops" for errors. */
  status?: number;
  /**
   * Ways out; the first is the main one. Default: home (not-found), or "Try again" (reload) and home
   * (error). "Go back" is added on its own when there is a page in this app to go back to.
   */
  actions?: ErrorPageAction[];
  /** The request id (or error event id) the user can quote to support (DESIGN §6). */
  reference?: string;
  /** Technical details (message, stack) for developers: pass them only in development. */
  details?: string;
}

const HOME: ErrorPageAction = { label: 'Go to the home page', to: '/' };
const reload = () => {
  window.location.reload();
};
/**
 * Whether this tab has a page of this app behind the current one. React Router's browser history
 * numbers its entries in `history.state.idx` (0 = the first page of the visit, where going back would
 * leave the app), and the number survives a reload. Its location key does not tell: the first page
 * gets a key too.
 */
const hasPageBehind = () => {
  const state: unknown = window.history.state;
  return (
    typeof state === 'object' &&
    state !== null &&
    'idx' in state &&
    typeof state.idx === 'number' &&
    state.idx > 0
  );
};
/** The router re-renders this page on every navigation, which reads the history again. */
const noSubscription = () => () => undefined;

const BUTTON = 'min-h-touch inline-flex items-center justify-center rounded-full px-6 font-medium';
const PRIMARY = `${BUTTON} bg-brand-gradient shadow-brand transition-[filter] hover:brightness-110`;
const SECONDARY = `${BUTTON} border-border-strong bg-surface text-foreground hover:bg-surface-muted border transition-colors`;

function ActionControl({ action, primary }: { action: ErrorPageAction; primary: boolean }) {
  const className = primary ? PRIMARY : SECONDARY;
  return 'to' in action ? (
    <Link to={action.to} className={className}>
      {action.label}
    </Link>
  ) : (
    <button type="button" onClick={action.onClick} className={className}>
      {action.label}
    </button>
  );
}

/**
 * The content of an error or not-found page, inside the app's frame (it adds no `<main>` of its own):
 * a big code drawn with powder compacts, the title, the message and ways out. The art is hidden from
 * screen readers; "Error 404" is said in text.
 */
export function ErrorPage({
  title,
  message,
  kind = 'not-found',
  status,
  actions,
  reference,
  details,
}: ErrorPageProps) {
  // re-render on every navigation (back and forward included), so canGoBack is read again
  useLocation();
  const navigate = useNavigate();
  const cracked = kind === 'error';
  const ways = actions ?? (cracked ? [{ label: 'Try again', onClick: reload }, HOME] : [HOME]);
  // the server cannot know the tab's history: it says no, and the browser decides after hydration
  const canGoBack = useSyncExternalStore(noSubscription, hasPageBehind, () => false);
  const code = status === undefined ? (cracked ? 'Oops' : '404') : String(status);

  return (
    <section
      aria-labelledby="error-title"
      className="relative isolate grid min-h-[min(46rem,calc(100dvh-8rem))] place-items-center overflow-hidden py-14"
    >
      <PowderBackdrop />
      <div className="container-page flex flex-col items-center text-center">
        <ErrorCode code={code} cracked={cracked} />
        {status !== undefined && (
          <p className="tone-brand bg-tone-subtle text-tone-subtle-foreground animate-rise-in mt-6 rounded-full px-3 py-1 text-xs font-semibold tracking-wider uppercase [animation-delay:120ms]">
            Error {status}
          </p>
        )}
        <h1
          id="error-title"
          className="font-display animate-rise-in mt-4 text-3xl font-medium text-balance [animation-delay:180ms] md:text-4xl"
        >
          {title}
        </h1>
        {message !== undefined && (
          <p className="text-foreground-muted animate-rise-in mt-3 max-w-prose text-pretty [animation-delay:240ms] md:text-lg">
            {message}
          </p>
        )}
        <div className="animate-rise-in mt-8 flex w-full max-w-xs flex-col gap-3 [animation-delay:300ms] sm:w-auto sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center">
          {ways.map((action, index) => (
            <ActionControl key={action.label} action={action} primary={index === 0} />
          ))}
          {canGoBack && (
            <button
              type="button"
              className={SECONDARY}
              onClick={() => {
                void navigate(-1);
              }}
            >
              Go back
            </button>
          )}
        </div>
        {reference !== undefined && reference.trim() !== '' && (
          <p className="text-foreground-muted mt-6 text-sm">
            Reference: <code className="text-foreground font-mono select-all">{reference}</code>
          </p>
        )}
        {details !== undefined && details.trim() !== '' && (
          <details className="border-border bg-surface mt-10 w-full max-w-2xl rounded-lg border text-left">
            <summary className="min-h-touch flex cursor-pointer items-center px-4 text-sm font-medium">
              Technical details
            </summary>
            <pre className="text-foreground-muted max-h-72 overflow-auto px-4 pb-4 text-xs whitespace-pre-wrap">
              {details}
            </pre>
          </details>
        )}
      </div>
    </section>
  );
}
