import {
  definePermission,
  permissionCatalogue,
  type ScopeType,
} from '@beautinique/shared-contracts';
import { describe, expect, it } from 'vitest';

import {
  type ChainOf,
  type Grant,
  grantProblems,
  type ResourceScope,
  scopeWithin,
} from '../src/index';

/** A tiny location master: every id here is unique, so one lookup serves every location type. */
const places: Record<string, ResourceScope> = {
  MH: { state: 'MH' },
  GJ: { state: 'GJ' },
  PUNE: { state: 'MH', district: 'PUNE' },
  NASHIK: { state: 'MH', district: 'NASHIK' },
  SURAT: { state: 'GJ', district: 'SURAT' },
  'PUNE-CITY': { state: 'MH', district: 'PUNE', city: 'PUNE-CITY' },
  H1: { state: 'MH', district: 'PUNE', city: 'PUNE-CITY', hub: 'H1' },
};
const chainOf: ChainOf = (_type, id) => places[id];

const scope = (type: ScopeType, ...ids: string[]) => ({ type, ids });

describe('a scope inside a scope (handing a grant on)', () => {
  it('global holds everything, and only global holds global', () => {
    const global = scope('global');
    for (const inner of [
      global,
      scope('state', 'MH'),
      scope('hub', 'H1'),
      scope('brand', 'B1'),
      scope('self', 'U1'),
    ]) {
      expect(scopeWithin(global, inner, chainOf)).toBe(true);
    }
    expect(scopeWithin(scope('state', 'MH'), global, chainOf)).toBe(false);
    expect(scopeWithin(scope('brand', 'B1'), global, chainOf)).toBe(false);
  });

  it('a location scope holds the places below it, through the whole chain', () => {
    const state = scope('state', 'MH');
    const district = scope('district', 'PUNE');
    const city = scope('city', 'PUNE-CITY');
    expect(scopeWithin(state, district, chainOf)).toBe(true);
    expect(scopeWithin(state, city, chainOf)).toBe(true);
    expect(scopeWithin(state, scope('hub', 'H1'), chainOf)).toBe(true);
    expect(scopeWithin(district, city, chainOf)).toBe(true);
    expect(scopeWithin(district, scope('hub', 'H1'), chainOf)).toBe(true);
    expect(scopeWithin(city, scope('hub', 'H1'), chainOf)).toBe(true);
  });

  it('never a place beside it or above it', () => {
    expect(scopeWithin(scope('state', 'MH'), scope('district', 'SURAT'), chainOf)).toBe(false);
    expect(scopeWithin(scope('district', 'PUNE'), scope('district', 'NASHIK'), chainOf)).toBe(
      false,
    );
    expect(scopeWithin(scope('district', 'PUNE'), scope('state', 'MH'), chainOf)).toBe(false);
    expect(scopeWithin(scope('hub', 'H1'), scope('city', 'PUNE-CITY'), chainOf)).toBe(false);
  });

  it('one place outside is enough to fail, and the same type compares ids', () => {
    const state = scope('state', 'MH');
    expect(scopeWithin(state, scope('district', 'PUNE', 'NASHIK'), chainOf)).toBe(true);
    expect(scopeWithin(state, scope('district', 'PUNE', 'SURAT'), chainOf)).toBe(false);
    expect(scopeWithin(scope('state', 'MH', 'GJ'), scope('state', 'GJ'), chainOf)).toBe(true);
    expect(scopeWithin(scope('state', 'MH'), scope('state', 'MH', 'GJ'), chainOf)).toBe(false);
  });

  it('other scope types hold only their own ids', () => {
    expect(scopeWithin(scope('brand', 'B1', 'B2'), scope('brand', 'B2'), chainOf)).toBe(true);
    expect(scopeWithin(scope('brand', 'B1'), scope('brand', 'B1', 'B3'), chainOf)).toBe(false);
    expect(scopeWithin(scope('brand', 'B1'), scope('category', 'B1'), chainOf)).toBe(false);
    expect(scopeWithin(scope('state', 'MH'), scope('brand', 'B1'), chainOf)).toBe(false);
    expect(scopeWithin(scope('self', 'U1'), scope('self', 'U1'), chainOf)).toBe(true);
  });

  it('asks the lookup only about location ids', () => {
    const asked: string[] = [];
    const spy: ChainOf = (type, id) => {
      asked.push(`${type}:${id}`);
      return places[id];
    };
    scopeWithin(scope('brand', 'B1'), scope('brand', 'B1'), spy);
    expect(asked).toEqual([]);
    scopeWithin(scope('state', 'MH'), scope('district', 'PUNE'), spy);
    expect(asked).toEqual(['district:PUNE']);
  });

  it('an id the lookup does not know, or a scope that names nothing, is never inside', () => {
    expect(scopeWithin(scope('state', 'MH'), scope('district', 'MOON'), chainOf)).toBe(false);
    expect(scopeWithin(scope('state', 'MH'), scope('district'), chainOf)).toBe(false);
    expect(scopeWithin(scope('global'), scope('district'), chainOf)).toBe(false);
    expect(scopeWithin(scope('brand', 'B1'), scope('brand'), chainOf)).toBe(false);
  });

  it('the id being checked wins over what the lookup says about it', () => {
    const liar: ChainOf = () => ({
      state: 'MH',
      district: 'PUNE',
      city: 'PUNE-CITY',
      hub: 'OTHER',
    });
    expect(scopeWithin(scope('hub', 'H1'), scope('hub', 'H1'), liar)).toBe(true);
    expect(scopeWithin(scope('hub', 'OTHER'), scope('hub', 'H1'), liar)).toBe(false);
  });

  it('a lookup that gives a broken chain, or an unknown scope type, is a programming error', () => {
    expect(() => scopeWithin(scope('state', 'MH'), scope('district', 'PUNE'), () => ({}))).toThrow(
      'pass the whole location chain',
    );
    const odd = { type: 'galaxy', ids: ['X'] } as unknown as ReturnType<typeof scope>;
    expect(() => scopeWithin(odd, scope('state', 'MH'), chainOf)).toThrow(
      'Unknown scope type "galaxy"',
    );
    expect(() => scopeWithin(scope('state', 'MH'), odd, chainOf)).toThrow(
      'Unknown scope type "galaxy"',
    );
    expect(() => scopeWithin(scope('global'), odd, chainOf)).toThrow('Unknown scope type "galaxy"');
    expect(() => scopeWithin(odd, scope('global'), chainOf)).toThrow('Unknown scope type "galaxy"');
  });
});

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

const grant = (extra: Partial<Grant> = {}): Grant => ({
  role: 'Test Role',
  permissions: ['orders.order.view'],
  scope: scope('state', 'MH'),
  ...extra,
});
const problems = (extra: Partial<Grant> = {}) => grantProblems(grant(extra), { permissions });

describe('grant problems', () => {
  it('a good grant has none, with or without dates', () => {
    expect(problems()).toEqual([]);
    expect(problems({ scope: scope('global') })).toEqual([]);
    expect(problems({ validFrom: null, validTo: null })).toEqual([]);
    expect(problems({ validFrom: '2026-10-20T00:00:00Z' })).toEqual([]);
    expect(
      problems({ validFrom: '2026-10-20T00:00:00Z', validTo: '2026-10-21T00:00:00Z' }),
    ).toEqual([]);
  });

  it('needs a role with permissions that all exist, once each', () => {
    expect(problems({ role: '  ' })).toEqual([{ field: 'role', message: 'Role is missing' }]);
    expect(problems({ permissions: [] })).toEqual([
      { field: 'permissions', message: 'Role has no permissions' },
    ]);
    expect(problems({ permissions: ['orders.order.view', 'finance.payout.approve'] })).toEqual([
      { field: 'permissions', message: 'Unknown permission "finance.payout.approve"' },
    ]);
    expect(problems({ permissions: ['orders.order.view', 'orders.order.view'] })).toEqual([
      { field: 'permissions', message: 'Permission "orders.order.view" is listed twice' },
    ]);
  });

  it('global has no ids and every other scope needs some, each once and not blank', () => {
    expect(problems({ scope: scope('global', 'MH') })).toEqual([
      { field: 'scope', message: 'A global scope has no ids' },
    ]);
    expect(problems({ scope: scope('state') })).toEqual([
      { field: 'scope', message: 'A state scope needs at least one id' },
    ]);
    expect(problems({ scope: scope('state', 'MH', ' ') })).toEqual([
      { field: 'scope', message: 'Scope ids cannot be empty' },
    ]);
    expect(problems({ scope: scope('state', 'MH', 'MH') })).toEqual([
      { field: 'scope', message: 'Scope ids are listed twice' },
    ]);
    const odd = { type: 'galaxy', ids: ['X'] } as unknown as Grant['scope'];
    expect(problems({ scope: odd })).toEqual([
      { field: 'scope', message: 'Unknown scope type "galaxy"' },
    ]);
  });

  it('the scope type must suit at least one permission of the role', () => {
    const request = 'network.area.go_live.request';
    expect(problems({ permissions: [request], scope: scope('hub', 'H1') })).toEqual([
      { field: 'scope', message: 'No permission of this role can be used in a hub scope' },
    ]);
    expect(problems({ permissions: [request], scope: scope('global') })).toEqual([
      { field: 'scope', message: 'No permission of this role can be used in a global scope' },
    ]);
    // one suitable permission is enough: the other simply never counts there
    expect(
      problems({ permissions: [request, 'orders.order.view'], scope: scope('hub', 'H1') }),
    ).toEqual([]);
    // unknown permissions are reported once, not again as a scope problem
    expect(problems({ permissions: ['no.such.thing'], scope: scope('hub', 'H1') })).toEqual([
      { field: 'permissions', message: 'Unknown permission "no.such.thing"' },
    ]);
  });

  it('dates must be dates and must run forwards', () => {
    expect(problems({ validFrom: 'soon' })).toEqual([
      { field: 'validity', message: 'Valid-from is not a date' },
    ]);
    expect(problems({ validTo: '' })).toEqual([
      { field: 'validity', message: 'Valid-to is not a date' },
    ]);
    expect(
      problems({ validFrom: '2026-10-21T00:00:00Z', validTo: '2026-10-20T00:00:00Z' }),
    ).toEqual([{ field: 'validity', message: 'Valid-to must be after valid-from' }]);
    expect(
      problems({ validFrom: '2026-10-20T00:00:00Z', validTo: '2026-10-20T00:00:00Z' }),
    ).toEqual([{ field: 'validity', message: 'Valid-to must be after valid-from' }]);
    // a broken date is reported on its own, not also as "backwards"
    expect(problems({ validFrom: 'soon', validTo: '2026-10-20T00:00:00Z' })).toHaveLength(1);
  });

  it('reports everything at once, role first', () => {
    const all = problems({
      role: '',
      permissions: [],
      scope: scope('state'),
      validFrom: 'x',
    });
    expect(all.map((p) => p.field)).toEqual(['role', 'permissions', 'scope', 'validity']);
  });
});
