// After an app's E2E (Playwright's globalTeardown): the run's backend stops first, then its databases
// go, and those of any run that is over (a stopped or broken one), so runs on the laptop do not pile
// up and none comes back (QA-TOOL-002; scripts/e2e/runs.ts).
import { createLogger } from '@beautinique/backend-server-kit';
import { connectMongo } from '@beautinique/backend-server-mongo';

import { cleanUpRun } from './runs.ts';

export default async function cleanup(): Promise<void> {
  const logger = createLogger({ name: 'e2e-cleanup', level: 'silent' });
  const mongo = await connectMongo({
    uri: 'mongodb://localhost:27017/?replicaSet=rs0',
    dbName: 'admin',
    appName: 'e2e-cleanup',
    logger,
  });
  try {
    await cleanUpRun(mongo, process.env.BQ_E2E_RUN);
  } finally {
    await mongo.close();
  }
}
