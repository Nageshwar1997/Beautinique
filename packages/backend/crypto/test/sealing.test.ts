import { generateKeyPairSync, randomBytes } from 'node:crypto';
import { inspect } from 'node:util';

import { defineConfig, parseConfig } from '@beautinique/backend-config';
import { describe, expect, it } from 'vitest';
import { string } from 'zod';

import {
  generateSealingKeyPair,
  openSealed,
  parseOpeningKey,
  type OpeningKey,
} from '../src/break-glass.ts';
import { CryptoError } from '../src/errors.ts';
import * as mainEntry from '../src/index.ts';
import {
  createSealer,
  holdsPrivateKey,
  MAX_HELD_BYTES,
  noPrivateKeysRule,
  parseSealingKey,
  SealingKey,
  sealingKeySchema,
} from '../src/sealing.ts';

const NAME = 'IDENTITY_HOLD_KEY';
const user = { collection: 'users', recordId: '6747a1b2c3d4e5f601234567' };
const fields = {
  name: 'Asha Verma',
  phone: '+919876543210',
  consents: [{ kind: 'marketing', at: '2026-11-01' }],
};

// The laptop's test key pair (SR-097: "round trip with the laptop's test key").
const pair = generateSealingKeyPair('h1');
const sealer = createSealer({ service: 'identity', key: parseSealingKey(pair.publicKey, NAME) });
const opening = parseOpeningKey(pair.privateKey);
const openAt = { service: 'identity', ...user };

/** A copy with one base64url character of one part changed. */
function changed(sealed: string, part: number, at = 0): string {
  const parts = sealed.split('.');
  const text = parts[part] as string;
  parts[part] = text.slice(0, at) + (text[at] === 'A' ? 'B' : 'A') + text.slice(at + 1);
  return parts.join('.');
}

describe('the sealed copy of held data (docs/ARCHITECTURE.md §10.3 rule 4, SR-097, D-399)', () => {
  it('SR-097: a copy sealed with the public key opens with the test private key, as it was', () => {
    const sealed = sealer.seal(fields, user);

    expect(sealed).toMatch(
      /^s1\.h1\.[A-Za-z0-9_-]{43}\.[A-Za-z0-9_-]{16}\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]{22}$/,
    );
    expect(openSealed(sealed, opening, openAt)).toEqual(fields);
    expect(sealer.keyId).toBe('h1');
    expect(sealer.service).toBe('identity');
  });

  it('SR-097: the copy has none of the data in the clear, and two copies of the same data differ', () => {
    const first = sealer.seal(fields, user);
    const second = sealer.seal(fields, user);

    expect(first).not.toBe(second);
    expect(first.split('.')[2]).not.toBe(second.split('.')[2]);
    for (const text of ['Asha', 'Verma', '9876543210', 'marketing']) {
      expect(first).not.toContain(text);
      expect(first).not.toContain(Buffer.from(text).toString('base64url').slice(0, 5));
    }
  });

  it('SR-097: the service cannot open a copy: its entry has no way to, and its sealer only seals', () => {
    const exported = Object.keys(mainEntry);

    expect(exported).not.toContain('openSealed');
    expect(exported).not.toContain('parseOpeningKey');
    expect(exported).not.toContain('generateSealingKeyPair');
    expect(Object.keys(sealer).sort()).toEqual(['keyId', 'seal', 'service']);
    // Its config key is public: SPKI, and the private key does not come out of it.
    const key = parseSealingKey(pair.publicKey, NAME);
    expect(JSON.stringify(key)).toBe(`{"name":"${NAME}","id":"h1"}`);
    expect(inspect(key)).toBe(`SealingKey(${NAME}: h1)`);
  });

  it('SR-097: a private key in the live config stops the boot, by its key name and without the value', () => {
    const config = defineConfig({
      service: 'identity',
      keys: { [NAME]: sealingKeySchema(NAME) },
      rules: [noPrivateKeysRule()],
    });

    expect(parseConfig(config, { [NAME]: pair.publicKey }, 'file')[NAME]).toBeInstanceOf(
      SealingKey,
    );
    try {
      parseConfig(config, { [NAME]: pair.privateKey }, 'file');
      expect.unreachable();
    } catch (error) {
      expect(String(error)).toContain(
        `${NAME} holds a private key: a live server keeps only the public key (SR-097, D-399).`,
      );
      expect(String(error)).not.toContain(pair.privateKey.slice(3, 30));
    }
  });

  it('SR-097: a private key in any other text key of the config stops the boot too', () => {
    const OTHER = 'IDENTITY_SIGNING_SECRET';
    const config = defineConfig({
      service: 'identity',
      keys: { [OTHER]: string(`${OTHER} is required.`) },
      rules: [noPrivateKeysRule()],
    });
    const pem = generateKeyPairSync('ec', { namedCurve: 'P-256' }).privateKey.export({
      format: 'pem',
      type: 'pkcs8',
    });
    const rsa = generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey.export({
      format: 'der',
      type: 'pkcs1',
    });
    const ec = generateKeyPairSync('ec', { namedCurve: 'P-256' }).privateKey.export({
      format: 'der',
      type: 'sec1',
    });
    const holding = [
      pair.privateKey,
      pair.privateKey.slice(3),
      String(pem),
      rsa.toString('base64'),
      `x:${ec.toString('base64url')}`,
    ];
    for (const value of holding) {
      expect(() => parseConfig(config, { [OTHER]: value }, 'file')).toThrow(
        `${OTHER} holds a private key: a live server keeps only public keys (SR-097, D-399).`,
      );
    }
    const notKeys = [
      pair.publicKey,
      'a plain secret of 40 characters or more....',
      'short',
      randomBytes(48).toString('base64url'),
    ];
    for (const value of notKeys) {
      expect(holdsPrivateKey(value)).toBe(false);
      expect(parseConfig(config, { [OTHER]: value }, 'file')[OTHER]).toBe(value);
    }
    expect(
      noPrivateKeysRule()({ [OTHER]: 42, [NAME]: parseSealingKey(pair.publicKey, NAME) }),
    ).toEqual([]);
  });

  it('a sealing key that is not an X25519 public key in <id>:<base64url> is refused, never with the value', () => {
    const rsaPublic = generateKeyPairSync('rsa', { modulusLength: 2048 }).publicKey.export({
      format: 'der',
      type: 'spki',
    });
    const cases: [unknown, string][] = [
      ['', `${NAME} is empty.`],
      [undefined, `${NAME} is empty.`],
      [pair.publicKey.slice(3), `${NAME} is not <id>:<public key>.`],
      [
        `H1${pair.publicKey.slice(2)}`,
        `${NAME} has a key id that is not small letters and digits, up to 16.`,
      ],
      [`${pair.publicKey}=`, `${NAME}: the key h1 is not in base64url.`],
      ['h1:AAAA', `${NAME}: the key h1 is not a public key.`],
      [`h1:${rsaPublic.toString('base64url')}`, `${NAME}: the key h1 is not an X25519 public key.`],
    ];
    for (const [text, message] of cases) {
      expect(() => parseSealingKey(text, NAME)).toThrow(new RangeError(message));
    }
    expect(sealingKeySchema(NAME).safeParse(1).error?.issues[0]?.message).toBe(
      `${NAME} is required.`,
    );
    const fake = { name: NAME, id: 'h1' } as unknown as SealingKey;
    expect(() => createSealer({ service: 'identity', key: fake })).toThrow(
      'The key must be a sealing key from parseSealingKey.',
    );
  });

  it('SR-097: a copy that was changed, is of another record or service, or meets another key does not open', () => {
    const sealed = sealer.seal(fields, user);
    for (const part of [2, 3, 4, 5]) {
      expect(() => openSealed(changed(sealed, part), opening, openAt)).toThrow(CryptoError);
    }
    expect(() =>
      openSealed(sealed, opening, { ...openAt, recordId: '6747a1b2c3d4e5f601234568' }),
    ).toThrow(
      new CryptoError(
        'Could not open the held copy of identity.users:6747a1b2c3d4e5f601234568: it was changed, or is of another record.',
      ),
    );
    expect(() => openSealed(sealed, opening, { ...openAt, collection: 'devices' })).toThrow(
      CryptoError,
    );
    expect(() => openSealed(sealed, opening, { ...openAt, service: 'commerce' })).toThrow(
      CryptoError,
    );

    const otherPair = generateSealingKeyPair('h1');
    expect(() => openSealed(sealed, parseOpeningKey(otherPair.privateKey), openAt)).toThrow(
      CryptoError,
    );
    const h2 = parseOpeningKey(generateSealingKeyPair('h2').privateKey);
    expect(() => openSealed(sealed, h2, openAt)).toThrow(
      new CryptoError(
        'The held copy of identity.users:6747a1b2c3d4e5f601234567 is sealed with the key h1, not h2.',
      ),
    );
  });

  it('what is not a sealed copy is refused as one', () => {
    const sealed = sealer.seal(fields, user);
    const parts = sealed.split('.');
    const notCopies = [
      'plain text',
      sealed.replace('s1.', 's2.'),
      [parts[0], 'H1', ...parts.slice(2)].join('.'),
      [...parts.slice(0, 2), 'AAAA', ...parts.slice(3)].join('.'),
      [...parts.slice(0, 3), 'AAAA', ...parts.slice(4)].join('.'),
      [...parts.slice(0, 5), 'AAAA'].join('.'),
      [...parts.slice(0, 4), 'A=', parts[5]].join('.'),
      `${sealed}.x`,
      7,
    ];
    for (const copy of notCopies) {
      expect(() => openSealed(copy as string, opening, openAt)).toThrow(
        new CryptoError(
          'The held copy of identity.users:6747a1b2c3d4e5f601234567 is not a sealed copy.',
        ),
      );
    }
  });

  it('a held copy is an object of fields, as JSON, up to 1 MB', () => {
    const refused = `The held copy of identity.users:${user.recordId} must be an object of the fields taken out.`;
    for (const given of [null, 'Asha', ['Asha'], {}]) {
      expect(() => sealer.seal(given as unknown as Record<string, unknown>, user)).toThrow(
        new RangeError(refused),
      );
    }
    expect(() => sealer.seal({ amount: 10n }, user)).toThrow(
      new RangeError(`The held copy of identity.users:${user.recordId} is not JSON.`),
    );
    const big = { notes: 'a'.repeat(MAX_HELD_BYTES) };
    expect(() => sealer.seal(big, user)).toThrow(
      new RangeError(`The held copy of identity.users:${user.recordId} is more than 1 MB.`),
    );
    const largest = { n: 'a'.repeat(MAX_HELD_BYTES - '{"n":""}'.length) };
    expect(openSealed(sealer.seal(largest, user), opening, openAt)).toEqual(largest);
    expect(() => sealer.seal(fields, { collection: 'users', recordId: 'a.b' })).toThrow(RangeError);
  });
});

describe('the break-glass keys', () => {
  it('generateSealingKeyPair gives a public key the config takes and a private key that opens its copies', () => {
    const made = generateSealingKeyPair('h7');
    expect(made.publicKey).toMatch(/^h7:[A-Za-z0-9_-]+$/);
    expect(made.privateKey).toMatch(/^h7:[A-Za-z0-9_-]+$/);
    expect(holdsPrivateKey(made.privateKey)).toBe(true);
    expect(holdsPrivateKey(made.publicKey)).toBe(false);
    expect(() => generateSealingKeyPair('H7')).toThrow(
      new RangeError('A key id is small letters and digits, up to 16.'),
    );
  });

  it('an opening key is logged by its id only, and anything else as an opening key is refused', () => {
    expect(JSON.stringify(opening)).toBe('{"id":"h1"}');
    expect(inspect(opening)).toBe('OpeningKey(h1)');
    const cases: [unknown, string][] = [
      ['', 'The opening key is empty.'],
      [3, 'The opening key is empty.'],
      [pair.privateKey.slice(3), 'The opening key is not <id>:<private key>.'],
      [
        `H1${pair.privateKey.slice(2)}`,
        'The opening key has an id that is not small letters and digits, up to 16.',
      ],
      [`${pair.privateKey}=`, 'The opening key h1 is not in base64url.'],
      [pair.publicKey, 'The opening key h1 is not a private key.'],
    ];
    for (const [text, message] of cases) {
      expect(() => parseOpeningKey(text)).toThrow(new RangeError(message));
    }
    const ec = generateKeyPairSync('ec', { namedCurve: 'P-256' }).privateKey.export({
      format: 'der',
      type: 'pkcs8',
    });
    expect(() => parseOpeningKey(`h1:${ec.toString('base64url')}`)).toThrow(
      new RangeError('The opening key h1 is not an X25519 private key.'),
    );
    const fake = { id: 'h1' } as unknown as OpeningKey;
    expect(() => openSealed(sealer.seal(fields, user), fake, openAt)).toThrow(
      'The key must be an opening key from parseOpeningKey.',
    );
  });
});
