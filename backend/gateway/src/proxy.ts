import { request } from 'node:http';

import { AppError, requestIdOf } from '@beautinique/backend-server-kit';
import {
  type AppId,
  APPS,
  buildPath,
  type Deployable,
  type gatewayManifest,
  HEADERS,
  matchPath,
} from '@beautinique/shared-contracts';
import type { Request, RequestHandler } from 'express';

/** One route as the gateway sees it (contracts gatewayManifest). */
export type GatewayRoute = ReturnType<typeof gatewayManifest>[number];

/** The public API: every app's /api/* reaches the gateway through the Vercel rewrite (ARCHITECTURE §9.3). */
export const API_PREFIX = '/api/v1';

/** Headers of one connection, or for the gateway only: never passed on. */
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
  'x-origin-secret',
]);

const UNAVAILABLE = 'This part of Beautinique is not available right now. Please try again soon.';
const TOO_SLOW = 'This is taking too long. Please try again.';

export interface ProxyOptions {
  manifest: readonly GatewayRoute[];
  upstreams: Partial<Record<Deployable, string | undefined>>;
  timeoutMs: number;
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

function forwardHeaders(req: Request, requestId: string): Record<string, string | string[]> {
  const headers: Record<string, string | string[]> = {};
  for (const [name, value] of Object.entries(req.headers)) {
    if (value !== undefined && !NOT_FORWARDED.has(name)) {
      headers[name] = value;
    }
  }
  headers[HEADERS.requestId.toLowerCase()] = requestId;
  headers['x-forwarded-for'] = [req.get('x-forwarded-for'), req.socket.remoteAddress]
    .filter((part) => part !== undefined)
    .join(', ');
  return headers;
}

/**
 * Checks the app (X-BQ-App), finds the route in the manifest and streams the request to the
 * deployable that owns it, at the route's own path (re-encoded, so it cannot change shape), then
 * streams the answer back.
 */
export function proxy({ manifest, upstreams, timeoutMs }: ProxyOptions): RequestHandler {
  return (req, res, next) => {
    const app = req.get(HEADERS.app);
    if (!isApp(app)) {
      next(new AppError('APP_NOT_ALLOWED', 'This request does not come from a Beautinique app.'));
      return;
    }
    const match = findRoute(manifest, req.method, req.path);
    if (!match) {
      next(new AppError('NOT_FOUND', `No route for ${req.method} ${req.path}`));
      return;
    }
    if (!match.route.apps.includes(app)) {
      next(new AppError('APP_NOT_ALLOWED', 'This app cannot use this feature.'));
      return;
    }
    const origin = upstreams[match.route.owner];
    if (origin === undefined) {
      next(new AppError('SERVICE_UNAVAILABLE', UNAVAILABLE));
      return;
    }
    const queryAt = req.originalUrl.indexOf('?');
    const query = queryAt === -1 ? '' : req.originalUrl.slice(queryAt);
    const target = new URL(buildPath(match.route.path, match.params) + query, origin);

    let timedOut = false;
    const upstream = request(
      target,
      { method: req.method, headers: forwardHeaders(req, requestIdOf(res)) },
      (answer) => {
        res.status(answer.statusCode ?? 502);
        for (const [name, value] of Object.entries(answer.headers)) {
          if (value !== undefined && !NOT_FORWARDED.has(name)) {
            res.setHeader(name, value);
          }
        }
        answer.pipe(res);
      },
    );
    upstream.setTimeout(timeoutMs, () => {
      timedOut = true;
      upstream.destroy();
    });
    upstream.on('error', (error) => {
      if (res.headersSent) {
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
    req.pipe(upstream);
  };
}
