// The authenticator from the account's own settings (ARCHITECTURE §9.2, owner 2026-10-31): set
// up, replace (a new phone), new recovery codes, turn off, the step-up with a recovery code, the
// security events and /iam/me. Against the local MongoDB replica set and Valkey (`npm run infra:up`).
import { totpCode } from '@beautinique/backend-server-crypto';
import { OUTBOX } from '@beautinique/backend-server-queue';
import type { AppId } from '@beautinique/shared-contracts';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { setupKey } from '../src/authenticator.ts';
import { ROLES } from '../src/rbac/sync.ts';
import { type Session, SESSIONS } from '../src/sessions.ts';
import {
  type Answer,
  credentials,
  giveRole,
  grants,
  type Harness,
  makeAccount,
  PASSWORD,
  startHarness,
} from './helpers.ts';

let harness: Harness;
const email = (name: string) => `${name}-${harness.runId}@beautinique.example`;
const db = () => harness.server.runtime.mongo.db;
const redis = () => harness.server.runtime.redis.client;

beforeAll(async () => {
  harness = await startHarness('authenticator');
});

afterAll(async () => {
  await harness.stop();
});

interface Passport {
  userId: string;
  sessionId: string;
}

interface Raw extends Answer {
  cookies: Map<string, string>;
}

/** A request as the gateway sends it: the app, the client IP and (signed in) a passport. */
async function send(
  method: 'GET' | 'POST' | 'DELETE',
  path: string,
  { app = 'customer', body, passport }: { app?: AppId; body?: unknown; passport?: Passport } = {},
): Promise<Raw> {
  const headers: Record<string, string> = {
    'X-BQ-App': app,
    'X-BQ-Client-Ip': '203.0.113.9',
  };
  if (body !== undefined) headers['content-type'] = 'application/json';
  if (passport) {
    headers['X-BQ-Passport'] = harness.passport.sign(
      { ...passport, app, methods: ['password'], authzVersion: 0 },
      'bq:identity',
    );
  }
  const response = await fetch(`${harness.server.url}${path}`, {
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

const errorOf = (raw: Raw) => [raw.status, raw.body.error?.code];
const codesOf = (raw: Raw) => (raw.body.data as { recoveryCodes: string[] }).recoveryCodes;

/** A customer signed in with the password only: the account and this session. */
async function signedInCustomer(name: string) {
  const address = email(name);
  const userId = await makeAccount(address, PASSWORD, { everyApp: false });
  const signedIn = await send('POST', '/auth/login', {
    body: { email: address, password: PASSWORD },
  });
  expect(signedIn.body.data?.next).toBe('signed-in');
  const token = signedIn.cookies.get('__Host-bq_customer_at') ?? '';
  const { sid } = JSON.parse(Buffer.from(token.split('.')[1] ?? '', 'base64url').toString()) as {
    sid: string;
  };
  return { address, userId, passport: { userId, sessionId: sid } };
}

/**
 * A signed-in customer who set up the authenticator from their settings: its secret, the time
 * its first code was for (one more code, at + 30 s, is left in the window), and the 10 codes.
 */
async function customerWithAuthenticator(name: string) {
  const customer = await signedInCustomer(name);
  const enroll = await send('POST', '/auth/authenticator/enroll', { passport: customer.passport });
  expect(enroll.status, JSON.stringify(enroll.body)).toBe(200);
  const { secret } = enroll.body.data as { secret: string };
  const at = Date.now();
  const confirmed = await send('POST', '/auth/authenticator/confirm', {
    passport: customer.passport,
    body: { code: totpCode(secret, at), password: PASSWORD },
  });
  expect(confirmed.status, JSON.stringify(confirmed.body)).toBe(200);
  return { ...customer, secret, at, recoveryCodes: codesOf(confirmed) };
}

/** The account's authenticator events in the outbox, oldest first. */
const changesOf = async (userId: string) =>
  (
    await db()
      .collection<{ type: string; envelope: { data: Record<string, unknown> } }>(OUTBOX)
      .find({ type: 'identity.authenticator.changed', 'envelope.data.userId': userId })
      .sort({ _id: 1 })
      .toArray()
  ).map((event) => event.envelope.data);

const meOf = async (passport: Passport) =>
  (await send('GET', '/iam/me', { passport })).body.data?.user as {
    authenticator: boolean;
    recoveryCodesLeft: number | null;
  };

const stepUp = (passport: Passport, body: { code: string } | { recoveryCode: string }) =>
  send('POST', '/auth/step-up', { passport, body });

describe('setting up the authenticator, signed in', () => {
  it('saves it with the password and the first code, gives 10 codes once, and tells the person', async () => {
    const { address, userId, passport } = await signedInCustomer('setup');
    expect(await meOf(passport)).toMatchObject({ authenticator: false, recoveryCodesLeft: null });

    const enroll = await send('POST', '/auth/authenticator/enroll', { passport });
    expect(enroll.status).toBe(200);
    const { secret, uri } = enroll.body.data as { secret: string; uri: string };
    expect(uri).toContain('issuer=Beautinique');
    expect(decodeURIComponent(uri)).toContain(address);
    // waits sealed in Redis for 10 minutes, never in the clear
    const key = setupKey(passport.sessionId);
    expect(await redis().hget(key, 'secret')).not.toContain(secret);
    expect(await redis().pttl(key)).toBeGreaterThan(9 * 60_000);

    const code = totpCode(secret, Date.now());
    const wrongPassword = await send('POST', '/auth/authenticator/confirm', {
      passport,
      body: { code, password: 'not the password at all' },
    });
    expect(errorOf(wrongPassword)).toEqual([400, 'PASSWORD_INVALID']);
    const wrongCode = await send('POST', '/auth/authenticator/confirm', {
      passport,
      body: { code: '000000', password: PASSWORD },
    });
    expect(errorOf(wrongCode)).toEqual([400, 'TOTP_INVALID']);
    expect(wrongCode.body.error?.message).toContain('3 more tries');
    expect((await credentials().findOne({ _id: userId }))?.totp).toBeUndefined();

    const confirmed = await send('POST', '/auth/authenticator/confirm', {
      passport,
      body: { code, password: PASSWORD },
    });
    expect(confirmed.status, JSON.stringify(confirmed.body)).toBe(200);
    const codes = codesOf(confirmed);
    expect(codes).toHaveLength(10);
    expect(new Set(codes).size).toBe(10);
    // only hashes kept; the set-up is gone, so the same confirm never works twice
    const stored = await credentials().findOne({ _id: userId });
    expect(stored?.totp?.secret).not.toContain(secret);
    expect(JSON.stringify(stored?.recoveryCodes)).not.toContain(codes[0]?.replace('-', ''));
    expect(await redis().exists(key)).toBe(0);
    const again = await send('POST', '/auth/authenticator/confirm', {
      passport,
      body: { code, password: PASSWORD },
    });
    expect(errorOf(again)).toEqual([400, 'AUTHENTICATOR_SETUP_EXPIRED']);

    expect(await meOf(passport)).toMatchObject({ authenticator: true, recoveryCodesLeft: 10 });
    const [change, ...more] = await changesOf(userId);
    expect(more).toEqual([]);
    expect(change).toMatchObject({ email: address, change: 'enabled', app: 'customer' });
    expect(typeof change?.device).toBe('string');
    // the session goes on; the next sign-in, in any app, asks for the code
    const session = await db().collection<Session>(SESSIONS).findOne({ _id: passport.sessionId });
    expect(session?.revokedAt).toBeNull();
    const next = await send('POST', '/auth/login', {
      body: { email: address, password: PASSWORD },
    });
    expect(next.body.data?.next).toBe('totp');
  });

  it('ends a set-up after 5 wrong tries, each counted toward the account lock', async () => {
    const { address, passport } = await signedInCustomer('tries');
    const wrong = () =>
      send('POST', '/auth/authenticator/confirm', {
        passport,
        body: { code: '000000', password: 'wrong password here' },
      });
    for (let round = 0; round < 2; round += 1) {
      expect((await send('POST', '/auth/authenticator/enroll', { passport })).status).toBe(200);
      for (let attempt = 1; attempt < 5; attempt += 1) {
        expect(errorOf(await wrong())).toEqual([400, 'PASSWORD_INVALID']);
      }
      expect(errorOf(await wrong())).toEqual([400, 'AUTHENTICATOR_SETUP_EXPIRED']);
      expect(errorOf(await wrong())).toEqual([400, 'AUTHENTICATOR_SETUP_EXPIRED']);
    }
    // 10 wrong tries lock the account: even the right password does not sign in for an hour
    const locked = await send('POST', '/auth/login', {
      body: { email: address, password: PASSWORD },
    });
    expect(errorOf(locked)).toEqual([401, 'INVALID_CREDENTIALS']);
    expect((await send('POST', '/auth/authenticator/enroll', { passport })).status).toBe(200);
    const refused = await send('POST', '/auth/authenticator/confirm', {
      passport,
      body: { code: '000000', password: PASSWORD },
    });
    expect(errorOf(refused)).toEqual([400, 'TOTP_INVALID']);
    expect(refused.body.error?.message).toContain('in an hour');
  });

  it('asks an account without a password to set one first', async () => {
    const { userId, passport } = await signedInCustomer('no-password');
    await credentials().updateOne({ _id: userId }, { $unset: { password: '' } });
    expect(errorOf(await send('POST', '/auth/authenticator/enroll', { passport }))).toEqual([
      400,
      'PASSWORD_REQUIRED',
    ]);
  });

  it('answers an ended session like an ended session', async () => {
    const { passport } = await signedInCustomer('ended');
    await db()
      .collection<Session>(SESSIONS)
      .updateOne({ _id: passport.sessionId }, { $set: { revokedAt: new Date() } });
    for (const [method, path] of [
      ['POST', '/auth/authenticator/enroll'],
      ['POST', '/auth/authenticator/recovery-codes'],
      ['DELETE', '/auth/authenticator'],
    ] as const) {
      expect(errorOf(await send(method, path, { passport })), path).toEqual([
        401,
        'SESSION_EXPIRED',
      ]);
    }
  });
});

describe('the step-up with a recovery code', () => {
  it('spends one code and counts what is left; a wrong or used one counts toward the lock', async () => {
    const { passport, recoveryCodes } = await customerWithAuthenticator('recovery-step');
    const [first = '', second = ''] = recoveryCodes;
    const stepped = await stepUp(passport, { recoveryCode: first.toLowerCase() });
    expect(stepped.status, JSON.stringify(stepped.body)).toBe(200);
    expect(stepped.body.data?.recoveryCodesLeft).toBe(9);
    expect(stepped.cookies.has('__Host-bq_customer_at')).toBe(true);
    expect(errorOf(await stepUp(passport, { recoveryCode: first }))).toEqual([
      400,
      'RECOVERY_CODE_INVALID',
    ]);
    expect(errorOf(await stepUp(passport, { recoveryCode: 'AAAAA-AAAAA' }))).toEqual([
      400,
      'RECOVERY_CODE_INVALID',
    ]);
    expect((await stepUp(passport, { recoveryCode: second })).body.data?.recoveryCodesLeft).toBe(8);
    expect((await meOf(passport)).recoveryCodesLeft).toBe(8);
    const session = await db().collection<Session>(SESSIONS).findOne({ _id: passport.sessionId });
    expect(session?.stepUpAt?.getTime()).toBeGreaterThan(Date.now() - 10_000);
  });

  it('answers an authenticator code with no recovery codes left', async () => {
    const { passport, secret, at } = await customerWithAuthenticator('code-step');
    const stepped = await stepUp(passport, { code: totpCode(secret, at + 30_000) });
    expect(stepped.status, JSON.stringify(stepped.body)).toBe(200);
    expect(stepped.body.data?.recoveryCodesLeft).toBeNull();
  });
});

describe('replacing the authenticator (a new phone)', () => {
  it('needs a step-up, then swaps the secret and the codes, and tells the person', async () => {
    const { userId, passport, secret, at, recoveryCodes } =
      await customerWithAuthenticator('replace');
    expect(errorOf(await send('POST', '/auth/authenticator/enroll', { passport }))).toEqual([
      401,
      'STEP_UP_REQUIRED',
    ]);
    // the phone is lost: a recovery code steps up
    const [lost = '', spent = ''] = recoveryCodes;
    expect((await stepUp(passport, { recoveryCode: lost })).status).toBe(200);
    const enroll = await send('POST', '/auth/authenticator/enroll', { passport });
    expect(enroll.status).toBe(200);
    const fresh = (enroll.body.data as { secret: string }).secret;
    expect(fresh).not.toBe(secret);
    const confirmed = await send('POST', '/auth/authenticator/confirm', {
      passport,
      body: { code: totpCode(fresh, Date.now()), password: PASSWORD },
    });
    expect(confirmed.status, JSON.stringify(confirmed.body)).toBe(200);
    expect(await meOf(passport)).toMatchObject({ recoveryCodesLeft: 10 });
    expect((await changesOf(userId)).map((c) => c.change)).toEqual(['enabled', 'replaced']);
    // the old phone and the old codes no longer work
    expect(errorOf(await stepUp(passport, { code: totpCode(secret, at + 30_000) }))).toEqual([
      400,
      'TOTP_INVALID',
    ]);
    expect(errorOf(await stepUp(passport, { recoveryCode: spent }))).toEqual([
      400,
      'RECOVERY_CODE_INVALID',
    ]);
    const [newCode = ''] = codesOf(confirmed);
    expect((await stepUp(passport, { recoveryCode: newCode })).status).toBe(200);
  });

  it('never overwrites one saved meanwhile by a set-up that did not replace', async () => {
    const { userId, passport } = await signedInCustomer('race');
    const enroll = await send('POST', '/auth/authenticator/enroll', { passport });
    const { secret } = enroll.body.data as { secret: string };
    // another tab saved one in between
    await credentials().updateOne(
      { _id: userId },
      { $set: { totp: { secret: 'other', enrolledAt: new Date(), lastStep: 0 } } },
    );
    const confirmed = await send('POST', '/auth/authenticator/confirm', {
      passport,
      body: { code: totpCode(secret, Date.now()), password: PASSWORD },
    });
    expect(errorOf(confirmed)).toEqual([409, 'AUTHENTICATOR_EXISTS']);
    expect((await credentials().findOne({ _id: userId }))?.totp?.secret).toBe('other');
    expect(await changesOf(userId)).toEqual([]);
  });
});

describe('new recovery codes', () => {
  it('need a step-up; the old codes stop working and the person is told', async () => {
    const { userId, passport, secret, at, recoveryCodes } =
      await customerWithAuthenticator('renew');
    expect(errorOf(await send('POST', '/auth/authenticator/recovery-codes', { passport }))).toEqual(
      [401, 'STEP_UP_REQUIRED'],
    );
    expect((await stepUp(passport, { code: totpCode(secret, at + 30_000) })).status).toBe(200);
    const renewed = await send('POST', '/auth/authenticator/recovery-codes', { passport });
    expect(renewed.status, JSON.stringify(renewed.body)).toBe(200);
    const codes = codesOf(renewed);
    expect(codes).toHaveLength(10);
    expect(codes).not.toContain(recoveryCodes[0]);
    expect(await meOf(passport)).toMatchObject({ recoveryCodesLeft: 10 });
    expect((await changesOf(userId)).map((c) => c.change)).toEqual(['enabled', 'recovery-codes']);
    expect(errorOf(await stepUp(passport, { recoveryCode: recoveryCodes[1] ?? '' }))).toEqual([
      400,
      'RECOVERY_CODE_INVALID',
    ]);
    expect((await stepUp(passport, { recoveryCode: codes[0] ?? '' })).status).toBe(200);
  });

  it('a step-up older than 5 minutes no longer counts', async () => {
    const { passport, recoveryCodes } = await customerWithAuthenticator('stale');
    expect((await stepUp(passport, { recoveryCode: recoveryCodes[0] ?? '' })).status).toBe(200);
    await db()
      .collection<Session>(SESSIONS)
      .updateOne(
        { _id: passport.sessionId },
        { $set: { stepUpAt: new Date(Date.now() - 301_000) } },
      );
    expect(errorOf(await send('POST', '/auth/authenticator/recovery-codes', { passport }))).toEqual(
      [401, 'STEP_UP_REQUIRED'],
    );
  });
});

describe('turning the authenticator off', () => {
  it('needs a step-up, removes it with its codes, keeps the sessions and tells the person', async () => {
    const { address, userId, passport, recoveryCodes } = await customerWithAuthenticator('off');
    expect(errorOf(await send('DELETE', '/auth/authenticator', { passport }))).toEqual([
      401,
      'STEP_UP_REQUIRED',
    ]);
    expect((await stepUp(passport, { recoveryCode: recoveryCodes[0] ?? '' })).status).toBe(200);
    const off = await send('DELETE', '/auth/authenticator', { passport });
    expect(off.status, JSON.stringify(off.body)).toBe(200);
    expect(off.body.data).toEqual({ disabled: true });
    const stored = await credentials().findOne({ _id: userId });
    expect(stored?.totp).toBeUndefined();
    expect(stored?.recoveryCodes).toBeUndefined();
    expect(stored?.password).toBeDefined();
    expect(await meOf(passport)).toMatchObject({ authenticator: false, recoveryCodesLeft: null });
    expect((await changesOf(userId)).map((c) => c.change)).toEqual(['enabled', 'disabled']);
    const session = await db().collection<Session>(SESSIONS).findOne({ _id: passport.sessionId });
    expect(session?.revokedAt).toBeNull();
    // nothing left to turn off: no change, no email; no new codes without one either
    const again = await send('DELETE', '/auth/authenticator', { passport });
    expect(again.body.data).toEqual({ disabled: false });
    expect(errorOf(await send('POST', '/auth/authenticator/recovery-codes', { passport }))).toEqual(
      [400, 'AUTHENTICATOR_REQUIRED'],
    );
    expect(await changesOf(userId)).toHaveLength(2);
    // the password alone signs in again
    const next = await send('POST', '/auth/login', {
      body: { email: address, password: PASSWORD },
    });
    expect(next.body.data?.next).toBe('signed-in');
  });

  it('stays on while a role needs it, and names those roles; an ended grant no longer counts', async () => {
    const { userId, passport, recoveryCodes } = await customerWithAuthenticator('roles');
    await giveRole(userId, 'seller.finance');
    await giveRole(userId, 'admin.state_admin');
    expect((await stepUp(passport, { recoveryCode: recoveryCodes[0] ?? '' })).status).toBe(200);
    const refused = await send('DELETE', '/auth/authenticator', { passport });
    expect(errorOf(refused)).toEqual([409, 'AUTHENTICATOR_REQUIRED_BY_ROLE']);
    expect(refused.body.error?.message).toBe(
      "Your State Admin role in the admin app, Seller Finance role in the seller app need an authenticator, so it can't be turned off.",
    );
    expect(refused.body.error?.details).toEqual([
      { path: ['roles', 'admin'], message: 'State Admin' },
      { path: ['roles', 'seller'], message: 'Seller Finance' },
    ]);
    expect((await credentials().findOne({ _id: userId }))?.totp).toBeDefined();

    await grants().updateMany({ userId, role: 'admin.state_admin' }, { $set: { active: false } });
    const one = await send('DELETE', '/auth/authenticator', { passport });
    expect(one.body.error?.message).toBe(
      "Your Seller Finance role in the seller app needs an authenticator, so it can't be turned off.",
    );
    // a retired role no longer counts, as at sign-in
    const roles = db().collection<{ _id: string; retired: boolean }>(ROLES);
    await roles.updateOne({ _id: 'seller.finance' }, { $set: { retired: true } });
    try {
      expect((await send('DELETE', '/auth/authenticator', { passport })).body.data).toEqual({
        disabled: true,
      });
    } finally {
      await roles.updateOne({ _id: 'seller.finance' }, { $set: { retired: false } });
    }
  });
});
