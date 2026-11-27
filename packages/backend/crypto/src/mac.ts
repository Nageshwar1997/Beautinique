import { createHmac, type KeyObject } from 'node:crypto';

import { KEY_ID } from './keyring.ts';
import { fromBase64url } from './utils/base64url.ts';

// The HMAC-SHA256 that blind indexes and code hashes share. What it is for (`blind`, `code`) and
// the context go in first, each ended by a NUL that no context has, so one key gives unrelated
// MACs for an index and a code, and for two fields (docs/ARCHITECTURE.md §10.3 rules 6 and 7).

const MAC_BYTES = 32;
/** The longest value a blind index or a code hash takes, in UTF-8 bytes. */
export const MAX_MAC_INPUT_BYTES = 64 * 1024;

export function mac(key: KeyObject, purpose: string, context: string, value: string): Buffer {
  return createHmac('sha256', key)
    .update(`${purpose}\u0000${context}\u0000`, 'utf8')
    .update(value, 'utf8')
    .digest();
}

/** `<version>.<keyId>.<mac>` back into its parts, or `undefined` when it is not one. */
export function parseMac(
  text: unknown,
  version: string,
): { keyId: string; mac: Buffer } | undefined {
  if (typeof text !== 'string') return undefined;
  const parts = text.split('.');
  if (parts.length !== 3 || parts[0] !== version) return undefined;
  const [, keyId = '', macText = ''] = parts;
  if (!KEY_ID.test(keyId)) return undefined;
  const bytes = fromBase64url(macText);
  return bytes?.length === MAC_BYTES ? { keyId, mac: bytes } : undefined;
}

/** Why a value cannot be MACed, or `undefined` when it can. */
export function textProblem(value: unknown): string | undefined {
  if (typeof value !== 'string') return 'must be a string';
  if (value === '') return 'is empty';
  if (!value.isWellFormed()) return 'has a broken character (a lone surrogate)';
  if (Buffer.byteLength(value, 'utf8') > MAX_MAC_INPUT_BYTES) return 'is more than 64 KB';
  return undefined;
}
