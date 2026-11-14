// People for the Master app's Staff E2E (TASKS T3.7), straight into the run's identity database
// (scripts/e2e/backend.ts made it) through identity's own code:
//   node --conditions=beautinique-source scripts/e2e/staff.ts master <email>       the Master seat
//                                                                                (db:grant-master)
//   node --conditions=beautinique-source scripts/e2e/staff.ts hold <email> <role>  an account that
//                                                    holds a role everywhere, as a migration gives it
// Needs BQ_E2E_RUN (playwright.config.ts sets it for the tests, who start this).
import { randomUUID } from 'node:crypto';

import { createLogger } from '@beautinique/backend-server-kit';
import { connectMongo, type ObjectId, withTransaction } from '@beautinique/backend-server-mongo';

import { hashPassword } from '../../backend/identity/src/password.ts';
import { giveMasterGrant } from '../../backend/identity/src/rbac/bootstrap.ts';
import { GRANTS, writeGrant } from '../../backend/identity/src/rbac/grants.ts';
import { type RoleRecord, ROLES } from '../../backend/identity/src/rbac/sync.ts';
import { signUpWithCode, USERS } from '../../backend/identity/src/users.ts';

const [what, email, role] = process.argv.slice(2);
const runId = process.env.BQ_E2E_RUN;
if (
  (what !== 'master' && what !== 'hold') ||
  email === undefined ||
  (what === 'hold' && role === undefined) ||
  runId === undefined ||
  runId === ''
) {
  console.error(
    'usage: BQ_E2E_RUN=<run> node scripts/e2e/staff.ts master <email> | hold <email> <role>',
  );
  process.exit(2);
}

const logger = createLogger({ name: 'e2e-staff', level: 'silent' });
const mongo = await connectMongo({
  uri: 'mongodb://localhost:27017/?replicaSet=rs0',
  dbName: `bq_e2e_${runId}_identity`,
  appName: 'e2e-staff',
  logger,
});
try {
  if (what === 'master') {
    // Master has 2 seats, and every project of the run makes its own Master: the earlier ones of
    // this run (their test is over) give theirs up first, in the run's own database only
    const earlier = await mongo.db
      .collection<{ _id: ObjectId; email: string }>(USERS)
      .find({ email: { $regex: '^e2e-master-staff-' } }, { projection: { _id: 1 } })
      .toArray();
    const masterRole = await mongo.db
      .collection<RoleRecord>(ROLES)
      .findOne({ key: 'master.master' });
    if (masterRole && earlier.length > 0) {
      await mongo.db
        .collection(GRANTS)
        .updateMany(
          { roleId: masterRole._id, userId: { $in: earlier.map((u) => u._id) }, active: true },
          { $set: { active: false, endedAt: new Date() } },
        );
    }
    await giveMasterGrant(mongo, { email });
  } else {
    const { user } = await signUpWithCode(mongo, {
      email,
      app: 'customer',
      consent: { terms: true, adult: true },
      legalVersion: 'dummy-1',
      ip: '127.0.0.1',
      newPassword: { hash: await hashPassword(randomUUID()), hibpPending: false },
    });
    const record = await mongo.db.collection<RoleRecord>(ROLES).findOne({ key: role });
    if (!record) throw new Error(`no role ${String(role)}`);
    await withTransaction(mongo, (session) =>
      writeGrant(mongo, session, {
        userId: user._id,
        roleId: record._id,
        appId: record.appId,
        scope: { type: 'global', ids: [] },
        via: 'migration',
        now: new Date(),
      }),
    );
  }
} finally {
  await mongo.close();
}
