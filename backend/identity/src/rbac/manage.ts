import { AppError, type Logger, type Passport } from '@beautinique/backend-server-kit';
import { type Mongo, withTransaction } from '@beautinique/backend-server-mongo';
import {
  type AppId,
  appSignIn,
  grantManage,
  grantRead,
  roleManage,
  type ScopeType,
} from '@beautinique/shared-contracts';
import type { Redis } from 'ioredis';

import { type User, USERS } from '../users.ts';
import {
  appointingGrant,
  callerGrants,
  forbidden,
  grantShapeProblems,
  requirePermission,
  type ScopeProblem,
  visibleFilter,
} from './authority.ts';
import {
  endGrantRecord,
  type GrantRecord,
  GRANTS,
  publishAuthzVersions,
  type Scope,
  writeGrant,
} from './grants.ts';
import { CUSTOM_PREFIX, roleProblems, type RoleRecord, ROLES } from './sync.ts';

export interface ManageDeps {
  mongo: Mongo;
  redis: Redis;
  logger: Logger;
}

export const validationFailed = (details: ScopeProblem[]): AppError =>
  new AppError('VALIDATION_FAILED', 'Please check the highlighted fields.', { details });
export const notFound = (what: string): AppError => new AppError('NOT_FOUND', `${what} not found.`);
export const conflict = (message: string): AppError => new AppError('CONFLICT', message);

/** A unique index said no: two requests at once wrote the same thing. */
export const isDuplicateKey = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  ((error as { code?: unknown }).code === 11000 ||
    (error as { mongoCode?: unknown }).mongoCode === 11000);

export const rolesOf = (mongo: Mongo) => mongo.db.collection<RoleRecord>(ROLES);
const grantsOf = (mongo: Mongo) => mongo.db.collection<GrantRecord>(GRANTS);
const usersOf = (mongo: Mongo) => mongo.db.collection<User>(USERS);

export function roleView(role: RoleRecord) {
  return {
    key: role._id,
    app: role.app,
    name: role.name,
    main: role.main,
    scopeTypes: [...role.scopeTypes],
    permissions: [...role.permissions],
    appointedBy: [...role.appointedBy],
    mfaRequired: role.mfaRequired,
    signUp: role.signUp,
    maxHolders: role.maxHolders,
    system: role.system,
    retired: role.retired,
  };
}

export function grantView(grant: GrantRecord, email: string) {
  return {
    grantId: grant._id,
    userId: grant.userId,
    email,
    role: grant.role,
    app: grant.app,
    scope: { type: grant.scope.type, ids: [...grant.scope.ids] },
    validFrom: grant.validFrom?.toISOString() ?? null,
    validTo: grant.validTo?.toISOString() ?? null,
    grantedBy: grant.grantedBy,
    via: grant.via,
    active: grant.active,
    createdAt: grant.createdAt.toISOString(),
    endedAt: grant.endedAt?.toISOString() ?? null,
  };
}

/** The caller's grants where they act, the passport's app. */
const callerOf = (deps: ManageDeps, passport: Passport, now: Date) =>
  callerGrants(deps.mongo, { userId: passport.userId, app: passport.app, now });

/** GET /iam/roles: every role (or one app's), for whoever reads grants. */
export async function listRoles(
  deps: ManageDeps,
  passport: Passport,
  { app }: { app?: AppId | undefined },
) {
  requirePermission(await callerOf(deps, passport, new Date()), grantRead.key);
  const roles = await rolesOf(deps.mongo)
    .find(app === undefined ? {} : { app })
    .sort({ _id: 1 })
    .toArray();
  return { roles: roles.map(roleView) };
}

/**
 * What is wrong with a sub-role Master makes or changes: what is wrong with any role (sync.ts
 * roleProblems, against the roles that are not retired), and it never makes roles itself (only
 * the shipped Master role does).
 */
function customRoleProblems(role: RoleRecord, others: readonly RoleRecord[]): ScopeProblem[] {
  const byKey = new Map(others.map((other) => [other._id, other]));
  byKey.set(role._id, role);
  const problems = roleProblems({ ...role, key: role._id }, byKey).map(({ field, message }) => ({
    path: [field],
    message,
  }));
  if (role.permissions.includes(roleManage.key)) {
    problems.push({ path: ['permissions'], message: 'Only Master makes roles' });
  }
  return problems;
}

const withSignIn = (keys: readonly string[]) => [
  appSignIn.key,
  ...new Set(keys.filter((key) => key !== appSignIn.key)),
];

export interface NewRole {
  app: AppId;
  slug: string;
  name: string;
  scopeTypes: ScopeType[];
  permissions: string[];
  appointedBy: string[];
  mfaRequired: boolean;
}

/** POST /iam/roles: a sub-role without a deploy, `<app>.c_<slug>` (ARCHITECTURE §7.3). */
export async function createRole(deps: ManageDeps, passport: Passport, body: NewRole) {
  const now = new Date();
  requirePermission(await callerOf(deps, passport, now), roleManage.key);
  const roles = rolesOf(deps.mongo);
  const key = `${body.app}.${CUSTOM_PREFIX}${body.slug}`;
  if (await roles.findOne({ _id: key }, { projection: { _id: 1 } })) {
    throw conflict('A role with this name exists in this app already.');
  }
  const role: RoleRecord = {
    _id: key,
    app: body.app,
    name: body.name,
    main: false,
    scopeTypes: body.scopeTypes,
    permissions: withSignIn(body.permissions),
    appointedBy: body.appointedBy,
    mfaRequired: body.mfaRequired,
    signUp: false,
    maxHolders: null,
    system: false,
    retired: false,
    createdAt: now,
    updatedAt: now,
  };
  const problems = customRoleProblems(role, await roles.find({ retired: false }).toArray());
  if (problems.length > 0) throw validationFailed(problems);
  try {
    await roles.insertOne(role);
  } catch (error) {
    if (isDuplicateKey(error)) throw conflict('A role with this name exists in this app already.');
    throw error;
  }
  deps.logger.info({ role: key, by: passport.userId }, 'sub-role made');
  return { role: roleView(role) };
}

export interface RoleChange {
  name?: string | undefined;
  scopeTypes?: ScopeType[] | undefined;
  permissions?: string[] | undefined;
  appointedBy?: string[] | undefined;
  mfaRequired?: boolean | undefined;
  retired?: boolean | undefined;
}

/**
 * PATCH /iam/roles/:roleKey: changes a sub-role Master made (a shipped one changes in code only).
 * A change to what it allows (permissions, scope types, authenticator, retired) renews its
 * holders' tokens at once (their authz version goes up). A scope type in use cannot be taken
 * away: end those grants first.
 */
export async function updateRole(
  deps: ManageDeps,
  passport: Passport,
  key: string,
  change: RoleChange,
) {
  const now = new Date();
  requirePermission(await callerOf(deps, passport, now), roleManage.key);
  const roles = rolesOf(deps.mongo);
  const role = await roles.findOne({ _id: key });
  if (!role) throw notFound('Role');
  if (role.system) throw forbidden('A shipped role changes only in code.');
  const next: RoleRecord = {
    ...role,
    name: change.name ?? role.name,
    scopeTypes: change.scopeTypes ?? role.scopeTypes,
    permissions: change.permissions ? withSignIn(change.permissions) : role.permissions,
    appointedBy: change.appointedBy ?? role.appointedBy,
    mfaRequired: change.mfaRequired ?? role.mfaRequired,
    retired: change.retired ?? role.retired,
    updatedAt: now,
  };
  const others = await roles.find({ retired: false, _id: { $ne: key } }).toArray();
  const problems = customRoleProblems(next, others);
  if (problems.length > 0) throw validationFailed(problems);
  // a role others name as who gives them keeps the right to give, and stays
  if (!next.permissions.includes(grantManage.key) || next.retired) {
    const dependants = others.filter((other) => other.appointedBy.includes(key));
    if (dependants.length > 0) {
      throw conflict(
        `${dependants.map((other) => other._id).join(', ')} name this role as who gives them: change those first.`,
      );
    }
  }
  const removed = role.scopeTypes.filter((type) => !next.scopeTypes.includes(type));
  if (
    removed.length > 0 &&
    (await grantsOf(deps.mongo).countDocuments(
      { role: key, active: true, 'scope.type': { $in: removed } },
      { limit: 1 },
    )) > 0
  ) {
    throw conflict(`End this role’s ${removed.join(', ')} grants first.`);
  }
  const allows = (r: RoleRecord) =>
    JSON.stringify([r.scopeTypes, r.permissions, r.mfaRequired, r.retired]);
  const renew = allows(role) !== allows(next);
  const holders = await withTransaction(deps.mongo, async (session) => {
    const { _id: _key, createdAt: _createdAt, ...fields } = next;
    await roles.updateOne({ _id: key }, { $set: fields }, { session });
    if (!renew) return [];
    const userIds = await grantsOf(deps.mongo).distinct(
      'userId',
      { role: key, active: true },
      { session },
    );
    await usersOf(deps.mongo).updateMany(
      { _id: { $in: userIds } },
      { $inc: { authzVersion: 1 }, $set: { updatedAt: now } },
      { session },
    );
    return userIds;
  });
  await publishAuthzVersions(deps.mongo, deps.redis, holders);
  deps.logger.info({ role: key, by: passport.userId, renewed: holders.length }, 'sub-role changed');
  return { role: roleView(next) };
}

const dateOf = (value: string | null | undefined): Date | null =>
  value === null || value === undefined ? null : new Date(value);

export interface NewGrantRequest {
  userId: string;
  role: string;
  scope: Scope;
  validFrom?: string | null | undefined;
  validTo?: string | null | undefined;
}

/**
 * POST /iam/grants (ARCHITECTURE §7.3): an account that exists gets a role, from a caller whose
 * role gives it, in a scope inside the caller's own. Nobody gives a role to themselves. The
 * person's tokens renew at once.
 */
export async function giveGrant(deps: ManageDeps, passport: Passport, body: NewGrantRequest) {
  const now = new Date();
  const caller = await callerOf(deps, passport, now);
  requirePermission(caller, grantManage.key);
  if (body.userId === passport.userId) throw forbidden('Nobody gives a role to themselves.');
  const role = await rolesOf(deps.mongo).findOne({ _id: body.role });
  if (!role) throw validationFailed([{ path: ['role'], message: 'No such role' }]);
  const user = await usersOf(deps.mongo).findOne({ _id: body.userId });
  if (user?.status !== 'active') {
    throw validationFailed([{ path: ['userId'], message: 'No such account' }]);
  }
  const validFrom = dateOf(body.validFrom);
  const validTo = dateOf(body.validTo);
  const problems = grantShapeProblems(role, body.scope, {
    validFrom,
    validTo,
    selfId: body.userId,
    now,
  });
  if (problems.length > 0) throw validationFailed(problems);
  if (!appointingGrant(caller, role, body.scope)) {
    throw forbidden('You cannot give this role in this scope.');
  }
  let grantId: string | null;
  try {
    grantId = await withTransaction(deps.mongo, (session) =>
      writeGrant(deps.mongo, session, {
        userId: body.userId,
        role: role._id,
        app: role.app,
        scope: body.scope,
        via: 'appointed',
        grantedBy: passport.userId,
        validFrom,
        validTo,
        now,
      }),
    );
  } catch (error) {
    if (isDuplicateKey(error)) grantId = null;
    else throw error;
  }
  if (grantId === null) throw conflict('This person holds this role there already.');
  await publishAuthzVersions(deps.mongo, deps.redis, [body.userId]);
  deps.logger.info({ grantId, role: role._id, by: passport.userId }, 'role given');
  const grant = await grantsOf(deps.mongo).findOne({ _id: grantId });
  if (!grant) throw new Error('the grant just written is not there');
  return { grant: grantView(grant, user.email) };
}

/**
 * POST /iam/grants/:grantId/end: a grant the caller could give ends (kept for audit); the
 * person's tokens stop at once, and a session left with no grant in its app ends at its next
 * refresh. Ending an ended grant changes nothing. Nobody ends their own.
 */
export async function endGrant(deps: ManageDeps, passport: Passport, grantId: string) {
  const now = new Date();
  const caller = await callerOf(deps, passport, now);
  requirePermission(caller, grantManage.key);
  const grant = await grantsOf(deps.mongo).findOne({ _id: grantId });
  if (!grant) throw notFound('Grant');
  const role = await rolesOf(deps.mongo).findOne({ _id: grant.role });
  if (!role || !appointingGrant(caller, role, grant.scope)) {
    throw forbidden('You cannot end this role.');
  }
  if (grant.userId === passport.userId) throw forbidden('Nobody ends their own role.');
  const ended = await withTransaction(deps.mongo, (session) =>
    endGrantRecord(deps.mongo, session, { grantId, by: passport.userId, now }),
  );
  if (ended) {
    await publishAuthzVersions(deps.mongo, deps.redis, [grant.userId]);
    deps.logger.info({ grantId, role: grant.role, by: passport.userId }, 'role ended');
  }
  const user = await usersOf(deps.mongo).findOne({ _id: grant.userId });
  return { grant: grantView(ended ?? grant, user?.email ?? '') };
}

/** Emails by account id, for a page of grants or invitations. */
export async function emailsOf(mongo: Mongo, userIds: readonly string[]) {
  const users = await usersOf(mongo)
    .find({ _id: { $in: [...new Set(userIds)] } }, { projection: { email: 1 } })
    .toArray();
  return new Map(users.map((user) => [user._id, user.email]));
}

export interface GrantQuery {
  cursor?: string | undefined;
  limit: number;
  userId?: string | undefined;
  role?: string | undefined;
  app?: AppId | undefined;
  status: 'active' | 'ended';
}

/** GET /iam/grants: what the caller may see (authority.ts visibleFilter), the newest first. */
export async function listGrants(deps: ManageDeps, passport: Passport, query: GrantQuery) {
  const caller = await callerOf(deps, passport, new Date());
  requirePermission(caller, grantRead.key);
  const visible = visibleFilter(caller, await rolesOf(deps.mongo).find().toArray());
  if (!visible) return { items: [], nextCursor: null };
  const page = await grantsOf(deps.mongo)
    .find({
      ...visible,
      active: query.status === 'active',
      ...(query.userId === undefined ? {} : { userId: query.userId }),
      ...(query.role === undefined ? {} : { role: query.role }),
      ...(query.app === undefined ? {} : { app: query.app }),
      ...(query.cursor === undefined ? {} : { _id: { $lt: query.cursor } }),
    })
    .sort({ _id: -1 })
    .limit(query.limit + 1)
    .toArray();
  const items = page.slice(0, query.limit);
  const emails = await emailsOf(
    deps.mongo,
    items.map((grant) => grant.userId),
  );
  return {
    items: items.map((grant) => grantView(grant, emails.get(grant.userId) ?? '')),
    nextCursor: page.length > query.limit ? (items.at(-1)?._id ?? null) : null,
  };
}
