import type { CopyInput, CreateUploadInput, GetUrlInput, ListInput } from './inputs';

/** What the browser needs to send the file straight to the provider (the server never carries it). */
export interface UploadTicket {
  provider: string;
  assetId: string;
  /** The provider key. The registry keeps it; every other call takes it. */
  key: string;
  method: 'POST' | 'PUT';
  url: string;
  /** `POST`: the form fields to send before the file. */
  fields: Record<string, string>;
  /** `PUT`: the headers to send with the file. */
  headers: Record<string, string>;
  /** ISO date-time the ticket stops working. */
  expiresAt: string;
}

/** A file the provider holds. */
export interface StoredFile {
  key: string;
  size: number;
  contentType: string;
  /** ISO date-time the provider got the file. */
  uploadedAt: string;
}

export interface ListPage {
  files: StoredFile[];
  /** Pass it as `cursor` for the next page; missing = this was the last page. */
  nextCursor?: string;
}

/**
 * Every file of the platform goes through this one interface (ARCHITECTURE §6.7, RULES §4.10), so
 * the provider (Cloudinary today, S3 + CloudFront tomorrow) is a config choice. Rules for adapters:
 *
 * - The database holds an `assetId`, never a provider URL: URLs come from `getUrl` only.
 * - One file, one owner: a second record that wants the same image gets a `copy`, so deleting one
 *   record never breaks another.
 * - Check every input with `parseInput` and the schemas of this package, and make keys with
 *   `assetKey`, so all adapters refuse and name things the same way.
 * - Run the shared contract tests (`@beautinique/backend-server-storage/testing`) against the
 *   adapter. A provider failure is a `StorageError` with code `PROVIDER_ERROR`.
 */
export interface StoragePort {
  /** Name of the provider, kept in the registry next to the key (`cloudinary`, `s3`, `memory`). */
  readonly provider: string;

  /** A signed ticket for the browser to upload one file of a given type and size directly. */
  createUpload(input: CreateUploadInput): Promise<UploadTicket>;

  /**
   * The URL to show a file at: permanent for `public`, signed and short-lived for `private`.
   * Builds a string from the key; it must not call the provider.
   */
  getUrl(input: GetUrlInput): string;

  /** The file's size, type and upload time, or `undefined` when it is not there (not uploaded yet). */
  stat(key: string): Promise<StoredFile | undefined>;

  /** Removes the file. A file that is already gone is fine: delete jobs are retried. */
  delete(key: string): Promise<void>;

  /**
   * Makes a new, independent file for another asset from an existing one; the old one is not
   * touched. `NOT_FOUND` when the source is missing, `ALREADY_EXISTS` when the new asset already
   * has a file (a copy never overwrites).
   */
  copy(input: CopyInput): Promise<StoredFile>;

  /** Files in key order, a page at a time, for the reconcile job. */
  list(input?: ListInput): Promise<ListPage>;
}
