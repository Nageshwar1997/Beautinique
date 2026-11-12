import { createHash } from 'node:crypto';

import type { ClientSession, IndexSpec, Mongo, ObjectId } from '@beautinique/backend-server-mongo';
import type { ReleaseStep } from '@beautinique/backend-server-release';
import {
  type AppId,
  APPS,
  type PermissionDefinition,
  permissions,
  SESSION_POLICIES,
  SIGN_UP_APPS,
  TOTP_REQUIRED_APPS,
} from '@beautinique/shared-contracts';

import {
  APP_RECORDS,
  type AppRecord,
  forgetRbacCatalog,
  type PermissionRecord,
  PERMISSIONS,
  type RbacCatalog,
  rbacCatalog,
} from './catalog.ts';
import { ROLE_SEEDS, type RoleSeed } from './roles.ts';

export { APP_RECORDS, type AppRecord, type PermissionRecord, PERMISSIONS } from './catalog.ts';
export const ROLES = 'identity_roles';

/**
 * A role in identity_roles. `system`: shipped in code (roles.ts) and kept in step with it at every
 * release; Master's own sub-roles are not, and the sync never touches them. `retired`: a system
 * role the code no longer has, so it can no longer be given. Its app, permissions and appointers
 * are named by their ids, its own `key` stays what code and contracts use (owner, 2026-11-12).
 */
export interface RoleRecord extends Omit<RoleSeed, 'app' | 'permissions' | 'appointedBy'> {
  _id: ObjectId;
  appId: ObjectId;
  permissionIds: ObjectId[];
  /** The roles whose holders may give it */
  appointedBy: ObjectId[];
  system: boolean;
  retired: boolean;
  /** Written by every seat claim of a role with few seats, so two at once clash (bootstrap.ts) */
  seatClaims?: number;
  createdAt: Date;
  updatedAt: Date;
}

/** A role as identity's code reads it: its app and permission keys next to the stored ids. */
export interface Role extends RoleRecord {
  app: AppId;
  permissions: string[];
}

/** A stored role with its app and permission keys (a permission the catalogue lost is left out). */
export function roleOf(record: RoleRecord, catalog: RbacCatalog): Role {
  return {
    ...record,
    app: catalog.appOf(record.appId),
    permissions: record.permissionIds.flatMap((id) => {
      const key = catalog.permissionKey(id);
      return key === undefined ? [] : [key];
    }),
  };
}

/** The roles of a query, with their keys (roleOf). */
export async function readRoles(
  mongo: Mongo,
  filter: Record<string, unknown>,
  options: { comment?: string; session?: ClientSession } = {},
): Promise<Role[]> {
  const catalog = await rbacCatalog(mongo);
  const records = await mongo.db.collection<RoleRecord>(ROLES).find(filter, options).toArray();
  return records.map((record) => roleOf(record, catalog));
}

/** A role is found by its key; grants and invitations find it by id. */
export const roleIndexes: readonly IndexSpec[] = [
  { collection: ROLES, name: 'key_unique', key: { key: 1 }, unique: true },
  { collection: ROLES, name: 'appId_key', key: { appId: 1, key: 1 } },
];

/** The 11 apps as identity_apps records, from the contracts that sign-in follows. */
export function appRecords(): Omit<AppRecord, '_id' | 'updatedAt'>[] {
  const signUp: readonly string[] = SIGN_UP_APPS;
  const totp: readonly string[] = TOTP_REQUIRED_APPS;
  return APPS.map((app) => ({
    key: app,
    audience: signUp.includes(app) ? 'external' : 'internal',
    signUp: signUp.includes(app),
    totp: totp.includes(app) ? 'required' : 'optional',
    session: SESSION_POLICIES[app],
  }));
}

/**
 * What is wrong with the shipped roles against the permission catalogue: keys that do not exist,
 * scope types none of a role's keys can be used in, appointers that are not roles or cannot give
 * roles. The release refuses to start with any (and a test keeps the list empty).
 */
export function roleSeedProblems(
  seeds: readonly RoleSeed[] = ROLE_SEEDS,
  catalogue: ReadonlyMap<string, PermissionDefinition> = permissions,
): string[] {
  const problems: string[] = [];
  const byKey = new Map(seeds.map((seed) => [seed.key, seed]));
  if (byKey.size !== seeds.length) problems.push('a role key is used twice');
  for (const seed of seeds) {
    for (const { message } of roleProblems(seed, byKey, catalogue)) {
      problems.push(`${seed.key}: ${message}`);
    }
    // `c_` names are Master's own sub-roles: a shipped one with it would take one over
    if (seed.key.slice(seed.app.length + 1).startsWith(CUSTOM_PREFIX)) {
      problems.push(`${seed.key}: shipped role keys never start with ${CUSTOM_PREFIX}`);
    }
  }
  return problems;
}

/** Master's own sub-roles are `<app>.c_<slug>`, so a shipped role never takes one's key. */
export const CUSTOM_PREFIX = 'c_';

type RoleShape = Pick<
  RoleSeed,
  'key' | 'app' | 'scopeTypes' | 'permissions' | 'appointedBy' | 'signUp'
>;

/** One thing wrong with a role, and the field it is in. */
export interface RoleProblem {
  field: 'key' | 'scopeTypes' | 'permissions' | 'appointedBy' | 'signUp';
  message: string;
}

/**
 * What is wrong with one role, shipped or Master's: a key not under its app, no scope type, no
 * sign-in to its app, unknown keys or keys none of its scope types can use, appointers that are
 * not roles (in `byKey`) or cannot give roles, a role among its own appointers, a sign-up role
 * that is not self-scoped or that someone could give.
 */
export function roleProblems(
  role: RoleShape,
  byKey: ReadonlyMap<string, Pick<RoleSeed, 'permissions'>>,
  catalogue: ReadonlyMap<string, PermissionDefinition> = permissions,
): RoleProblem[] {
  const problems: RoleProblem[] = [];
  const add = (field: RoleProblem['field'], message: string) => {
    problems.push({ field, message });
  };
  if (!role.key.startsWith(`${role.app}.`)) add('key', 'key must start with app');
  if (role.scopeTypes.length === 0) add('scopeTypes', 'no scope type');
  if (new Set(role.scopeTypes).size !== role.scopeTypes.length) {
    add('scopeTypes', 'a scope type is listed twice');
  }
  if (!role.permissions.includes('iam.app.sign_in'))
    add('permissions', 'cannot sign in to its app');
  if (new Set(role.permissions).size !== role.permissions.length) {
    add('permissions', 'a permission is listed twice');
  }
  for (const key of role.permissions) {
    const permission = catalogue.get(key);
    if (!permission) {
      add('permissions', `unknown permission ${key}`);
    } else if (!permission.scopeTypes.some((type) => role.scopeTypes.includes(type))) {
      add('permissions', `${key} cannot be used in any of its scope types`);
    }
  }
  // its holders would give it on and on, past Master's control (QA Q-007, owner 2026-11-09)
  if (role.appointedBy.includes(role.key)) add('appointedBy', 'a role cannot appoint itself');
  for (const appointer of role.appointedBy) {
    const by = byKey.get(appointer);
    if (!by) add('appointedBy', `unknown appointer ${appointer}`);
    else if (!by.permissions.includes('iam.grant.manage')) {
      add('appointedBy', `${appointer} cannot give roles`);
    }
  }
  if (role.signUp && (role.appointedBy.length > 0 || role.scopeTypes.join() !== 'self')) {
    add('signUp', 'a sign-up role is self-scoped and given by identity only');
  }
  return problems;
}

/** Changes when the apps, the catalogue or the shipped roles change, so the step runs again. */
export function rbacFingerprint(): string {
  const shape = {
    apps: appRecords(),
    permissions: [...permissions.values()],
    roles: ROLE_SEEDS,
  };
  return createHash('sha256').update(JSON.stringify(shape)).digest('hex').slice(0, 16);
}

/**
 * The release step (TASKS T3.3): writes the apps, the permission catalogue and the shipped roles
 * into identity's database. Safe to run again; what the code dropped is marked retired, never
 * deleted (grants and history still name it).
 */
export const rbacSyncStep: ReleaseStep = {
  name: 'rbac-sync',
  fingerprint: rbacFingerprint(),
  async run({ mongo, logger }) {
    const problems = roleSeedProblems();
    if (problems.length > 0) throw new Error(`Shipped roles are wrong: ${problems.join('; ')}`);
    const now = new Date();
    const { db } = mongo;

    // apps and permissions first: the roles name them by id (an upsert by key keeps an id forever)
    await db.collection<AppRecord>(APP_RECORDS).bulkWrite(
      appRecords().map(({ key, ...app }) => ({
        updateOne: {
          filter: { key },
          update: { $set: { ...app, updatedAt: now } },
          upsert: true,
        },
      })),
    );

    const keys = [...permissions.keys()];
    await db.collection<PermissionRecord>(PERMISSIONS).bulkWrite(
      [...permissions.values()].map(({ key, ...permission }) => ({
        updateOne: {
          filter: { key },
          update: { $set: { ...permission, retired: false, updatedAt: now } },
          upsert: true,
        },
      })),
    );
    await db
      .collection<PermissionRecord>(PERMISSIONS)
      .updateMany(
        { key: { $nin: keys }, retired: false },
        { $set: { retired: true, updatedAt: now } },
      );
    forgetRbacCatalog(mongo);
    const catalog = await rbacCatalog(mongo);
    const permissionIdsOf = (list: readonly string[]): ObjectId[] =>
      list.map((key) => {
        const id = catalog.permissionId(key);
        if (!id) throw new Error(`Permission ${key} was not written`);
        return id;
      });

    // the roles without their appointers, then the appointers by id (a role may name one listed later)
    const roles = db.collection<RoleRecord>(ROLES);
    await roles.bulkWrite(
      ROLE_SEEDS.map(({ key, app, permissions: list, appointedBy: _appointers, ...seed }) => ({
        updateOne: {
          filter: { key },
          update: {
            $set: {
              ...seed,
              appId: catalog.appId(app),
              permissionIds: permissionIdsOf(list),
              system: true,
              retired: false,
              updatedAt: now,
            },
            $setOnInsert: { appointedBy: [], createdAt: now },
          },
          upsert: true,
        },
      })),
    );
    const shipped = await roles
      .find({ key: { $in: ROLE_SEEDS.map((seed) => seed.key) } }, { projection: { key: 1 } })
      .toArray();
    const roleIds = new Map(shipped.map((role) => [role.key, role._id]));
    await roles.bulkWrite(
      ROLE_SEEDS.map((seed) => ({
        updateOne: {
          filter: { key: seed.key },
          update: {
            $set: {
              appointedBy: seed.appointedBy.map((key) => {
                const id = roleIds.get(key);
                if (!id) throw new Error(`Appointer ${key} of ${seed.key} is not a shipped role`);
                return id;
              }),
            },
          },
        },
      })),
    );
    const retired = await roles.updateMany(
      { system: true, retired: false, key: { $nin: ROLE_SEEDS.map((seed) => seed.key) } },
      { $set: { retired: true, updatedAt: now } },
    );
    logger.info(
      {
        apps: APPS.length,
        permissions: keys.length,
        roles: ROLE_SEEDS.length,
        retiredRoles: retired.modifiedCount,
      },
      'roles and permissions in step with the code',
    );
  },
};
