// The cookie helpers on their own: the tokens of a sign-in go into cookies and never into the
// answer, whatever the contract's output schema does with unknown keys.
import type { Request, Response } from 'express';
import { describe, expect, it } from 'vitest';

import { cookieOf, signedIn } from '../src/cookies.ts';
import type { IssuedSession } from '../src/sessions.ts';

const session: IssuedSession = {
  user: { userId: '0199f3a2-7c41-7b2e-9d10-4f6a2b8c1e01', email: 'riya@beautinique.example' },
  app: 'seller',
  sessionId: '0199f3a2-7c41-7b2e-9d10-4f6a2b8c1e01',
  accessToken: 'header.payload.signature',
  refreshToken: '0199f3a2-7c41-7b2e-9d10-4f6a2b8c1e01.secret-part',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60_000),
};

/** A Response that only records the cookies set on it. */
function fakeResponse() {
  const cookies: { name: string; value: string }[] = [];
  const res = {
    cookie(name: string, value: string) {
      cookies.push({ name, value });
      return res;
    },
  };
  return { res: res as unknown as Response, cookies };
}

describe('signedIn', () => {
  it('puts the session into the cookies and keeps every token out of the answer', () => {
    const { res, cookies } = fakeResponse();
    const answer = signedIn(res, { next: 'signed-in' as const, user: session.user, session });
    expect(answer).toEqual({ next: 'signed-in', user: session.user });
    expect(JSON.stringify(answer)).not.toContain(session.accessToken);
    expect(JSON.stringify(answer)).not.toContain('secret-part');
    expect(cookies).toEqual([
      { name: '__Host-bq_seller_at', value: session.accessToken },
      { name: '__Secure-bq_seller_rt', value: session.refreshToken },
    ]);
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
