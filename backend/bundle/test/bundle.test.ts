import { randomBytes, randomUUID } from 'node:crypto';
import { type AddressInfo, createServer } from 'node:net';

import { ConfigError, createLogger } from '@beautinique/backend-server-kit';
import { connectMongo, withTransaction } from '@beautinique/backend-server-mongo';
import { connectRedis, writeEvent } from '@beautinique/backend-server-queue';
import { invitationCreated } from '@beautinique/shared-contracts';
import { uuidv7 } from '@beautinique/shared-utils';
import { afterAll, describe, expect, it } from 'vitest';

import { startBundle } from '../src/bundle.ts';
import { readBundleConfig } from '../src/config.ts';
import { names } from '../src/deployables.ts';

// core needs MongoDB and Redis: the laptop's and CI's local ones (`npm run infra:up`). The test uses
// its own database and Redis database 5, so it never touches the data of a running dev server.
const MONGO_URI = 'mongodb://localhost:27017/?replicaSet=rs0';
const REDIS_DB = 'redis://localhost:6379/5';
const dbName = `bq_test_bundle_${randomUUID().slice(0, 8)}`;
// every deployable has a database of its own, live and here
const identityDbName = `${dbName}_identity`;
const notifyDbName = `${dbName}_notify`;
// made per run, so no secret-looking literal sits in the repo (gitleaks)
const ORIGIN_SECRET = randomBytes(32).toString('base64url');
// identity seals sign-in codes with it, notify opens them: one value for both (ARCHITECTURE §7.1)
const OTP_EVENT_KEYS = `e1:${randomBytes(32).toString('base64')}`;

afterAll(async () => {
  const logger = createLogger({ name: 'bundle-test', level: 'silent' });
  const mongo = await connectMongo({ uri: MONGO_URI, dbName, appName: 'bundle-test', logger });
  await mongo.db.dropDatabase();
  await mongo.client.db(identityDbName).dropDatabase();
  await mongo.client.db(notifyDbName).dropDatabase();
  await mongo.close();
  const redis = await connectRedis({ url: REDIS_DB, name: 'bundle-test', logger });
  await redis.client.flushdb();
  await redis.close();
});

const quiet = () => ({
  ...Object.fromEntries(names.map((name) => [`${name.toUpperCase()}__LOG_LEVEL`, 'silent'])),
  CORE__MONGO_URI: MONGO_URI,
  CORE__MONGO_DB_NAME: dbName,
  CORE__REDIS_URL: REDIS_DB,
  IDENTITY__MONGO_URI: MONGO_URI,
  IDENTITY__MONGO_DB_NAME: identityDbName,
  IDENTITY__REDIS_URL: REDIS_DB,
  IDENTITY__FIELD_KEYS: `k1:${randomBytes(32).toString('base64')}`,
  IDENTITY__BLIND_INDEX_KEY: `b1:${randomBytes(32).toString('base64')}`,
  IDENTITY__OTP_EVENT_KEYS: OTP_EVENT_KEYS,
  // nothing listens there: the breached-password check is away, so it lets passwords through
  // (fail-open), and the tests never reach the internet
  IDENTITY__HIBP_URL: 'http://127.0.0.1:9',
  NOTIFY__MONGO_URI: MONGO_URI,
  NOTIFY__MONGO_DB_NAME: notifyDbName,
  NOTIFY__REDIS_URL: REDIS_DB,
  NOTIFY__EMAIL_TRANSPORT: 'mailpit',
  NOTIFY__EMAIL_FROM: 'no-reply@beautinique.example',
  NOTIFY__OTP_EVENT_KEYS: OTP_EVENT_KEYS,
  GATEWAY__REDIS_URL: REDIS_DB,
  GATEWAY__ORIGIN_SECRETS: ORIGIN_SECRET,
});

describe('bundle', () => {
  it('runs every deployable behind the gateway, then stops them all', async () => {
    const env: Record<string, string | undefined> = { ...quiet(), UNRELATED: 'kept' };
    const bundle = await startBundle({ port: 0, env });
    try {
      expect(bundle.names).toEqual(names);
      expect(env).toEqual({ UNRELATED: 'kept' });
      const ready = await fetch(`${bundle.url}/ready`);
      expect(ready.status).toBe(200);
      expect(await ready.json()).toEqual({
        status: 'ready',
        checks: {
          redis: 'ok',
          ...Object.fromEntries(names.filter((n) => n !== 'gateway').map((n) => [n, 'ok'])),
        },
      });
      const status = await fetch(`${bundle.url}/status`);
      expect(status.status).toBe(200);
      expect(await status.json()).toMatchObject({
        status: 'ok',
        deployables: {
          core: { status: 'ok' },
          identity: { status: 'ok' },
          notify: { status: 'ok' },
        },
      });
    } finally {
      await bundle.stop();
    }
    await expect(fetch(`${bundle.url}/health`)).rejects.toThrow();
  });

  it('takes the live demo ping from an app through the gateway to core (Milestone 2)', async () => {
    const bundle = await startBundle({ port: 0, env: quiet() });
    try {
      const headers = {
        'X-BQ-App': 'customer',
        'x-origin-secret': ORIGIN_SECRET,
        'content-type': 'application/json',
      };
      const recorded = await fetch(`${bundle.url}/api/v1/platform/pings`, {
        method: 'POST',
        headers: { ...headers, 'Idempotency-Key': randomUUID() },
        body: JSON.stringify({ note: 'hello from the bundle' }),
      });
      expect(recorded.status).toBe(201);
      expect(recorded.headers.get('cache-control')).toBe('private, no-store');
      expect(recorded.headers.get('ratelimit-policy')).toBe('"write";q=20;w=60');
      const { data } = (await recorded.json()) as { data: { pingId: string; note: string } };
      expect(data.note).toBe('hello from the bundle');
      // reading a ping needs a permission: refused until sign-in exists
      const read = await fetch(`${bundle.url}/api/v1/platform/pings/${data.pingId}`, {
        headers: { ...headers, 'X-BQ-App': 'admin' },
      });
      expect(read.status).toBe(401);
      // straight to the server, without the apps' secret
      const direct = await fetch(`${bundle.url}/api/v1/platform/pings`, {
        method: 'POST',
        headers: { 'X-BQ-App': 'customer', 'content-type': 'application/json' },
        body: '{"note":"x"}',
      });
      expect(direct.status).toBe(403);
    } finally {
      await bundle.stop();
    }
  });

  it('signs a customer up with an emailed code and a password, then in: app, gateway, identity, notify, Mailpit (M3)', async () => {
    const bundle = await startBundle({ port: 0, env: quiet() });
    const email = `bundle-${randomUUID().slice(0, 8)}@beautinique.example`;
    const search = `http://localhost:8025/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`;
    let mailIds: string[] = [];
    try {
      const headers = {
        'X-BQ-App': 'customer',
        'x-origin-secret': ORIGIN_SECRET,
        'content-type': 'application/json',
      };
      const asked = await fetch(`${bundle.url}/api/v1/auth/sign-up/code`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, consent: { terms: true, adult: true } }),
      });
      expect(asked.status).toBe(200);
      expect(asked.headers.get('cache-control')).toBe('private, no-store');
      expect(asked.headers.get('ratelimit-policy')).toBe('"otp";q=10;w=600');
      const { data } = (await asked.json()) as { data: { challengeId: string } };
      interface Found {
        messages: { ID: string; Subject: string; Snippet: string }[];
      }
      let found: Found = { messages: [] };
      const end = Date.now() + 10_000;
      while (found.messages.length === 0) {
        if (Date.now() > end) throw new Error('no email reached Mailpit');
        await new Promise((resolve) => setTimeout(resolve, 100));
        found = (await (await fetch(search)).json()) as Found;
      }
      mailIds = found.messages.map((m) => m.ID);
      expect(found.messages[0]?.Subject).toBe('Confirm your email for Beautinique');
      const code = /\b(\d{6})\b/.exec(found.messages[0]?.Snippet ?? '')?.[1] ?? '';
      const verified = await fetch(`${bundle.url}/api/v1/auth/otp/${data.challengeId}/verify`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ code, password: 'pink lipstick on a rainy day' }),
      });
      expect(verified.status).toBe(200);
      expect(await verified.json()).toMatchObject({
        data: { email, outcome: 'account-made', signedIn: true },
      });
      const signedIn = await fetch(`${bundle.url}/api/v1/auth/login`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, password: 'pink lipstick on a rainy day' }),
      });
      expect(signedIn.status).toBe(200);
      expect(signedIn.headers.get('ratelimit-policy')).toBe('"auth";q=30;w=300');
      expect(await signedIn.json()).toMatchObject({ data: { next: 'signed-in', user: { email } } });

      // the session (T3.2): cookies through the gateway, a refresh, a copied refresh token
      const refreshCookie = (answer: Response) =>
        /__Secure-bq_customer_rt=([^;]+)/.exec(answer.headers.getSetCookie().join(', '))?.[1] ?? '';
      const first = refreshCookie(signedIn);
      expect(
        signedIn.headers.getSetCookie().some((c) => c.startsWith('__Host-bq_customer_at=')),
      ).toBe(true);
      const refresh = (token: string) =>
        fetch(`${bundle.url}/api/v1/auth/refresh`, {
          method: 'POST',
          headers: { ...headers, cookie: `__Secure-bq_customer_rt=${token}` },
        });
      const refreshed = await refresh(first);
      expect(refreshed.status).toBe(200);
      expect(refreshed.headers.get('cache-control')).toBe('private, no-store');
      const second = refreshCookie(refreshed);
      expect(second).not.toBe(first);
      // the first token again, past the 10 s a parallel tab gets: someone had a copy
      const logger = createLogger({ name: 'bundle-test', level: 'silent' });
      const mongo = await connectMongo({
        uri: MONGO_URI,
        dbName: identityDbName,
        appName: 'bundle-test',
        logger,
      });
      try {
        await mongo.db
          .collection<{ _id: string; rotatedAt: Date }>('identity_sessions')
          .updateOne(
            { _id: first.split('.')[0] ?? '' },
            { $set: { rotatedAt: new Date(Date.now() - 11_000) } },
          );
      } finally {
        await mongo.close();
      }
      expect((await refresh(first)).status).toBe(401);
      expect((await refresh(second)).status).toBe(401);
      const alert = `http://localhost:8025/api/v1/search?query=${encodeURIComponent(`to:${email} subject:"signed you out"`)}`;
      let warned: Found = { messages: [] };
      const by = Date.now() + 10_000;
      while (warned.messages.length === 0) {
        if (Date.now() > by) throw new Error('no security email reached Mailpit');
        await new Promise((resolve) => setTimeout(resolve, 100));
        warned = (await (await fetch(alert)).json()) as Found;
      }
      mailIds.push(...warned.messages.map((m) => m.ID));
      expect(warned.messages[0]?.Subject).toBe('We signed you out of Beautinique');

      // a new sign-in, then logout: its token stops
      const again = await fetch(`${bundle.url}/api/v1/auth/login`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, password: 'pink lipstick on a rainy day' }),
      });
      const token = refreshCookie(again);
      // signed in through the gateway: its access cookie, a passport to identity (T3.2 PR B)
      const access =
        /__Host-bq_customer_at=([^;]+)/.exec(again.headers.getSetCookie().join(', '))?.[1] ?? '';
      const signedInGet = (path: string) =>
        fetch(`${bundle.url}/api/v1${path}`, {
          headers: { ...headers, cookie: `__Host-bq_customer_at=${access}` },
        });
      const me = await signedInGet('/iam/me');
      expect(me.status).toBe(200);
      expect(me.headers.get('cache-control')).toBe('private, no-store');
      expect(await me.json()).toMatchObject({
        data: { user: { email, providers: ['password'] }, session: { app: 'customer' } },
      });
      const devices = (await (await signedInGet('/auth/sessions')).json()) as {
        data: { sessions: { current: boolean }[] };
      };
      expect(devices.data.sessions.filter((s) => s.current)).toHaveLength(1);
      expect((await signedInGet('/iam/me')).status).toBe(200);
      const out = await fetch(`${bundle.url}/api/v1/auth/logout`, {
        method: 'POST',
        headers: { ...headers, cookie: `__Secure-bq_customer_rt=${token}` },
      });
      expect(await out.json()).toEqual({ data: { signedOut: true } });
      expect((await refresh(token)).status).toBe(401);
      // the same access cookie stops at once (Redis), not when its 10 minutes run out
      expect((await signedInGet('/iam/me')).status).toBe(401);
    } finally {
      await bundle.stop();
      await fetch('http://localhost:8025/api/v1/messages', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ IDs: mailIds }),
      });
    }
  });

  it('takes an invitation from identity’s outbox to the inbox, and its acceptance through the gateway (T3.3)', async () => {
    const bundle = await startBundle({ port: 0, env: quiet() });
    const email = `invited-${randomUUID().slice(0, 8)}@beautinique.example`;
    const logger = createLogger({ name: 'bundle-test', level: 'silent' });
    const identityDb = await connectMongo({
      uri: MONGO_URI,
      dbName: identityDbName,
      appName: 'bundle-test',
      logger,
    });
    const mailIds: string[] = [];
    interface Found {
      messages: { ID: string; Subject: string; Snippet: string }[];
    }
    /** The newest email to the invited address with this subject, once it reached Mailpit. */
    const mail = async (subject: string) => {
      const search = `http://localhost:8025/api/v1/search?query=${encodeURIComponent(`to:${email} subject:"${subject}"`)}`;
      const end = Date.now() + 10_000;
      for (;;) {
        const found = (await (await fetch(search)).json()) as Found;
        const first = found.messages[0];
        if (first) {
          mailIds.push(...found.messages.map((m) => m.ID));
          return first;
        }
        if (Date.now() > end) throw new Error(`no "${subject}" email reached Mailpit`);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    };
    try {
      // what POST /iam/invitations writes (its route opens at the gateway with T3.3 PR C): a
      // Master who invites, the invitation, and its event in the same transaction
      const inviter = uuidv7();
      const invitationId = uuidv7();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 7 * 86_400_000);
      await withTransaction(identityDb, async (session) => {
        await identityDb.db
          .collection<Record<string, unknown> & { _id: string }>('identity_grants')
          .insertOne(
            {
              _id: uuidv7(),
              userId: inviter,
              role: 'master.master',
              app: 'master',
              scope: { type: 'global', ids: [] },
              validFrom: null,
              validTo: null,
              grantedBy: null,
              approvedBy: null,
              via: 'bootstrap',
              active: true,
              createdAt: now,
              endedAt: null,
              endedBy: null,
            },
            { session },
          );
        await identityDb.db
          .collection<Record<string, unknown> & { _id: string }>('identity_invitations')
          .insertOne(
            {
              _id: invitationId,
              email,
              role: 'support.l1_agent',
              app: 'support',
              scope: { type: 'global', ids: [] },
              validFrom: null,
              validTo: null,
              invitedBy: inviter,
              invitedFrom: 'master',
              status: 'pending',
              expiresAt,
              createdAt: now,
              endedAt: null,
              endedBy: null,
            },
            { session },
          );
        await writeEvent(identityDb, session, invitationCreated, {
          aggregate: { type: 'invitation', id: invitationId },
          actor: { type: 'user', id: inviter },
          correlationId: `bundle-${invitationId}`,
          data: {
            invitationId,
            email,
            app: 'support',
            roleName: 'Customer Support Agent (L1)',
            expiresAt: expiresAt.toISOString(),
          },
        });
      });
      const invited = await mail('You are invited to Beautinique Support');
      expect(invited.Snippet).toContain('Customer Support Agent (L1)');

      const headers = {
        'X-BQ-App': 'support',
        'x-origin-secret': ORIGIN_SECRET,
        'content-type': 'application/json',
      };
      const asked = await fetch(`${bundle.url}/api/v1/auth/invitations/code`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email }),
      });
      expect(asked.status).toBe(200);
      const { data } = (await asked.json()) as { data: { challengeId: string } };
      const coded = await mail('Accept your Beautinique Support invitation');
      const code = /\b(\d{6})\b/.exec(coded.Snippet)?.[1] ?? '';
      const accepted = await fetch(`${bundle.url}/api/v1/auth/otp/${data.challengeId}/verify`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ code, password: 'a support desk password, long' }),
      });
      expect(accepted.status).toBe(200);
      expect(await accepted.json()).toMatchObject({
        data: { email, outcome: 'invite-accepted', signedIn: false },
      });
      const signIn = await fetch(`${bundle.url}/api/v1/auth/login`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, password: 'a support desk password, long' }),
      });
      expect(await signIn.json()).toMatchObject({ data: { next: 'totp-enroll' } });
    } finally {
      await identityDb.close();
      await bundle.stop();
      await fetch('http://localhost:8025/api/v1/messages', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ IDs: mailIds }),
      });
    }
  });

  it('answers the apps’ wake call through the gateway from core, never cached (T2.7)', async () => {
    const bundle = await startBundle({ port: 0, env: quiet() });
    try {
      const before = Date.now();
      const woken = await fetch(`${bundle.url}/api/v1/platform/wake`, {
        headers: { 'X-BQ-App': 'customer', 'x-origin-secret': ORIGIN_SECRET },
      });
      expect(woken.status).toBe(200);
      // a CDN copy would answer without waking the server
      expect(woken.headers.get('cache-control')).toBe('private, no-store');
      expect(woken.headers.get('ratelimit-policy')).toBe('"public";q=600;w=60');
      const { data } = (await woken.json()) as { data: { awakeAt: string } };
      expect(Date.parse(data.awakeAt)).toBeGreaterThanOrEqual(before - 1000);
      // like every /api route, not straight to the server without the apps' secret
      const direct = await fetch(`${bundle.url}/api/v1/platform/wake`, {
        headers: { 'X-BQ-App': 'customer' },
      });
      expect(direct.status).toBe(403);
    } finally {
      await bundle.stop();
    }
  });

  it('starts nothing when a config is wrong', async () => {
    await expect(
      startBundle({ port: 0, env: { ...quiet(), GATEWAY__PORT: 'abc' } }),
    ).rejects.toThrow(ConfigError);
  });

  it('stops what it started when the gateway cannot start', async () => {
    // listening servers in this process; a closed one leaves the list a moment later
    const listening = async () => {
      const count = () =>
        process.getActiveResourcesInfo().filter((resource) => resource === 'TCPServerWrap').length;
      let last = -1;
      let now = count();
      while (now !== last) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        last = now;
        now = count();
      }
      return now;
    };
    const blocker = createServer();
    await new Promise<void>((resolve) => blocker.listen(0, '0.0.0.0', resolve));
    try {
      const before = await listening();
      const { port } = blocker.address() as AddressInfo;
      await expect(startBundle({ port, env: quiet() })).rejects.toThrow('EADDRINUSE');
      expect(await listening()).toBe(before);
    } finally {
      blocker.close();
    }
  });

  it('takes the public port from PORT', () => {
    expect(readBundleConfig({}).port).toBe(8080);
    expect(readBundleConfig({ PORT: '10000' }).port).toBe(10_000);
    expect(() => readBundleConfig({ PORT: 'x' })).toThrow('PORT');
  });
});
