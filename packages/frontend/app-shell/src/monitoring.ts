import type { addIntegration } from '@sentry/browser';
import {
  type Breadcrumb,
  captureException,
  type ErrorEvent,
  type Event,
  init,
  isInitialized,
  replayIntegration,
} from '@sentry/browser';

import { setErrorReporter } from './report';
import { isCrawler } from './wake';

/** A Sentry integration (the SDK does not export its type). */
export type Integration = Parameters<typeof addIntegration>[0];

/**
 * Browser error monitoring (ARCHITECTURE §14): Sentry project `bq-frontend`, one per organization
 * with `bq-backend`, so the free quota (5k errors, 50 replays a month) is shared and only this app's
 * own errors may use it. Its own entry, loaded after the page starts: the pages never wait for it,
 * and an app without monitoring never downloads it.
 */
export interface MonitoringOptions {
  /** The app's id, a tag on every event, e.g. `customer`. */
  app: string;
  /** The Sentry DSN (public by design); empty or missing = monitoring stays off (laptop, CI, tests). */
  dsn?: string | undefined;
  /** Vercel's `production` or `preview`; `development` elsewhere. */
  environment?: string | undefined;
  /** The deployed commit (Vercel's VERCEL_GIT_COMMIT_SHA). */
  release?: string | undefined;
  /** More integrations: `replay()` in the customer app. */
  integrations?: Integration[];
  /** Pages whose scripts count as this app's; the page's own origin by default. */
  allowUrls?: (string | RegExp)[];
}

/** One page load sends at most this many errors: a loop on one page must not spend the month's quota. */
export const MAX_EVENTS_PER_PAGE = 10;

/** Share of errors that send their replay (50 a month for the whole organization). */
export const REPLAY_ON_ERROR_SAMPLE_RATE = 0.2;

/** Browser extensions' scripts: their errors are not ours. */
const EXTENSION_URLS = [
  /^(?:chrome|moz|safari|safari-web|ms-browser)-extension:\/\//i,
  /^webkit-masked-url:/i,
];

/** The person's network or browser, not our code: offline, a cancelled request, a layout notice. */
const NOT_OURS = [
  /^Failed to fetch$/,
  /^NetworkError when attempting to fetch resource\.?$/,
  /^Load failed$/,
  /^The network connection was lost\.?$/,
  /^Network Error$/,
  /^ResizeObserver loop/,
  /^AbortError\b/,
  /The (?:operation|user) (?:was )?abort(?:ed)?/i,
];

/** Default integrations that send more than errors: console lines (as breadcrumbs), a session per page load, AI chats. */
const LEFT_OUT = new Set(['Console', 'BrowserSession', 'ConversationId']);

/** A bot, a crawler or an automated browser: its errors are not a person's, and are not sent. */
export function isAutomated({ userAgent, webdriver }: Pick<Navigator, 'userAgent' | 'webdriver'>) {
  return (
    isCrawler(userAgent) || /headless|phantomjs|puppeteer|lighthouse/i.test(userAgent) || webdriver
  );
}

const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;
/** A code, a phone or an account number: six digits or more. */
const LONG_NUMBER = /\d{6,}/g;

/** Text without an email address or a long number in it. */
export const scrubText = (text: string): string =>
  text.replace(EMAIL, '[email]').replace(LONG_NUMBER, '[number]');

/** A URL without its query and fragment (they can carry codes and personal data), scrubbed. */
export const scrubUrl = (url: string): string => scrubText(url.split(/[?#]/)[0] ?? '');

const URL_KEYS = new Set(['url', 'from', 'to']);

/** A breadcrumb with its URLs and words scrubbed; console lines are dropped. */
export function scrubBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb | null {
  if (breadcrumb.category === 'console') return null;
  const scrubbed: Breadcrumb = { ...breadcrumb };
  if (scrubbed.message !== undefined) scrubbed.message = scrubText(scrubbed.message);
  if (scrubbed.data) {
    const data: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(scrubbed.data)) {
      if (typeof value !== 'string') data[key] = value;
      else data[key] = URL_KEYS.has(key) ? scrubUrl(value) : scrubText(value);
    }
    scrubbed.data = data;
  }
  return scrubbed;
}

/**
 * What leaves the browser (ARCHITECTURE §14): the error, its stack and the page's path; of the
 * request only the User-Agent (the browser and system), never the query, cookies, a user or an IP;
 * emails and long numbers scrubbed from messages and breadcrumbs. Exported for its test.
 */
export function scrubEvent<Scrubbed extends Event>(event: Scrubbed): Scrubbed {
  const { request } = event;
  if (request) {
    const userAgent = request.headers?.['User-Agent'];
    event.request = {
      ...(request.url === undefined ? {} : { url: scrubUrl(request.url) }),
      ...(userAgent === undefined ? {} : { headers: { 'User-Agent': userAgent } }),
    };
  }
  delete event.user;
  if (event.message !== undefined) event.message = scrubText(event.message);
  for (const exception of event.exception?.values ?? []) {
    if (exception.value !== undefined) exception.value = scrubText(exception.value);
    for (const frame of exception.stacktrace?.frames ?? []) {
      if (frame.filename !== undefined) frame.filename = scrubUrl(frame.filename);
      if (frame.abs_path !== undefined) frame.abs_path = scrubUrl(frame.abs_path);
    }
  }
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs
      .map(scrubBreadcrumb)
      .filter((breadcrumb): breadcrumb is Breadcrumb => breadcrumb !== null);
  }
  return event;
}

/**
 * Session Replay for the customer app, only of sessions that hit an error (REPLAY_ON_ERROR_SAMPLE_RATE
 * of them): every text, input and image is masked, so a replay shows clicks and layout, not data.
 */
export const replay = (): Integration =>
  replayIntegration({ maskAllText: true, maskAllInputs: true, blockAllMedia: true });

/**
 * Starts Sentry once for this page: without a DSN, or for a bot, a crawler or an automated browser,
 * it does nothing. Then reportError (the main entry) sends to Sentry. True when monitoring is on.
 */
export function initMonitoring({
  app,
  dsn,
  environment,
  release,
  integrations = [],
  allowUrls,
}: MonitoringOptions): boolean {
  if (isInitialized()) return true;
  const key = dsn?.trim() ?? '';
  if (key === '' || isAutomated(navigator)) return false;
  let sent = 0;
  init({
    dsn: key,
    environment: environment === undefined || environment === '' ? 'development' : environment,
    ...(release === undefined || release === '' ? {} : { release }),
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: { request: { allow: ['User-Agent'] }, response: false },
      httpBodies: [],
      urlQueryParams: false,
      stackFrameVariables: false,
    },
    // the app's own error messages stay as they are ('always' would rewrite "Failed to fetch")
    enhanceFetchErrorMessages: false,
    // only errors from this app's own scripts, not an extension's or another site's
    allowUrls: allowUrls ?? [location.origin],
    denyUrls: EXTENSION_URLS,
    ignoreErrors: NOT_OURS,
    integrations: (defaults) => [
      ...defaults.filter((integration) => !LEFT_OUT.has(integration.name)),
      ...integrations,
    ],
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: REPLAY_ON_ERROR_SAMPLE_RATE,
    initialScope: { tags: { app } },
    beforeBreadcrumb: scrubBreadcrumb,
    // after the filters above: a page's errors stop at MAX_EVENTS_PER_PAGE
    beforeSend(event: ErrorEvent) {
      if (sent >= MAX_EVENTS_PER_PAGE) return null;
      sent += 1;
      return scrubEvent(event);
    },
  });
  setErrorReporter((error) => {
    captureException(error);
  });
  return true;
}
