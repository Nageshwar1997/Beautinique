# @beautinique/backend-server-release

Har backend deployable ke **release steps**, jo boot pe listen se pehle chalte hain (ARCHITECTURE §11.1, TASKS T2.5): pehle migrations, phir index sync, phir extra steps (jaise identity ka permission sync, T3.3). Render free web service me pre-deploy command nahi milta, isliye ye boot pe hi hote hain, ek MongoDB lease ke peeche: deploy ke waqt do instance hon to bhi ek hi chalata hai, doosra intezaar karta hai.

Har boot pe sab dobara na chale (free service har ghante so ke jaagti hai), isliye poori release ka ek **fingerprint** (migration ids, har index ki shakal, har step ka fingerprint) deployable ke DB me likha jaata hai. Wahi fingerprint mile to boot sirf ek document padhta hai: na lease, na index ki list.

## Install

```bash
npm install @beautinique/backend-server-release @beautinique/backend-server-kit @beautinique/backend-server-mongo @beautinique/backend-server-queue
```

server-kit (logger), server-mongo (`syncIndexes`, `IndexSpec`) aur server-queue (lease, `platform_locks`) peer dependencies hain: service aur ye package dono unki ek hi copy dekhen.

## Ek deployable me

```ts
// src/release.ts
import { CONSUMER_INDEXES, OUTBOX_INDEXES } from '@beautinique/backend-server-queue';
import {
  defineMigrations,
  type ReleaseDefinition,
  runRelease,
} from '@beautinique/backend-server-release';

export const releaseDefinition: ReleaseDefinition = {
  migrations: defineMigrations([
    {
      id: '20261027-001-users-email-unique',
      description: 'Lowercase every email, so the unique index can follow',
      up: async ({ mongo }) => {
        await mongo.db
          .collection('identity_users')
          .updateMany({}, [{ $set: { email: { $toLower: '$email' } } }]);
      },
    },
  ]),
  indexes: [
    ...OUTBOX_INDEXES,
    ...CONSUMER_INDEXES,
    { collection: 'identity_users', name: 'email_unique', key: { email: 1 }, unique: true },
  ],
};

// src/runtime.ts: MongoDB se judte hi, Redis aur baaki kaam se pehle
await runRelease({ mongo, logger, ...releaseDefinition });
```

`backend/core` aur `backend/identity` me yahi hai (`src/release.ts`), aur dono `release(config, { logger, force })` export karte hain: `npm run db:release` (`backend/bundle`) use bina server chalaye bulata hai.

## API

| Export                                                                                                  | Kaam                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `runRelease({ mongo, logger, migrations, indexes, steps, force, lockTtlMs, waitMs, pollMs, budgetMs })` | Fingerprint same ho (aur `force` nahi) to turant `upToDate: true`. Warna lease `release` (`platform_locks`) leta hai: doosre ke paas ho to `pollMs` (1 s) pe dekhta hai, `waitMs` (60 s) ke baad `ReleaseLockTimeoutError`. Lease `lockTtlMs` (30 s) ka, har tihaai pe renew. Lease milne ke baad fingerprint dobara dekhta hai (doosra abhi kar chuka ho). Phir migrations → `syncIndexes` → steps, har ek se pehle check ki lease abhi apni hai (nahi to `ReleaseLeaseLostError`), aakhir me fingerprint `platform_release` me aur lease wapas. Log: `release steps done` (ms, migrations, bane indexes, steps); faltu indexes aur `budgetMs` (60 s) se lamba boot warning. Koi bhi fail = boot fail, Render purana release chalne deta hai |
| `ReleaseDefinition` / `ReleaseReport`                                                                   | `{ migrations, indexes, steps? }` / `{ upToDate, fingerprint, migrations, unknownMigrations, indexes: { created, extra }, steps, ms }`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `defineMigrations(list)`                                                                                | List check karke freeze: id `YYYYMMDD-NNN-words` (jaise `20261027-001-users-email-unique`), har id pichhli ke baad (isliye unique), description zaroori. Galat list module load pe hi error. `runRelease` bhi isse check karta hai                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `Migration` / `ReleaseContext`                                                                          | `{ id, description, up({ mongo, logger }) }`. Chali hui migration `platform_migrations` me (`_id` = id, `description`, `appliedAt`, `ms`); fail ho to record nahi, `MigrationFailedError` (`migration`, `cause`), agla boot use dobara chalata hai. DB me aisi id ho jo code nahi jaanta (naya release pehle chala, phir purana) to sirf warning                                                                                                                                                                                                                                                                                                                                                                                              |
| `ReleaseStep`                                                                                           | `{ name, fingerprint, run(context) }`: migrations aur indexes ke baad. `fingerprint` badalne pe (jaise sync ki cheez ka hash) step dobara chalta hai                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `releaseFingerprint(definition)`                                                                        | sha256 hex: runner version, migration ids, har index ki poori shakal (key ka order bhi), har step ka naam + fingerprint                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `ReleaseLockTimeoutError` / `ReleaseLeaseLostError` / `MigrationFailedError`                            | Lease `waitMs` tak nahi mili / steps ke beech lease chhin gayi ya waqt pe renew nahi hui (agle step se pehle ruk jaata hai, taaki do instance saath na chalein; ek baar khatam hui lease kabhi wapas nahi li jaati, kyunki us beech koi aur chal chuka ho sakta hai) / migration fail                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `MIGRATIONS`, `RELEASE_STATE`, `RELEASE_LEASE`                                                          | `platform_migrations`, `platform_release` (ek document `_id: 'current'`), lease ka naam `release`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

Index sync khud `@beautinique/backend-server-mongo` ka `syncIndexes` hai (README wahan).

## Niyam

- **Migration (RULES §1.14):** sirf aage, dobara chalana safe, expand/contract: naya release start hote waqt purana usi data pe chal raha hota hai. Pehle naya field/index jodo (expand), purana sirf baad ke release me hatao (contract). Chal chuki migration ki id aur `up` kabhi mat badlo; galti ho to nayi migration.
- **60 s:** saare boot steps 60 s me (Render ka start aur wake-up screen). Lambi backfill migration me nahi: queue task (`defineTask`) banao, migration sirf use shuru kare.
- **Index kabhi uske naam ke neeche nahi badalta:** nayi shakal = naya naam (expand); purana index ek migration se hatao jab koi chalta code use na kare (contract). Usi naam pe alag shakal `IndexConflictError` deta hai, aur faltu index sirf log hota hai, kabhi apne aap nahi hatta.
- **Haath se index hataya** (Atlas UI) ho to fingerprint ko pata nahi chalta: `npm run db:release -- --force` (live pe `--env live` ke saath) use wapas banata hai.
- Seed aur ek-baar wale kaam bhi isi raaste: migration ya step, aur live pe `npm run db:release -- --env live` (`backend/bundle/README.md`).

## Tests

Tests asli MongoDB replica set pe chalte hain: pehle `npm run infra:up`, ya `MONGO_TEST_URI` do. Har test apna DB (`bq_test_release_<id>_<n>`) leta hai, aakhir me sab mit jaate hain. Do instance ek saath, crash hua holder (lease khatam hone ka intezaar), steps ke beech lease chhinna, renew na ho paana, aur default 30 s lease, sab asli Mongo pe dekhe jaate hain. Mutation list `test/mutations.ts` (RULES §6): `npm run mutate -- --package backend-server-release`.

```bash
npm run infra:up
npm test --workspace @beautinique/backend-server-release
```

## License

MIT © Nageshwar Pawar
