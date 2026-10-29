import { definePermission } from '../permissions';
import { SCOPE_TYPES } from '../platform';

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
