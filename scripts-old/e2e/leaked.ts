// A password found leaked after it was set (QA DR-002), for the apps' E2E: what identity's sign-in
// check writes when Have I Been Pwned, away when the password was set, later finds it in a breach.
// The run's backend never reaches Have I Been Pwned (scripts/e2e/backend.ts), so this writes it
// straight into the run's identity database, as that check does.
//   node --conditions=beautinique-source scripts/e2e/leaked.ts <email>
// Needs BQ_E2E_RUN (playwright.config.ts sets it for the tests, who start this).
import { createLogger } from '@beautinique/backend-server-kit';
import { connectMongo } from '@beautinique/backend-server-mongo';

import { CREDENTIALS, type Credentials } from '../../backend/identity/src/credentials.ts';
import { type User, USERS } from '../../backend/identity/src/users.ts';

const [email] = process.argv.slice(2);
const runId = process.env.BQ_E2E_RUN;
if (email === undefined || runId === undefined || runId === '') {
  console.error('usage: BQ_E2E_RUN=<run> node scripts/e2e/leaked.ts <email>');
  process.exit(2);
}

const logger = createLogger({ name: 'e2e-leaked', level: 'silent' });
const mongo = await connectMongo({
  uri: 'mongodb://localhost:27017/?replicaSet=rs0',
  dbName: `bq_e2e_${runId}_identity`,
  appName: 'e2e-leaked',
  logger,
});
try {
  const user = await mongo.db
    .collection<User>(USERS)
    .findOne({ email }, { projection: { _id: 1 } });
  if (!user) throw new Error(`no account for ${email}`);
  const now = new Date();
  const marked = await mongo.db.collection<Credentials>(CREDENTIALS).updateOne(
    { _id: user._id, 'password.hash': { $exists: true } },
    {
      $unset: { 'password.hibpPending': '' },
      $set: { 'password.breachedAt': now, updatedAt: now },
    },
  );
  if (marked.matchedCount !== 1) throw new Error(`no password on the account of ${email}`);
} finally {
  await mongo.close();
}
