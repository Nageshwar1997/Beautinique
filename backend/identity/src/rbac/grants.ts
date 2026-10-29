import type { ClientSession, IndexSpec, Mongo } from '@beautinique/backend-server-mongo';
import type { AppId, ScopeType } from '@beautinique/shared-contracts';
import { uuidv7 } from '@beautinique/shared-utils';

import { type User, USERS } from '../users.ts';
import { SIGN_UP_ROLES } from './roles.ts';
import { type RoleRecord, ROLES } from './sync.ts';

export const GRANTS = 'identity_grants';
export const GRANT_LOG = 'identity_grant_log';

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
  scope: { type: ScopeType; ids: string[] };
  validFrom: Date | null;
  validTo: Date | null;
  /** Who gave it; null = identity itself (sign-up, a migration, the Master command) */
  grantedBy: string | null;
  /** The second person, where the role needs one */
  approvedBy: string | null;
  /** How it came: `sign-up`, `migration`, `bootstrap` or `appointed` */
  via: 'sign-up' | 'migration' | 'bootstrap' | 'appointed';
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
  scope: GrantRecord['scope'];
  action: 'granted' | 'ended';
  by: string | null;
  via: GrantRecord['via'];
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

export interface NewSystemGrant {
  userId: string;
  role: string;
  app: AppId;
  scope: GrantRecord['scope'];
  via: Exclude<GrantRecord['via'], 'appointed'>;
  now: Date;
}

/**
 * Gives a role from identity itself, once: a second call for the same account, role and scope
 * finds the first. A new grant is logged and raises the account's authz version (ARCHITECTURE
 * §7.2), so the next access token carries it. True when it was new.
 */
export async function giveSystemGrant(
  mongo: Mongo,
  session: ClientSession,
  { userId, role, app, scope, via, now }: NewSystemGrant,
): Promise<boolean> {
  const _id = uuidv7();
  // equality on the whole scope: an insert takes it from the filter, and a second call finds it
  const written = await mongo.db.collection<GrantRecord>(GRANTS).updateOne(
    { userId, role, 'scope.type': scope.type, 'scope.ids': scope.ids, active: true },
    {
      $setOnInsert: {
        _id,
        app,
        validFrom: null,
        validTo: null,
        grantedBy: null,
        approvedBy: null,
        via,
        createdAt: now,
        endedAt: null,
        endedBy: null,
      },
    },
    { upsert: true, session },
  );
  if (written.upsertedCount !== 1) return false;
  await mongo.db.collection<GrantLogEntry>(GRANT_LOG).insertOne(
    {
      _id: uuidv7(),
      grantId: _id,
      userId,
      role,
      scope,
      action: 'granted',
      by: null,
      via,
      at: now,
    },
    { session },
  );
  await mongo.db
    .collection<User>(USERS)
    .updateOne(
      { _id: userId },
      { $inc: { authzVersion: 1 }, $set: { updatedAt: now } },
      { session },
    );
  return true;
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

/** What an account may do at sign-in to an app. */
export interface SignInAccess {
  /** It holds an active grant there (ARCHITECTURE §7.1: sign-in only where a grant is) */
  allowed: boolean;
  /** One of those grants' roles asks an authenticator (Seller Account Owner, Seller Finance ...) */
  mfaRequired: boolean;
  /** The account's authz version, for the access token's `av` */
  authzVersion: number;
}

/** Active now: started, not ended, not run out. */
export const activeAt = (now: Date) => ({
  active: true,
  $and: [
    { $or: [{ validFrom: null }, { validFrom: { $lte: now } }] },
    { $or: [{ validTo: null }, { validTo: { $gt: now } }] },
  ],
});

/** The account's grants in the app, read at every sign-in and refresh. */
export async function signInAccess(
  mongo: Mongo,
  { userId, app, now = new Date() }: { userId: string; app: AppId; now?: Date },
): Promise<SignInAccess> {
  const user = await mongo.db
    .collection<User>(USERS)
    .findOne({ _id: userId }, { projection: { authzVersion: 1, status: 1 } });
  const authzVersion = user?.authzVersion ?? 0;
  if (user?.status !== 'active') return { allowed: false, mfaRequired: false, authzVersion };
  const grants = await mongo.db
    .collection<GrantRecord>(GRANTS)
    .find({ userId, app, ...activeAt(now) }, { projection: { role: 1 } })
    .toArray();
  if (grants.length === 0) return { allowed: false, mfaRequired: false, authzVersion };
  const strict = await mongo.db
    .collection<RoleRecord>(ROLES)
    .countDocuments({ _id: { $in: grants.map((grant) => grant.role) }, mfaRequired: true });
  return { allowed: true, mfaRequired: strict > 0, authzVersion };
}
