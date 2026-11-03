import { describe, expect, it } from 'vitest';

import {
  APPS,
  appSignIn,
  authzVersionKey,
  events,
  giveGrant,
  IAM_PERMISSIONS,
  INDIAN_STATES,
  invitationCreated,
  isStateId,
  listGrants,
  permissions,
  requestInvitationCode,
  revokedUserKey,
  roleKeyZod,
  roleSlugZod,
  routes,
  SCOPE_TYPES,
} from '../src';

describe('INDIAN_STATES', () => {
  it('has the 28 states and 8 union territories, once each', () => {
    expect(INDIAN_STATES.filter((state) => state.kind === 'state')).toHaveLength(28);
    expect(INDIAN_STATES.filter((state) => state.kind === 'union-territory')).toHaveLength(8);
    expect(new Set(INDIAN_STATES.map((state) => state.id)).size).toBe(36);
    expect(new Set(INDIAN_STATES.map((state) => state.name)).size).toBe(36);
    expect(new Set(INDIAN_STATES.map((state) => state.gstCode)).size).toBe(36);
  });

  it('uses two capital letters as ids and two-digit GST codes', () => {
    for (const state of INDIAN_STATES) {
      expect(state.id).toMatch(/^[A-Z]{2}$/);
      expect(state.gstCode).toMatch(/^(0[1-9]|[1-3][0-9])$/);
    }
  });

  it('knows a few by their GST code', () => {
    const byCode = new Map(INDIAN_STATES.map((state) => [state.gstCode, state.id]));
    expect(byCode.get('27')).toBe('MH');
    expect(byCode.get('07')).toBe('DL');
    expect(byCode.get('29')).toBe('KA');
    expect(byCode.get('38')).toBe('LA');
  });

  it('isStateId takes only those ids', () => {
    expect(isStateId('MH')).toBe(true);
    expect(isStateId('DL')).toBe(true);
    expect(isStateId('mh')).toBe(false);
    expect(isStateId('XX')).toBe(false);
    expect(isStateId('')).toBe(false);
  });
});

describe('identity permissions', () => {
  it('are in the platform catalogue', () => {
    for (const permission of IAM_PERMISSIONS) {
      expect(permissions.get(permission.key)).toBe(permission);
    }
  });

  it('lets every scope type sign in, so any grant opens its app', () => {
    expect([...appSignIn.scopeTypes].sort()).toEqual([...SCOPE_TYPES].sort());
    expect(appSignIn.mfa).toBe(false);
  });

  it('asks a recent step-up for every high-risk key', () => {
    for (const permission of IAM_PERMISSIONS) {
      if (permission.risk === 'high') expect(permission.mfa).toBe(true);
    }
  });

  it('never lets a self scope give or read roles', () => {
    for (const key of ['iam.grant.read', 'iam.grant.manage']) {
      expect(permissions.get(key)?.scopeTypes).not.toContain('self');
    }
  });

  it('keeps the authz version key apart from the revoke keys', () => {
    expect(authzVersionKey('u1')).toBe('bq:id:authz-version:u1');
    expect(authzVersionKey('u1')).not.toBe(revokedUserKey('u1'));
  });
});

describe('role, grant and invitation routes', () => {
  it('ask a recent step-up exactly where their permission does', () => {
    for (const route of routes) {
      if (route.access.type !== 'permission') continue;
      const permission = permissions.get(route.access.permission);
      expect(permission, route.id).toBeDefined();
      expect(route.stepUp, route.id).toBe(permission?.mfa);
    }
    expect(giveGrant.stepUp).toBe(true);
    expect(listGrants.stepUp).toBe(false);
  });

  it('let anyone ask an invitation code, in any app, as public', () => {
    expect(requestInvitationCode.access).toEqual({ type: 'public' });
    expect(requestInvitationCode.rateLimit).toBe('otp');
    expect(requestInvitationCode.apps).toEqual(APPS);
  });

  it('take role keys and the slugs of Master’s sub-roles in one shape', () => {
    for (const key of ['admin.state_admin', 'admin.c_desk', 'customer.customer']) {
      expect(roleKeyZod.safeParse(key).success, key).toBe(true);
    }
    for (const key of ['Admin.x', 'admin', 'admin.', '.x', 'admin.9x', 'admin.x-y']) {
      expect(roleKeyZod.safeParse(key).success, key).toBe(false);
    }
    expect(roleSlugZod.parse(' night_shift ')).toBe('night_shift');
    for (const slug of ['x', '9x', 'Night', 'a'.repeat(40)]) {
      expect(roleSlugZod.safeParse(slug).success, slug).toBe(false);
    }
  });

  it('describe the invitation event with no secret in it', () => {
    expect(events.latest('identity.invitation.created')).toBe(invitationCreated);
    expect(Object.keys(invitationCreated.data.shape).sort()).toEqual([
      'app',
      'email',
      'expiresAt',
      'invitationId',
      'roleName',
    ]);
  });
});
