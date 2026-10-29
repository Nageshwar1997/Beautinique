import { createHash } from 'node:crypto';

import type { ReleaseStep } from '@beautinique/backend-server-release';
import {
  type AppId,
  APPS,
  type PermissionDefinition,
  permissions,
  SESSION_POLICIES,
  type SessionPolicy,
  SIGN_UP_APPS,
  TOTP_REQUIRED_APPS,
} from '@beautinique/shared-contracts';

import { ROLE_SEEDS, type RoleSeed } from './roles.ts';

export const APP_RECORDS = 'identity_apps';
export const PERMISSIONS = 'identity_permissions';
export const ROLES = 'identity_roles';

/** An app as data (ARCHITECTURE §7.1): who uses it and how they sign in. */
export interface AppRecord {
  _id: AppId;
  audience: 'external' | 'internal';
  /** An unknown email can make an account here */
  signUp: boolean;
  /** `required`: every sign-in asks the authenticator; `optional`: the person's choice */
  totp: 'required' | 'optional';
  session: SessionPolicy;
  updatedAt: Date;
}

/** A permission key as data, from the code catalogue. `retired`: no longer in the code. */
export interface PermissionRecord extends Omit<PermissionDefinition, 'key'> {
  _id: string;
  retired: boolean;
  updatedAt: Date;
}

/**
 * A role in identity_roles. `system`: shipped in code (roles.ts) and kept in step with it at every
 * release; Master's own sub-roles are not, and the sync never touches them. `retired`: a system
 * role the code no longer has, so it can no longer be given.
 */
export interface RoleRecord extends Omit<RoleSeed, 'key'> {
  _id: string;
  system: boolean;
  retired: boolean;
  /** Written by every seat claim of a role with few seats, so two at once clash (bootstrap.ts) */
  seatClaims?: number;
  createdAt: Date;
  updatedAt: Date;
}

/** The 11 apps as identity_apps records, from the contracts that sign-in follows. */
export function appRecords(): Omit<AppRecord, 'updatedAt'>[] {
  const signUp: readonly string[] = SIGN_UP_APPS;
  const totp: readonly string[] = TOTP_REQUIRED_APPS;
  return APPS.map((app) => ({
    _id: app,
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
 * not roles (in `byKey`) or cannot give roles, a sign-up role that is not self-scoped or that
 * someone could give.
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

    await db.collection<AppRecord>(APP_RECORDS).bulkWrite(
      appRecords().map(({ _id, ...app }) => ({
        updateOne: { filter: { _id }, update: { $set: { ...app, updatedAt: now } }, upsert: true },
      })),
    );

    const keys = [...permissions.keys()];
    await db.collection<PermissionRecord>(PERMISSIONS).bulkWrite(
      [...permissions.values()].map(({ key, ...permission }) => ({
        updateOne: {
          filter: { _id: key },
          update: { $set: { ...permission, retired: false, updatedAt: now } },
          upsert: true,
        },
      })),
    );
    await db
      .collection<PermissionRecord>(PERMISSIONS)
      .updateMany(
        { _id: { $nin: keys }, retired: false },
        { $set: { retired: true, updatedAt: now } },
      );

    const roles = db.collection<RoleRecord>(ROLES);
    await roles.bulkWrite(
      ROLE_SEEDS.map(({ key, ...seed }) => ({
        updateOne: {
          filter: { _id: key },
          update: {
            $set: { ...seed, system: true, retired: false, updatedAt: now },
            $setOnInsert: { createdAt: now },
          },
          upsert: true,
        },
      })),
    );
    const retired = await roles.updateMany(
      { system: true, retired: false, _id: { $nin: ROLE_SEEDS.map((seed) => seed.key) } },
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
