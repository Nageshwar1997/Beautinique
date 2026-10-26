import type { Logger } from '@beautinique/backend-server-kit';
import { connectMongo, type Mongo } from '@beautinique/backend-server-mongo';
import { CONSUMER_INDEXES, OUTBOX_INDEXES } from '@beautinique/backend-server-queue';
import {
  defineMigrations,
  type ReleaseDefinition,
  type ReleaseReport,
  runRelease,
} from '@beautinique/backend-server-release';

import type { Config } from './config.ts';
import { indexes as moduleIndexes } from './modules/index.ts';

/**
 * core's release steps (ARCHITECTURE §11.1), run on every start before core listens: migrations,
 * then every index. A new migration goes at the end of the list (RULES §1.14), a module's indexes
 * into src/modules/index.ts.
 */
export const releaseDefinition: ReleaseDefinition = {
  migrations: defineMigrations([]),
  indexes: [...OUTBOX_INDEXES, ...CONSUMER_INDEXES, ...moduleIndexes],
};

/** The release steps on core's database (a start, or `npm run db:release`). */
export function runReleaseSteps(
  mongo: Mongo,
  logger: Logger,
  options: { force?: boolean } = {},
): Promise<ReleaseReport> {
  return runRelease({ mongo, logger, ...releaseDefinition, ...options });
}

/**
 * Only the release steps, without starting core: `npm run db:release` (the laptop's database, or
 * the live one with --env live). Connects to MongoDB, runs them and closes again.
 */
export async function release(
  config: Config,
  options: { logger: Logger; force?: boolean },
): Promise<ReleaseReport> {
  const { logger, force } = options;
  const mongo = await connectMongo({
    uri: config.mongoUri,
    dbName: config.mongoDbName,
    appName: 'core-release',
    logger,
  });
  try {
    return await runReleaseSteps(mongo, logger, { force });
  } finally {
    await mongo.close();
  }
}
