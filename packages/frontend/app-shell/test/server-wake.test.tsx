import { HEADERS, wake } from '@beautinique/shared-contracts';
import { act, cleanup, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ServerWake, WAKE_URL, wakeServer } from '../src/index';

/** How one call goes: an answer after `after` ms, a network error, or no answer at all. */
type Step = { after: number; status: number } | { after: number; error: true } | { hang: true };

/** The server's own wake address in these tests (the gateway's /wake, called straight). */
const KICK_URL = 'https://bq-live.example.test/wake';

/**
 * A fetch that plays `steps` in order (the last one repeats) and honours aborts like the real one.
 * Calls to KICK_URL are kept apart in `kicks` and answer at once (opaque, as no-cors answers are).
 */
function scriptedFetch(...steps: Step[]) {
  const calls: { url: string; init: RequestInit }[] = [];
  const kicks: { url: string; init: RequestInit; at: number }[] = [];
  const fetchStub = vi.fn((url: string, init: RequestInit) => {
    if (url === KICK_URL) {
      kicks.push({ url, init, at: Date.now() });
      return Promise.resolve({ status: 0, type: 'opaque' } as Response);
    }
    calls.push({ url, init });
    const step = steps[Math.min(calls.length - 1, steps.length - 1)];
    return new Promise<Response>((resolve, reject) => {
      const aborted = () => {
        clearTimeout(timer);
        reject(new DOMException('The operation was aborted.', 'AbortError'));
      };
      init.signal?.addEventListener('abort', aborted, { once: true });
      const timer =
        step === undefined || 'hang' in step
          ? undefined
          : setTimeout(() => {
              if ('error' in step) reject(new TypeError('Failed to fetch'));
              else resolve({ status: step.status } as Response);
            }, step.after);
    });
  });
  return { fetch: fetchStub as unknown as typeof fetch, calls, kicks };
}

const advance = async (ms: number) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
};

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('wakeServer', () => {
  it('calls the wake route once as the app, uncached, and is done when the server answers', async () => {
    const { fetch, calls } = scriptedFetch({ after: 200, status: 200 });
    const done = wakeServer({ app: 'customer', fetch });
    await vi.advanceTimersByTimeAsync(200);
    expect(await done).toBe(true);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.url).toBe('/api/v1/platform/wake');
    expect(calls[0]?.init.headers).toEqual({ 'X-BQ-App': 'customer' });
    expect(calls[0]?.init.cache).toBe('no-store');
  });

  it('calls again while the platform says "not up yet" (5xx, 429) or the network fails', async () => {
    const { fetch, calls } = scriptedFetch(
      { after: 100, status: 502 },
      { after: 100, error: true },
      { after: 100, status: 429 },
      { after: 100, status: 503 },
      { after: 100, status: 200 },
    );
    const done = wakeServer({ app: 'customer', fetch, retryDelayMs: 1000 });
    await vi.advanceTimersByTimeAsync(4 * 1100 + 100);
    expect(await done).toBe(true);
    expect(calls).toHaveLength(5);
  });

  it('takes any other answer, an error too, as a server that is awake', async () => {
    const { fetch, calls } = scriptedFetch({ after: 50, status: 404 });
    const done = wakeServer({ app: 'customer', fetch });
    await vi.advanceTimersByTimeAsync(50);
    expect(await done).toBe(true);
    expect(calls).toHaveLength(1);
  });

  it('abandons a call that hangs and sends another', async () => {
    const { fetch, calls } = scriptedFetch({ hang: true }, { after: 100, status: 200 });
    const done = wakeServer({ app: 'customer', fetch, attemptTimeoutMs: 5000, retryDelayMs: 1000 });
    await vi.advanceTimersByTimeAsync(4999);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.init.signal?.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(calls[0]?.init.signal?.aborted).toBe(true);
    await vi.advanceTimersByTimeAsync(1100);
    expect(await done).toBe(true);
    expect(calls).toHaveLength(2);
  });

  it('gives up at the deadline, its last call cut short too', async () => {
    const { fetch, calls } = scriptedFetch({ hang: true });
    const done = wakeServer({
      app: 'customer',
      fetch,
      attemptTimeoutMs: 30_000,
      retryDelayMs: 3000,
      giveUpAfterMs: 40_000,
    });
    // 30 s call, 3 s pause, then a call cut at the 40 s deadline
    await vi.advanceTimersByTimeAsync(40_000);
    expect(await done).toBe(false);
    expect(calls).toHaveLength(2);
    expect(calls.every((call) => call.init.signal?.aborted)).toBe(true);
  });

  it('rings the server straight (no-cors) while the route says "not up yet", at most every 15 s', async () => {
    // Render answers 502 on the app's Vercel route until the straight call wakes it (2026-10-26)
    const { fetch, calls, kicks } = scriptedFetch(
      { after: 100, status: 502 },
      { after: 100, error: true },
      { after: 100, status: 502 },
      { after: 100, status: 502 },
      { after: 100, status: 502 },
      { after: 100, status: 502 },
      { after: 100, status: 502 },
      { after: 100, status: 502 },
      { after: 100, status: 200 },
    );
    const start = Date.now();
    const done = wakeServer({ app: 'customer', fetch, kickUrl: KICK_URL, retryDelayMs: 3000 });
    await vi.advanceTimersByTimeAsync(8 * 3100 + 100);
    expect(await done).toBe(true);
    expect(calls).toHaveLength(9);
    // the first "not up yet" rings at once, the next one 15 s later at the earliest
    expect(kicks.map((kick) => kick.at - start)).toEqual([100, 15_600]);
    expect(kicks[0]?.init).toMatchObject({ mode: 'no-cors', cache: 'no-store' });
    // the bell carries nothing of the app: no app header, no secret
    expect(kicks[0]?.init.headers).toBeUndefined();
  });

  it('rings nothing when the server answers, or when there is no wake address', async () => {
    const awake = scriptedFetch({ after: 50, status: 200 });
    const first = wakeServer({ app: 'customer', fetch: awake.fetch, kickUrl: KICK_URL });
    await vi.advanceTimersByTimeAsync(50);
    expect(await first).toBe(true);
    expect(awake.kicks).toEqual([]);

    const asleep = scriptedFetch({ after: 50, status: 502 }, { after: 50, status: 200 });
    const second = wakeServer({ app: 'customer', fetch: asleep.fetch, retryDelayMs: 1000 });
    await vi.advanceTimersByTimeAsync(1100);
    expect(await second).toBe(true);
    expect(asleep.kicks).toEqual([]);
  });

  it('stops at once when its signal aborts', async () => {
    const { fetch, calls } = scriptedFetch({ hang: true });
    const controller = new AbortController();
    const done = wakeServer({ app: 'customer', fetch, signal: controller.signal });
    await vi.advanceTimersByTimeAsync(1000);
    controller.abort();
    expect(await done).toBe(false);
    expect(calls[0]?.init.signal?.aborted).toBe(true);
    await vi.advanceTimersByTimeAsync(200_000);
    expect(calls).toHaveLength(1);
  });

  it('calls the contracts route under the gateway prefix, as the app the gateway knows', async () => {
    expect(WAKE_URL).toBe(`/api/v1${wake.path}`);
    expect(wake).toMatchObject({ method: 'GET', access: { type: 'public' } });
    const { fetch, calls } = scriptedFetch({ after: 0, status: 200 });
    const done = wakeServer({ app: 'customer', fetch });
    await vi.advanceTimersByTimeAsync(0);
    await done;
    expect(Object.keys(calls[0]?.init.headers ?? {})).toEqual([HEADERS.app]);
  });
});

describe('ServerWake', () => {
  const app = () => screen.getByTestId('app');
  const wakeScreen = () => screen.queryByRole('dialog');

  const renderApp = (fetch: typeof globalThis.fetch, timings = {}) =>
    render(
      <ServerWake app="customer" fetch={fetch} {...timings}>
        <main data-testid="app">
          <h1>Store</h1>
          <a href="/x">A link</a>
        </main>
      </ServerWake>,
    );

  it('shows the app at once and no screen when the server answers quickly', async () => {
    const { fetch } = scriptedFetch({ after: 300, status: 200 });
    renderApp(fetch);
    expect(app()).toBeTruthy();
    await advance(5000);
    expect(wakeScreen()).toBeNull();
    expect(app().parentElement?.hasAttribute('inert')).toBe(false);
  });

  it('covers the app with the wake-up screen while the server is slow, then gets out of the way', async () => {
    const { fetch } = scriptedFetch({ after: 25_000, status: 200 });
    renderApp(fetch);
    await advance(1499);
    expect(wakeScreen()).toBeNull();
    await advance(1);
    const dialog = wakeScreen();
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
    expect(screen.getByRole('heading', { name: 'Waking up the server' })).toBeTruthy();
    expect(screen.getByRole('progressbar', { name: 'Waking up the server' })).toBeTruthy();
    // the app behind is out of reach, and focus is on the screen so screen readers announce it
    expect(app().parentElement?.hasAttribute('inert')).toBe(true);
    expect(document.activeElement).toBe(dialog);
    await advance(12_000);
    expect(screen.getByText('Waiting 0:13')).toBeTruthy();
    await advance(11_500);
    expect(wakeScreen()).toBeNull();
    expect(app().parentElement?.hasAttribute('inert')).toBe(false);
  });

  it('offers to try again or to continue when the server does not answer in time', async () => {
    const { fetch, calls } = scriptedFetch(
      { hang: true },
      { hang: true },
      { after: 10_000, status: 200 },
    );
    renderApp(fetch, { attemptTimeoutMs: 20_000, giveUpAfterMs: 30_000 });
    await advance(30_000);
    expect(screen.getByRole('heading', { name: 'The server is taking too long' })).toBeTruthy();
    expect(screen.queryByRole('progressbar')).toBeNull();
    const retry = screen.getByRole('button', { name: 'Try again' });
    expect(document.activeElement).toBe(retry);

    // try again: the screen stays and calls again, then goes when the server answers
    act(() => {
      retry.click();
    });
    expect(screen.getByRole('heading', { name: 'Waking up the server' })).toBeTruthy();
    expect(calls).toHaveLength(3);
    await advance(10_000);
    expect(wakeScreen()).toBeNull();
  });

  it('lets the user continue without the server', async () => {
    const { fetch } = scriptedFetch({ hang: true });
    renderApp(fetch, { attemptTimeoutMs: 10_000, giveUpAfterMs: 10_000 });
    await advance(10_000);
    act(() => {
      screen.getByRole('button', { name: 'Continue anyway' }).click();
    });
    expect(wakeScreen()).toBeNull();
    expect(app().parentElement?.hasAttribute('inert')).toBe(false);
  });

  it.each([
    ['waking', 1500],
    ['failed', 10_000],
  ])('has no axe violations while %s', async (state, wait) => {
    const { fetch } = scriptedFetch({ hang: true });
    renderApp(fetch, { attemptTimeoutMs: 10_000, giveUpAfterMs: 10_000 });
    await advance(wait);
    expect(document.querySelector(`[data-server-wake="${state}"]`)).toBeTruthy();
    expect(await violations()).toEqual([]);
  });

  it('renders only the app on the server (the call starts in the browser)', () => {
    const { fetch } = scriptedFetch({ hang: true });
    const html = renderToString(
      <ServerWake app="customer" fetch={fetch}>
        <p>Store</p>
      </ServerWake>,
    );
    expect(html).toBe('<div><p>Store</p></div>');
    expect(fetch).not.toHaveBeenCalled();
  });
});

/**
 * axe on the whole page, the screen and the inert app behind it (colour contrast needs a real layout:
 * the browser check covers it). axe needs real timers, and the component's fake ones are lost when
 * they go, so this ends what a test can still play.
 */
async function violations() {
  vi.useRealTimers();
  const results = await axe.run(document.body, { rules: { 'color-contrast': { enabled: false } } });
  return results.violations.map((violation) => `${violation.id}: ${violation.help}`);
}
