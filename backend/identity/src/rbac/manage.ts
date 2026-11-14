import { AppError, type Logger, type Passport } from '@beautinique/backend-server-kit';
import {
  type Mongo,
  type ObjectId,
  toObjectId,
  withTransaction,
} from '@beautinique/backend-server-mongo';
import {
  type AppId,
  appSignIn,
  grantManage,
  grantRead,
  roleManage,
  type ScopeType,
  totpResetMaster,
} from '@beautinique/shared-contracts';
import type { Redis } from 'ioredis';

import { type User, USERS } from '../users.ts';
import {
  appointingGrant,
  callerGrants,
  forbidden,
  grantShapeProblems,
  mayResetAuthenticator,
  namesRole,
  requirePermission,
  type ScopeProblem,
  visibleFilter,
} from './authority.ts';
import { type RbacCatalog, rbacCatalog } from './catalog.ts';
import {
  endGrantRecord,
  type GrantRecord,
  GRANTS,
  publishAuthzVersions,
  raiseAuthzVersion,
  type Scope,
  scopeOf,
  writeGrant,
} from './grants.ts';
import {
  CUSTOM_PREFIX,
  readRoles,
  type Role,
  roleProblems,
  type RoleRecord,
  ROLES,
  writeRoleSnapshots,
} from './sync.ts';

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
/** Every role, retired too: what a caller may see is worked out from the whole catalog. */
export const roleCatalog = (mongo: Mongo) =>
  readRoles(mongo, {}, { comment: 'full read: the role catalog, for what the caller may see' });
/** The role with this key, or null. */
export const roleByKey = async (mongo: Mongo, key: string): Promise<Role | null> =>
  (await readRoles(mongo, { key }))[0] ?? null;
const grantsOf = (mongo: Mongo) => mongo.db.collection<GrantRecord>(GRANTS);
const usersOf = (mongo: Mongo) => mongo.db.collection<User>(USERS);

/** Role keys by id (a role's appointers are stored by id). */
export const roleKeys = (roles: readonly Pick<RoleRecord, '_id' | 'key'>[]) => {
  const keys = new Map(roles.map((role) => [role._id.toHexString(), role.key]));
  return (id: ObjectId): string => keys.get(id.toHexString()) ?? id.toHexString();
};

export function roleView(role: Role, keyOf: (id: ObjectId) => string) {
  return {
    key: role.key,
    app: role.app,
    name: role.name,
    main: role.main,
    scopeTypes: [...role.scopeTypes],
    permissions: [...role.permissions],
    appointedBy: role.appointedBy.map(keyOf),
    mfaRequired: role.mfaRequired,
    signUp: role.signUp,
    maxHolders: role.maxHolders,
    system: role.system,
    retired: role.retired,
  };
}

/** What the API shows of a grant: its ids as hex, its role and app by key. */
export function grantView(
  grant: GrantRecord,
  { email, role, catalog }: { email: string; role: string; catalog: RbacCatalog },
) {
  return {
    grantId: grant._id.toHexString(),
    userId: grant.userId.toHexString(),
    email,
    role,
    app: catalog.appOf(grant.appId),
    scope: scopeOf(grant.scope),
    validFrom: grant.validFrom?.toISOString() ?? null,
    validTo: grant.validTo?.toISOString() ?? null,
    grantedBy: grant.grantedBy?.toHexString() ?? null,
    via: grant.via,
    active: grant.active,
    createdAt: grant.createdAt.toISOString(),
    endedAt: grant.endedAt?.toISOString() ?? null,
  };
}

/** The caller's grants where they act, the passport's app. */
const callerOf = (deps: ManageDeps, passport: Passport, now: Date) =>
  callerGrants(deps.mongo, { userId: toObjectId(passport.userId), app: passport.app, now });

/** GET /iam/roles: every role (or one app's), for whoever reads grants. */
export async function listRoles(
  deps: ManageDeps,
  passport: Passport,
  { app }: { app?: AppId | undefined },
) {
  requirePermission(await callerOf(deps, passport, new Date()), grantRead.key);
  const catalog = await rbacCatalog(deps.mongo);
  const all = await roleCatalog(deps.mongo);
  const keyOf = roleKeys(all);
  const roles =
    app === undefined ? all : all.filter((role) => role.appId.equals(catalog.appId(app)));
  return {
    roles: roles
      .toSorted((a, b) => a.key.localeCompare(b.key))
      .map((role) => roleView(role, keyOf)),
  };
}

/** A role as roleProblems checks it: keys everywhere. */
interface KeyedRole {
  key: string;
  app: AppId;
  scopeTypes: readonly ScopeType[];
  permissions: readonly string[];
  appointedBy: readonly string[];
  signUp: boolean;
}

/**
 * What is wrong with a sub-role Master makes or changes: what is wrong with any role (sync.ts
 * roleProblems, against the roles that are not retired), and it never makes roles itself (only
 * the shipped Master role does).
 */
function customRoleProblems(role: KeyedRole, others: readonly Role[]): ScopeProblem[] {
  const byKey = new Map<string, Pick<KeyedRole, 'permissions'>>(
    others.map((other) => [other.key, other]),
  );
  byKey.set(role.key, role);
  const problems = roleProblems(role, byKey).map(({ field, message }) => ({
    path: [field],
    message,
  }));
  if (role.permissions.includes(roleManage.key)) {
    problems.push({ path: ['permissions'], message: 'Only Master makes roles' });
  }
  // the other Master's authenticator stays the shipped Master role's alone (QA DR-007)
  if (role.permissions.includes(totpResetMaster.key)) {
    problems.push({
      path: ['permissions'],
      message: "Only Master resets a Master's authenticator",
    });
  }
  return problems;
}

/** The ids of checked keys (customRoleProblems refused any unknown one). */
function idsOf(keys: readonly string[], idOf: (key: string) => ObjectId | undefined): ObjectId[] {
  return keys.map((key) => {
    const id = idOf(key);
    if (!id) throw new Error(`${key} has no id`);
    return id;
  });
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
  if (await roles.findOne({ key }, { projection: { _id: 1 } })) {
    throw conflict('A role with this name exists in this app already.');
  }
  const keyed: KeyedRole = {
    key,
    app: body.app,
    scopeTypes: body.scopeTypes,
    permissions: withSignIn(body.permissions),
    appointedBy: body.appointedBy,
    signUp: false,
  };
  const live = await readRoles(
    deps.mongo,
    { retired: false },
    { comment: 'full read: every live role, to check the new one against' },
  );
  const problems = customRoleProblems(keyed, live);
  if (problems.length > 0) throw validationFailed(problems);
  const catalog = await rbacCatalog(deps.mongo);
  const liveIds = new Map(live.map((role) => [role.key, role._id]));
  const record: Omit<RoleRecord, '_id'> = {
    key,
    appId: catalog.appId(body.app),
    name: body.name,
    main: false,
    scopeTypes: keyed.scopeTypes,
    permissionIds: idsOf(keyed.permissions, (permission) => catalog.permissionId(permission)),
    appointedBy: idsOf(keyed.appointedBy, (appointer) => liveIds.get(appointer)),
    mfaRequired: body.mfaRequired,
    signUp: false,
    maxHolders: null,
    system: false,
    retired: false,
    createdAt: now,
    updatedAt: now,
  };
  let made: RoleRecord;
  try {
    made = await withTransaction(deps.mongo, async (session) => {
      const { insertedId } = await roles.insertOne(record as RoleRecord, { session });
      const written = { ...record, _id: insertedId };
      // core's copy of the roles follows (TASKS T3.5)
      await writeRoleSnapshots(deps.mongo, session, [
        { ...written, app: body.app, permissions: [...keyed.permissions] },
      ]);
      return written;
    });
  } catch (error) {
    if (isDuplicateKey(error)) throw conflict('A role with this name exists in this app already.');
    throw error;
  }
  deps.logger.info({ role: key, by: passport.userId }, 'sub-role made');
  const keyOf = roleKeys(live);
  return {
    role: roleView({ ...made, app: body.app, permissions: [...keyed.permissions] }, keyOf),
  };
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
  const role = await roleByKey(deps.mongo, key);
  if (!role) throw notFound('Role');
  if (role.system) throw forbidden('A shipped role changes only in code.');
  const others = await readRoles(
    deps.mongo,
    { retired: false, key: { $ne: key } },
    { comment: 'full read: every other live role, to check the change against' },
  );
  const keyOf = roleKeys([...others, role]);
  const next = {
    name: change.name ?? role.name,
    scopeTypes: change.scopeTypes ?? role.scopeTypes,
    permissions: change.permissions ? withSignIn(change.permissions) : role.permissions,
    appointedBy: change.appointedBy ?? role.appointedBy.map(keyOf),
    mfaRequired: change.mfaRequired ?? role.mfaRequired,
    retired: change.retired ?? role.retired,
  };
  const problems = customRoleProblems({ key, app: role.app, signUp: role.signUp, ...next }, others);
  if (problems.length > 0) throw validationFailed(problems);
  // a role others name as who gives them keeps the right to give, and stays
  if (!next.permissions.includes(grantManage.key) || next.retired) {
    const dependants = others.filter((other) => namesRole(other.appointedBy, role._id));
    if (dependants.length > 0) {
      throw conflict(
        `${dependants.map((other) => other.key).join(', ')} name this role as who gives them: change those first.`,
      );
    }
  }
  const removed = role.scopeTypes.filter((type) => !next.scopeTypes.includes(type));
  if (
    removed.length > 0 &&
    (await grantsOf(deps.mongo).countDocuments(
      { roleId: role._id, active: true, 'scope.type': { $in: removed } },
      { limit: 1 },
    )) > 0
  ) {
    throw conflict(`End this role’s ${removed.join(', ')} grants first.`);
  }
  const allows = (r: Pick<Role, 'scopeTypes' | 'permissions' | 'mfaRequired' | 'retired'>) =>
    JSON.stringify([r.scopeTypes, r.permissions, r.mfaRequired, r.retired]);
  const renew = allows(role) !== allows(next);
  const catalog = await rbacCatalog(deps.mongo);
  const otherIds = new Map(others.map((other) => [other.key, other._id]));
  const fields = {
    name: next.name,
    scopeTypes: next.scopeTypes,
    permissionIds: idsOf(next.permissions, (permission) => catalog.permissionId(permission)),
    appointedBy: idsOf(next.appointedBy, (appointer) => otherIds.get(appointer)),
    mfaRequired: next.mfaRequired,
    retired: next.retired,
    updatedAt: now,
  };
  const holders = await withTransaction(deps.mongo, async (session) => {
    await roles.updateOne({ _id: role._id }, { $set: fields }, { session });
    // core's copy of the role follows (TASKS T3.5)
    await writeRoleSnapshots(deps.mongo, session, [
      { ...role, ...fields, permissions: next.permissions },
    ]);
    if (!renew) return [];
    const userIds = await grantsOf(deps.mongo).distinct(
      'userId',
      { roleId: role._id, active: true },
      { session },
    );
    // one by one: each holder's version goes up and their grants snapshot goes out with it
    for (const userId of userIds) {
      await raiseAuthzVersion(deps.mongo, session, userId, now);
    }
    return userIds;
  });
  await publishAuthzVersions(deps.mongo, deps.redis, holders);
  deps.logger.info({ role: key, by: passport.userId, renewed: holders.length }, 'sub-role changed');
  return {
    role: roleView({ ...role, ...fields, permissions: next.permissions }, keyOf),
  };
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
  const role = await roleByKey(deps.mongo, body.role);
  if (!role) throw validationFailed([{ path: ['role'], message: 'No such role' }]);
  const userId = toObjectId(body.userId, { field: 'userId' });
  const user = await usersOf(deps.mongo).findOne({ _id: userId });
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
  let grantId: ObjectId | null;
  try {
    grantId = await withTransaction(deps.mongo, (session) =>
      writeGrant(deps.mongo, session, {
        userId,
        roleId: role._id,
        appId: role.appId,
        scope: body.scope,
        via: 'appointed',
        grantedBy: toObjectId(passport.userId),
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
  await publishAuthzVersions(deps.mongo, deps.redis, [userId]);
  deps.logger.info({ grantId, role: role.key, by: passport.userId }, 'role given');
  const grant = await grantsOf(deps.mongo).findOne({ _id: grantId });
  if (!grant) throw new Error('the grant just written is not there');
  const catalog = await rbacCatalog(deps.mongo);
  return { grant: grantView(grant, { email: user.email, role: role.key, catalog }) };
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
  const id = toObjectId(grantId, { notFound: 'Grant not found.' });
  const grant = await grantsOf(deps.mongo).findOne({ _id: id });
  if (!grant) throw notFound('Grant');
  const [role] = await readRoles(deps.mongo, { _id: grant.roleId });
  if (!role || !appointingGrant(caller, role, scopeOf(grant.scope))) {
    throw forbidden('You cannot end this role.');
  }
  if (grant.userId.toHexString() === passport.userId) {
    throw forbidden('Nobody ends their own role.');
  }
  const ended = await withTransaction(deps.mongo, (session) =>
    endGrantRecord(deps.mongo, session, { grantId: id, by: toObjectId(passport.userId), now }),
  );
  if (ended) {
    await publishAuthzVersions(deps.mongo, deps.redis, [grant.userId]);
    deps.logger.info({ grantId, role: role.key, by: passport.userId }, 'role ended');
  }
  const user = await usersOf(deps.mongo).findOne({ _id: grant.userId });
  const catalog = await rbacCatalog(deps.mongo);
  return {
    grant: grantView(ended ?? grant, { email: user?.email ?? '', role: role.key, catalog }),
  };
}

/** Emails by account id (hex), for a page of grants or invitations. */
export async function emailsOf(mongo: Mongo, userIds: readonly ObjectId[]) {
  const unique = [...new Map(userIds.map((id) => [id.toHexString(), id])).values()];
  const users = await usersOf(mongo)
    .find({ _id: { $in: unique } }, { projection: { email: 1 } })
    .toArray();
  return new Map(users.map((user) => [user._id.toHexString(), user.email]));
}

export interface GrantQuery {
  cursor?: string | undefined;
  limit: number;
  userId?: string | undefined;
  /** The account with this email (a Security Officer finds a person by it) */
  email?: string | undefined;
  role?: string | undefined;
  app?: AppId | undefined;
  status: 'active' | 'ended';
}

/** GET /iam/grants: what the caller may see (authority.ts visibleFilter), the newest first. */
export async function listGrants(deps: ManageDeps, passport: Passport, query: GrantQuery) {
  const caller = await callerOf(deps, passport, new Date());
  requirePermission(caller, grantRead.key);
  const empty = { items: [], nextCursor: null };
  // one person (by id or email): every role of theirs; else no sign-up roles for a reviewer
  const onePerson = query.userId !== undefined || query.email !== undefined;
  const roles = await roleCatalog(deps.mongo);
  const visible = visibleFilter(caller, roles, { onePerson, peers: true });
  if (!visible) return empty;
  let userId =
    query.userId === undefined ? undefined : toObjectId(query.userId, { field: 'userId' });
  if (query.email !== undefined) {
    const owner = await usersOf(deps.mongo).findOne(
      { email: query.email },
      { projection: { _id: 1 } },
    );
    // no such account, or another one than userId: nothing
    if (!owner || (userId !== undefined && !userId.equals(owner._id))) return empty;
    userId = owner._id;
  }
  let roleId: ObjectId | undefined;
  if (query.role !== undefined) {
    roleId = roles.find((role) => role.key === query.role)?._id;
    if (!roleId) return empty;
  }
  const catalog = await rbacCatalog(deps.mongo);
  const cursor =
    query.cursor === undefined ? undefined : toObjectId(query.cursor, { field: 'cursor' });
  const page = await grantsOf(deps.mongo)
    .find({
      ...visible,
      active: query.status === 'active',
      ...(userId === undefined ? {} : { userId }),
      ...(roleId === undefined ? {} : { roleId }),
      ...(query.app === undefined ? {} : { appId: catalog.appId(query.app) }),
      ...(cursor === undefined ? {} : { _id: { $lt: cursor } }),
    })
    .sort({ _id: -1 })
    .limit(query.limit + 1)
    .toArray();
  const items = page.slice(0, query.limit);
  const emails = await emailsOf(
    deps.mongo,
    items.map((grant) => grant.userId),
  );
  const keyOf = roleKeys(roles);
  return {
    // a grant whose account is gone (it signs in nowhere) is left out: one such grant made the
    // whole list break its contract (an empty email); the cursor still counts it
    items: items.flatMap((grant) => {
      const email = emails.get(grant.userId.toHexString());
      return email === undefined
        ? []
        : [grantView(grant, { email, role: keyOf(grant.roleId), catalog })];
    }),
    nextCursor: page.length > query.limit ? (items.at(-1)?._id.toHexString() ?? null) : null,
    // one person: may the caller reset their authenticator (the same check as the reset)
    ...(userId === undefined
      ? {}
      : {
          canResetAuthenticator: await mayResetAuthenticator(
            deps.mongo,
            caller,
            toObjectId(passport.userId),
            userId,
          ),
        }),
  };
}
