import { type AppId, sessionHintCookieName } from '@beautinique/shared-contracts';

/**
 * Whether identity's hint cookie says this app may have a session (contracts
 * sessionHintCookieName, owner 2026-11-02): only then is /iam/me asked, so an anonymous visit
 * costs no call. `null` on the server, where there is no page to read.
 */
export function hasSessionHint(app: AppId): boolean | null {
  if (typeof document === 'undefined') return null;
  const name = `${sessionHintCookieName(app)}=`;
  return document.cookie.split(';').some((pair) => pair.trim().startsWith(name));
}

/**
 * Drops the hint when the session turned out to be gone (identity clears it too, but not for a
 * session ended on another device): the next page load then asks nothing.
 */
export function clearSessionHint(app: AppId): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${sessionHintCookieName(app)}=; Max-Age=0; Path=/; Secure; SameSite=Lax`;
}
