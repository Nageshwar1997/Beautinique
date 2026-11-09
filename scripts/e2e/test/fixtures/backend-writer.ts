// A stand-in for an E2E run's backend (scripts/e2e/test/runs.test.ts): it says where it runs, as the
// real one does, then writes into its run's database every 50 ms until it is stopped, as the bundle's
// leases and watchdog do. Arguments: the run id, the pid files' folder, the database prefix.
import { createLogger } from '@beautinique/backend-server-kit';
import { connectMongo } from '@beautinique/backend-server-mongo';

import { markRunning } from '../../runs.ts';

const [runId = '', dir = '', prefix = ''] = process.argv.slice(2);
const mongo = await connectMongo({
  uri: 'mongodb://localhost:27017/?replicaSet=rs0',
  dbName: `${prefix}${runId}_core`,
  appName: 'e2e-test-writer',
  logger: createLogger({ name: 'e2e-test-writer', level: 'silent' }),
});
markRunning(runId, { dir });
const locks = mongo.db.collection<{ _id: string; at: Date }>('platform_locks');
setInterval(() => {
  // a write that meets the drop fails, the next one makes the database again: the real backend
  // does not stop over it either
  locks.updateOne({ _id: 'release' }, { $set: { at: new Date() } }, { upsert: true }).catch(() => {
    // the next write tries again
  });
}, 50);
