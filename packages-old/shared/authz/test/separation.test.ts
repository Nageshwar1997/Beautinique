import { describe, expect, it } from 'vitest';

import { checkSeparation } from '../src/index';

describe('separation of duties', () => {
  it('allows someone who did none of the earlier steps', () => {
    expect(checkSeparation('U2', [{ by: 'U1', as: 'maker' }])).toEqual({
      allowed: true,
      reason: 'allowed',
    });
    expect(checkSeparation('U2', [])).toEqual({ allowed: true, reason: 'allowed' });
  });

  it('refuses the maker as checker, and says which step clashes', () => {
    expect(checkSeparation('U1', [{ by: 'U1', as: 'maker' }])).toEqual({
      allowed: false,
      reason: 'same-person',
      conflictsWith: 'maker',
    });
  });

  it('refuses a clash with any earlier step, the first one reported', () => {
    const earlier = [
      { by: 'U1', as: 'maker' },
      { by: 'U3', as: 'rejecter' },
      { by: 'U3', as: 'listing owner' },
    ];
    expect(checkSeparation('U3', earlier)).toMatchObject({
      allowed: false,
      conflictsWith: 'rejecter',
    });
    expect(checkSeparation('U1', earlier)).toMatchObject({
      allowed: false,
      conflictsWith: 'maker',
    });
    expect(checkSeparation('U9', earlier).allowed).toBe(true);
  });

  it('compares ids exactly', () => {
    expect(checkSeparation('u1', [{ by: 'U1', as: 'maker' }]).allowed).toBe(true);
    expect(checkSeparation('U1 ', [{ by: 'U1', as: 'maker' }]).allowed).toBe(true);
  });

  it('a missing person is a programming error, not a pass', () => {
    expect(() => checkSeparation(' ', [])).toThrow('needs the id of the person acting');
    expect(() => checkSeparation('', [{ by: 'U1', as: 'maker' }])).toThrow('needs the id');
    expect(() => checkSeparation('U2', [{ by: '', as: 'maker' }])).toThrow(
      'Earlier step "maker" has no person',
    );
    expect(() => checkSeparation('U2', [{ by: '  ', as: 'rejecter' }])).toThrow(
      'Earlier step "rejecter" has no person',
    );
  });
});
