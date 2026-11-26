import { MongoClient } from 'mongodb';

/**
 * How long an operation waits to find the server. A database that is out of reach fails in seconds
 * (the driver waits 30), so the request is a quick 503 and not a hang.
 */
export const SERVER_SELECTION_TIMEOUT_MS = 5_000;

export interface MongoClientOptions {
  /** The connection string, from the service's config (never written in code). */
  uri: string;
  /** The service's name, seen in the server's logs and current operations. */
  appName: string;
  /** The most connections the process opens to this cluster. */
  maxPoolSize: number;
}

/**
 * The client of a service's database: writes and reads that a majority has (docs/ARCHITECTURE.md
 * §10.2), retryable writes and reads, and a field that is `undefined` left out rather than kept
 * as `null`. Nothing connects until the first operation.
 */
export function createMongoClient({ uri, appName, maxPoolSize }: MongoClientOptions): MongoClient {
  if (appName.trim() === '') throw new RangeError('appName is required.');
  if (!Number.isInteger(maxPoolSize) || maxPoolSize < 1) {
    throw new RangeError('maxPoolSize must be a whole number of 1 or more.');
  }
  return new MongoClient(uri, {
    appName,
    maxPoolSize,
    retryWrites: true,
    retryReads: true,
    writeConcern: { w: 'majority' },
    readConcern: { level: 'majority' },
    serverSelectionTimeoutMS: SERVER_SELECTION_TIMEOUT_MS,
    ignoreUndefined: true,
  });
}
