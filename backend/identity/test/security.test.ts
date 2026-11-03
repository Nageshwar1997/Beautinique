// T3.3 part C: what the gateway reads for its permission check (identity's list per app), step-up
// with the authenticator, and a Security Officer's authenticator reset and session end. Against
// the local MongoDB replica set and Valkey (`npm run infra:up`).
import { totpCode } from '@beautinique/backend-server-crypto';
import { OUTBOX } from '@beautinique/backend-server-queue';
import {
  type AppId,
  appPermissionsKey,
  revokedUserKey,
  STEP_UP_SECONDS,
} from '@beautinique/shared-contracts';
import { uuidv7 } from '@beautinique/shared-utils';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { type Session, SESSIONS } from '../src/sessions.ts';
import {
  type Answer,
  credentials,
  giveRole,
  type Harness,
  makeAccount,
  PASSWORD,
  post,
  startHarness,
} from './helpers.ts';

let harness: Harness;
const email = (name: string) => `${name}-${harness.runId}@beautinique.example`;
const db = () => harness.server.runtime.mongo.db;
const redis = () => harness.server.runtime.redis.client;
const sessionsDb = () => db().collection<Session>(SESSIONS);

beforeAll(async () => {
  harness = await startHarness('security');
});

afterAll(async () => {
  await harness.stop();
});

interface Raw {
  status: number;
  body: Answer['body'];
  cookies: Map<string, string>;
}

/** A request with cookies or a passport, and the Set-Cookie back. */
async function call(
  path: string,
  {
    app = 'customer',
    body = {},
    cookie,
    passport,
  }: {
    app?: AppId;
    body?: unknown;
    cookie?: string;
    passport?: { userId: string; sessionId: string };
  } = {},
): Promise<Raw> {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    'X-BQ-App': app,
    'X-BQ-Client-Ip': '203.0.113.9',
  };
  if (cookie) headers.cookie = cookie;
  if (passport) {
    headers['X-BQ-Passport'] = harness.passport.sign(
      { ...passport, app, methods: ['password', 'totp'], authzVersion: 0 },
      'bq:identity',
    );
  }
  const response = await fetch(`${harness.server.url}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const cookies = new Map<string, string>();
  for (const line of response.headers.getSetCookie()) {
    const [pair = ''] = line.split(';');
    const at = pair.indexOf('=');
    cookies.set(pair.slice(0, at), pair.slice(at + 1));
  }
  return { status: response.status, body: (await response.json()) as Answer['body'], cookies };
}

const claimsOf = (token = '') =>
  JSON.parse(Buffer.from(token.split('.')[1] ?? '', 'base64url').toString()) as {
    av?: number;
    su?: number;
    sid?: string;
  };
const accessOf = (raw: Raw, app: AppId) => raw.cookies.get(`__Host-bq_${app}_at`) ?? '';
const refreshOf = (raw: Raw, app: AppId) => raw.cookies.get(`__Secure-bq_${app}_rt`) ?? '';
const listOf = async (userId: string, app: AppId) =>
  JSON.parse((await redis().get(appPermissionsKey(userId, app))) ?? 'null') as {
    v: number;
    keys: string[];
  } | null;
const errorOf = (raw: Raw) => [raw.status, raw.body.error?.code];

/**
 * An account that sets up its authenticator at its first admin sign-in (holding a State Admin
 * grant): its secret, the time step its last code used, and the signed-in admin session.
 */
async function adminWithAuthenticator(name: string) {
  const address = email(name);
  const userId = await makeAccount(address, PASSWORD, { everyApp: false });
  await giveRole(userId, 'admin.state_admin');
  const started = await post(
    '/auth/login',
    { email: address, password: PASSWORD },
    { app: 'admin' },
  );
  const loginId = (started.body.data as { loginId: string }).loginId;
  const enroll = await post(`/auth/login/${loginId}/totp/enroll`, {}, { app: 'admin' });
  const { secret } = enroll.body.data as { secret: string };
  const at = Date.now();
  const confirmed = await call(`/auth/login/${loginId}/totp/confirm`, {
    app: 'admin',
    body: { code: totpCode(secret, at) },
  });
  expect(confirmed.status, JSON.stringify(confirmed.body)).toBe(200);
  return { address, userId, secret, at, signedIn: confirmed };
}

describe('the gateway’s list of what an account may do in an app', () => {
  it('is written at every sign-in and refresh, for the token’s authz version', async () => {
    const address = email('lists');
    const userId = await makeAccount(address, PASSWORD, { everyApp: false });
    const signedIn = await call('/auth/login', {
      body: { email: address, password: PASSWORD },
    });
    expect(signedIn.status).toBe(200);
    const first = await listOf(userId, 'customer');
    expect(first).toEqual({
      v: claimsOf(accessOf(signedIn, 'customer')).av,
      keys: ['iam.app.sign_in'],
    });

    // a new role: the next refresh writes its keys, with the new version
    await giveRole(userId, 'customer.pro_buyer');
    const refreshed = await call('/auth/refresh', {
      cookie: `__Secure-bq_customer_rt=${refreshOf(signedIn, 'customer')}`,
    });
    expect(refreshed.status).toBe(200);
    const next = await listOf(userId, 'customer');
    expect(next?.v).toBe(claimsOf(accessOf(refreshed, 'customer')).av);
    expect(next?.v).toBeGreaterThan(first?.v ?? 0);
    expect(next?.keys).toEqual(['iam.app.sign_in']);
    // nothing for an app it never signed in to
    expect(await listOf(userId, 'admin')).toBeNull();
  });

  it('holds the keys of the roles there, and a sign-in with the authenticator is a step-up', async () => {
    const { userId, signedIn } = await adminWithAuthenticator('lister');
    expect((await listOf(userId, 'admin'))?.keys).toEqual([
      'iam.app.sign_in',
      'iam.grant.manage',
      'iam.grant.read',
    ]);
    const claims = claimsOf(accessOf(signedIn, 'admin'));
    expect(claims.su).toBeGreaterThan(Math.floor(Date.now() / 1000) - 10);
    // a password-only sign-in is not
    const address = email('plain');
    await makeAccount(address, PASSWORD, { everyApp: false });
    const plain = await call('/auth/login', { body: { email: address, password: PASSWORD } });
    expect(claimsOf(accessOf(plain, 'customer')).su).toBeUndefined();
  });
});

describe('step-up', () => {
  it('confirms with a new authenticator code: a fresh access cookie carries it, and the session keeps it', async () => {
    const { userId, secret, at, signedIn } = await adminWithAuthenticator('stepper');
    const sessionId = String(claimsOf(accessOf(signedIn, 'admin')).sid);
    const passport = { userId, sessionId };
    const next = totpCode(secret, at + 30_000);

    const wrong = await call('/auth/step-up', { app: 'admin', passport, body: { code: '000000' } });
    expect(errorOf(wrong)).toEqual([400, 'TOTP_INVALID']);

    const before = Date.now();
    const stepped = await call('/auth/step-up', { app: 'admin', passport, body: { code: next } });
    expect(stepped.status, JSON.stringify(stepped.body)).toBe(200);
    const until = Date.parse(String(stepped.body.data?.stepUpUntil));
    expect(until).toBeGreaterThanOrEqual(before + STEP_UP_SECONDS * 1000 - 1000);
    const claims = claimsOf(accessOf(stepped, 'admin'));
    expect(claims.su).toBeGreaterThanOrEqual(Math.floor(before / 1000));
    // only the access cookie: the refresh token stays as it is
    expect(stepped.cookies.has('__Secure-bq_admin_rt')).toBe(false);
    const session = await sessionsDb().findOne({ _id: sessionId });
    expect(Math.floor((session?.stepUpAt?.getTime() ?? 0) / 1000)).toBe(claims.su);

    // the same code never works twice, nor an older one still in the time window
    const again = await call('/auth/step-up', { app: 'admin', passport, body: { code: next } });
    expect(errorOf(again)).toEqual([400, 'TOTP_INVALID']);
    const older = await call('/auth/step-up', {
      app: 'admin',
      passport,
      body: { code: totpCode(secret, at) },
    });
    expect(errorOf(older)).toEqual([400, 'TOTP_INVALID']);

    // a refresh keeps the step-up time
    const refreshed = await call('/auth/refresh', {
      app: 'admin',
      cookie: `__Secure-bq_admin_rt=${refreshOf(signedIn, 'admin')}`,
    });
    expect(claimsOf(accessOf(refreshed, 'admin')).su).toBe(claims.su);
  });

  it('asks an account without an authenticator to set one up, and an ended session to sign in', async () => {
    const userId = await makeAccount(email('no-totp'), PASSWORD, { everyApp: false });
    const answer = await call('/auth/step-up', {
      passport: { userId, sessionId: uuidv7() },
      body: { code: '123456' },
    });
    expect(errorOf(answer)).toEqual([400, 'AUTHENTICATOR_REQUIRED']);

    const { userId: other, secret, at } = await adminWithAuthenticator('ended');
    const gone = await call('/auth/step-up', {
      app: 'admin',
      passport: { userId: other, sessionId: uuidv7() },
      body: { code: totpCode(secret, at + 30_000) },
    });
    expect(errorOf(gone)).toEqual([401, 'SESSION_EXPIRED']);
  });

  it('does not step up a session that signed out', async () => {
    const { userId, secret, at, signedIn } = await adminWithAuthenticator('signed-out');
    const sessionId = String(claimsOf(accessOf(signedIn, 'admin')).sid);
    const out = await call('/auth/logout', {
      app: 'admin',
      cookie: `__Secure-bq_admin_rt=${refreshOf(signedIn, 'admin')}`,
    });
    expect(out.status).toBe(200);
    const answer = await call('/auth/step-up', {
      app: 'admin',
      passport: { userId, sessionId },
      body: { code: totpCode(secret, at + 30_000) },
    });
    expect(errorOf(answer)).toEqual([401, 'SESSION_EXPIRED']);
  });

  it('counts wrong codes toward the account’s lock, and a locked account cannot step up', async () => {
    const { userId, secret, at, signedIn, address } = await adminWithAuthenticator('locked');
    const passport = { userId, sessionId: String(claimsOf(accessOf(signedIn, 'admin')).sid) };
    for (let i = 0; i < 10; i += 1) {
      await call('/auth/step-up', { app: 'admin', passport, body: { code: '000000' } });
    }
    const right = await call('/auth/step-up', {
      app: 'admin',
      passport,
      body: { code: totpCode(secret, at + 30_000) },
    });
    expect(errorOf(right)).toEqual([400, 'TOTP_INVALID']);
    expect(right.body.error?.message).toContain('Too many');
    // the same lock as a sign-in
    const login = await post(
      '/auth/login',
      { email: address, password: PASSWORD },
      { app: 'admin' },
    );
    expect(login.body.error?.code).toBe('INVALID_CREDENTIALS');
  });
});

describe('a Security Officer', () => {
  const officer = async (name: string) => {
    const userId = await makeAccount(email(name), PASSWORD, { everyApp: false });
    await giveRole(userId, 'master.security_officer');
    return { userId, sessionId: uuidv7() };
  };

  it('resets a lost authenticator: it goes with its recovery codes, every session ends, and the person is told', async () => {
    const so = await officer('officer');
    const { userId, address } = await adminWithAuthenticator('lost-phone');
    const reset = await call(`/iam/users/${userId}/authenticator/reset`, {
      app: 'master',
      passport: so,
    });
    expect(reset.status, JSON.stringify(reset.body)).toBe(200);
    // the sign-up session (customer) and the admin one
    expect(reset.body.data).toEqual({ reset: true, sessionsEnded: 2 });
    const left = await credentials().findOne({ _id: userId });
    expect(left?.totp).toBeUndefined();
    expect(left?.recoveryCodes).toBeUndefined();
    expect(left?.password).toBeDefined();
    expect(await redis().get(revokedUserKey(userId))).not.toBeNull();
    expect(
      await sessionsDb().findOne({ userId, revokeReason: 'authenticator-reset' }),
    ).not.toBeNull();
    const event = await db()
      .collection<{ type: string; envelope: { data: Record<string, unknown> } }>(OUTBOX)
      .findOne({ type: 'identity.authenticator.reset', 'envelope.data.userId': userId });
    expect(event?.envelope.data).toMatchObject({ email: address });
    // the next admin sign-in sets up a new one
    const again = await post(
      '/auth/login',
      { email: address, password: PASSWORD },
      { app: 'admin' },
    );
    expect((again.body.data as { next: string }).next).toBe('totp-enroll');
    // nothing left to reset
    const twice = await call(`/iam/users/${userId}/authenticator/reset`, {
      app: 'master',
      passport: so,
    });
    expect(twice.body.data).toEqual({ reset: false, sessionsEnded: 0 });
  });

  it('ends every session of someone', async () => {
    const so = await officer('officer2');
    const address = email('many-devices');
    const userId = await makeAccount(address, PASSWORD, { everyApp: false });
    await call('/auth/login', { body: { email: address, password: PASSWORD } });
    await call('/auth/login', { body: { email: address, password: PASSWORD } });
    const ended = await call(`/iam/users/${userId}/sessions/end`, { app: 'master', passport: so });
    // the sign-up session and the two sign-ins
    expect(ended.body.data).toEqual({ ended: 3 });
    expect(await sessionsDb().countDocuments({ userId, revokedAt: null })).toBe(0);
    expect(await sessionsDb().countDocuments({ userId, revokeReason: 'security-officer' })).toBe(3);
  });

  it('never acts on their own account, nor on one that is not there; nobody else may', async () => {
    const so = await officer('officer3');
    for (const path of ['authenticator/reset', 'sessions/end']) {
      expect(
        errorOf(await call(`/iam/users/${so.userId}/${path}`, { app: 'master', passport: so })),
      ).toEqual([403, 'FORBIDDEN']);
      expect(
        errorOf(await call(`/iam/users/${uuidv7()}/${path}`, { app: 'master', passport: so })),
      ).toEqual([404, 'NOT_FOUND']);
    }
    const plain = await makeAccount(email('not-officer'), PASSWORD, { everyApp: false });
    await giveRole(plain, 'master.internal_auditor');
    const target = await makeAccount(email('target'), PASSWORD, { everyApp: false });
    for (const path of ['authenticator/reset', 'sessions/end']) {
      expect(
        errorOf(
          await call(`/iam/users/${target}/${path}`, {
            app: 'master',
            passport: { userId: plain, sessionId: uuidv7() },
          }),
        ),
      ).toEqual([403, 'FORBIDDEN']);
    }
    // the officer role counts only in the master app
    expect(
      errorOf(await call(`/iam/users/${target}/sessions/end`, { app: 'admin', passport: so })),
    ).toEqual([403, 'FORBIDDEN']);
  });

  it('finds a person by email in the grants', async () => {
    const so = await officer('officer4');
    const address = email('findme');
    const userId = await makeAccount(address, PASSWORD, { everyApp: false });
    const list = (query: string) =>
      fetch(`${harness.server.url}/iam/grants${query}`, {
        headers: {
          'X-BQ-App': 'master',
          'X-BQ-Passport': harness.passport.sign(
            { ...so, app: 'master', methods: ['password', 'totp'], authzVersion: 0 },
            'bq:identity',
          ),
        },
      }).then(async (r) => (await r.json()) as { data: { items: { userId: string }[] } });
    const found = await list(`?email=${encodeURIComponent(address)}`);
    expect(found.data.items.map((g) => g.userId)).toEqual([userId]);
    expect((await list(`?email=${encodeURIComponent(email('nobody'))}`)).data.items).toEqual([]);
    expect(
      (await list(`?email=${encodeURIComponent(address)}&userId=${so.userId}`)).data.items,
    ).toEqual([]);
  });
});
