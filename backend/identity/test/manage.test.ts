// T3.3 part B: roles, grants and invitations through identity's routes, as the gateway's passport
// would bring them, against the local MongoDB replica set and Valkey (`npm run infra:up`).
import { withTransaction } from '@beautinique/backend-server-mongo';
import { OUTBOX } from '@beautinique/backend-server-queue';
import { type AppId, authzVersionKey } from '@beautinique/shared-contracts';
import { uuidv7 } from '@beautinique/shared-utils';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { GRANT_LOG, type GrantLogEntry, type Scope, writeGrant } from '../src/rbac/grants.ts';
import { type InvitationRecord, INVITATIONS } from '../src/rbac/invitations.ts';
import { type RoleRecord, ROLES } from '../src/rbac/sync.ts';
import {
  type Answer,
  codeOf,
  events,
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
const redis = () => harness.server.runtime.redis.client;
const roles = () => db().collection<RoleRecord>(ROLES);
const invitationsDb = () => db().collection<InvitationRecord>(INVITATIONS);

beforeAll(async () => {
  harness = await startHarness('manage');
});

afterAll(async () => {
  await harness.stop();
});

/** A request as the gateway forwards it for someone signed in to `app` (its passport). */
async function as(
  userId: string,
  app: AppId,
  method: 'GET' | 'POST' | 'PATCH',
  path: string,
  body?: unknown,
): Promise<Answer> {
  const response = await fetch(`${harness.server.url}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      'X-BQ-App': app,
      'X-BQ-Client-Ip': '203.0.113.9',
      'X-BQ-Passport': harness.passport.sign(
        { userId, sessionId: uuidv7(), app, methods: ['password', 'totp'], authzVersion: 0 },
        'bq:identity',
      ),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return { status: response.status, body: (await response.json()) as Answer['body'] };
}

/** An account that holds only its customer sign-up role. */
const account = (name: string) => makeAccount(email(name), PASSWORD, { everyApp: false });

/** Gives a role straight in the database (as a migration would), in this scope. */
async function hold(userId: string, role: string, scope: Scope = { type: 'global', ids: [] }) {
  const record = await roles().findOne({ _id: role });
  if (!record) throw new Error(`no role ${role}`);
  const { mongo } = harness.server.runtime;
  await withTransaction(mongo, (session) =>
    writeGrant(mongo, session, {
      userId,
      role,
      app: record.app,
      scope,
      via: 'migration',
      now: new Date(),
    }),
  );
}

const master = async (name = 'master') => {
  const userId = await account(name);
  await hold(userId, 'master.master');
  return userId;
};

const login = (address: string, app: AppId) =>
  post('/auth/login', { email: address, password: PASSWORD }, { app });
const next = (answer: Answer) => (answer.body.data as { next?: string } | undefined)?.next;
const errorOf = (answer: Answer) => [answer.status, answer.body.error?.code];
const versionAt = async (userId: string) => redis().get(authzVersionKey(userId));
const versionOf = async (userId: string) => (await users().findOne({ _id: userId }))?.authzVersion;

describe('roles', () => {
  it('lists every role to whoever reads grants, and to nobody else', async () => {
    const boss = await master('lister');
    const all = await as(boss, 'master', 'GET', '/iam/roles');
    expect(all.status).toBe(200);
    const listed = (all.body.data as { roles: { key: string; system: boolean }[] }).roles;
    expect(listed.filter((role) => role.system).length).toBe(81);
    const admin = await as(boss, 'master', 'GET', '/iam/roles?app=admin');
    expect(
      (admin.body.data as { roles: { app: string }[] }).roles.every((role) => role.app === 'admin'),
    ).toBe(true);
    // the Master role is in the master app: from the customer app the same account reads nothing
    expect(errorOf(await as(boss, 'customer', 'GET', '/iam/roles'))).toEqual([403, 'FORBIDDEN']);
    const shopper = await account('shopper-roles');
    expect(errorOf(await as(shopper, 'customer', 'GET', '/iam/roles'))).toEqual([403, 'FORBIDDEN']);
  });

  it('lets Master make a sub-role, checked like a shipped one', async () => {
    const boss = await master('maker');
    const desk = {
      app: 'admin',
      slug: 'returns_desk',
      name: 'Returns Desk',
      scopeTypes: ['global', 'state'],
      permissions: ['iam.grant.read'],
      appointedBy: ['master.master'],
      mfaRequired: false,
    };
    const made = await as(boss, 'master', 'POST', '/iam/roles', desk);
    expect(made.status, JSON.stringify(made.body)).toBe(200);
    expect(made.body.data?.role).toMatchObject({
      key: 'admin.c_returns_desk',
      permissions: ['iam.app.sign_in', 'iam.grant.read'],
      system: false,
      retired: false,
      signUp: false,
      maxHolders: null,
    });
    expect(errorOf(await as(boss, 'master', 'POST', '/iam/roles', desk))).toEqual([
      409,
      'CONFLICT',
    ]);
    const bad = async (change: Record<string, unknown>) => {
      const answer = await as(boss, 'master', 'POST', '/iam/roles', {
        ...desk,
        slug: `x${uuidv7().slice(-6).replaceAll('-', '')}`,
        ...change,
      });
      expect(answer.status, JSON.stringify(change)).toBe(400);
      return (answer.body.error?.details as { path: string[]; message: string }[]).map((d) => [
        d.path.join('.'),
        d.message,
      ]);
    };
    expect(await bad({ permissions: ['iam.nope.do'] })).toEqual([
      ['permissions', 'unknown permission iam.nope.do'],
    ]);
    expect(await bad({ permissions: ['iam.role.manage'] })).toContainEqual([
      'permissions',
      'Only Master makes roles',
    ]);
    expect(await bad({ appointedBy: ['admin.catalog_qc'] })).toEqual([
      ['appointedBy', 'admin.catalog_qc cannot give roles'],
    ]);
    expect(await bad({ permissions: ['iam.totp.reset'], scopeTypes: ['state'] })).toEqual([
      ['permissions', 'iam.totp.reset cannot be used in any of its scope types'],
    ]);
    // not Master: no
    const logistics = await account('lh-roles');
    await hold(logistics, 'logistics.logistics_head');
    expect(
      errorOf(await as(logistics, 'logistics', 'POST', '/iam/roles', { ...desk, slug: 'other' })),
    ).toEqual([403, 'FORBIDDEN']);
  });

  it('changes only Master’s own sub-roles, and renews their holders’ tokens when what they allow changes', async () => {
    const boss = await master('changer');
    const made = await as(boss, 'master', 'POST', '/iam/roles', {
      app: 'support',
      slug: 'night_shift',
      name: 'Night Shift',
      scopeTypes: ['global', 'state'],
      permissions: [],
      appointedBy: ['master.master'],
      mfaRequired: false,
    });
    expect(made.status, JSON.stringify(made.body)).toBe(200);
    const holder = await account('night');
    await hold(holder, 'support.c_night_shift', { type: 'state', ids: ['MH'] });
    const before = await versionOf(holder);

    const renamed = await as(boss, 'master', 'PATCH', '/iam/roles/support.c_night_shift', {
      name: 'Night Desk',
    });
    expect(renamed.body.data?.role).toMatchObject({ name: 'Night Desk' });
    expect(await versionOf(holder)).toBe(before);

    const stricter = await as(boss, 'master', 'PATCH', '/iam/roles/support.c_night_shift', {
      mfaRequired: true,
    });
    expect(stricter.status).toBe(200);
    expect(await versionOf(holder)).toBe((before ?? 0) + 1);
    expect(await versionAt(holder)).toBe(String((before ?? 0) + 1));

    // a scope type in use stays until those grants end
    expect(
      errorOf(
        await as(boss, 'master', 'PATCH', '/iam/roles/support.c_night_shift', {
          scopeTypes: ['global'],
        }),
      ),
    ).toEqual([409, 'CONFLICT']);
    expect(
      errorOf(await as(boss, 'master', 'PATCH', '/iam/roles/admin.state_admin', { name: 'Xyz' })),
    ).toEqual([403, 'FORBIDDEN']);
    expect(
      errorOf(await as(boss, 'master', 'PATCH', '/iam/roles/admin.c_nothing', { name: 'Xyz' })),
    ).toEqual([404, 'NOT_FOUND']);

    // a retired role opens nothing any more, and is not given again
    await as(boss, 'master', 'PATCH', '/iam/roles/support.c_night_shift', { retired: true });
    expect(next(await login(email('night'), 'support'))).toBeUndefined();
    const again = await as(boss, 'master', 'POST', '/iam/grants', {
      userId: await account('night2'),
      role: 'support.c_night_shift',
      scope: { type: 'global', ids: [] },
    });
    expect(again.status).toBe(400);
    expect(again.body.error?.details).toContainEqual({
      path: ['role'],
      message: 'This role is retired',
    });
  });

  it('keeps the right to give with a role others name as who gives them', async () => {
    const boss = await master('keeper');
    const lead = await as(boss, 'master', 'POST', '/iam/roles', {
      app: 'support',
      slug: 'desk_lead',
      name: 'Desk Lead',
      scopeTypes: ['global'],
      permissions: ['iam.grant.read', 'iam.grant.manage'],
      appointedBy: ['master.master'],
      mfaRequired: true,
    });
    expect(lead.status, JSON.stringify(lead.body)).toBe(200);
    const agent = await as(boss, 'master', 'POST', '/iam/roles', {
      app: 'support',
      slug: 'desk_agent',
      name: 'Desk Agent',
      scopeTypes: ['global'],
      permissions: [],
      appointedBy: ['support.c_desk_lead'],
      mfaRequired: false,
    });
    expect(agent.status, JSON.stringify(agent.body)).toBe(200);
    for (const change of [{ permissions: ['iam.grant.read'] }, { retired: true }]) {
      expect(
        errorOf(await as(boss, 'master', 'PATCH', '/iam/roles/support.c_desk_lead', change)),
        JSON.stringify(change),
      ).toEqual([409, 'CONFLICT']);
    }
    // a lead gives agents
    const leadId = await account('desk-lead');
    await hold(leadId, 'support.c_desk_lead');
    const agentId = await account('desk-agent');
    const given = await as(leadId, 'support', 'POST', '/iam/grants', {
      userId: agentId,
      role: 'support.c_desk_agent',
      scope: { type: 'global', ids: [] },
    });
    expect(given.status, JSON.stringify(given.body)).toBe(200);
    // a role written straight into the database that names one without the right: still no,
    // also for someone whose other role there may give roles (but not this one)
    await hold(agentId, 'support.c_desk_lead');
    await roles().insertOne({
      _id: 'support.c_odd',
      app: 'support',
      name: 'Odd',
      main: false,
      scopeTypes: ['global'],
      permissions: ['iam.app.sign_in'],
      appointedBy: ['support.c_desk_agent'],
      mfaRequired: false,
      signUp: false,
      maxHolders: null,
      system: false,
      retired: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    expect(
      errorOf(
        await as(agentId, 'support', 'POST', '/iam/grants', {
          userId: leadId,
          role: 'support.c_odd',
          scope: { type: 'global', ids: [] },
        }),
      ),
    ).toEqual([403, 'FORBIDDEN']);
  });
});

describe('giving and ending roles', () => {
  it('lets Master give a State Admin a state: the person signs in there, and the change is logged', async () => {
    const boss = await master('giver');
    const asha = await account('asha');
    const before = await versionOf(asha);
    const given = await as(boss, 'master', 'POST', '/iam/grants', {
      userId: asha,
      role: 'admin.state_admin',
      scope: { type: 'state', ids: ['MH', 'GJ'] },
    });
    expect(given.status, JSON.stringify(given.body)).toBe(200);
    expect(given.body.data?.grant).toMatchObject({
      userId: asha,
      email: email('asha'),
      role: 'admin.state_admin',
      app: 'admin',
      scope: { type: 'state', ids: ['MH', 'GJ'] },
      grantedBy: boss,
      via: 'appointed',
      active: true,
      endedAt: null,
    });
    expect(await versionOf(asha)).toBe((before ?? 0) + 1);
    // the gateway learns at once
    expect(await versionAt(asha)).toBe(String((before ?? 0) + 1));
    const log = await db()
      .collection<GrantLogEntry>(GRANT_LOG)
      .findOne({ userId: asha, role: 'admin.state_admin' });
    expect(log).toMatchObject({ action: 'granted', by: boss, via: 'appointed' });
    // the admin app asks for the authenticator first
    expect(next(await login(email('asha'), 'admin'))).toBe('totp-enroll');
    // the same again: already held
    expect(
      errorOf(
        await as(boss, 'master', 'POST', '/iam/grants', {
          userId: asha,
          role: 'admin.state_admin',
          scope: { type: 'state', ids: ['GJ'] },
        }),
      ),
    ).toEqual([409, 'CONFLICT']);
  });

  it('refuses what does not fit: no such role or account, wrong scope, unknown places, an end in the past, oneself', async () => {
    const boss = await master('checker');
    const target = await account('target');
    const give = (body: Record<string, unknown>) =>
      as(boss, 'master', 'POST', '/iam/grants', {
        userId: target,
        role: 'admin.state_admin',
        scope: { type: 'state', ids: ['MH'] },
        ...body,
      });
    const fieldOf = async (body: Record<string, unknown>) => {
      const answer = await give(body);
      expect(answer.status, JSON.stringify(body)).toBe(400);
      return (answer.body.error?.details as { path: string[] }[]).map((d) => d.path.join('.'));
    };
    expect(await fieldOf({ role: 'admin.nobody' })).toEqual(['role']);
    expect(await fieldOf({ userId: uuidv7() })).toEqual(['userId']);
    expect(await fieldOf({ scope: { type: 'state', ids: ['XX'] } })).toEqual(['scope.ids']);
    expect(await fieldOf({ scope: { type: 'global', ids: [] } })).toContain('scope.type');
    expect(
      await fieldOf({ role: 'logistics.hub_manager', scope: { type: 'hub', ids: ['hub-1'] } }),
    ).toEqual(['scope.ids']);
    expect(await fieldOf({ validTo: '2020-01-01T00:00:00.000Z' })).toContain('validTo');
    expect(
      await fieldOf({
        validFrom: '2030-02-01T00:00:00.000Z',
        validTo: '2030-01-01T00:00:00.000Z',
      }),
    ).toContain('validTo');
    expect(errorOf(await give({ userId: boss }))).toEqual([403, 'FORBIDDEN']);
  });

  it('gives a self-scoped role only for the person’s own account', async () => {
    const manager = await account('creator-manager-2');
    await hold(manager, 'growth.creator_partnerships');
    const creator = await account('creator-2');
    const someoneElse = await account('creator-3');
    const give = (ids: string[]) =>
      as(manager, 'growth', 'POST', '/iam/grants', {
        userId: creator,
        role: 'creator.creator',
        scope: { type: 'self', ids },
      });
    expect((await give([someoneElse])).status).toBe(400);
    expect((await give([])).status).toBe(400);
    expect((await give([creator])).status).toBe(200);
    // an invitation names no ids: the new account fills it
    const invited = await as(manager, 'growth', 'POST', '/iam/invitations', {
      email: email('creator-4'),
      role: 'creator.creator',
      scope: { type: 'self', ids: [someoneElse] },
    });
    expect(invited.status).toBe(400);
  });

  it('lets an appointer give only the roles they appoint, inside their own scope', async () => {
    const head = await account('lh');
    await hold(head, 'logistics.logistics_head');
    const planner = await account('planner');
    const give = (role: string, scope: Scope) =>
      as(head, 'logistics', 'POST', '/iam/grants', { userId: planner, role, scope });
    expect((await give('logistics.network_planner', { type: 'state', ids: ['KA'] })).status).toBe(
      200,
    );
    // not a role the Logistics Head gives
    expect(errorOf(await give('admin.state_admin', { type: 'state', ids: ['KA'] }))).toEqual([
      403,
      'FORBIDDEN',
    ]);
    // the right role, but from another app: grants count where the caller acts
    expect(
      errorOf(
        await as(head, 'admin', 'POST', '/iam/grants', {
          userId: planner,
          role: 'logistics.linehaul',
          scope: { type: 'global', ids: [] },
        }),
      ),
    ).toEqual([403, 'FORBIDDEN']);

    // a seller's owner gives staff roles in their own seller only
    const owner = await account('owner');
    await hold(owner, 'seller.account_owner', { type: 'sellerOrg', ids: ['org-1'] });
    const staff = await account('staff');
    const fromOwner = (ids: string[]) =>
      as(owner, 'seller', 'POST', '/iam/grants', {
        userId: staff,
        role: 'seller.catalog_manager',
        scope: { type: 'sellerOrg', ids },
      });
    expect(errorOf(await fromOwner(['org-2']))).toEqual([403, 'FORBIDDEN']);
    expect((await fromOwner(['org-1'])).status).toBe(200);
    expect(next(await login(email('staff'), 'seller'))).toBe('signed-in');
    // someone without the right to give at all
    expect(
      errorOf(
        await as(staff, 'seller', 'POST', '/iam/grants', {
          userId: owner,
          role: 'seller.catalog_manager',
          scope: { type: 'sellerOrg', ids: ['org-1'] },
        }),
      ),
    ).toEqual([403, 'FORBIDDEN']);
  });

  it('ends a role at once (kept for audit), only by someone who could give it, never one’s own', async () => {
    const boss = await master('ender');
    const ravi = await account('ravi');
    const given = await as(boss, 'master', 'POST', '/iam/grants', {
      userId: ravi,
      role: 'logistics.logistics_head',
      scope: { type: 'global', ids: [] },
    });
    const grantId = (given.body.data?.grant as { grantId: string }).grantId;
    expect(next(await login(email('ravi'), 'logistics'))).toBe('totp-enroll');
    const version = await versionOf(ravi);

    // someone who cannot give it
    const other = await account('other-lh');
    await hold(other, 'logistics.logistics_head');
    expect(errorOf(await as(other, 'logistics', 'POST', `/iam/grants/${grantId}/end`))).toEqual([
      403,
      'FORBIDDEN',
    ]);

    const ended = await as(boss, 'master', 'POST', `/iam/grants/${grantId}/end`);
    expect(ended.status).toBe(200);
    expect(ended.body.data?.grant).toMatchObject({ active: false, grantId });
    expect(await versionOf(ravi)).toBe((version ?? 0) + 1);
    expect(await versionAt(ravi)).toBe(String((version ?? 0) + 1));
    expect(await grants().findOne({ _id: grantId })).toMatchObject({
      active: false,
      endedBy: boss,
    });
    expect(next(await login(email('ravi'), 'logistics'))).toBeUndefined();
    // again: nothing changes
    const again = await as(boss, 'master', 'POST', `/iam/grants/${grantId}/end`);
    expect(again.body.data?.grant).toMatchObject({ active: false });
    expect(await versionOf(ravi)).toBe((version ?? 0) + 1);
    expect(errorOf(await as(boss, 'master', 'POST', `/iam/grants/${uuidv7()}/end`))).toEqual([
      404,
      'NOT_FOUND',
    ]);

    // a role its holder could give: still not their own
    await as(boss, 'master', 'POST', '/iam/roles', {
      app: 'master',
      slug: 'desk',
      name: 'Desk',
      scopeTypes: ['global'],
      permissions: [],
      appointedBy: ['master.master'],
      mfaRequired: false,
    });
    await hold(boss, 'master.c_desk');
    const own = await grants().findOne({ userId: boss, role: 'master.c_desk' });
    expect(
      errorOf(await as(boss, 'master', 'POST', `/iam/grants/${String(own?._id)}/end`)),
    ).toEqual([403, 'FORBIDDEN']);
  });
});

describe('who sees which grants', () => {
  it('shows an appointer the roles they give in their scope, a reviewer every role, pages with a cursor', async () => {
    const owner = await account('owner-list');
    await hold(owner, 'seller.account_owner', { type: 'sellerOrg', ids: ['org-a'] });
    const mine = await account('mine');
    await hold(mine, 'seller.catalog_manager', { type: 'sellerOrg', ids: ['org-a'] });
    await hold(mine, 'seller.finance', { type: 'sellerOrg', ids: ['org-a'] });
    const theirs = await account('theirs');
    await hold(theirs, 'seller.catalog_manager', { type: 'sellerOrg', ids: ['org-b'] });

    interface Page {
      items: { userId: string; role: string }[];
      nextCursor: string | null;
    }
    const listed = async (userId: string, app: AppId, query = '') =>
      (await as(userId, app, 'GET', `/iam/grants${query}`)).body.data as unknown as Page;

    const seen = await listed(owner, 'seller');
    expect(seen.items.map((g) => g.userId).sort()).toEqual([mine, mine]);

    // a Security Officer reads every role, sign-up roles too
    const officer = await account('officer');
    await hold(officer, 'master.security_officer');
    const all = await listed(officer, 'master', `?userId=${theirs}`);
    expect(all.items.map((g) => g.role).sort()).toEqual([
      'customer.customer',
      'seller.catalog_manager',
    ]);

    // pages
    const first = await listed(owner, 'seller', '?limit=1');
    expect(first.items).toHaveLength(1);
    expect(first.nextCursor).not.toBeNull();
    const second = await listed(owner, 'seller', `?limit=1&cursor=${String(first.nextCursor)}`);
    expect(second.items).toHaveLength(1);
    expect(second.items[0]?.role).not.toBe(first.items[0]?.role);
    expect(second.nextCursor).toBeNull();

    // ended ones on their own
    expect((await listed(owner, 'seller', '?status=ended')).items).toEqual([]);
    // no right to read grants
    expect(errorOf(await as(mine, 'seller', 'GET', '/iam/grants'))).toEqual([403, 'FORBIDDEN']);
  });
});

describe('invitations', () => {
  const inviteCode = async (address: string, app: AppId, body: Record<string, unknown> = {}) => {
    const answer = await post('/auth/invitations/code', { email: address, ...body }, { app });
    expect(answer.status, JSON.stringify(answer.body)).toBe(200);
    return String(answer.body.data?.challengeId);
  };

  it('invites a new person, who accepts with an email code and a password, then signs in there', async () => {
    const boss = await master('inviter');
    const address = email('neel');
    const made = await as(boss, 'master', 'POST', '/iam/invitations', {
      email: address,
      role: 'admin.state_admin',
      scope: { type: 'state', ids: ['DL'] },
    });
    expect(made.status, JSON.stringify(made.body)).toBe(200);
    const invitation = made.body.data?.invitation as { invitationId: string; status: string };
    expect(invitation).toMatchObject({ status: 'pending', app: 'admin', invitedBy: boss });
    // notify gets the event (outbox), no secret in it
    const event = await db()
      .collection<{ type: string; envelope: { data: Record<string, unknown> } }>(OUTBOX)
      .findOne({ 'envelope.data.invitationId': invitation.invitationId });
    expect(event?.type).toBe('identity.invitation.created');
    expect(event?.envelope.data).toMatchObject({ email: address, roleName: 'State Admin' });
    // the same invitation again: waiting already
    expect(
      errorOf(
        await as(boss, 'master', 'POST', '/iam/invitations', {
          email: address,
          role: 'admin.state_admin',
          scope: { type: 'state', ids: ['DL'] },
        }),
      ),
    ).toEqual([409, 'CONFLICT']);

    // in another app nothing is sent, with the same answer
    const elsewhere = await inviteCode(address, 'support');
    expect(await events(elsewhere)).toHaveLength(0);

    const challengeId = await inviteCode(address, 'admin');
    expect(await events(challengeId)).toHaveLength(1);
    const accepted = await post(
      `/auth/otp/${challengeId}/verify`,
      { code: await codeOf(challengeId), password: PASSWORD },
      { app: 'admin' },
    );
    expect(accepted.status, JSON.stringify(accepted.body)).toBe(200);
    expect(accepted.body.data).toMatchObject({ outcome: 'invite-accepted', signedIn: false });
    const userId = String(accepted.body.data?.userId);
    expect(await grants().findOne({ userId, role: 'admin.state_admin' })).toMatchObject({
      via: 'invitation',
      grantedBy: boss,
      scope: { type: 'state', ids: ['DL'] },
      active: true,
    });
    expect(await invitationsDb().findOne({ _id: invitation.invitationId })).toMatchObject({
      status: 'accepted',
      endedBy: userId,
    });
    // a staff account gets no customer role
    expect((await grants().find({ userId }).toArray()).map((g) => g.role)).toEqual([
      'admin.state_admin',
    ]);
    expect(next(await login(address, 'admin'))).toBe('totp-enroll');
    expect(next(await login(address, 'customer'))).toBeUndefined();
  });

  it('adds the role to an account that exists, which keeps its password', async () => {
    const boss = await master('inviter2');
    const address = email('kiran');
    const kiran = await account('kiran');
    await as(boss, 'master', 'POST', '/iam/invitations', {
      email: address,
      role: 'support.l1_agent',
      scope: { type: 'global', ids: [] },
    });
    const challengeId = await inviteCode(address, 'support');
    const accepted = await verify(challengeId, 'a different long password here', 'support');
    expect(accepted.body.data).toMatchObject({ userId: kiran, outcome: 'invite-accepted' });
    // the old password still works
    expect(next(await login(address, 'support'))).toBe('totp-enroll');
    // holding it now, a new invitation is refused
    expect(
      errorOf(
        await as(boss, 'master', 'POST', '/iam/invitations', {
          email: address,
          role: 'support.l1_agent',
          scope: { type: 'global', ids: [] },
        }),
      ),
    ).toEqual([409, 'CONFLICT']);
  });

  it('gives a self-scoped role its own account, and asks a sign-up app’s consent', async () => {
    const manager = await account('creator-manager');
    await hold(manager, 'growth.creator_partnerships');
    const address = email('sana');
    const made = await as(manager, 'growth', 'POST', '/iam/invitations', {
      email: address,
      role: 'creator.creator',
      scope: { type: 'self', ids: [] },
    });
    expect(made.status, JSON.stringify(made.body)).toBe(200);
    // the creator app asks the terms, as its sign-up does
    const refused = await post('/auth/invitations/code', { email: address }, { app: 'creator' });
    expect(refused.status).toBe(400);
    const challengeId = await inviteCode(address, 'creator', { consent: { terms: true } });
    const accepted = await verify(challengeId, PASSWORD, 'creator');
    const userId = String(accepted.body.data?.userId);
    expect(await grants().findOne({ userId, role: 'creator.creator' })).toMatchObject({
      scope: { type: 'self', ids: [userId] },
    });
    expect(next(await login(address, 'creator'))).toBe('signed-in');
  });

  it('can be taken back, runs out, and dies with the inviter’s right to give', async () => {
    const boss = await master('inviter3');
    const invite = async (name: string) => {
      const answer = await as(boss, 'master', 'POST', '/iam/invitations', {
        email: email(name),
        role: 'finance.payouts_executive',
        scope: { type: 'global', ids: [] },
      });
      return (answer.body.data?.invitation as { invitationId: string }).invitationId;
    };

    // taken back after its code went: the code finds nothing, no account is made
    const back = await invite('back');
    const backCode = await inviteCode(email('back'), 'finance');
    const revoked = await as(boss, 'master', 'POST', `/iam/invitations/${back}/revoke`);
    expect(revoked.body.data?.invitation).toMatchObject({ status: 'revoked' });
    expect(errorOf(await verify(backCode, PASSWORD, 'finance'))).toEqual([400, 'OTP_EXPIRED']);
    expect(await users().findOne({ email: email('back') })).toBeNull();
    // and no new code goes out for it
    expect(await events(await inviteCode(email('back'), 'finance'))).toHaveLength(0);

    // run out: no code, shown as expired, and the same invitation can go again
    const old = await invite('old');
    await invitationsDb().updateOne(
      { _id: old },
      { $set: { expiresAt: new Date(Date.now() - 1000) } },
    );
    expect(await events(await inviteCode(email('old'), 'finance'))).toHaveLength(0);
    const list = await as(boss, 'master', 'GET', '/iam/invitations?status=expired');
    expect(
      (list.body.data as { items: { invitationId: string; status: string }[] }).items,
    ).toContainEqual(expect.objectContaining({ invitationId: old, status: 'expired' }));
    expect(await invite('old')).not.toBe(old);

    // the inviter lost the right: the invitation is taken back at acceptance
    const gone = await invite('gone');
    const goneCode = await inviteCode(email('gone'), 'finance');
    await grants().updateMany({ userId: boss, role: 'master.master' }, { $set: { active: false } });
    expect(errorOf(await verify(goneCode, PASSWORD, 'finance'))).toEqual([400, 'OTP_EXPIRED']);
    expect(await invitationsDb().findOne({ _id: gone })).toMatchObject({ status: 'revoked' });
  });

  it('refuses inviting oneself, and taking back what one could not give', async () => {
    const boss = await master('inviter4');
    expect(
      errorOf(
        await as(boss, 'master', 'POST', '/iam/invitations', {
          email: email('inviter4'),
          role: 'support.l1_agent',
          scope: { type: 'global', ids: [] },
        }),
      ),
    ).toEqual([403, 'FORBIDDEN']);
    const made = await as(boss, 'master', 'POST', '/iam/invitations', {
      email: email('someone'),
      role: 'support.l1_agent',
      scope: { type: 'global', ids: [] },
    });
    const id = (made.body.data?.invitation as { invitationId: string }).invitationId;
    const head = await account('lh-invites');
    await hold(head, 'logistics.logistics_head');
    expect(errorOf(await as(head, 'logistics', 'POST', `/iam/invitations/${id}/revoke`))).toEqual([
      403,
      'FORBIDDEN',
    ]);
    // a Logistics Head does not see Master's support invitations either
    const theirs = await as(head, 'logistics', 'GET', '/iam/invitations');
    expect((theirs.body.data as { items: unknown[] }).items).toEqual([]);
  });
});
