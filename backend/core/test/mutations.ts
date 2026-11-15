// Deliberate bugs for `npm run mutate -- --package core` (RULES §6: core's copy of who may do what
// feeds authorize(), so its lines get mutations): each one must make a test fail, unless
// `survives` says why it cannot. The runner refuses a list whose `from` text no longer occurs
// exactly once.

import type { Mutation } from '../../../scripts/mutation/lib/list';

const mutations: Mutation[] = [
  // core's copy of identity's roles, grants and accounts (TASKS T3.5)
  {
    file: 'modules/platform/access',
    name: 'an older account snapshot puts its grants back',
    change: [["{ $lte: [{ $ifNull: ['$authzVersion', -1] }, authzVersion] },", 'true,']],
    tests: 'highest version only',
  },
  {
    file: 'modules/platform/access',
    name: 'a newer account snapshot never replaces the copy',
    change: [
      [
        "{ $lte: [{ $ifNull: ['$authzVersion', -1] }, authzVersion] },",
        "{ $gt: [{ $ifNull: ['$authzVersion', -1] }, authzVersion] },",
      ],
    ],
    tests: 'highest version only',
  },
  {
    file: 'modules/platform/access',
    name: 'an older role snapshot puts its permissions back',
    change: [
      [
        "        ROLE_COPIES,\n        { _id: new ObjectId(roleId), ...role, changedAt: at },\n        { $lte: [{ $ifNull: ['$changedAt', new Date(0)] }, at] },",
        '        ROLE_COPIES,\n        { _id: new ObjectId(roleId), ...role, changedAt: at },\n        true,',
      ],
    ],
    tests: 'newest role',
  },
  {
    file: 'modules/platform/access',
    name: 'a new account never makes it into the copy',
    change: [
      [
        "createdAt: new Date(createdAt), changedAt: at },\n        { $lte: [{ $ifNull: ['$changedAt', new Date(0)] }, at] },",
        'createdAt: new Date(createdAt), changedAt: at },\n        false,',
      ],
    ],
    tests: 'newest account',
  },
  {
    file: 'modules/platform/access',
    name: 'values are read as expressions',
    change: [
      ["{ $cond: [newer, { $literal: next }, '$$ROOT'] }", "{ $cond: [newer, next, '$$ROOT'] }"],
    ],
    tests: 'looks like an expression',
  },
  {
    file: 'modules/platform/access',
    name: 'an account id in a scope stays text',
    change: [
      [
        '                : grant.scope.ids.map((id) => new ObjectId(id)),',
        '                : [...grant.scope.ids],',
      ],
    ],
    tests: 'typed data',
  },
  {
    file: 'modules/platform/access',
    name: "a grant's end is lost",
    change: [['            validTo: date(grant.validTo),', '            validTo: null,']],
    tests: 'typed data',
  },
  // the platform kernel: authorize(), scopeFilter() and idempotency keys (TASKS T4.1 PR B)
  {
    file: 'modules/platform/authz',
    name: 'an older copy decides',
    change: [['if (copy && copy.authzVersion >= passport.authzVersion) {', 'if (copy) {']],
    tests: 'stays older than the passport',
  },
  {
    file: 'modules/platform/authz',
    name: 'a copy as new as the passport waits',
    change: [
      [
        'if (copy && copy.authzVersion >= passport.authzVersion) {',
        'if (copy && copy.authzVersion > passport.authzVersion) {',
      ],
    ],
    tests: "the passport's app",
  },
  {
    file: 'modules/platform/authz',
    name: "another app's grant counts",
    change: [
      [
        'if (grant.app !== app || !role || role.retired) return [];',
        'if (!role || role.retired) return [];',
      ],
    ],
    tests: "the passport's app",
  },
  {
    file: 'modules/platform/authz',
    name: 'a retired role still allows',
    change: [
      [
        'if (grant.app !== app || !role || role.retired) return [];',
        'if (grant.app !== app || !role) return [];',
      ],
    ],
    tests: "the passport's app",
  },
  {
    file: 'modules/platform/authz',
    name: 'an older copy is never read again',
    change: [['if (attempt >= retries) {', 'if (true) {']],
    tests: 'stays older than the passport',
  },
  {
    file: 'modules/platform/authz',
    name: 'outside the scope is 403, so it tells the thing is there',
    change: [
      [
        "  if (decision.reason === 'out-of-scope') throw new AppError('NOT_FOUND', notFound);\n",
        '',
      ],
    ],
    tests: '404 outside it',
  },
  {
    file: 'modules/platform/authz',
    name: 'a list without the permission is filtered, not refused',
    change: [['  authorize(access, permission);\n', '']],
    tests: 'refuses a caller with no active grant',
  },
  {
    file: 'modules/platform/routes',
    name: 'a ping is read without the permission',
    change: [
      ['      authorize(await accessOf(mongo, await deps.passport(req)), pingRead.key);\n', ''],
    ],
    tests: 'only with platform.ping.read',
  },
  {
    file: 'modules/platform/authz',
    name: 'an account id in the filter stays text',
    change: [['ids.map((id) => toObjectId(id))', 'ids']],
    tests: 'an account as an ObjectId',
  },
  {
    file: 'modules/platform/authz',
    name: 'no field for the scope type reaches everything',
    change: [['  if (parts.length === 0) return NOTHING;', '  if (parts.length === 0) return {};']],
    tests: 'an account as an ObjectId',
  },
  {
    file: 'modules/platform/idempotency',
    name: 'a request without a key goes through',
    change: [["if (given === undefined || given === '') {", 'if (false) {']],
    tests: 'asks for a key',
  },
  {
    file: 'modules/platform/idempotency',
    name: 'the same key for another request is taken',
    change: [['if (found && found.request !== request) {', 'if (false) {']],
    tests: 'refuses the key for another request',
  },
  {
    file: 'modules/platform/idempotency',
    name: 'a finished request is never given again',
    change: [["if (found?.state === 'done' && found.response) {", 'if (false) {']],
    tests: 'the same request again',
  },
  {
    file: 'modules/platform/idempotency',
    name: 'a 5xx answer is kept',
    change: [['          status >= 500', '          status >= 600']],
    tests: 'keeps no 5xx',
  },
  {
    file: 'modules/platform/idempotency',
    name: 'one key for every client of a public route',
    change: [
      [
        "  if (route.access.type === 'public') return `ip:${req.get(HEADERS.clientIp) ?? ''}`;",
        "  if (route.access.type === 'public') return 'ip:';",
      ],
    ],
    tests: 'counts it per client',
  },
  {
    file: 'modules/platform/idempotency',
    name: 'one key for every signed-in user',
    change: [['  return `user:${(await passport(req)).userId}`;', "  return 'user:';"]],
    tests: 'counts the key per user',
  },
  {
    file: 'modules/platform/idempotency',
    name: 'a dead request keeps its key forever',
    change: [
      [
        "{ key, state: 'running', lockedUntil: { $lt: now } },",
        "{ key, state: 'running', lockedUntil: { $lt: new Date(0) } },",
      ],
    ],
    tests: 'process died',
  },
  // the audit log: one hash chain a day, its check, the viewer's routes (TASKS T4.1 PR C)
  {
    file: 'modules/audit/store',
    name: 'an entry does not point at the one before',
    change: [['        prevHash: head.lastHash,', '        prevHash: chainStartOf(day),']],
    tests: 'every hash following',
  },
  {
    file: 'modules/audit/store',
    name: "the day's head keeps no last hash",
    change: [
      [
        '      await heads.updateOne({ _id: head._id }, { $set: { lastHash: hash } }, { session });',
        '',
      ],
    ],
    tests: 'every hash following',
  },
  {
    file: 'modules/audit/store',
    name: 'what changed is kept unmasked',
    change: [
      [
        '  const text = JSON.stringify(maskForAudit(value));',
        '  const text = JSON.stringify(value);',
      ],
    ],
    tests: 'half hides personal data',
  },
  {
    file: 'modules/audit/store',
    name: 'a big change kept whole',
    change: [['  return text.length > AUDIT_CHANGE_MAX_CHARS', '  return text.length > Infinity']],
    tests: 'too big change',
  },
  {
    file: 'modules/audit/store',
    name: 'the chain does not grow',
    change: [['          $inc: { seq: 1 },', '          $inc: { seq: 0 },']],
    tests: 'every hash following',
  },
  {
    file: 'modules/audit/verify',
    name: 'a changed entry passes the check',
    change: [
      [
        'entry.seq !== expectedSeq || entry.prevHash !== prevHash || hashOf(entry) !== entry.hash',
        'entry.seq !== expectedSeq || entry.prevHash !== prevHash',
      ],
    ],
    tests: 'a changed, a lost and an added',
  },
  {
    file: 'modules/audit/verify',
    name: 'a lost last entry passes the check',
    change: [
      [
        '  if (brokenAtSeq === null && entries !== length) brokenAtSeq = Math.min(entries, length) + 1;\n',
        '',
      ],
    ],
    // a lost last entry is caught by the last hash too; the count alone catches a lost head
    tests: 'a changed, a lost and an added|head was lost',
  },
  {
    file: 'modules/audit/verify',
    name: "today's growing chain is checked",
    change: [
      [
        '  const range = { day: { $gte: since, $lt: today } };',
        '  const range = { day: { $gte: since, $lte: today } };',
      ],
    ],
    tests: 'checks only finished days',
  },
  {
    file: 'modules/audit/verify',
    name: 'a broken chain is no error',
    change: [["        'audit chain broken',", "        'audit chains fine',"]],
    tests: 'checks only finished days',
  },
  {
    file: 'modules/audit/routes',
    name: 'the entries without the read permission',
    change: [
      [
        '      authorize(await accessOf(mongo, await deps.passport(req)), auditRead.key);\n      // an id names',
        '      await deps.passport(req);\n      // an id names',
      ],
    ],
    tests: 'without the read permission',
  },
  {
    file: 'modules/audit/routes',
    name: 'the days without the read permission',
    change: [
      [
        '      authorize(await accessOf(mongo, await deps.passport(req)), auditRead.key);\n      const span',
        '      await deps.passport(req);\n      const span',
      ],
    ],
    tests: 'without the read permission',
  },
  {
    file: 'modules/audit/routes',
    name: 'any range of days',
    change: [['      if (span < 0 || span >= AUDIT_DAYS_MAX) {', '      if (false) {']],
    tests: 'at most the allowed days',
  },
  {
    file: 'modules/audit/routes',
    name: "the actor's email shown whole",
    change: [
      [
        '          emails.set(user._id.toHexString(), maskEmail(user.email));',
        '          emails.set(user._id.toHexString(), user.email);',
      ],
    ],
    tests: 'actor half hidden',
  },
  {
    file: 'modules/audit/index',
    name: "identity's records named as core's",
    change: [["        source: 'identity',", "        source: 'core',"]],
    tests: 'identity.audit.recorded',
  },
  // the review's fixes (T4.1 PR C)
  {
    file: 'modules/audit/verify',
    name: 'a lost head hides its day',
    change: [["    ...(await store.entries.distinct('day', range)),\n", '']],
    tests: 'head was lost',
  },
  {
    file: 'modules/audit/verify',
    name: 'another last hash passes the check',
    change: [
      [
        '  if (brokenAtSeq === null && length > 0 && head?.lastHash !== prevHash) brokenAtSeq = length;\n',
        '',
      ],
    ],
    tests: 'head was lost',
  },
  {
    file: 'modules/audit/index',
    name: "a refused request's scope stops the record",
    change: [['  /^[0-9a-f]{24}$/.test(id) ? new ObjectId(id) : id;', '  new ObjectId(id);']],
    tests: 'identity.audit.recorded',
  },
  {
    file: 'modules/audit/store',
    name: 'an entry kept beyond the limits',
    change: [['      const input = withinLimits(given);', '      const input = given;']],
    tests: 'inside the limits',
  },
  {
    file: 'modules/audit/routes',
    name: 'a resource id without its type is taken',
    change: [
      [
        '      if (query.resourceId !== undefined && query.resourceType === undefined) {',
        '      if (false) {',
      ],
    ],
    tests: 'actor half hidden',
  },
];

export default mutations;
