// Sentry keeps one client per page, so these tests have a file (and so a worker) of their own.
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { gunzipSync } from 'node:zlib';

import { addBreadcrumb, close, type Event, flush, isInitialized } from '@sentry/browser';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { reportError } from '../src/index';
import {
  initMonitoring,
  isAutomated,
  MAX_EVENTS_PER_PAGE,
  replay,
  scrubBreadcrumb,
  scrubEvent,
  scrubText,
  scrubUrl,
} from '../src/monitoring';

const LOOPBACK = '127.0.0.1';
const CHROME =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0 Safari/537.36';

/** A stand-in for Sentry's ingest: keeps the events of every envelope it is sent. */
async function fakeSentry() {
  const events: Event[] = [];
  const server: Server = createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      const body = Buffer.concat(chunks);
      const text = (req.headers['content-encoding'] === 'gzip' ? gunzipSync(body) : body).toString(
        'utf8',
      );
      // an envelope: its header line, then per item a header line and a payload line
      const lines = text.split('\n').filter((line) => line !== '');
      for (let i = 1; i + 1 < lines.length; i += 2) {
        const header = JSON.parse(lines[i] ?? '{}') as { type?: string };
        if (header.type === 'event') events.push(JSON.parse(lines[i + 1] ?? '{}') as Event);
      }
      res.writeHead(200, { 'content-type': 'application/json' }).end('{}');
    });
  });
  await new Promise<void>((resolve) => server.listen(0, LOOPBACK, resolve));
  const { port } = server.address() as AddressInfo;
  return {
    dsn: `http://public@${LOOPBACK}:${String(port)}/1`,
    events,
    close: () =>
      new Promise<void>((resolve) => {
        server.close(() => {
          resolve();
        });
      }),
  };
}

/** An error thrown in this app's own script (its stack on the page's origin). */
function ours(message: string, name = 'Error'): Error {
  const error = new Error(message);
  error.name = name;
  error.stack = `${name}: ${message}\n    at render (${location.origin}/assets/app-1.js:1:10)\n    at run (${location.origin}/assets/app-1.js:2:20)`;
  return error;
}

/** An error thrown in a browser extension's script. */
function extensions(message: string): Error {
  const error = new Error(message);
  error.stack = `Error: ${message}\n    at inject (chrome-extension://abcdefgh/content.js:3:7)`;
  return error;
}

let sentry: Awaited<ReturnType<typeof fakeSentry>>;
beforeAll(async () => {
  sentry = await fakeSentry();
});
afterEach(() => {
  vi.restoreAllMocks();
  Reflect.deleteProperty(navigator, 'webdriver');
});

/** navigator.webdriver, which jsdom does not have (a driven browser says true). */
const driven = (value: boolean) => {
  Object.defineProperty(navigator, 'webdriver', { configurable: true, get: () => value });
};
afterAll(async () => {
  await close();
  await sentry.close();
});

/** What reached the fake Sentry, once the SDK has sent what it holds. */
async function sent(): Promise<Event[]> {
  await flush(2000);
  return sentry.events;
}

describe('scrubbing', () => {
  it('takes emails and long numbers out of text, and the query and fragment off a URL', () => {
    expect(scrubText('code 123456 sent to asha.k+1@mail.example.in, order 12345')).toBe(
      'code [number] sent to [email], order 12345',
    );
    expect(scrubUrl('https://bq.example/account?code=123456&email=a@b.co#top')).toBe(
      'https://bq.example/account',
    );
  });

  it('drops console breadcrumbs and cleans the rest', () => {
    expect(scrubBreadcrumb({ category: 'console', message: 'token abc' })).toBeNull();
    expect(
      scrubBreadcrumb({
        category: 'navigation',
        data: { from: '/sign-in?next=%2Fa', to: '/verify#code=123456', status: 200 },
      }),
    ).toEqual({ category: 'navigation', data: { from: '/sign-in', to: '/verify', status: 200 } });
    expect(
      scrubBreadcrumb({ category: 'ui.click', message: 'button[aria-label="Account (a@b.co)"]' }),
    ).toEqual({ category: 'ui.click', message: 'button[aria-label="Account ([email])"]' });
  });

  it('keeps of the request only its path and the User-Agent, and no user', () => {
    const event = scrubEvent({
      request: {
        url: 'https://bq.example/account?code=1',
        headers: { 'User-Agent': CHROME, Referer: 'https://bq.example/?q=a@b.co', Cookie: 'x=1' },
        cookies: { x: '1' },
        query_string: 'code=1',
        data: '{"password":"x"}',
      },
      user: { id: 'u1', ip_address: '203.0.113.7', email: 'a@b.co' },
      message: 'for a@b.co',
    });
    expect(event).toEqual({
      request: { url: 'https://bq.example/account', headers: { 'User-Agent': CHROME } },
      message: 'for [email]',
    });
  });
});

describe('isAutomated', () => {
  it('names bots, crawlers, headless and driven browsers, and not a person', () => {
    expect(isAutomated({ userAgent: CHROME, webdriver: false })).toBe(false);
    for (const userAgent of [
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 HeadlessChrome/142.0 Safari/537.36',
      'Mozilla/5.0 (compatible; bingbot/2.0)',
    ]) {
      expect(isAutomated({ userAgent, webdriver: false }), userAgent).toBe(true);
    }
    expect(isAutomated({ userAgent: CHROME, webdriver: true })).toBe(true);
  });
});

describe('initMonitoring', () => {
  it('stays off without a DSN, and for a bot or an automated browser', () => {
    expect(initMonitoring({ app: 'customer' })).toBe(false);
    expect(initMonitoring({ app: 'customer', dsn: '  ' })).toBe(false);
    driven(true);
    expect(initMonitoring({ app: 'customer', dsn: sentry.dsn })).toBe(false);
    driven(false);
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Googlebot/2.1');
    expect(initMonitoring({ app: 'customer', dsn: sentry.dsn })).toBe(false);
    expect(isInitialized()).toBe(false);
  });

  it('sends this app’s errors, the ones from before it too, scrubbed and tagged', async () => {
    history.replaceState(null, '', '/account/security?code=123456#top');
    // reported before monitoring starts: it waits
    reportError(ours('code 123456 for asha@mail.example.in did not match'));
    expect(
      initMonitoring({
        app: 'customer',
        dsn: sentry.dsn,
        environment: 'production',
        release: 'abc123',
      }),
    ).toBe(true);
    // once on, a second call keeps it
    expect(initMonitoring({ app: 'admin', dsn: sentry.dsn })).toBe(true);
    const [event] = await sent();
    expect(event?.tags).toMatchObject({ app: 'customer' });
    expect(event?.environment).toBe('production');
    expect(event?.release).toBe('abc123');
    expect(event?.exception?.values?.[0]?.value).toBe('code [number] for [email] did not match');
    expect(event?.request?.url).toBe(`${location.origin}/account/security`);
    expect(Object.keys(event?.request?.headers ?? {})).toEqual(['User-Agent']);
    expect(event?.user).toBeUndefined();
  });

  it('leaves out what is not this app’s own: extensions, the network, aborted requests', async () => {
    const before = (await sent()).length;
    reportError(extensions('Cannot read properties of null'));
    reportError(ours('Failed to fetch', 'TypeError'));
    reportError(ours('Network Error', 'AxiosError'));
    reportError(ours('The operation was aborted.', 'AbortError'));
    expect((await sent()).length).toBe(before);
  });

  it('sends breadcrumbs without console lines, queries or emails', async () => {
    addBreadcrumb({ category: 'ui.click', message: 'button[aria-label="Account (a@b.co)"]' });
    addBreadcrumb({ category: 'navigation', data: { from: '/a?x=1', to: '/b#y' } });
    // a console line (this test prints it): it must not become a breadcrumb
    console.warn('monitoring test: a console line');
    reportError(ours('the account menu broke'));
    const event = (await sent()).at(-1);
    const crumbs = event?.breadcrumbs ?? [];
    expect(crumbs.some((crumb) => crumb.category === 'console')).toBe(false);
    expect(crumbs.find((crumb) => crumb.category === 'ui.click')?.message).toBe(
      'button[aria-label="Account ([email])"]',
    );
    expect(crumbs.find((crumb) => crumb.category === 'navigation')?.data).toEqual({
      from: '/a',
      to: '/b',
    });
  });

  it('sends at most MAX_EVENTS_PER_PAGE errors from one page', async () => {
    for (let i = 0; i < MAX_EVENTS_PER_PAGE + 5; i += 1) reportError(ours(`broke ${String(i)}`));
    expect((await sent()).length).toBe(MAX_EVENTS_PER_PAGE);
  });
});

describe('replay', () => {
  it('is Sentry’s Session Replay', () => {
    expect(replay().name).toBe('Replay');
  });
});
