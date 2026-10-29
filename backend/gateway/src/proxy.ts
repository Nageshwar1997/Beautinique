import { request } from 'node:http';
import { pipeline } from 'node:stream';

import {
  AppError,
  type Logger,
  type PassportSigner,
  requestIdOf,
} from '@beautinique/backend-server-kit';
import {
  ipKey,
  type RateLimiter,
  type RateLimitRule,
  RateLimitUnavailableError,
} from '@beautinique/backend-server-ratelimit';
import {
  type AppId,
  APPS,
  buildPath,
  type Deployable,
  type gatewayManifest,
  HEADERS,
  matchPath,
  passportAudience,
  type RateLimitClass,
  STEP_UP_SECONDS,
} from '@beautinique/shared-contracts';
import type { Request, RequestHandler, Response } from 'express';

import { type AppRegistry, normalizeHost, originHost } from './apps.ts';
import { FAIL_CLOSED, rateLimitHeaders } from './rate-limits.ts';
import type { SessionGate } from './sessions.ts';
import { clientIp, ORIGIN_SECRET_HEADER } from './trust.ts';

/** One route as the gateway sees it (contracts gatewayManifest). */
export type GatewayRoute = ReturnType<typeof gatewayManifest>[number];

/** The public API: every app's /api/* reaches the gateway through the Vercel rewrite (ARCHITECTURE §9.3). */
export const API_PREFIX = '/api/v1';

/**
 * Headers never passed on as they came: those of one connection, the origin secret, and who the
 * client is (the gateway tells the owner itself, in X-BQ-Client-Ip).
 */
const NOT_FORWARDED = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'host',
  ORIGIN_SECRET_HEADER,
  HEADERS.clientIp.toLowerCase(),
  HEADERS.passport.toLowerCase(),
  'x-real-ip',
  'x-forwarded-for',
  'forwarded',
]);
/** A cached route never sends these on, so its answer cannot depend on who asked (§7.2). */
const PERSONAL = new Set(['cookie', 'authorization']);
/** Idempotency keys: 1 to 255 visible ASCII characters (contracts OpenAPI). */
const IDEMPOTENCY_KEY = /^[\x21-\x7e]{1,255}$/;
/** Methods whose routes have no body (contracts defineRoute refuses one). */
const BODYLESS: ReadonlySet<string> = new Set(['GET', 'DELETE']);

const NOT_FROM_APP = 'This request does not come from a Beautinique app.';
const UNAVAILABLE = 'This part of Beautinique is not available right now. Please try again soon.';
const TOO_SLOW = 'This is taking too long. Please try again.';
const SLOW_DOWN = 'Too many requests. Please wait a moment and try again.';

export interface ProxyOptions {
  manifest: readonly GatewayRoute[];
  upstreams: Partial<Record<Deployable, string | undefined>>;
  timeoutMs: number;
  apps: AppRegistry;
  /** true for the x-origin-secret of the apps' Vercel routes */
  isOriginSecret: (given: string | undefined) => boolean;
  limiter: RateLimiter;
  rateLimits: Readonly<Record<RateLimitClass, RateLimitRule>>;
  logger: Logger;
  /** who signed in (the app's access cookie) */
  sessions: SessionGate;
  /** the passport the owner gets for a signed-in request */
  passport: PassportSigner;
}

/** The route for a method and a path below API_PREFIX, with its decoded parameters. */
export function findRoute(
  manifest: readonly GatewayRoute[],
  method: string,
  path: string,
): { route: GatewayRoute; params: Record<string, string> } | null {
  for (const route of manifest) {
    if (route.method !== method) {
      continue;
    }
    const params = matchPath(route.path, path);
    // "." and ".." would move the forwarded path onto another route
    if (params && !Object.values(params).some((value) => value === '.' || value === '..')) {
      return { route, params };
    }
  }
  return null;
}

const isApp = (value: string | undefined): value is AppId =>
  value !== undefined && (APPS as readonly string[]).includes(value);

/**
 * Does the request come from `app`'s own host (CSRF, ARCHITECTURE §7.2)? Vercel names the app's
 * host in x-forwarded-host; without a proxy in front (the dev server keeps Host) an app's host must
 * be this app's. The API is same-origin for the browser, so a browser's Origin must be that very
 * host: the preview pattern alone cannot tell a branch dash from another account's scope dash.
 */
function fromAppHost(req: Request, app: AppId, apps: AppRegistry): boolean {
  const forwarded = req.get('x-forwarded-host');
  const host = forwarded ?? req.get('host');
  if (forwarded !== undefined) {
    if (apps.appOf(forwarded) !== app) return false;
  } else {
    const hostApp = host === undefined ? null : apps.appOf(host);
    if (hostApp !== null && hostApp !== app) return false;
  }
  const origin = req.get('origin');
  if (origin === undefined) return true;
  const fromHost = originHost(origin);
  return (
    fromHost !== null &&
    host !== undefined &&
    normalizeHost(fromHost) === normalizeHost(host) &&
    apps.appOf(fromHost) === app
  );
}

/** Cache-Control of an answer (§7.2): CDN-cached for a cached route, else never shared. */
function cacheControl(route: GatewayRoute, status: number, upstream: string | undefined): string {
  if (route.cache && (status === 200 || status === 304)) {
    const { sMaxAge, staleWhileRevalidate } = route.cache;
    const stale =
      staleWhileRevalidate > 0 ? `, stale-while-revalidate=${String(staleWhileRevalidate)}` : '';
    return `public, max-age=0, s-maxage=${String(sMaxAge)}${stale}`;
  }
  // the owner may choose its own private policy (e.g. no-cache with an ETag for polling)
  if (upstream !== undefined && /\b(?:private|no-store)\b/i.test(upstream)) return upstream;
  return 'private, no-store';
}

function forwardHeaders(
  req: Request,
  route: GatewayRoute,
  requestId: string,
  ip: string,
  passport: string | undefined,
): Record<string, string | string[]> {
  const headers: Record<string, string | string[]> = {};
  for (const [name, value] of Object.entries(req.headers)) {
    if (value !== undefined && !NOT_FORWARDED.has(name) && !(route.cache && PERSONAL.has(name))) {
      headers[name] = value;
    }
  }
  headers[HEADERS.requestId.toLowerCase()] = requestId;
  headers[HEADERS.clientIp.toLowerCase()] = ip;
  if (passport) headers[HEADERS.passport.toLowerCase()] = passport;
  return headers;
}

/**
 * Streams the request to the route's owner at the route's own path, and the answer back. A route
 * without a body (GET, DELETE) sends none: piping one would go out unframed and the owner would
 * read it as a second request (request smuggling).
 */
function forward(
  req: Request,
  res: Response,
  next: (error: unknown) => void,
  target: URL,
  route: GatewayRoute,
  ip: string,
  timeoutMs: number,
  passport: string | undefined,
): void {
  let timedOut = false;
  const upstream = request(
    target,
    { method: req.method, headers: forwardHeaders(req, route, requestIdOf(res), ip, passport) },
    (answer) => {
      const status = answer.statusCode ?? 502;
      res.status(status);
      for (const [name, value] of Object.entries(answer.headers)) {
        const dropped = name === 'cache-control' || (route.cache && name === 'set-cookie');
        if (value !== undefined && !NOT_FORWARDED.has(name) && !dropped) {
          res.setHeader(name, value);
        }
      }
      const upstreamPolicy = answer.headers['cache-control'];
      res.setHeader('Cache-Control', cacheControl(route, status, upstreamPolicy));
      // the head goes out now; if the owner stops halfway (or times out), the answer is cut off
      // instead of left hanging
      res.flushHeaders();
      pipeline(answer, res, (error) => {
        if (error) res.destroy();
      });
    },
  );
  upstream.setTimeout(timeoutMs, () => {
    timedOut = true;
    upstream.destroy();
  });
  upstream.on('error', (error) => {
    // nobody to answer (the caller left, or the answer already started): just stop
    if (res.headersSent || res.destroyed) {
      res.destroy();
      return;
    }
    next(
      timedOut
        ? new AppError('UPSTREAM_TIMEOUT', TOO_SLOW, { cause: error })
        : new AppError('SERVICE_UNAVAILABLE', UNAVAILABLE, { cause: error }),
    );
  });
  // the caller went away: stop the upstream work too
  res.on('close', () => {
    if (!res.writableFinished) {
      upstream.destroy();
    }
  });
  if (BODYLESS.has(route.method)) {
    upstream.end();
  } else {
    req.pipe(upstream);
  }
}

/** A step-up in the last STEP_UP_SECONDS (and not from the future: a clock-skew allowance of 30 s). */
export const stepUpFresh = (stepUpAt: number | null, now: number): boolean =>
  stepUpAt !== null && stepUpAt <= now + 30_000 && now - stepUpAt <= STEP_UP_SECONDS * 1000;

/**
 * The gateway's checks, in order, then the owner (ARCHITECTURE §5.1, §7.2):
 * 1. the origin secret of the apps' Vercel routes (direct requests to Render are refused);
 * 2. a known app in X-BQ-App, coming from that app's own host;
 * 3. a route of the manifest that this app may use;
 * 4. the route's rate-limit class, per client IP;
 * 5. access: a public route passes; any other needs the app's access cookie (sessions), and its
 *    owner gets a passport of who signed in; a permission route needs the key in one of the
 *    person's grants in this app (else 403), and a step-up route a step-up in the last 5 minutes;
 * 6. the Idempotency-Key the route needs.
 */
export function proxy({
  manifest,
  upstreams,
  timeoutMs,
  apps,
  isOriginSecret,
  limiter,
  rateLimits,
  logger,
  sessions,
  passport,
}: ProxyOptions): RequestHandler {
  // a down Redis would log on every request; once a minute is enough
  let lastLimitsWarning = 0;
  const limitsDown = (error: RateLimitUnavailableError) => {
    if (Date.now() - lastLimitsWarning < 60_000) return;
    lastLimitsWarning = Date.now();
    logger.warn({ err: error }, 'rate limits unavailable (auth and otp refuse, others pass)');
  };

  return async (req, res, next) => {
    // a caller can leave while the gateway waits (rate limit): then nothing goes to the owner
    const caller = { gone: false };
    res.once('close', () => {
      caller.gone = true;
    });
    // gateway answers (errors, 429) are never cached; an owner's answer sets its own policy
    res.setHeader('Cache-Control', 'no-store');
    const fromVercel = isOriginSecret(req.get(ORIGIN_SECRET_HEADER));
    if (!fromVercel) {
      throw new AppError('FORBIDDEN', 'Please use the Beautinique app.');
    }
    const app = req.get(HEADERS.app);
    if (!isApp(app) || !fromAppHost(req, app, apps)) {
      throw new AppError('APP_NOT_ALLOWED', NOT_FROM_APP);
    }
    const match = findRoute(manifest, req.method, req.path);
    if (!match) {
      throw new AppError('NOT_FOUND', `No route for ${req.method} ${req.path}`);
    }
    const { route, params } = match;
    if (!route.apps.includes(app)) {
      throw new AppError('APP_NOT_ALLOWED', 'This app cannot use this feature.');
    }
    const hasBody =
      req.get('transfer-encoding') !== undefined || Number(req.get('content-length') ?? 0) > 0;
    if (BODYLESS.has(route.method) && hasBody) {
      throw new AppError('BAD_REQUEST', 'This request cannot have a body.');
    }

    const ip = clientIp(req, fromVercel);
    const rule = rateLimits[route.rateLimit];
    try {
      const result = await limiter.take(`${route.rateLimit}:${ipKey(ip)}`, rule);
      res.set(rateLimitHeaders(route.rateLimit, rule, result));
      if (!result.allowed) {
        throw new AppError('RATE_LIMITED', SLOW_DOWN);
      }
    } catch (error) {
      if (!(error instanceof RateLimitUnavailableError)) throw error;
      limitsDown(error);
      if (FAIL_CLOSED.has(route.rateLimit)) {
        throw new AppError('SERVICE_UNAVAILABLE', UNAVAILABLE, { cause: error });
      }
    }

    let passportToken: string | undefined;
    if (route.access.type !== 'public') {
      const signedIn = await sessions.check(req, app);
      if (route.access.type === 'permission') {
        // the coarse check: the key in one of the person's grants in this app (T3.3); the scope
        // is the owner's check (T4.1)
        const held = await sessions.holds(signedIn, app, route.access.permission);
        if (held === 'stale') {
          // identity's list belongs to another authz version: refresh, then try again
          throw new AppError('UNAUTHENTICATED', 'Please sign in to continue.');
        }
        if (held === 'no') throw new AppError('FORBIDDEN', 'You do not have access to this.');
        if (route.stepUp && !stepUpFresh(signedIn.stepUpAt, Date.now())) {
          throw new AppError(
            'STEP_UP_REQUIRED',
            'Please confirm with your authenticator code to continue.',
          );
        }
      }
      passportToken = passport.sign({ ...signedIn, app }, passportAudience(route.owner));
    }
    if (route.idempotency && !IDEMPOTENCY_KEY.test(req.get(HEADERS.idempotencyKey) ?? '')) {
      throw new AppError(
        'IDEMPOTENCY_KEY_REQUIRED',
        'This request needs an Idempotency-Key header (1 to 255 visible characters).',
      );
    }
    const origin = upstreams[route.owner];
    if (origin === undefined) {
      throw new AppError('SERVICE_UNAVAILABLE', UNAVAILABLE);
    }
    const queryAt = req.originalUrl.indexOf('?');
    const query = queryAt === -1 ? '' : req.originalUrl.slice(queryAt);
    const target = new URL(buildPath(route.path, params) + query, origin);
    if (caller.gone) return;
    forward(req, res, next, target, route, ip, timeoutMs, passportToken);
  };
}
