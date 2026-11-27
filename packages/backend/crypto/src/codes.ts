import { createHash, timingSafeEqual } from 'node:crypto';

import { checkService, codeContext } from './context.ts';
import { currentKeyOf, keyOf, type Keyring } from './keyring.ts';
import { mac, parseMac, textProblem } from './mac.ts';
import { toBase64url } from './utils/base64url.ts';

// Codes and tokens are kept only as hashes (docs/ARCHITECTURE.md §10.3 rule 7, SR-063). A short
// code (a six-digit OTP has a million values, a recovery code a few more) is HMAC-SHA256 with the
// service's `blind` keyring and what the code is for, so a copy of the database alone does not
// give the codes back, and a hash of one challenge does not open another (D-469). A token of 128
// random bits or more (an invite link's) is plain SHA-256, so the hash finds its record.

const VERSION = 'c1';
const PURPOSE = 'code';
const MIN_TOKEN_LENGTH = 22;
const MAX_TOKEN_LENGTH = 1024;

/** What a code is for: `{ purpose: 'otp', ref: challengeId }`, `{ purpose: 'recovery_code', ref: accountId }`. */
export interface CodePlace {
  purpose: string;
  ref: string;
}

export interface CodeHasherOptions {
  service: string;
  /** The service's `blind` keyring, from its config. */
  keys: Keyring;
}

export interface CodeHasher {
  readonly service: string;
  /** `c1.<keyId>.<mac>` with the current key: what is stored instead of the code. */
  hash(code: string, place: CodePlace): string;
  /**
   * Whether a code someone typed is the one of a stored hash, compared in constant time. Anything
   * wrong in what they typed, or a hash of a key the keyring no longer has, is `false`, never an
   * error: a hash made with an old key is still checked while its key is in the keyring.
   */
  verify(code: unknown, hashed: string, place: CodePlace): boolean;
  /** Whether a hash is made with the current key. */
  isCurrent(hashed: string): boolean;
}

/** The code hashes of one service, with its `blind` keyring. */
export function createCodeHasher({ service, keys }: CodeHasherOptions): CodeHasher {
  checkService(service);
  const currentKey = currentKeyOf(keys);
  const currentId = keys.currentId;

  return Object.freeze({
    service,
    hash(code: string, place: CodePlace) {
      const context = codeContext(service, place.purpose, place.ref);
      const problem = textProblem(code);
      if (problem !== undefined) throw new RangeError(`The code of ${context} ${problem}.`);
      return `${VERSION}.${currentId}.${toBase64url(mac(currentKey, PURPOSE, context, code))}`;
    },
    verify(code: unknown, hashed: string, place: CodePlace) {
      const context = codeContext(service, place.purpose, place.ref);
      if (textProblem(code) !== undefined) return false;
      const parsed = parseMac(hashed, VERSION);
      const key = parsed === undefined ? undefined : keyOf(keys, parsed.keyId);
      if (parsed === undefined || key === undefined) return false;
      return timingSafeEqual(mac(key, PURPOSE, context, code as string), parsed.mac);
    },
    isCurrent: (hashed: string) => parseMac(hashed, VERSION)?.keyId === currentId,
  });
}

/**
 * The SHA-256 of a random token (an invite link's), in base64url: stored instead of the token, and
 * looked up by. Only for tokens of 128 random bits or more, like `randomToken()`: a shorter text
 * is a `RangeError`, so a route checks the length first.
 */
export function hashToken(token: string): string {
  if (
    typeof token !== 'string' ||
    token.length < MIN_TOKEN_LENGTH ||
    token.length > MAX_TOKEN_LENGTH
  ) {
    throw new RangeError(
      `A token is ${String(MIN_TOKEN_LENGTH)} to ${String(MAX_TOKEN_LENGTH)} characters: 128 random bits or more, like randomToken().`,
    );
  }
  return createHash('sha256').update(token, 'utf8').digest('base64url');
}
