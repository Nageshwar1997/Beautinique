import { setTimeout as sleep } from 'node:timers/promises';

import { AppError, type Passport } from '@beautinique/backend-server-kit';
import { type Mongo, ObjectId, toObjectId } from '@beautinique/backend-server-mongo';
import { decide, type Grant, type ResourceScope, scopeSpec } from '@beautinique/shared-authz';
import { CODE_SCOPE_TYPES, permissions, type ScopeType } from '@beautinique/shared-contracts';

import { ACCESS_COPIES, type AccessCopy, ROLE_COPIES, type RoleCopy } from './access.ts';

/**
 * The platform kernel's authorize() and scopeFilter() (ARCHITECTURE §7.3, TASKS T4.1): what the
 * caller may do comes from core's copy of identity's grants (T3.5) and the permission catalogue,
 * by permission and scope, never by a role's name (RULES §3.5). The gateway already checked that
 * some grant holds the permission and the step-up; here the scope is checked too.
 */

/**
 * When the passport is newer than the copy (an event still on its way), the copy is read again this
 * many times, this far apart, before the caller gets a 503 (owner, 2026-11-14).
 */
export const COPY_RETRIES = 3;
export const COPY_RETRY_MS = 500;

/** Who calls, and the grants that count in the app they act from (the passport's app). */
export interface CallerAccess {
  passport: Passport;
  /** As shared-authz reads them; each grant's validity is checked at every decision */
  grants: Grant[];
}

export interface AccessOptions {
  retries?: number;
  retryMs?: number;
}

/** A role's grants as shared-authz reads them: its key, permissions and scope ids as text. */
function grantsFrom(copy: AccessCopy, roles: ReadonlyMap<string, RoleCopy>, app: string): Grant[] {
  return copy.grants.flatMap((grant) => {
    const role = roles.get(grant.roleId.toHexString());
    // another app's grant, or a role the copy lost or that was retired, allows nothing here
    if (grant.app !== app || !role || role.retired) return [];
    return [
      {
        role: role.key,
        permissions: role.permissions,
        scope: {
          type: grant.scope.type,
          ids: grant.scope.ids.map((id) => (typeof id === 'string' ? id : id.toHexString())),
        },
        validFrom: grant.validFrom?.toISOString() ?? null,
        validTo: grant.validTo?.toISOString() ?? null,
      },
    ];
  });
}

/**
 * The caller's access from core's copy. A copy older than the passport (its `authzVersion` is
 * lower, or there is none yet) is read again `retries` times, `retryMs` apart; still older:
 * 503, never a decision on old grants (fail closed).
 */
export async function accessOf(
  mongo: Mongo,
  passport: Passport,
  { retries = COPY_RETRIES, retryMs = COPY_RETRY_MS }: AccessOptions = {},
): Promise<CallerAccess> {
  const userId = toObjectId(passport.userId);
  for (let attempt = 0; ; attempt += 1) {
    const copy = await mongo.db.collection<AccessCopy>(ACCESS_COPIES).findOne({ _id: userId });
    if (copy && copy.authzVersion >= passport.authzVersion) {
      const roleIds = [...new Set(copy.grants.map((grant) => grant.roleId.toHexString()))];
      const roles =
        roleIds.length === 0
          ? []
          : await mongo.db
              .collection<RoleCopy>(ROLE_COPIES)
              .find({ _id: { $in: roleIds.map((id) => new ObjectId(id)) } })
              .toArray();
      const byId = new Map(roles.map((role) => [role._id.toHexString(), role]));
      return { passport, grants: grantsFrom(copy, byId, passport.app) };
    }
    if (attempt >= retries) {
      throw new AppError(
        'SERVICE_UNAVAILABLE',
        'Your access is being updated. Try again in a moment.',
      );
    }
    await sleep(retryMs);
  }
}

/**
 * Allows the caller to use `permission` on `resource` (where it sits: its id per scope type, a
 * location with its whole chain), or throws: 403 when no grant of theirs holds the permission
 * here, 404 when the resource is outside their scope, as if it were not there (owner, 2026-11-14).
 * No resource: the permission alone (a list, then filtered with scopeFilter). Returns the grant
 * that allowed it.
 */
export function authorize(
  access: CallerAccess,
  permission: string,
  resource?: ResourceScope,
  { notFound = 'Not found.' }: { notFound?: string } = {},
): Grant {
  const decision = decide(access.grants, permission, resource, { permissions });
  if (decision.allowed && decision.grant) return decision.grant;
  if (decision.reason === 'out-of-scope') throw new AppError('NOT_FOUND', notFound);
  throw new AppError('FORBIDDEN', 'You do not have access to this.');
}

/** Where a collection keeps each scope's id: `{ state: 'stateId', sellerOrg: 'sellerOrgId' }`. */
export type ScopeFields = Partial<Record<Exclude<ScopeType, 'global'>, string>>;

/** A filter that matches nothing (the caller may list, but reaches none of these). */
const NOTHING = { _id: { $in: [] } };

/**
 * The MongoDB filter of everything the caller may reach with `permission` (ARCHITECTURE §7.3), so
 * a list, a queue or an export stays inside their scope: `{}` for a global grant, else the ids of
 * each scope type on its field (a document names a state by its code, any other place or party by
 * its ObjectId). A scope type the collection has no field for reaches nothing here. 403 when no
 * active grant can use the permission (authorize), the same as for one resource.
 */
export function scopeFilter(
  access: CallerAccess,
  permission: string,
  fields: ScopeFields,
): Record<string, unknown> {
  // the same 403 as authorize: no active grant may use the permission at all
  authorize(access, permission);
  const spec = scopeSpec(access.grants, permission, { permissions });
  if (spec.global) return {};
  const parts = Object.entries(spec.ids).flatMap(([type, ids]) => {
    const field = fields[type as keyof ScopeFields];
    if (field === undefined || ids.length === 0) return [];
    const values = CODE_SCOPE_TYPES.has(type as ScopeType) ? ids : ids.map((id) => toObjectId(id));
    return [{ [field]: { $in: values } }];
  });
  if (parts.length === 0) return NOTHING;
  return parts.length === 1 ? (parts[0] ?? NOTHING) : { $or: parts };
}
