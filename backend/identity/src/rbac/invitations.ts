import type { Passport } from '@beautinique/backend-server-kit';
import {
  type ClientSession,
  type IndexSpec,
  type Mongo,
  ObjectId,
  toObjectId,
  withTransaction,
} from '@beautinique/backend-server-mongo';
import { writeEvent } from '@beautinique/backend-server-queue';
import {
  type AppId,
  grantManage,
  grantRead,
  INVITATION_DAYS,
  type INVITATION_STATUSES,
  invitationCreated,
} from '@beautinique/shared-contracts';

import { type User, USERS } from '../users.ts';
import {
  appointingGrant,
  callerGrants,
  forbidden,
  grantShapeProblems,
  requirePermission,
  visibleFilter,
} from './authority.ts';
import { type RbacCatalog, rbacCatalog } from './catalog.ts';
import {
  type GrantRecord,
  GRANTS,
  overlapping,
  type Scope,
  scopeOf,
  type StoredScope,
  storedScope,
  writeGrant,
} from './grants.ts';
import {
  conflict,
  isDuplicateKey,
  type ManageDeps,
  notFound,
  roleByKey,
  roleCatalog,
  roleKeys,
  validationFailed,
} from './manage.ts';
import { readRoles } from './sync.ts';

export const INVITATIONS = 'identity_invitations';
const INVITATION_MS = INVITATION_DAYS * 24 * 60 * 60_000;

/**
 * Someone invited to a role by email (TASKS T3.3): accepted in the role's app with an email code
 * (otp.ts, purpose `invite`), which is when the grant is given. A `self` scope names no ids here:
 * the account's id fills it at acceptance. Kept after it ends, for audit. Every id in it is an
 * ObjectId (owner, 2026-11-12).
 */
export interface InvitationRecord {
  _id: ObjectId;
  email: string;
  roleId: ObjectId;
  /** The role's app (identity_apps): where it is accepted */
  appId: ObjectId;
  scope: StoredScope;
  validFrom: Date | null;
  validTo: Date | null;
  invitedBy: ObjectId;
  /** The app the inviter acted from: their right to give the role is checked again there */
  invitedFromAppId: ObjectId;
  status: 'pending' | 'accepted' | 'revoked' | 'expired';
  expiresAt: Date;
  createdAt: Date;
  /** When it was accepted, revoked or found expired */
  endedAt: Date | null;
  /** Who revoked it, or the account that accepted it */
  endedBy: ObjectId | null;
}

export const indexes: readonly IndexSpec[] = [
  {
    collection: INVITATIONS,
    name: 'email_appId_status',
    key: { email: 1, appId: 1, status: 1 },
  },
  {
    collection: INVITATIONS,
    name: 'pending_roleId_scope_unique',
    key: { email: 1, roleId: 1, 'scope.type': 1, 'scope.ids': 1 },
    unique: true,
    partialFilterExpression: { status: 'pending' },
  },
];

const invitationsOf = (mongo: Mongo) => mongo.db.collection<InvitationRecord>(INVITATIONS);

/** What the app sees: a pending invitation past its end shows as expired. */
export function invitationView(
  invitation: InvitationRecord,
  { role, catalog }: { role: string; catalog: RbacCatalog },
  now = new Date(),
) {
  const expired =
    invitation.status === 'pending' && invitation.expiresAt.getTime() <= now.getTime();
  const status: (typeof INVITATION_STATUSES)[number] = expired ? 'expired' : invitation.status;
  return {
    invitationId: invitation._id.toHexString(),
    email: invitation.email,
    role,
    app: catalog.appOf(invitation.appId),
    scope: scopeOf(invitation.scope),
    validFrom: invitation.validFrom?.toISOString() ?? null,
    validTo: invitation.validTo?.toISOString() ?? null,
    invitedBy: invitation.invitedBy.toHexString(),
    status,
    expiresAt: invitation.expiresAt.toISOString(),
    createdAt: invitation.createdAt.toISOString(),
  };
}

const dateOf = (value: string | null | undefined): Date | null =>
  value === null || value === undefined ? null : new Date(value);

export interface NewInvitationRequest {
  email: string;
  role: string;
  scope: Scope;
  validFrom?: string | null | undefined;
  validTo?: string | null | undefined;
}

/**
 * POST /iam/invitations: like giving a role (the same authority and scope rules), to an email
 * that may have no account yet. Nobody invites themselves; a person who holds the role there, or
 * has the same invitation waiting, is not invited again. notify emails it (outbox, same
 * transaction).
 */
export async function createInvitation(
  deps: ManageDeps,
  passport: Passport,
  body: NewInvitationRequest,
  requestId: string,
) {
  const now = new Date();
  const userId = toObjectId(passport.userId);
  const caller = await callerGrants(deps.mongo, { userId, app: passport.app, now });
  requirePermission(caller, grantManage.key);
  const users = deps.mongo.db.collection<User>(USERS);
  const me = await users.findOne({ _id: userId }, { projection: { email: 1 } });
  if (me?.email === body.email) throw forbidden('Nobody invites themselves.');
  const role = await roleByKey(deps.mongo, body.role);
  if (!role) throw validationFailed([{ path: ['role'], message: 'No such role' }]);
  const validFrom = dateOf(body.validFrom);
  const validTo = dateOf(body.validTo);
  const problems = grantShapeProblems(role, body.scope, {
    validFrom,
    validTo,
    selfId: null,
    now,
  });
  if (problems.length > 0) throw validationFailed(problems);
  if (!appointingGrant(caller, role, body.scope)) {
    throw forbidden('You cannot give this role in this scope.');
  }
  const account = await users.findOne({ email: body.email }, { projection: { _id: 1 } });
  if (account) {
    const held =
      body.scope.type === 'self'
        ? { type: 'self' as const, ids: [account._id.toHexString()] }
        : body.scope;
    if (
      await deps.mongo.db
        .collection<GrantRecord>(GRANTS)
        .findOne(overlapping(account._id, role._id, held), { projection: { _id: 1 } })
    ) {
      throw conflict('This person holds this role there already.');
    }
  }
  const catalog = await rbacCatalog(deps.mongo);
  const scope = storedScope(body.scope);
  const invitation: InvitationRecord = {
    _id: new ObjectId(),
    email: body.email,
    roleId: role._id,
    appId: role.appId,
    scope,
    validFrom,
    validTo,
    invitedBy: userId,
    invitedFromAppId: catalog.appId(passport.app),
    status: 'pending',
    expiresAt: new Date(now.getTime() + INVITATION_MS),
    createdAt: now,
    endedAt: null,
    endedBy: null,
  };
  const invitations = invitationsOf(deps.mongo);
  let made: boolean;
  try {
    made = await withTransaction(deps.mongo, async (session) => {
      // one that ran out stops holding its place, so the same invitation can go again
      await invitations.updateMany(
        { email: body.email, roleId: role._id, status: 'pending', expiresAt: { $lte: now } },
        { $set: { status: 'expired', endedAt: now } },
        { session },
      );
      const waiting = await invitations.findOne(
        {
          email: body.email,
          roleId: role._id,
          status: 'pending',
          'scope.type': scope.type,
          ...(scope.ids.length === 0
            ? { 'scope.ids': { $size: 0 } }
            : { 'scope.ids': { $in: scope.ids } }),
        },
        { session, projection: { _id: 1 } },
      );
      if (waiting) return false;
      await invitations.insertOne(invitation, { session });
      await writeEvent(deps.mongo, session, invitationCreated, {
        aggregate: { type: 'invitation', id: invitation._id.toHexString() },
        actor: { type: 'user', id: passport.userId },
        correlationId: requestId,
        data: {
          invitationId: invitation._id.toHexString(),
          email: invitation.email,
          app: role.app,
          roleName: role.name,
          expiresAt: invitation.expiresAt.toISOString(),
        },
      });
      return true;
    });
  } catch (error) {
    if (isDuplicateKey(error)) made = false;
    else throw error;
  }
  if (!made) throw conflict('This invitation is waiting already.');
  deps.logger.info(
    { invitationId: invitation._id, role: role.key, by: passport.userId },
    'invitation made',
  );
  return { invitation: invitationView(invitation, { role: role.key, catalog }, now) };
}

/** POST /iam/invitations/:invitationId/revoke: one not accepted yet, by whoever could make it. */
export async function revokeInvitation(deps: ManageDeps, passport: Passport, invitationId: string) {
  const now = new Date();
  const userId = toObjectId(passport.userId);
  const caller = await callerGrants(deps.mongo, { userId, app: passport.app, now });
  requirePermission(caller, grantManage.key);
  const invitations = invitationsOf(deps.mongo);
  const id = toObjectId(invitationId, { notFound: 'Invitation not found.' });
  const invitation = await invitations.findOne({ _id: id });
  if (!invitation) throw notFound('Invitation');
  const [role] = await readRoles(deps.mongo, { _id: invitation.roleId });
  if (!role || !appointingGrant(caller, role, scopeOf(invitation.scope))) {
    throw forbidden('You cannot take back this invitation.');
  }
  const revoked = await invitations.findOneAndUpdate(
    { _id: id, status: 'pending' },
    { $set: { status: 'revoked', endedAt: now, endedBy: userId } },
    { returnDocument: 'after' },
  );
  if (revoked) {
    deps.logger.info({ invitationId, by: passport.userId }, 'invitation taken back');
  }
  const catalog = await rbacCatalog(deps.mongo);
  return { invitation: invitationView(revoked ?? invitation, { role: role.key, catalog }, now) };
}

export interface InvitationQuery {
  cursor?: string | undefined;
  limit: number;
  status?: (typeof INVITATION_STATUSES)[number] | undefined;
}

/** GET /iam/invitations: the ones the caller may see (like grants), the newest first. */
export async function listInvitations(
  deps: ManageDeps,
  passport: Passport,
  query: InvitationQuery,
) {
  const now = new Date();
  const caller = await callerGrants(deps.mongo, {
    userId: toObjectId(passport.userId),
    app: passport.app,
    now,
  });
  requirePermission(caller, grantRead.key);
  const roles = await roleCatalog(deps.mongo);
  const visible = visibleFilter(caller, roles);
  if (!visible) return { items: [], nextCursor: null };
  const cursor =
    query.cursor === undefined ? undefined : toObjectId(query.cursor, { field: 'cursor' });
  const byStatus = {
    pending: { status: 'pending' as const, expiresAt: { $gt: now } },
    expired: {
      $or: [
        { status: 'expired' as const },
        { status: 'pending' as const, expiresAt: { $lte: now } },
      ],
    },
    accepted: { status: 'accepted' as const },
    revoked: { status: 'revoked' as const },
  };
  const page = await invitationsOf(deps.mongo)
    .find({
      $and: [
        visible,
        query.status === undefined ? {} : byStatus[query.status],
        cursor === undefined ? {} : { _id: { $lt: cursor } },
      ],
    })
    .sort({ _id: -1 })
    .limit(query.limit + 1)
    .toArray();
  const items = page.slice(0, query.limit);
  const catalog = await rbacCatalog(deps.mongo);
  const keyOf = roleKeys(roles);
  return {
    items: items.map((invitation) =>
      invitationView(invitation, { role: keyOf(invitation.roleId), catalog }, now),
    ),
    nextCursor: page.length > query.limit ? (items.at(-1)?._id.toHexString() ?? null) : null,
  };
}

/** An invitation waits for this email in this app (the invitation code goes out only then). */
export async function hasInvitation(
  mongo: Mongo,
  { email, app, now = new Date() }: { email: string; app: AppId; now?: Date },
): Promise<boolean> {
  const appId = (await rbacCatalog(mongo)).appId(app);
  return (
    (await invitationsOf(mongo).countDocuments(
      { email, appId, status: 'pending', expiresAt: { $gt: now } },
      { limit: 1 },
    )) > 0
  );
}

/**
 * The invitations of this email in this app that can still be accepted: pending, not run out,
 * the role not retired, and the inviter still able to give it there (a removed appointer's
 * invitations do not outlive them). The others found on the way are marked revoked.
 */
export async function acceptableInvitations(
  mongo: Mongo,
  session: ClientSession,
  { email, app, now }: { email: string; app: AppId; now: Date },
): Promise<InvitationRecord[]> {
  const invitations = invitationsOf(mongo);
  const catalog = await rbacCatalog(mongo);
  const waiting = await invitations
    .find(
      { email, appId: catalog.appId(app), status: 'pending', expiresAt: { $gt: now } },
      { session },
    )
    .toArray();
  const ok: InvitationRecord[] = [];
  for (const invitation of waiting) {
    const [role] = await readRoles(mongo, { _id: invitation.roleId }, { session });
    const inviter = await callerGrants(mongo, {
      userId: invitation.invitedBy,
      app: catalog.appOf(invitation.invitedFromAppId),
      now,
    });
    if (role && !role.retired && appointingGrant(inviter, role, scopeOf(invitation.scope))) {
      ok.push(invitation);
    } else {
      await invitations.updateOne(
        { _id: invitation._id, status: 'pending' },
        { $set: { status: 'revoked', endedAt: now } },
        { session },
      );
    }
  }
  return ok;
}

/** Gives the account the roles of these invitations and marks them accepted. */
export async function acceptInvitations(
  mongo: Mongo,
  session: ClientSession,
  { userId, accepted, now }: { userId: ObjectId; accepted: readonly InvitationRecord[]; now: Date },
): Promise<void> {
  for (const invitation of accepted) {
    const scope =
      invitation.scope.type === 'self'
        ? { type: 'self' as const, ids: [userId.toHexString()] }
        : scopeOf(invitation.scope);
    await writeGrant(mongo, session, {
      userId,
      roleId: invitation.roleId,
      appId: invitation.appId,
      scope,
      via: 'invitation',
      grantedBy: invitation.invitedBy,
      validFrom: invitation.validFrom,
      validTo: invitation.validTo,
      now,
    });
    await invitationsOf(mongo).updateOne(
      { _id: invitation._id, status: 'pending' },
      { $set: { status: 'accepted', endedAt: now, endedBy: userId } },
      { session },
    );
  }
}
