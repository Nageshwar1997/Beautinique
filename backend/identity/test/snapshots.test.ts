// T3.5: identity's snapshot events, for core's copy of the roles, the grants and the accounts
// (ARCHITECTURE §5.2), each in the transaction of its change, against the local MongoDB replica set
// and Valkey (`npm run infra:up`).
import { createLogger } from '@beautinique/backend-server-kit';
import { ObjectId, withTransaction } from '@beautinique/backend-server-mongo';
import {
  OUTBOX,
  type OutboxRecord,
  releaseLease,
  TASK_RUNS,
  type TaskRun,
  tryLease,
} from '@beautinique/backend-server-queue';
import type { AppId } from '@beautinique/shared-contracts';
import { Queue } from 'bullmq';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  CATCH_UP_ATTEMPTS,
  CATCH_UP_LEASE_MS,
  CATCH_UP_TASK,
  catchUpSweep,
} from '../src/rbac/catch-up.ts';
import { endGrantRecord, writeGrant } from '../src/rbac/grants.ts';
import { accessSnapshotsAgainMigration, accessSnapshotsMigration } from '../src/rbac/migrations.ts';
import { rbacSyncStep, type RoleRecord, ROLES } from '../src/rbac/sync.ts';
import { releaseDefinition } from '../src/release.ts';
import { QUEUE, SUBSCRIBERS } from '../src/runtime.ts';
import {
  type Answer,
  giveRole,
  grants,
  type Harness,
  makeAccount,
  oid,
  REDIS_URL,
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

  it('runs the first copy at a release, after the earlier migrations, and then once more (LIVE-006)', () => {
    expect(releaseDefinition.migrations.slice(-2).map((migration) => migration.id)).toEqual([
      accessSnapshotsMigration.id,
      accessSnapshotsAgainMigration.id,
    ]);
  });

  it('sends the first copy once more, every account with its grants (LIVE-006)', async () => {
    const userId = await makeAccount(email('again'), undefined, { everyApp: false });
    const { mongo } = harness.server.runtime;
    const before = (await snapshots('identity.user.changed', userId)).length;
    const grantsBefore = (await snapshots('identity.grant.changed', userId)).length;
    await accessSnapshotsAgainMigration.up({ mongo, logger: silent });
    expect(await snapshots('identity.user.changed', userId)).toHaveLength(before + 1);
    expect(await snapshots('identity.grant.changed', userId)).toHaveLength(grantsBefore + 1);
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

  describe('the catch-up sweep (T4.1)', () => {
    it('sends again the snapshot of each account changed lately, not of older ones', async () => {
      const recent = await makeAccount(email('sweep-recent'), undefined, { everyApp: false });
      const old = await makeAccount(email('sweep-old'), undefined, { everyApp: false });
      await users().updateOne(
        { _id: oid(old) },
        { $set: { updatedAt: new Date(Date.now() - 2 * 60 * 60_000) } },
      );
      const recentBefore = (await snapshots('identity.grant.changed', recent)).length;
      const oldBefore = (await snapshots('identity.grant.changed', old)).length;
      const accountBefore = (await snapshots('identity.user.changed', recent)).length;
      const { mongo } = harness.server.runtime;
      expect(await catchUpSweep(mongo, silent)).toBeGreaterThanOrEqual(1);
      const sent = await snapshots<GrantSnapshot>('identity.grant.changed', recent);
      expect(sent).toHaveLength(recentBefore + 1);
      // it changes nothing: the same version as the account's
      expect(sent.at(-1)?.authzVersion).toBe(
        (await users().findOne({ _id: oid(recent) }))?.authzVersion,
      );
      expect(await snapshots('identity.grant.changed', old)).toHaveLength(oldBefore);
      // and the account itself: one an old instance made has no copy in core yet
      expect(await snapshots('identity.user.changed', recent)).toHaveLength(accountBefore + 1);
    });

    it('skips while another instance sweeps', async () => {
      // an account changed just now: without the lease it would be sent
      const changed = await makeAccount(email('sweep-held'), undefined, { everyApp: false });
      const before = (await snapshots('identity.grant.changed', changed)).length;
      const { mongo } = harness.server.runtime;
      expect(await tryLease(mongo, 'identity.catchUpSweep', 'the other instance', 60_000)).toBe(
        true,
      );
      try {
        expect(await catchUpSweep(mongo, silent)).toBe(0);
        expect(await snapshots('identity.grant.changed', changed)).toHaveLength(before);
      } finally {
        await releaseLease(mongo, 'identity.catchUpSweep', 'the other instance');
      }
    });

    it('sends again the roles changed lately, before the accounts, not older ones', async () => {
      // what an old instance's role change leaves behind: a newer updatedAt and no snapshot
      const recent = await roleIdOf('admin.state_admin');
      const old = await roleIdOf('logistics.hub_manager');
      const roles = harness.db.collection<RoleRecord>(ROLES);
      const kept = await roles.findOne({ _id: old }, { projection: { updatedAt: 1 } });
      await roles.updateOne({ _id: recent }, { $set: { updatedAt: new Date() } });
      await roles.updateOne(
        { _id: old },
        { $set: { updatedAt: new Date(Date.now() - 2 * 60 * 60_000) } },
      );
      try {
        const account = await makeAccount(email('sweep-roles'), undefined, { everyApp: false });
        const recentBefore = (await snapshots('identity.role.changed', recent.toHexString()))
          .length;
        const oldBefore = (await snapshots('identity.role.changed', old.toHexString())).length;
        const { mongo } = harness.server.runtime;
        await catchUpSweep(mongo, silent);
        expect(await snapshots('identity.role.changed', recent.toHexString())).toHaveLength(
          recentBefore + 1,
        );
        expect(await snapshots('identity.role.changed', old.toHexString())).toHaveLength(oldBefore);
        // the role's snapshot goes out before the account's grants: core never meets a fresh
        // grants copy with an older copy of its role
        const lastOf = async (type: string, id: string) =>
          (
            await outbox()
              .find(
                { type, 'envelope.aggregate.id': id },
                { comment: 'full read: the test looks into the outbox' },
              )
              .sort({ _id: -1 })
              .limit(1)
              .toArray()
          )
            .at(0)
            ?._id.toHexString() ?? '';
        expect(await lastOf('identity.role.changed', recent.toHexString())).not.toBe('');
        expect(
          (await lastOf('identity.role.changed', recent.toHexString())) <
            (await lastOf('identity.grant.changed', account)),
        ).toBe(true);
      } finally {
        if (kept) await roles.updateOne({ _id: old }, { $set: { updatedAt: kept.updatedAt } });
      }
    });

    it("runs on the worker of identity's own queue", async () => {
      const changed = await makeAccount(email('sweep-worker'), undefined, { everyApp: false });
      const before = (await snapshots('identity.grant.changed', changed)).length;
      const runs = harness.db.collection<TaskRun>(TASK_RUNS);
      const finished = async () =>
        (await runs.findOne({ task: CATCH_UP_TASK }))?.lastFinishedAt?.getTime() ?? 0;
      const finishedBefore = await finished();
      const queue = new Queue(QUEUE, { connection: { url: REDIS_URL }, prefix: harness.prefix });
      try {
        // the run a start asks for, without waiting its 5 minutes
        await queue.add(CATCH_UP_TASK, { task: CATCH_UP_TASK }, { removeOnComplete: true });
        const deadline = Date.now() + 10_000;
        while ((await finished()) <= finishedBefore && Date.now() < deadline) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        expect(await finished()).toBeGreaterThan(finishedBefore);
        expect(await snapshots('identity.grant.changed', changed)).toHaveLength(before + 1);
      } finally {
        await queue.close();
      }
    });

    it("asks for it at each start, as a delayed job on identity's own queue", async () => {
      const queue = new Queue(QUEUE, { connection: { url: REDIS_URL }, prefix: harness.prefix });
      try {
        const delayed = (await queue.getDelayed()).find((job) => job.name === CATCH_UP_TASK);
        expect(delayed).toBeDefined();
        // a failed sweep runs again, never before a stuck run's lease has run out
        expect(delayed?.opts.attempts).toBe(CATCH_UP_ATTEMPTS);
        expect(delayed?.opts.backoff).toEqual({ type: 'exponential', delay: CATCH_UP_LEASE_MS });
      } finally {
        await queue.close();
      }
    });
  });
});
