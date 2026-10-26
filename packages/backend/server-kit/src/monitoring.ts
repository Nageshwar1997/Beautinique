import * as Sentry from '@sentry/node';

/**
 * Error monitoring (ARCHITECTURE §10, §14): Sentry, started once per process. This module imports
 * nothing but Sentry, so a process can load it with `node --import` before Express, MongoDB and Redis,
 * which Sentry has to see load to trace them.
 */
export interface MonitoringOptions {
  /** The Sentry DSN; empty or missing = monitoring stays off (laptop, CI, tests). */
  dsn?: string | undefined;
  /** `live` on Render, `development` elsewhere. */
  environment?: string | undefined;
  /** The deployed commit, e.g. Render's RENDER_GIT_COMMIT. */
  release?: string | undefined;
  /** Share of requests traced: 5% keeps Render's 5 GB outbound budget (ARCHITECTURE §11.2). */
  tracesSampleRate?: number;
}

/** A URL without its query string, which can carry personal data. */
const withoutQuery = (url: string) => url.split('?')[0] ?? '';

/**
 * Only a request's method and path reach Sentry: its headers carry the origin secret and cookies,
 * its body and query personal data (ARCHITECTURE §7.2, §14). Exported for its test.
 */
export function scrubEvent<Scrubbed extends Sentry.Event>(event: Scrubbed): Scrubbed {
  const { request } = event;
  if (request) {
    event.request = {
      ...(request.method === undefined ? {} : { method: request.method }),
      ...(request.url === undefined ? {} : { url: withoutQuery(request.url) }),
    };
  }
  return event;
}

/** A trace span as Sentry v11 streams it (traceLifecycle 'stream', its default). */
type StreamedSpan = Parameters<NonNullable<Sentry.NodeOptions['beforeSendSpan']>>[0];

/** Span attributes that may carry a secret or personal data: headers, the client's IP, the user, queries. */
const PRIVATE_ATTRIBUTE =
  /^(?:http\.(?:request|response)\.header\.|user\.|enduser\.|client\.address$|http\.client_ip$|net\.peer\.ip$|url\.query$|http\.query$)/;

/**
 * The same rule for traces: a span keeps its timings and route, never a header, an IP, a user or a
 * query string (in its name or in a URL attribute). Exported for its test.
 */
export function scrubSpan(span: StreamedSpan): StreamedSpan {
  const attributes: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(span.attributes)) {
    if (PRIVATE_ATTRIBUTE.test(key)) continue;
    attributes[key] =
      typeof value === 'string' && /url|target/.test(key) ? withoutQuery(value) : value;
  }
  return { ...span, name: withoutQuery(span.name), attributes };
}

/**
 * Starts Sentry for the whole process. In bundle mode every deployable shares the process, and a
 * second init would replace the first, so any later call keeps the first (ARCHITECTURE §11.1).
 * Without a DSN it does nothing. True when monitoring is on.
 */
export function initMonitoring({
  dsn,
  environment = 'development',
  release,
  tracesSampleRate = 0.05,
}: MonitoringOptions): boolean {
  if (Sentry.isInitialized()) return true;
  if (dsn === undefined || dsn.trim() === '') return false;
  Sentry.init({
    dsn: dsn.trim(),
    environment,
    ...(release === undefined || release === '' ? {} : { release }),
    tracesSampleRate,
    // Sentry collects all of these by default; none may leave (origin secret, cookies, OTPs, personal
    // data in bodies, queries, queue jobs, database writes and local variables)
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
      databaseQueryData: false,
      queues: false,
      stackFrameVariables: false,
    },
    // and in case a default changes: whatever a request carried is dropped before sending, from
    // errors and from trace spans (v11 streams spans, so beforeSendTransaction would never run)
    beforeSend: scrubEvent,
    beforeSendSpan: scrubSpan,
    beforeBreadcrumb(breadcrumb) {
      const url: unknown = breadcrumb.data?.url;
      if (typeof url === 'string') breadcrumb.data = { ...breadcrumb.data, url: withoutQuery(url) };
      return breadcrumb;
    },
  });
  return true;
}

export interface ErrorContext {
  requestId?: string | undefined;
  method?: string;
  path?: string;
}

/** Sends a server error to Sentry, tagged with its request id, when monitoring is on. */
export function reportError(error: unknown, { requestId, method, path }: ErrorContext = {}): void {
  if (!Sentry.isInitialized()) return;
  Sentry.withScope((scope) => {
    if (requestId !== undefined) scope.setTag('request_id', requestId);
    if (method !== undefined && path !== undefined) scope.setTag('route', `${method} ${path}`);
    Sentry.captureException(error);
  });
}

/** Waits (at most `timeoutMs`) until reported errors are sent: before the process exits. */
export async function flushMonitoring(timeoutMs = 2000): Promise<void> {
  if (Sentry.isInitialized()) await Sentry.flush(timeoutMs);
}
