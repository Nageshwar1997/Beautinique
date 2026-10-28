import type { Logger } from '@beautinique/backend-server-kit';
import { connectMongo, type Mongo } from '@beautinique/backend-server-mongo';
import { OUTBOX_INDEXES } from '@beautinique/backend-server-queue';
import {
  defineMigrations,
  type ReleaseDefinition,
  type ReleaseReport,
  runRelease,
} from '@beautinique/backend-server-release';

import type { Config } from './config.ts';
import { indexes as credentialIndexes } from './credentials.ts';
import { indexes as sessionIndexes } from './sessions.ts';
import { indexes as signingKeyIndexes } from './signing-keys.ts';
import { indexes as userIndexes } from './users.ts';

/**
 * identity's release steps (ARCHITECTURE §11.1), run on every start before identity listens:
 * migrations, then every index. A new migration goes at the end of the list (RULES §1.14), a new
 * collection's indexes into `indexes`; the permission sync joins as a step (TASKS T3.3).
 */
export const releaseDefinition: ReleaseDefinition = {
  migrations: defineMigrations([]),
  indexes: [
    ...OUTBOX_INDEXES,
    ...userIndexes,
    ...credentialIndexes,
    ...sessionIndexes,
    ...signingKeyIndexes,
  ],
};

/** The release steps on identity's database (a start, or `npm run db:release`). */
export function runReleaseSteps(
  mongo: Mongo,
  logger: Logger,
  options: { force?: boolean } = {},
): Promise<ReleaseReport> {
  return runRelease({ mongo, logger, ...releaseDefinition, ...options });
}

/**
 * Only the release steps, without starting identity: `npm run db:release` (the laptop's database,
 * or the live one with --env live). Connects to MongoDB, runs them and closes again.
 */
export async function release(
  config: Config,
  options: { logger: Logger; force?: boolean },
): Promise<ReleaseReport> {
  const { logger, force } = options;
  const mongo = await connectMongo({
    uri: config.mongoUri,
    dbName: config.mongoDbName,
    appName: 'identity-release',
    logger,
  });
  try {
    return await runReleaseSteps(mongo, logger, { force });
  } finally {
    await mongo.close();
  }
}
