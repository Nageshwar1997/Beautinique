import fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { CryptoError } from '../src/errors.ts';
import { createFieldCipher, MAX_FIELD_BYTES } from '../src/field-cipher.ts';
import { newKeyText, parseKeyring, type Keyring } from '../src/keyring.ts';
import { keyringOf } from './utils/keys.ts';

const NAME = 'CATALOG_FIELD_KEYS';
const pan = {
  collection: 'seller_profiles',
  field: 'kyc.pan',
  recordId: '6747a1b2c3d4e5f601234567',
};
const PAN = 'ABCPE1234F';

const cipherWith = (keys: Keyring, service = 'catalog') => createFieldCipher({ service, keys });

/** A value with one base64url character of one part changed to another. */
function changed(value: string, part: number, at = 0): string {
  const parts = value.split('.');
  const text = parts[part] as string;
  const swap = text[at] === 'A' ? 'B' : 'A';
  parts[part] = text.slice(0, at) + swap + text.slice(at + 1);
  return parts.join('.');
}

describe('field encryption (docs/ARCHITECTURE.md §10.3 rule 5, SR-063)', () => {
  const keys = keyringOf(NAME, 'k1');
  const cipher = cipherWith(keys);

  it('SR-063: v1.<keyId>.<iv>.<ciphertext>.<tag>, and the same place opens it', () => {
    const value = cipher.encrypt(PAN, pan);

    expect(value).toMatch(/^v1\.k1\.[A-Za-z0-9_-]{16}\.[A-Za-z0-9_-]{14}\.[A-Za-z0-9_-]{22}$/);
    expect(cipher.decrypt(value, pan)).toBe(PAN);
    expect(cipher.service).toBe('catalog');
    expect(Object.isFrozen(cipher)).toBe(true);
  });

  it('SR-063: the same plaintext twice gives two values that do not look alike (a new IV each time)', () => {
    const values = new Set(Array.from({ length: 50 }, () => cipher.encrypt(PAN, pan)));
    expect(values.size).toBe(50);
    const ivs = new Set([...values].map((value) => value.split('.')[2]));
    expect(ivs.size).toBe(50);
  });

  it('AC-PLATFORM-10: a value copied to another record does not open', () => {
    const recordA = cipher.encrypt(PAN, pan);
    expect(() => cipher.decrypt(recordA, { ...pan, recordId: '6747a1b2c3d4e5f601234568' })).toThrow(
      new CryptoError(
        'Could not open catalog.seller_profiles.kyc.pan: the value was changed, or is of another record or field.',
      ),
    );
  });

  it('AC-PLATFORM-10: a value copied to another field, collection or service does not open', () => {
    const value = cipher.encrypt(PAN, pan);
    const elsewhere = [
      () => cipher.decrypt(value, { ...pan, field: 'kyc.gstin' }),
      () => cipher.decrypt(value, { ...pan, field: 'kyc' }),
      () => cipher.decrypt(value, { ...pan, collection: 'sellers' }),
      () => cipherWith(keys, 'finance').decrypt(value, pan),
    ];
    for (const open of elsewhere) expect(open).toThrow(CryptoError);
  });

  it('AC-PLATFORM-10: a change to any part, even one character, does not open', () => {
    const value = cipher.encrypt('ABCPE1234F and more text', pan);
    const parts = value.split('.');
    for (const part of [2, 3, 4]) {
      for (let at = 0; at < (parts[part] as string).length; at += 1) {
        expect(() => cipher.decrypt(changed(value, part, at), pan)).toThrow(CryptoError);
      }
    }
    // Cut short or made longer.
    expect(() => cipher.decrypt(value.slice(0, -4), pan)).toThrow(CryptoError);
    expect(() => cipher.decrypt(`${value}AAAA`, pan)).toThrow(CryptoError);
  });

  it('AC-PLATFORM-10: a value of another keyring does not open, and says which key it needs', () => {
    const other = cipherWith(keyringOf(NAME, 'k1'));
    expect(() => other.decrypt(cipher.encrypt(PAN, pan), pan)).toThrow(CryptoError);

    const k7 = cipherWith(keyringOf(NAME, 'k7'));
    expect(() => cipher.decrypt(k7.encrypt(PAN, pan), pan)).toThrow(
      new CryptoError(
        `catalog.seller_profiles.kyc.pan is encrypted with the key k7, which ${NAME} does not have.`,
      ),
    );
  });

  it('SR-077: what is not an encrypted value is refused, and no message has the value', () => {
    const notOurs = [
      PAN,
      '',
      'v1',
      'v2.k1.AAAAAAAAAAAAAAAA.AAAA.AAAAAAAAAAAAAAAAAAAAAA',
      'v1.K1.AAAAAAAAAAAAAAAA.AAAA.AAAAAAAAAAAAAAAAAAAAAA',
      'v1.k1.AAAAAAAAAAAAAA.AAAA.AAAAAAAAAAAAAAAAAAAAAA',
      'v1.k1.AAAAAAAAAAAAAAAA.AA=A.AAAAAAAAAAAAAAAAAAAAAA',
      'v1.k1.AAAAAAAAAAAAAAAA.AAAA.AAAAAAAAAAAAAAAAAAAA',
      'v1.k1.AAAAAAAAAAAAAAAA.AAAA.AAAAAAAAAAAAAAAAAAAAAA.x',
    ];
    for (const value of notOurs) {
      expect(() => cipher.decrypt(value, pan)).toThrow(
        new CryptoError('catalog.seller_profiles.kyc.pan is not an encrypted value.'),
      );
    }
    expect(() => cipher.decrypt(42 as unknown as string, pan)).toThrow(CryptoError);
    try {
      cipher.decrypt(changed(cipher.encrypt(PAN, pan), 3), pan);
    } catch (error) {
      expect(String(error)).not.toContain(PAN);
    }
  });

  it('every string goes there and back, and the stored value never has the plaintext in it (property)', () => {
    fc.assert(
      fc.property(fc.string({ unit: 'grapheme', maxLength: 64 }), (text) => {
        expect(cipher.decrypt(cipher.encrypt(text, pan), pan)).toBe(text);
      }),
      { numRuns: 300 },
    );
    fc.assert(
      fc.property(fc.stringMatching(/^[A-Za-z0-9]{8,40}$/), (text) => {
        const value = cipher.encrypt(text, pan);
        expect(value).not.toContain(text);
        expect(value).not.toContain(Buffer.from(text).toString('base64url').slice(0, 8));
        expect(value).not.toContain(Buffer.from(text).toString('hex').slice(0, 8));
      }),
      { numRuns: 300 },
    );
  });

  it('an empty string, and a value of 64 KB exactly, go there and back; more is refused', () => {
    expect(cipher.decrypt(cipher.encrypt('', pan), pan)).toBe('');
    const largest = 'a'.repeat(MAX_FIELD_BYTES);
    expect(cipher.decrypt(cipher.encrypt(largest, pan), pan)).toBe(largest);
    expect(() => cipher.encrypt(`${largest}a`, pan)).toThrow(
      new RangeError('The value of catalog.seller_profiles.kyc.pan is more than 64 KB.'),
    );
    // 64 KB counts bytes: a character of three UTF-8 bytes counts three.
    expect(() => cipher.encrypt('₹'.repeat(Math.floor(MAX_FIELD_BYTES / 3) + 1), pan)).toThrow(
      RangeError,
    );
  });

  it('only a whole string is encrypted, and only at a right place', () => {
    expect(() => cipher.encrypt(1234 as unknown as string, pan)).toThrow(
      new RangeError('The value of catalog.seller_profiles.kyc.pan must be a string.'),
    );
    expect(() => cipher.encrypt('\uD800', pan)).toThrow(
      new RangeError(
        'The value of catalog.seller_profiles.kyc.pan has a broken character (a lone surrogate).',
      ),
    );
    expect(() => cipher.encrypt(PAN, { ...pan, recordId: 'a:b' })).toThrow(RangeError);
    expect(() => createFieldCipher({ service: 'Catalog', keys })).toThrow(RangeError);
  });

  it('SR-063: a new key makes new values, the old one still opens, and rotate moves a value to the new key', () => {
    const k1 = newKeyText('k1');
    const before = cipherWith(parseKeyring(k1, NAME));
    const old = before.encrypt(PAN, pan);

    const after = cipherWith(parseKeyring(`${newKeyText('k2')},${k1}`, NAME));
    expect(after.decrypt(old, pan)).toBe(PAN);
    expect(after.isCurrent(old)).toBe(false);
    expect(after.stalePrefixes).toEqual(['v1.k1.']);
    expect(old.startsWith(after.stalePrefixes[0] as string)).toBe(true);

    const moved = after.rotate(old, pan);
    expect(moved.startsWith('v1.k2.')).toBe(true);
    expect(after.isCurrent(moved)).toBe(true);
    expect(after.decrypt(moved, pan)).toBe(PAN);
    // A current value is given back as it is, without being opened.
    expect(after.rotate(moved, pan)).toBe(moved);
    expect(after.encrypt(PAN, pan).startsWith('v1.k2.')).toBe(true);
    expect(before.stalePrefixes).toEqual([]);
    expect(after.isCurrent('not a value')).toBe(false);

    // Once the old key is out of the config, a value not moved yet says which key it needs.
    const later = cipherWith(parseKeyring(newKeyText('k2'), NAME));
    expect(() => later.rotate(old, pan)).toThrow(CryptoError);
  });

  it('CR-40: 10^4 records encrypt and open, each once (no time limit)', () => {
    const values = Array.from({ length: 10_000 }, (_, i) =>
      cipher.encrypt(`PAN${String(i).padStart(7, '0')}`, { ...pan, recordId: String(i) }),
    );
    expect(new Set(values).size).toBe(10_000);
    values.forEach((value, i) => {
      expect(cipher.decrypt(value, { ...pan, recordId: String(i) })).toBe(
        `PAN${String(i).padStart(7, '0')}`,
      );
    });
  });
});
