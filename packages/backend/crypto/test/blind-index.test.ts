import { createHmac } from 'node:crypto';

import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { createBlindIndex } from '../src/blind-index.ts';
import { keyOf, newKeyText, parseKeyring } from '../src/keyring.ts';
import { keyringOf } from './utils/keys.ts';

const NAME = 'CATALOG_BLIND_KEYS';
const pan = { collection: 'seller_profiles', field: 'kyc.pan' };
const PAN = 'ABCPE1234F';

describe('blind indexes (docs/ARCHITECTURE.md §10.3 rule 6, SR-063)', () => {
  const keys = keyringOf(NAME, 'k1');
  const index = createBlindIndex({ service: 'catalog', keys });

  it('SR-063: b1.<keyId>.<HMAC-SHA256>, the same for the same value and place', () => {
    const first = index.indexOf(PAN, pan);

    expect(first).toMatch(/^b1\.k1\.[A-Za-z0-9_-]{43}$/);
    expect(index.indexOf(PAN, pan)).toBe(first);
    expect(index.indexOf('ABCPE1234G', pan)).not.toBe(first);
    expect(first).not.toContain(PAN);
    expect(index.service).toBe('catalog');
  });

  it('SR-063: it is HMAC-SHA256 with the blind key over what it is for, the place and the value', () => {
    const key = keyOf(keys, 'k1');
    const expected = createHmac('sha256', key as NonNullable<typeof key>)
      .update('blind\u0000catalog.seller_profiles.kyc.pan\u0000')
      .update(PAN)
      .digest('base64url');
    expect(index.indexOf(PAN, pan)).toBe(`b1.k1.${expected}`);
  });

  it('SR-063: the same value in another field, collection or service has an unrelated index', () => {
    const here = index.indexOf(PAN, pan);
    const others = [
      index.indexOf(PAN, { ...pan, field: 'kyc.gstinPan' }),
      index.indexOf(PAN, { ...pan, collection: 'payout_accounts' }),
      createBlindIndex({ service: 'finance', keys }).indexOf(PAN, pan),
      createBlindIndex({ service: 'catalog', keys: keyringOf(NAME, 'k1') }).indexOf(PAN, pan),
    ];
    expect(new Set([here, ...others]).size).toBe(5);
  });

  it('a different value never gives the same index (property)', () => {
    fc.assert(
      fc.property(
        fc.string({ unit: 'grapheme', minLength: 1, maxLength: 20 }),
        fc.string({ unit: 'grapheme', minLength: 1, maxLength: 20 }),
        (a, b) => {
          fc.pre(a !== b);
          expect(index.indexOf(a, pan)).not.toBe(index.indexOf(b, pan));
        },
      ),
      { numRuns: 500 },
    );
  });

  it('SR-063: after a new key, lookupValues finds a record still indexed with the old key', () => {
    const k1 = newKeyText('k1');
    const before = createBlindIndex({ service: 'catalog', keys: parseKeyring(k1, NAME) });
    const stored = before.indexOf(PAN, pan);

    const after = createBlindIndex({
      service: 'catalog',
      keys: parseKeyring(`${newKeyText('k2')},${k1}`, NAME),
    });
    const lookFor = after.lookupValues(PAN, pan);

    expect(lookFor).toHaveLength(2);
    expect(lookFor[0]).toBe(after.indexOf(PAN, pan));
    expect(lookFor[0]?.startsWith('b1.k2.')).toBe(true);
    expect(lookFor).toContain(stored);
    expect(after.isCurrent(stored)).toBe(false);
    expect(after.isCurrent(lookFor[0] as string)).toBe(true);
    expect(after.isCurrent('b1.k2.short')).toBe(false);
    expect(after.stalePrefixes).toEqual(['b1.k1.']);
    expect(before.stalePrefixes).toEqual([]);
  });

  it('an empty, broken, too long or non-text value, or a wrong place, is refused', () => {
    expect(() => index.indexOf('', pan)).toThrow(
      new RangeError('The value of catalog.seller_profiles.kyc.pan is empty.'),
    );
    expect(() => index.indexOf('\uDC00', pan)).toThrow(
      new RangeError(
        'The value of catalog.seller_profiles.kyc.pan has a broken character (a lone surrogate).',
      ),
    );
    expect(() => index.lookupValues('a'.repeat(64 * 1024 + 1), pan)).toThrow(
      new RangeError('The value of catalog.seller_profiles.kyc.pan is more than 64 KB.'),
    );
    expect(() => index.indexOf(9 as unknown as string, pan)).toThrow(
      new RangeError('The value of catalog.seller_profiles.kyc.pan must be a string.'),
    );
    expect(() => index.indexOf(PAN, { ...pan, field: 'kyc:pan' })).toThrow(RangeError);
    expect(() => createBlindIndex({ service: '', keys })).toThrow(RangeError);
  });

  it('CR-40: 10^4 values give 10^4 indexes (no time limit)', () => {
    const indexes = new Set(
      Array.from({ length: 10_000 }, (_, i) =>
        index.indexOf(`+91${String(9_000_000_000 + i)}`, pan),
      ),
    );
    expect(indexes.size).toBe(10_000);
  });
});
