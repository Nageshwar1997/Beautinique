// Against the local MongoDB replica set and Valkey from `npm run infra:up`, each run in its own
// databases and BullMQ key prefix.
import { randomUUID } from 'node:crypto';
import { Writable } from 'node:stream';
import { setTimeout as sleep } from 'node:timers/promises';

import { encryptField, generateKey, loadSealingKeys } from '@beautinique/backend-server-crypto';
import { createLogger, LOOPBACK_HOST } from '@beautinique/backend-server-kit';
import { connectMongo, type Mongo, withTransaction } from '@beautinique/backend-server-mongo';
import {
  type Relay,
  startRelay,
  type TaskTrigger,
  writeEvent,
} from '@beautinique/backend-server-queue';
import { otpRequested, otpSealContext } from '@beautinique/shared-contracts';
import { uuidv7 } from '@beautinique/shared-utils';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { readConfig } from '../src/config.ts';
import {
  DELIVERIES,
  type Delivery,
  EMAIL_DAYS,
  LANES,
  MAX_ATTEMPTS,
  OTP_EMAIL,
  sendDue,
  type SendDueDeps,
} from '../src/deliveries.ts';
import { type EmailMessage, type EmailSender, EmailSendError } from '../src/email/port.ts';
import { release, start } from '../src/service.ts';

const MONGO_URI = 'mongodb://localhost:27017/?replicaSet=rs0';
const REDIS_URL = 'redis://localhost:6379';
const runId = randomUUID().slice(0, 8);
const dbName = `bq_test_notify_${runId}`;
const producerDbName = `bq_test_notify_producer_${runId}`;
const prefix = `bqtestnotify${runId}`;
const KEY = `e1:${generateKey()}`;
const keys = loadSealingKeys(KEY);

/** Every log line, so tests can prove a code or an address never reaches one. */
const lines: Record<string, unknown>[] = [];
const logger = createLogger({
  name: 'notify-test',
  level: 'debug',
  destination: new Writable({
    write(chunk: Buffer, _encoding, done) {
      for (const line of chunk.toString().split('\n').filter(Boolean)) {
        lines.push(JSON.parse(line) as Record<string, unknown>);
      }
      done();
    },
  }),
});

let mongo: Mongo;

beforeAll(async () => {
  mongo = await connectMongo({ uri: MONGO_URI, dbName, appName: 'notify-test', logger });
  await release(readConfig({ env: testEnv() }), { logger });
});

afterAll(async () => {
  await mongo.db.dropDatabase();
  await mongo.client.db(producerDbName).dropDatabase();
  await mongo.close();
});

function testEnv(): Record<string, string> {
  return {
    NOTIFY__LOG_LEVEL: 'silent',
    NOTIFY__MONGO_URI: MONGO_URI,
    NOTIFY__MONGO_DB_NAME: dbName,
    NOTIFY__REDIS_URL: REDIS_URL,
    NOTIFY__EMAIL_TRANSPORT: 'mailpit',
    NOTIFY__EMAIL_FROM: 'no-reply@beautinique.example',
    NOTIFY__OTP_EVENT_KEYS: KEY,
  };
}

/** A stand-in provider: fails with the queued errors first, then keeps what it sends. */
function fakeSender() {
  const sent: EmailMessage[] = [];
  const failures: Error[] = [];
  const sender: EmailSender = {
    name: 'fake',
    send: (message) => {
      const failure = failures.shift();
      if (failure) return Promise.reject(failure);
      sent.push(message);
      return Promise.resolve({ providerId: `fake-${String(sent.length)}` });
    },
  };
  return { sender, sent, failures };
}

const deliveries = () => mongo.db.collection<Delivery>(DELIVERIES);
const sealed = (challengeId: string, code: string) =>
  encryptField(keys, code, otpSealContext(challengeId));

async function waitFor(check: () => boolean | Promise<boolean>, ms = 5000): Promise<void> {
  const end = Date.now() + ms;
  while (!(await check())) {
    if (Date.now() > end) throw new Error('timed out');
    await sleep(25);
  }
}

describe('notify settings', () => {
  it('reads NOTIFY__* settings with defaults, and names a bad one', () => {
    expect(readConfig({ env: testEnv() })).toEqual({
      port: 8083,
      logLevel: 'silent',
      mongoUri: MONGO_URI,
      mongoDbName: dbName,
      redisUrl: REDIS_URL,
      emailTransport: 'mailpit',
      mailpitUrl: 'http://localhost:8025',
      emailFrom: 'no-reply@beautinique.example',
      emailFromName: 'Beautinique',
      otpEventKeys: KEY,
      emailDailyLimit: 300,
      emailOtherLimit: 250,
      appUrls: new Map(),
    });
    for (const [change, message] of [
      [{ NOTIFY__EMAIL_TRANSPORT: undefined }, 'NOTIFY__EMAIL_TRANSPORT'],
      [{ NOTIFY__EMAIL_TRANSPORT: 'smtp' }, 'NOTIFY__EMAIL_TRANSPORT'],
      [{ NOTIFY__EMAIL_TRANSPORT: 'brevo' }, 'NOTIFY__BREVO_API_KEY: Required when'],
      [{ NOTIFY__EMAIL_FROM: 'nobody' }, 'NOTIFY__EMAIL_FROM'],
      [{ NOTIFY__OTP_EVENT_KEYS: undefined }, 'NOTIFY__OTP_EVENT_KEYS'],
      [{ NOTIFY__EMAIL_OTHER_LIMIT: '301' }, 'NOTIFY__EMAIL_OTHER_LIMIT: Must not be above'],
      [{ NOTIFY__SMTP_HOST: 'x' }, 'NOTIFY__SMTP_HOST: not a setting'],
      [{ NOTIFY__APP_URLS: 'shop=https://a.example' }, 'NOTIFY__APP_URLS'],
      [{ NOTIFY__APP_URLS: 'customer=http://a.example' }, 'NOTIFY__APP_URLS'],
      [{ NOTIFY__APP_URLS: 'customer' }, 'NOTIFY__APP_URLS'],
      [{ NOTIFY__APP_URLS: 'customer=https://a.example/path' }, 'NOTIFY__APP_URLS'],
    ] as const) {
      expect(() => readConfig({ env: { ...testEnv(), ...change } }), message).toThrow(message);
    }
    expect(
      readConfig({
        env: { ...testEnv(), NOTIFY__EMAIL_TRANSPORT: 'brevo', NOTIFY__BREVO_API_KEY: 'k' },
      }).brevoApiKey,
    ).toBe('k');
    expect(
      readConfig({
        env: {
          ...testEnv(),
          NOTIFY__APP_URLS:
            ' customer=https://bq-customer.vercel.app/ , admin=http://localhost:3003',
        },
      }).appUrls,
    ).toEqual(
      new Map([
        ['customer', 'https://bq-customer.vercel.app'],
        ['admin', 'http://localhost:3003'],
      ]),
    );
  });
});

describe('sendDue', () => {
  let now: Date;
  let triggered: number;
  const trigger: TaskTrigger = {
    runSoon: () => {
      triggered += 1;
      return Promise.resolve();
    },
    close: () => Promise.resolve(),
  };
  const run = (sender: EmailSender, more: Partial<SendDueDeps> = {}) =>
    sendDue({
      mongo,
      sender,
      otpKeys: keys,
      logger,
      trigger,
      limits: { daily: 300, other: 250 },
      now: () => now,
      ...more,
    });

  /** A queued OTP email as the subscription writes it. */
  const queue = async (code = '482913', more: Partial<Delivery> = {}): Promise<Delivery> => {
    const challengeId = uuidv7();
    const delivery: Delivery = {
      _id: uuidv7(),
      channel: 'email',
      lane: 'otp',
      priority: LANES.otp,
      template: 'otp',
      to: `riya-${challengeId.slice(-6)}@beautinique.example`,
      otp: {
        challengeId,
        sealedCode: sealed(challengeId, code),
        app: 'customer',
        purpose: 'sign-in',
        minutes: 10,
      },
      status: 'queued',
      attempts: 0,
      dueAt: now,
      expiresAt: new Date(now.getTime() + 10 * 60_000),
      createdAt: now,
      ...more,
    };
    await deliveries().insertOne(delivery);
    return delivery;
  };
  const read = (id: string) => deliveries().findOne({ _id: id });

  beforeEach(async () => {
    now = new Date('2026-10-27T05:00:00.000Z');
    triggered = 0;
    await deliveries().deleteMany({});
    await mongo.db.collection(EMAIL_DAYS).deleteMany({});
  });

  it('sends a due code, records the provider id and drops the sealed code', async () => {
    const { sender, sent } = fakeSender();
    const delivery = await queue('482913');
    expect(await run(sender)).toEqual({ sent: 1, retried: 0, expired: 0, failed: 0, deferred: 0 });
    expect(sent).toHaveLength(1);
    expect(sent[0]?.to).toBe(delivery.to);
    expect(sent[0]?.text).toContain('482913');
    const after = await read(delivery._id);
    expect(after).toMatchObject({
      status: 'sent',
      attempts: 1,
      provider: 'fake',
      providerId: 'fake-1',
    });
    expect(after?.sentAt).toEqual(now);
    expect(after?.otp).not.toHaveProperty('sealedCode');
    expect(after).not.toHaveProperty('leaseUntil');
    expect(
      await mongo.db.collection(EMAIL_DAYS).findOne({ _id: '2026-10-27' as never }),
    ).toMatchObject({
      sent: 1,
    });
    // a second run finds nothing
    expect((await run(sender)).sent).toBe(0);
    expect(sent).toHaveLength(1);
  });

  it('sends an invitation with the app’s link when it has one, never after it ran out', async () => {
    const { sender, sent } = fakeSender();
    const invite = (app: 'admin' | 'seller', more: Partial<Delivery> = {}) => {
      const delivery: Delivery = {
        _id: uuidv7(),
        channel: 'email',
        lane: 'transactional',
        priority: LANES.transactional,
        template: 'invitation',
        to: `asha-${app}@beautinique.example`,
        invitation: { app, roleName: 'State Admin', expiresAt: '2026-11-03T05:00:00.000Z' },
        status: 'queued',
        attempts: 0,
        dueAt: now,
        expiresAt: new Date('2026-11-03T05:00:00.000Z'),
        createdAt: now,
        ...more,
      };
      return deliveries()
        .insertOne(delivery)
        .then(() => delivery);
    };
    const linked = await invite('admin');
    const plain = await invite('seller');
    const late = await invite('admin', { to: 'late@beautinique.example', expiresAt: now });
    const report = await run(sender, { appUrls: new Map([['admin', 'https://bq-admin.example']]) });
    expect(report).toMatchObject({ sent: 2, expired: 1 });
    const byTo = new Map(sent.map((message) => [message.to, message]));
    expect(byTo.get(linked.to)?.html).toContain('href="https://bq-admin.example"');
    expect(byTo.get(linked.to)?.subject).toBe('You are invited to Beautinique Admin');
    expect(byTo.get(plain.to)?.html).not.toContain('href=');
    expect(byTo.get(plain.to)?.text).toContain('open the Beautinique Seller app');
    expect((await read(late._id))?.status).toBe('expired');
  });

  it('sends the person’s authenticator change, and fails one without its details for good', async () => {
    const { sender, sent } = fakeSender();
    const change = (more: Partial<Delivery> = {}): Promise<Delivery> => {
      const delivery: Delivery = {
        _id: uuidv7(),
        channel: 'email',
        lane: 'transactional',
        priority: LANES.transactional,
        template: 'authenticator-changed',
        to: `riya-${uuidv7().slice(-6)}@beautinique.example`,
        authenticatorChange: {
          change: 'disabled',
          app: 'customer',
          device: 'Chrome on Windows',
          changedAt: '2026-10-27T04:59:00.000Z',
        },
        status: 'queued',
        attempts: 0,
        dueAt: now,
        expiresAt: null,
        createdAt: now,
        ...more,
      };
      return deliveries()
        .insertOne(delivery)
        .then(() => delivery);
    };
    const good = await change();
    const { authenticatorChange: _dropped, ...withoutDetails } = await change();
    await deliveries().replaceOne({ _id: withoutDetails._id }, withoutDetails);
    expect(await run(sender)).toMatchObject({ sent: 1, failed: 1, retried: 0 });
    expect(sent.map((message) => message.to)).toEqual([good.to]);
    expect(sent[0]?.subject).toBe('Your Beautinique authenticator was turned off');
    expect(sent[0]?.tags).toEqual(['security-authenticator-disabled']);
    expect(await read(withoutDetails._id)).toMatchObject({
      status: 'failed',
      error: 'AUTHENTICATOR_DETAILS_MISSING',
    });
  });

  it('sends codes before other emails, and nothing that is not due yet', async () => {
    const { sender, sent } = fakeSender();
    const other = await queue('111111', {
      lane: 'other',
      priority: LANES.other,
      dueAt: new Date(now.getTime() - 60_000),
    });
    const later = await queue('222222', { dueAt: new Date(now.getTime() + 1000) });
    const code = await queue('333333');
    await run(sender);
    expect(sent.map((m) => m.to)).toEqual([code.to, other.to]);
    expect((await read(later._id))?.status).toBe('queued');
  });

  it('does not send a code that no longer works', async () => {
    const { sender, sent } = fakeSender();
    const old = await queue('482913', { expiresAt: now });
    expect((await run(sender)).expired).toBe(1);
    expect(sent).toHaveLength(0);
    const after = await read(old._id);
    expect(after?.status).toBe('expired');
    expect(after?.otp).not.toHaveProperty('sealedCode');
  });

  it('tries again later after a passing failure, waiting longer each time, then sends', async () => {
    const { sender, sent, failures } = fakeSender();
    const delivery = await queue('482913', { expiresAt: null });
    failures.push(new EmailSendError('BREVO_UNAVAILABLE', { retry: true, status: 503 }));
    expect((await run(sender)).retried).toBe(1);
    let after = await read(delivery._id);
    expect(after).toMatchObject({ status: 'queued', attempts: 1, error: 'BREVO_UNAVAILABLE' });
    expect(after?.dueAt).toEqual(new Date(now.getTime() + 10_000));
    // the failed try did not use up the day's budget
    expect(
      await mongo.db.collection(EMAIL_DAYS).findOne({ _id: '2026-10-27' as never }),
    ).toMatchObject({
      sent: 0,
    });
    failures.push(new Error('socket hang up'));
    now = new Date(now.getTime() + 10_000);
    await run(sender);
    after = await read(delivery._id);
    expect(after).toMatchObject({ status: 'queued', attempts: 2, error: 'UNEXPECTED' });
    expect(after?.dueAt).toEqual(new Date(now.getTime() + 30_000));
    now = new Date(now.getTime() + 30_000);
    await run(sender);
    expect(sent).toHaveLength(1);
    expect((await read(delivery._id))?.status).toBe('sent');
  });

  it('gives up after the last try, on a refused message, and when the retry would come too late', async () => {
    const { sender, failures } = fakeSender();
    const tired = await queue('1', { expiresAt: null, attempts: MAX_ATTEMPTS - 1 });
    failures.push(new EmailSendError('BREVO_UNAVAILABLE', { retry: true }));
    await run(sender);
    expect(await read(tired._id)).toMatchObject({
      status: 'failed',
      attempts: MAX_ATTEMPTS,
      error: 'BREVO_UNAVAILABLE',
    });

    const refused = await queue('2');
    failures.push(new EmailSendError('BREVO_REJECTED', { retry: false, status: 400 }));
    await run(sender);
    expect(await read(refused._id)).toMatchObject({
      status: 'failed',
      attempts: 1,
      error: 'BREVO_REJECTED',
    });

    const close = await queue('3', { expiresAt: new Date(now.getTime() + 5_000) });
    failures.push(new EmailSendError('BREVO_UNAVAILABLE', { retry: true }));
    await run(sender);
    const after = await read(close._id);
    expect(after).toMatchObject({ status: 'failed', error: 'BREVO_UNAVAILABLE' });
    expect(after?.otp).not.toHaveProperty('sealedCode');
  });

  it('fails a code it cannot open (keys differ from identity) without trying again', async () => {
    const { sender, sent } = fakeSender();
    const delivery = await queue('482913');
    await run(sender, { otpKeys: loadSealingKeys(`e1:${generateKey()}`) });
    expect(sent).toHaveLength(0);
    expect(await read(delivery._id)).toMatchObject({
      status: 'failed',
      error: 'OTP_CODE_UNREADABLE',
    });
  });

  it('keeps to the day’s limits: codes stop at the hard limit, other emails wait for the next UTC day', async () => {
    const { sender, sent } = fakeSender();
    await mongo.db
      .collection<{ _id: string; sent: number; createdAt: Date }>(EMAIL_DAYS)
      .insertOne({ _id: '2026-10-27', sent: 2, createdAt: now });
    const other = await queue('1', { lane: 'other', priority: LANES.other });
    const code = await queue('2');
    const late = await queue('3');
    const report = await run(sender, { limits: { daily: 3, other: 2 } });
    expect(report).toMatchObject({ sent: 1, failed: 1, deferred: 1 });
    expect(sent.map((m) => m.to)).toEqual([code.to]);
    expect(await read(late._id)).toMatchObject({ status: 'failed', error: 'DAILY_LIMIT' });
    expect(await read(other._id)).toMatchObject({
      status: 'queued',
      attempts: 0,
      dueAt: new Date('2026-10-28T00:00:00.000Z'),
    });
    expect(lines.some((l) => l.msg === 'email not sent: the daily email limit is reached')).toBe(
      true,
    );
  });

  it('takes back a send that stopped half way once its lease ran out', async () => {
    const { sender, sent } = fakeSender();
    const stuck = await queue('1', { status: 'sending', attempts: 1, leaseUntil: now });
    const busy = await queue('2', {
      status: 'sending',
      attempts: 1,
      leaseUntil: new Date(now.getTime() + 1000),
    });
    await run(sender);
    expect(sent.map((m) => m.to)).toEqual([stuck.to]);
    expect(await read(stuck._id)).toMatchObject({ status: 'sent', attempts: 2 });
    expect((await read(busy._id))?.status).toBe('sending');
  });

  it('asks for the next run at once when a whole batch went', async () => {
    const { sender, sent } = fakeSender();
    await queue('1');
    await queue('2');
    await queue('3');
    await run(sender, { batchSize: 2 });
    expect(sent).toHaveLength(2);
    expect(triggered).toBe(1);
    await run(sender, { batchSize: 2 });
    expect(sent).toHaveLength(3);
    expect(triggered).toBe(1);
  });
});

describe('notify end to end', () => {
  let producer: Mongo;
  let relay: Relay | undefined;

  beforeAll(async () => {
    producer = await connectMongo({
      uri: MONGO_URI,
      dbName: producerDbName,
      appName: 'producer',
      logger,
    });
  });
  afterAll(async () => {
    await relay?.stop();
    await producer.close();
  });

  /** What identity will do (TASKS T3.1): the sealed code in an event, in a transaction. */
  const requestCode = (email: string, code: string) => {
    const challengeId = uuidv7();
    return withTransaction(producer, (session) =>
      writeEvent(producer, session, otpRequested, {
        aggregate: { type: 'otpChallenge', id: challengeId },
        actor: { type: 'system', id: 'identity' },
        correlationId: `req-${challengeId}`,
        data: {
          challengeId,
          email,
          app: 'customer',
          purpose: 'sign-in',
          sealedCode: sealed(challengeId, code),
          expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
        },
      }),
    );
  };

  it('emails a requested code within seconds, once, and keeps it out of every log', async () => {
    const { sender, sent } = fakeSender();
    const server = await start(readConfig({ env: testEnv() }), {
      port: 0,
      host: LOOPBACK_HOST,
      handleSignals: false,
      runtime: { sender, queuePrefix: prefix, epochKey: `${prefix}:epoch` },
    });
    try {
      const ready = await fetch(`${server.url}/ready`);
      expect(await ready.json()).toEqual({
        status: 'ready',
        checks: { mongo: 'ok', redis: 'ok', events: 'ok' },
      });
      relay = startRelay({
        mongo: producer,
        redis: server.runtime.redis.client,
        logger,
        mode: 'poll',
        subscribers: { [otpRequested.type]: [OTP_EMAIL] },
        prefix,
        pollMs: 100,
      });
      const email = `fast-${runId}@beautinique.example`;
      const started = Date.now();
      const event = await requestCode(email, '739104');
      // the every-minute run is far away: only the trigger can send this fast
      await waitFor(() => sent.length === 1, 5000);
      expect(Date.now() - started).toBeLessThan(5000);
      expect(sent[0]).toMatchObject({ to: email, subject: 'Your Beautinique sign-in code' });
      expect(sent[0]?.text).toContain('739104');
      // the delivery is marked sent just after the provider answers
      await waitFor(
        async () => (await deliveries().findOne({ _id: event.eventId }))?.status === 'sent',
      );
      expect(await deliveries().findOne({ _id: event.eventId })).toMatchObject({
        status: 'sent',
        lane: 'otp',
        to: email,
      });

      // the same event again (a relay redo after a Redis wipe): no second email
      const { Queue } = await import('bullmq');
      const queueHandle = new Queue('q.notify', {
        connection: server.runtime.redis.client,
        prefix,
      });
      await queueHandle.add(OTP_EMAIL, event, { jobId: `${event.eventId}@${OTP_EMAIL}-again` });
      await queueHandle.close();
      await sleep(1000);
      expect(sent).toHaveLength(1);

      const logged = JSON.stringify(lines);
      expect(logged).not.toContain('739104');
      expect(logged).not.toContain(email);
    } finally {
      await relay?.stop();
      relay = undefined;
      await server.stop();
    }
  });

  it('puts a requested code into the laptop’s Mailpit inbox (the settings’ own sender)', async () => {
    const server = await start(readConfig({ env: testEnv() }), {
      port: 0,
      host: LOOPBACK_HOST,
      handleSignals: false,
      runtime: { queuePrefix: `${prefix}m`, epochKey: `${prefix}m:epoch` },
    });
    try {
      relay = startRelay({
        mongo: producer,
        redis: server.runtime.redis.client,
        logger,
        mode: 'poll',
        subscribers: { [otpRequested.type]: [OTP_EMAIL] },
        prefix: `${prefix}m`,
        pollMs: 100,
      });
      const email = `mailpit-${runId}@beautinique.example`;
      await requestCode(email, '650218');
      const search = `http://localhost:8025/api/v1/search?query=${encodeURIComponent(`to:${email}`)}`;
      interface Found {
        messages: { ID: string; Subject: string; Snippet: string }[];
      }
      let found: Found = { messages: [] };
      await waitFor(async () => {
        found = (await (await fetch(search)).json()) as Found;
        return found.messages.length > 0;
      });
      expect(found.messages).toHaveLength(1);
      expect(found.messages[0]?.Subject).toBe('Your Beautinique sign-in code');
      expect(found.messages[0]?.Snippet).toContain('650218');
      await fetch('http://localhost:8025/api/v1/messages', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ IDs: found.messages.map((m) => m.ID) }),
      });
    } finally {
      await relay?.stop();
      relay = undefined;
      await server.stop();
    }
  });

  it('refuses to start with OTP event keys it cannot read, naming the setting', async () => {
    await expect(
      start(readConfig({ env: { ...testEnv(), NOTIFY__OTP_EVENT_KEYS: 'e1:short' } }), {
        port: 0,
        handleSignals: false,
      }),
    ).rejects.toThrow('NOTIFY__OTP_EVENT_KEYS: key e1 must be 32 bytes');
  });
});
