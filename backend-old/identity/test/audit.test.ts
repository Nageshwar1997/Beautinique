// T4.1 PR C: identity's staff and security actions go to core's audit log as
// identity.audit.recorded, in the change's transaction (owner, 2026-11-15), against the local
// MongoDB replica set and Valkey (`npm run infra:up`).
import { ObjectId, withTransaction } from '@beautinique/backend-server-mongo';
import { OUTBOX } from '@beautinique/backend-server-queue';
import type { AppId } from '@beautinique/shared-contracts';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { CREDENTIALS } from '../src/credentials.ts';
import { type Scope, writeGrant } from '../src/rbac/grants.ts';
import { acceptInvitations, type InvitationRecord, INVITATIONS } from '../src/rbac/invitations.ts';
import { type RoleRecord, ROLES } from '../src/rbac/sync.ts';
import { SUBSCRIBERS } from '../src/runtime.ts';
import { type Answer, type Harness, makeAccount, oid, PASSWORD, startHarness } from './helpers.ts';

let harness: Harness;
const email = (name: string) => `${name}-${harness.runId}@beautinique.example`;

beforeAll(async () => {
  harness = await startHarness('audit');
});

afterAll(async () => {
  await harness.stop();
});

interface AuditData {
  action: string;
  actor: {
    userId: string | null;
    app: AppId | null;
    sessionId: string | null;
    roles: string[];
    system: string | null;
  };
  resource: { type: string; id: string | null };
  scope: { type: string; ids: string[] } | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  reason: string | null;
  result: string;
  ip: string | null;
  userAgent: string | null;
  requestId: string | null;
}

/** identity's audit records of one thing, oldest first (the test's own look into the outbox). */
async function records(resourceId: string): Promise<AuditData[]> {
  const found = await harness.db
    .collection<{ envelope: { data: AuditData } }>(OUTBOX)
    .find(
      { type: 'identity.audit.recorded', 'envelope.data.resource.id': resourceId },
      { comment: 'full read: the test looks into the outbox' },
    )
    .sort({ _id: 1 })
    .toArray();
  return found.map((record) => record.envelope.data);
}

/** A request as the gateway forwards it for someone signed in to `app` (its passport). */
async function as(
  userId: string,
  app: AppId,
  method: 'POST' | 'PATCH',
  path: string,
  body?: unknown,
): Promise<Answer> {
  const response = await fetch(`${harness.server.url}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      'X-BQ-App': app,
      'X-BQ-Client-Ip': '203.0.113.9',
      'X-Request-Id': `req-${userId.slice(-6)}`,
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0) Chrome/130.0',
      'X-BQ-Passport': harness.passport.sign(
        {
          userId,
          sessionId: new ObjectId().toHexString(),
          app,
          methods: ['password', 'totp'],
          authzVersion: 0,
        },
        'bq:identity',
      ),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return { status: response.status, body: (await response.json()) as Answer['body'] };
}

const account = (name: string) => makeAccount(email(name), PASSWORD, { everyApp: false });

/** Gives a role straight in the database (as a migration would): no audit record of its own. */
async function hold(userId: string, role: string, scope: Scope = { type: 'global', ids: [] }) {
  const record = await harness.db.collection<RoleRecord>(ROLES).findOne({ key: role });
  if (!record) throw new Error(`no role ${role}`);
  const { mongo } = harness.server.runtime;
  await withTransaction(mongo, (session) =>
    writeGrant(mongo, session, {
      userId: oid(userId),
      roleId: record._id,
      appId: record.appId,
      scope,
      via: 'migration',
      now: new Date(),
    }),
  );
}

async function master(name: string): Promise<string> {
  const userId = await account(name);
  await hold(userId, 'master.master');
  return userId;
}

describe("identity's audit records (T4.1 PR C)", () => {
  it("go to core's audit log", () => {
    expect(SUBSCRIBERS['identity.audit.recorded']).toEqual(['core.identityAudit']);
  });

  it('keep a grant given and ended: who, as which role, from where, and what changed', async () => {
    const boss = await master('audit-boss');
    const person = await account('audit-person');
    const given = await as(boss, 'master', 'POST', '/iam/grants', {
      userId: person,
      role: 'admin.state_admin',
      scope: { type: 'state', ids: ['MH'] },
    });
    expect(given.status, JSON.stringify(given.body)).toBe(200);
    const grantId = (given.body.data as { grant: { grantId: string } }).grant.grantId;
    const ended = await as(boss, 'master', 'POST', `/iam/grants/${grantId}/end`);
    expect(ended.status).toBe(200);
    const [give, end] = await records(grantId);
    expect(give).toMatchObject({
      action: 'iam.grants.give',
      actor: { userId: boss, app: 'master', roles: ['master.master'], system: null },
      resource: { type: 'grant', id: grantId },
      scope: { type: 'state', ids: ['MH'] },
      before: null,
      after: {
        userId: person,
        // half hidden (owner, 2026-11-15)
        email: expect.stringMatching(/^a•••@beautinique\.example$/) as unknown,
        role: 'admin.state_admin',
      },
      result: 'success',
      ip: '203.0.113.9',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0) Chrome/130.0',
      requestId: `req-${boss.slice(-6)}`,
    });
    expect(give?.actor.sessionId).toMatch(/^[0-9a-f]{24}$/);
    expect(end).toMatchObject({
      action: 'iam.grants.end',
      before: { userId: person, role: 'admin.state_admin', active: true },
      after: { active: false },
    });
    // ending it again changes nothing, and is no new record
    await as(boss, 'master', 'POST', `/iam/grants/${grantId}/end`);
    expect(await records(grantId)).toHaveLength(2);
  });

  it('keep a sub-role made and changed, with what it allowed before and after', async () => {
    const boss = await master('audit-roles');
    const slug = `audit_${harness.runId.slice(0, 6)}`;
    const made = await as(boss, 'master', 'POST', '/iam/roles', {
      app: 'admin',
      slug,
      name: 'Audit Desk',
      scopeTypes: ['global'],
      permissions: ['iam.grant.read'],
      appointedBy: ['master.master'],
      mfaRequired: false,
    });
    expect(made.status, JSON.stringify(made.body)).toBe(200);
    const role = await harness.db
      .collection<RoleRecord>(ROLES)
      .findOne({ key: `admin.c_${slug}` }, { projection: { _id: 1 } });
    const roleId = role?._id.toHexString() ?? '';
    const changed = await as(boss, 'master', 'PATCH', `/iam/roles/admin.c_${slug}`, {
      retired: true,
    });
    expect(changed.status, JSON.stringify(changed.body)).toBe(200);
    const [create, update] = await records(roleId);
    expect(create).toMatchObject({
      action: 'iam.roles.create',
      resource: { type: 'role', id: roleId },
      after: { key: `admin.c_${slug}`, name: 'Audit Desk', mfaRequired: false },
    });
    expect(update).toMatchObject({
      action: 'iam.roles.update',
      before: { retired: false },
      after: { retired: true },
    });
  });

  it('keep an invitation sent, taken back and accepted, the invitee half hidden', async () => {
    const boss = await master('audit-inviter');
    const send = async (name: string) => {
      const answer = await as(boss, 'master', 'POST', '/iam/invitations', {
        email: email(name),
        role: 'master.internal_auditor',
        scope: { type: 'global', ids: [] },
      });
      expect(answer.status, JSON.stringify(answer.body)).toBe(200);
      return (answer.body.data as { invitation: { invitationId: string } }).invitation.invitationId;
    };
    const taken = await send('audit-invitee-one');
    expect((await as(boss, 'master', 'POST', `/iam/invitations/${taken}/revoke`)).status).toBe(200);
    const [created, revoked] = await records(taken);
    expect(created).toMatchObject({
      action: 'iam.invitations.create',
      after: { email: 'a•••@beautinique.example', role: 'master.internal_auditor' },
    });
    expect(revoked).toMatchObject({
      action: 'iam.invitations.revoke',
      before: { status: 'pending' },
      after: { status: 'revoked' },
    });

    const kept = await send('audit-invitee-two');
    const invitee = await account('audit-invitee-two');
    const invitation = await harness.db
      .collection<InvitationRecord>(INVITATIONS)
      .findOne({ _id: oid(kept) });
    if (!invitation) throw new Error('no invitation');
    const { mongo } = harness.server.runtime;
    await withTransaction(mongo, (session) =>
      acceptInvitations(mongo, session, {
        userId: oid(invitee),
        accepted: [invitation],
        now: new Date(),
      }),
    );
    expect((await records(kept)).at(-1)).toMatchObject({
      action: 'iam.invitations.accept',
      // the invited person did it, in the app the role is for
      actor: { userId: invitee, app: 'master', sessionId: null },
      after: { status: 'accepted', invitedBy: boss },
    });
  });

  it("keep a Security Officer's authenticator reset and ended sessions", async () => {
    const officer = await account('audit-officer');
    await hold(officer, 'master.security_officer');
    const person = await account('audit-locked-out');
    // an authenticator to reset (its contents do not matter here)
    await harness.db
      .collection(CREDENTIALS)
      .updateOne({ _id: oid(person) }, { $set: { totp: { lost: true } } });
    const reset = await as(officer, 'master', 'POST', `/iam/users/${person}/authenticator/reset`);
    expect(reset.status, JSON.stringify(reset.body)).toBe(200);
    const ended = await as(officer, 'master', 'POST', `/iam/users/${person}/sessions/end`);
    expect(ended.status, JSON.stringify(ended.body)).toBe(200);
    const [resetRecord, endRecord] = await records(person);
    expect(resetRecord).toMatchObject({
      action: 'iam.users.resetAuthenticator',
      actor: { userId: officer, roles: ['master.security_officer'] },
      resource: { type: 'user', id: person },
      after: { authenticator: false },
    });
    expect(endRecord).toMatchObject({
      action: 'iam.users.endSessions',
      resource: { type: 'user', id: person },
    });
  });

  it('keep a refused staff action as denied, with why (owner, 2026-11-15)', async () => {
    const boss = await master('audit-refused');
    // a role to oneself: refused, and kept
    const self = await as(boss, 'master', 'POST', '/iam/grants', {
      userId: boss,
      role: 'admin.state_admin',
      scope: { type: 'state', ids: ['MH'] },
    });
    expect(self.status).toBe(403);
    expect(await records(boss)).toEqual([
      expect.objectContaining({
        action: 'iam.grants.give',
        actor: expect.objectContaining({ userId: boss, roles: ['master.master'] }) as unknown,
        resource: { type: 'user', id: boss },
        scope: { type: 'state', ids: ['MH'] },
        after: { role: 'admin.state_admin' },
        result: 'denied',
        reason: 'Nobody gives a role to themselves.',
        ip: '203.0.113.9',
      }),
    ]);
    // a Security Officer at a Master's authenticator: only another Master may (QA DR-007)
    const officer = await account('audit-refused-officer');
    await hold(officer, 'master.security_officer');
    const reset = await as(officer, 'master', 'POST', `/iam/users/${boss}/authenticator/reset`);
    expect(reset.status).toBe(403);
    expect((await records(boss)).at(-1)).toMatchObject({
      action: 'iam.users.resetAuthenticator',
      actor: { userId: officer },
      result: 'denied',
    });
    // not every answer is a refusal: a wrong body (400) is no record
    const wrong = await as(boss, 'master', 'POST', '/iam/grants', { userId: boss });
    expect(wrong.status).toBe(400);
    expect(await records(boss)).toHaveLength(2);
  });

  it("keep a sign-in to an internal app, never a customer's", async () => {
    const boss = await master('audit-sign-in');
    const { sessions } = harness.server.runtime.otp;
    const client = { ip: '203.0.113.7', userAgent: 'Mozilla/5.0 (Windows NT 10.0) Chrome/130.0' };
    const internal = await sessions.issue({
      userId: oid(boss),
      email: email('audit-sign-in'),
      app: 'master',
      methods: ['password', 'totp'],
      client,
    });
    expect(await records(internal.sessionId)).toEqual([
      expect.objectContaining({
        action: 'identity.session.signedIn',
        actor: expect.objectContaining({
          userId: boss,
          app: 'master',
          sessionId: internal.sessionId,
        }) as unknown,
        after: expect.objectContaining({ methods: ['password', 'totp'] }) as unknown,
        ip: '203.0.113.7',
      }),
    ]);
    const customer = await sessions.issue({
      userId: oid(boss),
      email: email('audit-sign-in'),
      app: 'customer',
      methods: ['password'],
      client,
    });
    expect(await records(customer.sessionId)).toEqual([]);
  });
});
