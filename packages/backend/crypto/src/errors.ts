/**
 * A stored value that could not be opened: not in this package's form, sealed with a key the
 * config no longer has, or changed, moved to another record or field, or opened with the wrong
 * key. The message names where the value belongs and the key's id, and never the value or a key
 * (docs/security/SECURITY_REQUIREMENTS.md SR-063, SR-077). A service answers it with a 500: it
 * is a fault in the data or the config, never the caller's.
 */
export class CryptoError extends Error {
  override readonly name = 'CryptoError';
}
