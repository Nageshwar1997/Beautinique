import { AppError } from '@beautinique/backend-server-kit';
import type { Mongo, ObjectId } from '@beautinique/backend-server-mongo';
import { type ChainOf, grantProblems, scopeWithin } from '@beautinique/shared-authz';
import {
  type AppId,
  grantManage,
  grantRead,
  isStateId,
  permissions,
} from '@beautinique/shared-contracts';

import { rbacCatalog } from './catalog.ts';
import {
  activeAt,
  CODE_SCOPE_TYPES,
  type GrantRecord,
  GRANTS,
  type Scope,
  scopeOf,
} from './grants.ts';
import { readRoles, type Role, type RoleRecord } from './sync.ts';

/** One grant of the caller in the app they act from, with its role. */
export interface CallerGrant {
  grant: GrantRecord;
  role: Role;
}

/** The caller's grants that count now, in the app they act from (the passport's app). */
export async function callerGrants(
  mongo: Mongo,
  { userId, app, now = new Date() }: { userId: ObjectId; app: AppId; now?: Date },
): Promise<CallerGrant[]> {
  const appId = (await rbacCatalog(mongo)).appId(app);
  const grants = await mongo.db
    .collection<GrantRecord>(GRANTS)
    .find({ userId, appId, ...activeAt(now) })
    .toArray();
  if (grants.length === 0) return [];
  const roles = await readRoles(mongo, {
    _id: { $in: grants.map((grant) => grant.roleId) },
    retired: false,
  });
  const byId = new Map(roles.map((role) => [role._id.toHexString(), role]));
  return grants.flatMap((grant) => {
    const role = byId.get(grant.roleId.toHexString());
    return role ? [{ grant, role }] : [];
  });
}

/** `list` names the role with this id. */
export const namesRole = (list: readonly ObjectId[], id: ObjectId): boolean =>
  list.some((each) => each.equals(id));

export const forbidden = (message = 'You do not have access to this.'): AppError =>
  new AppError('FORBIDDEN', message);

/** The caller holds the permission in some grant here, or 403. */
export function requirePermission(caller: readonly CallerGrant[], key: string): void {
  if (!caller.some(({ role }) => role.permissions.includes(key))) throw forbidden();
}

/**
 * Where a place sits (shared-authz ChainOf): a state or union territory is a top-level place
 * (contracts INDIAN_STATES). District, city and hub ids come with the location master (owner,
 * 2026-10-29), so none is known yet.
 */
export const chainOf: ChainOf = (type, id) => (type === 'state' && isStateId(id) ? {} : undefined);

// a document's id in a scope, as the API gives it (lower-case hex, objectIdZod)
const OBJECT_ID = /^[0-9a-f]{24}$/;

/** Scope types whose ids identity cannot know yet (owner, 2026-10-29: the location master). */
const NOT_KNOWN_YET = new Set(['district', 'city', 'hub', 'warehouse']);

export interface ScopeProblem {
  path: string[];
  message: string;
}

/**
 * What is wrong with a scope's ids: a `state` id that is not a state or union territory, a
 * district, city, hub or warehouse id (not known before the location master), a `self` scope
 * that is not the person's own account, an id that is not an ObjectId where the scope names
 * documents (a seller organisation, a brand ...: owner, 2026-11-12). `selfId` null = the account
 * is not known yet (an invitation): a self scope then names no ids.
 */
export function scopeIdProblems(scope: Scope, selfId: string | null): ScopeProblem[] {
  const at = ['scope', 'ids'];
  if (scope.type === 'state' && !scope.ids.every(isStateId)) {
    return [{ path: at, message: 'Use the id of a state or union territory, e.g. MH' }];
  }
  if (NOT_KNOWN_YET.has(scope.type)) {
    return [
      { path: at, message: `No ${scope.type} is known yet: they come with the location master` },
    ];
  }
  if (scope.type === 'self') {
    const wanted = selfId === null ? [] : [selfId];
    if (scope.ids.join() !== wanted.join()) {
      return [
        {
          path: at,
          message:
            selfId === null
              ? 'A self scope names no ids in an invitation: the new account is its id'
              : 'A self scope names the person’s own account',
        },
      ];
    }
  }
  if (!CODE_SCOPE_TYPES.has(scope.type) && !scope.ids.every((id) => OBJECT_ID.test(id))) {
    return [{ path: at, message: `Use the id of a ${scope.type}` }];
  }
  return [];
}

/**
 * Everything wrong with giving `role` in `scope` for a time, before any authority check: a
 * retired role, a scope type the role does not take, the shape checks of shared-authz
 * (grantProblems: ids, dates in order), a validity that ended already, unknown ids.
 */
export function grantShapeProblems(
  role: Role,
  scope: Scope,
  {
    validFrom,
    validTo,
    selfId,
    now,
  }: {
    validFrom: Date | null;
    validTo: Date | null;
    selfId: string | null;
    now: Date;
  },
): ScopeProblem[] {
  const problems: ScopeProblem[] = [];
  if (role.retired) problems.push({ path: ['role'], message: 'This role is retired' });
  if (!role.scopeTypes.includes(scope.type)) {
    problems.push({
      path: ['scope', 'type'],
      message: `This role is given in a ${role.scopeTypes.join(' or ')} scope`,
    });
  }
  // an invitation's self scope gets its id at acceptance: check the shape with a stand-in
  const shaped = scope.type === 'self' && selfId === null ? { ...scope, ids: ['pending'] } : scope;
  for (const problem of grantProblems(
    {
      role: role.key,
      permissions: role.permissions,
      scope: shaped,
      validFrom: validFrom?.toISOString() ?? null,
      validTo: validTo?.toISOString() ?? null,
    },
    { permissions },
  )) {
    problems.push({
      path: problem.field === 'validity' ? ['validTo'] : [problem.field],
      message: problem.message,
    });
  }
  if (validTo !== null && validTo.getTime() <= now.getTime()) {
    problems.push({ path: ['validTo'], message: 'This end is in the past' });
  }
  problems.push(...scopeIdProblems(scope, selfId));
  return problems;
}

/**
 * The caller's grant that lets them give `role` in `scope` (ARCHITECTURE §7.3): its role gives
 * roles (`iam.grant.manage`), is one of `role`'s appointers, and its scope holds `scope` (nobody
 * hands on more than they hold). Undefined when none does.
 */
export function appointingGrant(
  caller: readonly CallerGrant[],
  role: Pick<RoleRecord, 'appointedBy'>,
  scope: Scope,
): CallerGrant | undefined {
  // a self scope of an account not made yet: any id stands for it
  const inner =
    scope.type === 'self' && scope.ids.length === 0 ? { ...scope, ids: ['pending'] } : scope;
  return caller.find(
    ({ grant, role: own }) =>
      own.permissions.includes(grantManage.key) &&
      namesRole(role.appointedBy, own._id) &&
      scopeWithin(scopeOf(grant.scope), inner, chainOf),
  );
}

/** Ids of `scope.ids` all inside `ids` (a non-global scope of the same type, as stored). */
const idsInside = (ids: readonly (ObjectId | string)[]) => ({
  'scope.ids': { $not: { $elemMatch: { $nin: [...ids] } } },
});

/**
 * Which grants (or invitations: the same `role` and `scope` fields) the caller may see, as a
 * MongoDB filter: per grant of theirs that reads grants, the roles it can give (a reviewer, who
 * reads without giving, every role), in its scope. A reviewer's list of everyone leaves out the
 * sign-up roles (owner, 2026-11-09, QA DR-008): an access review needs the staff, not a page of
 * every customer's email; looking up one person (`onePerson`) shows all of theirs. Null when the
 * caller sees none.
 */
export function visibleFilter(
  caller: readonly CallerGrant[],
  roles: readonly Pick<RoleRecord, '_id' | 'appointedBy' | 'signUp'>[],
  { onePerson = false }: { onePerson?: boolean } = {},
): Record<string, unknown> | null {
  const signUpRoles = roles.filter((role) => role.signUp).map((role) => role._id);
  const clauses = caller
    .filter(({ role }) => role.permissions.includes(grantRead.key))
    .flatMap(({ grant, role: own }) => {
      const reviewer = !own.permissions.includes(grantManage.key);
      const givable = roles
        .filter((role) => namesRole(role.appointedBy, own._id))
        .map((role) => role._id);
      if (!reviewer && givable.length === 0) return [];
      const scope =
        grant.scope.type === 'global'
          ? {}
          : { 'scope.type': grant.scope.type, ...idsInside(grant.scope.ids) };
      const reviewed = onePerson ? {} : { roleId: { $nin: signUpRoles } };
      return [{ ...(reviewer ? reviewed : { roleId: { $in: givable } }), ...scope }];
    });
  return clauses.length === 0 ? null : { $or: clauses };
}
