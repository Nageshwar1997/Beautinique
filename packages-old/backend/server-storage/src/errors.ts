/**
 * What can go wrong with a file, in words a module can map to its own response:
 * `INVALID_INPUT` (a wrong id, key, size ...), `NOT_FOUND` (the file is not there), `ALREADY_EXISTS`
 * (a copy would overwrite another asset), `UPLOAD_REFUSED` (the provider turned the upload down:
 * too big, wrong type, ticket expired) and `PROVIDER_ERROR` (the provider failed; try again later).
 */
export type StorageErrorCode =
  'INVALID_INPUT' | 'NOT_FOUND' | 'ALREADY_EXISTS' | 'UPLOAD_REFUSED' | 'PROVIDER_ERROR';

/** A storage problem. The message never holds a secret, a signature or a provider URL. */
export class StorageError extends Error {
  readonly code: StorageErrorCode;

  constructor(code: StorageErrorCode, message: string, options: { cause?: unknown } = {}) {
    super(message, options);
    this.name = 'StorageError';
    this.code = code;
  }
}
