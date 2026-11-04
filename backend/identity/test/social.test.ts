// Social sign-in in the customer app (TASKS T3.1 PR 4, ARCHITECTURE §7.1): Google, LinkedIn and
// GitHub through a stand-in for them (scripts/e2e/fake-oauth.ts), never the real ones. Each test
// takes the whole round trip as a browser does: start, the provider's page, the callback with the
// trip's cookie. Against the local MongoDB replica set and Valkey (`npm run infra:up`).
import { totpCode } from '@beautinique/backend-server-crypto';
import { OUTBOX } from '@beautinique/backend-server-queue';
import type { AppId } from '@beautinique/shared-contracts';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  type FakeOAuth,
  type FakeProvider,
  startFakeOAuth,
} from '../../../scripts/e2e/fake-oauth.ts';
import type { RunningIdentity } from '../src/service.ts';
import { type Session, SESSIONS } from '../src/sessions.ts';
import {
  acceptances,
  type Answer,
  credentials,
  grants,
  type Harness,
  makeAccount,
  PASSWORD,
  post,
  providers,
  startHarness,
  users,
} from './helpers.ts';

let harness: Harness;
let fake: FakeOAuth;
/** identity with the three providers set, at the stand-in */
let social: RunningIdentity;
const ORIGIN = 'http://localhost:3001';
const email = (name: string) => `${name}-${harness.runId}@beautinique.example`;
const db = () => harness.server.runtime.mongo.db;
let subjects = 1000;
const nextSubject = () => String((subjects += 1));

beforeAll(async () => {
  harness = await startHarness('social');
  fake = await startFakeOAuth();
  social = await harness.start({
    IDENTITY__OAUTH_REDIRECT_ORIGIN: ORIGIN,
    IDENTITY__OAUTH_PROVIDERS_URL: fake.url,
    IDENTITY__GOOGLE_CLIENT_ID: 'google-client',
    IDENTITY__GOOGLE_CLIENT_SECRET: 'google-secret-for-tests',
    IDENTITY__LINKEDIN_CLIENT_ID: 'linkedin-client',
    IDENTITY__LINKEDIN_CLIENT_SECRET: 'linkedin-secret-for-tests',
    IDENTITY__GITHUB_CLIENT_ID: 'github-client',
    IDENTITY__GITHUB_CLIENT_SECRET: 'github-secret-for-tests',
  });
});

afterAll(async () => {
  await social.stop();
  await fake.stop();
  await harness.stop();
});

interface Page {
  status: number;
  location: string;
  cookies: Map<string, string>;
}

/** A page the browser opens through the gateway (no app header needed there; the gateway adds it). */
async function open(
  path: string,
  {
    cookie,
    app = 'customer',
    to = social,
  }: { cookie?: string; app?: AppId; to?: RunningIdentity } = {},
): Promise<Page> {
  const response = await fetch(`${to.url}${path}`, {
    headers: {
      'X-BQ-App': app,
      'X-BQ-Client-Ip': '203.0.113.20',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/141.0 Safari/537.36',
      ...(cookie === undefined ? {} : { cookie }),
    },
    redirect: 'manual',
  });
  const cookies = new Map<string, string>();
  for (const line of response.headers.getSetCookie()) {
    const [pair = ''] = line.split(';');
    const at = pair.indexOf('=');
    cookies.set(pair.slice(0, at), pair.slice(at + 1));
  }
  return { status: response.status, location: response.headers.get('location') ?? '', cookies };
}

/** A JSON call with cookies (the consent page's calls). */
async function call(
  method: 'GET' | 'POST' | 'DELETE',
  path: string,
  {
    cookie,
    body,
    passport,
  }: { cookie?: string; body?: unknown; passport?: { userId: string; sessionId: string } } = {},
): Promise<Answer & { cookies: Map<string, string> }> {
  const headers: Record<string, string> = {
    'X-BQ-App': 'customer',
    'X-BQ-Client-Ip': '203.0.113.20',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/141.0 Safari/537.36',
  };
  if (cookie !== undefined) headers.cookie = cookie;
  if (body !== undefined) headers['content-type'] = 'application/json';
  if (passport) {
    headers['X-BQ-Passport'] = harness.passport.sign(
      { ...passport, app: 'customer', methods: ['google'], authzVersion: 0 },
      'bq:identity',
    );
  }
  const response = await fetch(`${social.url}${path}`, {
    method,
    headers,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const cookies = new Map<string, string>();
  for (const line of response.headers.getSetCookie()) {
    const [pair = ''] = line.split(';');
    const at = pair.indexOf('=');
    cookies.set(pair.slice(0, at), pair.slice(at + 1));
  }
  return { status: response.status, body: (await response.json()) as Answer['body'], cookies };
}

const STATE = '__Secure-bq_customer_oauth';
const SIGN_UP = '__Secure-bq_customer_oauth_signup';
const ACCESS = '__Host-bq_customer_at';

/**
 * The browser's whole trip: start (with `next`), the provider's page for `person`, then back to
 * identity's callback with the trip's cookie. The callback page is what it answers.
 */
async function roundTrip(
  provider: FakeProvider,
  person: Parameters<FakeOAuth['next']>[1],
  { next, cookie }: { next?: string; cookie?: (own: string) => string } = {},
): Promise<Page & { authorize: URL }> {
  fake.next(provider, person);
  const query = next === undefined ? '' : `?next=${encodeURIComponent(next)}`;
  const start = await open(`/auth/oauth/${provider}/start${query}`);
  expect(start.status).toBe(303);
  const state = start.cookies.get(STATE) ?? '';
  expect(state).not.toBe('');
  const authorize = new URL(start.location);
  const atProvider = await fetch(authorize, { redirect: 'manual' });
  const back = new URL(atProvider.headers.get('location') ?? '');
  // the provider sends the browser to the app's origin; the gateway forwards it to identity
  expect(back.origin + back.pathname).toBe(`${ORIGIN}/api/v1/auth/oauth/${provider}/callback`);
  const callback = await open(`/auth/oauth/${provider}/callback${back.search}`, {
    cookie: `${STATE}=${cookie ? cookie(state) : state}`,
  });
  return { ...callback, authorize };
}

/** A new account's consent after its trip. */
async function consentTo(page: Page, consent: unknown = { terms: true, adult: true }) {
  expect(page.location).toMatch(/^\/sign-up\/finish(?:\?next=[^&#]+)?$/);
  const ticket = page.cookies.get(SIGN_UP) ?? '';
  return call('POST', '/auth/oauth/sign-up', { cookie: `${SIGN_UP}=${ticket}`, body: { consent } });
}

const linkEvents = async (userId: string) =>
  (
    await db()
      .collection<{ type: string; envelope: { data: Record<string, unknown> } }>(OUTBOX)
      .find({ type: 'identity.signInMethod.changed', 'envelope.data.userId': userId })
      .sort({ _id: 1 })
      .toArray()
  ).map((event) => event.envelope.data);

/** The account's active roles in the customer app. */
const customerRoles = async (userId: string) =>
  (await grants().find({ userId, app: 'customer', active: true }).toArray()).map((g) => g.role);

const sessionOf = async (accessToken: string) => {
  const { sid } = JSON.parse(
    Buffer.from(accessToken.split('.')[1] ?? '', 'base64url').toString(),
  ) as { sid: string };
  return db().collection<Session>(SESSIONS).findOne({ _id: sid });
};

describe('which providers', () => {
  it('lists the providers set and their one origin; none and no origin when none is set', async () => {
    expect((await call('GET', '/auth/oauth/providers')).body.data).toEqual({
      providers: ['google', 'linkedin', 'github'],
      origin: ORIGIN,
    });
    const off = await fetch(`${harness.server.url}/auth/oauth/providers`, {
      headers: { 'X-BQ-App': 'customer' },
    });
    expect(((await off.json()) as Answer['body']).data).toEqual({ providers: [], origin: null });
    // a provider not set goes back to sign-in, without a trip
    const page = await open('/auth/oauth/google/start', { to: harness.server });
    expect([page.status, page.location]).toEqual([303, '/sign-in?oauth=failed']);
    // the customer app's only
    const seller = await open('/auth/oauth/google/start', { app: 'seller' });
    expect(seller.status).toBe(403);
  });
});

describe('a new account', () => {
  it('asks the consent, then makes the account with the Customer role and the provider linked', async () => {
    const address = email('new-google');
    const subject = nextSubject();
    const page = await roundTrip('google', { subject, email: address }, { next: '/account' });
    expect(page.status).toBe(303);
    // `next` in the consent page's address, like every auth page's
    expect(page.location).toBe('/sign-up/finish?next=%2Faccount');
    // the trip's cookie goes; the sign-up waits with its own
    expect(page.cookies.get(STATE)).toBe('');
    const ticket = page.cookies.get(SIGN_UP) ?? '';
    expect(ticket.length).toBeGreaterThan(30);
    expect(page.cookies.has(ACCESS)).toBe(false);
    expect(await users().findOne({ email: address })).toBeNull();

    const waiting = await call('GET', '/auth/oauth/sign-up', { cookie: `${SIGN_UP}=${ticket}` });
    expect(waiting.body.data).toMatchObject({
      provider: 'google',
      email: address,
      next: '/account',
    });
    // 18 or older and the terms, as a customer sign-up always asks
    const noAge = await consentTo(page, { terms: true });
    expect([noAge.status, noAge.body.error?.code]).toEqual([400, 'VALIDATION_FAILED']);
    const done = await consentTo(page);
    expect(done.status, JSON.stringify(done.body)).toBe(200);
    expect(done.body.data).toMatchObject({ next: 'signed-in', nextPath: '/account' });
    expect(done.cookies.get(SIGN_UP)).toBe('');
    const access = done.cookies.get(ACCESS) ?? '';
    expect(access).not.toBe('');
    expect((await sessionOf(access))?.methods).toEqual(['google']);

    const user = await users().findOne({ email: address });
    expect(user?.ageDeclaredAt).toBeInstanceOf(Date);
    expect(user?.signUpApp).toBe('customer');
    expect(await providers().find({ userId: user?._id }).toArray()).toMatchObject([
      { provider: 'google', subject },
    ]);
    // no password: Google alone until one is set
    expect((await credentials().findOne({ _id: user?._id }))?.password).toBeUndefined();
    expect(await acceptances().countDocuments({ userId: user?._id, adult: true })).toBe(1);
    expect(await customerRoles(user?._id ?? '')).toEqual(['customer.customer']);
    // a new account's first way in: no security email
    expect(await linkEvents(user?._id ?? '')).toEqual([]);
    // the waiting sign-up worked once
    expect((await consentTo(page)).body.error?.code).toBe('OAUTH_SIGN_UP_EXPIRED');

    // the next time: straight in, to where it was going
    const again = await roundTrip(
      'google',
      { subject, email: address },
      { next: '/account/devices' },
    );
    expect([again.status, again.location]).toEqual([303, '/account/devices']);
    expect(again.cookies.get(ACCESS)).not.toBe('');
  });
});

describe('an account that is there', () => {
  it('links a verified email to the password account, with a security email, and signs in', async () => {
    const address = email('has-password');
    const userId = await makeAccount(address, PASSWORD, { everyApp: false });
    const subject = nextSubject();
    const page = await roundTrip('github', { subject, email: address });
    expect([page.status, page.location]).toEqual([303, '/']);
    expect(page.cookies.get(ACCESS)).not.toBe('');
    expect(
      (await providers().find({ userId }).toArray()).map((p) => [p.provider, p.subject]).toSorted(),
    ).toEqual([
      ['github', subject],
      ['password', null],
    ]);
    expect(await linkEvents(userId)).toMatchObject([
      { provider: 'github', change: 'linked', app: 'customer', device: 'Chrome on Windows' },
    ]);
  });

  it('never links an email the provider has not verified', async () => {
    const address = email('unverified');
    const userId = await makeAccount(address, PASSWORD, { everyApp: false });
    for (const provider of ['google', 'linkedin', 'github'] as const) {
      const page = await roundTrip(provider, {
        subject: nextSubject(),
        email: address,
        emailVerified: false,
      });
      expect(page.location, provider).toBe('/sign-in?oauth=email-unverified');
      expect(page.cookies.has(ACCESS)).toBe(false);
    }
    // nor without an email at all
    const none = await roundTrip('linkedin', { subject: nextSubject() });
    expect(none.location).toBe('/sign-in?oauth=email-unverified');
    expect(await providers().countDocuments({ userId })).toBe(1);
  });

  it('asks an account with an authenticator for its code, and the session says how it signed in', async () => {
    const address = email('with-totp');
    const userId = await makeAccount(address, PASSWORD, { everyApp: false });
    const login = await call('POST', '/auth/login', {
      body: { email: address, password: PASSWORD },
    });
    expect(login.body.data?.next).toBe('signed-in');
    const session = await sessionOf(login.cookies.get(ACCESS) ?? '');
    const passport = { userId, sessionId: String(session?._id) };
    const enroll = await call('POST', '/auth/authenticator/enroll', { passport });
    const { secret } = enroll.body.data as { secret: string };
    const at = Date.now();
    const confirmed = await call('POST', '/auth/authenticator/confirm', {
      passport,
      body: { code: totpCode(secret, at), password: PASSWORD },
    });
    expect(confirmed.status, JSON.stringify(confirmed.body)).toBe(200);

    const page = await roundTrip(
      'google',
      { subject: nextSubject(), email: address },
      { next: '/x' },
    );
    const step = /^\/sign-in\?next=%2Fx#totp=([0-9a-f-]{36})$/.exec(page.location);
    expect(step, page.location).not.toBeNull();
    expect(page.cookies.has(ACCESS)).toBe(false);
    const signedIn = await call('POST', `/auth/login/${step?.[1] ?? ''}/totp`, {
      body: { code: totpCode(secret, at + 30_000) },
    });
    expect(signedIn.status, JSON.stringify(signedIn.body)).toBe(200);
    expect((await sessionOf(signedIn.cookies.get(ACCESS) ?? ''))?.methods).toEqual([
      'google',
      'totp',
    ]);
  });

  it('brings an account without this app’s role to it through the consent, linked', async () => {
    const address = email('no-customer-role');
    const userId = await makeAccount(address, PASSWORD, { everyApp: false });
    // like a seller's account: no Customer role
    await grants().deleteMany({ userId, app: 'customer' });
    expect(await customerRoles(userId)).toEqual([]);
    const page = await roundTrip('linkedin', { subject: nextSubject(), email: address });
    expect(page.cookies.has(ACCESS)).toBe(false);
    const done = await consentTo(page);
    expect(done.body.data).toMatchObject({ next: 'signed-in', user: { userId } });
    expect(await customerRoles(userId)).toEqual(['customer.customer']);
    expect(await linkEvents(userId)).toMatchObject([{ provider: 'linkedin', change: 'linked' }]);
  });

  it('keeps a locked account out until the lock ends', async () => {
    const address = email('locked');
    await makeAccount(address, PASSWORD, { everyApp: false });
    for (let i = 0; i < 10; i += 1) {
      await post('/auth/login', { email: address, password: 'not the password at all' });
    }
    const page = await roundTrip('google', { subject: nextSubject(), email: address });
    expect(page.location).toBe('/sign-in?oauth=locked');
    expect(page.cookies.has(ACCESS)).toBe(false);
  });
});

describe('the trip', () => {
  it('works once, only in the browser that began it, and tells a cancel', async () => {
    const address = email('trip');
    await makeAccount(address, PASSWORD, { everyApp: false });
    // another browser's cookie (login CSRF), or none
    const stolen = await roundTrip(
      'google',
      { subject: nextSubject(), email: address },
      {
        cookie: () => 'someone-elses-state',
      },
    );
    expect(stolen.location).toBe('/sign-in?oauth=expired');
    expect(stolen.cookies.has(ACCESS)).toBe(false);
    // the provider's answer used twice
    fake.next('google', { subject: nextSubject(), email: address });
    const start = await open('/auth/oauth/google/start');
    const state = start.cookies.get(STATE) ?? '';
    const back = new URL(
      (await fetch(start.location, { redirect: 'manual' })).headers.get('location') ?? '',
    );
    const first = await open(`/auth/oauth/google/callback${back.search}`, {
      cookie: `${STATE}=${state}`,
    });
    expect(first.location).toBe('/');
    const second = await open(`/auth/oauth/google/callback${back.search}`, {
      cookie: `${STATE}=${state}`,
    });
    expect(second.location).toBe('/sign-in?oauth=expired');
    // the callback of another provider than the trip's
    fake.next('google', { subject: nextSubject(), email: address });
    const other = await open('/auth/oauth/google/start');
    const otherBack = new URL(
      (await fetch(other.location, { redirect: 'manual' })).headers.get('location') ?? '',
    );
    const wrong = await open(`/auth/oauth/github/callback${otherBack.search}`, {
      cookie: `${STATE}=${other.cookies.get(STATE) ?? ''}`,
    });
    expect(wrong.location).toBe('/sign-in?oauth=expired');
    // the person said no at the provider
    const cancelled = await roundTrip('github', 'cancel');
    expect(cancelled.location).toBe('/sign-in?oauth=cancelled');
    expect(cancelled.cookies.get(STATE)).toBe('');
  });

  it('sends PKCE to Google and GitHub, the client secret to all, and never `next` off the app', async () => {
    const address = email('pkce');
    await makeAccount(address, PASSWORD, { everyApp: false });
    fake.seen.token.length = 0;
    const google = await roundTrip(
      'google',
      { subject: nextSubject(), email: address },
      {
        next: '//evil.example/x',
      },
    );
    expect(google.location).toBe('/');
    expect(google.authorize.searchParams.get('code_challenge_method')).toBe('S256');
    expect(google.authorize.searchParams.get('scope')).toBe('openid email profile');
    expect(google.authorize.searchParams.get('redirect_uri')).toBe(
      `${ORIGIN}/api/v1/auth/oauth/google/callback`,
    );
    const linkedin = await roundTrip('linkedin', { subject: nextSubject(), email: address });
    expect(linkedin.authorize.searchParams.has('code_challenge')).toBe(false);
    const [googleToken, linkedinToken] = fake.seen.token;
    expect(googleToken?.get('client_secret')).toBe('google-secret-for-tests');
    expect(googleToken?.get('code_verifier')).toMatch(/^[\w-]{43}$/);
    expect(linkedinToken?.get('client_secret')).toBe('linkedin-secret-for-tests');
    expect(linkedinToken?.has('code_verifier')).toBe(false);
  });

  it('goes back to sign-in when the provider refuses the code (a wrong client secret)', async () => {
    fake.secrets.google = 'not-what-identity-sends';
    try {
      const page = await roundTrip('google', { subject: nextSubject(), email: email('refused') });
      expect(page.location).toBe('/sign-in?oauth=failed');
      expect(page.cookies.has(ACCESS)).toBe(false);
    } finally {
      delete fake.secrets.google;
    }
  });
});

describe('sign-in methods', () => {
  it('takes a provider off with a security email, and never the last way in', async () => {
    const address = email('remove');
    const userId = await makeAccount(address, PASSWORD, { everyApp: false });
    await roundTrip('google', { subject: nextSubject(), email: address });
    const passport = { userId, sessionId: '0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b' };
    const removed = await call('DELETE', '/auth/sign-in-methods/google', { passport });
    expect(removed.body.data).toEqual({ removed: true, providers: ['password'] });
    expect((await linkEvents(userId)).map((e) => e.change)).toEqual(['linked', 'removed']);
    expect((await call('DELETE', '/auth/sign-in-methods/google', { passport })).body.data).toEqual({
      removed: false,
      providers: ['password'],
    });

    // an account with Google alone keeps it
    const only = email('google-only');
    const page = await roundTrip('google', { subject: nextSubject(), email: only });
    await consentTo(page);
    const onlyId = (await users().findOne({ email: only }))?._id ?? '';
    const last = await call('DELETE', '/auth/sign-in-methods/google', {
      passport: { userId: onlyId, sessionId: '0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5c' },
    });
    expect([last.status, last.body.error?.code]).toEqual([409, 'LAST_SIGN_IN_METHOD']);
    expect(await providers().countDocuments({ userId: onlyId })).toBe(1);
  });
});
