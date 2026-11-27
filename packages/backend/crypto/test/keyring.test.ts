import { createSecretKey, randomBytes } from 'node:crypto';
import { inspect } from 'node:util';

import { defineConfig, parseConfig } from '@beautinique/backend-config';
import { describe, expect, it } from 'vitest';

import {
  currentKeyOf,
  Keyring,
  keyOf,
  keyringSchema,
  keysOf,
  newKeyText,
  parseKeyring,
} from '../src/keyring.ts';

const NAME = 'IDENTITY_FIELD_KEYS';
const key = (): string => randomBytes(32).toString('base64url');

describe('keyrings from the config (docs/ARCHITECTURE.md §10.3 rule 5)', () => {
  it('SR-063: the first key is the current one, and every key is there by its id', () => {
    const ring = parseKeyring(`k2:${key()},k1:${key()}`, NAME);

    expect(ring.name).toBe(NAME);
    expect(ring.currentId).toBe('k2');
    expect(ring.ids).toEqual(['k2', 'k1']);
    expect(keyOf(ring, 'k1')?.symmetricKeySize).toBe(32);
    expect(keyOf(ring, 'k9')).toBeUndefined();
    expect(currentKeyOf(ring)).toBe(keyOf(ring, 'k2'));
    expect([...keysOf(ring).keys()]).toEqual(['k2', 'k1']);
  });

  it('SR-077: a keyring that is logged, printed or turned into JSON shows its ids and never a key', () => {
    const text = `k2:${key()},k1:${key()}`;
    const ring = parseKeyring(text, NAME);
    const secrets = text.split(',').map((entry) => entry.slice(3));

    const shown = [
      JSON.stringify(ring),
      inspect(ring),
      String(Object.keys(ring)),
      inspect({ ring }),
    ];
    for (const view of shown) {
      for (const secret of secrets) expect(view).not.toContain(secret);
    }
    expect(JSON.parse(JSON.stringify(ring))).toEqual({ name: NAME, ids: ['k2', 'k1'] });
    expect(inspect(ring)).toBe(`Keyring(${NAME}: k2, k1)`);
    expect(Object.isFrozen(ring)).toBe(true);
  });

  it('SR-077: anything wrong is refused by the config key and the entry, never with a key in it', () => {
    const good = key();
    const cases: [unknown, string][] = [
      ['', `${NAME} is empty.`],
      [42, `${NAME} is empty.`],
      [good, `${NAME}: entry 1 is not <id>:<key>.`],
      [`:${good}`, `${NAME}: entry 1 is not <id>:<key>.`],
      [
        `k1:${good},K2:${key()}`,
        `${NAME}: entry 2 has a key id that is not small letters and digits, up to 16.`,
      ],
      [
        `k-1:${good}`,
        `${NAME}: entry 1 has a key id that is not small letters and digits, up to 16.`,
      ],
      [
        `${'k'.repeat(17)}:${good}`,
        `${NAME}: entry 1 has a key id that is not small letters and digits, up to 16.`,
      ],
      [`k1:${good},k1:${key()}`, `${NAME}: the key id k1 is given twice.`],
      [`k1:${good.slice(1)}`, `${NAME}: the key k1 is not 32 bytes in base64url.`],
      [
        `k1:${randomBytes(16).toString('base64url')}`,
        `${NAME}: the key k1 is not 32 bytes in base64url.`,
      ],
      [
        `k1:${randomBytes(32).toString('base64')}=`,
        `${NAME}: the key k1 is not 32 bytes in base64url.`,
      ],
      [`k1:${good} `, `${NAME}: the key k1 is not 32 bytes in base64url.`],
      [`k2:${good},k1:${good}`, `${NAME}: the key k1 is the same as an earlier key.`],
      [
        Array.from({ length: 17 }, (_, i) => `k${String(i)}:${key()}`).join(','),
        `${NAME} has more than 16 keys.`,
      ],
    ];

    for (const [text, message] of cases) {
      expect(() => parseKeyring(text, NAME)).toThrow(new RangeError(message));
      try {
        parseKeyring(text, NAME);
      } catch (error) {
        expect(String(error)).not.toContain(good);
      }
    }
  });

  it('a keyring needs a key, and the keys of a keyring are only in one made by parseKeyring', () => {
    expect(() => new Keyring(NAME, new Map())).toThrow(new RangeError(`${NAME} has no key.`));
    const fake = { name: NAME, ids: ['k1'], currentId: 'k1' } as unknown as Keyring;
    expect(() => keyOf(fake, 'k1')).toThrow('The keys must be a keyring from parseKeyring.');
    const made = new Keyring(NAME, new Map([['k1', createSecretKey(randomBytes(32))]]));
    expect(made.currentId).toBe('k1');
  });

  it('newKeyText makes a key a keyring takes, different every time', () => {
    const first = newKeyText('k3');
    const second = newKeyText('k3');

    expect(first).toMatch(/^k3:[A-Za-z0-9_-]{43}$/);
    expect(first).not.toBe(second);
    expect(parseKeyring(`${first},${newKeyText('k2')}`, NAME).ids).toEqual(['k3', 'k2']);
    expect(() => newKeyText('K3')).toThrow(
      new RangeError('A key id is small letters and digits, up to 16.'),
    );
  });

  it('CR-41, SR-077: in a service config, a bad keyring stops the boot by its key name, without the value', () => {
    const config = defineConfig({ service: 'identity', keys: { [NAME]: keyringSchema(NAME) } });
    const secret = key();

    const good = parseConfig(config, { [NAME]: `k1:${secret}` }, 'file');
    expect(good[NAME]).toBeInstanceOf(Keyring);
    expect(good[NAME].currentId).toBe('k1');

    expect(() => parseConfig(config, { [NAME]: `k1:${secret},k1:${key()}` }, 'file')).toThrow(
      `${NAME}: the key id k1 is given twice.`,
    );
    try {
      parseConfig(config, { [NAME]: `k1:${secret.slice(2)}` }, 'file');
      expect.unreachable();
    } catch (error) {
      expect(String(error)).toContain(`${NAME}: the key k1 is not 32 bytes in base64url.`);
      expect(String(error)).not.toContain(secret.slice(2));
    }
    expect(keyringSchema(NAME).safeParse(7).error?.issues[0]?.message).toBe(`${NAME} is required.`);
  });
});
