// Sign-in with email + password, the authenticator (TOTP) and recovery codes, against the local
// MongoDB replica set and Valkey (`npm run infra:up`). See helpers.ts.
import { argon2, randomBytes } from 'node:crypto';

import { totpCode } from '@beautinique/backend-server-crypto';
import { uuidv7 } from '@beautinique/shared-utils';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { ACCOUNT_LOCK_MS, emailIndex, LOCK_MS, lockKey } from '../src/lockout.ts';
import { ENROLL_TTL_MS, LOGIN_TTL_MS, loginKey } from '../src/login.ts';
import {
  type Answer,
  BREACHED,
  credentials,
  type Harness,
  hibp,
  makeAccount,
  PASSWORD,
  passwordCode,
  post,
  providers,
  startHarness,
  users,
  verify,
} from './helpers.ts';

let harness: Harness;
const email = (name: string) => `${name}-${harness.runId}@beautinique.example`;
const redis = () => harness.server.runtime.redis.client;

beforeAll(async () => {
  harness = await startHarness('login');
});

afterAll(async () => {
  await harness.stop();
});

const login = (address: string, password = PASSWORD, app = 'customer') =>
  post('/auth/login', { email: address, password }, { app });

const step = (answer: Answer) =>
  answer.body.data as { next: string; loginId?: string; user?: { userId: string; email: string } };

/**
 * An account with the authenticator set up through the admin app: its secret, the time its first
 * code was for (one more code, at + 30 s, is left in the window), and the codes.
 */
async function withAuthenticator(name: string) {
  const address = email(name);
  const userId = await makeAccount(address);
  const first = step(await login(address, PASSWORD, 'admin'));
  expect(first.next).toBe('totp-enroll');
  const loginId = String(first.loginId);
  const enroll = await post(`/auth/login/${loginId}/totp/enroll`, {}, { app: 'admin' });
  const { secret } = enroll.body.data as { secret: string; uri: string };
  const at = Date.now();
  const confirmed = await post(
    `/auth/login/${loginId}/totp/confirm`,
    { code: totpCode(secret, at) },
    { app: 'admin' },
  );
  expect(confirmed.status, JSON.stringify(confirmed.body)).toBe(200);
  const { recoveryCodes } = confirmed.body.data as { recoveryCodes: string[] };
  return { address, userId, secret, at, recoveryCodes, enroll: enroll.body.data, confirmed };
}

describe('email + password', () => {
  it('signs in to every app without an authenticator, trimming the password like a new one', async () => {
    const address = email('riya');
    const userId = await makeAccount(address);
    for (const app of ['customer', 'seller', 'creator', 'delivery']) {
      const answer = await login(address, `  ${PASSWORD} `, app);
      expect(answer.status, app).toBe(200);
      expect(step(answer)).toEqual({ next: 'signed-in', user: { userId, email: address } });
    }
    expect(
      (await providers().findOne({ userId, provider: 'password' }))?.lastUsedAt,
    ).toBeInstanceOf(Date);
  });

  it('answers a wrong password, an unknown email and an account without a password alike', async () => {
    const address = email('meera');
    await makeAccount(address);
    const googleOnly = email('google');
    const now = new Date();
    await users().insertOne({
      _id: uuidv7(),
      email: googleOnly,
      status: 'active',
      emailVerifiedAt: now,
      ageDeclaredAt: null,
      signUpApp: 'customer',
      createdAt: now,
      updatedAt: now,
    });
    const answers = [
      await login(address, 'not the password at all'),
      await login(email('nobody'), PASSWORD),
      await login(googleOnly, PASSWORD),
    ];
    for (const answer of answers) {
      expect([answer.status, answer.body.error?.code]).toEqual([401, 'INVALID_CREDENTIALS']);
      expect(answer.body.error?.message).toBe('The email or password is not right.');
    }
    const empty = await login(address, '   ');
    expect(empty.body.error?.code).toBe('VALIDATION_FAILED');
  });

  it('locks an account for an hour after 10 wrong tries, even for the right password; a new password lifts it', async () => {
    const address = email('locked');
    await makeAccount(address);
    await makeAccount(email('neighbour'));
    for (let i = 0; i < 9; i += 1) {
      expect((await login(address, 'wrong password!')).status).toBe(401);
    }
    expect((await login(address)).status).toBe(200);
    // the count started again after the right one: 10 wrong in a row now
    for (let i = 0; i < 10; i += 1) await login(address, 'wrong password!');
    const locked = await login(address);
    expect([locked.status, locked.body.error?.code]).toEqual([401, 'INVALID_CREDENTIALS']);
    const key = lockKey(emailIndex(harness.server.runtime.otp.keys, address));
    expect(await redis().pttl(key)).toBeGreaterThan(LOCK_MS - 60_000);
    expect(key).not.toContain('locked');
    // another account is not touched
    expect((await login(email('neighbour'))).status).toBe(200);
    // a password set with an email code lifts the lock
    await verify((await passwordCode(address)).challengeId, 'my new longer password');
    expect((await login(address, 'my new longer password')).status).toBe(200);
    expect((await login(address)).status).toBe(401);
  });

  it('stores a password kept with older settings again with today’s at the next sign-in', async () => {
    const address = email('rehash');
    const userId = await makeAccount(address);
    const salt = randomBytes(16);
    const key = await new Promise<Buffer>((resolve, reject) => {
      argon2(
        'argon2id',
        { message: PASSWORD, nonce: salt, parallelism: 1, tagLength: 32, memory: 8192, passes: 1 },
        (error, derived) => {
          if (error) reject(error);
          else resolve(derived);
        },
      );
    });
    const b64 = (bytes: Buffer) => bytes.toString('base64').replace(/=+$/, '');
    const old = `$argon2id$v=19$m=8192,t=1,p=1$${b64(salt)}$${b64(key)}`;
    await credentials().updateOne({ _id: userId }, { $set: { 'password.hash': old } });
    expect((await login(address)).status).toBe(200);
    const hash = (await credentials().findOne({ _id: userId }))?.password?.hash;
    expect(hash).toMatch(/^\$argon2id\$v=19\$m=19456,t=2,p=1\$/);
    expect((await login(address)).status).toBe(200);
  });

  it('refuses with 503 when Redis is away (wrong tries cannot be counted)', async () => {
    const cut = await harness.start();
    try {
      cut.runtime.redis.client.disconnect();
      const answer = await post(
        '/auth/login',
        { email: email('riya'), password: PASSWORD },
        { to: cut },
      );
      expect([answer.status, answer.body.error?.code]).toEqual([503, 'SERVICE_UNAVAILABLE']);
    } finally {
      await cut.stop();
    }
  });
});

describe('the lock, per IP and for the account (DR-003)', () => {
  const tryFrom = (address: string, ip: string, password = 'wrong password!') =>
    post('/auth/login', { email: address, password }, { ip });

  it('locks the IP that made 10 wrong tries for an hour; the owner signs in from another', async () => {
    const address = email('lock-ip');
    await makeAccount(address);
    for (let i = 0; i < 10; i += 1) {
      expect((await tryFrom(address, '198.51.100.20')).status).toBe(401);
    }
    // that IP: the right password answers like a wrong one
    const locked = await tryFrom(address, '198.51.100.20', PASSWORD);
    expect([locked.status, locked.body.error?.code]).toEqual([401, 'INVALID_CREDENTIALS']);
    // one IPv6 home (/64) counts as one IP
    for (let i = 0; i < 10; i += 1) await tryFrom(address, `2001:db8:7:1::${String(i + 1)}`);
    expect((await tryFrom(address, '2001:db8:7:1::99', PASSWORD)).status).toBe(401);
    // the owner, elsewhere, is not locked out
    expect((await tryFrom(address, '203.0.113.60', PASSWORD)).status).toBe(200);
    const lock = await redis().hgetall(
      lockKey(emailIndex(harness.server.runtime.otp.keys, address)),
    );
    expect(Number(lock['198.51.100.20']) - Date.now()).toBeGreaterThan(LOCK_MS - 60_000);
  });

  it('locks the whole account for 15 minutes after 50 wrong tries from every IP together', async () => {
    const address = email('lock-all');
    await makeAccount(address);
    // 6 IPs with 9 each: no IP reaches its own 10, the account reaches 50
    for (let ipNo = 0; ipNo < 6; ipNo += 1) {
      for (let i = 0; i < 9; i += 1) await tryFrom(address, `198.51.100.${String(30 + ipNo)}`);
    }
    const anywhere = await tryFrom(address, '203.0.113.61', PASSWORD);
    expect([anywhere.status, anywhere.body.error?.code]).toEqual([401, 'INVALID_CREDENTIALS']);
    const lock = await redis().hgetall(
      lockKey(emailIndex(harness.server.runtime.otp.keys, address)),
    );
    const left = Number(lock['*']) - Date.now();
    expect(left).toBeGreaterThan(ACCOUNT_LOCK_MS - 60_000);
    expect(left).toBeLessThanOrEqual(ACCOUNT_LOCK_MS);
  });

  it('does not make a lock longer with the tries during it', async () => {
    const address = email('lock-steady');
    await makeAccount(address);
    for (let i = 0; i < 10; i += 1) await tryFrom(address, '198.51.100.40');
    const key = lockKey(emailIndex(harness.server.runtime.otp.keys, address));
    const until = (await redis().hget(key, '198.51.100.40')) ?? '';
    // 20 more tries from that IP while it is locked: the lock still ends when it would have
    for (let i = 0; i < 20; i += 1) await tryFrom(address, '198.51.100.40');
    expect(await redis().hget(key, '198.51.100.40')).toBe(until);
    // and they did not count toward the account's 50
    expect(await redis().hget(key, '*')).toBeNull();
  });
});

describe('the password hashes of every IP together (DR-004)', () => {
  const at = (to: Harness['server']) => (address: string, password: string) =>
    post('/auth/login', { email: address, password }, { to });

  it('spend one budget a minute: past it, every sign-in is 503 until it fills again', async () => {
    const busy = await harness.start({ IDENTITY__LOGIN_HASHES_PER_MINUTE: '3' });
    try {
      const login3 = at(busy);
      for (let i = 0; i < 3; i += 1) {
        expect((await login3(email(`budget${String(i)}`), 'wrong password!')).status).toBe(401);
      }
      // the fourth, from anyone (here the right password of a real account), waits for the budget
      const address = email('budget-owner');
      await makeAccount(address);
      const refused = await login3(address, PASSWORD);
      expect([refused.status, refused.body.error?.code]).toEqual([503, 'SERVICE_UNAVAILABLE']);
      expect(refused.body.error?.message).toBe(
        'Too many sign-ins right now. Please try again in a moment.',
      );
      // a minute's budget: a second later it has not filled again (one more every 20 s)
      await new Promise((resolve) => setTimeout(resolve, 1100));
      expect((await login3(address, PASSWORD)).status).toBe(503);
    } finally {
      await busy.stop();
    }
  });

  it('answer a locked account without a hash, so a lock costs the budget nothing', async () => {
    const address = email('locked-cheap');
    const neighbour = email('locked-cheap-neighbour');
    await makeAccount(address);
    await makeAccount(neighbour);
    const budgeted = await harness.start({ IDENTITY__LOGIN_HASHES_PER_MINUTE: '12' });
    try {
      const login12 = at(budgeted);
      // 10 wrong tries lock it: 10 hashes of the 12
      for (let i = 0; i < 10; i += 1) {
        expect((await login12(address, 'wrong password!')).status).toBe(401);
      }
      // locked: five more, the right password among them, answer like a wrong one and spend nothing
      for (const password of [
        PASSWORD,
        'wrong password!',
        'wrong password!',
        PASSWORD,
        'x'.repeat(12),
      ]) {
        const answer = await login12(address, password);
        expect([answer.status, answer.body.error?.code]).toEqual([401, 'INVALID_CREDENTIALS']);
      }
      // so the 11th hash is someone else's, who signs in
      expect((await login12(neighbour, PASSWORD)).status).toBe(200);
    } finally {
      await budgeted.stop();
    }
  });
});

describe('the authenticator', () => {
  it('is set up at the first sign-in of an internal app, with 10 recovery codes shown once', async () => {
    const { address, userId, secret, recoveryCodes, enroll, confirmed } =
      await withAuthenticator('staff');
    expect(secret).toMatch(/^[A-Z2-7]{32}$/);
    expect((enroll as { uri: string }).uri).toBe(
      `otpauth://totp/Beautinique:${encodeURIComponent(address)}?secret=${secret}&issuer=Beautinique&algorithm=SHA1&digits=6&period=30`,
    );
    expect(confirmed.body.data).toMatchObject({ user: { userId, email: address } });
    expect(recoveryCodes).toHaveLength(10);
    expect(new Set(recoveryCodes).size).toBe(10);
    for (const code of recoveryCodes) expect(code).toMatch(/^[A-Z2-7]{5}-[A-Z2-7]{5}$/);
    const saved = await credentials().findOne({ _id: userId });
    expect(saved?.totp?.secret).toMatch(/^v1\.k1\./);
    expect(JSON.stringify(saved)).not.toContain(secret);
    expect(JSON.stringify(saved)).not.toContain(recoveryCodes[0]?.replace('-', ''));
    expect(saved?.recoveryCodes?.every((c) => c.usedAt === null)).toBe(true);
    // every internal app asks for it
    for (const app of ['superadmin', 'master', 'support', 'finance', 'logistics', 'growth']) {
      const other = email(`staff-${app}`);
      await makeAccount(other);
      expect(step(await login(other, PASSWORD, app)).next, app).toBe('totp-enroll');
    }
  });

  it('then asks every app for a code, and each code works once', async () => {
    const { address, userId, secret, at } = await withAuthenticator('every-app');
    const first = step(await login(address));
    expect(first.next).toBe('totp');
    // the code that confirmed the set-up is spent (its own time: a fresh Date.now() can be the
    // next 30 s step, whose code is still unused)
    const spent = await post(`/auth/login/${String(first.loginId)}/totp`, {
      code: totpCode(secret, at),
    });
    expect(spent.body.error?.code).toBe('TOTP_INVALID');
    const next = totpCode(secret, at + 30_000);
    const signedIn = await post(`/auth/login/${String(first.loginId)}/totp`, { code: next });
    expect(signedIn.body.data).toEqual({ user: { userId, email: address } });
    // the same code in a new sign-in, and the finished sign-in, do not work again
    const again = step(await login(address, PASSWORD, 'seller'));
    const replay = await post(
      `/auth/login/${String(again.loginId)}/totp`,
      { code: next },
      { app: 'seller' },
    );
    expect(replay.body.error?.code).toBe('TOTP_INVALID');
    // an older code, still inside the window, does not work after a newer one either
    const older = await post(
      `/auth/login/${String(again.loginId)}/totp`,
      { code: totpCode(secret, at) },
      { app: 'seller' },
    );
    expect(older.body.error?.code).toBe('TOTP_INVALID');
    const finished = await post(`/auth/login/${String(first.loginId)}/totp`, { code: next });
    expect(finished.body.error?.code).toBe('LOGIN_EXPIRED');
  });

  it('takes each recovery code once, in any case and without the hyphen', async () => {
    const { address, userId, recoveryCodes } = await withAuthenticator('recovery');
    const code = String(recoveryCodes[3]);
    const first = step(await login(address));
    const used = await post(`/auth/login/${String(first.loginId)}/recovery`, {
      code: code.replace('-', '').toLowerCase(),
    });
    expect(used.body.data).toEqual({ user: { userId, email: address }, recoveryCodesLeft: 9 });
    const second = step(await login(address));
    const again = await post(`/auth/login/${String(second.loginId)}/recovery`, { code });
    expect([again.status, again.body.error?.code]).toEqual([400, 'RECOVERY_CODE_INVALID']);
    const other = await post(`/auth/login/${String(second.loginId)}/recovery`, {
      code: String(recoveryCodes[4]),
    });
    expect(other.body.data?.recoveryCodesLeft).toBe(8);
  });

  it('gives a sign-in 5 tries, 5 minutes, and only its own app and step', async () => {
    const { address, secret } = await withAuthenticator('steps');
    const { loginId } = step(await login(address));
    const id = String(loginId);
    expect(await redis().pttl(loginKey(id))).toBeGreaterThan(LOGIN_TTL_MS - 5_000);
    expect(await redis().pttl(loginKey(id))).toBeLessThanOrEqual(LOGIN_TTL_MS);
    const right = totpCode(secret, Date.now() + 30_000);
    const elsewhere = await post(`/auth/login/${id}/totp`, { code: right }, { app: 'seller' });
    expect(elsewhere.body.error?.code).toBe('LOGIN_EXPIRED');
    const wrongStage = await post(`/auth/login/${id}/totp/enroll`, {});
    expect(wrongStage.body.error?.code).toBe('LOGIN_EXPIRED');
    const wrong = right === '000000' ? '111111' : '000000';
    const messages: string[] = [];
    for (let i = 0; i < 4; i += 1) {
      const answer = await post(`/auth/login/${id}/totp`, { code: wrong });
      messages.push(answer.body.error?.message ?? '');
    }
    expect(messages).toEqual([
      'That authenticator code is not right. You have 4 more tries.',
      'That authenticator code is not right. You have 3 more tries.',
      'That authenticator code is not right. You have 2 more tries.',
      'That authenticator code is not right. You have 1 more try.',
    ]);
    const last = await post(`/auth/login/${id}/totp`, { code: wrong });
    expect(last.body.error?.code).toBe('LOGIN_EXPIRED');
    const late = await post(`/auth/login/${id}/totp`, { code: right });
    expect(late.body.error?.code).toBe('LOGIN_EXPIRED');
    expect(await redis().exists(loginKey(id))).toBe(0);
  });

  it('counts wrong authenticator codes toward the account lock', async () => {
    const { address, secret } = await withAuthenticator('totp-lock');
    const wrongFor = (code: string) => (code === '000000' ? '111111' : '000000');
    // 2 sign-ins × 5 wrong codes = 10 wrong tries
    for (let round = 0; round < 2; round += 1) {
      const { loginId } = step(await login(address));
      for (let i = 0; i < 5; i += 1) {
        await post(`/auth/login/${String(loginId)}/totp`, {
          code: wrongFor(totpCode(secret, Date.now())),
        });
      }
    }
    expect((await login(address)).body.error?.code).toBe('INVALID_CREDENTIALS');
  });

  it('keeps setting up for 10 minutes, and a wrong first code saves nothing', async () => {
    const address = email('enroll');
    const userId = await makeAccount(address);
    const { loginId } = step(await login(address, PASSWORD, 'finance'));
    const id = String(loginId);
    expect(await redis().pttl(loginKey(id))).toBeGreaterThan(ENROLL_TTL_MS - 5_000);
    // confirming before a secret was made
    const early = await post(
      `/auth/login/${id}/totp/confirm`,
      { code: '123456' },
      { app: 'finance' },
    );
    expect(early.body.error?.code).toBe('LOGIN_EXPIRED');
    const { loginId: fresh } = step(await login(address, PASSWORD, 'finance'));
    const enroll = await post(`/auth/login/${String(fresh)}/totp/enroll`, {}, { app: 'finance' });
    const { secret } = enroll.body.data as { secret: string };
    const right = totpCode(secret, Date.now());
    const wrong = await post(
      `/auth/login/${String(fresh)}/totp/confirm`,
      { code: right === '000000' ? '111111' : '000000' },
      { app: 'finance' },
    );
    expect(wrong.body.error?.code).toBe('TOTP_INVALID');
    expect((await credentials().findOne({ _id: userId }))?.totp).toBeUndefined();
    // a second enroll replaces the secret: the first one's code no longer fits
    const replaced = await post(`/auth/login/${String(fresh)}/totp/enroll`, {}, { app: 'finance' });
    const newSecret = (replaced.body.data as { secret: string }).secret;
    expect(newSecret).not.toBe(secret);
    const stale = await post(
      `/auth/login/${String(fresh)}/totp/confirm`,
      { code: right },
      {
        app: 'finance',
      },
    );
    expect(stale.body.error?.code).toBe('TOTP_INVALID');
    const done = await post(
      `/auth/login/${String(fresh)}/totp/confirm`,
      { code: totpCode(newSecret, Date.now()) },
      { app: 'finance' },
    );
    expect(done.status).toBe(200);
  });
});

describe('a password the breach check could not see (DR-002)', () => {
  /** Runs with Have I Been Pwned away (a 503), like an outage. */
  async function away<T>(run: () => Promise<T>): Promise<T> {
    hibp.mode = 'down';
    try {
      return await run();
    } finally {
      hibp.mode = 'answer';
    }
  }
  const stored = async (userId: string) => (await credentials().findOne({ _id: userId }))?.password;

  it('is checked again at the next sign-in, and a leaked one asks for a new password', async () => {
    const address = email('leak-later');
    const userId = await away(() => makeAccount(address, BREACHED));
    expect((await stored(userId))?.hibpPending).toBe(true);
    // still away: the sign-in goes on, and the next one checks again
    expect(step(await away(() => login(address, BREACHED))).next).toBe('signed-in');
    expect((await stored(userId))?.hibpPending).toBe(true);

    const asked = hibp.asked.length;
    const leaked = await login(address, BREACHED);
    expect(hibp.asked.length).toBe(asked + 1);
    expect([leaked.status, leaked.body.error?.code, leaked.body.error?.message]).toEqual([
      403,
      'PASSWORD_RESET_REQUIRED',
      'This password appeared in a data breach. Please set a new one with an email code.',
    ]);
    // known now: with the check away again, still no sign-in with it
    expect((await away(() => login(address, BREACHED))).body.error?.code).toBe(
      'PASSWORD_RESET_REQUIRED',
    );
    expect(hibp.asked.length).toBe(asked + 1);

    // a new password with an email code ends it
    const reset = await verify((await passwordCode(address)).challengeId, PASSWORD);
    expect(reset.body.data?.outcome).toBe('password-set');
    const now = await stored(userId);
    expect(now).not.toHaveProperty('hibpPending');
    expect(now).not.toHaveProperty('breachedAt');
    expect(step(await login(address)).next).toBe('signed-in');
  });

  it('a clean one loses the mark at the next sign-in; one checked when set is never asked again', async () => {
    const address = email('clean-later');
    const userId = await away(() => makeAccount(address));
    expect((await stored(userId))?.hibpPending).toBe(true);
    expect(step(await login(address)).next).toBe('signed-in');
    expect(await stored(userId)).not.toHaveProperty('hibpPending');
    let asked = hibp.asked.length;
    expect(step(await login(address)).next).toBe('signed-in');
    expect(hibp.asked.length).toBe(asked);

    const checked = email('checked-when-set');
    const other = await makeAccount(checked);
    expect(await stored(other)).not.toHaveProperty('hibpPending');
    asked = hibp.asked.length;
    expect(step(await login(checked)).next).toBe('signed-in');
    expect(hibp.asked.length).toBe(asked);
  });
});
