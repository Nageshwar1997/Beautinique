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
];

export default mutations;
