// Shared by identity's tests: identity on the local MongoDB replica set and Valkey (`npm run
// infra:up`), in a database and BullMQ prefix of its own, with a stand-in for Have I Been Pwned
// (tests never reach the internet). The test plays notify: it opens the sealed code from
// identity's outbox, as notify does from the event.
import { createHash, randomUUID } from 'node:crypto';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

import { decryptField, generateKey, loadSealingKeys } from '@beautinique/backend-server-crypto';
import { createLogger } from '@beautinique/backend-server-kit';
import { connectMongo } from '@beautinique/backend-server-mongo';
import { OUTBOX } from '@beautinique/backend-server-queue';
import { otpSealContext } from '@beautinique/shared-contracts';
import { Queue } from 'bullmq';
import { expect } from 'vitest';

import { readConfig } from '../src/config.ts';
import {
  AUTH_PROVIDERS,
  type AuthProvider,
  CREDENTIALS,
  type Credentials,
} from '../src/credentials.ts';
import { challengeKey } from '../src/otp.ts';
import { type RunningIdentity, start } from '../src/service.ts';
import { LEGAL_ACCEPTANCES, type LegalAcceptance, type User, USERS } from '../src/users.ts';

export const MONGO_URI = 'mongodb://localhost:27017/?replicaSet=rs0';
export const REDIS_URL = 'redis://localhost:6379';
const logger = createLogger({ name: 'identity-test', level: 'silent' });

/** A password Have I Been Pwned knows (the stand-in answers it as breached). */
export const BREACHED = 'password123456';
/** A new password that is fine. */
export const PASSWORD = 'pink lipstick on a rainy day';

/** How the stand-in for Have I Been Pwned answers now. */
export const hibp = { mode: 'answer' as 'answer' | 'down' | 'hang', asked: [] as string[] };

/**
 * A stand-in for api.pwnedpasswords.com/range/<prefix>: the breached suffix with a count, padding
 * lines with 0, like the real one with Add-Padding.
 */
async function startHibp(): Promise<{ url: string; server: Server }> {
  const sha1 = createHash('sha1').update(BREACHED).digest('hex').toUpperCase();
  const server = createServer((req, res) => {
    const prefix = /^\/range\/([0-9A-F]{5})$/.exec(req.url ?? '')?.[1] ?? '';
    hibp.asked.push(prefix);
    if (hibp.mode === 'hang') return;
    if (hibp.mode === 'down') {
      res.writeHead(503).end();
      return;
    }
    const lines = [`${'0'.repeat(35)}:0`, `${'F'.repeat(35)}:0`];
    if (prefix === sha1.slice(0, 5)) lines.push(`${sha1.slice(5)}:52`);
    res.writeHead(200, { 'content-type': 'text/plain' }).end(lines.join('\r\n'));
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  return { url: `http://127.0.0.1:${String((server.address() as AddressInfo).port)}`, server };
}

export interface Harness {
  server: RunningIdentity;
  runId: string;
  prefix: string;
  start(more?: Record<string, string>): Promise<RunningIdentity>;
  stop(): Promise<void>;
}

/** One test file's identity, database, prefix, keys and Have I Been Pwned stand-in. */
export async function startHarness(name: string): Promise<Harness> {
  const runId = randomUUID().slice(0, 8);
  const dbName = `bq_test_identity_${name}_${runId}`;
  const prefix = `bqtestid${name}${runId}`;
  const otpEventKeys = `e1:${generateKey()}`;
  const fieldKeys = `k1:${generateKey()}`;
  const blindIndexKey = `b1:${generateKey()}`;
  const fake = await startHibp();
  const env = (more: Record<string, string>) => ({
    IDENTITY__LOG_LEVEL: 'silent',
    IDENTITY__MONGO_URI: MONGO_URI,
    IDENTITY__MONGO_DB_NAME: dbName,
    IDENTITY__REDIS_URL: REDIS_URL,
    IDENTITY__FIELD_KEYS: fieldKeys,
    IDENTITY__BLIND_INDEX_KEY: blindIndexKey,
    IDENTITY__OTP_EVENT_KEYS: otpEventKeys,
    IDENTITY__HIBP_URL: fake.url,
    ...more,
  });
  const startOne = (more: Record<string, string> = {}) =>
    start(readConfig({ env: env(more) }), {
      port: 0,
      host: '127.0.0.1',
      handleSignals: false,
      runtime: { queuePrefix: prefix, epochKey: `${prefix}:epoch`, pollMs: 100 },
    });
  const server = await startOne();
  otpKeysOf.set(server, loadSealingKeys(otpEventKeys));
  current = server;
  return {
    server,
    runId,
    prefix,
    start: async (more) => {
      const other = await startOne(more);
      otpKeysOf.set(other, loadSealingKeys(otpEventKeys));
      return other;
    },
    async stop() {
      await server.stop();
      await new Promise((resolve) => fake.server.close(resolve));
      fake.server.closeAllConnections();
      const mongo = await connectMongo({ uri: MONGO_URI, dbName, appName: 'cleanup', logger });
      await mongo.db.dropDatabase();
      await mongo.close();
      const queue = new Queue('q.notify', { connection: { url: REDIS_URL }, prefix });
      await queue.obliterate({ force: true });
      await queue.close();
    },
  };
}

const otpKeysOf = new WeakMap<RunningIdentity, ReturnType<typeof loadSealingKeys>>();
let current: RunningIdentity;

export interface Answer {
  status: number;
  body: {
    data?: Record<string, unknown>;
    error?: { code: string; message: string; details?: unknown };
  };
}

export async function post(
  path: string,
  body: unknown = {},
  {
    app = 'customer',
    ip = '203.0.113.7',
    to = current,
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

export const consent = { terms: true, adult: true };

interface OtpEvent {
  _id: string;
  type: string;
  envelope: {
    data: { challengeId: string; email: string; app: string; purpose: string; sealedCode: string };
  };
}

export const events = (challengeId: string, to = current) =>
  to.runtime.mongo.db
    .collection<OtpEvent>(OUTBOX)
    .find({ 'envelope.data.challengeId': challengeId })
    .sort({ _id: 1 })
    .toArray();

/** The code notify would email: the latest event of the challenge, opened with the shared key. */
export async function codeOf(challengeId: string, to = current): Promise<string> {
  const event = (await events(challengeId, to)).at(-1);
  if (!event) throw new Error('no code was sent');
  const keys = otpKeysOf.get(to);
  if (!keys) throw new Error('unknown identity');
  return decryptField(keys, event.envelope.data.sealedCode, otpSealContext(challengeId));
}

export interface ChallengeView {
  challengeId: string;
  expiresAt: string;
  resendAfter: string;
  resendsLeft: number;
}

/** A sign-up code for an email (a sign-up app, with the consent). */
export async function signUpCode(address: string, app = 'customer'): Promise<ChallengeView> {
  const answer = await post('/auth/sign-up/code', { email: address, consent }, { app });
  expect(answer.status, JSON.stringify(answer.body)).toBe(200);
  return answer.body.data as unknown as ChallengeView;
}

/** A password code for an email (any app). */
export async function passwordCode(address: string, app = 'customer'): Promise<ChallengeView> {
  const answer = await post('/auth/password/code', { email: address }, { app });
  expect(answer.status, JSON.stringify(answer.body)).toBe(200);
  return answer.body.data as unknown as ChallengeView;
}

/** The right code of a challenge, with a password. */
export const verify = async (challengeId: string, password = PASSWORD, app = 'customer') =>
  post(`/auth/otp/${challengeId}/verify`, { code: await codeOf(challengeId), password }, { app });

/** A new account with a password, made in the customer app. */
export async function makeAccount(address: string, password = PASSWORD): Promise<string> {
  const made = await verify((await signUpCode(address)).challengeId, password);
  expect(made.status, JSON.stringify(made.body)).toBe(200);
  return String(made.body.data?.userId);
}

/** Moves a challenge's resend wait into the past (instead of waiting a minute). */
export const allowResend = (challengeId: string, to = current) =>
  to.runtime.redis.client.hset(challengeKey(challengeId), 'resendAfter', '0');

export const users = (to = current) => to.runtime.mongo.db.collection<User>(USERS);
export const acceptances = (to = current) =>
  to.runtime.mongo.db.collection<LegalAcceptance>(LEGAL_ACCEPTANCES);
export const credentials = (to = current) =>
  to.runtime.mongo.db.collection<Credentials>(CREDENTIALS);
export const providers = (to = current) =>
  to.runtime.mongo.db.collection<AuthProvider>(AUTH_PROVIDERS);
