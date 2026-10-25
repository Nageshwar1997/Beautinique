import { createCipheriv, createDecipheriv, createHmac, randomBytes } from 'node:crypto';

import { CryptoError, type CryptoKeys } from './keys';

/** The sealed format's version: `v1.<keyId>.<iv>.<ciphertext>.<tag>`, parts in base64url. */
const VERSION = 'v1';
const IV_BYTES = 12;
const TAG_BYTES = 16;

function checkContext(context: string): void {
  if (context.trim() === '') {
    throw new CryptoError('A context is required, e.g. "sellers.bankAccount:<id>"');
  }
}

/**
 * Seals a value with AES-256-GCM and the current key. `context` (e.g. `sellers.bankAccount:<id>`)
 * is bound in as associated data: a sealed value copied to another record or field does not open.
 * Every call uses a fresh random IV, so equal values seal differently.
 */
export function encryptField(keys: CryptoKeys, plaintext: string, context: string): string {
  checkContext(context);
  const keyId = keys.encryption.current;
  const key = keys.encryption.keys.get(keyId);
  if (!key) throw new CryptoError(`The current key ${keyId} is missing`);
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv('aes-256-gcm', key, iv, { authTagLength: TAG_BYTES });
  cipher.setAAD(Buffer.from(context, 'utf8'));
  const data = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [VERSION, keyId, iv, data, tag]
    .map((part) => (typeof part === 'string' ? part : part.toString('base64url')))
    .join('.');
}

interface Sealed {
  keyId: string;
  iv: Buffer;
  data: Buffer;
  tag: Buffer;
}

function parseSealed(sealed: string): Sealed {
  const parts = sealed.split('.');
  const [version, keyId, iv, data, tag] = parts;
  if (
    parts.length !== 5 ||
    version !== VERSION ||
    !keyId ||
    iv === undefined ||
    data === undefined ||
    tag === undefined
  ) {
    throw new CryptoError('Not a sealed value (expected v1.<key>.<iv>.<data>.<tag>)');
  }
  return {
    keyId,
    iv: Buffer.from(iv, 'base64url'),
    data: Buffer.from(data, 'base64url'),
    tag: Buffer.from(tag, 'base64url'),
  };
}

/**
 * Opens a sealed value with the key it names and the same context it was sealed with. A wrong
 * context, a changed byte or a wrong key all fail the same way, without saying which.
 */
export function decryptField(keys: CryptoKeys, sealed: string, context: string): string {
  checkContext(context);
  const { keyId, iv, data, tag } = parseSealed(sealed);
  const key = keys.encryption.keys.get(keyId);
  if (!key)
    throw new CryptoError(`Sealed with key ${keyId}, which is not configured (rotated out?)`);
  if (iv.length !== IV_BYTES || tag.length !== TAG_BYTES) {
    throw new CryptoError(
      'Could not open the sealed value: wrong key, wrong context or changed data',
    );
  }
  try {
    const decipher = createDecipheriv('aes-256-gcm', key, iv, { authTagLength: TAG_BYTES });
    decipher.setAAD(Buffer.from(context, 'utf8'));
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
  } catch (error) {
    throw new CryptoError(
      'Could not open the sealed value: wrong key, wrong context or changed data',
      { cause: error },
    );
  }
}

/** True when a value was sealed with an older key: a re-encrypt job should seal it again. */
export function needsReencrypt(keys: CryptoKeys, sealed: string): boolean {
  return parseSealed(sealed).keyId !== keys.encryption.current;
}

/**
 * A searchable stand-in for an encrypted value: HMAC-SHA256 over the field name and the value, so
 * equal values in one field match (find a seller by PAN) but the same value in two fields does
 * not, and nothing can be read back. Normalise first (PAN upper case, account number digits only):
 * the index matches exact input only.
 */
export function blindIndex(keys: CryptoKeys, field: string, normalized: string): string {
  if (field.trim() === '') throw new CryptoError('A field name is required for a blind index');
  const mac = createHmac('sha256', keys.blindIndex.key)
    .update(field, 'utf8')
    .update('\0')
    .update(normalized, 'utf8')
    .digest('base64url');
  return `${keys.blindIndex.id}.${mac}`;
}

/** `XXXXXX1234`: the last `visible` characters, the rest hidden (for screens and support). */
export function maskTail(value: string, visible = 4): string {
  if (value.length <= visible) return 'X'.repeat(value.length);
  return `${'X'.repeat(value.length - visible)}${value.slice(-visible)}`;
}

/** How a personal field is stored: sealed, searchable, and a masked copy to show. */
export interface SealedPii {
  enc: string;
  idx: string;
  masked: string;
}

/**
 * Seals a personal field (PAN, bank account, DL, RC) the way ARCHITECTURE §6.5 asks: encrypted,
 * a blind index for lookups, and a masked copy for display. `normalize` runs first, so the index
 * and the mask match however the value was typed.
 */
export function sealPii(
  keys: CryptoKeys,
  value: string,
  {
    field,
    context,
    normalize = (raw) => raw,
    visible = 4,
  }: { field: string; context: string; normalize?: (raw: string) => string; visible?: number },
): SealedPii {
  const normalized = normalize(value);
  return {
    enc: encryptField(keys, normalized, context),
    idx: blindIndex(keys, field, normalized),
    masked: maskTail(normalized, visible),
  };
}
