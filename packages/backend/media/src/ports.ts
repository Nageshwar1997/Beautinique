import type { ImageType } from './file-type.ts';

// The two ports of the media service (docs/ARCHITECTURE.md §7, D-284, D-420). Only the media
// service holds a provider's keys (SR-071); other services ask it, never the provider. Every
// method that reaches the provider can fail with a `MediaError`, `unavailable` when it is down.

/** What the media service asks the provider to sign for one public or review image (SR-096). */
export interface SignUploadRequest {
  /** Random and chosen by the media service, never a user's file name. */
  publicId: string;
  /** The folder of the file's purpose, such as `products` or `reviews`. */
  folder: string;
  /** The image types this upload takes; the provider refuses any other. */
  types: readonly ImageType[];
  /** When the signature stops working, at most `UPLOAD_URL_TTL_SECONDS` from now. */
  expiresAt: Date;
}

/** What the client sends the file to: the provider's URL and the signed form fields. */
export interface SignedUpload {
  url: string;
  /** Sent with the file as they are; `signature` covers all the others. */
  fields: Readonly<Record<string, string>>;
  expiresAt: Date;
}

/**
 * An image as the provider keeps it. The provider takes a file of any size, so the media service
 * checks `bytes` against `MAX_UPLOAD_BYTES.image` here, after the upload, and removes a file that
 * is too large (SR-061, SR-062; D-471).
 */
export interface ProviderAsset {
  publicId: string;
  folder: string;
  type: ImageType;
  bytes: number;
  createdAt: Date;
}

export interface Page<T> {
  items: T[];
  /** Passed back as `cursor` for the next page; `null` on the last. */
  next: string | null;
}

export interface ListRequest {
  cursor?: string | null;
  /** 100 when left out, at most 500. */
  limit?: number;
}

/** A notification as the provider sends it: the raw body and its two headers. */
export interface ProviderNotification {
  body: string;
  timestamp: string;
  signature: string;
}

/** Public and review images: a managed media provider (D-284, D-420). */
export interface MediaProvider {
  /** Signs one upload: public id, folder, image only, the types, the time, and no overwrite. */
  signUpload(request: SignUploadRequest): Promise<SignedUpload>;
  /** The image as the provider has it, to check its real type and size; `null` when none. */
  getAsset(publicId: string): Promise<ProviderAsset | null>;
  /** The image's public URL through one named transformation; any other name is refused. */
  deliveryUrl(publicId: string, transformation: string): string;
  /** Removes the image; one that is not there is no error, so a cleanup job can run again. */
  remove(publicId: string): Promise<void>;
  /** The images of one folder in the order of their public ids: the weekly match (§7 rule 9). */
  list(request: ListRequest & { folder: string }): Promise<Page<ProviderAsset>>;
  /** Whether a notification is the provider's own, signed and not older than its window. */
  verifyNotification(notification: ProviderNotification): boolean;
}

/** `private`: the private files; `hold`: the files under a legal hold, with Object Lock (D-456). */
export type Bucket = 'private' | 'hold';

export interface PresignPutRequest {
  bucket: Bucket;
  key: string;
  /** The exact `Content-Type` the upload must send (SR-062). */
  contentType: string;
  /** The exact size the upload must send. */
  bytes: number;
  /** At most `UPLOAD_URL_TTL_SECONDS`. */
  expiresInSeconds: number;
}

/** A presigned PUT: the client sends the file to `url` with exactly these headers. */
export interface PresignedPut {
  url: string;
  headers: Readonly<Record<string, string>>;
  expiresAt: Date;
}

export interface PresignGetRequest {
  bucket: Bucket;
  key: string;
  /** At most `PRIVATE_URL_TTL_SECONDS`. */
  expiresInSeconds: number;
  /** `attachment` for a PDF, so the browser saves it and never shows it in the app (SR-062). */
  disposition: 'attachment' | 'inline';
}

/** A private file as the storage keeps it. */
export interface StoredObject {
  bucket: Bucket;
  key: string;
  bytes: number;
  contentType: string;
  createdAt: Date;
  /** Until when the `hold` bucket keeps it no matter what; `null` in `private`. */
  retainUntil: Date | null;
}

export interface WriteRequest {
  bucket: Bucket;
  key: string;
  body: Uint8Array;
  contentType: string;
}

/** Private files: an S3 like object storage, Backblaze B2 (D-420, D-456). */
export interface ObjectStorage {
  /** A short presigned PUT for the client's upload, with the exact type and size. */
  presignPut(request: PresignPutRequest): Promise<PresignedPut>;
  /** A short presigned GET, only after the owner service allowed it (SR-062). */
  presignGet(request: PresignGetRequest): Promise<string>;
  /** The file's size and type as stored, to check them after an upload; `null` when none. */
  head(bucket: Bucket, key: string): Promise<StoredObject | null>;
  /** The file's bytes, for the server's own work (its type from the bytes, EXIF removal). */
  read(bucket: Bucket, key: string): Promise<Uint8Array>;
  /** Writes a file the server made (a re-encoded image); `hold` refuses to replace a kept one. */
  write(request: WriteRequest): Promise<void>;
  /** Removes the file; `hold` refuses before its retention ends; one not there is no error. */
  remove(bucket: Bucket, key: string): Promise<void>;
  /** The files under a prefix in the order of their keys: the weekly match (§7 rule 9). */
  list(request: ListRequest & { bucket: Bucket; prefix: string }): Promise<Page<StoredObject>>;
}
