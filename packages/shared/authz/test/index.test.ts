import { definePermission, permissionCatalogue } from '@beautinique/shared-contracts';
import { describe, expect, it } from 'vitest';

import * as api from '../src/index';
import {
  can,
  decide,
  type Grant,
  isGrantActive,
  isStepUpFresh,
  reachesAnything,
  scopeCovers,
  scopeSpec,
} from '../src/index';

const permissions = permissionCatalogue([
  definePermission({
    key: 'orders.order.view',
    description: 'See orders',
    scopeTypes: ['global', 'state', 'district', 'city', 'hub', 'sellerOrg', 'self'],
    risk: 'low',
    mfa: false,
    secondSignature: false,
  }),
  definePermission({
    key: 'network.area.go_live.request',
    description: 'Ask to open an area',
    scopeTypes: ['state', 'district'],
    risk: 'high',
    mfa: true,
    secondSignature: true,
  }),
]);
const now = new Date('2026-10-20T08:00:00Z');
const options = { permissions, now };

const grant = (scope: Grant['scope'], extra: Partial<Grant> = {}): Grant => ({
  role: 'Test Role',
  permissions: ['orders.order.view'],
  scope,
  ...extra,
});

/** An order in hub H1 of Pune city, Pune district, Maharashtra, for seller org O1, bought by user U1. */
const order = {
  state: 'MH',
  district: 'PUNE',
  city: 'PUNE-CITY',
  hub: 'H1',
  sellerOrg: 'O1',
  self: 'U1',
};

describe('public API', () => {
  it('exports exactly these', () => {
    expect(Object.keys(api).sort()).toEqual(
      [
        'can',
        'decide',
        'isGrantActive',
        'isStepUpFresh',
        'reachesAnything',
        'scopeCovers',
        'scopeSpec',
      ].sort(),
    );
  });
});

describe('scope containment', () => {
  it('global covers everything; a location scope covers what sits inside it', () => {
    expect(scopeCovers({ type: 'global', ids: [] }, order)).toBe(true);
    expect(scopeCovers({ type: 'state', ids: ['MH'] }, order)).toBe(true);
    expect(scopeCovers({ type: 'district', ids: ['PUNE'] }, order)).toBe(true);
    expect(scopeCovers({ type: 'city', ids: ['PUNE-CITY'] }, order)).toBe(true);
    expect(scopeCovers({ type: 'hub', ids: ['H2', 'H1'] }, order)).toBe(true);
    expect(scopeCovers({ type: 'state', ids: ['KA'] }, order)).toBe(false);
    expect(scopeCovers({ type: 'hub', ids: ['H2'] }, order)).toBe(false);
  });

  it('a narrower scope never covers a wider resource', () => {
    const districtSetting = { state: 'MH', district: 'PUNE' };
    expect(scopeCovers({ type: 'district', ids: ['PUNE'] }, districtSetting)).toBe(true);
    expect(scopeCovers({ type: 'city', ids: ['PUNE-CITY'] }, districtSetting)).toBe(false);
    expect(scopeCovers({ type: 'hub', ids: ['H1'] }, districtSetting)).toBe(false);
  });

  it('non-location scopes only match their own ids', () => {
    expect(scopeCovers({ type: 'sellerOrg', ids: ['O1'] }, order)).toBe(true);
    expect(scopeCovers({ type: 'sellerOrg', ids: ['O2'] }, order)).toBe(false);
    expect(scopeCovers({ type: 'self', ids: ['U1'] }, order)).toBe(true);
    expect(scopeCovers({ type: 'brand', ids: ['B1'] }, order)).toBe(false);
    expect(scopeCovers({ type: 'warehouse', ids: [] }, { warehouse: 'W1' })).toBe(false);
  });

  it('without a resource any scope counts; an unknown type or a broken location chain throws', () => {
    expect(scopeCovers({ type: 'hub', ids: ['H1'] })).toBe(true);
    expect(() => scopeCovers({ type: 'planet' as 'state', ids: [] }, order)).toThrow(
      'Unknown scope type',
    );
    expect(() => scopeCovers({ type: 'state', ids: ['MH'] }, { hub: 'H1' })).toThrow(
      'has hub but no state',
    );
    expect(() => scopeCovers({ type: 'state', ids: ['MH'] }, { state: 'MH', city: 'C1' })).toThrow(
      'has city but no district',
    );
  });
});

describe('validity windows', () => {
  it('a grant counts from validFrom up to (not including) validTo', () => {
    expect(isGrantActive(grant({ type: 'global', ids: [] }), now)).toBe(true);
    expect(
      isGrantActive(grant({ type: 'global', ids: [] }, { validFrom: '2026-10-20T08:00:00Z' }), now),
    ).toBe(true);
    expect(
      isGrantActive(grant({ type: 'global', ids: [] }, { validFrom: '2026-10-20T08:00:01Z' }), now),
    ).toBe(false);
    expect(
      isGrantActive(grant({ type: 'global', ids: [] }, { validTo: '2026-10-20T08:00:00Z' }), now),
    ).toBe(false);
    expect(
      isGrantActive(grant({ type: 'global', ids: [] }, { validTo: '2026-10-20T08:00:01Z' }), now),
    ).toBe(true);
    expect(
      isGrantActive(grant({ type: 'global', ids: [] }, { validFrom: null, validTo: null }), now),
    ).toBe(true);
    expect(() =>
      isGrantActive(grant({ type: 'global', ids: [] }, { validTo: 'soon' }), now),
    ).toThrow('invalid validity date');
  });
});

describe('decisions', () => {
  it('allows with the grant that matched, and denies by default with a reason', () => {
    const hubGrant = grant({ type: 'hub', ids: ['H1'] });
    expect(decide([hubGrant], 'orders.order.view', order, options)).toEqual({
      allowed: true,
      reason: 'allowed',
      grant: hubGrant,
    });
    expect(decide([], 'orders.order.view', order, options)).toEqual({
      allowed: false,
      reason: 'no-grant',
    });
    expect(
      decide(
        [grant({ type: 'hub', ids: ['H1'] }, { permissions: ['orders.order.refund'] })],
        'orders.order.view',
        order,
        options,
      ).reason,
    ).toBe('no-grant');
    expect(
      decide(
        [grant({ type: 'hub', ids: ['H1'] }, { validTo: '2026-01-01T00:00:00Z' })],
        'orders.order.view',
        order,
        options,
      ).reason,
    ).toBe('not-active');
    expect(
      decide([grant({ type: 'hub', ids: ['H9'] })], 'orders.order.view', order, options).reason,
    ).toBe('out-of-scope');
  });

  it('a grant whose scope type the permission does not allow never counts, even global', () => {
    const globalGrant: Grant = {
      role: 'Master',
      permissions: ['network.area.go_live.request'],
      scope: { type: 'global', ids: [] },
    };
    expect(
      decide([globalGrant], 'network.area.go_live.request', { state: 'MH' }, options).reason,
    ).toBe('scope-type-not-allowed');
    const stateGrant: Grant = { ...globalGrant, scope: { type: 'state', ids: ['MH'] } };
    expect(
      can([globalGrant, stateGrant], 'network.area.go_live.request', { state: 'MH' }, options),
    ).toBe(true);
  });

  it('has no wildcards: holding other permissions or "*" grants nothing', () => {
    const wildcard = grant(
      { type: 'global', ids: [] },
      { permissions: ['*', 'orders.*', 'orders.order'] },
    );
    expect(can([wildcard], 'orders.order.view', order, options)).toBe(false);
  });

  it('without a resource (menus, buttons) any active grant of an allowed type counts', () => {
    expect(
      can([grant({ type: 'hub', ids: ['H9'] })], 'orders.order.view', undefined, options),
    ).toBe(true);
    expect(
      can(
        [grant({ type: 'hub', ids: ['H9'] }, { validFrom: '2027-01-01T00:00:00Z' })],
        'orders.order.view',
        undefined,
        options,
      ),
    ).toBe(false);
  });

  it('an undeclared permission is a programming error', () => {
    expect(() => can([], 'orders.order.delete', order, options)).toThrow(
      'Unknown permission "orders.order.delete"',
    );
  });

  it('uses the current time by default', () => {
    const later = grant({ type: 'global', ids: [] }, { validFrom: '2999-01-01T00:00:00Z' });
    expect(can([later], 'orders.order.view', order, { permissions })).toBe(false);
  });
});

describe('scope specs (for query filters)', () => {
  it('merges ids per scope type across active grants of allowed types', () => {
    const spec = scopeSpec(
      [
        grant({ type: 'hub', ids: ['H2', 'H1'] }),
        grant({ type: 'hub', ids: ['H1', 'H3'] }),
        grant({ type: 'district', ids: ['PUNE'] }),
        grant({ type: 'state', ids: ['KA'] }, { validTo: '2026-01-01T00:00:00Z' }),
        grant({ type: 'brand', ids: ['B1'] }),
        grant({ type: 'state', ids: ['GJ'] }, { permissions: ['orders.order.refund'] }),
      ],
      'orders.order.view',
      options,
    );
    expect(spec).toEqual({ global: false, ids: { hub: ['H1', 'H2', 'H3'], district: ['PUNE'] } });
    expect(reachesAnything(spec)).toBe(true);
  });

  it('global wins, and nothing held reaches nothing', () => {
    expect(
      scopeSpec(
        [grant({ type: 'hub', ids: ['H1'] }), grant({ type: 'global', ids: [] })],
        'orders.order.view',
        options,
      ),
    ).toEqual({ global: true, ids: {} });
    const none = scopeSpec([], 'orders.order.view', options);
    expect(none).toEqual({ global: false, ids: {} });
    expect(reachesAnything(none)).toBe(false);
    expect(reachesAnything({ global: false, ids: { hub: [] } })).toBe(false);
    expect(() => scopeSpec([], 'nope.nope.nope', options)).toThrow('Unknown permission');
  });
});

describe('step-up', () => {
  it('is fresh for 5 minutes by default', () => {
    expect(isStepUpFresh('2026-10-20T07:55:00Z', now)).toBe(true);
    expect(isStepUpFresh('2026-10-20T07:54:59Z', now)).toBe(false);
    expect(isStepUpFresh('2026-10-20T08:00:01Z', now)).toBe(false); // in the future: not trusted
    expect(isStepUpFresh('2026-10-20T07:59:00Z', now, 30_000)).toBe(false);
    expect(isStepUpFresh(null, now)).toBe(false);
    expect(isStepUpFresh('yesterday', now)).toBe(false);
  });
});
