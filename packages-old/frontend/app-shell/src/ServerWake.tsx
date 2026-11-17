import {
  type ReactNode,
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import { PRIMARY } from './buttons';
import { Compact, PowderBackdrop } from './error-art';
import { useServerWake, WAKE_SCRIPT, type WakeServerOptions } from './wake';

const noSubscription = () => () => undefined;

/** False on the server and while hydrating, true after: what the server rendered stays as it was. */
const useInBrowser = () =>
  useSyncExternalStore(
    noSubscription,
    () => true,
    () => false,
  );

export interface ServerWakeProps extends Omit<WakeServerOptions, 'signal'> {
  /** The app (its frame and pages): shown at once, and out of reach while the screen covers it. */
  children: ReactNode;
  /**
   * Told once, when the server has answered (for a crawler at once): the app's calls may go from
   * then on (the API client's `serverReady`, QA-FE-009). Never before, so no page asks a sleeping
   * server and keeps its failure.
   */
  onReady?: () => void;
}

/** `m:ss` since `since`. */
const elapsed = (since: number, now: number) => {
  const seconds = Math.max(0, Math.floor((now - since) / 1000));
  return `${String(Math.floor(seconds / 60))}:${String(seconds % 60).padStart(2, '0')}`;
};

/** The current time, every second while mounted (the screen's "Waiting 0:42"). */
function useNow(since: number) {
  const [now, setNow] = useState(since);
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, []);
  return Math.max(now, since);
}

interface WakeScreenProps {
  failed: boolean;
  since: number;
  onRetry: () => void;
}

/**
 * The wake-up screen (DESIGN §6): a modal over the whole app while the server starts, with a moving
 * bar and the time waited; after too long, "Try again" only: no way into the app without the server
 * (owner, 2026-11-07). Focus moves in when it opens and to "Try again" when it fails, so screen
 * readers say what happened.
 */
function WakeScreen({ failed, since, onRetry }: WakeScreenProps) {
  const id = useId();
  const dialog = useRef<HTMLDivElement>(null);
  const retryButton = useRef<HTMLButtonElement>(null);
  const now = useNow(since);

  useEffect(() => {
    (failed ? retryButton.current : dialog.current)?.focus();
  }, [failed]);

  return (
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-message`}
      tabIndex={-1}
      data-server-wake={failed ? 'failed' : 'waking'}
      className="bg-background animate-fade-in fixed inset-0 isolate z-(--z-modal) grid place-items-center overflow-y-auto py-14 focus:outline-none"
    >
      <PowderBackdrop />
      <div className="container-page flex flex-col items-center text-center">
        <div aria-hidden="true" className="flex text-[clamp(5rem,20vw,8rem)] leading-none">
          <Compact cracked={false} />
        </div>
        <h2
          id={`${id}-title`}
          className="font-display animate-rise-in mt-6 text-3xl font-medium text-balance md:text-4xl"
        >
          {failed ? 'The server is taking too long' : 'Waking up the server'}
        </h2>
        <p
          id={`${id}-message`}
          className="text-foreground-muted animate-rise-in mt-3 max-w-prose text-pretty [animation-delay:60ms] md:text-lg"
        >
          {failed
            ? 'It may be restarting. Please try again in a moment.'
            : 'Our server takes a short nap when the store is quiet. It is waking up now and is usually ready in about a minute.'}
        </p>
        {failed ? (
          <div className="animate-rise-in mt-8 flex w-full max-w-xs flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:justify-center">
            <button ref={retryButton} type="button" className={PRIMARY} onClick={onRetry}>
              Try again
            </button>
          </div>
        ) : (
          <div className="mt-8 flex w-full max-w-xs flex-col items-center gap-3">
            <div
              role="progressbar"
              aria-label="Waking up the server"
              className="progress-indeterminate text-brand bg-brand/20 h-1.5 w-full rounded-full"
            />
            <p className="text-foreground-muted text-sm tabular-nums">
              Waiting {elapsed(since, now)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * The plain cover while the first check is out, usually a blink: the page's own background and,
 * only after 400 ms, a moving bar; no words, so nothing is announced. The app-shell's CSS shows it
 * only while `<html>` has WAKE_CHECK_ATTRIBUTE (WAKE_SCRIPT, or ServerWake), so a crawler or a
 * browser without JavaScript gets the page itself.
 */
function CheckVeil() {
  return (
    <div
      aria-hidden="true"
      data-server-check-veil=""
      className="bg-background fixed inset-0 z-(--z-modal) place-items-center"
    >
      <div className="progress-indeterminate text-brand bg-brand/20 animate-fade-in h-1.5 w-40 rounded-full [animation-delay:400ms]" />
    </div>
  );
}

/**
 * WAKE_SCRIPT in `<head>`, for an app whose pages are rendered on the server (customer): the loader
 * covers the page from its first paint. Put it right after ThemeScript.
 */
export function WakeScript() {
  // a fixed string from this package, not user input; byte for byte WAKE_SCRIPT, which WAKE_SCRIPT_HASH allows
  return <script dangerouslySetInnerHTML={{ __html: WAKE_SCRIPT }} />;
}

/**
 * Wakes the live server when the app opens (ARCHITECTURE §11.1: the free Render service sleeps after
 * 15 idle minutes and takes about a minute to start). No page shows before the server has answered
 * (owner, 2026-11-05: pages will need it): a plain loader covers the app, and when the answer is slow
 * the wake-up screen takes its place; the app stays inert until it answers. A page rendered on the
 * server also needs WakeScript in its `<head>`.
 */
export function ServerWake({ children, onReady, ...options }: ServerWakeProps) {
  const { state, since, retry } = useServerWake(options);
  const inBrowser = useInBrowser();
  const checking = state === 'checking';
  const covering = state === 'waking' || state === 'failed';
  // the latest callback, told once: a new render of the frame does not tell it again
  const tellReady = useEffectEvent(() => {
    onReady?.();
  });
  const told = useRef(false);
  useEffect(() => {
    if (state !== 'awake' || told.current) return;
    told.current = true;
    tellReady();
  }, [state]);
  // in the browser only: the page rendered on the server stays usable without JavaScript
  const blocked = covering || (checking && inBrowser);
  return (
    <>
      <div inert={blocked} aria-busy={checking && inBrowser ? true : undefined}>
        {children}
      </div>
      {checking && <CheckVeil />}
      {covering && <WakeScreen failed={state === 'failed'} since={since} onRetry={retry} />}
    </>
  );
}
