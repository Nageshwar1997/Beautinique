import { SCOPE_TYPES, type ScopeType } from './platform';

/** `<module>.<resource>.<action>`, lower case with underscores, e.g. `network.area.go_live.request`. */
const PERMISSION_KEY = /^[a-z][a-z0-9_]*(?:\.[a-z][a-z0-9_]*){2,}$/;

/** True for a well-formed permission key. */
export const isPermissionKey = (key: string): boolean => PERMISSION_KEY.test(key);

export type PermissionRisk = 'low' | 'medium' | 'high';

export interface PermissionDefinition<Key extends string = string> {
  key: Key;
  description: string;
  /** Grants with one of these scope types can use it (ARCHITECTURE §7.3). */
  scopeTypes: readonly ScopeType[];
  risk: PermissionRisk;
  /** Needs a recent MFA step-up. */
  mfa: boolean;
  /** Needs a second person to sign (maker-checker). */
  secondSignature: boolean;
}

/** Declares a permission key once, with its scope types and safeguards. Wrong declarations throw. */
export function definePermission<const Key extends string>(
  definition: PermissionDefinition<Key>,
): Readonly<PermissionDefinition<Key>> {
  const { key, scopeTypes } = definition;
  if (!PERMISSION_KEY.test(key)) {
    throw new Error(`Permission "${key}" must look like <module>.<resource>.<action>`);
  }
  if (definition.description.trim() === '') {
    throw new Error(`Permission "${key}" needs a description`);
  }
  if (scopeTypes.length === 0) {
    throw new Error(`Permission "${key}" needs at least one scope type`);
  }
  for (const type of scopeTypes) {
    if (!(SCOPE_TYPES as readonly string[]).includes(type)) {
      throw new Error(`Permission "${key}" has an unknown scope type "${type}"`);
    }
  }
  if (new Set(scopeTypes).size !== scopeTypes.length) {
    throw new Error(`Permission "${key}" lists a scope type twice`);
  }
  if (definition.secondSignature && definition.risk !== 'high') {
    throw new Error(`Permission "${key}" needs a second signature, so its risk must be high`);
  }
  return Object.freeze({ ...definition, scopeTypes: Object.freeze([...scopeTypes]) });
}

/** All permissions of the platform, keyed by permission key. Duplicate keys throw. */
export function permissionCatalogue(
  definitions: readonly PermissionDefinition[],
): ReadonlyMap<string, PermissionDefinition> {
  const catalogue = new Map<string, PermissionDefinition>();
  for (const definition of definitions) {
    if (catalogue.has(definition.key)) {
      throw new Error(`Permission "${definition.key}" is declared twice`);
    }
    catalogue.set(definition.key, definition);
  }
  return catalogue;
}
