import {
  array,
  boolean,
  emailZod,
  enum as zodEnum,
  isoDateTimeZod,
  number,
  object,
  otpZod,
  string,
  uuidv7Zod,
  xor,
} from '@beautinique/shared-zod';

import { defineEvent } from '../events';
import { cursorPage, cursorQuery } from '../http';
import { definePermission } from '../permissions';
import { type AppId, APPS, SCOPE_TYPES } from '../platform';
import { defineRoute } from '../routes';
import { otpChallengeZod, otpConsentZod, recoveryCodeZod } from './identity';

/**
 * Identity's permission keys (ARCHITECTURE §7.3). Every role holds `iam.app.sign_in`: a grant
 * lets its person sign in to the role's app, and nowhere else (ARCHITECTURE §7.1).
 */
export const appSignIn = definePermission({
  key: 'iam.app.sign_in',
  description: "Sign in to the role's app",
  scopeTypes: SCOPE_TYPES,
  risk: 'low',
  mfa: false,
  secondSignature: false,
});

/** See who holds which role where: an appointer's own people, a Security Officer's access review. */
export const grantRead = definePermission({
  key: 'iam.grant.read',
  description: 'See the roles people hold',
  scopeTypes: SCOPE_TYPES.filter((type) => type !== 'self'),
  risk: 'medium',
  mfa: false,
  secondSignature: false,
});

/** Give and end roles, and invite people to them, within the giver's own scope. */
export const grantManage = definePermission({
  key: 'iam.grant.manage',
  description: 'Give roles, invite people to them and end them',
  scopeTypes: SCOPE_TYPES.filter((type) => type !== 'self'),
  risk: 'high',
  mfa: true,
  secondSignature: false,
});

/** Make and change sub-roles without a deploy (Master or an app head). */
export const roleManage = definePermission({
  key: 'iam.role.manage',
  description: 'Make and change sub-roles',
  scopeTypes: ['global'],
  risk: 'high',
  mfa: true,
  secondSignature: false,
});

/** End anyone's session (Security Officer, ARCHITECTURE §7.2). */
export const sessionRevoke = definePermission({
  key: 'iam.session.revoke',
  description: "End anyone's sessions",
  scopeTypes: ['global'],
  risk: 'high',
  mfa: true,
  secondSignature: false,
});

/** Take away a lost authenticator, so its person sets up a new one (ARCHITECTURE §7.1). */
export const totpReset = definePermission({
  key: 'iam.totp.reset',
  description: "Reset someone's authenticator",
  scopeTypes: ['global'],
  risk: 'high',
  mfa: true,
  secondSignature: false,
});

export const IAM_PERMISSIONS = [
  appSignIn,
  grantRead,
  grantManage,
  roleManage,
  sessionRevoke,
  totpReset,
] as const;

/**
 * The account's authz version in Redis (ARCHITECTURE §7.2): identity raises it when a grant
 * changes, and the gateway sends back an access token with an older `av` (401), so the app
 * refreshes and the new token carries the grants of now. Lives as long as an access token.
 */
export const authzVersionKey = (userId: string): string => `bq:id:authz-version:${userId}`;

// ---- Roles, grants and invitations (TASKS T3.3 PR B, ARCHITECTURE §7.3) ----

/** `<app>.<name>`: a shipped role, or `<app>.c_<name>` for one Master made. */
export const roleKeyZod = string()
  .max(80)
  .regex(/^[a-z]+\.[a-z][a-z0-9_]*$/, 'Not a role key');

/** The name part of a role Master makes: its key becomes `<app>.c_<slug>`. */
export const roleSlugZod = string()
  .trim()
  .regex(/^[a-z][a-z0-9_]{1,38}$/, 'Use 2 to 39 lower-case letters, digits or _');

/** Where a grant holds: a scope type and its ids (`global` has none). */
export const scopeZod = object({
  type: zodEnum(SCOPE_TYPES),
  ids: array(string().trim().min(1).max(64)).max(50),
});

const validityZod = {
  /** When it starts (ISO); left out = now */
  validFrom: isoDateTimeZod.nullable().optional(),
  /** When it ends, not included (ISO); left out = no end */
  validTo: isoDateTimeZod.nullable().optional(),
};

/** A role as data (identity_roles). `system`: shipped in code; Master edits only the others. */
export const roleViewZod = object({
  key: roleKeyZod,
  app: zodEnum(APPS),
  name: string(),
  main: boolean(),
  scopeTypes: array(zodEnum(SCOPE_TYPES)),
  permissions: array(string()),
  appointedBy: array(roleKeyZod),
  mfaRequired: boolean(),
  signUp: boolean(),
  maxHolders: number().int().nullable(),
  system: boolean(),
  retired: boolean(),
});

/** How a grant came: sign-up, a migration, the first-Master command, an appointer, an invitation. */
export const GRANT_VIA = ['sign-up', 'migration', 'bootstrap', 'appointed', 'invitation'] as const;

export const grantViewZod = object({
  grantId: uuidv7Zod,
  userId: uuidv7Zod,
  email: emailZod,
  role: roleKeyZod,
  app: zodEnum(APPS),
  scope: scopeZod,
  validFrom: isoDateTimeZod.nullable(),
  validTo: isoDateTimeZod.nullable(),
  grantedBy: uuidv7Zod.nullable(),
  via: zodEnum(GRANT_VIA),
  active: boolean(),
  createdAt: isoDateTimeZod,
  endedAt: isoDateTimeZod.nullable(),
});

export const INVITATION_STATUSES = ['pending', 'accepted', 'revoked', 'expired'] as const;

export const invitationViewZod = object({
  invitationId: uuidv7Zod,
  email: emailZod,
  role: roleKeyZod,
  app: zodEnum(APPS),
  scope: scopeZod,
  validFrom: isoDateTimeZod.nullable(),
  validTo: isoDateTimeZod.nullable(),
  invitedBy: uuidv7Zod,
  status: zodEnum(INVITATION_STATUSES),
  expiresAt: isoDateTimeZod,
  createdAt: isoDateTimeZod,
});

/** How long an invitation can be accepted. */
export const INVITATION_DAYS = 7;

/** Roles anyone who sees grants can pick from: every role, or one app's. */
export const listRoles = defineRoute({
  id: 'iam.roles.list',
  method: 'GET',
  path: '/iam/roles',
  summary: 'The roles, shipped and made by Master',
  apps: APPS,
  access: { type: 'permission', permission: grantRead.key },
  rateLimit: 'read',
  idempotency: false,
  stepUp: grantRead.mfa,
  owner: 'identity',
  input: { query: object({ app: zodEnum(APPS).optional() }) },
  output: object({ roles: array(roleViewZod) }),
});

/** A sub-role without a deploy (ARCHITECTURE §7.3): its key is `<app>.c_<slug>`. */
export const createRole = defineRoute({
  id: 'iam.roles.create',
  method: 'POST',
  path: '/iam/roles',
  summary: 'Make a sub-role',
  apps: APPS,
  access: { type: 'permission', permission: roleManage.key },
  rateLimit: 'write',
  idempotency: false,
  stepUp: roleManage.mfa,
  owner: 'identity',
  input: {
    body: object({
      app: zodEnum(APPS),
      slug: roleSlugZod,
      name: string().trim().min(2).max(80),
      scopeTypes: array(zodEnum(SCOPE_TYPES)).min(1),
      permissions: array(string().max(120)).max(200),
      appointedBy: array(roleKeyZod).min(1).max(20),
      mfaRequired: boolean(),
    }),
  },
  output: object({ role: roleViewZod }),
});

/** Changes a sub-role Master made (shipped roles change only in code); its holders' tokens renew. */
export const updateRole = defineRoute({
  id: 'iam.roles.update',
  method: 'PATCH',
  path: '/iam/roles/:roleKey',
  summary: 'Change a sub-role Master made',
  apps: APPS,
  access: { type: 'permission', permission: roleManage.key },
  rateLimit: 'write',
  idempotency: false,
  stepUp: roleManage.mfa,
  owner: 'identity',
  input: {
    params: object({ roleKey: roleKeyZod }),
    body: object({
      name: string().trim().min(2).max(80).optional(),
      scopeTypes: array(zodEnum(SCOPE_TYPES)).min(1).optional(),
      permissions: array(string().max(120)).max(200).optional(),
      appointedBy: array(roleKeyZod).min(1).max(20).optional(),
      mfaRequired: boolean().optional(),
      retired: boolean().optional(),
    }),
  },
  output: object({ role: roleViewZod }),
});

/**
 * The grants the caller may see: the roles they can give, in their scope; a reviewer (Security
 * Officer, Internal Auditor: grants without the right to give) sees every role in their scope.
 */
export const listGrants = defineRoute({
  id: 'iam.grants.list',
  method: 'GET',
  path: '/iam/grants',
  summary: 'The grants the caller may see',
  apps: APPS,
  access: { type: 'permission', permission: grantRead.key },
  rateLimit: 'read',
  idempotency: false,
  stepUp: grantRead.mfa,
  owner: 'identity',
  input: {
    query: cursorQuery.extend({
      userId: uuidv7Zod.optional(),
      /** The account with this email (a Security Officer finds a person by it) */
      email: emailZod.optional(),
      role: roleKeyZod.optional(),
      app: zodEnum(APPS).optional(),
      status: zodEnum(['active', 'ended']).default('active'),
    }),
  },
  output: cursorPage(grantViewZod),
});

/**
 * Gives a role to an account that exists (e.g. an approved applicant): the caller's role must be
 * one that gives it, in a scope inside the caller's own, never to themselves (ARCHITECTURE §7.3).
 */
export const giveGrant = defineRoute({
  id: 'iam.grants.give',
  method: 'POST',
  path: '/iam/grants',
  summary: 'Give a role',
  apps: APPS,
  access: { type: 'permission', permission: grantManage.key },
  rateLimit: 'write',
  idempotency: false,
  stepUp: grantManage.mfa,
  owner: 'identity',
  input: {
    body: object({ userId: uuidv7Zod, role: roleKeyZod, scope: scopeZod, ...validityZod }),
  },
  output: object({ grant: grantViewZod }),
});

/** Ends a grant the caller could give; the person's tokens stop at once (ARCHITECTURE §7.2). */
export const endGrant = defineRoute({
  id: 'iam.grants.end',
  method: 'POST',
  path: '/iam/grants/:grantId/end',
  summary: 'End a role',
  apps: APPS,
  access: { type: 'permission', permission: grantManage.key },
  rateLimit: 'write',
  idempotency: false,
  stepUp: grantManage.mfa,
  owner: 'identity',
  input: { params: object({ grantId: uuidv7Zod }) },
  output: object({ grant: grantViewZod }),
});

/**
 * Invites an email to a role (an account or not yet): it is emailed, and accepted in the role's
 * app with an email code (POST /auth/invitations/code), which is when the grant is given. Works
 * INVITATION_DAYS days.
 */
export const createInvitation = defineRoute({
  id: 'iam.invitations.create',
  method: 'POST',
  path: '/iam/invitations',
  summary: 'Invite someone to a role',
  apps: APPS,
  access: { type: 'permission', permission: grantManage.key },
  rateLimit: 'write',
  idempotency: false,
  stepUp: grantManage.mfa,
  owner: 'identity',
  input: {
    body: object({ email: emailZod, role: roleKeyZod, scope: scopeZod, ...validityZod }),
  },
  output: object({ invitation: invitationViewZod }),
});

/** The invitations the caller may see (like grants), the newest first. */
export const listInvitations = defineRoute({
  id: 'iam.invitations.list',
  method: 'GET',
  path: '/iam/invitations',
  summary: 'The invitations the caller may see',
  apps: APPS,
  access: { type: 'permission', permission: grantRead.key },
  rateLimit: 'read',
  idempotency: false,
  stepUp: grantRead.mfa,
  owner: 'identity',
  input: { query: cursorQuery.extend({ status: zodEnum(INVITATION_STATUSES).optional() }) },
  output: cursorPage(invitationViewZod),
});

/** Takes back an invitation not accepted yet. */
export const revokeInvitation = defineRoute({
  id: 'iam.invitations.revoke',
  method: 'POST',
  path: '/iam/invitations/:invitationId/revoke',
  summary: 'Take back an invitation',
  apps: APPS,
  access: { type: 'permission', permission: grantManage.key },
  rateLimit: 'write',
  idempotency: false,
  stepUp: grantManage.mfa,
  owner: 'identity',
  input: { params: object({ invitationId: uuidv7Zod }) },
  output: object({ invitation: invitationViewZod }),
});

/**
 * Accepting an invitation, step 1: an email code to the invited email, for the invitations waiting
 * in this app (step 2 is POST /auth/otp/:challengeId/verify with the code and a password; an
 * account that has a password keeps it). The same answer for every email, in the same time; an
 * email without an invitation here gets nothing. Sign-up apps ask their consent, like sign-up.
 */
export const requestInvitationCode = defineRoute({
  id: 'auth.invitations.code',
  method: 'POST',
  path: '/auth/invitations/code',
  summary: 'Email a code to accept an invitation (the same answer for every email)',
  apps: APPS,
  access: { type: 'public' },
  rateLimit: 'otp',
  idempotency: false,
  stepUp: false,
  owner: 'identity',
  input: { body: object({ email: emailZod, consent: otpConsentZod.optional() }) },
  output: otpChallengeZod,
});

/** An invitation was made; notify emails the person how to accept it (no secret in it). */
export const invitationCreated = defineEvent({
  type: 'identity.invitation.created',
  version: 1,
  producer: 'identity',
  description: 'Someone was invited to a role; notify tells them how to accept it',
  data: object({
    invitationId: uuidv7Zod,
    email: emailZod,
    app: zodEnum(APPS),
    roleName: string().min(1).max(80),
    expiresAt: isoDateTimeZod,
  }),
});

// ---- The gateway's permission check and step-up (TASKS T3.3 PR C, ARCHITECTURE §7.2, §7.3) ----

/**
 * What an account may do in an app, in Redis (identity writes it at every sign-in and refresh):
 * the permission keys of its grants there and the authz version they belong to. The gateway's
 * coarse check: a permission route passes only when the key is in it (the scope is the
 * service's check, T4.1). Lives a little longer than an access token.
 */
export const appPermissionsKey = (userId: string, app: AppId): string =>
  `bq:id:perms:${userId}:${app}`;

/** The value at appPermissionsKey (JSON). */
export interface AppPermissions {
  /** The authz version these keys belong to: an access token with another `av` refreshes */
  v: number;
  keys: string[];
}

/** A step-up counts this long (ARCHITECTURE §7.1: 5 minutes). */
export const STEP_UP_SECONDS = 300;

/**
 * Step-up: the authenticator code again, or (a lost phone) one of the recovery codes, which is
 * then used up, so a high-risk route works for the next STEP_UP_SECONDS (the access token carries
 * when, `su`). Counts toward the account's lock like a sign-in. An account without an
 * authenticator answers AUTHENTICATOR_REQUIRED.
 */
export const stepUp = defineRoute({
  id: 'auth.stepUp.verify',
  method: 'POST',
  path: '/auth/step-up',
  summary: 'Confirm with the authenticator for a high-risk action',
  apps: APPS,
  access: { type: 'signed-in' },
  rateLimit: 'auth',
  idempotency: false,
  stepUp: false,
  owner: 'identity',
  input: {
    body: xor([object({ code: otpZod }), object({ recoveryCode: recoveryCodeZod })]),
  },
  output: object({
    stepUpUntil: isoDateTimeZod,
    /** After a recovery code: how many are left; null after an authenticator code */
    recoveryCodesLeft: number().int().min(0).nullable(),
  }),
});

const userParams = object({ userId: uuidv7Zod });

/**
 * A Security Officer takes away a lost authenticator (ARCHITECTURE §7.1): the authenticator and
 * its recovery codes go, every session of the account ends, and the person is emailed. Their
 * next sign-in sets up a new one where it is required. Never one's own.
 */
export const resetAuthenticator = defineRoute({
  id: 'iam.users.resetAuthenticator',
  method: 'POST',
  path: '/iam/users/:userId/authenticator/reset',
  summary: 'Reset someone’s authenticator',
  apps: APPS,
  access: { type: 'permission', permission: totpReset.key },
  rateLimit: 'write',
  idempotency: false,
  stepUp: totpReset.mfa,
  owner: 'identity',
  input: { params: userParams },
  output: object({ reset: boolean(), sessionsEnded: number().int().min(0) }),
});

/** A Security Officer ends every session of an account (ARCHITECTURE §7.2). Never one's own. */
export const endUserSessions = defineRoute({
  id: 'iam.users.endSessions',
  method: 'POST',
  path: '/iam/users/:userId/sessions/end',
  summary: 'End every session of someone',
  apps: APPS,
  access: { type: 'permission', permission: sessionRevoke.key },
  rateLimit: 'write',
  idempotency: false,
  stepUp: sessionRevoke.mfa,
  owner: 'identity',
  input: { params: userParams },
  output: object({ ended: number().int().min(0) }),
});

/** An authenticator was reset; notify tells the person (a security email, no secret in it). */
export const authenticatorReset = defineEvent({
  type: 'identity.authenticator.reset',
  version: 1,
  producer: 'identity',
  description: 'A Security Officer reset an account’s authenticator; the person is told',
  data: object({ userId: uuidv7Zod, email: emailZod, resetAt: isoDateTimeZod }),
});
