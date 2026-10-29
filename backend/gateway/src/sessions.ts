import { JwtError, verifyJwt } from '@beautinique/backend-server-crypto';
import { AppError, cookieOf, type JwksCache, tokenKeyId } from '@beautinique/backend-server-kit';
import type { RedisConnection } from '@beautinique/backend-server-queue';
import {
  accessCookieName,
  type AppId,
  type AppPermissions,
  appPermissionsKey,
  authzVersionKey,
  revokedSessionKey,
  revokedUserKey,
  TOKEN_ISSUER,
  tokenAudience,
} from '@beautinique/shared-contracts';
import type { Request } from 'express';

/** Who signed in, from a checked access token. */
export interface SignedIn {
  userId: string;
  sessionId: string;
  methods: string[];
  authzVersion: number;
  /** When the session last confirmed with the authenticator (ms; the token's `su`), or null */
  stepUpAt: number | null;
}

/** Whether a signed-in person holds a permission in the app: `stale` = refresh first. */
export type Holds = 'yes' | 'no' | 'stale';

export interface SessionGate {
  /** The person behind the app's access cookie; 401 when there is none or it no longer counts. */
  check(req: Request, app: AppId): Promise<SignedIn>;
  /**
   * The coarse permission check (ARCHITECTURE §7.3): is the key in identity's list for this app,
   * written for the token's authz version? A list of another version, or none (Redis lost it),
   * is `stale`: the app refreshes and identity writes it again. Redis away: 503.
   */
  holds(signedIn: SignedIn, app: AppId, permission: string): Promise<Holds>;
}

const signIn = (cause?: unknown) =>
  new AppError('UNAUTHENTICATED', 'Please sign in to continue.', { cause });
const unavailable = (cause: unknown) =>
  new AppError(
    'SERVICE_UNAVAILABLE',
    'Sign-in is not available right now. Please try again soon.',
    {
      cause,
    },
  );

/**
 * The gateway's sign-in check (ARCHITECTURE §7.2): the app's own access cookie, an ES256 token of
 * identity's (its JWKS) for this app (`aud`), not expired; and in Redis, not ended since it was
 * issued (logout, a copied refresh token, a new password), and no grant change since (its `av`).
 * Redis or the JWKS away: 503, never a pass (fail closed).
 */
export function sessionGate({
  keys,
  redis,
  now = Date.now,
}: {
  /** identity's JWKS */
  keys: JwksCache;
  redis: RedisConnection['client'];
  now?: () => number;
}): SessionGate {
  return {
    async check(req, app) {
      const token = cookieOf(req.get('cookie'), accessCookieName(app));
      if (!token) throw signIn();
      let known;
      try {
        known = await keys.keysFor(tokenKeyId(token));
      } catch (error) {
        throw unavailable(error);
      }
      let claims;
      try {
        claims = verifyJwt(token, {
          keys: known,
          audience: tokenAudience(app),
          issuer: TOKEN_ISSUER,
          now: now(),
        });
      } catch (error) {
        if (error instanceof JwtError) throw signIn(error);
        throw error;
      }
      const sessionId = String(claims.sid);
      const authzVersion = typeof claims.av === 'number' ? claims.av : 0;
      let ended: number;
      let since: string | null;
      let current: string | null;
      try {
        const answers = (await redis
          .multi()
          .exists(revokedSessionKey(sessionId))
          .get(revokedUserKey(claims.sub))
          .get(authzVersionKey(claims.sub))
          .exec()) as
          | [[Error | null, number], [Error | null, string | null], [Error | null, string | null]]
          | null;
        if (!answers || answers.some(([error]) => error)) throw new Error('Redis did not answer');
        [[, ended], [, since], [, current]] = answers;
      } catch (error) {
        throw unavailable(error);
      }
      // a token issued before every session of the account ended (in whole seconds: one issued in
      // the same second as the end counts as before it)
      if (ended === 1 || (since !== null && claims.iat * 1000 <= Number(since))) throw signIn();
      // the account's grants changed after this token (ARCHITECTURE §7.2): 401, so the app
      // refreshes and the new token carries the grants of now (or the session ends there)
      if (current !== null && Number(current) > authzVersion) throw signIn();
      return {
        userId: claims.sub,
        sessionId,
        methods: Array.isArray(claims.amr) ? claims.amr.map(String) : [],
        authzVersion,
        stepUpAt: typeof claims.su === 'number' ? claims.su * 1000 : null,
      };
    },

    async holds(signedIn, app, permission) {
      let raw: string | null;
      try {
        raw = await redis.get(appPermissionsKey(signedIn.userId, app));
      } catch (error) {
        throw unavailable(error);
      }
      if (raw === null) return 'stale';
      let list: Partial<AppPermissions>;
      try {
        list = JSON.parse(raw) as Partial<AppPermissions>;
      } catch {
        return 'stale';
      }
      if (list.v !== signedIn.authzVersion || !Array.isArray(list.keys)) return 'stale';
      return list.keys.includes(permission) ? 'yes' : 'no';
    },
  };
}
