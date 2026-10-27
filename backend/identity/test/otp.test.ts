// Email codes: sign-up (with the new password) and setting a password, against the local MongoDB
// replica set and Valkey (`npm run infra:up`). See helpers.ts.
import { OUTBOX } from '@beautinique/backend-server-queue';
import { uuidv7 } from '@beautinique/shared-utils';
import { Queue } from 'bullmq';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { challengeKey, OTP_MIN_ANSWER_MS } from '../src/otp.ts';
import {
  acceptances,
  allowResend,
  BREACHED,
  codeOf,
  consent,
  credentials,
  events,
  type Harness,
  hibp,
  makeAccount,
  PASSWORD,
  passwordCode,
  post,
  providers,
  signUpCode,
  startHarness,
  users,
  verify,
} from './helpers.ts';

let harness: Harness;
const email = (name: string) => `${name}-${harness.runId}@beautinique.example`;

beforeAll(async () => {
  harness = await startHarness('otp');
});

afterAll(async () => {
  await harness.stop();
});

describe('sign-up with an email code', () => {
  it('sends a sealed code to notify; the right code with a password makes the account, signed in', async () => {
    const address = email('riya');
    const before = Date.now();
    const challenge = await signUpCode(` ${address.toUpperCase()} `);
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
    const queue = new Queue('q.notify', {
      connection: harness.server.runtime.redis.client,
      prefix: harness.prefix,
    });
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
    const redis = harness.server.runtime.redis.client;
    const stored = await redis.hgetall(challengeKey(challenge.challengeId));
    expect(JSON.stringify(stored)).not.toContain(code);
    expect(await redis.pttl(challengeKey(challenge.challengeId))).toBeGreaterThan(9 * 60_000);

    const verified = await post(`/auth/otp/${challenge.challengeId}/verify`, {
      code,
      password: `  ${PASSWORD}  `,
    });
    expect(verified.status).toBe(200);
    expect(verified.body.data).toMatchObject({
      email: address,
      outcome: 'account-made',
      signedIn: true,
    });
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
    // the password as an argon2id hash only, and `password` as the way it signs in
    const saved = await credentials().findOne({ _id: user?._id });
    expect(saved?.password?.hash).toMatch(/^\$argon2id\$v=19\$m=19456,t=2,p=1\$/);
    expect(JSON.stringify(saved)).not.toContain(PASSWORD);
    expect(await providers().find({ userId: user?._id }).toArray()).toMatchObject([
      { provider: 'password', subject: null, lastUsedAt: null },
    ]);
    // a code works once
    const again = await post(`/auth/otp/${challenge.challengeId}/verify`, {
      code,
      password: PASSWORD,
    });
    expect([again.status, again.body.error?.code]).toEqual([400, 'OTP_EXPIRED']);
  });

  it('asks the terms and 18 or older before any code; only the sign-up apps sign up', async () => {
    const answer = await post('/auth/sign-up/code', {
      email: email('young'),
      consent: { terms: true },
    });
    expect([answer.status, answer.body.error?.code]).toEqual([400, 'VALIDATION_FAILED']);
    expect(answer.body.error?.details).toEqual([
      { path: ['consent', 'adult'], message: 'Confirm that you are 18 or older' },
    ]);
    const none = await post('/auth/sign-up/code', { email: email('young') });
    expect((none.body.error?.details as unknown[]).length).toBe(2);
    // the seller app asks only the terms
    expect((await signUpCode(email('young-seller'), 'seller')).resendsLeft).toBe(3);
    for (const app of ['delivery', 'admin']) {
      const refused = await post('/auth/sign-up/code', { email: email('rider'), consent }, { app });
      expect([refused.status, refused.body.error?.code], app).toEqual([403, 'APP_NOT_ALLOWED']);
    }
  });

  it('keeps the password of an account that has one, and records the new app’s consent', async () => {
    const address = email('meera');
    await makeAccount(address);
    const user = await users().findOne({ email: address });
    const before = (await credentials().findOne({ _id: user?._id }))?.password?.hash;
    // the same person signs up in the seller app: one account, one password
    const seller = await signUpCode(address, 'seller');
    const kept = await verify(seller.challengeId, 'another password entirely', 'seller');
    expect(kept.body.data).toMatchObject({
      userId: user?._id,
      outcome: 'password-kept',
      signedIn: false,
    });
    expect((await credentials().findOne({ _id: user?._id }))?.password?.hash).toBe(before);
    expect(await users().countDocuments({ email: address })).toBe(1);
    expect(
      await acceptances()
        .find({ userId: user?._id })
        .sort({ acceptedAt: 1 })
        .map((a) => a.app)
        .toArray(),
    ).toEqual(['customer', 'seller']);
    // the same app and version again adds nothing
    await verify((await signUpCode(address, 'seller')).challengeId, PASSWORD, 'seller');
    expect(await acceptances().countDocuments({ userId: user?._id })).toBe(2);

    // a new legal version is accepted again
    const later = await harness.start({ IDENTITY__LEGAL_VERSION: 'dummy-2' });
    try {
      const answer = await post('/auth/sign-up/code', { email: address, consent }, { to: later });
      const { challengeId } = answer.body.data as { challengeId: string };
      await post(
        `/auth/otp/${challengeId}/verify`,
        { code: await codeOf(challengeId, later), password: PASSWORD },
        { to: later },
      );
      expect(
        await acceptances()
          .find({ userId: user?._id, app: 'customer' })
          .sort({ acceptedAt: 1 })
          .map((a) => a.version)
          .toArray(),
      ).toEqual(['dummy-1', 'dummy-2']);
    } finally {
      await later.stop();
    }
  });

  it('adds a password to an account without one (made with Google), and does not sign in', async () => {
    const address = email('google');
    const userId = uuidv7();
    const now = new Date();
    await users().insertOne({
      _id: userId,
      email: address,
      status: 'active',
      emailVerifiedAt: now,
      ageDeclaredAt: now,
      signUpApp: 'customer',
      createdAt: now,
      updatedAt: now,
    });
    await providers().insertOne({
      _id: uuidv7(),
      userId,
      provider: 'google',
      subject: '104857392018475620193',
      linkedAt: now,
      lastUsedAt: now,
    });
    const answer = await verify(
      (await signUpCode(address, 'seller')).challengeId,
      PASSWORD,
      'seller',
    );
    expect(answer.body.data).toMatchObject({ userId, outcome: 'password-set', signedIn: false });
    expect(
      (await providers().find({ userId }).toArray()).map((p) => p.provider).toSorted(),
    ).toEqual(['google', 'password']);
    expect((await credentials().findOne({ _id: userId }))?.password?.hash).toMatch(/^\$argon2id\$/);
  });

  it('records a first 18-or-older declaration of an account made elsewhere', async () => {
    const address = email('seller');
    // the seller app asks only the terms; an adult flag sent there is not a declaration
    await verify((await signUpCode(address, 'seller')).challengeId, PASSWORD, 'seller');
    expect((await users().findOne({ email: address }))?.ageDeclaredAt).toBeNull();
    await verify((await signUpCode(address)).challengeId);
    const user = await users().findOne({ email: address });
    expect(user?.ageDeclaredAt).toBeInstanceOf(Date);
    expect(user?.signUpApp).toBe('seller');
    expect(await acceptances().countDocuments({ userId: user?._id, adult: true })).toBe(1);
  });
});

describe('password codes', () => {
  it('set a new password for an account, from any app, without signing in', async () => {
    const address = email('rider');
    const userId = await makeAccount(address);
    const before = (await credentials().findOne({ _id: userId }))?.password?.hash;
    const challenge = await passwordCode(address, 'delivery');
    expect((await events(challenge.challengeId))[0]?.envelope.data).toMatchObject({
      purpose: 'password',
      app: 'delivery',
    });
    const answer = await verify(challenge.challengeId, 'a brand new password', 'delivery');
    expect(answer.body.data).toMatchObject({ userId, outcome: 'password-set', signedIn: false });
    expect((await credentials().findOne({ _id: userId }))?.password?.hash).not.toBe(before);
    expect(await providers().countDocuments({ userId, provider: 'password' })).toBe(1);
  });

  it('answer an unknown email like any other, in the same time, and send nothing', async () => {
    await makeAccount(email('timed'));
    for (const [name, sends] of [
      ['timed', 1],
      ['stranger', 0],
    ] as const) {
      const startedAt = performance.now();
      const asked = await post('/auth/password/code', { email: email(name) }, { app: 'delivery' });
      expect(performance.now() - startedAt, name).toBeGreaterThanOrEqual(OTP_MIN_ANSWER_MS);
      const { challengeId } = asked.body.data as { challengeId: string };
      expect(Object.keys(asked.body.data ?? {}).toSorted()).toEqual([
        'challengeId',
        'expiresAt',
        'resendAfter',
        'resendsLeft',
      ]);
      await allowResend(challengeId);
      const resentAt = performance.now();
      const resent = await post(`/auth/otp/${challengeId}/resend`, {}, { app: 'delivery' });
      expect(resent.status).toBe(200);
      expect(performance.now() - resentAt, name).toBeGreaterThanOrEqual(OTP_MIN_ANSWER_MS);
      expect(await events(challengeId), name).toHaveLength(sends * 2);
      if (sends === 0) {
        for (const code of ['000000', '123456']) {
          const answer = await post(
            `/auth/otp/${challengeId}/verify`,
            { code, password: PASSWORD },
            { app: 'delivery' },
          );
          expect(answer.body.error?.code).toBe('OTP_INVALID');
        }
      }
    }
    expect(await users().countDocuments({ email: email('stranger') })).toBe(0);
  });

  it('refuse a breached password before the code is used up, and allow it when the check is away', async () => {
    const challenge = await signUpCode(email('breach'));
    const code = await codeOf(challenge.challengeId);
    const leaked = await post(`/auth/otp/${challenge.challengeId}/verify`, {
      code,
      password: `  ${BREACHED}  `,
    });
    expect([leaked.status, leaked.body.error?.code]).toEqual([400, 'PASSWORD_BREACHED']);
    expect(leaked.body.error?.details).toEqual([
      { path: ['password'], message: 'Choose a password that has not been leaked' },
    ]);
    // only 5 hex characters of the SHA-1 left the server
    expect(hibp.asked.at(-1)).toMatch(/^[0-9A-F]{5}$/);
    // the same code works with another password
    const good = await post(`/auth/otp/${challenge.challengeId}/verify`, {
      code,
      password: PASSWORD,
    });
    expect(good.body.data?.outcome).toBe('account-made');

    for (const mode of ['down', 'hang'] as const) {
      hibp.mode = mode;
      try {
        const other = await signUpCode(email(`breach-${mode}`));
        const allowed = await verify(other.challengeId, BREACHED);
        expect(allowed.body.data?.outcome, mode).toBe('account-made');
      } finally {
        hibp.mode = 'answer';
      }
    }
  });

  it('a challenge from before sign-in by password no longer works', async () => {
    const challenge = await passwordCode(email('rider'));
    await harness.server.runtime.redis.client.hset(
      challengeKey(challenge.challengeId),
      'purpose',
      'sign-in',
    );
    const answer = await verify(challenge.challengeId);
    expect(answer.body.error?.code).toBe('OTP_EXPIRED');
  });
});

describe('codes that do not fit', () => {
  it('gives 5 tries, says how many are left, then the challenge is gone', async () => {
    const challenge = await signUpCode(email('tries'));
    const code = await codeOf(challenge.challengeId);
    const wrong = code === '000000' ? '111111' : '000000';
    const messages: string[] = [];
    for (let i = 0; i < 4; i += 1) {
      const answer = await post(`/auth/otp/${challenge.challengeId}/verify`, {
        code: wrong,
        password: PASSWORD,
      });
      expect(answer.body.error?.code).toBe('OTP_INVALID');
      messages.push(answer.body.error?.message ?? '');
    }
    expect(messages).toEqual([
      'That code is not right. You have 4 more tries.',
      'That code is not right. You have 3 more tries.',
      'That code is not right. You have 2 more tries.',
      'That code is not right. You have 1 more try.',
    ]);
    const last = await post(`/auth/otp/${challenge.challengeId}/verify`, {
      code: wrong,
      password: PASSWORD,
    });
    expect(last.body.error?.code).toBe('OTP_EXPIRED');
    const right = await post(`/auth/otp/${challenge.challengeId}/verify`, {
      code,
      password: PASSWORD,
    });
    expect(right.body.error?.code).toBe('OTP_EXPIRED');
    expect(
      await harness.server.runtime.redis.client.exists(challengeKey(challenge.challengeId)),
    ).toBe(0);
  });

  it('gives a new code its own 5 tries', async () => {
    const challenge = await signUpCode(email('fresh'));
    const wrongFor = (code: string) => (code === '000000' ? '111111' : '000000');
    const first = await codeOf(challenge.challengeId);
    for (let i = 0; i < 4; i += 1) {
      await post(`/auth/otp/${challenge.challengeId}/verify`, {
        code: wrongFor(first),
        password: PASSWORD,
      });
    }
    await allowResend(challenge.challengeId);
    await post(`/auth/otp/${challenge.challengeId}/resend`);
    const second = await codeOf(challenge.challengeId);
    const wrong = await post(`/auth/otp/${challenge.challengeId}/verify`, {
      code: wrongFor(second),
      password: PASSWORD,
    });
    expect(wrong.body.error?.message).toBe('That code is not right. You have 4 more tries.');
    expect((await verify(challenge.challengeId)).status).toBe(200);
  });

  it('takes a code only in the app that asked for it, and only from a known app', async () => {
    const challenge = await signUpCode(email('apps'));
    const code = await codeOf(challenge.challengeId);
    const elsewhere = await post(
      `/auth/otp/${challenge.challengeId}/verify`,
      { code, password: PASSWORD },
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
    const noApp = await post(
      `/auth/otp/${challenge.challengeId}/verify`,
      { code, password: PASSWORD },
      { app: null },
    );
    expect([noApp.status, noApp.body.error?.code]).toEqual([403, 'APP_NOT_ALLOWED']);
    const unknown = await post('/auth/password/code', { email: email('apps') }, { app: 'shop' });
    expect(unknown.body.error?.code).toBe('APP_NOT_ALLOWED');
    // the right app still works
    expect((await verify(challenge.challengeId)).status).toBe(200);
  });

  it('lets only one of two requests with the same right code through', async () => {
    const challenge = await signUpCode(email('race'));
    const code = await codeOf(challenge.challengeId);
    const answers = await Promise.all([
      post(`/auth/otp/${challenge.challengeId}/verify`, { code, password: PASSWORD }),
      post(`/auth/otp/${challenge.challengeId}/verify`, { code, password: PASSWORD }),
    ]);
    expect(answers.map((a) => a.status).toSorted()).toEqual([200, 400]);
    expect(await users().countDocuments({ email: email('race') })).toBe(1);
  });
});

describe('new codes and limits', () => {
  it('sends a new code a minute later, at most 3 times; the old code stops working', async () => {
    const challenge = await signUpCode(email('resend'));
    const first = await codeOf(challenge.challengeId);
    const soon = await post(`/auth/otp/${challenge.challengeId}/resend`);
    expect([soon.status, soon.body.error?.code]).toEqual([429, 'OTP_RESEND_TOO_SOON']);
    await allowResend(challenge.challengeId);
    const resent = await post(`/auth/otp/${challenge.challengeId}/resend`);
    expect(resent.status).toBe(200);
    expect(resent.body.data).toMatchObject({ challengeId: challenge.challengeId, resendsLeft: 2 });
    expect(await events(challenge.challengeId)).toHaveLength(2);
    expect((await events(challenge.challengeId))[1]?.envelope.data.purpose).toBe('sign-up');
    const second = await codeOf(challenge.challengeId);
    if (second !== first) {
      const old = await post(`/auth/otp/${challenge.challengeId}/verify`, {
        code: first,
        password: PASSWORD,
      });
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
    expect((await verify(challenge.challengeId)).status).toBe(200);
    const gone = await post(`/auth/otp/${challenge.challengeId}/resend`);
    expect(gone.body.error?.code).toBe('OTP_EXPIRED');
  });

  it('sends one email at most the hourly limit of codes, for any purpose, without saying why else', async () => {
    const limited = await harness.start({ IDENTITY__OTP_EMAIL_LIMIT_PER_HOUR: '2' });
    try {
      const address = email('busy');
      const ask = () => post('/auth/sign-up/code', { email: address, consent }, { to: limited });
      expect((await ask()).status).toBe(200);
      const second = await ask();
      expect(second.status).toBe(200);
      const third = await ask();
      expect([third.status, third.body.error?.code]).toEqual([429, 'OTP_EMAIL_LIMIT']);
      const reset = await post('/auth/password/code', { email: address }, { to: limited });
      expect(reset.body.error?.code).toBe('OTP_EMAIL_LIMIT');
      // a resend counts too
      const { challengeId } = second.body.data as { challengeId: string };
      await allowResend(challengeId, limited);
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
    const cut = await harness.start();
    try {
      cut.runtime.redis.client.disconnect();
      const answer = await post(
        '/auth/sign-up/code',
        { email: email('cut'), consent },
        { to: cut },
      );
      expect([answer.status, answer.body.error?.code]).toEqual([503, 'SERVICE_UNAVAILABLE']);
      expect(
        await harness.server.runtime.mongo.db
          .collection(OUTBOX)
          .countDocuments({ 'envelope.data.email': email('cut') }),
      ).toBe(0);
    } finally {
      await cut.stop();
    }
  });

  it('refuses to start with keys it cannot read, naming the setting', async () => {
    await expect(harness.start({ IDENTITY__OTP_EVENT_KEYS: 'e1:short' })).rejects.toThrow(
      'IDENTITY__OTP_EVENT_KEYS: key e1 must be 32 bytes',
    );
    await expect(harness.start({ IDENTITY__BLIND_INDEX_KEY: 'b1:short' })).rejects.toThrow(
      'BLIND_INDEX_KEY',
    );
  });
});
