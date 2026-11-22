import {
  LOCATION_SCOPES,
  type PermissionDefinition,
  SCOPE_TYPES,
  type ScopeType,
} from '@beautinique/shared-contracts';

/** A grant's scope: the type and the ids it covers (`global` has no ids). */
export interface Scope {
  type: ScopeType;
  ids: readonly string[];
}

/**
 * A role given to a user for a scope, for a time (ARCHITECTURE §7.3). Roles are data, so the grant
 * carries the role's permission keys already resolved.
 */
export interface Grant {
  role: string;
  permissions: readonly string[];
  scope: Scope;
  /** ISO date-time the grant starts; missing = already started. */
  validFrom?: string | null;
  /** ISO date-time the grant ends (not included); missing = no end. */
  validTo?: string | null;
}

/**
 * Where a resource sits: its id for each scope type that applies. A location must carry its whole
 * chain (a hub also names its city, district and state), because that is how a state grant covers
 * a hub. `self` is the id of the user the resource belongs to.
 */
export type ResourceScope = Partial<Record<Exclude<ScopeType, 'global'>, string>>;

/** Permission definitions by key, e.g. from `permissionCatalogue()` of shared-contracts. */
export type PermissionLookup = ReadonlyMap<string, PermissionDefinition>;

export type DecisionReason =
  'allowed' | 'no-grant' | 'not-active' | 'scope-type-not-allowed' | 'out-of-scope';

export interface Decision {
  allowed: boolean;
  reason: DecisionReason;
  /** The grant that allowed it. */
  grant?: Grant;
}

export interface CheckOptions {
  permissions: PermissionLookup;
  /** The time to check validity windows at (default: now). */
  now?: Date;
}

/** True when the grant has started and not ended at `now`. */
export function isGrantActive(grant: Grant, now: Date = new Date()): boolean {
  const at = now.getTime();
  const from = grant.validFrom ? Date.parse(grant.validFrom) : Number.NEGATIVE_INFINITY;
  const to = grant.validTo ? Date.parse(grant.validTo) : Number.POSITIVE_INFINITY;
  if (Number.isNaN(from) || Number.isNaN(to)) {
    throw new Error(`Grant "${grant.role}" has an invalid validity date`);
  }
  return from <= at && at < to;
}

function assertLocationChain(resource: ResourceScope): void {
  // the narrowest location given must come with every wider one
  const chain = LOCATION_SCOPES.slice(1) as readonly Exclude<ScopeType, 'global'>[];
  let deepest = -1;
  chain.forEach((type, index) => {
    if (resource[type] !== undefined) deepest = index;
  });
  for (let i = 0; i < deepest; i += 1) {
    const wider = chain[i];
    if (wider !== undefined && resource[wider] === undefined) {
      throw new Error(
        `Resource scope has ${chain[deepest] ?? ''} but no ${wider}: pass the whole location chain`,
      );
    }
  }
}

/**
 * Does the scope cover the resource? `global` covers everything; any other type covers resources
 * whose id for that type is in the scope (a state scope covers its districts, cities and hubs,
 * because those resources carry their state id). Without a resource, any scope counts.
 */
export function scopeCovers(scope: Scope, resource?: ResourceScope): boolean {
  if (!(SCOPE_TYPES as readonly string[]).includes(scope.type)) {
    throw new Error(`Unknown scope type "${scope.type}"`);
  }
  if (scope.type === 'global' || resource === undefined) {
    return true;
  }
  assertLocationChain(resource);
  const id = resource[scope.type];
  return id !== undefined && scope.ids.includes(id);
}

function definitionOf(key: string, permissions: PermissionLookup): PermissionDefinition {
  const definition = permissions.get(key);
  if (!definition) {
    throw new Error(`Unknown permission "${key}": declare it with definePermission`);
  }
  return definition;
}

/**
 * Decides whether any of the user's grants allows `permission` on `resource` (or anywhere, when no
 * resource is given: menus, buttons). Deny by default; no wildcards, so no role bypasses a check.
 * The reason is for audit logs and support, not for the end user.
 */
export function decide(
  grants: readonly Grant[],
  permission: string,
  resource: ResourceScope | undefined,
  options: CheckOptions,
): Decision {
  const definition = definitionOf(permission, options.permissions);
  const now = options.now ?? new Date();
  const holding = grants.filter((grant) => grant.permissions.includes(permission));
  if (holding.length === 0) return { allowed: false, reason: 'no-grant' };
  const active = holding.filter((grant) => isGrantActive(grant, now));
  if (active.length === 0) return { allowed: false, reason: 'not-active' };
  const typed = active.filter((grant) => definition.scopeTypes.includes(grant.scope.type));
  if (typed.length === 0) return { allowed: false, reason: 'scope-type-not-allowed' };
  const grant = typed.find((g) => scopeCovers(g.scope, resource));
  return grant
    ? { allowed: true, reason: 'allowed', grant }
    : { allowed: false, reason: 'out-of-scope' };
}

/** `decide(...).allowed`. */
export function can(
  grants: readonly Grant[],
  permission: string,
  resource: ResourceScope | undefined,
  options: CheckOptions,
): boolean {
  return decide(grants, permission, resource, options).allowed;
}

/** Everything a user may reach with a permission: global, or the ids per scope type. */
export interface ScopeSpec {
  global: boolean;
  ids: Partial<Record<Exclude<ScopeType, 'global'>, string[]>>;
}

/**
 * The scopes a user holds a permission in, merged across grants (active, allowed scope types only).
 * The backend turns it into a query filter (`scopeFilter()`), so lists, queues and exports stay
 * inside the user's scope. Nothing held = `{ global: false, ids: {} }` = see nothing.
 */
export function scopeSpec(
  grants: readonly Grant[],
  permission: string,
  options: CheckOptions,
): ScopeSpec {
  const definition = definitionOf(permission, options.permissions);
  const now = options.now ?? new Date();
  const spec: ScopeSpec = { global: false, ids: {} };
  for (const grant of grants) {
    if (
      !grant.permissions.includes(permission) ||
      !definition.scopeTypes.includes(grant.scope.type) ||
      !isGrantActive(grant, now)
    ) {
      continue;
    }
    if (grant.scope.type === 'global') {
      return { global: true, ids: {} };
    }
    const list = new Set([...(spec.ids[grant.scope.type] ?? []), ...grant.scope.ids]);
    spec.ids[grant.scope.type] = [...list].sort();
  }
  return spec;
}

/** True when the spec reaches anything at all. */
export const reachesAnything = (spec: ScopeSpec): boolean =>
  spec.global || Object.values(spec.ids).some((ids) => ids.length > 0);

/** Step-up MFA is fresh when it happened within `maxAgeMs` (5 minutes by default, ARCHITECTURE §7). */
export function isStepUpFresh(
  lastStepUpAt: string | null | undefined,
  now: Date = new Date(),
  maxAgeMs = 5 * 60_000,
): boolean {
  if (!lastStepUpAt) return false;
  const at = Date.parse(lastStepUpAt);
  if (Number.isNaN(at)) return false;
  const age = now.getTime() - at;
  return age >= 0 && age <= maxAgeMs;
}
