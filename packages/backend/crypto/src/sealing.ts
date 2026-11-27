import {
  createCipheriv,
  createPrivateKey,
  createPublicKey,
  diffieHellman,
  generateKeyPairSync,
  hkdfSync,
  randomBytes,
  type KeyObject,
} from 'node:crypto';
import { inspect } from 'node:util';

import { NEVER, string } from 'zod';

import { checkService, recordContext, type RecordPlace } from './context.ts';
import { KEY_ID } from './keyring.ts';
import { fromBase64url, toBase64url } from './utils/base64url.ts';

// The sealed copy of held data (docs/ARCHITECTURE.md §10.3 rule 4, SR-097, D-399): sealed with a
// public key, so the live server can seal and never open. Each copy has a new X25519 key of its
// own; with the service's public key it gives a shared secret, HKDF-SHA256 makes the AES-256-GCM
// key of it, and the record the copy is of is the associated data (D-469). Opening is only in
// `@beautinique/backend-crypto/break-glass`, with the private key that never is on the server.

export const SEAL_VERSION = 's1';
export const SEAL_IV_BYTES = 12;
export const SEAL_TAG_BYTES = 16;
const SEAL_KEY_BYTES = 32;
/** The largest held copy, as JSON in UTF-8 bytes. */
export const MAX_HELD_BYTES = 1024 * 1024;

const PEM_PRIVATE_KEY = /-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----/;
// A part of a text that may be a key in base64 or base64url: long enough for the smallest one.
const BASE64_PART = /^[A-Za-z0-9+/_-]{40,}={0,2}$/;
const PRIVATE_DER_TYPES = ['pkcs8', 'pkcs1', 'sec1'] as const;

function isPrivateKeyDer(bytes: Buffer): boolean {
  return PRIVATE_DER_TYPES.some((type) => {
    try {
      createPrivateKey({ key: bytes, format: 'der', type });
      return true;
    } catch {
      return false;
    }
  });
}

/**
 * Whether a text holds a private key: a PEM one, or a DER one in base64 or base64url, alone or as
 * a part of the text (`h1:<key>`).
 */
export function holdsPrivateKey(text: string): boolean {
  if (PEM_PRIVATE_KEY.test(text)) return true;
  return text
    .split(/[\s,:;]+/)
    .some((part) => BASE64_PART.test(part) && isPrivateKeyDer(Buffer.from(part, 'base64')));
}

/**
 * A rule for a service's config (`@beautinique/backend-config`): any text value that holds a
 * private key stops the process at boot, so a private key put in the live env by mistake is
 * caught (SR-097, D-399). It names the key, never the value.
 */
export function noPrivateKeysRule(): (
  config: Readonly<Record<string, unknown>>,
) => { key: string; message: string }[] {
  return (config) =>
    Object.entries(config)
      .filter(([, value]) => typeof value === 'string' && holdsPrivateKey(value))
      .map(([key]) => ({
        key,
        message: `${key} holds a private key: a live server keeps only public keys (SR-097, D-399).`,
      }));
}

/** The 32 raw bytes of an X25519 key's public half, from the public or the private key. */
export function rawPublicKey(key: KeyObject): Buffer {
  const publicKey = key.type === 'private' ? createPublicKey(key) : key;
  const { x } = publicKey.export({ format: 'jwk' });
  return Buffer.from(String(x), 'base64url');
}

/** The AES-256-GCM key of one copy, from the shared secret and both public keys. */
export function sealKey(
  shared: Buffer,
  ephemeral: Buffer,
  recipient: Buffer,
  keyId: string,
): Buffer {
  const info = `beautinique seal ${SEAL_VERSION} ${keyId}`;
  const salt = Buffer.concat([ephemeral, recipient]);
  return Buffer.from(hkdfSync('sha256', shared, salt, info, SEAL_KEY_BYTES));
}

interface PublicHalf {
  key: KeyObject;
  raw: Buffer;
}

const publicHalves = new WeakMap<SealingKey, PublicHalf>();

/** The public key a service seals with, from its config. It never holds a private key. */
export class SealingKey {
  /** The config key it came from, for messages. */
  readonly name: string;
  /** Its id, in every copy it seals, to know which private key opens it. */
  readonly id: string;

  constructor(name: string, id: string, key: KeyObject) {
    if (key.type !== 'public' || key.asymmetricKeyType !== 'x25519') {
      throw new RangeError(`${name}: the key ${id} is not an X25519 public key.`);
    }
    this.name = name;
    this.id = id;
    publicHalves.set(this, { key, raw: rawPublicKey(key) });
    Object.freeze(this);
  }

  toJSON(): { name: string; id: string } {
    return { name: this.name, id: this.id };
  }

  [inspect.custom](): string {
    return `SealingKey(${this.name}: ${this.id})`;
  }
}

/**
 * The sealing key from its config text, `<id>:<public key>`, the key in DER (SPKI) and base64url,
 * as `generateSealingKeyPair` of the break-glass entry gives it. A private key is refused (the
 * process does not start), and so is anything else wrong; the message never has the value.
 */
export function parseSealingKey(text: unknown, name: string): SealingKey {
  if (typeof text !== 'string' || text === '') throw new RangeError(`${name} is empty.`);
  if (holdsPrivateKey(text)) {
    throw new RangeError(
      `${name} holds a private key: a live server keeps only the public key (SR-097, D-399).`,
    );
  }
  const colon = text.indexOf(':');
  if (colon < 1) throw new RangeError(`${name} is not <id>:<public key>.`);
  const id = text.slice(0, colon);
  if (!KEY_ID.test(id)) {
    throw new RangeError(`${name} has a key id that is not small letters and digits, up to 16.`);
  }
  const der = fromBase64url(text.slice(colon + 1));
  if (der === undefined) throw new RangeError(`${name}: the key ${id} is not in base64url.`);
  let key: KeyObject;
  try {
    key = createPublicKey({ key: der, format: 'der', type: 'spki' });
  } catch {
    throw new RangeError(`${name}: the key ${id} is not a public key.`);
  }
  return new SealingKey(name, id, key);
}

/** The schema of the sealing key in a service's config: `IDENTITY_HOLD_KEY: sealingKeySchema('IDENTITY_HOLD_KEY')`. */
export function sealingKeySchema(name: string) {
  return string(`${name} is required.`).transform((text, ctx) => {
    try {
      return parseSealingKey(text, name);
    } catch (error) {
      // parseSealingKey throws only its own RangeError, whose message names the key and no value.
      ctx.addIssue({ code: 'custom', message: (error as RangeError).message });
      return NEVER;
    }
  });
}

export interface SealerOptions {
  service: string;
  /** The service's `hold` key, from its config. */
  key: SealingKey;
}

export interface Sealer {
  readonly service: string;
  /** The id of the key it seals with. */
  readonly keyId: string;
  /**
   * `s1.<keyId>.<ephemeral key>.<iv>.<ciphertext>.<tag>`: the fields taken out of a record, as
   * JSON, sealed. Two copies of the same fields never look alike.
   */
  seal(fields: Readonly<Record<string, unknown>>, place: RecordPlace): string;
}

/** The sealing of held copies of one service, with its public `hold` key. It cannot open them. */
export function createSealer({ service, key }: SealerOptions): Sealer {
  checkService(service);
  const half = publicHalves.get(key);
  if (half === undefined)
    throw new RangeError('The key must be a sealing key from parseSealingKey.');

  return Object.freeze({
    service,
    keyId: key.id,
    seal(fields: Readonly<Record<string, unknown>>, place: RecordPlace) {
      const context = recordContext(service, place);
      // Checked as what it is at run time: a caller in plain JavaScript may give anything.
      const given: unknown = fields;
      if (
        typeof given !== 'object' ||
        given === null ||
        Array.isArray(given) ||
        Object.keys(given).length === 0
      ) {
        throw new RangeError(
          `The held copy of ${context} must be an object of the fields taken out.`,
        );
      }
      let json: string;
      try {
        json = JSON.stringify(fields);
      } catch {
        throw new RangeError(`The held copy of ${context} is not JSON.`);
      }
      const bytes = Buffer.from(json, 'utf8');
      if (bytes.length > MAX_HELD_BYTES) {
        throw new RangeError(`The held copy of ${context} is more than 1 MB.`);
      }
      const ephemeral = generateKeyPairSync('x25519');
      const ephemeralRaw = rawPublicKey(ephemeral.publicKey);
      const shared = diffieHellman({ privateKey: ephemeral.privateKey, publicKey: half.key });
      const aesKey = sealKey(shared, ephemeralRaw, half.raw, key.id);
      shared.fill(0);
      const iv = randomBytes(SEAL_IV_BYTES);
      const cipher = createCipheriv('aes-256-gcm', aesKey, iv, { authTagLength: SEAL_TAG_BYTES });
      cipher.setAAD(Buffer.from(context, 'utf8'));
      const ciphertext = Buffer.concat([cipher.update(bytes), cipher.final()]);
      aesKey.fill(0);
      return [
        SEAL_VERSION,
        key.id,
        toBase64url(ephemeralRaw),
        toBase64url(iv),
        toBase64url(ciphertext),
        toBase64url(cipher.getAuthTag()),
      ].join('.');
    },
  });
}
