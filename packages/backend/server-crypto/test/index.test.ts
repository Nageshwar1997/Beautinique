import { describe, expect, it } from 'vitest';

import * as api from '../src/index';
import {
  blindIndex,
  CryptoError,
  decryptField,
  encryptField,
  generateKey,
  loadCryptoKeys,
  maskTail,
  needsReencrypt,
  sealPii,
} from '../src/index';

const K1 = generateKey();
const K2 = generateKey();
const B1 = generateKey();
const keys = loadCryptoKeys({ fieldKeys: `k1:${K1}`, blindIndexKey: `b1:${B1}` });
const CONTEXT = 'sellers.bankAccount:6719a0c2e4b0a1b2c3d4e5f6';

describe('public API', () => {
  it('exports the key loader, the field functions and the error', () => {
    for (const name of [
      'loadCryptoKeys',
      'generateKey',
      'encryptField',
      'decryptField',
      'needsReencrypt',
      'blindIndex',
      'sealPii',
      'maskTail',
      'CryptoError',
    ]) {
      expect(api, name).toHaveProperty(name);
    }
  });
});

describe('loadCryptoKeys', () => {
  it('seals with the first key and opens with all of them', () => {
    const ring = loadCryptoKeys({ fieldKeys: ` k2:${K2} , k1:${K1} `, blindIndexKey: `b1:${B1}` });
    expect(ring.encryption.current).toBe('k2');
    expect([...ring.encryption.keys.keys()]).toEqual(['k2', 'k1']);
    expect(ring.blindIndex.id).toBe('b1');
    expect(ring.encryption.keys.get('k1')).toHaveLength(32);
  });

  it('refuses wrong config, naming the setting and key id but never the key', () => {
    const short = Buffer.alloc(16, 7).toString('base64');
    for (const [config, message] of [
      [{ fieldKeys: '', blindIndexKey: `b1:${B1}` }, 'FIELD_KEYS: give at least one key'],
      [{ fieldKeys: K1, blindIndexKey: `b1:${B1}` }, 'each key must be "<id>:<base64>"'],
      [{ fieldKeys: `K1:${K1}`, blindIndexKey: `b1:${B1}` }, 'each key must be "<id>:<base64>"'],
      [{ fieldKeys: `k1:${short}`, blindIndexKey: `b1:${B1}` }, 'key k1 must be 32 bytes'],
      [{ fieldKeys: `k1:${K1},k1:${K2}`, blindIndexKey: `b1:${B1}` }, 'key k1 is listed twice'],
      [
        { fieldKeys: `k1:${K1}`, blindIndexKey: `b1:${short}` },
        'BLIND_INDEX_KEY: key b1 must be 32 bytes',
      ],
      [
        { fieldKeys: `k1:${K1}`, blindIndexKey: `b1:${K1}` },
        'must differ from every FIELD_KEYS key',
      ],
    ] as const) {
      let caught: unknown;
      try {
        loadCryptoKeys(config);
      } catch (error) {
        caught = error;
      }
      expect(caught, message).toBeInstanceOf(CryptoError);
      expect((caught as Error).message).toContain(message);
      expect((caught as Error).message).not.toContain(K1);
      expect((caught as Error).message).not.toContain(short);
    }
  });

  it('makes random 32-byte keys', () => {
    const one = generateKey();
    expect(Buffer.from(one, 'base64')).toHaveLength(32);
    expect(one).not.toBe(generateKey());
  });
});

describe('encryptField and decryptField', () => {
  it('opens what it sealed, in the v1 format, with a fresh IV every time', () => {
    const sealed = encryptField(keys, '50100123456789', CONTEXT);
    expect(sealed).toMatch(/^v1\.k1\.[\w-]{16}\.[\w-]+\.[\w-]{22}$/);
    expect(sealed).not.toContain('50100123456789');
    expect(decryptField(keys, sealed, CONTEXT)).toBe('50100123456789');
    expect(encryptField(keys, '50100123456789', CONTEXT)).not.toBe(sealed);
    // unicode and empty values survive
    for (const value of ['', '₹1,299 ✓ 😀']) {
      expect(decryptField(keys, encryptField(keys, value, CONTEXT), CONTEXT)).toBe(value);
    }
  });

  it('does not open in another record or field (the context is bound in)', () => {
    const sealed = encryptField(keys, 'ABCDE1234F', CONTEXT);
    expect(() => decryptField(keys, sealed, 'sellers.bankAccount:other')).toThrow(
      'Could not open the sealed value: wrong key, wrong context or changed data',
    );
  });

  it('notices any changed byte', () => {
    const sealed = encryptField(keys, 'ABCDE1234F', CONTEXT);
    const parts = sealed.split('.');
    for (const at of [2, 3, 4]) {
      const changed = [...parts];
      const part = changed[at] ?? '';
      changed[at] = `${part.startsWith('A') ? 'B' : 'A'}${part.slice(1)}`;
      expect(() => decryptField(keys, changed.join('.'), CONTEXT), String(at)).toThrow(CryptoError);
    }
  });

  it('opens values of an older key after rotation, and says they need sealing again', () => {
    const old = encryptField(keys, 'DL-1420110012345', CONTEXT);
    const rotated = loadCryptoKeys({ fieldKeys: `k2:${K2},k1:${K1}`, blindIndexKey: `b1:${B1}` });
    expect(decryptField(rotated, old, CONTEXT)).toBe('DL-1420110012345');
    expect(needsReencrypt(rotated, old)).toBe(true);
    const fresh = encryptField(rotated, 'DL-1420110012345', CONTEXT);
    expect(fresh.startsWith('v1.k2.')).toBe(true);
    expect(needsReencrypt(rotated, fresh)).toBe(false);
    // once k1 is gone, its values say so instead of failing quietly
    const k2Only = loadCryptoKeys({ fieldKeys: `k2:${K2}`, blindIndexKey: `b1:${B1}` });
    expect(() => decryptField(k2Only, old, CONTEXT)).toThrow(
      'Sealed with key k1, which is not configured (rotated out?)',
    );
  });

  it('refuses values that are not sealed, and an empty context', () => {
    for (const bad of ['plain text', 'v2.k1.a.b.c', 'v1.k1.a.b', 'v1..a.b.c', 'v1.k1.AAAA.b.c']) {
      expect(() => decryptField(keys, bad, CONTEXT), bad).toThrow(CryptoError);
    }
    expect(() => encryptField(keys, 'x', ' ')).toThrow('A context is required');
    expect(() => decryptField(keys, encryptField(keys, 'x', CONTEXT), '')).toThrow(
      'A context is required',
    );
  });

  it('opens only the exact format: no other version, no extra parts', () => {
    const sealed = encryptField(keys, 'ABCDE1234F', CONTEXT);
    for (const changed of [sealed.replace(/^v1\./, 'v2.'), `${sealed}.x`]) {
      expect(() => decryptField(keys, changed, CONTEXT), changed.slice(0, 8)).toThrow(
        'Not a sealed value',
      );
    }
  });
});

describe('blindIndex', () => {
  it('matches equal values in one field, differs across fields and keys, and hides the value', () => {
    const one = blindIndex(keys, 'sellers.pan', 'ABCDE1234F');
    expect(one).toMatch(/^b1\.[\w-]{43}$/);
    expect(blindIndex(keys, 'sellers.pan', 'ABCDE1234F')).toBe(one);
    expect(blindIndex(keys, 'sellers.pan', 'ABCDE1234G')).not.toBe(one);
    expect(blindIndex(keys, 'riders.pan', 'ABCDE1234F')).not.toBe(one);
    // field and value are kept apart: "a" + "bc" is not "ab" + "c"
    expect(blindIndex(keys, 'a', 'bc')).not.toBe(blindIndex(keys, 'ab', 'c'));
    const other = loadCryptoKeys({ fieldKeys: `k1:${K1}`, blindIndexKey: `b2:${K2}` });
    expect(blindIndex(other, 'sellers.pan', 'ABCDE1234F').slice(3)).not.toBe(one.slice(3));
    expect(one).not.toContain('ABCDE');
    expect(() => blindIndex(keys, '', 'x')).toThrow('A field name is required');
  });
});

describe('sealPii and maskTail', () => {
  it('stores a personal field sealed, searchable and masked, however it was typed', () => {
    const normalize = (raw: string) => raw.replace(/\s/g, '').toUpperCase();
    const typed = sealPii(keys, 'abcde 1234f', {
      field: 'sellers.pan',
      context: CONTEXT,
      normalize,
    });
    expect(typed.masked).toBe('XXXXXX234F');
    expect(typed.idx).toBe(blindIndex(keys, 'sellers.pan', 'ABCDE1234F'));
    expect(decryptField(keys, typed.enc, CONTEXT)).toBe('ABCDE1234F');
    const plain = sealPii(keys, '50100123456789', {
      field: 'sellers.bankAccount',
      context: CONTEXT,
    });
    expect(plain.masked).toBe('XXXXXXXXXX6789');
    expect(sealPii(keys, '1234567', { field: 'f', context: CONTEXT, visible: 2 }).masked).toBe(
      'XXXXX67',
    );
  });

  it('masks all of a value no longer than what it would show', () => {
    expect(maskTail('1234')).toBe('XXXX');
    expect(maskTail('12')).toBe('XX');
    expect(maskTail('')).toBe('');
    expect(maskTail('123456', 2)).toBe('XXXX56');
  });
});
