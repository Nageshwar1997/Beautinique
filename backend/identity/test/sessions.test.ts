// Sessions (T3.2): cookies, ES256 access tokens and the JWKS, refresh rotation with reuse
// detection, idle and maximum lifetimes, logout, and a new password ending every session. Against
// the local MongoDB replica set and Valkey (`npm run infra:up`). See helpers.ts.
import { type KeyObject, randomBytes } from 'node:crypto';

import { blindIndex, publicKeyFromJwk, verifyJwt } from '@beautinique/backend-server-crypto';
import { passportSigner } from '@beautinique/backend-server-kit';
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
  appIdOf,
  codeOf,
  type Harness,
  makeAccount,
  oid,
  PASSWORD,
  passwordCode,
  signUpCode,
  startHarness,
  users,
  verify,
} from './helpers.ts';

let harness: Harness;
const email = (name: string) => `${name}-${harness.runId}@beautinique.example`;
const redis = () => harness.server.runtime.redis.client;
const sessionsDb = () => harness.db.collection<Session>(SESSIONS);
const CHROME =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
const FIREFOX = 'Mozilla/5.0 (X11; Linux x86_64; rv:132.0) Gecko/20100101 Firefox/132.0';
const HOME_IP = '203.0.113.9';

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
  {
    app = 'customer',
    cookie,
    body = {},
    userAgent = CHROME,
    ip = HOME_IP,
  }: { app?: AppId; cookie?: string; body?: unknown; userAgent?: string; ip?: string } = {},
): Promise<Raw> {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    'X-BQ-App': app,
    'X-BQ-Client-Ip': ip,
    'user-agent': userAgent,
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
const refreshWith = (token: string, app: AppId = 'customer', userAgent = CHROME, ip = HOME_IP) =>
  call('/auth/refresh', { app, cookie: `__Secure-bq_${app}_rt=${token}`, userAgent, ip });
/** The MAC part of a blind index: what a token secret made from it looks like. */
const macOf = (index: string) => index.slice(index.lastIndexOf('.') + 1);
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
    const { authzVersion } = (await users().findOne({ _id: oid(userId) })) ?? {};
    expect(authzVersion).toBeGreaterThan(0);
    expect(claims).toMatchObject({ sub: userId, amr: ['password'], av: authzVersion });
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
    const session = await sessionsDb().findOne({ _id: oid(String(claims.sid)) });
    expect(session).toMatchObject({
      userId: oid(userId),
      email: address,
      appId: await appIdOf('customer'),
      device: 'Chrome on Windows',
      ip: '203.0.113.9',
      methods: ['password'],
      revokedAt: null,
    });
    expect(session?.familyHash).toEqual(expect.any(String));
    // the refresh token is never stored, only keyed hashes: neither its family nor its secret
    const [, family = '', secret = ''] = refreshOf(answer).split('.');
    expect(family).toMatch(/^[\w-]{22}$/);
    expect(secret).toMatch(/^[\w-]{43}$/);
    expect(JSON.stringify(session)).not.toContain(family);
    expect(JSON.stringify(session)).not.toContain(secret);
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
  it('rotates the refresh token; the old one a moment later from another device waits, later a copy', async () => {
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
    // the same old token at once, from another kind of device: it waits; nothing is cleared
    const race = await refreshWith(old, 'customer', FIREFOX);
    expect([race.status, race.body.error?.code]).toEqual([409, 'REFRESH_IN_PROGRESS']);
    expect(race.cookies).toEqual({});
    // the same old token later, from another kind of device: someone has a copy
    await sessionsDb().updateOne(
      { _id: oid(sessionId) },
      { $set: { rotatedAt: new Date(Date.now() - 11_000) } },
    );
    const copied = await refreshWith(old, 'customer', FIREFOX);
    expect([copied.status, copied.body.error?.code]).toEqual([401, 'SESSION_EXPIRED']);
    expect(copied.cookies['__Host-bq_customer_at']?.attributes).toContain(
      'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    );
    expect(await sessionsDb().findOne({ _id: oid(sessionId) })).toMatchObject({
      revokeReason: 'reuse',
    });
    expect(await redis().exists(revokedSessionKey(sessionId))).toBe(1);
    const [event] = await harness.db
      .collection<{ type: string; envelope: { data: Record<string, unknown> } }>(OUTBOX)
      .find({ type: 'identity.session.reuseDetected', 'envelope.data.sessionId': sessionId })
      .toArray();
    expect(event?.envelope.data).toMatchObject({
      email: address,
      app: 'customer',
      device: 'Chrome on Windows',
    });
    // and in the audit log, as a copy refused (T4.1 PR C); a customer's sign-in itself is not
    const audits = await harness.db
      .collection<{ envelope: { data: Record<string, unknown> } }>(OUTBOX)
      .find({ type: 'identity.audit.recorded', 'envelope.data.resource.id': sessionId })
      .toArray();
    expect(audits.map((one) => one.envelope.data)).toEqual([
      expect.objectContaining({
        action: 'identity.session.reuseDetected',
        result: 'denied',
        actor: expect.objectContaining({ userId: null, system: 'identity' }) as unknown,
      }),
    ]);
    // the newest token ends with the session
    expect((await refreshWith(refreshOf(next))).status).toBe(401);
  });

  it('gives the same device the same token again a moment later: a parallel tab or a late answer (LIVE-009)', async () => {
    const address = email('same-token');
    await makeAccount(address);
    const old = refreshOf(await signIn(address));
    const sessionId = old.split('.')[0] ?? '';
    // the first answer never came, or comes late; another tab asks with the same token at once
    const first = await refreshWith(old);
    const second = await refreshWith(old);
    expect([first.status, second.status]).toEqual([200, 200]);
    expect(refreshOf(second)).toBe(refreshOf(first));
    expect(second.body.data).toMatchObject({ user: { email: address } });
    expect(accessOf(second)).not.toBe('');
    const stored = await sessionsDb().findOne({ _id: oid(sessionId) });
    expect(stored).toMatchObject({
      revokedAt: null,
      refreshHash: blindIndex(harness.keys, 'refresh-token', refreshOf(first)),
      previousRefreshHash: blindIndex(harness.keys, 'refresh-token', old),
    });
    // the next token follows from the old one, but not as anything the database keeps, and not
    // from the old one and the key alone: a random salt is in it
    const [, , secret = ''] = refreshOf(first).split('.');
    expect(JSON.stringify(stored)).not.toContain(secret);
    expect(secret).not.toBe(macOf(blindIndex(harness.keys, 'refresh-next', old)));
    // two tabs together get one token too
    const together = await Promise.all([refreshWith(old), refreshWith(old)]);
    expect(together.map((answer) => [answer.status, refreshOf(answer)])).toEqual([
      [200, refreshOf(first)],
      [200, refreshOf(first)],
    ]);
    expect(
      await harness.db.collection(OUTBOX).countDocuments({
        type: 'identity.session.reuseDetected',
        'envelope.data.sessionId': sessionId,
      }),
    ).toBe(0);
    // once that token moved on, the old one is two behind: a copy, at once all the same
    expect((await refreshWith(refreshOf(first))).status).toBe(200);
    expect((await refreshWith(old)).status).toBe(401);
    expect(await sessionsDb().findOne({ _id: oid(sessionId) })).toMatchObject({
      revokeReason: 'reuse',
    });
  });

  it('gives no same token to another network, even from the same kind of device: it waits', async () => {
    const address = email('same-token-network');
    await makeAccount(address);
    const old = refreshOf(await signIn(address));
    const mine = await refreshWith(old);
    // a copy elsewhere, with the User-Agent My Devices shows, right after the session rotated
    const theirs = await refreshWith(old, 'customer', CHROME, '198.51.100.7');
    expect([theirs.status, theirs.body.error?.code]).toEqual([409, 'REFRESH_IN_PROGRESS']);
    expect(theirs.cookies).toEqual({});
    expect((await refreshWith(refreshOf(mine))).status).toBe(200);
  });

  it('counts the moment from the last time the same token went out, so a later ask gets it too', async () => {
    const address = email('same-token-window');
    await makeAccount(address);
    const old = refreshOf(await signIn(address));
    const sessionId = old.split('.')[0] ?? '';
    const lost = refreshOf(await refreshWith(old));
    // 9 s after the rotation, another tab gets the same token, and its answer is on its way
    await sessionsDb().updateOne(
      { _id: oid(sessionId) },
      { $set: { rotatedAt: new Date(Date.now() - 9_000) } },
    );
    const before = Date.now();
    expect(refreshOf(await refreshWith(old))).toBe(lost);
    // the moment moved with that answer: a third ask just after the first 10 s gets it as well,
    // instead of a new token that the late answer would undo
    const stamped = (await sessionsDb().findOne({ _id: oid(sessionId) }))?.rotatedAt;
    expect(stamped?.getTime()).toBeGreaterThanOrEqual(before - 1_000);
    expect(refreshOf(await refreshWith(old))).toBe(lost);
    expect((await refreshWith(lost)).status).toBe(200);
  });

  it('gives the same token again only when the session moved on to it, not after another token', async () => {
    const address = email('same-token-only');
    await makeAccount(address);
    const old = refreshOf(await signIn(address));
    const sessionId = old.split('.')[0] ?? '';
    await refreshWith(old);
    // the session moved on to some other token (an older version made random ones)
    const other = `${old.split('.').slice(0, 2).join('.')}.${randomBytes(32).toString('base64url')}`;
    await sessionsDb().updateOne(
      { _id: oid(sessionId) },
      { $set: { refreshHash: blindIndex(harness.keys, 'refresh-token', other) } },
    );
    const race = await refreshWith(old);
    expect([race.status, race.body.error?.code]).toEqual([409, 'REFRESH_IN_PROGRESS']);
    expect((await refreshWith(other)).status).toBe(200);
  });

  it('replaces the old token again when it comes back later from the same device: its answer was lost (LIVE-009)', async () => {
    const address = email('lost-answer');
    await makeAccount(address);
    const old = refreshOf(await signIn(address));
    const sessionId = old.split('.')[0] ?? '';
    // the browser never kept this answer (a phone froze or closed it)
    const lost = refreshOf(await refreshWith(old));
    await sessionsDb().updateOne(
      { _id: oid(sessionId) },
      { $set: { rotatedAt: new Date(Date.now() - 10 * 60_000) } },
    );
    const again = await refreshWith(old);
    expect(again.status).toBe(200);
    expect(again.body.data).toMatchObject({ user: { email: address } });
    expect(accessOf(again)).not.toBe('');
    const [, family] = old.split('.');
    expect(refreshOf(again).split('.').slice(0, 2)).toEqual([sessionId, family]);
    expect([old, lost]).not.toContain(refreshOf(again));
    expect(await sessionsDb().findOne({ _id: oid(sessionId) })).toMatchObject({
      revokedAt: null,
      refreshHash: blindIndex(harness.keys, 'refresh-token', refreshOf(again)),
      previousRefreshHash: blindIndex(harness.keys, 'refresh-token', old),
    });
    const alarms = () =>
      harness.db.collection(OUTBOX).countDocuments({
        type: 'identity.session.reuseDetected',
        'envelope.data.sessionId': sessionId,
      });
    expect(await alarms()).toBe(0);
    // the lost token is an older one of the family now: if it ever comes back, someone has a copy
    const back = await refreshWith(lost);
    expect([back.status, back.body.error?.code]).toEqual([401, 'SESSION_EXPIRED']);
    expect(await sessionsDb().findOne({ _id: oid(sessionId) })).toMatchObject({
      revokeReason: 'reuse',
    });
    expect(await alarms()).toBe(1);
    expect((await refreshWith(refreshOf(again))).status).toBe(401);
  });

  it('replaces a lost answer once when two tabs ask with the old token together', async () => {
    const address = email('lost-twice');
    await makeAccount(address);
    const old = refreshOf(await signIn(address));
    const sessionId = old.split('.')[0] ?? '';
    await refreshWith(old);
    await sessionsDb().updateOne(
      { _id: oid(sessionId) },
      { $set: { rotatedAt: new Date(Date.now() - 11_000) } },
    );
    const answers = await Promise.all([refreshWith(old), refreshWith(old)]);
    expect(answers.map((answer) => answer.status).sort((a, b) => a - b)).toEqual([200, 409]);
    const won = answers.find((answer) => answer.status === 200);
    const token = won ? refreshOf(won) : '';
    expect((await sessionsDb().findOne({ _id: oid(sessionId) }))?.refreshHash).toBe(
      blindIndex(harness.keys, 'refresh-token', token),
    );
    expect((await refreshWith(token)).status).toBe(200);
  });

  it('keeps the session’s family in every token it gives, with a new secret each time', async () => {
    const address = email('family');
    await makeAccount(address);
    const first = refreshOf(await signIn(address));
    const [sessionId, family] = first.split('.');
    const saltNow = async () =>
      (await sessionsDb().findOne({ _id: oid(sessionId ?? '') }))?.nextSalt;
    const next = refreshOf(await refreshWith(first));
    const saltOfNext = await saltNow();
    const after = refreshOf(await refreshWith(next));
    // the salt that made `next` is gone: with the key and the database, `first` leads nowhere now
    expect([saltOfNext, await saltNow()]).toEqual([expect.any(String), expect.any(String)]);
    expect(await saltNow()).not.toBe(saltOfNext);
    const secrets = [first, next, after].map((token) => {
      const [id, ofFamily, secret = ''] = token.split('.');
      expect([id, ofFamily]).toEqual([sessionId, family]);
      return secret;
    });
    expect(new Set(secrets).size).toBe(3);
  });

  it('ends the session when any older token of it comes back, not only the one just replaced', async () => {
    const address = email('older-copy');
    await makeAccount(address);
    const owner = refreshOf(await signIn(address));
    const sessionId = owner.split('.')[0] ?? '';
    // someone with a copy refreshes twice: the owner's token is now two behind
    const theirs = refreshOf(await refreshWith(owner));
    const newest = await refreshWith(theirs);
    expect(newest.status).toBe(200);
    // the owner's token back at once, inside the parallel-tab window: a copy all the same
    const back = await refreshWith(owner);
    expect([back.status, back.body.error?.code]).toEqual([401, 'SESSION_EXPIRED']);
    expect(await sessionsDb().findOne({ _id: oid(sessionId) })).toMatchObject({
      revokeReason: 'reuse',
    });
    expect(await redis().exists(revokedSessionKey(sessionId))).toBe(1);
    const events = await harness.db.collection(OUTBOX).countDocuments({
      type: 'identity.session.reuseDetected',
      'envelope.data.sessionId': sessionId,
    });
    expect(events).toBe(1);
    // the copy's newest token ends with the session
    expect((await refreshWith(refreshOf(newest))).status).toBe(401);
  });

  it('keeps a session from before token families: its next token has one, and a copy is caught', async () => {
    const address = email('before-families');
    await makeAccount(address);
    const sessionId = refreshOf(await signIn(address)).split('.')[0] ?? '';
    // the session as an older version wrote it: `<sessionId>.<secret>`, no family
    const before = `${sessionId}.${randomBytes(32).toString('base64url')}`;
    await sessionsDb().updateOne(
      { _id: oid(sessionId) },
      {
        $set: { refreshHash: blindIndex(harness.keys, 'refresh-token', before) },
        $unset: { familyHash: '' },
      },
    );
    const next = await refreshWith(before);
    expect(next.status).toBe(200);
    expect(refreshOf(next).split('.')).toHaveLength(3);
    expect((await sessionsDb().findOne({ _id: oid(sessionId) }))?.familyHash).toEqual(
      expect.any(String),
    );
    // the old token later, even from the same device: a copy, as before families (a new family
    // for it would make the lost token look made up)
    await sessionsDb().updateOne(
      { _id: oid(sessionId) },
      { $set: { rotatedAt: new Date(Date.now() - 11_000) } },
    );
    expect((await refreshWith(before)).status).toBe(401);
    expect(await sessionsDb().findOne({ _id: oid(sessionId) })).toMatchObject({
      revokeReason: 'reuse',
    });
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
    expect((await sessionsDb().findOne({ _id: oid(realId) }))?.revokedAt).toBeNull();
    // so is a made-up family with the session's real secret: only its own family is a copy
    const [, , realSecret = ''] = refreshOf(customer).split('.');
    const madeUpFamily = randomBytes(16).toString('base64url');
    expect((await refreshWith(`${realId}.${madeUpFamily}.${realSecret}`)).status).toBe(401);
    expect((await sessionsDb().findOne({ _id: oid(realId) }))?.revokedAt).toBeNull();
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
    await sessionsDb().updateOne({ _id: oid(sessionId) }, { $set: { createdAt } });
    const refreshed = await refreshWith(refreshOf(answer));
    const session = await sessionsDb().findOne({ _id: oid(sessionId) });
    expect(session?.expiresAt.getTime()).toBe(createdAt.getTime() + 90 * day);
    expect(session?.purgeAt.getTime()).toBe(createdAt.getTime() + 120 * day);
    expect(refreshed.body.data?.expiresAt).toBe(session?.expiresAt.toISOString());
    // past its end, the session refreshes no more (a refresh must not bring it back)
    await sessionsDb().updateOne(
      { _id: oid(sessionId) },
      { $set: { expiresAt: new Date(Date.now() - 1000) } },
    );
    const ended = await refreshWith(refreshOf(refreshed));
    expect([ended.status, ended.body.error?.code]).toEqual([401, 'SESSION_EXPIRED']);
  });

  it('ends an internal session after 30 idle minutes, quietly, with no reuse alarm', async () => {
    const address = email('idle');
    const userId = await makeAccount(address);
    const issued = await harness.server.runtime.otp.sessions.issue({
      userId: oid(userId),
      email: address,
      app: 'admin',
      methods: ['password', 'totp'],
      client: { ip: '203.0.113.9', userAgent: CHROME },
    });
    expect(issued.expiresAt.getTime() - Date.now()).toBeLessThanOrEqual(12 * 60 * 60_000);
    const next = await refreshWith(issued.refreshToken, 'admin');
    expect(next.status).toBe(200);
    await sessionsDb().updateOne(
      { _id: oid(issued.sessionId) },
      { $set: { lastSeenAt: new Date(Date.now() - 31 * 60_000) } },
    );
    expect((await refreshWith(refreshOf(next, 'admin'), 'admin')).body.error?.code).toBe(
      'SESSION_EXPIRED',
    );
    // the token before it, after its session ran out: no alarm, no email
    await sessionsDb().updateOne(
      { _id: oid(issued.sessionId) },
      { $set: { rotatedAt: new Date(Date.now() - 60_000) } },
    );
    expect((await refreshWith(issued.refreshToken, 'admin')).status).toBe(401);
    expect((await sessionsDb().findOne({ _id: oid(issued.sessionId) }))?.revokedAt).toBeNull();
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
    expect((await sessionsDb().findOne({ _id: oid(sessionId) }))?.revokedAt).toBeNull();
    const out = await call('/auth/logout', { cookie: `__Secure-bq_customer_rt=${token}` });
    expect(out.body.data).toEqual({ signedOut: true });
    expect(out.cookies['__Host-bq_customer_at']?.attributes).toContain(
      'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    );
    expect(await sessionsDb().findOne({ _id: oid(sessionId) })).toMatchObject({
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
    expect(
      await sessionsDb().countDocuments({ userId: oid(userId), revokeReason: 'password-changed' }),
    ).toBe(3);
    expect(Number(await redis().get(revokedUserKey(userId)))).toBeGreaterThanOrEqual(before);
    expect((await refreshWith(refreshOf(one))).status).toBe(401);
    expect((await refreshWith(refreshOf(two, 'seller'), 'seller')).status).toBe(401);
  });

  it('writes the gateway’s ended sessions again from MongoDB after a Redis wipe, then its ready mark (QA-GW-002)', async () => {
    const readyKey = `${harness.prefix}:revocations-ready`;
    // identity's start writes it
    expect(await redis().get(readyKey)).toBe('1');
    const address = email('wipe');
    await makeAccount(address);
    const token = refreshOf(await signIn(address));
    const sessionId = token.split('.')[0] ?? '';
    await call('/auth/logout', { cookie: `__Secure-bq_customer_rt=${token}` });
    // one that ended 12 minutes ago: its access tokens are past, nothing to write back
    const old = refreshOf(await signIn(address));
    const oldId = old.split('.')[0] ?? '';
    await call('/auth/logout', { cookie: `__Secure-bq_customer_rt=${old}` });
    await sessionsDb().updateOne(
      { _id: oid(oldId) },
      { $set: { revokedAt: new Date(Date.now() - 12 * 60_000) } },
    );
    // and one that ended 5 minutes ago: its mark gets only what is left (about 6 of 11 minutes)
    const mid = refreshOf(await signIn(address));
    const midId = mid.split('.')[0] ?? '';
    await call('/auth/logout', { cookie: `__Secure-bq_customer_rt=${mid}` });
    await sessionsDb().updateOne(
      { _id: oid(midId) },
      { $set: { revokedAt: new Date(Date.now() - 5 * 60_000) } },
    );
    // the wipe: the marks, the ready mark and the epoch go
    await redis().del(
      revokedSessionKey(sessionId),
      revokedSessionKey(oldId),
      revokedSessionKey(midId),
      readyKey,
      `${harness.prefix}:epoch`,
    );
    expect(await harness.server.runtime.watchdog.check()).toBe(true);
    const left = await redis().pttl(revokedSessionKey(sessionId));
    expect(left).toBeGreaterThan(600_000);
    expect(left).toBeLessThanOrEqual(660_000);
    const midLeft = await redis().pttl(revokedSessionKey(midId));
    expect(midLeft).toBeGreaterThan(300_000);
    expect(midLeft).toBeLessThanOrEqual(360_000);
    expect(await redis().exists(revokedSessionKey(oldId))).toBe(0);
    expect(await redis().get(readyKey)).toBe('1');
  });

  it('issues a sign-in right after every session ended in a later second, so the gateway takes it', async () => {
    const address = email('same-second');
    const userId = await makeAccount(address);
    // every session ended at the very end of the next second (a new password, on a clock a moment
    // ahead): the gateway turns back tokens of that whole second, so a sign-in now (well under 2 s)
    // must wait for the one after it
    const ended = (Math.floor(Date.now() / 1000) + 1) * 1000 + 999;
    await redis().set(revokedUserKey(userId), String(ended), 'PX', 60_000);
    const answer = await signIn(address);
    expect(answer.status).toBe(200);
    const [, payload = ''] = accessOf(answer).split('.');
    const { iat } = JSON.parse(Buffer.from(payload, 'base64url').toString()) as { iat: number };
    expect(iat * 1000).toBeGreaterThan(ended);
    expect(iat).toBe(Math.floor(ended / 1000) + 1);
    // the refresh of that session too
    const refreshed = await refreshWith(refreshOf(answer));
    expect(refreshed.status).toBe(200);
    const [, again = ''] = accessOf(refreshed).split('.');
    const next = JSON.parse(Buffer.from(again, 'base64url').toString()) as { iat: number };
    expect(next.iat * 1000).toBeGreaterThan(ended);
  });
});

describe('signing keys', () => {
  it('keep the private key sealed, and make a new key after 30 days while the JWKS keeps the old', async () => {
    const keys = harness.db.collection<SigningKeyRecord>(SIGNING_KEYS);
    const [current] = await keys.find().sort({ createdAt: -1 }).toArray();
    expect(current?.privateKey).toMatch(/^v1\.k1\./);
    expect(JSON.stringify(current)).not.toContain('PRIVATE KEY');
    // a process that reads the key as 30 days old makes the next one
    const later = await harness.start();
    try {
      await keys.updateOne(
        { _id: current?._id },
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
      expect(header.kid).not.toBe(current?.kid);
      const listed = await (await fetch(`${later.url}${JWKS_PATH}`)).json();
      expect((listed as { keys: { kid: string }[] }).keys.map((k) => k.kid)).toEqual([
        header.kid,
        current?.kid,
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

describe('signed in (the gateway’s passport)', () => {
  /** A request as the gateway sends it for someone signed in. */
  async function asSignedIn(
    path: string,
    {
      userId,
      sessionId,
      app = 'customer',
      method = 'GET',
    }: {
      userId: string;
      sessionId: string;
      app?: AppId;
      method?: 'GET' | 'POST' | 'DELETE';
    },
    passport = harness.passport,
  ) {
    const response = await fetch(`${harness.server.url}${path}`, {
      method,
      headers: {
        'X-BQ-App': app,
        'X-BQ-Passport': passport.sign(
          { userId, sessionId, app, methods: ['password'], authzVersion: 0 },
          'bq:identity',
        ),
      },
    });
    return {
      status: response.status,
      body: (await response.json()) as Raw['body'],
      cookies: response.headers.getSetCookie(),
    };
  }
  const signedInAs = async (address: string, app: AppId = 'customer') => {
    const answer = await signIn(address, app);
    const sessionId = refreshOf(answer, app).split('.')[0] ?? '';
    const session = await sessionsDb().findOne({ _id: oid(sessionId) });
    return { sessionId, userId: String(session?.userId), answer };
  };

  it('tells the app who signed in, how the account signs in, and this session', async () => {
    const address = email('me');
    // its customer role alone, so its access in the app is that one
    await makeAccount(address, PASSWORD, { everyApp: false });
    const { userId, sessionId } = await signedInAs(address);
    const answer = await asSignedIn('/iam/me', { userId, sessionId });
    expect(answer.status).toBe(200);
    expect(answer.body.data).toMatchObject({
      user: {
        userId,
        email: address,
        signUpApp: 'customer',
        providers: ['password'],
        authenticator: false,
      },
      session: { sessionId, app: 'customer' },
      // what it may do in this app: its customer role, on its own account (TASKS T3.7)
      access: {
        roles: [
          { role: 'customer.customer', name: 'Customer', scope: { type: 'self', ids: [userId] } },
        ],
        permissions: ['iam.app.sign_in'],
      },
    });
    expect((answer.body.data?.user as { ageDeclaredAt: string }).ageDeclaredAt).toMatch(/^2\d{3}-/);
  });

  it('refuses no passport, another key’s and an ended session', async () => {
    const address = email('me-refused');
    await makeAccount(address);
    const { userId, sessionId, answer } = await signedInAs(address);
    const none = await fetch(`${harness.server.url}/iam/me`, {
      headers: { 'X-BQ-App': 'customer' },
    });
    expect(none.status).toBe(401);
    const forged = await asSignedIn('/iam/me', { userId, sessionId }, passportSigner());
    expect(forged.status).toBe(401);
    await call('/auth/logout', { cookie: `__Secure-bq_customer_rt=${refreshOf(answer)}` });
    const ended = await asSignedIn('/iam/me', { userId, sessionId });
    expect([ended.status, ended.body.error?.code]).toEqual([401, 'SESSION_EXPIRED']);
  });

  it('lists the account’s sessions in every app as My Devices, this one marked', async () => {
    const address = email('devices');
    await makeAccount(address);
    const customer = await signedInAs(address);
    const seller = await signedInAs(address, 'seller');
    const answer = await asSignedIn('/auth/sessions', customer);
    const sessions = (answer.body.data as { sessions: Record<string, unknown>[] }).sessions;
    // the sign-up's session and the two sign-ins
    expect(sessions).toHaveLength(3);
    expect(sessions.filter((s) => s.current).map((s) => s.sessionId)).toEqual([customer.sessionId]);
    expect(sessions.map((s) => s.app).toSorted()).toEqual(['customer', 'customer', 'seller']);
    expect(sessions.find((s) => s.sessionId === seller.sessionId)).toMatchObject({
      device: 'Chrome on Windows',
      ip: '203.0.113.9',
    });
  });

  it('signs one device out, or every other one; never another account’s', async () => {
    const address = email('sign-out');
    await makeAccount(address);
    const here = await signedInAs(address);
    const there = await signedInAs(address, 'seller');
    await makeAccount(email('stranger'));
    const stranger = await signedInAs(email('stranger'));
    // another account's session is not this person's to end
    const foreign = await asSignedIn(`/auth/sessions/${stranger.sessionId}`, {
      ...here,
      method: 'DELETE',
    });
    expect(foreign.body.data).toEqual({ ended: false });
    expect((await sessionsDb().findOne({ _id: oid(stranger.sessionId) }))?.revokedAt).toBeNull();
    // the seller device
    const ended = await asSignedIn(`/auth/sessions/${there.sessionId}`, {
      ...here,
      method: 'DELETE',
    });
    expect(ended.body.data).toEqual({ ended: true });
    expect(ended.cookies).toEqual([]);
    expect(await redis().exists(revokedSessionKey(there.sessionId))).toBe(1);
    expect(await sessionsDb().findOne({ _id: oid(there.sessionId) })).toMatchObject({
      revokeReason: 'signed-out-elsewhere',
    });
    // every other one: the sign-up session; this one stays
    const others = await asSignedIn('/auth/sessions/end-others', { ...here, method: 'POST' });
    expect(others.body.data).toEqual({ ended: 1 });
    expect((await sessionsDb().findOne({ _id: oid(here.sessionId) }))?.revokedAt).toBeNull();
    // this device itself: its cookies go too
    const self = await asSignedIn(`/auth/sessions/${here.sessionId}`, {
      ...here,
      method: 'DELETE',
    });
    expect(self.body.data).toEqual({ ended: true });
    expect(self.cookies.some((c) => c.startsWith('__Host-bq_customer_at=;'))).toBe(true);
  });
});
