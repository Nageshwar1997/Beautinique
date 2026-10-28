import { JwtError, verifyJwt } from '@beautinique/backend-server-crypto';
import { AppError, cookieOf, type JwksCache, tokenKeyId } from '@beautinique/backend-server-kit';
import type { RedisConnection } from '@beautinique/backend-server-queue';
import {
  accessCookieName,
  type AppId,
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
}

export interface SessionGate {
  /** The person behind the app's access cookie; 401 when there is none or it no longer counts. */
  check(req: Request, app: AppId): Promise<SignedIn>;
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
 * issued (logout, a copied refresh token, a new password). Redis or the JWKS away: 503, never a
 * pass (fail closed).
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
      let ended: number;
      let since: string | null;
      try {
        const answers = (await redis
          .multi()
          .exists(revokedSessionKey(sessionId))
          .get(revokedUserKey(claims.sub))
          .exec()) as [[Error | null, number], [Error | null, string | null]] | null;
        if (!answers || answers[0][0] || answers[1][0]) throw new Error('Redis did not answer');
        [[, ended], [, since]] = answers;
      } catch (error) {
        throw unavailable(error);
      }
      // a token issued before every session of the account ended (in whole seconds: one issued in
      // the same second as the end counts as before it)
      if (ended === 1 || (since !== null && claims.iat * 1000 <= Number(since))) throw signIn();
      return {
        userId: claims.sub,
        sessionId,
        methods: Array.isArray(claims.amr) ? claims.amr.map(String) : [],
        authzVersion: typeof claims.av === 'number' ? claims.av : 0,
      };
    },
  };
}
