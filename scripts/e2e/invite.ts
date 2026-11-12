// An invitation for the apps' E2E, as a Master sends one from the Master app (not built yet):
// straight into the run's identity database (scripts/e2e/backend.ts made it), through identity's
// own code, so the invitation and its email (outbox → notify → Mailpit) are what the live ones are.
// The Master is the run's own (an account made here, given the seat with db:grant-master's code).
//   node --conditions=beautinique-source scripts/e2e/invite.ts <email> [<role>]
// Needs BQ_E2E_RUN (playwright.config.ts sets it for the tests, who start this).
import { randomUUID } from 'node:crypto';

import { createLogger } from '@beautinique/backend-server-kit';
import { connectMongo, ObjectId } from '@beautinique/backend-server-mongo';
import { connectRedis } from '@beautinique/backend-server-queue';

import { hashPassword } from '../../backend/identity/src/password.ts';
import { giveMasterGrant } from '../../backend/identity/src/rbac/bootstrap.ts';
import { createInvitation } from '../../backend/identity/src/rbac/invitations.ts';
import { signUpWithCode } from '../../backend/identity/src/users.ts';

const [email, role = 'admin.catalog_qc'] = process.argv.slice(2);
const runId = process.env.BQ_E2E_RUN;
if (email === undefined || runId === undefined || runId === '') {
  console.error('usage: BQ_E2E_RUN=<run> node scripts/e2e/invite.ts <email> [<role>]');
  process.exit(2);
}

const logger = createLogger({ name: 'e2e-invite', level: 'silent' });
const mongo = await connectMongo({
  uri: 'mongodb://localhost:27017/?replicaSet=rs0',
  dbName: `bq_e2e_${runId}_identity`,
  appName: 'e2e-invite',
  logger,
});
// the backend's own Redis database (scripts/e2e/backend.ts)
const redis = await connectRedis({ url: 'redis://localhost:6379/6', name: 'e2e-invite', logger });
try {
  // the run's Master: an account (a customer sign-up, as db:grant-master asks), then the seat
  const master = `e2e-master-${runId}@beautinique.example`;
  const { user } = await signUpWithCode(mongo, {
    email: master,
    app: 'customer',
    consent: { terms: true, adult: true },
    legalVersion: 'dummy-1',
    ip: '127.0.0.1',
    newPassword: { hash: await hashPassword(randomUUID()), hibpPending: false },
  });
  await giveMasterGrant(mongo, { email: master });
  await createInvitation(
    { mongo, redis: redis.client, logger },
    {
      userId: user._id.toHexString(),
      // a passport's session is not read here; any ObjectId does
      sessionId: new ObjectId().toHexString(),
      app: 'master',
      methods: ['password', 'totp'],
      authzVersion: 0,
    },
    { email, role, scope: { type: 'global', ids: [] } },
    `e2e-invite-${randomUUID()}`,
  );
} finally {
  await redis.close();
  await mongo.close();
}
