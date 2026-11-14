// T3.5: identity's snapshot events, for core's copy of the roles, the grants and the accounts
// (ARCHITECTURE §5.2), each in the transaction of its change, against the local MongoDB replica set
// and Valkey (`npm run infra:up`).
import { createLogger } from '@beautinique/backend-server-kit';
import { ObjectId, withTransaction } from '@beautinique/backend-server-mongo';
import { OUTBOX, type OutboxRecord } from '@beautinique/backend-server-queue';
import type { AppId } from '@beautinique/shared-contracts';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { endGrantRecord, writeGrant } from '../src/rbac/grants.ts';
import { accessSnapshotsMigration } from '../src/rbac/migrations.ts';
import { rbacSyncStep } from '../src/rbac/sync.ts';
import { releaseDefinition } from '../src/release.ts';
import { SUBSCRIBERS } from '../src/runtime.ts';
import {
  type Answer,
  giveRole,
  grants,
  type Harness,
  makeAccount,
  oid,
  roleIdOf,
  startHarness,
  users,
} from './helpers.ts';

let harness: Harness;
const email = (name: string) => `${name}-${harness.runId}@beautinique.example`;
const outbox = () => harness.db.collection<OutboxRecord>(OUTBOX);
const silent = createLogger({ name: 'snapshots-test', level: 'silent' });

beforeAll(async () => {
  harness = await startHarness('snapshots');
});

afterAll(async () => {
  await harness.stop();
});

interface GrantSnapshot {
  userId: string;
  authzVersion: number;
  grants: { grantId: string; roleId: string; app: AppId; scope: { type: string; ids: string[] } }[];
}
interface RoleSnapshot {
  roleId: string;
  key: string;
  app: AppId;
  permissions: string[];
  retired: boolean;
}

/** The snapshots of one type for one aggregate, oldest first (the test's own look-up). */
async function snapshots<Data>(type: string, aggregateId: string): Promise<Data[]> {
  const found = await outbox()
    .find(
      { type, 'envelope.aggregate.id': aggregateId },
      { comment: 'full read: the test looks into the outbox' },
    )
    .sort({ _id: 1 })
    .toArray();
  return found.map((record) => (record.envelope as { data: Data }).data);
}
const latest = async <Data>(type: string, aggregateId: string): Promise<Data | undefined> =>
  (await snapshots<Data>(type, aggregateId)).at(-1);

/** A request as the gateway forwards it for someone signed in to `app` (its passport). */
async function as(
  userId: string,
  app: AppId,
  method: 'POST' | 'PATCH',
  path: string,
  body: unknown,
): Promise<Answer> {
  const response = await fetch(`${harness.server.url}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      'X-BQ-App': app,
      'X-BQ-Client-Ip': '203.0.113.9',
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
    body: JSON.stringify(body),
  });
  return { status: response.status, body: (await response.json()) as Answer['body'] };
}

describe('identity snapshot events (T3.5)', () => {
  it('go to core, which keeps the copies (the tests here leave core out)', () => {
    expect(SUBSCRIBERS['identity.role.changed']).toEqual(['core.roleCopy']);
    expect(SUBSCRIBERS['identity.grant.changed']).toEqual(['core.accessCopy']);
    expect(SUBSCRIBERS['identity.user.changed']).toEqual(['core.userCopy']);
  });

  it('sends a new account, and its grants at sign-up', async () => {
    const userId = await makeAccount(email('new'), undefined, { everyApp: false });
    expect(await snapshots('identity.user.changed', userId)).toEqual([
      expect.objectContaining({ userId, email: email('new'), status: 'active' }),
    ]);
    const access = await latest<GrantSnapshot>('identity.grant.changed', userId);
    const customer = (await roleIdOf('customer.customer')).toHexString();
    expect(access?.grants).toEqual([
      expect.objectContaining({
        roleId: customer,
        app: 'customer',
        scope: { type: 'self', ids: [userId] },
      }),
    ]);
    // the snapshot's version is the account's, after the change
    expect(access?.authzVersion).toBe((await users().findOne({ _id: oid(userId) }))?.authzVersion);
  });

  it('sends all of an account grants after each change, with its version going up', async () => {
    const userId = await makeAccount(email('staff'), undefined, { everyApp: false });
    const before = await latest<GrantSnapshot>('identity.grant.changed', userId);
    await giveRole(userId, 'admin.state_admin');
    const given = await latest<GrantSnapshot>('identity.grant.changed', userId);
    expect(given?.authzVersion).toBe((before?.authzVersion ?? 0) + 1);
    const stateAdmin = (await roleIdOf('admin.state_admin')).toHexString();
    expect(given?.grants.map((grant) => grant.roleId)).toContain(stateAdmin);
    expect(given?.grants).toHaveLength(2);
    // ended: the next snapshot no longer has it
    const grant = await grants().findOne({ userId: oid(userId), roleId: oid(stateAdmin) });
    const { mongo } = harness.server.runtime;
    await withTransaction(mongo, (session) =>
      endGrantRecord(mongo, session, {
        grantId: grant?._id ?? new ObjectId(),
        by: null,
        now: new Date(),
      }),
    );
    const ended = await latest<GrantSnapshot>('identity.grant.changed', userId);
    expect(ended?.authzVersion).toBe((given?.authzVersion ?? 0) + 1);
    expect(ended?.grants.map((one) => one.roleId)).not.toContain(stateAdmin);
  });

  it('leaves out a grant that ran out, and keeps one that starts later', async () => {
    const userId = await makeAccount(email('dates'), undefined, { everyApp: false });
    await giveRole(userId, 'admin.state_admin');
    const stateAdmin = await roleIdOf('admin.state_admin');
    await grants().updateOne(
      { userId: oid(userId), roleId: stateAdmin },
      { $set: { validTo: new Date(Date.now() - 60_000) } },
    );
    await giveRole(userId, 'admin.fraud_risk');
    const fraud = await roleIdOf('admin.fraud_risk');
    await grants().updateOne(
      { userId: oid(userId), roleId: fraud },
      { $set: { validFrom: new Date(Date.now() + 86_400_000) } },
    );
    // the next change sends the account's grants as they stand
    await giveRole(userId, 'admin.catalog_qc');
    const access = await latest<GrantSnapshot>('identity.grant.changed', userId);
    const roles = access?.grants.map((grant) => grant.roleId) ?? [];
    expect(roles).not.toContain(stateAdmin.toHexString());
    expect(roles).toContain(fraud.toHexString());
  });

  it('holds at most 50 grants an account, and its snapshot of them all fits one event', async () => {
    const userId = await makeAccount(email('many'), undefined, { everyApp: false });
    const hub = await harness.db
      .collection<{ _id: ObjectId; appId: ObjectId }>('identity_roles')
      .findOne({ key: 'logistics.hub_manager' });
    const { mongo } = harness.server.runtime;
    const give = () =>
      withTransaction(mongo, (session) =>
        writeGrant(mongo, session, {
          userId: oid(userId),
          roleId: hub?._id ?? new ObjectId(),
          appId: hub?.appId ?? new ObjectId(),
          scope: { type: 'hub', ids: [new ObjectId().toHexString()] },
          via: 'migration',
          now: new Date(),
        }),
      );
    // the customer grant of the sign-up, and 49 hubs: 50
    for (let n = 1; n < 50; n += 1) await give();
    expect((await latest<GrantSnapshot>('identity.grant.changed', userId))?.grants).toHaveLength(
      50,
    );
    await expect(give()).rejects.toMatchObject({ code: 'CONFLICT' });
    expect(await grants().countDocuments({ userId: oid(userId), active: true })).toBe(50);
  });

  it('sends a role when Master makes or changes a sub-role, and renews its holders', async () => {
    const boss = await makeAccount(email('boss'), undefined, { everyApp: false });
    await giveRole(boss, 'master.master');
    const made = await as(boss, 'master', 'POST', '/iam/roles', {
      app: 'master',
      slug: 'snap_lead',
      name: 'Snapshot Lead',
      scopeTypes: ['global'],
      permissions: ['iam.grant.read'],
      appointedBy: ['master.master'],
      mfaRequired: true,
    });
    expect(made.status, JSON.stringify(made.body)).toBe(200);
    const role = await harness.db
      .collection<{ _id: ObjectId; key: string; appId: ObjectId }>('identity_roles')
      .findOne({ key: 'master.c_snap_lead' });
    const roleId = role?._id.toHexString() ?? '';
    expect(await latest<RoleSnapshot>('identity.role.changed', roleId)).toEqual(
      expect.objectContaining({
        key: 'master.c_snap_lead',
        app: 'master',
        permissions: expect.arrayContaining(['iam.app.sign_in', 'iam.grant.read']) as string[],
        retired: false,
      }),
    );
    const lead = await makeAccount(email('lead'), undefined, { everyApp: false });
    const { mongo } = harness.server.runtime;
    // a sub-role is data, not a seed: given straight, as a migration would
    await withTransaction(mongo, (session) =>
      writeGrant(mongo, session, {
        userId: oid(lead),
        roleId: role?._id ?? new ObjectId(),
        appId: role?.appId ?? new ObjectId(),
        scope: { type: 'global', ids: [] },
        via: 'migration',
        now: new Date(),
      }),
    );
    const held = await latest<GrantSnapshot>('identity.grant.changed', lead);
    const changed = await as(boss, 'master', 'PATCH', '/iam/roles/master.c_snap_lead', {
      permissions: ['iam.grant.read', 'iam.session.revoke'],
    });
    expect(changed.status, JSON.stringify(changed.body)).toBe(200);
    expect((await latest<RoleSnapshot>('identity.role.changed', roleId))?.permissions).toContain(
      'iam.session.revoke',
    );
    // the holder's tokens renew, so their snapshot carries the new version
    expect((await latest<GrantSnapshot>('identity.grant.changed', lead))?.authzVersion).toBe(
      (held?.authzVersion ?? 0) + 1,
    );
  });

  it('sends every role from the rbac step, Master with its reset of another Master', async () => {
    const { mongo } = harness.server.runtime;
    await rbacSyncStep.run({ mongo, logger: silent });
    const master = (await roleIdOf('master.master')).toHexString();
    expect((await latest<RoleSnapshot>('identity.role.changed', master))?.permissions).toEqual(
      expect.arrayContaining(['iam.totp.reset', 'iam.totp.reset_master']),
    );
  });

  it('runs the first copy at a release, after the earlier migrations', () => {
    expect(releaseDefinition.migrations.at(-1)?.id).toBe(accessSnapshotsMigration.id);
  });

  it('sends the first copy: every account with its grants, safe to run again', async () => {
    const userId = await makeAccount(email('first'), undefined, { everyApp: false });
    const { mongo } = harness.server.runtime;
    const before = (await snapshots('identity.user.changed', userId)).length;
    const grantsBefore = (await snapshots('identity.grant.changed', userId)).length;
    await accessSnapshotsMigration.up({ mongo, logger: silent });
    await accessSnapshotsMigration.up({ mongo, logger: silent });
    expect(await snapshots('identity.user.changed', userId)).toHaveLength(before + 2);
    expect(await snapshots('identity.grant.changed', userId)).toHaveLength(grantsBefore + 2);
    const version = (await users().findOne({ _id: oid(userId) }))?.authzVersion ?? 0;
    // the first copy carries the version as it is: it changes nothing
    expect((await latest<GrantSnapshot>('identity.grant.changed', userId))?.authzVersion).toBe(
      version,
    );
  });
});
