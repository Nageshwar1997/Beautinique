import type { ClientSession, IndexSpec, Mongo } from '@beautinique/backend-server-mongo';
import {
  ACCESS_TOKEN_SECONDS,
  type AppId,
  authzVersionKey,
  type GRANT_VIA,
  type ScopeType,
} from '@beautinique/shared-contracts';
import { uuidv7 } from '@beautinique/shared-utils';
import type { Redis } from 'ioredis';

import { type User, USERS } from '../users.ts';
import { SIGN_UP_ROLES } from './roles.ts';
import { type RoleRecord, ROLES } from './sync.ts';

export const GRANTS = 'identity_grants';
export const GRANT_LOG = 'identity_grant_log';

export type GrantVia = (typeof GRANT_VIA)[number];
export interface Scope {
  type: ScopeType;
  ids: string[];
}

/**
 * A role given to an account for a scope, for a time (ARCHITECTURE §7.3). Ending one keeps the
 * record (`active: false`) for audit; at most one active grant per account, role and scope id.
 */
export interface GrantRecord {
  _id: string;
  userId: string;
  role: string;
  /** The role's app, so sign-in asks one index */
  app: AppId;
  scope: Scope;
  validFrom: Date | null;
  validTo: Date | null;
  /** Who gave it; null = identity itself (sign-up, a migration, the Master command) */
  grantedBy: string | null;
  /** The second person, where the role needs one */
  approvedBy: string | null;
  /** How it came (contracts GRANT_VIA) */
  via: GrantVia;
  active: boolean;
  createdAt: Date;
  endedAt: Date | null;
  endedBy: string | null;
}

/** One line of the grant history: what changed, by whom, when. Never changed or deleted. */
export interface GrantLogEntry {
  _id: string;
  grantId: string;
  userId: string;
  role: string;
  scope: Scope;
  action: 'granted' | 'ended';
  by: string | null;
  via: GrantVia;
  at: Date;
}

export const indexes: readonly IndexSpec[] = [
  { collection: GRANTS, name: 'userId_app_active', key: { userId: 1, app: 1, active: 1 } },
  {
    collection: GRANTS,
    name: 'active_role_scope_unique',
    key: { userId: 1, role: 1, 'scope.type': 1, 'scope.ids': 1 },
    unique: true,
    partialFilterExpression: { active: true },
  },
  { collection: GRANTS, name: 'role_active', key: { role: 1, active: 1 } },
  { collection: GRANT_LOG, name: 'userId_at', key: { userId: 1, at: -1 } },
];

const grantsOf = (mongo: Mongo) => mongo.db.collection<GrantRecord>(GRANTS);
const logOf = (mongo: Mongo) => mongo.db.collection<GrantLogEntry>(GRANT_LOG);

/** Goes up at every grant change of the account: the next access token carries it as `av`. */
export async function raiseAuthzVersion(
  mongo: Mongo,
  session: ClientSession,
  userId: string,
  now: Date,
): Promise<void> {
  await mongo.db
    .collection<User>(USERS)
    .updateOne(
      { _id: userId },
      { $inc: { authzVersion: 1 }, $set: { updatedAt: now } },
      { session },
    );
}

/** An active grant of the account and role that shares a scope id with `scope` (or is it). */
export function overlapping(userId: string, role: string, scope: Scope) {
  return {
    userId,
    role,
    active: true,
    'scope.type': scope.type,
    ...(scope.ids.length === 0
      ? { 'scope.ids': { $size: 0 } }
      : { 'scope.ids': { $in: scope.ids } }),
  };
}

export interface NewGrant {
  userId: string;
  role: string;
  app: AppId;
  scope: Scope;
  via: GrantVia;
  now: Date;
  grantedBy?: string | null;
  approvedBy?: string | null;
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
): Promise<string | null> {
  const { userId, role, app, scope, via, now } = grant;
  if (await grantsOf(mongo).findOne(overlapping(userId, role, scope), { session })) return null;
  const _id = uuidv7();
  // equality on the whole scope: an insert takes it from the filter, and a second call finds it
  const written = await grantsOf(mongo).updateOne(
    { userId, role, 'scope.type': scope.type, 'scope.ids': scope.ids, active: true },
    {
      $setOnInsert: {
        _id,
        app,
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
      _id: uuidv7(),
      grantId: _id,
      userId,
      role,
      scope,
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
  userId: string;
  role: string;
  app: AppId;
  scope: Scope;
  via: 'sign-up' | 'migration' | 'bootstrap';
  now: Date;
}

/** A grant from identity itself (no appointer): true when it was new. */
export async function giveSystemGrant(
  mongo: Mongo,
  session: ClientSession,
  grant: NewSystemGrant,
): Promise<boolean> {
  return (await writeGrant(mongo, session, grant)) !== null;
}

/**
 * The role an account gets for signing up in the app (scope self): Customer after the 18+
 * declaration, a Seller or Creator applicant otherwise (ARCHITECTURE §7.1). Nothing for an app
 * without sign-up. True when it was new.
 */
export async function giveSignUpGrant(
  mongo: Mongo,
  session: ClientSession,
  { userId, app, now }: { userId: string; app: AppId; now: Date },
): Promise<boolean> {
  const role = SIGN_UP_ROLES[app];
  if (role === undefined) return false;
  return giveSystemGrant(mongo, session, {
    userId,
    role,
    app,
    scope: { type: 'self', ids: [userId] },
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
  { grantId, by, now }: { grantId: string; by: string | null; now: Date },
): Promise<GrantRecord | null> {
  const ended = await grantsOf(mongo).findOneAndUpdate(
    { _id: grantId, active: true },
    { $set: { active: false, endedAt: now, endedBy: by } },
    { session, returnDocument: 'after' },
  );
  if (!ended) return null;
  await logOf(mongo).insertOne(
    {
      _id: uuidv7(),
      grantId,
      userId: ended.userId,
      role: ended.role,
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
  userIds: readonly string[],
): Promise<void> {
  if (userIds.length === 0) return;
  const users = await mongo.db
    .collection<User>(USERS)
    .find({ _id: { $in: [...new Set(userIds)] } }, { projection: { authzVersion: 1 } })
    .toArray();
  for (const user of users) {
    await redis.eval(
      PUBLISH,
      1,
      authzVersionKey(user._id),
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
  { userId, app, now = new Date() }: { userId: string; app: AppId; now?: Date },
): Promise<SignInAccess> {
  const user = await mongo.db
    .collection<User>(USERS)
    .findOne({ _id: userId }, { projection: { authzVersion: 1, status: 1 } });
  const authzVersion = user?.authzVersion ?? 0;
  const none = { allowed: false, mfaRequired: false, authzVersion, permissions: [] };
  if (user?.status !== 'active') return none;
  const grants = await grantsOf(mongo)
    .find({ userId, app, ...activeAt(now) }, { projection: { role: 1 } })
    .toArray();
  if (grants.length === 0) return none;
  const roles = await mongo.db
    .collection<RoleRecord>(ROLES)
    .find(
      { _id: { $in: grants.map((grant) => grant.role) }, retired: false },
      { projection: { mfaRequired: 1, permissions: 1 } },
    )
    .toArray();
  if (roles.length === 0) return none;
  return {
    allowed: true,
    mfaRequired: roles.some((role) => role.mfaRequired),
    authzVersion,
    permissions: [...new Set(roles.flatMap((role) => role.permissions))].sort(),
  };
}
