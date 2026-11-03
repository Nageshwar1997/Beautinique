// Shared by identity's tests: identity on the local MongoDB replica set and Valkey (`npm run
// infra:up`), in a database and BullMQ prefix of its own, with a stand-in for Have I Been Pwned
// (tests never reach the internet). The test plays notify: it opens the sealed code from
// identity's outbox, as notify does from the event.
import { createHash, randomUUID } from 'node:crypto';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

import { decryptField, generateKey, loadSealingKeys } from '@beautinique/backend-server-crypto';
import {
  createLogger,
  LOOPBACK_HOST,
  type PassportSigner,
  passportSigner,
} from '@beautinique/backend-server-kit';
import { connectMongo, withTransaction } from '@beautinique/backend-server-mongo';
import { OUTBOX } from '@beautinique/backend-server-queue';
import { APPS, otpSealContext } from '@beautinique/shared-contracts';
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
import { giveSystemGrant, type GrantRecord, GRANTS } from '../src/rbac/grants.ts';
import { ROLE_SEEDS } from '../src/rbac/roles.ts';
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
  await new Promise<void>((resolve) => server.listen(0, LOOPBACK_HOST, resolve));
  return {
    url: `http://${LOOPBACK_HOST}:${String((server.address() as AddressInfo).port)}`,
    server,
  };
}

export interface Harness {
  server: RunningIdentity;
  runId: string;
  prefix: string;
  /** Signs passports the way the gateway does (identity has its public key) */
  passport: PassportSigner;
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
  const passport = passportSigner();
  const startOne = (more: Record<string, string> = {}) =>
    start(readConfig({ env: env(more) }), {
      port: 0,
      host: LOOPBACK_HOST,
      handleSignals: false,
      runtime: { queuePrefix: prefix, epochKey: `${prefix}:epoch`, pollMs: 100 },
      passportJwks: passport.jwks,
    });
  const server = await startOne();
  otpKeysOf.set(server, loadSealingKeys(otpEventKeys));
  current = server;
  return {
    server,
    runId,
    passport,
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

/**
 * Gives a role as identity itself does (no appointer), in the role's widest scope: global where it
 * may, else self, else a made-up id. True when it was new.
 */
export async function giveRole(userId: string, role: string, to = current): Promise<boolean> {
  const seed = ROLE_SEEDS.find((one) => one.key === role);
  if (!seed) throw new Error(`no role ${role}`);
  const type = seed.scopeTypes[0] ?? 'self';
  const scope = seed.scopeTypes.includes('global')
    ? { type: 'global' as const, ids: [] }
    : { type, ids: [type === 'self' ? userId : `${type}-1`] };
  const { mongo } = to.runtime;
  return withTransaction(mongo, (session) =>
    giveSystemGrant(mongo, session, {
      userId,
      role,
      app: seed.app,
      scope,
      via: 'migration',
      now: new Date(),
    }),
  );
}

/**
 * A role in every app, so the account can sign in anywhere: one that does not ask for an
 * authenticator where the app has one (seller: not the Account Owner), else the main role.
 */
export async function giveEveryApp(userId: string, to = current): Promise<void> {
  for (const app of APPS) {
    const own = ROLE_SEEDS.filter((seed) => seed.app === app && !seed.signUp);
    const role = own.find((seed) => !seed.mfaRequired) ?? own.find((seed) => seed.main);
    if (role) await giveRole(userId, role.key, to);
  }
}

/**
 * A new account with a password, made in the customer app. `everyApp` (default): it also holds
 * every app's main role, so a test of something else can sign in anywhere.
 */
export async function makeAccount(
  address: string,
  password = PASSWORD,
  { everyApp = true }: { everyApp?: boolean } = {},
): Promise<string> {
  const made = await verify((await signUpCode(address)).challengeId, password);
  expect(made.status, JSON.stringify(made.body)).toBe(200);
  const userId = String(made.body.data?.userId);
  if (everyApp) await giveEveryApp(userId);
  return userId;
}

/** Moves a challenge's resend wait into the past (instead of waiting a minute). */
export const allowResend = (challengeId: string, to = current) =>
  to.runtime.redis.client.hset(challengeKey(challengeId), 'resendAfter', '0');

export const users = (to = current) => to.runtime.mongo.db.collection<User>(USERS);
export const grants = (to = current) => to.runtime.mongo.db.collection<GrantRecord>(GRANTS);
export const acceptances = (to = current) =>
  to.runtime.mongo.db.collection<LegalAcceptance>(LEGAL_ACCEPTANCES);
export const credentials = (to = current) =>
  to.runtime.mongo.db.collection<Credentials>(CREDENTIALS);
export const providers = (to = current) =>
  to.runtime.mongo.db.collection<AuthProvider>(AUTH_PROVIDERS);
