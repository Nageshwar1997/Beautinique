import { SERVICES, type Service } from './constants/services.ts';
import type { ScopeType } from './constants/scope-types.ts';

export interface PermissionDefinition {
  /** `<service>.<resource>.<action>`, like `catalog.listing.approve` (docs/ARCHITECTURE.md §11 rule 1). */
  name: `${Service}.${string}.${string}`;
  /** What the permission applies to: the person's own things, a seller, an area. */
  scope: ScopeType;
  /** The person must have an authenticator set up. */
  authenticator: boolean;
  /** A fresh authenticator code is asked first (D-185). Only a permission with an authenticator can have it. */
  stepUp: boolean;
  /** It may be given to a sub-role. Never for the permissions of SR-037 (grants, kill switches, payout). */
  subRoleAllowed: boolean;
}

const NAME_FORMAT = new RegExp(`^(${SERVICES.join('|')})\\.[a-z][a-z0-9_]*\\.[a-z][a-z0-9_]*$`);

/** The one place a permission is told: its name, its scope, the authenticator, the step-up and the sub-roles. */
export function definePermission<const P extends PermissionDefinition>(permission: P): Readonly<P> {
  if (!NAME_FORMAT.test(permission.name)) {
    throw new RangeError(
      `The permission ${permission.name} is not <service>.<resource>.<action>, with a service of the list.`,
    );
  }
  if (permission.stepUp && !permission.authenticator) {
    throw new RangeError(
      `The permission ${permission.name} asks for a step-up without an authenticator.`,
    );
  }
  return Object.freeze({ ...permission });
}
