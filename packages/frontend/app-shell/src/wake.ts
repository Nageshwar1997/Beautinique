import { useCallback, useEffect, useState } from 'react';

/**
 * The wake route behind the gateway (contracts `platform.server.wake`): core answers it, so an answer
 * means the server is up. The apps reach it through their own `/api` (Vercel route, ARCHITECTURE §7.2).
 */
export const WAKE_URL = '/api/v1/platform/wake';

/** The gateway answers only known apps, named in this header (contracts `HEADERS.app`). */
const APP_HEADER = 'X-BQ-App';

/**
 * `checking`: the call is out, nothing shown yet (a server that is up answers before `slowAfterMs`).
 * `waking`: no answer yet, the wake-up screen shows. `awake`: it answered. `failed`: no answer before
 * `giveUpAfterMs`; the screen offers to try again or to continue without it.
 */
export type WakeState = 'checking' | 'waking' | 'awake' | 'failed';

export interface WakeTimings {
  /** No answer by then: show the wake-up screen (default 1.5 s). */
  slowAfterMs?: number;
  /** One call waits this long before it is abandoned and sent again (default 30 s). */
  attemptTimeoutMs?: number;
  /** Pause between calls that got "not up yet" (default 3 s). */
  retryDelayMs?: number;
  /** Stop after this long: Render's cold start takes about a minute (default 150 s). */
  giveUpAfterMs?: number;
}

export interface WakeServerOptions extends WakeTimings {
  /** The app's id, e.g. `customer`. */
  app: string;
  url?: string;
  signal?: AbortSignal;
  /** For tests and the playground; keep it the same function, as useServerWake starts over on a new one. */
  fetch?: typeof fetch;
}

/**
 * Answers that mean "not up yet": the platform's 5xx while the server boots (Render, Vercel's
 * external route, the gateway before core is up) and a rate limit. Any other answer came from a
 * server that is awake, even an error: what is wrong with it is not the wake-up screen's business.
 */
const notUpYet = (status: number) => status >= 500 || status === 429;

/** Resolves after `ms`, or at once when `signal` aborts. */
function pause(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    // an aborted signal fires no more 'abort' events
    if (signal.aborted) {
      resolve();
      return;
    }
    const timer = setTimeout(done, ms);
    signal.addEventListener('abort', done, { once: true });
    function done() {
      clearTimeout(timer);
      signal.removeEventListener('abort', done);
      resolve();
    }
  });
}

/**
 * Calls the wake route until the server answers or `giveUpAfterMs` passes; true when it answered.
 * Each call has its own timeout, and an abort of `signal` stops everything (the result is then false).
 */
export async function wakeServer({
  app,
  url = WAKE_URL,
  signal = new AbortController().signal,
  fetch: fetchImpl = globalThis.fetch,
  attemptTimeoutMs = 30_000,
  retryDelayMs = 3000,
  giveUpAfterMs = 150_000,
}: WakeServerOptions): Promise<boolean> {
  const deadline = Date.now() + giveUpAfterMs;
  while (!signal.aborted) {
    const attempt = new AbortController();
    const stop = () => {
      attempt.abort();
    };
    signal.addEventListener('abort', stop, { once: true });
    const timer = setTimeout(stop, Math.max(0, Math.min(attemptTimeoutMs, deadline - Date.now())));
    try {
      const response = await fetchImpl(url, {
        headers: { [APP_HEADER]: app },
        cache: 'no-store',
        signal: attempt.signal,
      });
      if (!notUpYet(response.status)) return !signal.aborted;
    } catch {
      // offline, refused or timed out: the server may still be on its way up
    } finally {
      clearTimeout(timer);
      signal.removeEventListener('abort', stop);
    }
    if (Date.now() + retryDelayMs >= deadline) return false;
    await pause(retryDelayMs, signal);
  }
  return false;
}

export interface ServerWakeStatus {
  state: WakeState;
  /** When the current wake-up began showing (Date.now()); 0 before. */
  since: number;
  /** After `failed`: show the screen and call again. */
  retry: () => void;
  /** After `failed`: hide the screen and let the user go on without the server. */
  dismiss: () => void;
}

/**
 * Wakes the server once when the app opens, in the browser only (the server render stays
 * `checking`, which shows nothing). The screen shows only when the answer is slow.
 */
export function useServerWake({
  app,
  url,
  fetch,
  slowAfterMs = 1500,
  attemptTimeoutMs,
  retryDelayMs,
  giveUpAfterMs,
}: Omit<WakeServerOptions, 'signal'>): ServerWakeStatus {
  const [state, setState] = useState<WakeState>('checking');
  const [since, setSince] = useState(0);
  // a new run on every retry (the screen already shows then); the first waits slowAfterMs before it
  const [run, setRun] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const begun = Date.now();
    const slow =
      run === 0
        ? setTimeout(() => {
            setSince(begun);
            setState((current) => (current === 'checking' ? 'waking' : current));
          }, slowAfterMs)
        : undefined;
    void wakeServer({
      app,
      url,
      fetch,
      attemptTimeoutMs,
      retryDelayMs,
      giveUpAfterMs,
      signal: controller.signal,
    }).then((answered) => {
      if (controller.signal.aborted) return;
      clearTimeout(slow);
      setState(answered ? 'awake' : 'failed');
    });
    return () => {
      controller.abort();
      clearTimeout(slow);
    };
  }, [run, app, url, fetch, slowAfterMs, attemptTimeoutMs, retryDelayMs, giveUpAfterMs]);

  const retry = useCallback(() => {
    setSince(Date.now());
    setState('waking');
    setRun((count) => count + 1);
  }, []);
  const dismiss = useCallback(() => {
    setState('awake');
  }, []);
  return { state, since, retry, dismiss };
}
