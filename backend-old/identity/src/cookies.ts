import {
  ACCESS_TOKEN_SECONDS,
  accessCookieName,
  type AppId,
  OAUTH_COOKIE_PATH,
  REFRESH_COOKIE_PATH,
  refreshCookieName,
  sessionHintCookieName,
} from '@beautinique/shared-contracts';
import type { Request, Response } from 'express';

import type { IssuedSession } from './sessions.ts';

/**
 * A session's cookies on the app's own host (ARCHITECTURE §7.2): no Domain, HttpOnly, Secure. The
 * access cookie (`__Host-`, Path=/) goes with every /api request; the refresh cookie (Strict) only
 * to /api/v1/auth, so it travels with refresh and logout and nothing else.
 */
/** The app's access cookie alone (a step-up renews the access token, not the refresh one). */
export function setAccessCookie(res: Response, app: AppId, accessToken: string): void {
  res.cookie(accessCookieName(app), accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: ACCESS_TOKEN_SECONDS * 1000,
  });
}

export function setSessionCookies(res: Response, session: IssuedSession): void {
  setAccessCookie(res, session.app, session.accessToken);
  const maxAge = Math.max(0, session.expiresAt.getTime() - Date.now());
  res.cookie(refreshCookieName(session.app), session.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: REFRESH_COOKIE_PATH,
    maxAge,
  });
  // the page's hint that a session may be there (contracts sessionHintCookieName): no secret
  res.cookie(sessionHintCookieName(session.app), '1', {
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge,
  });
}

type WithoutSession<T> = T extends unknown ? Omit<T, 'session'> : never;

/**
 * A sign-in's answer: the session goes into the cookies, never into the body. The contract's
 * output schema drops unknown keys too; this does not rely on it, so a looser schema later still
 * keeps the tokens out.
 */
export function signedIn<T extends { session?: IssuedSession }>(
  res: Response,
  result: T,
): WithoutSession<T> {
  const { session, ...answer } = result;
  if (session) setSessionCookies(res, session);
  return answer as WithoutSession<T>;
}

/** Clears the session cookies of the app and its hint (logout, an ended session). */
export function clearSessionCookies(res: Response, app: AppId): void {
  res.clearCookie(sessionHintCookieName(app), { secure: true, sameSite: 'lax', path: '/' });
  res.clearCookie(accessCookieName(app), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
  });
  res.clearCookie(refreshCookieName(app), {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: REFRESH_COOKIE_PATH,
  });
}

/**
 * A social sign-in's cookie (the trip's state, or the sign-up waiting for consent): HttpOnly, on the
 * app's host, sent only to the OAuth routes. Lax, so the browser sends it when the provider sends
 * it back (a top-level GET from another site). `null` clears it.
 */
export function setOAuthCookie(
  res: Response,
  name: string,
  value: string | null,
  seconds: number,
): void {
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: 'lax' as const,
    path: OAUTH_COOKIE_PATH,
  };
  if (value === null) res.clearCookie(name, options);
  else res.cookie(name, value, { ...options, maxAge: seconds * 1000 });
}

/** One cookie's value from the Cookie header (the first, as browsers send the most specific first). */
export function cookieOf(req: Request, name: string): string | undefined {
  for (const pair of (req.get('cookie') ?? '').split(';')) {
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
