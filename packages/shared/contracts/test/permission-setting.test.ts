import { describe, expect, it } from 'vitest';
import { array, number, string } from 'zod';

import { definePermission, defineSetting } from '../src/index.ts';

describe('definePermission', () => {
  it('SR-037: keeps the name, the scope, the authenticator, the step-up and the sub-role flag', () => {
    const permission = definePermission({
      name: 'finance.payout_batch.approve',
      scope: 'global',
      authenticator: true,
      stepUp: true,
      subRoleAllowed: false,
    });

    expect(permission).toEqual({
      name: 'finance.payout_batch.approve',
      scope: 'global',
      authenticator: true,
      stepUp: true,
      subRoleAllowed: false,
    });
    expect(Object.isFrozen(permission)).toBe(true);
  });

  it('SR-037: a name must be <service>.<resource>.<action>, with a service of the list', () => {
    const make = (name: string) => () =>
      definePermission({
        name: name as never,
        scope: 'self',
        authenticator: false,
        stepUp: false,
        subRoleAllowed: true,
      });

    expect(make('catalog.listing.approve')).not.toThrow();
    expect(make('logistics.hub.switch')).not.toThrow();
    for (const wrong of [
      'approve',
      'catalog.approve',
      'shop.listing.approve',
      'catalog.Listing.approve',
      'catalog.listing.approve.now',
      '',
    ]) {
      expect(make(wrong), wrong).toThrow(RangeError);
    }
  });

  it('SR-037: a step-up needs an authenticator', () => {
    expect(() =>
      definePermission({
        name: 'finance.payout_batch.approve',
        scope: 'global',
        authenticator: false,
        stepUp: true,
        subRoleAllowed: false,
      }),
    ).toThrow('step-up without an authenticator');
  });
});

describe('defineSetting', () => {
  it('CR-12: keeps the key, the shape of the value and a default that passes it', () => {
    const setting = defineSetting({
      key: 'gateway.rateLimit.signIn.perIp',
      schema: number().int().min(1),
      defaultValue: 20,
      description: 'Password sign-ins from one IP in ten minutes.',
    });

    expect(setting.key).toBe('gateway.rateLimit.signIn.perIp');
    expect(setting.defaultValue).toBe(20);
    expect(setting.schema.safeParse(0).success).toBe(false);
    expect(Object.isFrozen(setting)).toBe(true);
  });

  it('CR-12: the default is the parsed value of the schema', () => {
    const setting = defineSetting({
      key: 'notify.digest.hours',
      schema: array(string().trim()),
      defaultValue: [' 09:00 '],
      description: 'When the digest goes.',
    });

    expect(setting.defaultValue).toEqual(['09:00']);
  });

  it('CR-12: a key is <service>.<name> in camelCase', () => {
    const make = (key: string) => () =>
      defineSetting({ key: key as never, schema: string(), defaultValue: 'x', description: 'd' });

    expect(make('identity.session.idleMinutes')).not.toThrow();
    for (const wrong of [
      'session',
      'identity',
      'identity.',
      'shop.session.idle',
      'identity.Session',
      'identity.session_idle',
      '',
    ]) {
      expect(make(wrong), wrong).toThrow(RangeError);
    }
  });

  it('CR-12: a default that does not pass its own schema', () => {
    expect(() =>
      defineSetting({
        key: 'gateway.rateLimit.signIn.perIp',
        schema: number().int().min(1),
        defaultValue: 0,
        description: 'd',
      }),
    ).toThrow('does not pass its own schema');
  });
});
