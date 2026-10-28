// Sessions (T3.2): cookies, ES256 access tokens and the JWKS, refresh rotation with reuse
// detection, idle and maximum lifetimes, logout, and a new password ending every session. Against
// the local MongoDB replica set and Valkey (`npm run infra:up`). See helpers.ts.
import { type KeyObject } from 'node:crypto';

import { publicKeyFromJwk, verifyJwt } from '@beautinique/backend-server-crypto';
import { OUTBOX } from '@beautinique/backend-server-queue';
import {
  type AppId,
  revokedSessionKey,
  revokedUserKey,
  TOKEN_ISSUER,
  tokenAudience,
} from '@beautinique/shared-contracts';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { JWKS_PATH } from '../src/app.ts';
import { deviceName, type Session, SESSIONS } from '../src/sessions.ts';
import { ROTATE_AFTER_MS, SIGNING_KEYS, type SigningKeyRecord } from '../src/signing-keys.ts';
import {
  codeOf,
  type Harness,
  makeAccount,
  PASSWORD,
  passwordCode,
  signUpCode,
  startHarness,
  verify,
} from './helpers.ts';

let harness: Harness;
const email = (name: string) => `${name}-${harness.runId}@beautinique.example`;
const redis = () => harness.server.runtime.redis.client;
const sessionsDb = () => harness.server.runtime.mongo.db.collection<Session>(SESSIONS);
const CHROME =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

beforeAll(async () => {
  harness = await startHarness('sessions');
});

afterAll(async () => {
  await harness.stop();
});

interface Raw {
  status: number;
  body: { data?: Record<string, unknown>; error?: { code: string } };
  cookies: Record<string, { value: string; attributes: string[] }>;
}

/** A request like the gateway's, with the cookies a browser would send, and the Set-Cookie back. */
async function call(
  path: string,
  { app = 'customer', cookie, body = {} }: { app?: AppId; cookie?: string; body?: unknown } = {},
): Promise<Raw> {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    'X-BQ-App': app,
    'X-BQ-Client-Ip': '203.0.113.9',
    'user-agent': CHROME,
  };
  if (cookie) headers.cookie = cookie;
  const response = await fetch(`${harness.server.url}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const cookies: Raw['cookies'] = {};
  for (const line of response.headers.getSetCookie()) {
    const [pair = '', ...attributes] = line.split(';').map((part) => part.trim());
    const at = pair.indexOf('=');
    cookies[pair.slice(0, at)] = { value: pair.slice(at + 1), attributes };
  }
  return { status: response.status, body: (await response.json()) as Raw['body'], cookies };
}

const signIn = (address: string, app: AppId = 'customer') =>
  call('/auth/login', { app, body: { email: address, password: PASSWORD } });
const refreshWith = (token: string, app: AppId = 'customer') =>
  call('/auth/refresh', { app, cookie: `__Secure-bq_${app}_rt=${token}` });
const accessOf = (answer: Raw, app: AppId = 'customer') =>
  answer.cookies[`__Host-bq_${app}_at`]?.value ?? '';
const refreshOf = (answer: Raw, app: AppId = 'customer') =>
  answer.cookies[`__Secure-bq_${app}_rt`]?.value ?? '';

async function jwksKeys(): Promise<Map<string, KeyObject>> {
  const answer = await fetch(`${harness.server.url}${JWKS_PATH}`);
  expect(answer.headers.get('cache-control')).toBe('no-store');
  const { keys } = (await answer.json()) as { keys: { kid: string }[] };
  return new Map(keys.map((key) => [key.kid, publicKeyFromJwk(key)]));
}

describe('signing in', () => {
  it('sets the app’s two cookies, with an access token the JWKS verifies and no token in the body', async () => {
    const address = email('riya');
    const userId = await makeAccount(address);
    const answer = await signIn(address);
    expect(answer.status).toBe(200);
    expect(JSON.stringify(answer.body)).not.toContain(accessOf(answer));
    expect(answer.cookies['__Host-bq_customer_at']?.attributes).toEqual([
      'Max-Age=600',
      'Path=/',
      expect.stringMatching(/^Expires=/),
      'HttpOnly',
      'Secure',
      'SameSite=Lax',
    ]);
    const refresh = answer.cookies['__Secure-bq_customer_rt'];
    expect(refresh?.attributes).toEqual(
      expect.arrayContaining(['Path=/api/v1/auth', 'HttpOnly', 'Secure', 'SameSite=Strict']),
    );
    const maxAge = Number(refresh?.attributes.find((a) => a.startsWith('Max-Age='))?.slice(8));
    expect(maxAge).toBeGreaterThan(30 * 24 * 3600 - 60);
    expect(maxAge).toBeLessThanOrEqual(30 * 24 * 3600);
    // no Domain: the cookies stay on the app's own host
    expect(JSON.stringify(answer.cookies)).not.toMatch(/Domain=/i);

    const claims = verifyJwt(accessOf(answer), {
      keys: await jwksKeys(),
      audience: tokenAudience('customer'),
      issuer: TOKEN_ISSUER,
    });
    expect(claims).toMatchObject({ sub: userId, amr: ['password'], av: 0 });
    expect(claims.exp - claims.iat).toBe(600);
    // each app's token is for that app only
    const seller = await signIn(address, 'seller');
    const sellerToken = seller.cookies['__Host-bq_seller_at']?.value ?? '';
    const keys = await jwksKeys();
    expect(
      verifyJwt(sellerToken, { keys, audience: tokenAudience('seller'), issuer: TOKEN_ISSUER }).aud,
    ).toBe('bq:seller');
    expect(() =>
      verifyJwt(sellerToken, { keys, audience: tokenAudience('customer'), issuer: TOKEN_ISSUER }),
    ).toThrow('audience');
    const session = await sessionsDb().findOne({ _id: String(claims.sid) });
    expect(session).toMatchObject({
      userId,
      email: address,
      app: 'customer',
      device: 'Chrome on Windows',
      ip: '203.0.113.9',
      methods: ['password'],
      revokedAt: null,
    });
    // the refresh token is never stored, only its keyed hash
    expect(JSON.stringify(session)).not.toContain(refreshOf(answer).split('.')[1]);
  });

  it('gives a new account a session at sign-up too', async () => {
    const address = email('new');
    const challenge = await signUpCode(address);
    const answer = await call(`/auth/otp/${challenge.challengeId}/verify`, {
      body: { code: await codeOf(challenge.challengeId), password: PASSWORD },
    });
    expect(answer.body.data).toMatchObject({ outcome: 'account-made', signedIn: true });
    expect(accessOf(answer)).not.toBe('');
    expect(refreshOf(answer)).not.toBe('');
  });
});

describe('refreshing', () => {
  it('rotates the refresh token; the old one a moment later is a parallel tab, later a copy', async () => {
    const address = email('rotate');
    await makeAccount(address);
    const first = await signIn(address);
    const old = refreshOf(first);
    const next = await refreshWith(old);
    expect(next.status).toBe(200);
    expect(next.body.data).toMatchObject({ user: { email: address } });
    expect(refreshOf(next)).not.toBe(old);
    expect(accessOf(next)).not.toBe(accessOf(first));
    const sessionId = old.split('.')[0] ?? '';
    // the same old token at once: another tab refreshed first; nothing is cleared
    const race = await refreshWith(old);
    expect([race.status, race.body.error?.code]).toEqual([409, 'REFRESH_IN_PROGRESS']);
    expect(race.cookies).toEqual({});
    // the same old token later: someone has a copy
    await sessionsDb().updateOne(
      { _id: sessionId },
      { $set: { rotatedAt: new Date(Date.now() - 11_000) } },
    );
    const copied = await refreshWith(old);
    expect([copied.status, copied.body.error?.code]).toEqual([401, 'SESSION_EXPIRED']);
    expect(copied.cookies['__Host-bq_customer_at']?.attributes).toContain(
      'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    );
    expect(await sessionsDb().findOne({ _id: sessionId })).toMatchObject({
      revokeReason: 'reuse',
    });
    expect(await redis().exists(revokedSessionKey(sessionId))).toBe(1);
    const [event] = await harness.server.runtime.mongo.db
      .collection<{ type: string; envelope: { data: Record<string, unknown> } }>(OUTBOX)
      .find({ type: 'identity.session.reuseDetected', 'envelope.data.sessionId': sessionId })
      .toArray();
    expect(event?.envelope.data).toMatchObject({
      email: address,
      app: 'customer',
      device: 'Chrome on Windows',
    });
    // the newest token ends with the session
    expect((await refreshWith(refreshOf(next))).status).toBe(401);
  });

  it('refuses no cookie, a made-up token and another app’s token, clearing the cookies', async () => {
    const address = email('other-app');
    await makeAccount(address);
    const seller = await signIn(address, 'seller');
    const fakeId = '0199f3a2-7c41-7b2e-9d10-4f6a2b8c1e01';
    for (const answer of [
      await call('/auth/refresh'),
      await refreshWith('not-a-token'),
      await refreshWith(`${fakeId}.made-up`),
      await refreshWith(refreshOf(seller, 'seller'), 'customer'),
    ]) {
      expect([answer.status, answer.body.error?.code]).toEqual([401, 'SESSION_EXPIRED']);
      expect(answer.cookies['__Secure-bq_customer_rt']?.attributes).toContain(
        'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
      );
    }
    // a made-up secret with a real session id is refused, and does not end that session
    const customer = await signIn(address);
    const realId = refreshOf(customer).split('.')[0] ?? '';
    expect((await refreshWith(`${realId}.forged-secret`)).body.error?.code).toBe('SESSION_EXPIRED');
    expect((await sessionsDb().findOne({ _id: realId }))?.revokedAt).toBeNull();
    expect((await refreshWith(refreshOf(customer))).status).toBe(200);
    // the seller session is untouched by the wrong-app try
    expect((await refreshWith(refreshOf(seller, 'seller'), 'seller')).status).toBe(200);
  });

  it('moves a customer session 30 days ahead at each refresh, never past 90 days from sign-in', async () => {
    const address = email('sliding');
    await makeAccount(address);
    const answer = await signIn(address);
    const sessionId = refreshOf(answer).split('.')[0] ?? '';
    const day = 24 * 60 * 60_000;
    const createdAt = new Date(Date.now() - 80 * day);
    await sessionsDb().updateOne({ _id: sessionId }, { $set: { createdAt } });
    const refreshed = await refreshWith(refreshOf(answer));
    const session = await sessionsDb().findOne({ _id: sessionId });
    expect(session?.expiresAt.getTime()).toBe(createdAt.getTime() + 90 * day);
    expect(session?.purgeAt.getTime()).toBe(createdAt.getTime() + 120 * day);
    expect(refreshed.body.data?.expiresAt).toBe(session?.expiresAt.toISOString());
    // past its end, the session refreshes no more (a refresh must not bring it back)
    await sessionsDb().updateOne(
      { _id: sessionId },
      { $set: { expiresAt: new Date(Date.now() - 1000) } },
    );
    const ended = await refreshWith(refreshOf(refreshed));
    expect([ended.status, ended.body.error?.code]).toEqual([401, 'SESSION_EXPIRED']);
  });

  it('ends an internal session after 30 idle minutes, quietly, with no reuse alarm', async () => {
    const address = email('idle');
    const userId = await makeAccount(address);
    const issued = await harness.server.runtime.otp.sessions.issue({
      userId,
      email: address,
      app: 'admin',
      methods: ['password', 'totp'],
      client: { ip: '203.0.113.9', userAgent: CHROME },
    });
    expect(issued.expiresAt.getTime() - Date.now()).toBeLessThanOrEqual(12 * 60 * 60_000);
    const next = await refreshWith(issued.refreshToken, 'admin');
    expect(next.status).toBe(200);
    await sessionsDb().updateOne(
      { _id: issued.sessionId },
      { $set: { lastSeenAt: new Date(Date.now() - 31 * 60_000) } },
    );
    expect((await refreshWith(refreshOf(next, 'admin'), 'admin')).body.error?.code).toBe(
      'SESSION_EXPIRED',
    );
    // the token before it, after its session ran out: no alarm, no email
    await sessionsDb().updateOne(
      { _id: issued.sessionId },
      { $set: { rotatedAt: new Date(Date.now() - 60_000) } },
    );
    expect((await refreshWith(issued.refreshToken, 'admin')).status).toBe(401);
    expect((await sessionsDb().findOne({ _id: issued.sessionId }))?.revokedAt).toBeNull();
  });
});

describe('ending sessions', () => {
  it('logs out: the session ends at once at the gateway, the cookies go, the token stops', async () => {
    const address = email('logout');
    await makeAccount(address);
    const answer = await signIn(address);
    const token = refreshOf(answer);
    const sessionId = token.split('.')[0] ?? '';
    // the session id alone (with a made-up secret) logs nobody out
    await call('/auth/logout', { cookie: `__Secure-bq_customer_rt=${sessionId}.forged-secret` });
    expect((await sessionsDb().findOne({ _id: sessionId }))?.revokedAt).toBeNull();
    const out = await call('/auth/logout', { cookie: `__Secure-bq_customer_rt=${token}` });
    expect(out.body.data).toEqual({ signedOut: true });
    expect(out.cookies['__Host-bq_customer_at']?.attributes).toContain(
      'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    );
    expect(await sessionsDb().findOne({ _id: sessionId })).toMatchObject({
      revokeReason: 'logout',
    });
    expect(await redis().pttl(revokedSessionKey(sessionId))).toBeGreaterThan(600_000);
    expect((await refreshWith(token)).status).toBe(401);
    // without a cookie, logout still answers and clears
    expect((await call('/auth/logout')).body.data).toEqual({ signedOut: true });
  });

  it('ends every session of an account when its password is set with an email code', async () => {
    const address = email('reset');
    const userId = await makeAccount(address);
    // the sign-up's own session, and two sign-ins
    const one = await signIn(address);
    const two = await signIn(address, 'seller');
    const before = Date.now();
    await verify((await passwordCode(address)).challengeId, 'a brand new password');
    expect(await sessionsDb().countDocuments({ userId, revokeReason: 'password-changed' })).toBe(3);
    expect(Number(await redis().get(revokedUserKey(userId)))).toBeGreaterThanOrEqual(before);
    expect((await refreshWith(refreshOf(one))).status).toBe(401);
    expect((await refreshWith(refreshOf(two, 'seller'), 'seller')).status).toBe(401);
  });
});

describe('signing keys', () => {
  it('keep the private key sealed, and make a new key after 30 days while the JWKS keeps the old', async () => {
    const keys = harness.server.runtime.mongo.db.collection<SigningKeyRecord>(SIGNING_KEYS);
    const [current] = await keys.find().sort({ createdAt: -1 }).toArray();
    expect(current?.privateKey).toMatch(/^v1\.k1\./);
    expect(JSON.stringify(current)).not.toContain('PRIVATE KEY');
    // a process that reads the key as 30 days old makes the next one
    const later = await harness.start();
    try {
      await keys.updateOne(
        { _id: String(current?._id) },
        { $set: { createdAt: new Date(Date.now() - ROTATE_AFTER_MS - 60_000) } },
      );
      const address = email('rotate-key');
      await makeAccount(address);
      const answer = await (async () => {
        const response = await fetch(`${later.url}/auth/login`, {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'X-BQ-App': 'customer' },
          body: JSON.stringify({ email: address, password: PASSWORD }),
        });
        return response.headers.getSetCookie().join(';');
      })();
      const token = /__Host-bq_customer_at=([^;]+)/.exec(answer)?.[1] ?? '';
      const header = JSON.parse(Buffer.from(token.split('.')[0] ?? '', 'base64url').toString()) as {
        kid: string;
      };
      expect(header.kid).not.toBe(current?._id);
      const listed = await (await fetch(`${later.url}${JWKS_PATH}`)).json();
      expect((listed as { keys: { kid: string }[] }).keys.map((k) => k.kid)).toEqual([
        header.kid,
        current?._id,
      ]);
    } finally {
      await later.stop();
    }
  });
});

describe('device names', () => {
  it('name the browser and the system from the User-Agent', () => {
    expect(deviceName(CHROME)).toBe('Chrome on Windows');
    expect(
      deviceName(
        'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
      ),
    ).toBe('Safari on iOS');
    expect(
      deviceName(
        'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36 EdgA/130.0',
      ),
    ).toBe('Edge on Android');
    expect(
      deviceName(
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.6; rv:131.0) Gecko/20100101 Firefox/131.0',
      ),
    ).toBe('Firefox on macOS');
    expect(deviceName('')).toBe('Unknown device');
    expect(deviceName('curl/8.5')).toBe('Unknown device');
  });
});
