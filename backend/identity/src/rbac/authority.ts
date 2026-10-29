import { AppError } from '@beautinique/backend-server-kit';
import type { Mongo } from '@beautinique/backend-server-mongo';
import { type ChainOf, grantProblems, scopeWithin } from '@beautinique/shared-authz';
import {
  type AppId,
  grantManage,
  grantRead,
  isStateId,
  permissions,
} from '@beautinique/shared-contracts';

import { activeAt, type GrantRecord, GRANTS, type Scope } from './grants.ts';
import { type RoleRecord, ROLES } from './sync.ts';

/** One grant of the caller in the app they act from, with its role. */
export interface CallerGrant {
  grant: GrantRecord;
  role: RoleRecord;
}

/** The caller's grants that count now, in the app they act from (the passport's app). */
export async function callerGrants(
  mongo: Mongo,
  { userId, app, now = new Date() }: { userId: string; app: AppId; now?: Date },
): Promise<CallerGrant[]> {
  const grants = await mongo.db
    .collection<GrantRecord>(GRANTS)
    .find({ userId, app, ...activeAt(now) })
    .toArray();
  if (grants.length === 0) return [];
  const roles = await mongo.db
    .collection<RoleRecord>(ROLES)
    .find({ _id: { $in: grants.map((grant) => grant.role) }, retired: false })
    .toArray();
  const byKey = new Map(roles.map((role) => [role._id, role]));
  return grants.flatMap((grant) => {
    const role = byKey.get(grant.role);
    return role ? [{ grant, role }] : [];
  });
}

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

/** Scope types whose ids identity cannot know yet (owner, 2026-10-29: the location master). */
const NOT_KNOWN_YET = new Set(['district', 'city', 'hub', 'warehouse']);

export interface ScopeProblem {
  path: string[];
  message: string;
}

/**
 * What is wrong with a scope's ids: a `state` id that is not a state or union territory, a
 * district, city, hub or warehouse id (not known before the location master), a `self` scope
 * that is not the person's own account. `selfId` null = the account is not known yet (an
 * invitation): a self scope then names no ids.
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
  return [];
}

/**
 * Everything wrong with giving `role` in `scope` for a time, before any authority check: a
 * retired role, a scope type the role does not take, the shape checks of shared-authz
 * (grantProblems: ids, dates in order), a validity that ended already, unknown ids.
 */
export function grantShapeProblems(
  role: RoleRecord,
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
      role: role._id,
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
      role.appointedBy.includes(own._id) &&
      scopeWithin(grant.scope, inner, chainOf),
  );
}

/** Ids of `scope.ids` all inside `ids` (a non-global scope of the same type). */
const idsInside = (ids: readonly string[]) => ({
  'scope.ids': { $not: { $elemMatch: { $nin: [...ids] } } },
});

/**
 * Which grants (or invitations: the same `role` and `scope` fields) the caller may see, as a
 * MongoDB filter: per grant of theirs that reads grants, the roles it can give (a reviewer, who
 * reads without giving, every role), in its scope. Null when the caller sees none.
 */
export function visibleFilter(
  caller: readonly CallerGrant[],
  roles: readonly RoleRecord[],
): Record<string, unknown> | null {
  const clauses = caller
    .filter(({ role }) => role.permissions.includes(grantRead.key))
    .flatMap(({ grant, role: own }) => {
      const reviewer = !own.permissions.includes(grantManage.key);
      const givable = roles.filter((role) => role.appointedBy.includes(own._id)).map((r) => r._id);
      if (!reviewer && givable.length === 0) return [];
      const scope =
        grant.scope.type === 'global'
          ? {}
          : { 'scope.type': grant.scope.type, ...idsInside(grant.scope.ids) };
      return [{ ...(reviewer ? {} : { role: { $in: givable } }), ...scope }];
    });
  return clauses.length === 0 ? null : { $or: clauses };
}
