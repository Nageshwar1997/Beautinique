import {
  array,
  boolean,
  emailZod,
  enum as zodEnum,
  isoDateTimeZod,
  number,
  object,
  objectIdZod,
  string,
} from '@beautinique/shared-zod';

import { defineEvent } from '../events';
import { APPS, SCOPE_TYPES } from '../platform';
import { roleKeyZod, scopeZod } from './rbac';

/**
 * Identity's snapshot events (ARCHITECTURE §5.2, TASKS T3.5): each carries the whole of one role,
 * one account's grants or one account as it is now, so a copy elsewhere (core, for authorize())
 * keeps the newest and never needs to call identity. Identity writes them in the transaction of
 * the change. A role's permissions live in its own snapshot, not in every grant, so an account's
 * snapshot stays small: about 250 bytes a grant, so some 60 grants fit in the 16 KB of an event.
 */

/** A role as data after it changed: the release step's sync, or Master's sub-roles. */
export const roleChanged = defineEvent({
  type: 'identity.role.changed',
  version: 1,
  producer: 'identity',
  description: 'A role was made or changed (permissions, scope types, authenticator, retired)',
  data: object({
    roleId: objectIdZod,
    key: roleKeyZod,
    app: zodEnum(APPS),
    permissions: array(string()),
    scopeTypes: array(zodEnum(SCOPE_TYPES)),
    mfaRequired: boolean(),
    retired: boolean(),
    /** When identity changed it: a copy keeps the newest */
    changedAt: isoDateTimeZod,
  }),
});

/**
 * The most grants an account holds at once, active now or starting later (owner, 2026-11-14): its
 * snapshot carries all of them, and 50 stay well inside one event. Identity refuses one more.
 */
export const MAX_GRANTS_PER_ACCOUNT = 50;

/** One grant in an account's snapshot: its role by id (the role's snapshot has the rest). */
export const grantSnapshotZod = object({
  grantId: objectIdZod,
  roleId: objectIdZod,
  app: zodEnum(APPS),
  scope: scopeZod,
  validFrom: isoDateTimeZod.nullable(),
  validTo: isoDateTimeZod.nullable(),
});

/** An account's grants after any change to them (given, ended, a role's holders renewed). */
export const grantsChanged = defineEvent({
  type: 'identity.grant.changed',
  version: 1,
  producer: 'identity',
  description: "An account's grants changed; it carries all of them, active now or later",
  data: object({
    userId: objectIdZod,
    /**
     * The account's authz version after the change: a copy keeps the highest, and a passport
     * with a higher one is newer than the copy (ARCHITECTURE §7.2)
     */
    authzVersion: number().int().min(0),
    /** Every grant active now or starting later; ended ones are left out */
    grants: array(grantSnapshotZod),
  }),
});

/** An account as other deployables may know it: made at sign-up (its email never changes). */
export const userChanged = defineEvent({
  type: 'identity.user.changed',
  version: 1,
  producer: 'identity',
  description: 'An account was made or changed',
  data: object({
    userId: objectIdZod,
    email: emailZod,
    status: zodEnum(['active']),
    createdAt: isoDateTimeZod,
    /** When identity changed it: a copy keeps the newest */
    changedAt: isoDateTimeZod,
  }),
});

export const ACCESS_EVENTS = [roleChanged, grantsChanged, userChanged] as const;
