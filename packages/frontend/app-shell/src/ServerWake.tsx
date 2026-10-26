import { type ReactNode, useEffect, useId, useRef, useState } from 'react';

import { PRIMARY, SECONDARY } from './buttons';
import { Compact, PowderBackdrop } from './error-art';
import { useServerWake, type WakeServerOptions } from './wake';

export interface ServerWakeProps extends Omit<WakeServerOptions, 'signal'> {
  /** The app (its frame and pages): shown at once, and out of reach while the screen covers it. */
  children: ReactNode;
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
  onContinue: () => void;
}

/**
 * The wake-up screen (DESIGN §6): a modal over the whole app while the server starts, with a moving
 * bar and the time waited; after too long, ways on. Focus moves in when it opens and to "Try again"
 * when it fails, so screen readers say what happened.
 */
function WakeScreen({ failed, since, onRetry, onContinue }: WakeScreenProps) {
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
            ? 'It may be restarting. Try again in a moment, or continue without it: pages that need the server will not load until it is up.'
            : 'Our server takes a short nap when the store is quiet. It is waking up now and is usually ready in about a minute.'}
        </p>
        {failed ? (
          <div className="animate-rise-in mt-8 flex w-full max-w-xs flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row sm:justify-center">
            <button ref={retryButton} type="button" className={PRIMARY} onClick={onRetry}>
              Try again
            </button>
            <button type="button" className={SECONDARY} onClick={onContinue}>
              Continue anyway
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
 * Wakes the live server when the app opens (ARCHITECTURE §11.1: the free Render service sleeps after
 * 15 idle minutes and takes about a minute to start). The app renders at once; only when the server
 * is slow to answer does the wake-up screen cover it, and the app stays inert until it answers.
 */
export function ServerWake({ children, ...options }: ServerWakeProps) {
  const { state, since, retry, dismiss } = useServerWake(options);
  const covering = state === 'waking' || state === 'failed';
  return (
    <>
      <div inert={covering}>{children}</div>
      {covering && (
        <WakeScreen
          failed={state === 'failed'}
          since={since}
          onRetry={retry}
          onContinue={dismiss}
        />
      )}
    </>
  );
}
