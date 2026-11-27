import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

import { checkService, fieldContext, fieldPath, type FieldPlace } from './context.ts';
import { CryptoError } from './errors.ts';
import { currentKeyOf, KEY_ID, keyOf, type Keyring } from './keyring.ts';
import { fromBase64url, toBase64url } from './utils/base64url.ts';

// Field encryption (docs/ARCHITECTURE.md §10.3 rule 5, SR-063): AES-256-GCM, a new random 96-bit
// IV for every value, and the place of the value as associated data, so a value copied to another
// record, field, collection or service does not open.

const VERSION = 'v1';
const ALGORITHM = 'aes-256-gcm';
const IV_BYTES = 12;
const TAG_BYTES = 16;
/** The longest value a field takes, in UTF-8 bytes. */
export const MAX_FIELD_BYTES = 64 * 1024;

export interface FieldCipherOptions {
  service: string;
  /** The service's `field` keyring, from its config. */
  keys: Keyring;
}

export interface FieldCipher {
  readonly service: string;
  /** `v1.<keyId>.<iv>.<ciphertext>.<tag>`, made with the current key. */
  encrypt(plaintext: string, place: FieldPlace): string;
  /** The plaintext, or a `CryptoError` when the value is not this place's. */
  decrypt(value: string, place: FieldPlace): string;
  /** Whether a value is made with the current key: one that is not needs `rotate`. */
  isCurrent(value: string): boolean;
  /** The value made with the current key; a current value is given back as it is. */
  rotate(value: string, place: FieldPlace): string;
  /** What a value made with an old key starts with (`v1.k1.`), to find the records to rotate. */
  readonly stalePrefixes: readonly string[];
}

interface Parsed {
  keyId: string;
  iv: Buffer;
  ciphertext: Buffer;
  tag: Buffer;
}

function parse(value: unknown): Parsed | undefined {
  if (typeof value !== 'string') return undefined;
  const parts = value.split('.');
  if (parts.length !== 5 || parts[0] !== VERSION) return undefined;
  const [, keyId = '', ivText = '', ciphertextText = '', tagText = ''] = parts;
  if (!KEY_ID.test(keyId)) return undefined;
  const iv = fromBase64url(ivText);
  const ciphertext = fromBase64url(ciphertextText);
  const tag = fromBase64url(tagText);
  if (iv?.length !== IV_BYTES || tag?.length !== TAG_BYTES || ciphertext === undefined) {
    return undefined;
  }
  return { keyId, iv, ciphertext, tag };
}

/** The field encryption of one service, with its `field` keyring (SR-063). */
export function createFieldCipher({ service, keys }: FieldCipherOptions): FieldCipher {
  checkService(service);
  const currentKey = currentKeyOf(keys);
  const currentId = keys.currentId;

  const encrypt = (plaintext: string, place: FieldPlace): string => {
    const context = fieldContext(service, place);
    const path = fieldPath(service, place);
    if (typeof plaintext !== 'string') {
      throw new RangeError(`The value of ${path} must be a string.`);
    }
    if (!plaintext.isWellFormed()) {
      throw new RangeError(`The value of ${path} has a broken character (a lone surrogate).`);
    }
    const bytes = Buffer.from(plaintext, 'utf8');
    if (bytes.length > MAX_FIELD_BYTES) {
      throw new RangeError(`The value of ${path} is more than 64 KB.`);
    }
    const iv = randomBytes(IV_BYTES);
    const cipher = createCipheriv(ALGORITHM, currentKey, iv, { authTagLength: TAG_BYTES });
    cipher.setAAD(Buffer.from(context, 'utf8'));
    const ciphertext = Buffer.concat([cipher.update(bytes), cipher.final()]);
    const tag = cipher.getAuthTag();
    return [VERSION, currentId, toBase64url(iv), toBase64url(ciphertext), toBase64url(tag)].join(
      '.',
    );
  };

  const decrypt = (value: string, place: FieldPlace): string => {
    const context = fieldContext(service, place);
    const path = fieldPath(service, place);
    const parsed = parse(value);
    if (parsed === undefined) throw new CryptoError(`${path} is not an encrypted value.`);
    const key = keyOf(keys, parsed.keyId);
    if (key === undefined) {
      throw new CryptoError(
        `${path} is encrypted with the key ${parsed.keyId}, which ${keys.name} does not have.`,
      );
    }
    const decipher = createDecipheriv(ALGORITHM, key, parsed.iv, { authTagLength: TAG_BYTES });
    decipher.setAAD(Buffer.from(context, 'utf8'));
    decipher.setAuthTag(parsed.tag);
    try {
      return Buffer.concat([decipher.update(parsed.ciphertext), decipher.final()]).toString('utf8');
    } catch {
      throw new CryptoError(
        `Could not open ${path}: the value was changed, or is of another record or field.`,
      );
    }
  };

  return Object.freeze({
    service,
    encrypt,
    decrypt,
    isCurrent: (value: string) => parse(value)?.keyId === currentId,
    rotate(value: string, place: FieldPlace) {
      if (parse(value)?.keyId === currentId) return value;
      return encrypt(decrypt(value, place), place);
    },
    stalePrefixes: Object.freeze(keys.ids.slice(1).map((id) => `${VERSION}.${id}.`)),
  });
}
