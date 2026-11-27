import {
  createDecipheriv,
  createPrivateKey,
  createPublicKey,
  diffieHellman,
  generateKeyPairSync,
  type KeyObject,
} from 'node:crypto';
import { inspect } from 'node:util';

import { checkService, recordContext, type RecordPlace } from './context.ts';
import { CryptoError } from './errors.ts';
import { KEY_ID } from './keyring.ts';
import { rawPublicKey, SEAL_IV_BYTES, SEAL_TAG_BYTES, SEAL_VERSION, sealKey } from './sealing.ts';
import { fromBase64url, toBase64url } from './utils/base64url.ts';

// `@beautinique/backend-crypto/break-glass`: opening a held copy, and making the key pair. Only the
// owner's laptop imports it, in the break-glass command (docs/ARCHITECTURE.md §10.3 rule 4,
// SR-097, D-399): a service imports the package's main entry, which has no way to open a copy,
// and its config never has the private key.

const RAW_KEY_BYTES = 32;

interface PrivateHalf {
  key: KeyObject;
  /** The raw public key it belongs to, part of every copy's key. */
  recipient: Buffer;
}

const privateHalves = new WeakMap<OpeningKey, PrivateHalf>();

/** The private key that opens the copies sealed with one sealing key. It never is on a server. */
export class OpeningKey {
  /** The id of the sealing key it belongs to. */
  readonly id: string;

  constructor(id: string, key: KeyObject) {
    if (key.type !== 'private' || key.asymmetricKeyType !== 'x25519') {
      throw new RangeError(`The opening key ${id} is not an X25519 private key.`);
    }
    this.id = id;
    privateHalves.set(this, { key, recipient: rawPublicKey(key) });
    Object.freeze(this);
  }

  toJSON(): { id: string } {
    return { id: this.id };
  }

  [inspect.custom](): string {
    return `OpeningKey(${this.id})`;
  }
}

/**
 * A new key pair for sealing, as config texts: `publicKey` (`<id>:<SPKI DER in base64url>`) goes
 * in the service's live config, and `privateKey` (`<id>:<PKCS#8 DER in base64url>`) only in the
 * password manager and the offline copy (D-399).
 */
export function generateSealingKeyPair(id: string): { publicKey: string; privateKey: string } {
  if (!KEY_ID.test(id)) throw new RangeError('A key id is small letters and digits, up to 16.');
  const pair = generateKeyPairSync('x25519');
  const publicDer = pair.publicKey.export({ format: 'der', type: 'spki' });
  const privateDer = pair.privateKey.export({ format: 'der', type: 'pkcs8' });
  return {
    publicKey: `${id}:${toBase64url(publicDer)}`,
    privateKey: `${id}:${toBase64url(privateDer)}`,
  };
}

/** The opening key from its text, `<id>:<PKCS#8 DER in base64url>`. The message never has the key. */
export function parseOpeningKey(text: unknown): OpeningKey {
  if (typeof text !== 'string' || text === '') throw new RangeError('The opening key is empty.');
  const colon = text.indexOf(':');
  if (colon < 1) throw new RangeError('The opening key is not <id>:<private key>.');
  const id = text.slice(0, colon);
  if (!KEY_ID.test(id)) {
    throw new RangeError(
      'The opening key has an id that is not small letters and digits, up to 16.',
    );
  }
  const der = fromBase64url(text.slice(colon + 1));
  if (der === undefined) throw new RangeError(`The opening key ${id} is not in base64url.`);
  let key: KeyObject;
  try {
    key = createPrivateKey({ key: der, format: 'der', type: 'pkcs8' });
  } catch {
    throw new RangeError(`The opening key ${id} is not a private key.`);
  }
  return new OpeningKey(id, key);
}

export interface OpenPlace extends RecordPlace {
  /** The service whose `sealed_records` the copy is in. */
  service: string;
}

interface ParsedCopy {
  keyId: string;
  ephemeral: Buffer;
  iv: Buffer;
  ciphertext: Buffer;
  tag: Buffer;
}

function parseCopy(sealed: unknown): ParsedCopy | undefined {
  if (typeof sealed !== 'string') return undefined;
  const parts = sealed.split('.');
  if (parts.length !== 6 || parts[0] !== SEAL_VERSION) return undefined;
  const [, keyId = '', ephemeralText = '', ivText = '', ciphertextText = '', tagText = ''] = parts;
  const ephemeral = fromBase64url(ephemeralText);
  const iv = fromBase64url(ivText);
  const ciphertext = fromBase64url(ciphertextText);
  const tag = fromBase64url(tagText);
  if (
    !KEY_ID.test(keyId) ||
    ephemeral?.length !== RAW_KEY_BYTES ||
    iv?.length !== SEAL_IV_BYTES ||
    tag?.length !== SEAL_TAG_BYTES ||
    ciphertext === undefined
  ) {
    return undefined;
  }
  return { keyId, ephemeral, iv, ciphertext, tag };
}

/**
 * The fields of a held copy, opened with its private key: only from the break-glass command, with
 * the Master's grant and a reason, and audited (SR-097). A copy that was changed, is of another
 * record or service, or is sealed with another key is a `CryptoError`.
 */
export function openSealed(
  sealed: string,
  key: OpeningKey,
  place: OpenPlace,
): Record<string, unknown> {
  const context = recordContext(checkService(place.service), place);
  const half = privateHalves.get(key);
  if (half === undefined)
    throw new RangeError('The key must be an opening key from parseOpeningKey.');
  const copy = parseCopy(sealed);
  if (copy === undefined)
    throw new CryptoError(`The held copy of ${context} is not a sealed copy.`);
  if (copy.keyId !== key.id) {
    throw new CryptoError(
      `The held copy of ${context} is sealed with the key ${copy.keyId}, not ${key.id}.`,
    );
  }
  try {
    const ephemeralKey = createPublicKey({
      key: { kty: 'OKP', crv: 'X25519', x: toBase64url(copy.ephemeral) },
      format: 'jwk',
    });
    const shared = diffieHellman({ privateKey: half.key, publicKey: ephemeralKey });
    const aesKey = sealKey(shared, copy.ephemeral, half.recipient, copy.keyId);
    shared.fill(0);
    const decipher = createDecipheriv('aes-256-gcm', aesKey, copy.iv, {
      authTagLength: SEAL_TAG_BYTES,
    });
    decipher.setAAD(Buffer.from(context, 'utf8'));
    decipher.setAuthTag(copy.tag);
    const json = Buffer.concat([decipher.update(copy.ciphertext), decipher.final()]);
    aesKey.fill(0);
    return JSON.parse(json.toString('utf8')) as Record<string, unknown>;
  } catch {
    throw new CryptoError(
      `Could not open the held copy of ${context}: it was changed, or is of another record.`,
    );
  }
}
