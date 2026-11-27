/**
 * What went wrong at the media provider or the object storage, in this package's words, so a
 * service answers it the same way whichever provider is behind the port:
 * - `not_found`: no such file.
 * - `expired`: a signed upload or URL used after its time.
 * - `bad_signature`: a signed upload or URL changed, or not signed at all.
 * - `rejected_type`: the file's bytes are not a type the upload allows.
 * - `retention`: a file in the `hold` bucket removed or replaced before its retention ends.
 * - `unavailable`: the provider is down or answered with a 5xx; worth trying again later.
 *
 * The message never holds a key, a signature or a signed URL (docs/ARCHITECTURE.md §8 rule 3).
 */
export type MediaErrorKind =
  'not_found' | 'expired' | 'bad_signature' | 'rejected_type' | 'retention' | 'unavailable';

export class MediaError extends Error {
  override readonly name = 'MediaError';
  readonly kind: MediaErrorKind;

  constructor(kind: MediaErrorKind, message: string) {
    super(message);
    this.kind = kind;
  }
}
