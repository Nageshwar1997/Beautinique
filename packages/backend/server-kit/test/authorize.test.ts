import {
  definePermission,
  type PermissionDefinition,
  SCOPE_TYPES,
} from '@beautinique/shared-contracts';
import { assert, constantFrom, integer, property, string as text } from 'fast-check';
import { describe, expect, it } from 'vitest';

import type { Area, Resource, Scope } from '../src/actor.ts';
import { authorize } from '../src/authorize.ts';
import { actorOf, grant, HOUR, hubSwitch, NOW, orderRead } from './utils/fixtures.ts';

const permissionOf = (scope: PermissionDefinition['scope']) =>
  definePermission({
    name: 'logistics.parcel.read',
    scope,
    authenticator: false,
    stepUp: false,
    subRoleAllowed: true,
  });

// A hub, with the places it is in.
const here: Area = {
  state: 'MH',
  district: 'pune',
  subDistrict: 'haveli',
  hub: 'hub-1',
  warehouse: 'wh-1',
};

describe('authorize: who may use a permission (SR-032)', () => {
  it('SR-032: no actor is 401', () => {
    expect(authorize(undefined, orderRead, undefined, NOW)).toEqual({
      allowed: false,
      reason: 'unauthenticated',
    });
  });

  it('SR-032: no grant of the permission is 403, whatever else the actor holds', () => {
    const actor = actorOf([
      grant('commerce.order.place'),
      grant('catalog.listing.read', { type: 'global' }),
    ]);

    expect(authorize(actor, orderRead, { ownerId: 'acc-1' }, NOW)).toEqual({
      allowed: false,
      reason: 'forbidden',
    });
    expect(authorize(actorOf([]), orderRead, undefined, NOW)).toEqual({
      allowed: false,
      reason: 'forbidden',
    });
  });

  it('SR-037: a grant that has ended, or has not begun, is not in force', () => {
    const at = NOW.getTime();
    const ended = actorOf([grant(orderRead, { type: 'self' }, { validUntil: at })]);
    const early = actorOf([grant(orderRead, { type: 'self' }, { validFrom: at + 1 })]);
    const inForce = actorOf([
      grant(orderRead, { type: 'self' }, { validFrom: at, validUntil: at + HOUR }),
    ]);

    expect(authorize(ended, orderRead, undefined, NOW).allowed).toBe(false);
    expect(authorize(early, orderRead, undefined, NOW).allowed).toBe(false);
    expect(authorize(inForce, orderRead, undefined, NOW).allowed).toBe(true);
    expect(authorize(inForce, orderRead, undefined, new Date(at + HOUR)).allowed).toBe(false);
  });

  it('SR-037: a permission that asks for an authenticator is 403 for an account that has none', () => {
    const permission = definePermission({
      name: 'finance.payout_batch.approve',
      scope: 'global',
      authenticator: true,
      stepUp: false,
      subRoleAllowed: false,
    });
    const held = [grant(permission, { type: 'global' })];

    expect(authorize(actorOf(held), permission, undefined, NOW)).toEqual({
      allowed: false,
      reason: 'forbidden',
    });
    expect(
      authorize(actorOf(held, { authenticator: true }), permission, undefined, NOW).allowed,
    ).toBe(true);
  });

  it('D-185: a step-up needs a fresh code, and only after the permission and the scope are right', () => {
    const held = [grant(hubSwitch, { type: 'hub', id: 'hub-1' })];
    const staff = (stepUpUntil?: number) =>
      actorOf(held, { authenticator: true, ...(stepUpUntil === undefined ? {} : { stepUpUntil }) });
    const at = NOW.getTime();

    expect(authorize(staff(), hubSwitch, { area: here }, NOW)).toEqual({
      allowed: false,
      reason: 'step-up-required',
    });
    expect(authorize(staff(at), hubSwitch, { area: here }, NOW).allowed).toBe(false);
    expect(authorize(staff(at + 1), hubSwitch, { area: here }, NOW).allowed).toBe(true);
    // Another hub is 404 before it is a step-up, and no grant at all is 403.
    expect(authorize(staff(), hubSwitch, { area: { ...here, hub: 'hub-2' } }, NOW)).toEqual({
      allowed: false,
      reason: 'not-found',
    });
    expect(authorize(actorOf([], { authenticator: true }), hubSwitch, { area: here }, NOW)).toEqual(
      {
        allowed: false,
        reason: 'forbidden',
      },
    );
  });
});

describe('authorize: the scope (SR-033, SR-034, SR-035)', () => {
  const asks = (
    permissionScope: PermissionDefinition['scope'],
    granted: Scope,
    resource: Resource,
  ) =>
    authorize(
      actorOf([grant('logistics.parcel.read', granted)]),
      permissionOf(permissionScope),
      resource,
      NOW,
    ).allowed;

  it('SR-033: a thing of one’s own is its owner’s, and another customer’s is 404', () => {
    const decision = authorize(actorOf([grant(orderRead)]), orderRead, { ownerId: 'acc-2' }, NOW);

    expect(decision).toEqual({ allowed: false, reason: 'not-found' });
    expect(
      authorize(actorOf([grant(orderRead)]), orderRead, { ownerId: 'acc-1' }, NOW).allowed,
    ).toBe(true);
    // A resource that does not say who owns it cannot be proven to be the actor's.
    expect(authorize(actorOf([grant(orderRead)]), orderRead, {}, NOW).allowed).toBe(false);
  });

  it('SR-034: a seller reaches only the data of its own seller id', () => {
    const granted: Scope = { type: 'seller', id: 'seller-1' };

    expect(asks('seller', granted, { sellerId: 'seller-1' })).toBe(true);
    expect(asks('seller', granted, { sellerId: 'seller-2' })).toBe(false);
    expect(asks('seller', granted, {})).toBe(false);
    expect(asks('seller', { type: 'seller' }, {})).toBe(false);
  });

  it('SR-035: an area reaches what is inside it, and nothing outside', () => {
    const inside: [Scope, boolean][] = [
      [{ type: 'hub', id: 'hub-1' }, true],
      [{ type: 'hub', id: 'hub-2' }, false],
      [{ type: 'subDistrict', id: 'haveli' }, true],
      [{ type: 'subDistrict', id: 'mulshi' }, false],
      [{ type: 'district', id: 'pune' }, true],
      [{ type: 'district', id: 'thane' }, false],
      [{ type: 'state', id: 'MH' }, true],
      [{ type: 'state', id: 'GJ' }, false],
      [{ type: 'national' }, true],
      [{ type: 'global' }, true],
    ];

    for (const [granted, expected] of inside) {
      expect(asks('hub', granted, { area: here }), `${granted.type} ${granted.id ?? ''}`).toBe(
        expected,
      );
    }
  });

  it('SR-035: a bigger scope does not reach down to a smaller permission than its type allows', () => {
    // A warehouse is inside its district, not inside a sub-district or a hub.
    expect(asks('warehouse', { type: 'district', id: 'pune' }, { area: here })).toBe(true);
    expect(asks('warehouse', { type: 'subDistrict', id: 'haveli' }, { area: here })).toBe(false);
    expect(asks('warehouse', { type: 'hub', id: 'hub-1' }, { area: here })).toBe(false);
    expect(asks('warehouse', { type: 'warehouse', id: 'wh-1' }, { area: here })).toBe(true);
    // A smaller grant does not reach a bigger permission.
    expect(asks('district', { type: 'hub', id: 'hub-1' }, { area: here })).toBe(false);
    expect(asks('state', { type: 'district', id: 'pune' }, { area: here })).toBe(false);
    expect(asks('national', { type: 'state', id: 'MH' }, { area: here })).toBe(false);
    expect(asks('national', { type: 'national' }, { area: here })).toBe(true);
    // Only `global` reaches a `global` permission, and the own things of a person or a seller.
    expect(asks('global', { type: 'national' }, {})).toBe(false);
    expect(asks('global', { type: 'global' }, {})).toBe(true);
    expect(asks('self', { type: 'global' }, {})).toBe(true);
    expect(asks('self', { type: 'national' }, { ownerId: 'acc-1' })).toBe(false);
    expect(asks('seller', { type: 'state', id: 'MH' }, { sellerId: 'seller-1' })).toBe(false);
  });

  it('SR-035: what the resource does not say about where it is cannot be proven', () => {
    expect(asks('hub', { type: 'district', id: 'pune' }, { area: { hub: 'hub-1' } })).toBe(false);
    expect(asks('hub', { type: 'district', id: 'pune' }, {})).toBe(false);
    // An area grant with no id reaches nothing.
    expect(asks('hub', { type: 'district' }, { area: here })).toBe(false);
  });

  it('SR-033: with no resource (a list) the scopes in force are given, for the handler to filter by', () => {
    const actor = actorOf([
      grant('logistics.parcel.read', { type: 'hub', id: 'hub-1' }),
      grant('logistics.parcel.read', { type: 'hub', id: 'hub-2' }),
      grant('logistics.parcel.read', { type: 'seller', id: 'seller-1' }),
      grant('logistics.parcel.read', { type: 'state', id: 'MH' }, { validUntil: NOW.getTime() }),
    ]);

    expect(authorize(actor, permissionOf('hub'), undefined, NOW)).toEqual({
      allowed: true,
      scopes: [
        { type: 'hub', id: 'hub-1' },
        { type: 'hub', id: 'hub-2' },
      ],
    });
    expect(authorize(actor, permissionOf('hub'), { area: { hub: 'hub-2' } }, NOW)).toEqual({
      allowed: true,
      scopes: [{ type: 'hub', id: 'hub-2' }],
    });
  });
});

describe('authorize: properties', () => {
  const scopeArb = constantFrom(...SCOPE_TYPES);

  it('SR-032: a `global` grant reaches every resource, for every scope of permission', () => {
    assert(
      property(scopeArb, text(), (permissionScope, owner) => {
        const decision = authorize(
          actorOf([grant('logistics.parcel.read', { type: 'global' })]),
          permissionOf(permissionScope),
          { ownerId: owner, area: here },
          NOW,
        );
        expect(decision.allowed).toBe(true);
      }),
    );
  });

  it('SR-032: a grant of another permission never allows, whatever its scope', () => {
    assert(
      property(scopeArb, scopeArb, (permissionScope, grantScope) => {
        const decision = authorize(
          actorOf([grant('logistics.parcel.write', { type: grantScope, id: 'x' })]),
          permissionOf(permissionScope),
          { ownerId: 'acc-1', sellerId: 'x', area: here },
          NOW,
        );
        expect(decision).toEqual({ allowed: false, reason: 'forbidden' });
      }),
    );
  });

  it('SR-037: a grant is in force exactly from its start up to, and not including, its end', () => {
    assert(
      property(integer({ min: -5, max: 5 }), integer({ min: 1, max: 5 }), (start, length) => {
        const at = NOW.getTime();
        const actor = actorOf([
          grant(
            orderRead,
            { type: 'self' },
            { validFrom: at + start, validUntil: at + start + length },
          ),
        ]);

        expect(authorize(actor, orderRead, undefined, NOW).allowed).toBe(
          start <= 0 && 0 < start + length,
        );
      }),
    );
  });
});
