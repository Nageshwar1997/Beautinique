import type { ScopeType } from '@beautinique/shared-contracts';

/** A role the signed-in account holds in this app, with where (GET /iam/me `access.roles`). */
export interface HeldRole {
  /** `<app>.<name>`, or `<app>.c_<slug>` for one Master made */
  role: string;
  name: string;
  scope: { type: ScopeType; ids: readonly string[] };
}

/** What the signed-in account may do in this app (GET /iam/me `access`). */
export interface Access {
  roles: readonly HeldRole[];
  /** The permission keys of those roles: what the gateway checks */
  permissions: readonly string[];
}

/** Signed out, or an identity that sent no access: nothing is allowed. */
export const NO_ACCESS: Access = { roles: [], permissions: [] };

/** One permission key, or several. */
export type PermissionNeed = string | readonly string[];

export interface NeedOptions {
  /** With several keys: every one is needed (default), or any one of them (`'any'`) */
  match?: 'all' | 'any';
}

/**
 * Whether the access holds what is needed: one key, or several (all of them, or any with
 * `match: 'any'`). An empty list needs nothing. This only decides what the app shows: the
 * server checks every call again (ARCHITECTURE §7.3).
 */
export function allows(
  access: Access,
  need: PermissionNeed,
  { match = 'all' }: NeedOptions = {},
): boolean {
  const keys: readonly string[] = typeof need === 'string' ? [need] : need;
  if (keys.length === 0) return true;
  const held = new Set(access.permissions);
  return match === 'any' ? keys.some((key) => held.has(key)) : keys.every((key) => held.has(key));
}

/** Whether the account holds this role in the app, anywhere. */
export const holdsRole = (access: Access, role: string): boolean =>
  access.roles.some((held) => held.role === role);

/** The role keys the account holds in the app, each once. */
export const roleKeysOf = (access: Access): string[] => [
  ...new Set(access.roles.map((held) => held.role)),
];

/** An item that may need permissions to show: a nav link, a card, a button. */
export interface Guarded {
  /** What it needs; left out = shown to everyone signed in */
  permission?: PermissionNeed;
  /** With several keys: all of them (default) or any one */
  match?: 'all' | 'any';
}

/**
 * The items this access may see, in their order (nav filtering, ARCHITECTURE §9.2): an item
 * without `permission` always stays. The items come back as they are, `permission` and all.
 */
export function visibleTo<Item extends Guarded>(access: Access, items: readonly Item[]): Item[] {
  return items.filter(
    (item) =>
      item.permission === undefined ||
      allows(access, item.permission, item.match === undefined ? {} : { match: item.match }),
  );
}
