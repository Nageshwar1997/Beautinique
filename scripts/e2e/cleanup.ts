// After an app's E2E: the run's databases go (scripts/e2e/backend.ts made them), so runs on the
// laptop do not pile up. Used as Playwright's globalTeardown.
import { createLogger } from '@beautinique/backend-server-kit';
import { connectMongo } from '@beautinique/backend-server-mongo';

export default async function cleanup(): Promise<void> {
  const runId = process.env.BQ_E2E_RUN;
  if (runId === undefined || runId === '') return;
  const logger = createLogger({ name: 'e2e-cleanup', level: 'silent' });
  const mongo = await connectMongo({
    uri: 'mongodb://localhost:27017/?replicaSet=rs0',
    dbName: `bq_e2e_${runId}_identity`,
    appName: 'e2e-cleanup',
    logger,
  });
  try {
    for (const name of ['core', 'identity', 'notify']) {
      await mongo.client.db(`bq_e2e_${runId}_${name}`).dropDatabase();
    }
  } finally {
    await mongo.close();
  }
}
