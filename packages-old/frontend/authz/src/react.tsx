import { useSession } from '@beautinique/frontend-auth-ui';
import type { ReactNode } from 'react';

import {
  type Access,
  allows,
  type Guarded,
  type NeedOptions,
  NO_ACCESS,
  type PermissionNeed,
  visibleTo,
} from './access';

/**
 * What the signed-in account may do in this app, from the session (GET /iam/me): nothing while
 * the session is unknown or signed out. Put the app inside auth-ui's SessionProvider.
 */
export function useAccess(): Access {
  const { state } = useSession();
  return state.status === 'signed-in' ? state.access : NO_ACCESS;
}

/** Whether the signed-in account holds what is needed (see `allows`). */
export function usePermission(need: PermissionNeed, options: NeedOptions = {}): boolean {
  return allows(useAccess(), need, options);
}

/** The items the signed-in account may see (nav links, cards ...), in their order. */
export function useVisible<Item extends Guarded>(items: readonly Item[]): Item[] {
  return visibleTo(useAccess(), items);
}

export interface CanProps extends NeedOptions {
  /** What it needs: one permission key, or several */
  permission: PermissionNeed;
  children: ReactNode;
  /** What shows instead (default nothing) */
  fallback?: ReactNode;
}

/**
 * Shows its children only to an account that holds the permission; the server still decides
 * every call, so this hides what would fail, it guards nothing.
 */
export function Can({ permission, match, children, fallback = null }: CanProps) {
  const allowed = usePermission(permission, match === undefined ? {} : { match });
  return <>{allowed ? children : fallback}</>;
}

export interface RequirePermissionProps extends NeedOptions {
  permission: PermissionNeed;
  children: ReactNode;
  /** The page for an account without it: the app's own "not for your role" page */
  denied: ReactNode;
}

/**
 * A route guard for a signed-in page (inside auth-ui's RequireSignIn): the page for an account
 * that holds the permission, else `denied`, so a typed link never opens a page of buttons that
 * all fail.
 */
export function RequirePermission({ permission, match, children, denied }: RequirePermissionProps) {
  const allowed = usePermission(permission, match === undefined ? {} : { match });
  return <>{allowed ? children : denied}</>;
}
