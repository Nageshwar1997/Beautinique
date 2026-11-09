import axios from 'axios';
import { useCallback, useEffect, useLayoutEffect, useState, useSyncExternalStore } from 'react';

/**
 * The wake route behind the gateway (contracts `platform.server.wake`): core answers it, so an answer
 * means the server is up. The apps reach it through their own `/api` (Vercel route, ARCHITECTURE §7.2).
 */
export const WAKE_URL = '/api/v1/platform/wake';

/** The gateway answers only known apps, named in this header (contracts `HEADERS.app`). */
const APP_HEADER = 'X-BQ-App';

/**
 * On `<html>` while the first check is out: the app-shell's CSS then shows the plain loader over
 * the page (owner, 2026-11-05: no page before the server has answered, as pages will need it).
 */
export const WAKE_CHECK_ATTRIBUTE = 'data-server-check';

/** Search engines and link previews: they get the page as it is and never wake the server. */
const CRAWLER = /bot|crawler|spider/i;

/** True for a crawler's user agent (Googlebot, bingbot ...). */
export const isCrawler = (userAgent: string): boolean => CRAWLER.test(userAgent);

const noSubscription = () => () => undefined;
const readCrawler = () => isCrawler(navigator.userAgent);

/**
 * Runs in `<head>` before the first paint and puts WAKE_CHECK_ATTRIBUTE on `<html>` (not for a
 * crawler), so a page rendered on the server is covered by the loader from its first frame instead of
 * showing and then being covered. An app rendered only in the browser needs no script: ServerWake
 * sets the attribute before its first paint. Keep in step with CRAWLER, WAKE_CHECK_ATTRIBUTE and
 * WAKE_SCRIPT_HASH (a test checks them).
 */
export const WAKE_SCRIPT =
  'try{if(!/bot|crawler|spider/i.test(navigator.userAgent))document.documentElement.setAttribute("data-server-check","")}catch(e){}';

/** CSP `script-src` source that allows exactly WAKE_SCRIPT (no `unsafe-inline`). */
export const WAKE_SCRIPT_HASH = "'sha256-J6w3CZT06cXz5XQNPA1u+IDEdqZheh+2aFIdjCgocMw='";

/**
 * `checking`: the call is out and a plain loader covers the app (a server that is up answers before
 * `slowAfterMs`). `waking`: no answer yet, the wake-up screen shows. `awake`: it answered (or the
 * reader is a crawler). `failed`: no answer before `giveUpAfterMs`; the screen offers to try again or
 * to continue without it.
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
  /** At most one call to `kickUrl` this often while the server is not up (default 15 s). */
  kickEveryMs?: number;
}

export interface WakeServerOptions extends WakeTimings {
  /** The app's id, e.g. `customer`. */
  app: string;
  url?: string;
  /**
   * The server's own wake address (the gateway's `/wake`, straight, not through the app's Vercel
   * route), called when the route says "not up yet": a request on that route does not wake a
   * sleeping free Render service, one sent straight there does (ARCHITECTURE §11.1). The call is
   * `no-cors`: its answer cannot be read and is not needed. Without it, no such call.
   */
  kickUrl?: string | undefined;
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

/**
 * axios's own headers off (`false` drops one): the wake call names only the app, and the straight
 * call to the server carries nothing at all.
 */
const NO_AXIOS_HEADERS = { Accept: false, 'User-Agent': false } as const;

/** A whole URL: axios's fetch adapter makes a Request, which needs one outside a browser too. */
const whole = (url: string) =>
  typeof location === 'undefined' ? url : new URL(url, location.href).href;

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
  fetch: fetchImpl,
  attemptTimeoutMs = 30_000,
  retryDelayMs = 3000,
  giveUpAfterMs = 150_000,
  kickUrl,
  kickEveryMs = 15_000,
}: WakeServerOptions): Promise<boolean> {
  // the fetch adapter: only fetch has `no-cors` and `cache` (axios's XMLHttpRequest has neither)
  const http = axios.create({
    adapter: 'fetch',
    ...(fetchImpl === undefined ? {} : { env: { fetch: fetchImpl } }),
    // the status decides below, every answer comes back
    validateStatus: () => true,
  });
  const deadline = Date.now() + giveUpAfterMs;
  let kickedAt = -Infinity;
  /** Rings the server's own bell (fire and forget), at most once per kickEveryMs. */
  const kick = () => {
    if (signal.aborted || kickUrl === undefined || kickUrl === '') return;
    if (Date.now() - kickedAt < kickEveryMs) return;
    kickedAt = Date.now();
    void http
      .get(whole(kickUrl), {
        headers: NO_AXIOS_HEADERS,
        fetchOptions: { mode: 'no-cors', cache: 'no-store' },
        signal,
      })
      .catch(() => undefined);
  };
  while (!signal.aborted) {
    const attempt = new AbortController();
    const stop = () => {
      attempt.abort();
    };
    signal.addEventListener('abort', stop, { once: true });
    const timer = setTimeout(stop, Math.max(0, Math.min(attemptTimeoutMs, deadline - Date.now())));
    try {
      const response = await http.get(whole(url), {
        headers: { ...NO_AXIOS_HEADERS, [APP_HEADER]: app },
        fetchOptions: { cache: 'no-store' },
        signal: attempt.signal,
      });
      if (!notUpYet(response.status)) return !signal.aborted;
      kick();
    } catch {
      // offline, refused or timed out: the server may still be on its way up
      kick();
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
  /** After `failed`: show the screen and call again (the only way on: no app without the server). */
  retry: () => void;
}

/**
 * Wakes the server once when the app opens, in the browser only (the server render stays
 * `checking`). Until it answers, `<html>` carries WAKE_CHECK_ATTRIBUTE (the plain loader); the
 * wake-up screen shows only when the answer is slow. A crawler is `awake` at once, with no call.
 */
export function useServerWake({
  app,
  url,
  fetch,
  slowAfterMs = 1500,
  attemptTimeoutMs,
  retryDelayMs,
  giveUpAfterMs,
  kickUrl,
  kickEveryMs,
}: Omit<WakeServerOptions, 'signal'>): ServerWakeStatus {
  const [state, setState] = useState<WakeState>('checking');
  // false on the server and while hydrating, so the first render in the browser matches the server's
  const crawler = useSyncExternalStore(noSubscription, readCrawler, () => false);
  const [since, setSince] = useState(0);
  // a new run on every retry (the screen already shows then); the first waits slowAfterMs before it
  const [run, setRun] = useState(0);

  // the loader shows while `checking` (before the first paint here, as the head script may not have
  // run: an app rendered only in the browser), and goes with the first answer
  useLayoutEffect(() => {
    const html = document.documentElement;
    if (state === 'checking' && !isCrawler(navigator.userAgent)) {
      html.setAttribute(WAKE_CHECK_ATTRIBUTE, '');
    } else html.removeAttribute(WAKE_CHECK_ATTRIBUTE);
  }, [state]);
  useLayoutEffect(
    () => () => {
      document.documentElement.removeAttribute(WAKE_CHECK_ATTRIBUTE);
    },
    [],
  );

  useEffect(() => {
    if (isCrawler(navigator.userAgent)) return;
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
      kickUrl,
      kickEveryMs,
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
  }, [
    run,
    app,
    url,
    fetch,
    slowAfterMs,
    attemptTimeoutMs,
    retryDelayMs,
    giveUpAfterMs,
    kickUrl,
    kickEveryMs,
  ]);

  const retry = useCallback(() => {
    setSince(Date.now());
    setState('waking');
    setRun((count) => count + 1);
  }, []);
  return { state: crawler ? 'awake' : state, since, retry };
}
