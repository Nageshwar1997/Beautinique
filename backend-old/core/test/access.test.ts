// T3.5: core's copy of identity's roles, grants and accounts (ARCHITECTURE §5.2). The handlers run
// as the queue worker runs them, in a transaction on core's own database; the newest snapshot
// always stays, whatever order or how often events come (`npm run infra:up`).
import { LOOPBACK_HOST } from '@beautinique/backend-server-kit';
import { ObjectId, withTransaction } from '@beautinique/backend-server-mongo';
import type { Subscription } from '@beautinique/backend-server-queue';
import {
  type EventDefinition,
  grantsChanged,
  roleChanged,
  userChanged,
} from '@beautinique/shared-contracts';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { accessSubscriptions } from '../src/modules/platform/access.ts';
import {
  ACCESS_COPIES,
  type AccessCopy,
  ROLE_COPIES,
  type RoleCopy,
  USER_COPIES,
  type UserCopy,
} from '../src/modules/platform/index.ts';
import {
  type Inspector,
  inspector,
  isolation,
  type RunningCore,
  start,
  testConfig,
} from './support.ts';

const { dbName, prefix, epochKey } = isolation();
let look: Inspector;
let core: RunningCore;
let handlers: Map<string, Subscription>;

beforeAll(async () => {
  look = await inspector(dbName);
  core = await start(testConfig(dbName), {
    port: 0,
    host: LOOPBACK_HOST,
    handleSignals: false,
    runtime: { queuePrefix: prefix, epochKey, consume: false },
  });
  handlers = new Map(
    accessSubscriptions({ mongo: core.runtime.mongo }).map((one) => [one.subscriber, one]),
  );
});
afterEach(async () => {
  for (const name of [ROLE_COPIES, ACCESS_COPIES, USER_COPIES]) {
    await look.mongo.db.collection(name).deleteMany({});
  }
});
afterAll(async () => {
  await core.stop();
  await look.cleanUp(prefix, epochKey);
});

const hex = () => new ObjectId().toHexString();

/** Hands one event to a subscriber, as the queue worker does (in a transaction). */
async function deliver(subscriber: string, definition: EventDefinition, data: unknown) {
  const handler = handlers.get(subscriber);
  if (!handler) throw new Error(`no subscriber ${subscriber}`);
  const event = definition.envelope.parse({
    eventId: hex(),
    type: definition.type,
    version: definition.version,
    occurredAt: new Date().toISOString(),
    producer: 'identity',
    aggregate: { type: 'user', id: hex() },
    actor: { type: 'system', id: 'identity' },
    correlationId: hex(),
    causationId: null,
    scope: null,
    data,
  });
  const { mongo } = core.runtime;
  await withTransaction(mongo, (session) => handler.handle(event, session));
}

const accessOf = (userId: string) =>
  look.mongo.db.collection<AccessCopy>(ACCESS_COPIES).findOne({ _id: new ObjectId(userId) });

describe("core's copy of identity's access (T3.5)", () => {
  it('keeps an account grants as typed data, and the highest version only', async () => {
    const userId = hex();
    const roleId = hex();
    const grant = {
      grantId: hex(),
      roleId,
      app: 'admin',
      scope: { type: 'state', ids: ['MH'] },
      validFrom: null,
      validTo: '2027-01-01T00:00:00.000Z',
    };
    const own = {
      ...grant,
      grantId: hex(),
      app: 'customer',
      scope: { type: 'self', ids: [userId] },
    };
    await deliver('core.accessCopy', grantsChanged, {
      userId,
      authzVersion: 4,
      grants: [grant, own],
    });
    const copy = await accessOf(userId);
    expect(copy?.authzVersion).toBe(4);
    expect(copy?.grants).toEqual([
      {
        grantId: new ObjectId(grant.grantId),
        roleId: new ObjectId(roleId),
        app: 'admin',
        // a state is a code; an account is a document, so its ObjectId (RULES §4.17)
        scope: { type: 'state', ids: ['MH'] },
        validFrom: null,
        validTo: new Date('2027-01-01T00:00:00.000Z'),
      },
      {
        grantId: new ObjectId(own.grantId),
        roleId: new ObjectId(roleId),
        app: 'customer',
        scope: { type: 'self', ids: [new ObjectId(userId)] },
        validFrom: null,
        validTo: new Date('2027-01-01T00:00:00.000Z'),
      },
    ]);
    // a late, older snapshot never comes back
    await deliver('core.accessCopy', grantsChanged, { userId, authzVersion: 3, grants: [] });
    expect((await accessOf(userId))?.grants).toHaveLength(2);
    // a newer one replaces it, the same version again too (the first copy and a change agree)
    await deliver('core.accessCopy', grantsChanged, { userId, authzVersion: 5, grants: [] });
    expect(await accessOf(userId)).toMatchObject({ authzVersion: 5, grants: [] });
    await deliver('core.accessCopy', grantsChanged, { userId, authzVersion: 5, grants: [grant] });
    expect((await accessOf(userId))?.grants).toHaveLength(1);
  });

  it('keeps the newest role, with its permission keys', async () => {
    const roleId = hex();
    const role = {
      roleId,
      key: 'master.c_desk_lead',
      app: 'master',
      permissions: ['iam.app.sign_in', 'iam.grant.read'],
      scopeTypes: ['global'],
      mfaRequired: true,
      retired: false,
      changedAt: '2026-11-14T10:00:00.000Z',
    };
    const roles = look.mongo.db.collection<RoleCopy>(ROLE_COPIES);
    await deliver('core.roleCopy', roleChanged, role);
    await deliver('core.roleCopy', roleChanged, {
      ...role,
      permissions: ['iam.app.sign_in'],
      changedAt: '2026-11-14T09:00:00.000Z',
    });
    expect(await roles.findOne({ _id: new ObjectId(roleId) })).toEqual({
      _id: new ObjectId(roleId),
      key: 'master.c_desk_lead',
      app: 'master',
      permissions: ['iam.app.sign_in', 'iam.grant.read'],
      scopeTypes: ['global'],
      mfaRequired: true,
      retired: false,
      changedAt: new Date('2026-11-14T10:00:00.000Z'),
    });
    await deliver('core.roleCopy', roleChanged, {
      ...role,
      retired: true,
      changedAt: '2026-11-14T11:00:00.000Z',
    });
    expect((await roles.findOne({ _id: new ObjectId(roleId) }))?.retired).toBe(true);
  });

  it('keeps the newest account, and a repeated event changes nothing', async () => {
    const userId = hex();
    const user = {
      userId,
      email: 'asha@beautinique.example',
      status: 'active',
      createdAt: '2026-11-14T10:00:00.000Z',
      changedAt: '2026-11-14T10:00:00.000Z',
    };
    await deliver('core.userCopy', userChanged, user);
    await deliver('core.userCopy', userChanged, user);
    const users = look.mongo.db.collection<UserCopy>(USER_COPIES);
    expect(await users.find({}).toArray()).toEqual([
      {
        _id: new ObjectId(userId),
        email: 'asha@beautinique.example',
        status: 'active',
        createdAt: new Date('2026-11-14T10:00:00.000Z'),
        changedAt: new Date('2026-11-14T10:00:00.000Z'),
      },
    ]);
  });

  it('takes a value that looks like an expression as plain data', async () => {
    const roleId = hex();
    // without $literal, '$changedAt' would be read as the stored field, not a permission key
    await deliver('core.roleCopy', roleChanged, {
      roleId,
      key: 'master.c_odd',
      app: 'master',
      permissions: ['$changedAt', '$$ROOT'],
      scopeTypes: ['global'],
      mfaRequired: false,
      retired: false,
      changedAt: '2026-11-14T10:00:00.000Z',
    });
    const roles = look.mongo.db.collection<RoleCopy>(ROLE_COPIES);
    expect((await roles.findOne({ _id: new ObjectId(roleId) }))?.permissions).toEqual([
      '$changedAt',
      '$$ROOT',
    ]);
  });
});
