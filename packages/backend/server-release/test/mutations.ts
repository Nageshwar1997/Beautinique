// Deliberate bugs for `npm run mutate -- --package backend-server-release` (RULES §6): each one
// must make a test fail, unless `survives` says why it cannot. Keep this list in step with src/:
// the runner refuses a list whose `from` text no longer occurs exactly once.

import type { Mutation } from '../../../../scripts/mutation/lib/list';

const fingerprint = 'releaseFingerprint';
const run = 'runRelease';
const define = 'defineMigrations';

const mutations: Mutation[] = [
  // the fingerprint: any change of the release must change it
  {
    file: 'release',
    name: 'fingerprint ignores migrations',
    change: [['migrations: migrations.map((migration) => migration.id),', 'migrations: [],']],
    tests: fingerprint,
  },
  {
    file: 'release',
    name: 'fingerprint ignores the collection',
    change: [['      index.collection,\n', "      '',\n"]],
    tests: fingerprint,
  },
  {
    file: 'release',
    name: 'fingerprint ignores the index name',
    change: [['      index.name,\n', "      '',\n"]],
    tests: fingerprint,
  },
  {
    file: 'release',
    name: 'fingerprint ignores key directions',
    change: [['Object.entries(index.key),', 'Object.keys(index.key),']],
    tests: fingerprint,
  },
  {
    file: 'release',
    name: 'fingerprint ignores unique',
    change: [['index.unique ?? false,', 'false,']],
    tests: fingerprint,
  },
  {
    file: 'release',
    name: 'fingerprint ignores sparse',
    change: [['index.sparse ?? false,', 'false,']],
    tests: fingerprint,
  },
  {
    file: 'release',
    name: 'fingerprint ignores the TTL',
    change: [['index.expireAfterSeconds ?? null,', 'null,']],
    tests: fingerprint,
  },
  {
    file: 'release',
    name: 'fingerprint ignores the partial filter',
    change: [['index.partialFilterExpression ?? null,', 'null,']],
    tests: fingerprint,
  },
  {
    file: 'release',
    name: "fingerprint ignores a step's new work",
    change: [['[step.name, step.fingerprint]', '[step.name]']],
    tests: fingerprint,
  },
  {
    file: 'release',
    name: 'fingerprint ignores step names',
    change: [['[step.name, step.fingerprint]', '[step.fingerprint]']],
    tests: fingerprint,
  },
  {
    file: 'release',
    name: 'runner version bumped',
    change: [['const RUNNER_VERSION = 1;', 'const RUNNER_VERSION = 2;']],
    survives: 'equivalent: any value works, a new one only makes every database run once more',
  },

  // the lease
  {
    file: 'release',
    name: 'no lease at all',
    change: [
      ['while (!(await tryLease(mongo, RELEASE_LEASE, owner, lockTtlMs))) {', 'while (false) {'],
    ],
    tests: run,
  },
  {
    file: 'release',
    name: 'waits forever',
    change: [['if (Date.now() >= deadline) throw new ReleaseLockTimeoutError(waitMs);', '']],
    tests: 'gives up',
  },
  {
    file: 'release',
    name: 'waits without a word',
    change: [["logger.info('waiting for another instance to finish its release steps');", '']],
    tests: run,
  },
  {
    file: 'release',
    name: 'lease counted from the first try',
    change: [['    asked = Date.now();\n', '']],
    tests: 'crashed instance',
  },
  {
    file: 'release',
    name: 'a taken lease is not noticed',
    change: [
      [
        'if (lost || Date.now() >= heldUntil) throw new ReleaseLeaseLostError();',
        'if (Date.now() >= heldUntil) throw new ReleaseLeaseLostError();',
      ],
    ],
    tests: run,
  },
  {
    file: 'release',
    name: 'an expired lease is not noticed',
    change: [
      [
        'if (lost || Date.now() >= heldUntil) throw new ReleaseLeaseLostError();',
        'if (lost) throw new ReleaseLeaseLostError();',
      ],
    ],
    tests: run,
  },
  {
    file: 'release',
    name: 'a failed renewal is not noticed',
    change: [['      else lost = true;\n', '']],
    tests: run,
  },
  {
    file: 'release',
    name: 'a lease that ran out is taken back',
    change: [['if (started >= heldUntil) {', 'if (false) {']],
    tests: run,
  },
  {
    file: 'release',
    name: 'a renewal does not extend the lease',
    change: [['heldUntil = started + lockTtlMs;', 'void started;']],
    tests: run,
  },
  {
    file: 'release',
    name: 'renews too late',
    change: [['Math.max(250, Math.floor(lockTtlMs / 3)),', 'lockTtlMs * 2,']],
    tests: run,
  },
  {
    file: 'release',
    name: 'renewal timer keeps the process alive',
    change: [['    timer.unref();\n', '']],
    survives:
      'release() always clears the timer, so the unref only matters for a caller that never ends',
  },
  {
    file: 'release',
    name: 'renews again after a late renewal finished',
    change: [['if (!stopped) schedule();', 'schedule();']],
    survives: 'race guard: matters only when a renewal is still on the wire as the release ends',
  },
  {
    file: 'release',
    name: 'keeps renewing after the release',
    change: [['      clearTimeout(timer);\n', '']],
    tests: run,
  },
  {
    file: 'release',
    name: 'never gives the lease back',
    change: [['await releaseLease(mongo, RELEASE_LEASE, owner).catch(() => undefined);', '']],
    tests: run,
  },

  // the steps and their order
  {
    file: 'release',
    name: 'no fast path',
    change: [['\n  if (!force && (await isCurrent())) {', '\n  if (false) {']],
    tests: run,
  },
  {
    file: 'release',
    name: 'force ignored on the fast path',
    change: [['\n  if (!force && (await isCurrent())) {', '\n  if (await isCurrent()) {']],
    tests: run,
  },
  {
    file: 'release',
    name: 'no second look after the wait',
    change: [
      [
        '    // another instance may have finished this release while we waited for the lease\n    if (!force && (await isCurrent())) {',
        '    if (false) {',
      ],
    ],
    tests: run,
  },
  {
    file: 'release',
    name: 'force ignored after the wait',
    change: [
      [
        '    // another instance may have finished this release while we waited for the lease\n    if (!force && (await isCurrent())) {',
        '    if (await isCurrent()) {',
      ],
    ],
    tests: run,
  },
  {
    file: 'release',
    name: 'migration list not checked',
    change: [
      [
        'const migrations = defineMigrations(options.migrations);',
        'const migrations = options.migrations;',
      ],
    ],
    tests: run,
  },
  {
    file: 'release',
    name: 'index sync without the lease',
    change: [['    lease.check();\n    const synced', '    const synced']],
    tests: run,
  },
  {
    file: 'release',
    name: 'next step without the lease',
    change: [
      ['      lease.check();\n      await step.run(context);', '      await step.run(context);'],
    ],
    tests: run,
  },
  {
    file: 'release',
    name: 'release recorded without the lease',
    change: [['    lease.check();\n    const ms = elapsed();', '    const ms = elapsed();']],
    tests: run,
  },
  {
    file: 'release',
    name: 'release not recorded',
    change: [['      { upsert: true },', '      { upsert: false },']],
    tests: run,
  },
  {
    file: 'release',
    name: 'another fingerprint recorded',
    change: [
      [
        '{ $set: { fingerprint, releasedAt: new Date(), ms } },',
        "{ $set: { fingerprint: 'old', releasedAt: new Date(), ms } },",
      ],
    ],
    tests: run,
  },
  {
    file: 'release',
    name: 'step not reported',
    change: [['      done.push(step.name);\n', '']],
    tests: run,
  },

  // the report and the log
  {
    file: 'release',
    name: 'report: up to date after running',
    change: [['      upToDate: false,', '      upToDate: true,']],
    tests: run,
  },
  {
    file: 'release',
    name: 'report: no migrations',
    change: [['migrations: ran.applied,', 'migrations: [],']],
    tests: run,
  },
  {
    file: 'release',
    name: 'report: no unknown migrations',
    change: [['unknownMigrations: ran.unknown,', 'unknownMigrations: [],']],
    tests: run,
  },
  {
    file: 'release',
    name: 'report: no indexes',
    change: [['      indexes: synced,', '      indexes: { created: [], extra: [] },']],
    tests: run,
  },
  {
    file: 'release',
    name: 'report: no steps',
    change: [['      steps: done,\n      ms,\n    };', '      steps: [],\n      ms,\n    };']],
    tests: run,
  },
  {
    file: 'release',
    name: 'no done line',
    change: [["      'release steps done',", "      'release done',"]],
    tests: run,
  },
  {
    file: 'release',
    name: 'extra indexes not warned',
    change: [['if (synced.extra.length > 0) {', 'if (false) {']],
    tests: run,
  },
  {
    file: 'release',
    name: 'budget check turned around',
    change: [['if (ms > budgetMs) {', 'if (ms < budgetMs) {']],
    tests: run,
  },
  {
    file: 'release',
    name: 'budget never warns',
    change: [['if (ms > budgetMs) {', 'if (false) {']],
    tests: run,
  },

  // the defaults (ARCHITECTURE §11.1)
  {
    file: 'release',
    name: 'default: forced',
    change: [['    force = false,', '    force = true,']],
    tests: run,
  },
  {
    file: 'release',
    name: 'default: 10 minute lease',
    change: [['    lockTtlMs = 30_000,', '    lockTtlMs = 600_000,']],
    tests: '30 second lease',
  },
  {
    file: 'release',
    name: 'default: no wait',
    change: [['    waitMs = 60_000,', '    waitMs = 1,']],
    tests: run,
  },
  {
    file: 'release',
    name: 'default: looks every millisecond',
    change: [['    pollMs = 1000,', '    pollMs = 1,']],
    survives: 'only how often a waiting boot looks; every test that waits sets its own',
  },
  {
    file: 'release',
    name: 'default: no budget',
    change: [['    budgetMs = 60_000,', '    budgetMs = 0,']],
    tests: 'within the budget',
  },

  // defineMigrations
  {
    file: 'migrations',
    name: 'any id after the number',
    change: [
      ['const ID = /^\\d{8}-\\d{3}-[a-z0-9]+(?:-[a-z0-9]+)*$/;', 'const ID = /^\\d{8}-\\d{3}-/;'],
    ],
    tests: define,
  },
  {
    file: 'migrations',
    name: 'id may start anywhere',
    change: [['const ID = /^\\d{8}', 'const ID = /\\d{8}']],
    tests: define,
  },
  {
    file: 'migrations',
    name: 'id may end with anything',
    change: [['(?:-[a-z0-9]+)*$/;', '(?:-[a-z0-9]+)*/;']],
    tests: define,
  },
  {
    file: 'migrations',
    name: 'same id twice',
    change: [['if (migration.id <= previous) {', 'if (migration.id < previous) {']],
    tests: define,
  },
  {
    file: 'migrations',
    name: 'order never checked',
    change: [['    previous = migration.id;\n', '']],
    tests: define,
  },
  {
    file: 'migrations',
    name: 'no description needed',
    change: [["if (migration.description.trim() === '') {", 'if (false) {']],
    tests: define,
  },
  {
    file: 'migrations',
    name: 'list can be changed later',
    change: [['return Object.freeze([...list]);', 'return [...list];']],
    tests: define,
  },

  // runMigrations
  {
    file: 'migrations',
    name: 'applied migrations run again',
    change: [['    if (done.has(migration.id)) continue;\n', '']],
    tests: run,
  },
  {
    file: 'migrations',
    name: 'no lease check before a migration',
    change: [['    beforeEach();\n', '']],
    tests: run,
  },
  {
    file: 'migrations',
    name: 'unknown migrations not warned',
    change: [['if (unknown.length > 0) {', 'if (false) {']],
    tests: run,
  },
  {
    file: 'migrations',
    name: 'known migrations called unknown',
    change: [['.filter((id) => !known.has(id))', '.filter((id) => known.has(id))']],
    tests: run,
  },
  {
    file: 'migrations',
    name: 'failure not named',
    change: [['throw new MigrationFailedError(migration.id, { cause: error });', 'throw error;']],
    tests: run,
  },
  {
    file: 'migrations',
    name: 'migration not recorded',
    change: [['      { upsert: true },', '      { upsert: false },']],
    tests: run,
  },
  {
    file: 'migrations',
    name: 'description not recorded',
    change: [['{ description: migration.description,', "{ description: '',"]],
    tests: run,
  },
  {
    file: 'migrations',
    name: 'no line per migration',
    change: [["logger.info({ migration: migration.id, ms }, 'migration applied');", '']],
    tests: run,
  },
  {
    file: 'migrations',
    name: 'migration not reported',
    change: [['    applied.push(migration.id);\n', '']],
    tests: run,
  },

  // errors
  {
    file: 'errors',
    name: 'lock timeout without the wait',
    change: [['for more than ${String(waitMs)} ms.', 'for too long.']],
    tests: 'gives up',
  },
];

export default mutations;
