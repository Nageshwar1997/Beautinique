import type { KeyObject } from 'node:crypto';

import {
  generateSigningKey,
  JwtError,
  type PublicJwk,
  publicKeyFromJwk,
  type SigningKey,
  signJwt,
  verifyJwt,
} from '@beautinique/backend-server-crypto';
import {
  type AppId,
  HEADERS,
  PASSPORT_ISSUER,
  PASSPORT_SECONDS,
} from '@beautinique/shared-contracts';
import type { Request } from 'express';

import { AppError } from './errors';

/**
 * The tokens between deployables (ARCHITECTURE §7.2): reading a JWKS with a cache, and the
 * passport the gateway signs for the owner of a route once it has checked who signed in.
 */

/** One cookie's value from a Cookie header, decoded (the first one: browsers send the most specific first). */
export function cookieOf(header: string | undefined, name: string): string | undefined {
  for (const pair of (header ?? '').split(';')) {
    const at = pair.indexOf('=');
    if (at > 0 && pair.slice(0, at).trim() === name) {
      const value = pair.slice(at + 1).trim();
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    }
  }
  return undefined;
}

/** The key id in a token's header, without trusting anything else in it; undefined if unreadable. */
export function tokenKeyId(token: string): string | undefined {
  const [header] = token.split('.');
  if (!header || !/^[A-Za-z0-9_-]+$/.test(header)) return undefined;
  try {
    const parsed: unknown = JSON.parse(Buffer.from(header, 'base64url').toString('utf8'));
    const kid = (parsed as { kid?: unknown } | null)?.kid;
    return typeof kid === 'string' ? kid : undefined;
  } catch {
    return undefined;
  }
}

export interface JwksCache {
  /** The verification keys, with `kid` among them if the issuer has it (read again if not). */
  keysFor(kid: string | undefined): Promise<ReadonlyMap<string, KeyObject>>;
}

/**
 * A JWKS kept for `maxAgeMs` (default 10 minutes) and read again sooner when a token names a key
 * it does not have (a new key after a rotation), at most once per `minRefetchMs` (default 30 s),
 * so made-up key ids cannot make it hammer the issuer. A failed read keeps the keys it had.
 */
export function jwksCache({
  load,
  maxAgeMs = 10 * 60_000,
  minRefetchMs = 30_000,
  now = Date.now,
}: {
  /** The JWKS document (`{ keys: [...] }`) */
  load: () => Promise<unknown>;
  maxAgeMs?: number;
  minRefetchMs?: number;
  now?: () => number;
}): JwksCache {
  let keys = new Map<string, KeyObject>();
  let loadedAt = Number.NEGATIVE_INFINITY;
  let loading: Promise<void> | undefined;

  const reload = async () => {
    loadedAt = now();
    const document = (await load()) as { keys?: unknown } | null;
    if (!Array.isArray(document?.keys)) throw new Error('Not a JWKS document');
    const next = new Map<string, KeyObject>();
    for (const jwk of document.keys as Partial<PublicJwk>[]) {
      // one bad entry does not hide the others
      try {
        if (typeof jwk.kid === 'string') next.set(jwk.kid, publicKeyFromJwk(jwk));
      } catch {
        continue;
      }
    }
    keys = next;
  };

  return {
    async keysFor(kid) {
      const stale = now() - loadedAt >= maxAgeMs;
      const missing = kid !== undefined && !keys.has(kid) && now() - loadedAt >= minRefetchMs;
      if (stale || missing) {
        loading ??= reload().finally(() => {
          loading = undefined;
        });
        await loading;
      }
      return keys;
    },
  };
}

/** A JWKS read from a URL (with a 2 s timeout). */
export const jwksFromUrl = (url: string) => async (): Promise<unknown> => {
  const response = await fetch(url, { signal: AbortSignal.timeout(2_000) });
  if (!response.ok) throw new Error(`JWKS answered ${String(response.status)}`);
  return response.json();
};

/** Who signed in, as the gateway vouches for one request. */
export interface Passport {
  userId: string;
  sessionId: string;
  app: AppId;
  /** How the person proved who they are in this session (`password`, `totp` ...) */
  methods: string[];
  /** Grants version (T3.3): an older one means read the grants again */
  authzVersion: number;
}

export interface PassportSigner {
  /** The public key, for PASSPORT_JWKS_PATH */
  jwks: PublicJwk[];
  /** A 60-second passport for one owner (`audience`, passportAudience()) */
  sign(passport: Passport, audience: string): string;
}

/** The gateway's signer, with a key of its own made now unless one is given (backend/bundle). */
export function passportSigner(
  key: SigningKey = generateSigningKey(),
  now = Date.now,
): PassportSigner {
  return {
    jwks: [key.publicJwk],
    sign({ userId, sessionId, app, methods, authzVersion }, audience) {
      const iat = Math.floor(now() / 1000);
      return signJwt(
        {
          iss: PASSPORT_ISSUER,
          sub: userId,
          aud: audience,
          iat,
          exp: iat + PASSPORT_SECONDS,
          sid: sessionId,
          app,
          amr: methods,
          av: authzVersion,
        },
        { kid: key.kid, privateKey: key.privateKeyPem },
      );
    },
  };
}

const notSignedIn = (cause?: unknown) =>
  new AppError('UNAUTHENTICATED', 'Please sign in to continue.', { cause });

/**
 * Reads the passport the gateway put on a request for this deployable (`audience`). No passport,
 * one for another owner, an old or forged one: 401. The keys come from the gateway's JWKS. Only
 * the gateway reaches a deployable, and it drops a passport a client sent.
 */
export function passportVerifier({
  keys,
  audience,
  now = Date.now,
}: {
  keys: JwksCache;
  audience: string;
  now?: () => number;
}): (req: Request) => Promise<Passport> {
  return async (req) => {
    const token = req.get(HEADERS.passport);
    if (!token) throw notSignedIn();
    let claims;
    try {
      claims = verifyJwt(token, {
        keys: await keys.keysFor(tokenKeyId(token)),
        audience,
        issuer: PASSPORT_ISSUER,
        now: now(),
        leewaySeconds: 5,
      });
    } catch (error) {
      if (error instanceof JwtError) throw notSignedIn(error);
      throw new AppError('SERVICE_UNAVAILABLE', 'Sign-in is not available right now.', {
        cause: error,
      });
    }
    return {
      userId: claims.sub,
      sessionId: String(claims.sid),
      app: claims.app as AppId,
      methods: Array.isArray(claims.amr) ? claims.amr.map(String) : [],
      authzVersion: typeof claims.av === 'number' ? claims.av : 0,
    };
  };
}
