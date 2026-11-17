import { describe, expect, it } from 'vitest';

import { type Access, allows, holdsRole, NO_ACCESS, roleKeysOf, visibleTo } from '../src';

const STATE_ADMIN: Access = {
  roles: [
    { role: 'admin.state_admin', name: 'State Admin', scope: { type: 'state', ids: ['MH'] } },
    { role: 'admin.state_admin', name: 'State Admin', scope: { type: 'state', ids: ['GJ'] } },
    { role: 'admin.fraud_risk', name: 'Fraud & Risk Analyst', scope: { type: 'global', ids: [] } },
  ],
  permissions: ['iam.app.sign_in', 'iam.grant.manage', 'iam.grant.read'],
};

describe('allows', () => {
  it('takes one key the access holds, and refuses one it does not', () => {
    expect(allows(STATE_ADMIN, 'iam.grant.read')).toBe(true);
    expect(allows(STATE_ADMIN, 'iam.role.manage')).toBe(false);
  });

  it('needs every key of a list, or any one of them with match any', () => {
    expect(allows(STATE_ADMIN, ['iam.grant.read', 'iam.grant.manage'])).toBe(true);
    expect(allows(STATE_ADMIN, ['iam.grant.read', 'iam.role.manage'])).toBe(false);
    expect(allows(STATE_ADMIN, ['iam.grant.read', 'iam.role.manage'], { match: 'any' })).toBe(true);
    expect(allows(STATE_ADMIN, ['iam.role.manage', 'iam.totp.reset'], { match: 'any' })).toBe(
      false,
    );
  });

  it('needs nothing for an empty list, and allows nothing without access', () => {
    expect(allows(NO_ACCESS, [])).toBe(true);
    expect(allows(NO_ACCESS, [], { match: 'any' })).toBe(true);
    expect(allows(NO_ACCESS, 'iam.app.sign_in')).toBe(false);
    expect(allows(NO_ACCESS, ['iam.app.sign_in'], { match: 'any' })).toBe(false);
  });

  it('matches whole keys only, never a prefix', () => {
    expect(allows(STATE_ADMIN, 'iam.grant')).toBe(false);
    expect(allows(STATE_ADMIN, 'iam.grant.read.all')).toBe(false);
  });
});

describe('roles', () => {
  it('knows the roles held, each once', () => {
    expect(holdsRole(STATE_ADMIN, 'admin.state_admin')).toBe(true);
    expect(holdsRole(STATE_ADMIN, 'admin.catalog_qc')).toBe(false);
    expect(roleKeysOf(STATE_ADMIN)).toEqual(['admin.state_admin', 'admin.fraud_risk']);
    expect(roleKeysOf(NO_ACCESS)).toEqual([]);
  });
});

describe('visibleTo', () => {
  const items = [
    { label: 'Home', to: '/' },
    { label: 'Staff', to: '/staff', permission: 'iam.grant.read' },
    { label: 'Roles', to: '/staff/roles', permission: 'iam.role.manage' },
    {
      label: 'Security',
      to: '/security',
      permission: ['iam.totp.reset', 'iam.grant.manage'],
      match: 'any' as const,
    },
    { label: 'Both', to: '/both', permission: ['iam.totp.reset', 'iam.grant.manage'] },
  ];

  it('keeps the items the access may see, in their order, as they were', () => {
    expect(visibleTo(STATE_ADMIN, items).map((item) => item.label)).toEqual([
      'Home',
      'Staff',
      'Security',
    ]);
    expect(visibleTo(STATE_ADMIN, items)[1]).toBe(items[1]);
  });

  it('keeps only the open items without access', () => {
    expect(visibleTo(NO_ACCESS, items).map((item) => item.label)).toEqual(['Home']);
  });
});
