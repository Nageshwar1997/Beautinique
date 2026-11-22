import {
  LOCATION_SCOPES,
  type LocationScope,
  type PermissionDefinition,
  SCOPE_TYPES,
  type ScopeType,
} from '@beautinique/shared-contracts';

import {
  type CheckOptions,
  type Grant,
  type ResourceScope,
  type Scope,
  scopeCovers,
} from './matcher';

/**
 * Where a location id sits: its whole chain (a district names its state), e.g. from the location
 * master. `undefined` = the id is not known, which never counts as inside anything.
 */
export type ChainOf = (
  type: Exclude<LocationScope, 'global'>,
  id: string,
) => ResourceScope | undefined;

const isScopeType = (type: string): type is ScopeType =>
  (SCOPE_TYPES as readonly string[]).includes(type);

function assertKnownType(scope: Scope): void {
  if (!isScopeType(scope.type)) {
    throw new Error(`Unknown scope type "${String(scope.type)}"`);
  }
}

/**
 * Is every place `inner` names inside `outer`? This is the rule for handing a grant on: nobody can
 * give a scope wider than their own. `global` holds everything; a location scope holds the places
 * below it (`chainOf` tells where an id sits); other types hold only their own ids. An `inner`
 * that names nothing, or an id `chainOf` does not know, is not inside.
 */
export function scopeWithin(outer: Scope, inner: Scope, chainOf: ChainOf): boolean {
  assertKnownType(outer);
  assertKnownType(inner);
  if (inner.type !== 'global' && inner.ids.length === 0) return false;
  if (outer.type === 'global') return true;
  if (inner.type === 'global') return false;
  const { type } = inner;
  const isLocation = (LOCATION_SCOPES as readonly string[]).includes(type);
  return inner.ids.every((id) => {
    const place = isLocation ? chainOf(type as Exclude<LocationScope, 'global'>, id) : {};
    return place !== undefined && scopeCovers(outer, { ...place, [type]: id });
  });
}

/** One thing wrong with a grant, for the form field it belongs to. */
export interface GrantProblem {
  field: 'role' | 'permissions' | 'scope' | 'validity';
  message: string;
}

/**
 * Everything wrong with a grant before it is saved: an empty role, unknown or repeated permission
 * keys, a scope that does not fit its type (`global` has no ids, the rest need some), a scope type
 * that none of the role's permissions can be used in (the grant would never allow anything), and
 * validity dates that are not dates or do not run forwards. An empty list = fine.
 */
export function grantProblems(
  grant: Grant,
  options: Pick<CheckOptions, 'permissions'>,
): GrantProblem[] {
  const problems: GrantProblem[] = [];
  const add = (field: GrantProblem['field'], message: string): void => {
    problems.push({ field, message });
  };

  if (grant.role.trim() === '') add('role', 'Role is missing');

  if (grant.permissions.length === 0) add('permissions', 'Role has no permissions');
  const seen = new Set<string>();
  const known: PermissionDefinition[] = [];
  for (const key of grant.permissions) {
    if (seen.has(key)) {
      add('permissions', `Permission "${key}" is listed twice`);
      continue;
    }
    seen.add(key);
    const definition = options.permissions.get(key);
    if (definition) known.push(definition);
    else add('permissions', `Unknown permission "${key}"`);
  }

  const { type, ids } = grant.scope;
  if (!isScopeType(type)) {
    add('scope', `Unknown scope type "${String(type)}"`);
  } else {
    if (type === 'global' && ids.length > 0) add('scope', 'A global scope has no ids');
    if (type !== 'global' && ids.length === 0)
      add('scope', `A ${type} scope needs at least one id`);
    if (ids.some((id) => id.trim() === '')) add('scope', 'Scope ids cannot be empty');
    if (new Set(ids).size !== ids.length) add('scope', 'Scope ids are listed twice');
    if (known.length > 0 && !known.some((definition) => definition.scopeTypes.includes(type))) {
      add('scope', `No permission of this role can be used in a ${type} scope`);
    }
  }

  const dates = (['validFrom', 'validTo'] as const).map((name) => {
    const value = grant[name];
    if (value === null || value === undefined) return undefined;
    const at = Date.parse(value);
    if (Number.isNaN(at))
      add('validity', `${name === 'validFrom' ? 'Valid-from' : 'Valid-to'} is not a date`);
    return Number.isNaN(at) ? undefined : at;
  });
  const [from, to] = dates;
  if (from !== undefined && to !== undefined && from >= to) {
    add('validity', 'Valid-to must be after valid-from');
  }

  return problems;
}
