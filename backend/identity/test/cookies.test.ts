// The cookie helpers on their own: the tokens of a sign-in go into cookies and never into the
// answer, whatever the contract's output schema does with unknown keys.
import { randomBytes } from 'node:crypto';

import type { Request, Response } from 'express';
import { describe, expect, it } from 'vitest';

import { clearSessionCookies, cookieOf, signedIn } from '../src/cookies.ts';
import type { IssuedSession } from '../src/sessions.ts';

// token-shaped values made at run time: a literal one looks like a key to gitleaks (HANDOFF §6)
const sessionId = '0199f3a2-7c41-7b2e-9d10-4f6a2b8c1e01';
const secretPart = randomBytes(32).toString('base64url');
const session: IssuedSession = {
  user: { userId: sessionId, email: 'riya@beautinique.example' },
  app: 'seller',
  sessionId,
  accessToken: ['header', 'payload', randomBytes(64).toString('base64url')].join('.'),
  refreshToken: `${sessionId}.${secretPart}`,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60_000),
};

interface Options {
  httpOnly?: boolean;
  secure?: boolean;
  path?: string;
  maxAge?: number;
}

/** A Response that only records the cookies set and cleared on it. */
function fakeResponse() {
  const cookies: { name: string; value: string; options: Options }[] = [];
  const cleared: { name: string; options: Options }[] = [];
  const res = {
    cookie(name: string, value: string, options: Options) {
      cookies.push({ name, value, options });
      return res;
    },
    clearCookie(name: string, options: Options) {
      cleared.push({ name, options });
      return res;
    },
  };
  return { res: res as unknown as Response, cookies, cleared };
}

describe('signedIn', () => {
  it('puts the session into the cookies and keeps every token out of the answer', () => {
    const { res, cookies } = fakeResponse();
    const answer = signedIn(res, { next: 'signed-in' as const, user: session.user, session });
    expect(answer).toEqual({ next: 'signed-in', user: session.user });
    expect(JSON.stringify(answer)).not.toContain(session.accessToken);
    expect(JSON.stringify(answer)).not.toContain(secretPart);
    expect(cookies.map(({ name, value }) => ({ name, value }))).toEqual([
      { name: '__Host-bq_seller_at', value: session.accessToken },
      { name: '__Secure-bq_seller_rt', value: session.refreshToken },
      { name: '__Host-bq_seller_hint', value: '1' },
    ]);
  });

  it('gives the page a hint it can read, with nothing in it, as long as the refresh cookie', () => {
    const { res, cookies } = fakeResponse();
    signedIn(res, { next: 'signed-in' as const, user: session.user, session });
    const [access, refresh, hint] = cookies;
    expect(access?.options.httpOnly).toBe(true);
    expect(refresh?.options.httpOnly).toBe(true);
    expect(hint?.options).toMatchObject({ secure: true, path: '/' });
    expect(hint?.options.httpOnly).toBeUndefined();
    expect(hint?.options.maxAge).toBe(refresh?.options.maxAge);
  });

  it('clears the hint with the session cookies', () => {
    const { res, cleared } = fakeResponse();
    clearSessionCookies(res, 'seller');
    expect(cleared.map((cookie) => cookie.name).toSorted()).toEqual([
      '__Host-bq_seller_at',
      '__Host-bq_seller_hint',
      '__Secure-bq_seller_rt',
    ]);
    expect(cleared.find((c) => c.name === '__Host-bq_seller_hint')?.options.path).toBe('/');
  });

  it('sets no cookie for a step that is not a session yet', () => {
    const { res, cookies } = fakeResponse();
    const loginId = '0199f3a2-7c41-7b2e-9d10-4f6a2b8c1e02';
    // the shape login.ts gives before the second step (LoginStep)
    const step = { next: 'totp' as const, loginId, session: undefined };
    expect(signedIn(res, step)).toEqual({ next: 'totp', loginId });
    expect(cookies).toEqual([]);
  });
});

describe('cookieOf', () => {
  const request = (cookie?: string) =>
    ({ get: (name: string) => (name === 'cookie' ? cookie : undefined) }) as unknown as Request;

  it('reads one cookie by its exact name, decoded', () => {
    const header = 'theme=dark; __Secure-bq_seller_rt=abc%2Edef; __Secure-bq_seller_rt_old=x';
    expect(cookieOf(request(header), '__Secure-bq_seller_rt')).toBe('abc.def');
    expect(cookieOf(request(header), 'theme')).toBe('dark');
    expect(cookieOf(request(header), 'bq_seller_rt')).toBeUndefined();
  });

  it('gives nothing without a Cookie header, and a broken escape as it came', () => {
    expect(cookieOf(request(), 'theme')).toBeUndefined();
    expect(cookieOf(request('a=%E0%A4'), 'a')).toBe('%E0%A4');
  });
});
