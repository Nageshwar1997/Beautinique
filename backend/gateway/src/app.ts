import {
  createApp,
  type Logger,
  type PassportSigner,
  type ReadyCheck,
} from '@beautinique/backend-server-kit';
import type { RateLimiter, RateLimitRule } from '@beautinique/backend-server-ratelimit';
import {
  type Deployable,
  DEPLOYABLES,
  PASSPORT_JWKS_PATH,
  type RateLimitClass,
} from '@beautinique/shared-contracts';
import axios from 'axios';
import type { Express } from 'express';

import type { AppRegistry } from './apps.ts';
import { API_PREFIX, type GatewayRoute, proxy } from './proxy.ts';
import type { SessionGate } from './sessions.ts';
import { statusRoute } from './status.ts';

export interface GatewayAppOptions {
  logger: Logger;
  /** contracts gatewayManifest() of every platform route */
  manifest: readonly GatewayRoute[];
  /** origin of each deployable that runs; the routes of the others answer 503 */
  upstreams: Partial<Record<Deployable, string | undefined>>;
  upstreamTimeoutMs: number;
  /** which host belongs to which app */
  apps: AppRegistry;
  /** true for the x-origin-secret of the apps' Vercel routes */
  isOriginSecret: (given: string | undefined) => boolean;
  limiter: RateLimiter;
  rateLimits: Readonly<Record<RateLimitClass, RateLimitRule>>;
  /** the gateway's own dependency (Redis) for /ready and /status */
  redisReady: ReadyCheck;
  /** who signed in: the apps' access cookies, checked with identity's JWKS and Redis */
  sessions: SessionGate;
  /** signs the owners' passports; its public key is at PASSPORT_JWKS_PATH */
  passport: PassportSigner;
  /** how long one round of /ready checks answers every caller (default READY_REUSE_MS) */
  readyReuseMs?: number;
}

/**
 * /ready is public and outside the rate limits; each round asks Redis and every deployable's
 * /health. One round answers every caller for this long, as /status does, so a flood costs a few
 * internal calls every 5 seconds instead of some for each request (QA audit DR-001).
 */
export const READY_REUSE_MS = 5000;

/** A check whose answer, or the round still running, every caller shares for `ms`. */
export function reusedFor(ms: number, check: ReadyCheck): ReadyCheck {
  let last: { at: number; answer: Promise<boolean> } | undefined;
  return () => {
    const at = Date.now();
    if (last === undefined || at - last.at >= ms) {
      last = { at, answer: Promise.resolve().then(check) };
    }
    return last.answer;
  };
}

/** Does the deployable's /health answer within 2 seconds? */
async function isHealthy(origin: string): Promise<boolean> {
  try {
    const res = await axios.get(new URL('/health', origin).href, {
      signal: AbortSignal.timeout(2000),
      validateStatus: () => true,
    });
    return res.status >= 200 && res.status <= 299;
  } catch {
    return false;
  }
}

/**
 * The gateway: the server-kit basics (security headers, request id, access log, /health), /ready
 * over Redis and every upstream, /status, /wake, and the proxy under /api/v1. /health, /ready,
 * /status and /wake stay outside the origin-secret check: Render, the monitors and the apps'
 * wake-up screen call them directly (§7.2, §11.1).
 * Bodies are not parsed here; they stream to the owner unchanged.
 */
export function buildApp({
  logger,
  manifest,
  upstreams,
  upstreamTimeoutMs,
  apps,
  isOriginSecret,
  limiter,
  rateLimits,
  redisReady,
  sessions,
  passport,
  readyReuseMs = READY_REUSE_MS,
}: GatewayAppOptions): Express {
  const running = DEPLOYABLES.flatMap((name) => {
    const origin = upstreams[name];
    return origin === undefined ? [] : [[name, origin] as const];
  });
  return createApp({
    logger,
    json: false,
    ready: {
      redis: reusedFor(readyReuseMs, redisReady),
      ...Object.fromEntries(
        running.map(([name, origin]) => [name, reusedFor(readyReuseMs, () => isHealthy(origin))]),
      ),
    },
    routes: (app) => {
      app.get('/status', statusRoute({ own: { redis: redisReady }, upstreams }));
      // the deployables check passports with this public key (not an /api route: a key is no secret)
      app.get(PASSPORT_JWKS_PATH, (_req, res) => {
        res.setHeader('Cache-Control', 'no-store');
        res.json({ keys: passport.jwks });
      });
      // The apps' wake-up screen calls this straight, not through their Vercel route: a request on
      // that route does not wake a sleeping free Render service, one sent here does (2026-10-26,
      // ARCHITECTURE §11.1). A browser cannot send the origin secret, so it stays outside that check
      // like /health; it touches nothing and is never cached. Render's own check stays /health.
      app.get('/wake', (_req, res) => {
        res.setHeader('Cache-Control', 'no-store');
        // the apps' pages call it from their own host (no-cors): an empty answer they may receive,
        // instead of helmet's same-origin rule failing the call in the browser
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.status(204).end();
      });
      app.use(
        API_PREFIX,
        proxy({
          manifest,
          upstreams,
          timeoutMs: upstreamTimeoutMs,
          apps,
          isOriginSecret,
          limiter,
          rateLimits,
          logger,
          sessions,
          passport,
        }),
      );
    },
  });
}
