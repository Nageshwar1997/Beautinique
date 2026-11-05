import { HEADERS, wake } from '@beautinique/shared-contracts';
import { act, cleanup, render, screen } from '@testing-library/react';
import axe from 'axe-core';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  isCrawler,
  ServerWake,
  WAKE_CHECK_ATTRIBUTE,
  WAKE_SCRIPT,
  WAKE_SCRIPT_HASH,
  WAKE_URL,
  wakeServer,
} from '../src/index';

const GOOGLEBOT =
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html) Chrome/130.0 Safari/537.36';
const CHROME =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0 Safari/537.36';

/** How one call goes: an answer after `after` ms, a network error, or no answer at all. */
type Step = { after: number; status: number } | { after: number; error: true } | { hang: true };

/** The server's own wake address in these tests (the gateway's /wake, called straight). */
const KICK_URL = 'https://bq-live.example.test/wake';

/**
 * A fetch that plays `steps` in order (the last one repeats) and honours aborts like the real one.
 * Calls to KICK_URL are kept apart in `kicks` and answer at once (opaque, as no-cors answers are).
 */
interface Sent {
  /** the path on the app's own host, the whole URL elsewhere */
  url: string;
  init: { headers: Record<string, string>; cache: string; mode: string; signal: AbortSignal };
}

function scriptedFetch(...steps: Step[]) {
  const calls: Sent[] = [];
  const kicks: (Sent & { at: number })[] = [];
  // axios's fetch adapter hands over a whole Request
  const fetchStub = vi.fn((input: Request | string | URL, given?: RequestInit) => {
    const request = new Request(input, given);
    const where = new URL(request.url);
    const sent: Sent = {
      url: where.origin === location.origin ? `${where.pathname}${where.search}` : request.url,
      init: {
        headers: Object.fromEntries(request.headers),
        cache: request.cache,
        mode: request.mode,
        signal: request.signal,
      },
    };
    if (request.url === KICK_URL) {
      kicks.push({ ...sent, at: Date.now() });
      // a no-cors answer is opaque: nothing in it can be read
      return Promise.resolve(new Response(null, { status: 200 }));
    }
    calls.push(sent);
    const step = steps[Math.min(calls.length - 1, steps.length - 1)];
    return new Promise<Response>((resolve, reject) => {
      const aborted = () => {
        clearTimeout(timer);
        reject(new DOMException('The operation was aborted.', 'AbortError'));
      };
      request.signal.addEventListener('abort', aborted, { once: true });
      const timer =
        step === undefined || 'hang' in step
          ? undefined
          : setTimeout(() => {
              if ('error' in step) reject(new TypeError('Failed to fetch'));
              else resolve(new Response(null, { status: step.status }));
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
  vi.restoreAllMocks();
  document.documentElement.removeAttribute(WAKE_CHECK_ATTRIBUTE);
});

describe('wakeServer', () => {
  it('calls the wake route once as the app, uncached, and is done when the server answers', async () => {
    const { fetch, calls } = scriptedFetch({ after: 200, status: 200 });
    const done = wakeServer({ app: 'customer', fetch });
    await vi.advanceTimersByTimeAsync(200);
    expect(await done).toBe(true);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.url).toBe('/api/v1/platform/wake');
    expect(calls[0]?.init.headers).toEqual({ 'x-bq-app': 'customer' });
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
    expect(calls[0]?.init.signal.aborted).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(calls[0]?.init.signal.aborted).toBe(true);
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
    expect(calls.every((call) => call.init.signal.aborted)).toBe(true);
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
    // the bell carries nothing of the app: no app header, no secret, not even axios's own
    expect(kicks[0]?.init.headers).toEqual({});
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
    expect(calls[0]?.init.signal.aborted).toBe(true);
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
    expect(Object.keys(calls[0]?.init.headers ?? {})).toEqual([HEADERS.app.toLowerCase()]);
  });
});

describe('WAKE_SCRIPT', () => {
  const runIn = (userAgent: string) => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(userAgent);
    // the inline script as the browser runs it (a fixed string of this package)
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const script = new Function(WAKE_SCRIPT) as () => void;
    script();
    return document.documentElement.hasAttribute(WAKE_CHECK_ATTRIBUTE);
  };

  it('marks <html> before the first paint, for people and not for crawlers', () => {
    expect(runIn(CHROME)).toBe(true);
    document.documentElement.removeAttribute(WAKE_CHECK_ATTRIBUTE);
    expect(runIn(GOOGLEBOT)).toBe(false);
  });

  it('tells crawlers apart as isCrawler does', () => {
    for (const userAgent of [
      CHROME,
      GOOGLEBOT,
      'Mozilla/5.0 (compatible; bingbot/2.0)',
      'Baiduspider',
    ]) {
      document.documentElement.removeAttribute(WAKE_CHECK_ATTRIBUTE);
      expect(runIn(userAgent)).toBe(!isCrawler(userAgent));
    }
    expect(WAKE_SCRIPT).toContain(`"${WAKE_CHECK_ATTRIBUTE}"`);
  });

  it('is allowed by WAKE_SCRIPT_HASH, byte for byte', async () => {
    const bytes = new TextEncoder().encode(WAKE_SCRIPT);
    const digest = Buffer.from(await crypto.subtle.digest('SHA-256', bytes)).toString('base64');
    expect(WAKE_SCRIPT_HASH).toBe(`'sha256-${digest}'`);
  });
});

describe('ServerWake', () => {
  const app = () => screen.getByTestId('app');
  const wakeScreen = () => screen.queryByRole('dialog');
  const veil = () => document.querySelector('[data-server-check-veil]');
  const marked = () => document.documentElement.hasAttribute(WAKE_CHECK_ATTRIBUTE);

  const renderApp = (fetch: typeof globalThis.fetch, timings = {}) =>
    render(
      <ServerWake app="customer" fetch={fetch} {...timings}>
        <main data-testid="app">
          <h1>Store</h1>
          <a href="/x">A link</a>
        </main>
      </ServerWake>,
    );

  it('covers the app with a plain loader until a quick server answers, with no wake-up screen', async () => {
    const { fetch } = scriptedFetch({ after: 300, status: 200 });
    renderApp(fetch);
    // before the answer: the loader (no words), the app out of reach and busy
    expect(marked()).toBe(true);
    expect(veil()?.getAttribute('aria-hidden')).toBe('true');
    expect(app().parentElement?.hasAttribute('inert')).toBe(true);
    expect(app().parentElement?.getAttribute('aria-busy')).toBe('true');
    expect(wakeScreen()).toBeNull();
    await advance(300);
    expect(marked()).toBe(false);
    expect(veil()).toBeNull();
    expect(app().parentElement?.hasAttribute('inert')).toBe(false);
    expect(app().parentElement?.hasAttribute('aria-busy')).toBe(false);
    await advance(5000);
    expect(wakeScreen()).toBeNull();
  });

  it('leaves a crawler the page as it is, and never calls the server for it', async () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(GOOGLEBOT);
    const { fetch } = scriptedFetch({ hang: true });
    renderApp(fetch);
    expect(marked()).toBe(false);
    expect(veil()).toBeNull();
    expect(app().parentElement?.hasAttribute('inert')).toBe(false);
    await advance(5000);
    expect(wakeScreen()).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('takes the mark off <html> when it goes', () => {
    const { fetch } = scriptedFetch({ hang: true });
    const { unmount } = renderApp(fetch);
    expect(marked()).toBe(true);
    unmount();
    expect(marked()).toBe(false);
  });

  it('covers the app with the wake-up screen while the server is slow, then gets out of the way', async () => {
    const { fetch } = scriptedFetch({ after: 25_000, status: 200 });
    renderApp(fetch);
    await advance(1499);
    expect(wakeScreen()).toBeNull();
    expect(veil()).toBeTruthy();
    await advance(1);
    // the wake-up screen takes the loader's place
    expect(veil()).toBeNull();
    expect(marked()).toBe(false);
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

  it('hydrates the page rendered on the server without a mismatch, then blocks it until the answer', async () => {
    const { fetch } = scriptedFetch({ after: 300, status: 200 });
    const tree = (
      <ServerWake app="customer" fetch={fetch}>
        <main data-testid="app">Store</main>
      </ServerWake>
    );
    const container = document.createElement('div');
    container.innerHTML = renderToString(tree);
    document.body.append(container);
    const errors: unknown[] = [];
    const root = await act(() =>
      hydrateRoot(container, tree, {
        onRecoverableError: (error) => errors.push(error),
      }),
    );
    expect(errors).toEqual([]);
    expect(marked()).toBe(true);
    expect(app().parentElement?.hasAttribute('inert')).toBe(true);
    await advance(300);
    expect(veil()).toBeNull();
    expect(app().parentElement?.hasAttribute('inert')).toBe(false);
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('has no axe violations behind the plain loader', async () => {
    const { fetch } = scriptedFetch({ hang: true });
    renderApp(fetch);
    expect(veil()).toBeTruthy();
    expect(await violations()).toEqual([]);
  });

  it('renders the app as it is on the server, with the loader for the CSS to show (the call starts in the browser)', () => {
    const { fetch } = scriptedFetch({ hang: true });
    const html = renderToString(
      <ServerWake app="customer" fetch={fetch}>
        <p>Store</p>
      </ServerWake>,
    );
    // not inert nor busy: without JavaScript (or for a crawler) the page works
    expect(
      html.startsWith('<div><p>Store</p></div><div aria-hidden="true" data-server-check-veil=""'),
    ).toBe(true);
    expect(html).not.toContain('inert');
    expect(html).not.toContain('role="dialog"');
    expect(fetch).not.toHaveBeenCalled();
  });
});

/**
 * axe on the whole page, the screen and the inert app behind it (colour contrast needs a real layout,
 * and label in name a canvas, which jsdom has not: the browser check covers both). axe needs real
 * timers, and the component's fake ones are lost when they go, so this ends what a test can still
 * play.
 */
async function violations() {
  vi.useRealTimers();
  const results = await axe.run(document.body, {
    rules: {
      'color-contrast': { enabled: false },
      'label-content-name-mismatch': { enabled: false },
    },
  });
  return results.violations.map((violation) => `${violation.id}: ${violation.help}`);
}
