import type { PermissionDefinition, ScopeType } from '@beautinique/shared-contracts';

import type { Actor, Grant, Resource, Scope } from './actor.ts';

export type Denial = 'unauthenticated' | 'forbidden' | 'not-found' | 'step-up-required';

export type Decision =
  { allowed: true; scopes: readonly Scope[] } | { allowed: false; reason: Denial };

// The grants that reach a permission, by the scope the permission applies to (docs/ARCHITECTURE.md
// §11 rule 4): `global` holds `national`, which holds `state`, `district`, `subDistrict` and `hub`;
// a warehouse is inside its district. `self` and `seller` are reached only by their own kind and by
// `global`. A `Set` for each, made once, so each check is a lookup.
const REACHED_BY: ReadonlyMap<ScopeType, ReadonlySet<ScopeType>> = new Map(
  (
    [
      ['self', ['self']],
      ['seller', ['seller']],
      ['hub', ['hub', 'subDistrict', 'district', 'state', 'national']],
      ['subDistrict', ['subDistrict', 'district', 'state', 'national']],
      ['district', ['district', 'state', 'national']],
      ['state', ['state', 'national']],
      ['warehouse', ['warehouse', 'district', 'state', 'national']],
      ['national', ['national']],
      ['global', []],
    ] satisfies [ScopeType, ScopeType[]][]
  ).map(([scope, reachedBy]) => [scope, new Set<ScopeType>([...reachedBy, 'global'])]),
);

// Does this grant reach this resource? A grant of the account's own things needs the resource to be
// its own; of a seller or an area, the resource must be that seller's or inside that area; a
// `national` or `global` grant reaches every one. What the resource does not say cannot be proven.
function reaches(grant: Scope, resource: Resource, actor: Actor): boolean {
  switch (grant.type) {
    case 'global':
    case 'national':
      return true;
    case 'self':
      return resource.ownerId !== undefined && resource.ownerId === actor.accountId;
    case 'seller':
      return resource.sellerId !== undefined && resource.sellerId === grant.id;
    default: {
      const place = resource.area?.[grant.type];
      return place !== undefined && place === grant.id;
    }
  }
}

function inForce(grant: Grant, at: number): boolean {
  return (
    (grant.validFrom === undefined || grant.validFrom <= at) &&
    (grant.validUntil === undefined || at < grant.validUntil)
  );
}

/**
 * Whether an actor may use a permission, for a resource (docs/ARCHITECTURE.md §11 rule 7, SR-032): a
 * pure function, with no I/O and no clock of its own (`now` is given). The answer is the first
 * that applies:
 *
 * - no actor: `unauthenticated` (401);
 * - no grant in force for the permission, or the permission asks for an authenticator that the
 *   account has not set up: `forbidden` (403);
 * - a resource that no grant reaches: `not-found` (404), the same as a thing that is not there
 *   (SR-033);
 * - a permission that asks for a step-up, and the last code is no longer fresh: `step-up-required`
 *   (403, D-185).
 *
 * With no resource (a route that lists or creates) the scopes of the grants in force are given, so
 * that the handler can filter its query by them (SR-033, SR-034). With a resource, only the
 * scopes that reach it.
 */
export function authorize(
  actor: Actor | undefined,
  permission: PermissionDefinition,
  resource: Resource | undefined,
  now: Date,
): Decision {
  if (actor === undefined) return { allowed: false, reason: 'unauthenticated' };

  // One pass over the grants of the account, which are few (they have an end, SR-037).
  const at = now.getTime();
  const reachedBy = REACHED_BY.get(permission.scope);
  const held = actor.grants.filter(
    (grant) =>
      grant.permission === permission.name &&
      inForce(grant, at) &&
      reachedBy?.has(grant.scope.type) === true,
  );
  if (held.length === 0 || (permission.authenticator && !actor.authenticator)) {
    return { allowed: false, reason: 'forbidden' };
  }

  const scopes = held
    .filter((grant) => resource === undefined || reaches(grant.scope, resource, actor))
    .map((grant) => grant.scope);
  if (scopes.length === 0) return { allowed: false, reason: 'not-found' };

  if (permission.stepUp && (actor.stepUpUntil === undefined || actor.stepUpUntil <= at)) {
    return { allowed: false, reason: 'step-up-required' };
  }
  return { allowed: true, scopes };
}
