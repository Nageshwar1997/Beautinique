import type { Logger, ReadyCheck } from '@beautinique/backend-server-kit';
import { type Db, type Document, MongoClient } from 'mongodb';

import { ParallelGuard } from './guard';

export interface ConnectMongoOptions {
  /** From the deployable's config (IDENTITY__MONGO_URI ...). Never logged: it can hold a password. */
  uri: string;
  /** The deployable's own database: bq_identity, bq_payments, bq_notify, bq_core. */
  dbName: string;
  /** Shown in MongoDB and Atlas logs: the deployable's name. */
  appName: string;
  logger: Logger;
  /** Connections of this deployable (default 5: Atlas M0 allows 500 for the whole cluster, ARCHITECTURE §6.1). */
  maxPoolSize?: number;
  /** How long to look for MongoDB before giving up (default 5 s). */
  serverSelectionTimeoutMS?: number;
}

export interface Mongo {
  client: MongoClient;
  /** The deployable's database. */
  db: Db;
  logger: Logger;
  /** For /ready: true when MongoDB answers a ping within 2 seconds. */
  ready: ReadyCheck;
  /** For startServer's onStop: closes the connection pool. Safe to call twice. */
  close(): Promise<void>;
  /** Used by withTransaction to catch parallel queries in a transaction. */
  readonly guard: ParallelGuard;
}

/** Transactions need a replica set (Atlas always is one; locally `npm run infra:up` starts one). */
export function assertReplicaSet(hello: Document): void {
  if (typeof hello.setName !== 'string' && hello.msg !== 'isdbgrid') {
    throw new Error(
      'MongoDB must be a replica set, because transactions need one. Locally run `npm run infra:up`; ' +
        'Atlas is always a replica set.',
    );
  }
}

/**
 * One pooled MongoDB client for a deployable: majority writes, reads from the primary, retryable reads
 * and writes, and undefined fields left out instead of stored as null. Fails at start when MongoDB is
 * not a replica set.
 */
export async function connectMongo({
  uri,
  dbName,
  appName,
  logger,
  maxPoolSize = 5,
  serverSelectionTimeoutMS = 5000,
}: ConnectMongoOptions): Promise<Mongo> {
  const client = new MongoClient(uri, {
    appName,
    maxPoolSize,
    serverSelectionTimeoutMS,
    writeConcern: { w: 'majority' },
    readPreference: 'primary',
    retryWrites: true,
    retryReads: true,
    ignoreUndefined: true,
    // command events let withTransaction notice parallel queries; nothing is logged from them
    monitorCommands: true,
  });
  const guard = new ParallelGuard(client);
  try {
    await client.connect();
  } catch (error) {
    // the driver's message names hosts; ours says what to do (and never prints the URI)
    throw new Error(
      `MongoDB did not answer within ${String(serverSelectionTimeoutMS)} ms. Locally run \`npm run infra:up\`; ` +
        'live, check the URI and the Atlas network access list.',
      { cause: error },
    );
  }
  try {
    const hello = await client.db('admin').command({ hello: 1 });
    assertReplicaSet(hello);
    logger.info(
      { db: dbName, replicaSet: hello.setName as unknown, maxPoolSize },
      'mongo connected',
    );
  } catch (error) {
    await client.close();
    throw error;
  }
  return {
    client,
    db: client.db(dbName),
    logger,
    guard,
    ready: async () => {
      try {
        await client.db('admin').command({ ping: 1 }, { timeoutMS: 2000 });
        return true;
      } catch {
        return false;
      }
    },
    close: async () => {
      await client.close();
      logger.info('mongo closed');
    },
  };
}
