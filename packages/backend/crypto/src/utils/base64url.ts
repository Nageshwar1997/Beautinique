// Base64url without padding, the encoding of every part of this package's text forms.

const ALPHABET = /^[A-Za-z0-9_-]*$/;

export function toBase64url(bytes: Uint8Array): string {
  return Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).toString('base64url');
}

/**
 * The bytes of a base64url text, or `undefined` when it is not one. Node's own decoder skips what
 * it does not know and takes padding, so a text is taken only when it is made of the alphabet and
 * encodes back to itself: one value has one text, and a changed character is never ignored.
 */
export function fromBase64url(text: string): Buffer | undefined {
  if (!ALPHABET.test(text)) return undefined;
  const bytes = Buffer.from(text, 'base64url');
  return bytes.toString('base64url') === text ? bytes : undefined;
}
