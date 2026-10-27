// Sign-in with an email code, against the local MongoDB replica set and Valkey (`npm run infra:up`),
// in a database and BullMQ prefix of its own. The test plays notify: it opens the sealed code from
// identity's outbox, as notify does from the event.
import { randomUUID } from 'node:crypto';

import { decryptField, generateKey, loadSealingKeys } from '@beautinique/backend-server-crypto';
import { createLogger } from '@beautinique/backend-server-kit';
import { connectMongo } from '@beautinique/backend-server-mongo';
import { OUTBOX } from '@beautinique/backend-server-queue';
import { otpSealContext } from '@beautinique/shared-contracts';
import { Queue } from 'bullmq';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { readConfig } from '../src/config.ts';
import { challengeKey, OTP_MIN_ANSWER_MS } from '../src/otp.ts';
import { type RunningIdentity, start } from '../src/service.ts';
import { LEGAL_ACCEPTANCES, type LegalAcceptance, type User, USERS } from '../src/users.ts';

const MONGO_URI = 'mongodb://localhost:27017/?replicaSet=rs0';
const REDIS_URL = 'redis://localhost:6379';
const runId = randomUUID().slice(0, 8);
const dbName = `bq_test_identity_otp_${runId}`;
const prefix = `bqtestidotp${runId}`;
const logger = createLogger({ name: 'identity-otp-test', level: 'silent' });
const OTP_EVENT_KEYS = `e1:${generateKey()}`;
const otpKeys = loadSealingKeys(OTP_EVENT_KEYS);

const env = (more: Record<string, string> = {}): Record<string, string> => ({
  IDENTITY__LOG_LEVEL: 'silent',
  IDENTITY__MONGO_URI: MONGO_URI,
  IDENTITY__MONGO_DB_NAME: dbName,
  IDENTITY__REDIS_URL: REDIS_URL,
  IDENTITY__FIELD_KEYS: `k1:${generateKey()}`,
  IDENTITY__BLIND_INDEX_KEY: `b1:${generateKey()}`,
  IDENTITY__OTP_EVENT_KEYS: OTP_EVENT_KEYS,
  ...more,
});

let server: RunningIdentity;

const startIdentity = (more: Record<string, string> = {}) =>
  start(readConfig({ env: env(more) }), {
    port: 0,
    host: '127.0.0.1',
    handleSignals: false,
    runtime: { queuePrefix: prefix, epochKey: `${prefix}:epoch`, pollMs: 100 },
  });

beforeAll(async () => {
  server = await startIdentity();
});

afterAll(async () => {
  await server.stop();
  const mongo = await connectMongo({ uri: MONGO_URI, dbName, appName: 'cleanup', logger });
  await mongo.db.dropDatabase();
  await mongo.close();
  const queue = new Queue('q.notify', { connection: { url: REDIS_URL }, prefix });
  await queue.obliterate({ force: true });
  await queue.close();
});

interface Answer {
  status: number;
  body: {
    data?: Record<string, unknown>;
    error?: { code: string; message: string; details?: unknown };
  };
}

async function post(
  path: string,
  body: unknown = {},
  {
    app = 'customer',
    ip = '203.0.113.7',
    to = server,
  }: { app?: string | null; ip?: string; to?: RunningIdentity } = {},
): Promise<Answer> {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    'X-BQ-Client-Ip': ip,
  };
  if (app !== null) headers['X-BQ-App'] = app;
  const response = await fetch(`${to.url}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  return { status: response.status, body: (await response.json()) as Answer['body'] };
}

const consent = { terms: true, adult: true };
const email = (name: string) => `${name}-${runId}@beautinique.example`;

interface OtpEvent {
  _id: string;
  type: string;
  envelope: {
    data: { challengeId: string; email: string; app: string; purpose: string; sealedCode: string };
  };
}
const events = (challengeId: string) =>
  server.runtime.mongo.db
    .collection<OtpEvent>(OUTBOX)
    .find({ 'envelope.data.challengeId': challengeId })
    .sort({ _id: 1 })
    .toArray();
/** The code notify would email: the latest event of the challenge, opened with the shared key. */
async function codeOf(challengeId: string): Promise<string> {
  const event = (await events(challengeId)).at(-1);
  if (!event) throw new Error('no code was sent');
  return decryptField(otpKeys, event.envelope.data.sealedCode, otpSealContext(challengeId));
}
const requestFor = async (address: string, app = 'customer') => {
  const answer = await post('/auth/otp', { email: address, consent }, { app });
  expect(answer.status, JSON.stringify(answer.body)).toBe(200);
  return answer.body.data as {
    challengeId: string;
    expiresAt: string;
    resendAfter: string;
    resendsLeft: number;
  };
};
const users = () => server.runtime.mongo.db.collection<User>(USERS);
const acceptances = () => server.runtime.mongo.db.collection<LegalAcceptance>(LEGAL_ACCEPTANCES);
/** Moves a challenge's resend wait into the past (instead of waiting a minute). */
const allowResend = (challengeId: string) =>
  server.runtime.redis.client.hset(challengeKey(challengeId), 'resendAfter', '0');

describe('sign-up with an email code (customer app)', () => {
  it('sends a sealed code to notify, and the right code makes the account with the consent', async () => {
    const address = email('riya');
    const before = Date.now();
    const challenge = await requestFor(` ${address.toUpperCase()} `);
    expect(challenge.resendsLeft).toBe(3);
    const expires = Date.parse(challenge.expiresAt) - before;
    expect(expires).toBeGreaterThan(9.9 * 60_000);
    expect(expires).toBeLessThanOrEqual(10 * 60_000 + 1000);
    expect(Date.parse(challenge.resendAfter) - before).toBeLessThanOrEqual(61_000);

    const [event] = await events(challenge.challengeId);
    expect(event).toMatchObject({
      type: 'identity.otp.requested',
      envelope: { data: { email: address, app: 'customer', purpose: 'sign-up' } },
    });
    const code = await codeOf(challenge.challengeId);
    expect(code).toMatch(/^\d{6}$/);
    expect(event?.envelope.data.sealedCode).not.toContain(code);
    // the relay hands it to notify's queue under notify's subscriber
    const queue = new Queue('q.notify', { connection: server.runtime.redis.client, prefix });
    try {
      await expect
        .poll(async () => (await queue.getJob(`${String(event?._id)}@notify.otpEmail`))?.name, {
          timeout: 3000,
        })
        .toBe('notify.otpEmail');
    } finally {
      await queue.close();
    }
    // Redis holds the hash only, under the challenge id, for 10 minutes
    const stored = await server.runtime.redis.client.hgetall(challengeKey(challenge.challengeId));
    expect(JSON.stringify(stored)).not.toContain(code);
    expect(
      await server.runtime.redis.client.pttl(challengeKey(challenge.challengeId)),
    ).toBeGreaterThan(9 * 60_000);

    const verified = await post(`/auth/otp/${challenge.challengeId}/verify`, { code });
    expect(verified.status).toBe(200);
    expect(verified.body.data).toMatchObject({ email: address, isNewUser: true });
    const user = await users().findOne({ email: address });
    expect(user).toMatchObject({ status: 'active', signUpApp: 'customer' });
    expect(user?.ageDeclaredAt).toBeInstanceOf(Date);
    expect(user?._id).toBe(verified.body.data?.userId);
    expect(await acceptances().find({ userId: user?._id }).toArray()).toMatchObject([
      {
        documents: ['terms', 'privacy'],
        version: 'dummy-1',
        adult: true,
        app: 'customer',
        ip: '203.0.113.7',
      },
    ]);
    // a code works once
    const again = await post(`/auth/otp/${challenge.challengeId}/verify`, { code });
    expect([again.status, again.body.error?.code]).toEqual([400, 'OTP_EXPIRED']);
  });

  it('asks the terms and 18 or older before any code, for every email', async () => {
    const answer = await post('/auth/otp', { email: email('young'), consent: { terms: true } });
    expect([answer.status, answer.body.error?.code]).toEqual([400, 'VALIDATION_FAILED']);
    expect(answer.body.error?.details).toEqual([
      { path: ['consent', 'adult'], message: 'Confirm that you are 18 or older' },
    ]);
    const none = await post('/auth/otp', { email: email('young') });
    expect((none.body.error?.details as unknown[]).length).toBe(2);
    // the delivery app asks nothing
    const rider = await post('/auth/otp', { email: email('rider') }, { app: 'delivery' });
    expect(rider.status).toBe(200);
  });

  it('signs an existing account in, and records consent only when something is new', async () => {
    const address = email('meera');
    const first = await requestFor(address);
    await post(`/auth/otp/${first.challengeId}/verify`, { code: await codeOf(first.challengeId) });
    const second = await requestFor(address);
    expect((await events(second.challengeId))[0]?.envelope.data.purpose).toBe('sign-in');
    const signedIn = await post(`/auth/otp/${second.challengeId}/verify`, {
      code: await codeOf(second.challengeId),
    });
    expect(signedIn.body.data).toMatchObject({ email: address, isNewUser: false });
    const user = await users().findOne({ email: address });
    expect(await acceptances().countDocuments({ userId: user?._id })).toBe(1);

    // a new legal version is accepted again at the next sign-in
    const later = await startIdentity({ IDENTITY__LEGAL_VERSION: 'dummy-2' });
    try {
      const answer = await post('/auth/otp', { email: address, consent }, { to: later });
      const { challengeId } = answer.body.data as { challengeId: string };
      await post(
        `/auth/otp/${challengeId}/verify`,
        { code: await codeOf(challengeId) },
        { to: later },
      );
      const versions = await acceptances()
        .find({ userId: user?._id })
        .sort({ acceptedAt: 1 })
        .map((a) => a.version)
        .toArray();
      expect(versions).toEqual(['dummy-1', 'dummy-2']);
    } finally {
      await later.stop();
    }
  });

  it('records a first 18-or-older declaration of an account made elsewhere', async () => {
    const address = email('seller');
    // the seller app asks only the terms; an adult flag sent there is not a declaration
    const made = await requestFor(address, 'seller');
    await post(
      `/auth/otp/${made.challengeId}/verify`,
      { code: await codeOf(made.challengeId) },
      { app: 'seller' },
    );
    expect((await users().findOne({ email: address }))?.ageDeclaredAt).toBeNull();
    const customer = await requestFor(address);
    await post(`/auth/otp/${customer.challengeId}/verify`, {
      code: await codeOf(customer.challengeId),
    });
    const user = await users().findOne({ email: address });
    expect(user?.ageDeclaredAt).toBeInstanceOf(Date);
    expect(user?.signUpApp).toBe('seller');
    expect(await acceptances().countDocuments({ userId: user?._id, adult: true })).toBe(1);
  });
});

describe('codes that do not fit', () => {
  it('gives 5 tries, says how many are left, then the challenge is gone', async () => {
    const challenge = await requestFor(email('tries'));
    const code = await codeOf(challenge.challengeId);
    const wrong = code === '000000' ? '111111' : '000000';
    const messages: string[] = [];
    for (let i = 0; i < 4; i += 1) {
      const answer = await post(`/auth/otp/${challenge.challengeId}/verify`, { code: wrong });
      expect(answer.body.error?.code).toBe('OTP_INVALID');
      messages.push(answer.body.error?.message ?? '');
    }
    expect(messages).toEqual([
      'That code is not right. You have 4 more tries.',
      'That code is not right. You have 3 more tries.',
      'That code is not right. You have 2 more tries.',
      'That code is not right. You have 1 more try.',
    ]);
    const last = await post(`/auth/otp/${challenge.challengeId}/verify`, { code: wrong });
    expect(last.body.error?.code).toBe('OTP_EXPIRED');
    const right = await post(`/auth/otp/${challenge.challengeId}/verify`, { code });
    expect(right.body.error?.code).toBe('OTP_EXPIRED');
    expect(await server.runtime.redis.client.exists(challengeKey(challenge.challengeId))).toBe(0);
  });

  it('gives a new code its own 5 tries', async () => {
    const challenge = await requestFor(email('fresh'));
    const wrongFor = (code: string) => (code === '000000' ? '111111' : '000000');
    const first = await codeOf(challenge.challengeId);
    for (let i = 0; i < 4; i += 1) {
      await post(`/auth/otp/${challenge.challengeId}/verify`, { code: wrongFor(first) });
    }
    await allowResend(challenge.challengeId);
    await post(`/auth/otp/${challenge.challengeId}/resend`);
    const second = await codeOf(challenge.challengeId);
    const wrong = await post(`/auth/otp/${challenge.challengeId}/verify`, {
      code: wrongFor(second),
    });
    expect(wrong.body.error?.message).toBe('That code is not right. You have 4 more tries.');
    expect((await post(`/auth/otp/${challenge.challengeId}/verify`, { code: second })).status).toBe(
      200,
    );
  });

  it('answers an unknown email in an app without sign-up like any other, and sends nothing', async () => {
    const challenge = await requestFor(email('stranger'), 'delivery');
    expect(Object.keys(challenge).toSorted()).toEqual([
      'challengeId',
      'expiresAt',
      'resendAfter',
      'resendsLeft',
    ]);
    expect(await events(challenge.challengeId)).toEqual([]);
    for (const code of ['000000', '123456']) {
      const answer = await post(
        `/auth/otp/${challenge.challengeId}/verify`,
        { code },
        { app: 'delivery' },
      );
      expect(answer.body.error?.code).toBe('OTP_INVALID');
    }
    expect(await users().countDocuments({ email: email('stranger') })).toBe(0);
  });

  it('answers an unknown email in an app without sign-up in the same time as an account', async () => {
    // an account, made in the customer app
    const made = await requestFor(email('timed'));
    const madeCode = await codeOf(made.challengeId);
    expect((await post(`/auth/otp/${made.challengeId}/verify`, { code: madeCode })).status).toBe(
      200,
    );
    const timed = async (path: string, body: unknown = {}) => {
      const startedAt = performance.now();
      const answer = await post(path, body, { app: 'delivery' });
      expect(answer.status, JSON.stringify(answer.body)).toBe(200);
      return {
        ms: performance.now() - startedAt,
        data: answer.body.data as { challengeId: string },
      };
    };
    for (const [name, sends] of [
      ['timed', 1],
      ['stranger-timed', 0],
    ] as const) {
      const asked = await timed('/auth/otp', { email: email(name) });
      expect(asked.ms, name).toBeGreaterThanOrEqual(OTP_MIN_ANSWER_MS);
      await allowResend(asked.data.challengeId);
      const resent = await timed(`/auth/otp/${asked.data.challengeId}/resend`);
      expect(resent.ms, name).toBeGreaterThanOrEqual(OTP_MIN_ANSWER_MS);
      // the account got its codes, the unknown email none
      expect(await events(asked.data.challengeId), name).toHaveLength(sends * 2);
    }
  });

  it('takes a code only in the app that asked for it, and only from a known app', async () => {
    const challenge = await requestFor(email('apps'));
    const code = await codeOf(challenge.challengeId);
    const elsewhere = await post(
      `/auth/otp/${challenge.challengeId}/verify`,
      { code },
      { app: 'seller' },
    );
    expect(elsewhere.body.error?.code).toBe('OTP_EXPIRED');
    await allowResend(challenge.challengeId);
    const resentElsewhere = await post(
      `/auth/otp/${challenge.challengeId}/resend`,
      {},
      { app: 'seller' },
    );
    expect(resentElsewhere.body.error?.code).toBe('OTP_EXPIRED');
    const noApp = await post(`/auth/otp/${challenge.challengeId}/verify`, { code }, { app: null });
    expect([noApp.status, noApp.body.error?.code]).toEqual([403, 'APP_NOT_ALLOWED']);
    const admin = await post('/auth/otp', { email: email('apps') }, { app: 'admin' });
    expect(admin.body.error?.code).toBe('APP_NOT_ALLOWED');
    // the right app still works
    expect((await post(`/auth/otp/${challenge.challengeId}/verify`, { code })).status).toBe(200);
  });

  it('lets only one of two requests with the same right code through', async () => {
    const challenge = await requestFor(email('race'));
    const code = await codeOf(challenge.challengeId);
    const answers = await Promise.all([
      post(`/auth/otp/${challenge.challengeId}/verify`, { code }),
      post(`/auth/otp/${challenge.challengeId}/verify`, { code }),
    ]);
    expect(answers.map((a) => a.status).toSorted()).toEqual([200, 400]);
    expect(await users().countDocuments({ email: email('race') })).toBe(1);
  });
});

describe('new codes and limits', () => {
  it('sends a new code a minute later, at most 3 times; the old code stops working', async () => {
    const challenge = await requestFor(email('resend'));
    const first = await codeOf(challenge.challengeId);
    const soon = await post(`/auth/otp/${challenge.challengeId}/resend`);
    expect([soon.status, soon.body.error?.code]).toEqual([429, 'OTP_RESEND_TOO_SOON']);
    await allowResend(challenge.challengeId);
    const resent = await post(`/auth/otp/${challenge.challengeId}/resend`);
    expect(resent.status).toBe(200);
    expect(resent.body.data).toMatchObject({ challengeId: challenge.challengeId, resendsLeft: 2 });
    expect(await events(challenge.challengeId)).toHaveLength(2);
    const second = await codeOf(challenge.challengeId);
    if (second !== first) {
      const old = await post(`/auth/otp/${challenge.challengeId}/verify`, { code: first });
      expect(old.body.error?.code).toBe('OTP_INVALID');
    }
    for (const left of [1, 0]) {
      await allowResend(challenge.challengeId);
      const answer = await post(`/auth/otp/${challenge.challengeId}/resend`);
      expect(answer.body.data?.resendsLeft).toBe(left);
    }
    await allowResend(challenge.challengeId);
    const over = await post(`/auth/otp/${challenge.challengeId}/resend`);
    expect([over.status, over.body.error?.code]).toEqual([429, 'OTP_RESEND_LIMIT']);
    // tries start again with each new code, and the latest code works
    const latest = await codeOf(challenge.challengeId);
    expect((await post(`/auth/otp/${challenge.challengeId}/verify`, { code: latest })).status).toBe(
      200,
    );
    const gone = await post(`/auth/otp/${challenge.challengeId}/resend`);
    expect(gone.body.error?.code).toBe('OTP_EXPIRED');
  });

  it('sends one email at most the hourly limit of codes, for any app, without saying why else', async () => {
    const limited = await startIdentity({ IDENTITY__OTP_EMAIL_LIMIT_PER_HOUR: '2' });
    try {
      const address = email('busy');
      const ask = () => post('/auth/otp', { email: address, consent }, { to: limited });
      expect((await ask()).status).toBe(200);
      const second = await ask();
      expect(second.status).toBe(200);
      const third = await ask();
      expect([third.status, third.body.error?.code]).toEqual([429, 'OTP_EMAIL_LIMIT']);
      // a resend counts too
      const { challengeId } = second.body.data as { challengeId: string };
      await allowResend(challengeId);
      const resend = await post(`/auth/otp/${challengeId}/resend`, {}, { to: limited });
      expect(resend.body.error?.code).toBe('OTP_EMAIL_LIMIT');
      // the counter key names no email
      const keys = await limited.runtime.redis.client.keys('bq:id:otp-email:*');
      expect(keys.some((key) => key.includes('busy'))).toBe(false);
    } finally {
      await limited.stop();
    }
  });

  it('refuses with 503 when Redis is away, sending no code it could not check', async () => {
    const cut = await startIdentity();
    try {
      cut.runtime.redis.client.disconnect();
      const answer = await post('/auth/otp', { email: email('cut'), consent }, { to: cut });
      expect([answer.status, answer.body.error?.code]).toEqual([503, 'SERVICE_UNAVAILABLE']);
      expect(
        await server.runtime.mongo.db
          .collection(OUTBOX)
          .countDocuments({ 'envelope.data.email': email('cut') }),
      ).toBe(0);
    } finally {
      await cut.stop();
    }
  });

  it('refuses to start with keys it cannot read, naming the setting', async () => {
    await expect(startIdentity({ IDENTITY__OTP_EVENT_KEYS: 'e1:short' })).rejects.toThrow(
      'IDENTITY__OTP_EVENT_KEYS: key e1 must be 32 bytes',
    );
    await expect(startIdentity({ IDENTITY__BLIND_INDEX_KEY: 'b1:short' })).rejects.toThrow(
      'BLIND_INDEX_KEY',
    );
  });
});
