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
];

export default mutations;
