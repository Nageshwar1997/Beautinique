import { type ClientSession, type Mongo, ObjectId } from '@beautinique/backend-server-mongo';
import { subscribe, type Subscription } from '@beautinique/backend-server-queue';
import {
  type AppId,
  CODE_SCOPE_TYPES,
  grantsChanged,
  roleChanged,
  type ScopeType,
  userChanged,
} from '@beautinique/shared-contracts';

/**
 * Core's copy of who may do what (ARCHITECTURE §5.2, TASKS T3.5): identity's snapshot events of
 * the roles, each account's grants and the accounts, kept here so authorize() (T4.1) never calls
 * identity. Each copy keeps the newest snapshot: a late or repeated event never puts an older one
 * back (the queue may hand one over twice, or late after a retry).
 */
export const ROLE_COPIES = 'platform_roles';
export const ACCESS_COPIES = 'platform_access';
export const USER_COPIES = 'platform_users';

export const ROLE_COPY = 'core.roleCopy';
export const ACCESS_COPY = 'core.accessCopy';
export const USER_COPY = 'core.userCopy';

/** A role as identity last sent it: its permission keys are what its grants allow. */
export interface RoleCopy {
  /** The role's id in identity */
  _id: ObjectId;
  key: string;
  app: AppId;
  permissions: string[];
  scopeTypes: ScopeType[];
  mfaRequired: boolean;
  retired: boolean;
  changedAt: Date;
}

/** One grant of an account, as identity last sent it (its role is a RoleCopy). */
export interface GrantCopy {
  grantId: ObjectId;
  roleId: ObjectId;
  app: AppId;
  /** A state's code as text; a document (an account, a seller organisation ...) as its ObjectId */
  scope: { type: ScopeType; ids: (ObjectId | string)[] };
  validFrom: Date | null;
  validTo: Date | null;
}

/** An account's grants, active now or later, at the account's authz version. */
export interface AccessCopy {
  /** The account's id */
  _id: ObjectId;
  /** Identity's version of the grants; a passport with a higher one is newer than this copy */
  authzVersion: number;
  grants: GrantCopy[];
  copiedAt: Date;
}

/** An account as identity last sent it. */
export interface UserCopy {
  _id: ObjectId;
  email: string;
  status: 'active';
  createdAt: Date;
  changedAt: Date;
}

/**
 * Writes `next` in place of the stored document only when `newer` holds for the stored one (or
 * there is none): one update, so two copies of an event at once can never put the older back.
 * `$literal` keeps the values as data, never as expressions.
 */
async function keepNewest(
  mongo: Mongo,
  session: ClientSession,
  collection: string,
  next: { _id: ObjectId } & Record<string, unknown>,
  newer: Record<string, unknown>,
): Promise<void> {
  await mongo.db
    .collection(collection)
    .updateOne(
      { _id: next._id },
      [{ $replaceWith: { $cond: [newer, { $literal: next }, '$$ROOT'] } }],
      { upsert: true, session },
    );
}

const date = (iso: string | null): Date | null => (iso === null ? null : new Date(iso));

/** What the queue worker runs for identity's snapshot events: DB work only, safe to run again. */
export function accessSubscriptions({ mongo }: { mongo: Mongo }): Subscription[] {
  return [
    subscribe(ROLE_COPY, roleChanged, async (event, session) => {
      const { roleId, changedAt, ...role } = event.data;
      const at = new Date(changedAt);
      // the same moment again (a repeat) writes the same role: harmless
      await keepNewest(
        mongo,
        session,
        ROLE_COPIES,
        { _id: new ObjectId(roleId), ...role, changedAt: at },
        { $lte: [{ $ifNull: ['$changedAt', new Date(0)] }, at] },
      );
    }),
    subscribe(ACCESS_COPY, grantsChanged, async (event, session) => {
      const { userId, authzVersion, grants } = event.data;
      await keepNewest(
        mongo,
        session,
        ACCESS_COPIES,
        {
          _id: new ObjectId(userId),
          authzVersion,
          grants: grants.map((grant): GrantCopy => ({
            grantId: new ObjectId(grant.grantId),
            roleId: new ObjectId(grant.roleId),
            app: grant.app,
            scope: {
              type: grant.scope.type,
              // every id that names a document is an ObjectId here too (RULES §4.17)
              ids: CODE_SCOPE_TYPES.has(grant.scope.type)
                ? [...grant.scope.ids]
                : grant.scope.ids.map((id) => new ObjectId(id)),
            },
            validFrom: date(grant.validFrom),
            validTo: date(grant.validTo),
          })),
          copiedAt: new Date(),
        },
        // the same version again replaces it too: the first copy and a change agree on it
        { $lte: [{ $ifNull: ['$authzVersion', -1] }, authzVersion] },
      );
    }),
    subscribe(USER_COPY, userChanged, async (event, session) => {
      const { userId, createdAt, changedAt, ...user } = event.data;
      const at = new Date(changedAt);
      await keepNewest(
        mongo,
        session,
        USER_COPIES,
        { _id: new ObjectId(userId), ...user, createdAt: new Date(createdAt), changedAt: at },
        { $lte: [{ $ifNull: ['$changedAt', new Date(0)] }, at] },
      );
    }),
  ];
}
