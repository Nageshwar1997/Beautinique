/**
 * `online`: the internet works (or nothing says it does not).
 * `offline`: the browser says the device has no network, or the network is there (Wi-Fi joined) but
 * the internet stopped answering.
 * `connecting`: the browser says the network is back but the internet has not answered yet.
 */
export type ConnectionStatus = 'online' | 'offline' | 'connecting';

export interface OnlineStatusStoreOptions {
  /**
   * Resolves when the internet can be reached and rejects when it cannot. Any answer counts, even an
   * error page: only "no answer at all" is a failure. `signal` is aborted when the attempt times out
   * or is no longer wanted.
   *
   * By default: a tiny `HEAD` request to the site itself (`/favicon.ico`, no cookies, never
   * cached), never to another company. On the laptop (`localhost`) the site always answers, so
   * there only the browser's own `offline` event shows a pulled cable.
   */
  probe?: (signal: AbortSignal) => Promise<unknown>;
  /** How long one probe may take before it counts as failed. @default 5000 */
  probeTimeoutMs?: number;
  /**
   * How long to wait before the next probe, given how many probes in a row have failed (1 after the
   * first failure). @default 0.5s, 1s, 2s, then 3s for every later one
   */
  retryDelayMs?: (failures: number) => number;
  /**
   * While online, and while the tab is visible, how often to check that the internet still answers.
   * The browser only says "offline" when the device loses its network; with Wi-Fi joined and no
   * internet behind it (a phone hotspot with its data off) it says nothing, so this is what notices.
   * `0` turns it off. @default 15000
   */
  heartbeatMs?: number;
}

export interface OnlineStatusStore {
  /** The current status. Works (and is right) with nobody subscribed, so it is safe during render. */
  getStatus: () => ConnectionStatus;
  /**
   * Calls `listener` whenever the status changes. The first subscriber starts listening to the
   * browser, the last one to leave stops everything (listeners, timers, a probe in flight).
   */
  subscribe: (listener: () => void) => () => void;
  /**
   * Checks now whether the internet answers, e.g. after a request got no answer. Only does something
   * while online: when the status already is `offline` or `connecting` it is being checked anyway,
   * and with nobody subscribed there is nobody to tell. A check that fails is repeated once, and
   * when that fails too the status becomes `offline`.
   */
  recheck: () => void;
  /**
   * Tells the store that something real just got through: the server answered a request (any
   * answer, an error page included). That proves the internet works, so it is worth more than a
   * probe: the status becomes `online` at once if it was `connecting` or `offline` because
   * nothing answered, a failed check that waits to be repeated is dropped, and the regular check is
   * postponed (it only runs while nothing has got through for `heartbeatMs`). Ignored while the
   * browser says there is no network, because an answer then can only be one from a cache.
   */
  confirmOnline: () => void;
}

const DEFAULT_PROBE_TIMEOUT_MS = 5000;
const DEFAULT_HEARTBEAT_MS = 15_000;
// 0.5s, 1s, 2s, then 3s for ever: while there is no internet a probe fails on the device, it never
// reaches a server, so probing often costs nothing and the way back is noticed quickly.
const RETRY_DELAYS_MS = [500, 1000, 2000];
const MAX_RETRY_DELAY_MS = 3000;
// A check that fails while online might be a blip, so it has to fail this many times in a row.
const FAILURES_BEFORE_OFFLINE = 2;

const defaultRetryDelayMs = (failures: number) =>
  RETRY_DELAYS_MS[failures - 1] ?? MAX_RETRY_DELAY_MS;

// The site itself (its Vercel edge), never another company: no third party learns who is online,
// and the CSP opens nothing for it. Any answer counts, a 404 too.
const defaultProbe = (signal: AbortSignal) =>
  fetch(`/favicon.ico?online-check=${String(Date.now())}`, {
    method: 'HEAD',
    cache: 'no-store',
    credentials: 'omit',
    signal,
  });

// Without a `navigator` (a server) there is nothing to say the network is down.
const isNavigatorOnline = () => typeof navigator === 'undefined' || navigator.onLine;

/**
 * One shared source of truth for "is the user online". The browser's `online` / `offline` events are
 * one trigger, a regular check is the other, and a real request is always the proof:
 * `navigator.onLine` being `true` only means a network interface is up (Wi-Fi joined, cable plugged
 * in), not that anything beyond it answers.
 *
 * - `offline` -> `connecting` when the browser says the network is back, then `online` once a probe
 *   gets an answer (retried with a growing delay until it does).
 * - `online` -> `offline` at once when the browser says the network is gone. And when the browser
 *   says nothing but the internet stops answering (checked every `heartbeatMs`, and when a tab
 *   wakes up), after the check failed twice in a row. It goes back to `online` by itself as soon as
 *   something answers again.
 * - A real request that got an answer (`confirmOnline`) counts as proof too, and a better one: it
 *   brings the status back to `online` at once and keeps the regular check from running while the
 *   app is busy talking to its server anyway.
 * - Going offline at any time wins at once: a probe that is still running is aborted and a late
 *   answer from it is ignored.
 * - No listener, timer or request exists while nobody is subscribed.
 */
export const createOnlineStatusStore = ({
  probe = defaultProbe,
  probeTimeoutMs = DEFAULT_PROBE_TIMEOUT_MS,
  retryDelayMs = defaultRetryDelayMs,
  heartbeatMs = DEFAULT_HEARTBEAT_MS,
}: OnlineStatusStoreOptions = {}): OnlineStatusStore => {
  const listeners = new Set<() => void>();
  let started = false;
  let status: ConnectionStatus = 'online';
  // Why the status is `offline`: the browser said so, or the browser says online but nothing answers.
  let offlineBecause: 'browser' | 'unreachable' = 'browser';

  // Probe loop. `loopId` changes whenever the loop is stopped or restarted, so an answer that
  // arrives for an older loop can tell it is stale and does nothing.
  let loopId = 0;
  let probing = false;
  let failures = 0;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  let timeoutTimer: ReturnType<typeof setTimeout> | undefined;
  let heartbeatTimer: ReturnType<typeof setTimeout> | undefined;
  let controller: AbortController | undefined;

  const setStatus = (next: ConnectionStatus) => {
    if (next === status) return;

    status = next;

    for (const listener of [...listeners]) listener();
  };

  const clearHeartbeat = () => {
    clearTimeout(heartbeatTimer);
    heartbeatTimer = undefined;
  };

  const stopLoop = () => {
    loopId += 1;
    probing = false;
    failures = 0;
    clearTimeout(retryTimer);
    retryTimer = undefined;
    clearTimeout(timeoutTimer);
    timeoutTimer = undefined;
    clearHeartbeat();
    controller?.abort();
    controller = undefined;
  };

  // A probe, or the wait before the next one, is going on.
  const isLoopRunning = () => probing || retryTimer !== undefined;

  const runProbe = (id: number) => {
    const own = new AbortController();

    retryTimer = undefined;
    probing = true;
    controller = own;

    // Kept in a local too: the answer of an older run must clear its own timer, not a newer one.
    let ownTimer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_resolve, reject) => {
      ownTimer = setTimeout(() => {
        own.abort();
        reject(new Error('The online check timed out'));
      }, probeTimeoutMs);
    });
    timeoutTimer = ownTimer;

    // Built inside a promise so a probe that throws before returning one is a failed probe too.
    const attempt = new Promise<unknown>((resolve) => {
      resolve(probe(own.signal));
    });

    void Promise.race([attempt, timeout])
      .then(
        () => true,
        () => false,
      )
      .then((reachable) => {
        clearTimeout(ownTimer);

        if (id !== loopId) return;

        probing = false;
        controller = undefined;

        if (reachable) {
          failures = 0;
          setStatus('online');
          scheduleHeartbeat();

          return;
        }

        failures += 1;

        if (status === 'online' && failures >= FAILURES_BEFORE_OFFLINE) {
          offlineBecause = 'unreachable';
          setStatus('offline');
        }

        retryTimer = setTimeout(() => {
          runProbe(id);
        }, retryDelayMs(failures));
      });
  };

  const startLoop = () => {
    stopLoop();
    runProbe(loopId);
  };

  const scheduleHeartbeat = () => {
    clearHeartbeat();

    if (heartbeatMs <= 0 || status !== 'online') return;

    if (document.visibilityState !== 'visible') return;

    heartbeatTimer = setTimeout(() => {
      heartbeatTimer = undefined;
      startLoop();
    }, heartbeatMs);
  };

  const syncWithBrowser = () => {
    if (!isNavigatorOnline()) {
      stopLoop();
      offlineBecause = 'browser';
      setStatus('offline');

      return;
    }

    // The network is back. (Offline because nothing answers is not fixed by the network "coming
    // back", it never went: that one finds its own way back, see `runProbe`.)
    if (status === 'offline' && offlineBecause === 'browser') {
      setStatus('connecting');
      startLoop();
    }
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState !== 'visible') {
      clearHeartbeat(); // nobody is looking, so nothing needs checking

      return;
    }

    // Events can be missed while a tab sleeps, so look again when it wakes...
    syncWithBrowser();

    // ...and ask the internet too, since the timer did not run while the tab was hidden. (With the
    // status `offline` and the browser online, nothing answered: ask again at once instead of
    // waiting out the delay. Anything else that is being asked already is left alone.)
    if (heartbeatMs > 0 && isNavigatorOnline() && (status === 'offline' || !isLoopRunning())) {
      startLoop();
    }
  };

  const start = () => {
    started = true;
    status = isNavigatorOnline() ? 'online' : 'offline';
    offlineBecause = 'browser';

    window.addEventListener('online', syncWithBrowser);
    window.addEventListener('offline', syncWithBrowser);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    scheduleHeartbeat();
  };

  const stop = () => {
    started = false;
    stopLoop();

    window.removeEventListener('online', syncWithBrowser);
    window.removeEventListener('offline', syncWithBrowser);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };

  return {
    getStatus: () => {
      if (started) return status;

      return isNavigatorOnline() ? 'online' : 'offline';
    },

    subscribe: (listener) => {
      listeners.add(listener);

      if (!started) start();

      return () => {
        listeners.delete(listener);

        if (started && listeners.size === 0) stop();
      };
    },

    recheck: () => {
      if (!started || status !== 'online' || isLoopRunning()) return;

      startLoop();
    },

    confirmOnline: () => {
      if (!started || !isNavigatorOnline()) return;

      // Whatever was being checked (a failed check that waits to be repeated, a probe, the search
      // for the internet after `connecting` / `offline`) the server just answered: that settles it.
      // When nothing was being checked this only pushes the next regular check back.
      stopLoop();
      setStatus('online');
      scheduleHeartbeat();
    },
  };
};
