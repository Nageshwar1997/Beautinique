import { OAUTH_SIGN_UP_PATH } from '@beautinique/shared-contracts';

/**
 * The auth pages every app has (ARCHITECTURE §9.2): sign-up only in the sign-up apps, and the
 * consent of an account a provider makes only where social sign-in is (the customer app).
 */
export const AUTH_PATHS = {
  signIn: '/sign-in',
  signUp: '/sign-up',
  forgotPassword: '/forgot-password',
  invitation: '/invitation',
  socialSignUp: OAUTH_SIGN_UP_PATH,
} as const;

/**
 * The account pages, the same in every app (owner, 2026-11-03): signed in only (`RequireSignIn`).
 */
export const ACCOUNT_PATHS = {
  security: '/account/security',
  authenticator: '/account/security/authenticator',
  devices: '/account/devices',
} as const;

const AUTH_PAGES: readonly string[] = Object.values(AUTH_PATHS);

/** Longer than any page of ours; a longer `next` is someone's mischief. */
const MAX_NEXT = 2048;

/** The search parameter that carries where to go after signing in. */
export const NEXT_PARAM = 'next';

/**
 * Where to go after signing in: `next` when it is a page of this site, else `/` (owner,
 * 2026-10-31). A path only: starts with one `/` (`//host` and `/\host` would leave the site), no
 * control characters, and never an auth page (signing in again would loop).
 */
export function safeNext(next: string | null | undefined): string {
  if (typeof next !== 'string' || next.length > MAX_NEXT) return '/';
  if (!next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return '/';
  // eslint-disable-next-line no-control-regex -- control characters are exactly what is refused
  if (/[\u0000-\u001f\u007f\\]/.test(next)) return '/';
  const base = 'https://next.invalid';
  let url: URL;
  try {
    url = new URL(next, base);
  } catch {
    return '/';
  }
  if (url.origin !== base) return '/';
  if (AUTH_PAGES.includes(url.pathname.replace(/\/+$/, '') || '/')) return '/';
  return `${url.pathname}${url.search}${url.hash}`;
}

/** An auth page's link that keeps `next`: `/sign-in?next=%2Forders`; no `next` for the home page. */
export function authHref(path: string, next: string | null | undefined): string {
  const target = safeNext(next);
  return target === '/' ? path : `${path}?${NEXT_PARAM}=${encodeURIComponent(target)}`;
}
