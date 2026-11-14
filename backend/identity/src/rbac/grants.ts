import { AppError } from '@beautinique/backend-server-kit';
import {
  type ClientSession,
  type IndexSpec,
  type Mongo,
  ObjectId,
} from '@beautinique/backend-server-mongo';
import { writeEvent } from '@beautinique/backend-server-queue';
import {
  ACCESS_TOKEN_SECONDS,
  type AppId,
  authzVersionKey,
  CODE_SCOPE_TYPES,
  type GRANT_VIA,
  grantsChanged,
  MAX_GRANTS_PER_ACCOUNT,
  type ScopeType,
} from '@beautinique/shared-contracts';
import type { Redis } from 'ioredis';

import { type User, USERS } from '../users.ts';
import { rbacCatalog } from './catalog.ts';
import { SIGN_UP_ROLES } from './roles.ts';
import { readRoles, type RoleRecord, ROLES, SYSTEM_ACTOR } from './sync.ts';

export const GRANTS = 'identity_grants';
export const GRANT_LOG = 'identity_grant_log';

export type GrantVia = (typeof GRANT_VIA)[number];

/** A scope as routes and shared-authz see it: its ids as strings. */
export interface Scope {
  type: ScopeType;
  ids: string[];
}

/**
 * A scope as identity keeps it: ids that name a document (an account for `self`, a seller
 * organisation, a brand ...) are ObjectIds (owner, 2026-11-12); a state is a contracts code (MH),
 * and `global` names none.
 */
export interface StoredScope {
  type: ScopeType;
  ids: (ObjectId | string)[];
}

/** The scope to store; its document ids must be 24 hex already (scopeIdProblems checks them). */
export function storedScope(scope: Scope): StoredScope {
  return CODE_SCOPE_TYPES.has(scope.type)
    ? { type: scope.type, ids: [...scope.ids] }
    : { type: scope.type, ids: scope.ids.map((id) => new ObjectId(id)) };
}

/** A stored scope as routes and shared-authz see it. */
export function scopeOf(scope: StoredScope): Scope {
  return {
    type: scope.type,
    ids: scope.ids.map((id) => (typeof id === 'string' ? id : id.toHexString())),
  };
}

/**
 * A role given to an account for a scope, for a time (ARCHITECTURE §7.3). Ending one keeps the
 * record (`active: false`) for audit; at most one active grant per account, role and scope id.
 * Every id in it is an ObjectId (owner, 2026-11-12).
 */
export interface GrantRecord {
  _id: ObjectId;
  userId: ObjectId;
  roleId: ObjectId;
  /** The role's app (identity_apps), so sign-in asks one index */
  appId: ObjectId;
  scope: StoredScope;
  validFrom: Date | null;
  validTo: Date | null;
  /** Who gave it; null = identity itself (sign-up, a migration, the Master command) */
  grantedBy: ObjectId | null;
  /** The second person, where the role needs one */
  approvedBy: ObjectId | null;
  /** How it came (contracts GRANT_VIA) */
  via: GrantVia;
  active: boolean;
  createdAt: Date;
  endedAt: Date | null;
  endedBy: ObjectId | null;
}

/** One line of the grant history: what changed, by whom, when. Never changed or deleted. */
export interface GrantLogEntry {
  _id: ObjectId;
  grantId: ObjectId;
  userId: ObjectId;
  roleId: ObjectId;
  scope: StoredScope;
  action: 'granted' | 'ended';
  by: ObjectId | null;
  via: GrantVia;
  at: Date;
}

export const indexes: readonly IndexSpec[] = [
  {
    collection: GRANTS,
    name: 'userId_appId_active',
    key: { userId: 1, appId: 1, active: 1 },
  },
  {
    collection: GRANTS,
    name: 'active_roleId_scope_unique',
    key: { userId: 1, roleId: 1, 'scope.type': 1, 'scope.ids': 1 },
    unique: true,
    partialFilterExpression: { active: true },
  },
  { collection: GRANTS, name: 'roleId_active', key: { roleId: 1, active: 1 } },
  { collection: GRANT_LOG, name: 'userId_at', key: { userId: 1, at: -1 } },
];

const grantsOf = (mongo: Mongo) => mongo.db.collection<GrantRecord>(GRANTS);

/** An account's grants that count now or later: active, and not run out (an account's snapshot, the cap). */
const heldFrom = (userId: ObjectId, now: Date) => ({
  userId,
  active: true,
  $or: [{ validTo: null }, { validTo: { $gt: now } }],
});
const logOf = (mongo: Mongo) => mongo.db.collection<GrantLogEntry>(GRANT_LOG);

/**
 * Goes up at every grant change of the account: the next access token carries it as `av`, and
 * the account's grants snapshot goes out with it in the same transaction (TASKS T3.5).
 */
export async function raiseAuthzVersion(
  mongo: Mongo,
  session: ClientSession,
  userId: ObjectId,
  now: Date,
): Promise<void> {
  const user = await mongo.db
    .collection<User>(USERS)
    .findOneAndUpdate(
      { _id: userId },
      { $inc: { authzVersion: 1 }, $set: { updatedAt: now } },
      { session, returnDocument: 'after', projection: { authzVersion: 1 } },
    );
  if (!user) return;
  await writeAccessSnapshot(mongo, session, userId, user.authzVersion ?? 0, now);
}

/**
 * Writes the account's grants snapshot (identity.grant.changed, ARCHITECTURE §5.2): every grant
 * active now or starting later, each with its role's id, and the account's authz version. Core
 * keeps the one with the highest version for authorize(); a role's permissions come in its own
 * snapshot (sync.ts).
 */
export async function writeAccessSnapshot(
  mongo: Mongo,
  session: ClientSession,
  userId: ObjectId,
  authzVersion: number,
  now: Date,
): Promise<void> {
  const grants = await grantsOf(mongo).find(heldFrom(userId, now), { session }).toArray();
  const catalog = await rbacCatalog(mongo);
  await writeEvent(mongo, session, grantsChanged, {
    aggregate: { type: 'user', id: userId.toHexString() },
    actor: SYSTEM_ACTOR,
    correlationId: new ObjectId().toHexString(),
    data: {
      userId: userId.toHexString(),
      authzVersion,
      grants: grants.map((grant) => ({
        grantId: grant._id.toHexString(),
        roleId: grant.roleId.toHexString(),
        app: catalog.appOf(grant.appId),
        scope: scopeOf(grant.scope),
        validFrom: grant.validFrom?.toISOString() ?? null,
        validTo: grant.validTo?.toISOString() ?? null,
      })),
    },
  });
}

/** An active grant of the account and role that shares a scope id with `scope` (or is it). */
export function overlapping(userId: ObjectId, roleId: ObjectId, scope: Scope) {
  const { ids } = storedScope(scope);
  return {
    userId,
    roleId,
    active: true,
    'scope.type': scope.type,
    ...(ids.length === 0 ? { 'scope.ids': { $size: 0 } } : { 'scope.ids': { $in: ids } }),
  };
}

export interface NewGrant {
  userId: ObjectId;
  roleId: ObjectId;
  appId: ObjectId;
  scope: Scope;
  via: GrantVia;
  now: Date;
  grantedBy?: ObjectId | null;
  approvedBy?: ObjectId | null;
  validFrom?: Date | null;
  validTo?: Date | null;
}

/**
 * Writes a grant once: a second call for the same account, role and scope finds the first (an
 * upsert on the whole scope), and an overlapping one is left alone. A new grant is logged and
 * raises the account's authz version (ARCHITECTURE §7.2). The new grant's id, or null when the
 * account holds the role there already.
 */
export async function writeGrant(
  mongo: Mongo,
  session: ClientSession,
  grant: NewGrant,
): Promise<ObjectId | null> {
  const { userId, roleId, appId, scope, via, now } = grant;
  if (await grantsOf(mongo).findOne(overlapping(userId, roleId, scope), { session })) return null;
  // the account's snapshot carries all its grants (TASKS T3.5): a cap keeps it inside one event
  const held = await grantsOf(mongo).countDocuments(heldFrom(userId, now), {
    session,
    limit: MAX_GRANTS_PER_ACCOUNT,
  });
  if (held >= MAX_GRANTS_PER_ACCOUNT) {
    throw new AppError(
      'CONFLICT',
      `This account holds the most roles it can (${String(MAX_GRANTS_PER_ACCOUNT)}): end one first.`,
    );
  }
  const _id = new ObjectId();
  const stored = storedScope(scope);
  // equality on the whole scope: an insert takes it from the filter, and a second call finds it
  const written = await grantsOf(mongo).updateOne(
    { userId, roleId, 'scope.type': stored.type, 'scope.ids': stored.ids, active: true },
    {
      $setOnInsert: {
        _id,
        appId,
        validFrom: grant.validFrom ?? null,
        validTo: grant.validTo ?? null,
        grantedBy: grant.grantedBy ?? null,
        approvedBy: grant.approvedBy ?? null,
        via,
        createdAt: now,
        endedAt: null,
        endedBy: null,
      },
    },
    { upsert: true, session },
  );
  if (written.upsertedCount !== 1) return null;
  await logOf(mongo).insertOne(
    {
      _id: new ObjectId(),
      grantId: _id,
      userId,
      roleId,
      scope: stored,
      action: 'granted',
      by: grant.grantedBy ?? null,
      via,
      at: now,
    },
    { session },
  );
  await raiseAuthzVersion(mongo, session, userId, now);
  return _id;
}

export interface NewSystemGrant {
  userId: ObjectId;
  /** The role's key (its id and app are looked up) */
  role: string;
  scope: Scope;
  via: 'sign-up' | 'migration' | 'bootstrap';
  now: Date;
}

/** A grant from identity itself (no appointer): true when it was new. */
export async function giveSystemGrant(
  mongo: Mongo,
  session: ClientSession,
  { role: key, ...grant }: NewSystemGrant,
): Promise<boolean> {
  const role = await mongo.db
    .collection<RoleRecord>(ROLES)
    .findOne({ key }, { session, projection: { _id: 1, appId: 1 } });
  if (!role) throw new Error(`Role ${key} is not there: run db:release first.`);
  return (
    (await writeGrant(mongo, session, { ...grant, roleId: role._id, appId: role.appId })) !== null
  );
}

/**
 * The role an account gets for signing up in the app (scope self): Customer after the 18+
 * declaration, a Seller or Creator applicant otherwise (ARCHITECTURE §7.1). Nothing for an app
 * without sign-up. True when it was new.
 */
export async function giveSignUpGrant(
  mongo: Mongo,
  session: ClientSession,
  { userId, app, now }: { userId: ObjectId; app: AppId; now: Date },
): Promise<boolean> {
  const role = SIGN_UP_ROLES[app];
  if (role === undefined) return false;
  return giveSystemGrant(mongo, session, {
    userId,
    role,
    scope: { type: 'self', ids: [userId.toHexString()] },
    via: 'sign-up',
    now,
  });
}

/**
 * Ends an active grant: kept for audit, logged, and the account's authz version goes up. The
 * ended grant, or null when it was not active.
 */
export async function endGrantRecord(
  mongo: Mongo,
  session: ClientSession,
  { grantId, by, now }: { grantId: ObjectId; by: ObjectId | null; now: Date },
): Promise<GrantRecord | null> {
  const ended = await grantsOf(mongo).findOneAndUpdate(
    { _id: grantId, active: true },
    { $set: { active: false, endedAt: now, endedBy: by } },
    { session, returnDocument: 'after' },
  );
  if (!ended) return null;
  await logOf(mongo).insertOne(
    {
      _id: new ObjectId(),
      grantId,
      userId: ended.userId,
      roleId: ended.roleId,
      scope: ended.scope,
      action: 'ended',
      by,
      via: ended.via,
      at: now,
    },
    { session },
  );
  await raiseAuthzVersion(mongo, session, ended.userId, now);
  return ended;
}

/**
 * Sets the account's version, never lower (two changes may finish in any order), for as long as
 * an access token lives: after that every older token has run out anyway.
 */
const PUBLISH = `
local current = tonumber(redis.call('GET', KEYS[1]) or '-1')
if tonumber(ARGV[1]) > current then redis.call('SET', KEYS[1], ARGV[1], 'PX', ARGV[2]) end
return 1
`;
const PUBLISH_TTL_MS = (ACCESS_TOKEN_SECONDS + 60) * 1000;

/**
 * Tells the gateway, after the change committed, that these accounts' grants changed: their
 * access tokens with an older `av` stop at once, and the app refreshes (ARCHITECTURE §7.2).
 */
export async function publishAuthzVersions(
  mongo: Mongo,
  redis: Redis,
  userIds: readonly ObjectId[],
): Promise<void> {
  if (userIds.length === 0) return;
  const unique = [...new Map(userIds.map((id) => [id.toHexString(), id])).values()];
  const users = await mongo.db
    .collection<User>(USERS)
    .find({ _id: { $in: unique } }, { projection: { authzVersion: 1 } })
    .toArray();
  for (const user of users) {
    await redis.eval(
      PUBLISH,
      1,
      authzVersionKey(user._id.toHexString()),
      String(user.authzVersion ?? 0),
      String(PUBLISH_TTL_MS),
    );
  }
}

/** What an account may do at sign-in to an app. */
export interface SignInAccess {
  /** It holds an active grant there (ARCHITECTURE §7.1: sign-in only where a grant is) */
  allowed: boolean;
  /** One of those grants' roles asks an authenticator (Seller Account Owner, Seller Finance ...) */
  mfaRequired: boolean;
  /** The account's authz version, for the access token's `av` */
  authzVersion: number;
  /** The permission keys of those grants' roles: the gateway's coarse check (T3.3) */
  permissions: string[];
}

/** Active now: started, not ended, not run out. */
export const activeAt = (now: Date) => ({
  active: true,
  $and: [
    { $or: [{ validFrom: null }, { validFrom: { $lte: now } }] },
    { $or: [{ validTo: null }, { validTo: { $gt: now } }] },
  ],
});

/**
 * The account's grants in the app, read at every sign-in and refresh. A grant of a retired role
 * no longer counts.
 */
export async function signInAccess(
  mongo: Mongo,
  { userId, app, now = new Date() }: { userId: ObjectId; app: AppId; now?: Date },
): Promise<SignInAccess> {
  const user = await mongo.db
    .collection<User>(USERS)
    .findOne({ _id: userId }, { projection: { authzVersion: 1, status: 1 } });
  const authzVersion = user?.authzVersion ?? 0;
  const none = { allowed: false, mfaRequired: false, authzVersion, permissions: [] };
  if (user?.status !== 'active') return none;
  const appId = (await rbacCatalog(mongo)).appId(app);
  const grants = await grantsOf(mongo)
    .find({ userId, appId, ...activeAt(now) }, { projection: { roleId: 1 } })
    .toArray();
  if (grants.length === 0) return none;
  const roles = await readRoles(mongo, {
    _id: { $in: grants.map((grant) => grant.roleId) },
    retired: false,
  });
  if (roles.length === 0) return none;
  return {
    allowed: true,
    mfaRequired: roles.some((role) => role.mfaRequired),
    authzVersion,
    permissions: [...new Set(roles.flatMap((role) => role.permissions))].sort(),
  };
}

/** A role an account holds in an app now, with where (GET /iam/me). */
export interface HeldRole {
  role: string;
  name: string;
  scope: Scope;
}

/**
 * What the account may do in the app now (GET /iam/me, TASKS T3.7): the roles of its active grants
 * there, each with its scope, and their permission keys, as at sign-in (a retired role no longer
 * counts). The app shows only what these allow; every route still checks for itself.
 */
export async function appAccess(
  mongo: Mongo,
  { userId, app, now = new Date() }: { userId: ObjectId; app: AppId; now?: Date },
): Promise<{ roles: HeldRole[]; permissions: string[] }> {
  const appId = (await rbacCatalog(mongo)).appId(app);
  const grants = await grantsOf(mongo)
    .find({ userId, appId, ...activeAt(now) }, { projection: { roleId: 1, scope: 1 } })
    .toArray();
  if (grants.length === 0) return { roles: [], permissions: [] };
  const roles = await readRoles(mongo, {
    _id: { $in: grants.map((grant) => grant.roleId) },
    retired: false,
  });
  const byId = new Map(roles.map((role) => [role._id.toHexString(), role]));
  const held = grants.flatMap((grant) => {
    const role = byId.get(grant.roleId.toHexString());
    return role ? [{ role: role.key, name: role.name, scope: scopeOf(grant.scope) }] : [];
  });
  return {
    roles: held.toSorted(
      (a, b) =>
        a.role.localeCompare(b.role) || a.scope.ids.join().localeCompare(b.scope.ids.join()),
    ),
    permissions: [...new Set(roles.flatMap((role) => role.permissions))].sort(),
  };
}
