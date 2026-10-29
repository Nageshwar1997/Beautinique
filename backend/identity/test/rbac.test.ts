// T3.3 part A: apps, permissions and the 79 roles as data, sign-up grants, sign-in only where a
// grant is, roles that ask an authenticator, the authz version, the migration for earlier accounts
// and the first Master. Against the local MongoDB replica set and Valkey (`npm run infra:up`).
import { createLogger } from '@beautinique/backend-server-kit';
import {
  type AppId,
  APPS,
  IDENTITY_ERROR_CODES,
  permissions,
  revokedSessionKey,
  SESSION_POLICIES,
} from '@beautinique/shared-contracts';
import { uuidv7 } from '@beautinique/shared-utils';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { giveMasterGrant } from '../src/rbac/bootstrap.ts';
import { GRANT_LOG, type GrantLogEntry, signInAccess } from '../src/rbac/grants.ts';
import { signUpGrantsMigration } from '../src/rbac/migrations.ts';
import { MASTER_ROLE, ROLE_SEEDS, type RoleSeed, SIGN_UP_ROLES } from '../src/rbac/roles.ts';
import {
  APP_RECORDS,
  type AppRecord,
  type PermissionRecord,
  PERMISSIONS,
  rbacFingerprint,
  rbacSyncStep,
  type RoleRecord,
  ROLES,
  roleSeedProblems,
} from '../src/rbac/sync.ts';
import { type Session, SESSIONS } from '../src/sessions.ts';
import { LEGAL_ACCEPTANCES, type LegalAcceptance, type User } from '../src/users.ts';
import {
  type Answer,
  consent,
  giveRole,
  grants,
  type Harness,
  makeAccount,
  PASSWORD,
  post,
  startHarness,
  users,
  verify,
} from './helpers.ts';

let harness: Harness;
const email = (name: string) => `${name}-${harness.runId}@beautinique.example`;
const db = () => harness.server.runtime.mongo.db;
const logger = createLogger({ name: 'rbac-test', level: 'silent' });

beforeAll(async () => {
  harness = await startHarness('rbac');
});

afterAll(async () => {
  await harness.stop();
});

const login = (address: string, app: AppId, password = PASSWORD) =>
  post('/auth/login', { email: address, password }, { app });
const next = (answer: Answer) => (answer.body.data as { next?: string } | undefined)?.next;

/** A new account that holds only what its customer sign-up gave. */
const customerOnly = (name: string) => makeAccount(email(name), PASSWORD, { everyApp: false });

/** Signs up in the app with the sign-up code (an account there already keeps its password). */
async function signUpIn(address: string, app: AppId): Promise<Answer> {
  const code = await post(
    '/auth/sign-up/code',
    { email: address, consent: app === 'customer' ? consent : { terms: true } },
    { app },
  );
  expect(code.status, JSON.stringify(code.body)).toBe(200);
  return verify(String(code.body.data?.challengeId), PASSWORD, app);
}

/** A refresh with the cookie a browser would send, and the cookies back. */
async function refresh(token: string, app: AppId) {
  const response = await fetch(`${harness.server.url}/auth/refresh`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'X-BQ-App': app,
      'X-BQ-Client-Ip': '203.0.113.9',
      cookie: `__Secure-bq_${app}_rt=${token}`,
    },
    body: '{}',
  });
  const cookies = new Map<string, string>();
  for (const line of response.headers.getSetCookie()) {
    const [pair = ''] = line.split(';');
    const at = pair.indexOf('=');
    cookies.set(pair.slice(0, at), pair.slice(at + 1));
  }
  return { status: response.status, cookies };
}

async function signInWithCookies(address: string, app: AppId) {
  const response = await fetch(`${harness.server.url}/auth/login`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'X-BQ-App': app,
      'X-BQ-Client-Ip': '203.0.113.9',
    },
    body: JSON.stringify({ email: address, password: PASSWORD }),
  });
  expect(response.status).toBe(200);
  const refreshCookie = response.headers
    .getSetCookie()
    .find((line) => line.startsWith(`__Secure-bq_${app}_rt=`));
  const access = response.headers
    .getSetCookie()
    .find((line) => line.startsWith(`__Host-bq_${app}_at=`));
  const valueOf = (line = '') => line.split(';')[0]?.split('=').slice(1).join('=') ?? '';
  return { refresh: valueOf(refreshCookie), access: valueOf(access) };
}

/** The `av` of an access token (no signature check: identity's own tests cover that). */
const avOf = (token: string): unknown =>
  (JSON.parse(Buffer.from(token.split('.')[1] ?? '', 'base64url').toString()) as { av?: unknown })
    .av;

describe('the shipped roles', () => {
  // the two applicant roles are not among the PRD's 79 (Customer is, though sign-up gives it)
  const counted = ROLE_SEEDS.filter((seed) => !seed.key.endsWith('.applicant'));

  it('are the 79 roles of PRD §3.2, per app, with one main role each', () => {
    expect(counted).toHaveLength(79);
    const perApp = Object.fromEntries(
      APPS.map((app) => [app, counted.filter((seed) => seed.app === app).length]),
    );
    expect(perApp).toEqual({
      customer: 2,
      seller: 10,
      admin: 11,
      superadmin: 2,
      master: 7,
      support: 9,
      finance: 5,
      logistics: 18,
      delivery: 2,
      growth: 10,
      creator: 3,
    });
    for (const app of APPS) {
      expect(
        counted.filter((seed) => seed.app === app && seed.main),
        app,
      ).toHaveLength(1);
    }
  });

  it('have nothing wrong against the permission catalogue', () => {
    expect(roleSeedProblems()).toEqual([]);
  });

  it('give Customer, Seller applicant and Creator applicant at sign-up, self-scoped', () => {
    expect(SIGN_UP_ROLES).toEqual({
      customer: 'customer.customer',
      seller: 'seller.applicant',
      creator: 'creator.applicant',
    });
  });

  it('never give Master a *.decide permission, and keep it to 2 seats and Master only', () => {
    const master = ROLE_SEEDS.find((seed) => seed.key === MASTER_ROLE);
    expect(master?.permissions.some((key) => key.endsWith('.decide'))).toBe(false);
    expect(master).toMatchObject({
      app: 'master',
      maxHolders: 2,
      appointedBy: [],
      mfaRequired: true,
    });
  });

  it('ask an authenticator of Seller Account Owner and Seller Finance, not of other seller staff', () => {
    const strict = ROLE_SEEDS.filter((seed) => seed.app === 'seller' && seed.mfaRequired);
    expect(strict.map((seed) => seed.key).sort()).toEqual([
      'seller.account_owner',
      'seller.finance',
    ]);
  });

  it('let the appointers of ARCHITECTURE §7.3 give their people’s roles', () => {
    const by = (key: string) => ROLE_SEEDS.find((seed) => seed.key === key)?.appointedBy;
    expect(by('admin.state_admin')).toEqual(['master.master']);
    expect(by('superadmin.super_admin')).toEqual(['master.master']);
    expect(by('logistics.hub_manager')).toContain('logistics.logistics_head');
    expect(by('logistics.hub_ops')).toContain('logistics.hub_manager');
    expect(by('logistics.rider_onboarding')).toContain('logistics.hub_manager');
    expect(by('seller.catalog_manager')).toContain('seller.account_owner');
    // a Super Admin appoints nobody
    expect(ROLE_SEEDS.some((seed) => seed.appointedBy.includes('superadmin.super_admin'))).toBe(
      false,
    );
  });

  it('are checked: unknown keys, keys no scope fits, appointers that cannot give, odd sign-up roles', () => {
    const base: RoleSeed = {
      key: 'admin.x',
      app: 'admin',
      name: 'X',
      main: false,
      scopeTypes: ['global'],
      permissions: ['iam.app.sign_in'],
      appointedBy: ['master.master'],
      mfaRequired: false,
      signUp: false,
      maxHolders: null,
    };
    const master = ROLE_SEEDS.find((seed) => seed.key === MASTER_ROLE);
    if (!master) throw new Error('Master is not shipped');
    const problems = (seed: Partial<RoleSeed>) =>
      roleSeedProblems([master, { ...base, ...seed }], permissions);
    expect(problems({})).toEqual([]);
    expect(problems({ key: 'seller.x' })).toEqual(['seller.x: key must start with app']);
    expect(problems({ permissions: [] })).toEqual(['admin.x: cannot sign in to its app']);
    expect(problems({ permissions: ['iam.app.sign_in', 'iam.nope.do'] })).toEqual([
      'admin.x: unknown permission iam.nope.do',
    ]);
    expect(
      problems({ permissions: ['iam.app.sign_in', 'iam.totp.reset'], scopeTypes: ['state'] }),
    ).toEqual(['admin.x: iam.totp.reset cannot be used in any of its scope types']);
    expect(problems({ appointedBy: ['admin.x'] })).toEqual(['admin.x: admin.x cannot give roles']);
    expect(problems({ appointedBy: ['admin.y'] })).toEqual(['admin.x: unknown appointer admin.y']);
    expect(problems({ signUp: true })).toEqual([
      'admin.x: a sign-up role is self-scoped and given by identity only',
    ]);
    expect(roleSeedProblems([master, master], permissions)).toContain('a role key is used twice');
  });
});

describe('the release step', () => {
  it('wrote the 11 apps, the catalogue and the shipped roles at start', async () => {
    const apps = await db().collection<AppRecord>(APP_RECORDS).find().toArray();
    expect(apps.map((app) => app._id).sort()).toEqual([...APPS].sort());
    expect(apps.find((app) => app._id === 'admin')).toMatchObject({
      audience: 'internal',
      signUp: false,
      totp: 'required',
      session: SESSION_POLICIES.admin,
    });
    expect(apps.find((app) => app._id === 'customer')).toMatchObject({
      audience: 'external',
      signUp: true,
      totp: 'optional',
    });
    const keys = await db().collection<PermissionRecord>(PERMISSIONS).distinct('_id');
    expect(keys.sort()).toEqual([...permissions.keys()].sort());
    expect(await db().collection<RoleRecord>(ROLES).countDocuments({ system: true })).toBe(81);
  });

  it('retires a system role the code dropped, and never touches Master’s own sub-roles', async () => {
    const roles = db().collection<RoleRecord>(ROLES);
    const now = new Date();
    const shape = {
      app: 'admin' as const,
      main: false,
      scopeTypes: ['global' as const],
      permissions: ['iam.app.sign_in'],
      appointedBy: [MASTER_ROLE],
      mfaRequired: false,
      signUp: false,
      maxHolders: null,
      retired: false,
      createdAt: now,
      updatedAt: now,
    };
    await roles.insertMany([
      { _id: 'admin.dropped', name: 'Dropped', system: true, ...shape },
      { _id: 'admin.own', name: 'Master made it', system: false, ...shape },
    ]);
    const before = await roles.findOne({ _id: 'admin.state_admin' });
    await rbacSyncStep.run({ mongo: harness.server.runtime.mongo, logger });
    expect(await roles.findOne({ _id: 'admin.dropped' })).toMatchObject({ retired: true });
    expect(await roles.findOne({ _id: 'admin.own' })).toMatchObject({
      retired: false,
      name: 'Master made it',
      updatedAt: now,
    });
    const after = await roles.findOne({ _id: 'admin.state_admin' });
    expect(after?.createdAt).toEqual(before?.createdAt);
    expect(after?.retired).toBe(false);
  });

  it('has a fingerprint that follows the data', () => {
    expect(rbacSyncStep.fingerprint).toBe(rbacFingerprint());
    expect(rbacFingerprint()).toMatch(/^[0-9a-f]{16}$/);
  });
});

describe('sign-up grants', () => {
  it('gives a new customer the Customer role (self), logged, and raises the authz version', async () => {
    const userId = await customerOnly('meera');
    const own = await grants().find({ userId }).toArray();
    expect(own).toHaveLength(1);
    expect(own[0]).toMatchObject({
      role: 'customer.customer',
      app: 'customer',
      scope: { type: 'self', ids: [userId] },
      via: 'sign-up',
      active: true,
      grantedBy: null,
    });
    const log = await db().collection<GrantLogEntry>(GRANT_LOG).find({ userId }).toArray();
    expect(log).toMatchObject([{ grantId: own[0]?._id, action: 'granted', via: 'sign-up' }]);
    expect((await users().findOne({ _id: userId }))?.authzVersion).toBe(1);
  });

  it('gives a seller and a creator sign-up their applicant role, also to an account that exists', async () => {
    const address = email('kavya');
    const userId = await customerOnly('kavya');
    expect(next(await login(address, 'seller'))).toBeUndefined();

    const seller = await signUpIn(address, 'seller');
    expect(seller.body.data).toMatchObject({ outcome: 'password-kept', signedIn: false });
    const creator = await signUpIn(address, 'creator');
    expect(creator.body.data).toMatchObject({ outcome: 'password-kept' });
    // the same sign-up again gives nothing new
    await signUpIn(address, 'seller');

    const roles = (await grants().find({ userId, active: true }).toArray()).map((g) => g.role);
    expect(roles.sort()).toEqual(['creator.applicant', 'customer.customer', 'seller.applicant']);
    expect((await users().findOne({ _id: userId }))?.authzVersion).toBe(3);
    expect(next(await login(address, 'seller'))).toBe('signed-in');
  });

  it('signs a new seller in at once, as an applicant', async () => {
    const address = email('isha');
    const made = await signUpIn(address, 'seller');
    expect(made.body.data).toMatchObject({ outcome: 'account-made', signedIn: true });
    const userId = String(made.body.data?.userId);
    expect(await grants().find({ userId }).toArray()).toMatchObject([{ role: 'seller.applicant' }]);
    // no customer role without the 18+ declaration of the customer app
    expect(next(await login(address, 'customer'))).toBeUndefined();
  });
});

describe('sign-in only where a grant is', () => {
  it('answers an app without a grant like a wrong password, and does not count it', async () => {
    const address = email('neha');
    await customerOnly('neha');
    for (const app of ['admin', 'seller', 'delivery', 'master'] as const) {
      const answer = await login(address, app);
      expect(answer.status, app).toBe(IDENTITY_ERROR_CODES.INVALID_CREDENTIALS);
      expect(answer.body.error?.code, app).toBe('INVALID_CREDENTIALS');
    }
    for (let i = 0; i < 10; i += 1) await login(address, 'finance');
    // the password was right each time: no lock
    expect(next(await login(address, 'customer'))).toBe('signed-in');
  });

  it('opens an app once a grant is given, and not before it starts or after it ends', async () => {
    const address = email('tara');
    const userId = await customerOnly('tara');
    await giveRole(userId, 'delivery.partner');
    expect(next(await login(address, 'delivery'))).toBe('signed-in');
    const hour = 60 * 60_000;
    await grants().updateOne(
      { userId, role: 'delivery.partner' },
      { $set: { validFrom: new Date(Date.now() + hour) } },
    );
    expect(next(await login(address, 'delivery'))).toBeUndefined();
    await grants().updateOne(
      { userId, role: 'delivery.partner' },
      {
        $set: { validFrom: new Date(Date.now() - 2 * hour), validTo: new Date(Date.now() - hour) },
      },
    );
    expect(next(await login(address, 'delivery'))).toBeUndefined();
    await grants().updateOne(
      { userId, role: 'delivery.partner' },
      { $set: { validTo: null, active: false } },
    );
    expect(next(await login(address, 'delivery'))).toBeUndefined();
  });

  it('asks a Seller Finance or Account Owner to set up the authenticator; other staff choose', async () => {
    const staff = email('pooja');
    const staffId = await customerOnly('pooja');
    await giveRole(staffId, 'seller.catalog_manager');
    expect(next(await login(staff, 'seller'))).toBe('signed-in');

    const finance = email('anu');
    const financeId = await customerOnly('anu');
    await giveRole(financeId, 'seller.catalog_manager');
    await giveRole(financeId, 'seller.finance');
    expect(next(await login(finance, 'seller'))).toBe('totp-enroll');
    // a role in another app asks nothing there
    expect(next(await login(finance, 'customer'))).toBe('signed-in');

    const owner = email('ritu');
    const ownerId = await customerOnly('ritu');
    await giveRole(ownerId, 'seller.account_owner');
    expect(next(await login(owner, 'seller'))).toBe('totp-enroll');
  });

  it('never issues a session where no grant is, whoever asks', async () => {
    const userId = await customerOnly('sana');
    await expect(
      harness.server.runtime.otp.sessions.issue({
        userId,
        email: email('sana'),
        app: 'admin',
        methods: ['password'],
        client: { ip: '203.0.113.9', userAgent: 'test' },
      }),
    ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
    expect(await db().collection<Session>(SESSIONS).countDocuments({ userId, app: 'admin' })).toBe(
      0,
    );
  });
});

describe('the authz version', () => {
  it('rides in every access token, and a refresh after a new grant carries the new one', async () => {
    const address = email('diya');
    const userId = await customerOnly('diya');
    const first = await signInWithCookies(address, 'customer');
    expect(avOf(first.access)).toBe(1);
    await giveRole(userId, 'customer.pro_buyer');
    const again = await refresh(first.refresh, 'customer');
    expect(again.status).toBe(200);
    expect(avOf(again.cookies.get('__Host-bq_customer_at') ?? '')).toBe(2);
  });

  it('ends a session at refresh when its app has no grant left', async () => {
    const address = email('jia');
    const userId = await customerOnly('jia');
    await giveRole(userId, 'growth.content_editor');
    const access = await signInAccess(harness.server.runtime.mongo, { userId, app: 'growth' });
    expect(access).toMatchObject({ allowed: true, mfaRequired: false });
    // growth asks the authenticator: give the session straight, as the last step would
    const session = await harness.server.runtime.otp.sessions.issue({
      userId,
      email: address,
      app: 'growth',
      methods: ['password', 'totp'],
      client: { ip: '203.0.113.9', userAgent: 'test' },
    });
    await grants().updateOne(
      { userId, role: 'growth.content_editor' },
      { $set: { active: false } },
    );
    const answer = await refresh(session.refreshToken, 'growth');
    expect(answer.status).toBe(IDENTITY_ERROR_CODES.SESSION_EXPIRED);
    expect(
      await db().collection<Session>(SESSIONS).findOne({ _id: session.sessionId }),
    ).toMatchObject({
      revokeReason: 'access-ended',
    });
    expect(
      await harness.server.runtime.redis.client.exists(revokedSessionKey(session.sessionId)),
    ).toBe(1);
  });
});

describe('accounts from before T3.3', () => {
  it('get the grant of each sign-up, once, and Customer only with the 18+ declaration', async () => {
    const now = new Date();
    const make = async (signUpApp: AppId, adult: boolean, alsoIn: AppId[] = []) => {
      const _id = uuidv7();
      await users().insertOne({
        _id,
        email: `${_id}@beautinique.example`,
        status: 'active',
        emailVerifiedAt: now,
        ageDeclaredAt: adult ? now : null,
        signUpApp,
        createdAt: now,
        updatedAt: now,
      } satisfies User);
      for (const app of [signUpApp, ...alsoIn]) {
        await db()
          .collection<LegalAcceptance>(LEGAL_ACCEPTANCES)
          .insertOne({
            _id: uuidv7(),
            userId: _id,
            documents: ['terms', 'privacy'],
            version: 'dummy-1',
            adult: adult && app === 'customer',
            app,
            ip: '203.0.113.9',
            acceptedAt: now,
          });
      }
      return _id;
    };
    const customer = await make('customer', true, ['seller']);
    const sellerOnly = await make('seller', false);
    const notAdult = await make('customer', false);

    const mongo = harness.server.runtime.mongo;
    await signUpGrantsMigration.up({ mongo, logger });
    await signUpGrantsMigration.up({ mongo, logger });

    const rolesOf = async (userId: string) =>
      (await grants().find({ userId }).toArray()).map((g) => `${g.role}:${g.via}`).sort();
    expect(await rolesOf(customer)).toEqual([
      'customer.customer:migration',
      'seller.applicant:migration',
    ]);
    expect(await rolesOf(sellerOnly)).toEqual(['seller.applicant:migration']);
    expect(await rolesOf(notAdult)).toEqual([]);
  });
});

describe('the first Master', () => {
  it('goes to an account that exists, once, at most two, and opens only the Master app', async () => {
    const mongo = harness.server.runtime.mongo;
    await expect(giveMasterGrant(mongo, { email: email('nobody') })).rejects.toThrow(
      /sign up in the customer app first/,
    );
    await expect(giveMasterGrant(mongo, { email: 'not an email' })).rejects.toThrow(/not an email/);

    const first = email('owner');
    const firstId = await customerOnly('owner');
    expect(await giveMasterGrant(mongo, { email: first.toUpperCase() })).toBe('given');
    expect(await giveMasterGrant(mongo, { email: first })).toBe('already-master');
    expect(await grants().find({ userId: firstId, role: MASTER_ROLE }).toArray()).toMatchObject([
      { app: 'master', scope: { type: 'global', ids: [] }, via: 'bootstrap', grantedBy: null },
    ]);
    // Master signs in to Master (setting up the authenticator first), and nowhere new
    expect(next(await login(first, 'master'))).toBe('totp-enroll');
    expect(next(await login(first, 'admin'))).toBeUndefined();

    await customerOnly('owner2');
    expect(await giveMasterGrant(mongo, { email: email('owner2') })).toBe('given');
    await customerOnly('owner3');
    await expect(giveMasterGrant(mongo, { email: email('owner3') })).rejects.toThrow(
      /2 seats and both are taken/,
    );
    // a seat comes back when a grant ends
    await grants().updateOne({ userId: firstId, role: MASTER_ROLE }, { $set: { active: false } });
    expect(await giveMasterGrant(mongo, { email: email('owner3') })).toBe('given');
  });

  it('gives the last seat to one of two at once, never to both', async () => {
    const mongo = harness.server.runtime.mongo;
    await grants().updateMany({ role: MASTER_ROLE }, { $set: { active: false } });
    await customerOnly('race1');
    await customerOnly('race2');
    await customerOnly('race3');
    expect(await giveMasterGrant(mongo, { email: email('race1') })).toBe('given');
    const results = await Promise.allSettled([
      giveMasterGrant(mongo, { email: email('race2') }),
      giveMasterGrant(mongo, { email: email('race3') }),
    ]);
    expect(results.map((result) => result.status).sort()).toEqual(['fulfilled', 'rejected']);
    const held = await grants().distinct('userId', { role: MASTER_ROLE, active: true });
    expect(held).toHaveLength(2);
  });

  it('needs the roles written first', async () => {
    const mongo = harness.server.runtime.mongo;
    await customerOnly('early');
    const roles = db().collection<RoleRecord>(ROLES);
    const master = await roles.findOne({ _id: MASTER_ROLE });
    await roles.deleteOne({ _id: MASTER_ROLE });
    await expect(giveMasterGrant(mongo, { email: email('early') })).rejects.toThrow(/db:release/);
    if (master) await roles.insertOne(master);
  });
});
