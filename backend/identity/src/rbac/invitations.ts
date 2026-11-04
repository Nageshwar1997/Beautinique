import type { Passport } from '@beautinique/backend-server-kit';
import {
  type ClientSession,
  type IndexSpec,
  type Mongo,
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
import { uuidv7 } from '@beautinique/shared-utils';

import { type User, USERS } from '../users.ts';
import {
  appointingGrant,
  callerGrants,
  forbidden,
  grantShapeProblems,
  requirePermission,
  visibleFilter,
} from './authority.ts';
import { type GrantRecord, GRANTS, overlapping, type Scope, writeGrant } from './grants.ts';
import {
  conflict,
  isDuplicateKey,
  type ManageDeps,
  notFound,
  rolesOf,
  validationFailed,
} from './manage.ts';

export const INVITATIONS = 'identity_invitations';
const INVITATION_MS = INVITATION_DAYS * 24 * 60 * 60_000;

/**
 * Someone invited to a role by email (TASKS T3.3): accepted in the role's app with an email code
 * (otp.ts, purpose `invite`), which is when the grant is given. A `self` scope names no ids here:
 * the account's id fills it at acceptance. Kept after it ends, for audit.
 */
export interface InvitationRecord {
  _id: string;
  email: string;
  role: string;
  /** The role's app: where it is accepted */
  app: AppId;
  scope: Scope;
  validFrom: Date | null;
  validTo: Date | null;
  invitedBy: string;
  /** The app the inviter acted from: their right to give the role is checked again there */
  invitedFrom: AppId;
  status: 'pending' | 'accepted' | 'revoked' | 'expired';
  expiresAt: Date;
  createdAt: Date;
  /** When it was accepted, revoked or found expired */
  endedAt: Date | null;
  /** Who revoked it, or the account that accepted it */
  endedBy: string | null;
}

export const indexes: readonly IndexSpec[] = [
  { collection: INVITATIONS, name: 'email_app_status', key: { email: 1, app: 1, status: 1 } },
  {
    collection: INVITATIONS,
    name: 'pending_role_scope_unique',
    key: { email: 1, role: 1, 'scope.type': 1, 'scope.ids': 1 },
    unique: true,
    partialFilterExpression: { status: 'pending' },
  },
];

const invitationsOf = (mongo: Mongo) => mongo.db.collection<InvitationRecord>(INVITATIONS);

/** What the app sees: a pending invitation past its end shows as expired. */
export function invitationView(invitation: InvitationRecord, now = new Date()) {
  const expired =
    invitation.status === 'pending' && invitation.expiresAt.getTime() <= now.getTime();
  const status: (typeof INVITATION_STATUSES)[number] = expired ? 'expired' : invitation.status;
  return {
    invitationId: invitation._id,
    email: invitation.email,
    role: invitation.role,
    app: invitation.app,
    scope: { type: invitation.scope.type, ids: [...invitation.scope.ids] },
    validFrom: invitation.validFrom?.toISOString() ?? null,
    validTo: invitation.validTo?.toISOString() ?? null,
    invitedBy: invitation.invitedBy,
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
  const caller = await callerGrants(deps.mongo, {
    userId: passport.userId,
    app: passport.app,
    now,
  });
  requirePermission(caller, grantManage.key);
  const users = deps.mongo.db.collection<User>(USERS);
  const me = await users.findOne({ _id: passport.userId }, { projection: { email: 1 } });
  if (me?.email === body.email) throw forbidden('Nobody invites themselves.');
  const role = await rolesOf(deps.mongo).findOne({ _id: body.role });
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
      body.scope.type === 'self' ? { type: 'self' as const, ids: [account._id] } : body.scope;
    if (
      await deps.mongo.db
        .collection<GrantRecord>(GRANTS)
        .findOne(overlapping(account._id, role._id, held), { projection: { _id: 1 } })
    ) {
      throw conflict('This person holds this role there already.');
    }
  }
  const invitation: InvitationRecord = {
    _id: uuidv7(),
    email: body.email,
    role: role._id,
    app: role.app,
    scope: body.scope,
    validFrom,
    validTo,
    invitedBy: passport.userId,
    invitedFrom: passport.app,
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
        { email: body.email, role: role._id, status: 'pending', expiresAt: { $lte: now } },
        { $set: { status: 'expired', endedAt: now } },
        { session },
      );
      const waiting = await invitations.findOne(
        {
          email: body.email,
          role: role._id,
          status: 'pending',
          'scope.type': body.scope.type,
          ...(body.scope.ids.length === 0
            ? { 'scope.ids': { $size: 0 } }
            : { 'scope.ids': { $in: body.scope.ids } }),
        },
        { session, projection: { _id: 1 } },
      );
      if (waiting) return false;
      await invitations.insertOne(invitation, { session });
      await writeEvent(deps.mongo, session, invitationCreated, {
        aggregate: { type: 'invitation', id: invitation._id },
        actor: { type: 'user', id: passport.userId },
        correlationId: requestId,
        data: {
          invitationId: invitation._id,
          email: invitation.email,
          app: invitation.app,
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
    { invitationId: invitation._id, role: role._id, by: passport.userId },
    'invitation made',
  );
  return { invitation: invitationView(invitation, now) };
}

/** POST /iam/invitations/:invitationId/revoke: one not accepted yet, by whoever could make it. */
export async function revokeInvitation(deps: ManageDeps, passport: Passport, invitationId: string) {
  const now = new Date();
  const caller = await callerGrants(deps.mongo, {
    userId: passport.userId,
    app: passport.app,
    now,
  });
  requirePermission(caller, grantManage.key);
  const invitations = invitationsOf(deps.mongo);
  const invitation = await invitations.findOne({ _id: invitationId });
  if (!invitation) throw notFound('Invitation');
  const role = await rolesOf(deps.mongo).findOne({ _id: invitation.role });
  if (!role || !appointingGrant(caller, role, invitation.scope)) {
    throw forbidden('You cannot take back this invitation.');
  }
  const revoked = await invitations.findOneAndUpdate(
    { _id: invitationId, status: 'pending' },
    { $set: { status: 'revoked', endedAt: now, endedBy: passport.userId } },
    { returnDocument: 'after' },
  );
  if (revoked) {
    deps.logger.info({ invitationId, by: passport.userId }, 'invitation taken back');
  }
  return { invitation: invitationView(revoked ?? invitation, now) };
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
    userId: passport.userId,
    app: passport.app,
    now,
  });
  requirePermission(caller, grantRead.key);
  const visible = visibleFilter(caller, await rolesOf(deps.mongo).find().toArray());
  if (!visible) return { items: [], nextCursor: null };
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
        query.cursor === undefined ? {} : { _id: { $lt: query.cursor } },
      ],
    })
    .sort({ _id: -1 })
    .limit(query.limit + 1)
    .toArray();
  const items = page.slice(0, query.limit);
  return {
    items: items.map((invitation) => invitationView(invitation, now)),
    nextCursor: page.length > query.limit ? (items.at(-1)?._id ?? null) : null,
  };
}

/** An invitation waits for this email in this app (the invitation code goes out only then). */
export async function hasInvitation(
  mongo: Mongo,
  { email, app, now = new Date() }: { email: string; app: AppId; now?: Date },
): Promise<boolean> {
  return (
    (await invitationsOf(mongo).countDocuments(
      { email, app, status: 'pending', expiresAt: { $gt: now } },
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
  const waiting = await invitations
    .find({ email, app, status: 'pending', expiresAt: { $gt: now } }, { session })
    .toArray();
  const ok: InvitationRecord[] = [];
  for (const invitation of waiting) {
    const role = await rolesOf(mongo).findOne({ _id: invitation.role }, { session });
    const inviter = await callerGrants(mongo, {
      userId: invitation.invitedBy,
      app: invitation.invitedFrom,
      now,
    });
    if (role && !role.retired && appointingGrant(inviter, role, invitation.scope)) {
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
  { userId, accepted, now }: { userId: string; accepted: readonly InvitationRecord[]; now: Date },
): Promise<void> {
  for (const invitation of accepted) {
    const scope =
      invitation.scope.type === 'self'
        ? { type: 'self' as const, ids: [userId] }
        : invitation.scope;
    await writeGrant(mongo, session, {
      userId,
      role: invitation.role,
      app: invitation.app,
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
