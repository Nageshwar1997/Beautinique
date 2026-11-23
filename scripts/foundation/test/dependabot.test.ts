import assert from 'node:assert/strict';

import { describe, test } from 'vitest';

import {
  COOLDOWN_DAYS,
  type DependabotUpdate,
  dependabotProblems,
  readDependabot,
} from '../src/dependabot.ts';

const monthly = {
  'target-branch': 'prerelease',
  schedule: { interval: 'monthly' },
  cooldown: { 'default-days': COOLDOWN_DAYS },
};
const npm: DependabotUpdate = {
  'package-ecosystem': 'npm',
  directory: '/',
  ...monthly,
  groups: { npm: { patterns: ['*'], 'update-types': ['patch', 'minor'] } },
};
const actions: DependabotUpdate = {
  'package-ecosystem': 'github-actions',
  directory: '/',
  ...monthly,
  groups: { actions: { patterns: ['*'], 'update-types': ['minor', 'patch'] } },
};
const docker: DependabotUpdate = {
  'package-ecosystem': 'docker-compose',
  directory: '/infra',
  ...monthly,
  ignore: [
    {
      'dependency-name': '*',
      'update-types': ['version-update:semver-minor', 'version-update:semver-major'],
    },
  ],
  groups: { docker: { patterns: ['*'], 'update-types': ['patch'] } },
};
const onlyMajorIgnored = [
  { 'dependency-name': '*', 'update-types': ['version-update:semver-major'] },
];

describe('dependency pull requests (docs/OPERATIONS.md §11 rule 1)', () => {
  test('AC-FOUNDATION-10: the repository config sends monthly pull requests into prerelease, minor and patch grouped, each major alone', () => {
    assert.deepEqual(dependabotProblems(readDependabot()), []);
  });

  test('AC-FOUNDATION-10: the rules hold for a config written by hand', () => {
    assert.deepEqual(dependabotProblems({ version: 2, updates: [npm, actions, docker] }), []);
  });

  test('AC-FOUNDATION-10: a weekly schedule, a release target and a missing cooldown are caught', () => {
    const badNpm: DependabotUpdate = {
      ...npm,
      'target-branch': 'release',
      schedule: { interval: 'weekly' },
      cooldown: {},
      'open-pull-requests-limit': 0,
    };
    assert.deepEqual(dependabotProblems({ version: 2, updates: [badNpm, actions, docker] }), [
      'npm: target-branch must be prerelease',
      'npm: schedule.interval must be monthly',
      `npm: cooldown.default-days must be ${String(COOLDOWN_DAYS)}`,
      'npm: open-pull-requests-limit 0 turns version updates off',
    ]);
  });

  test('AC-FOUNDATION-10: a major in the group, an ignored major and a security group are caught', () => {
    const badActions: DependabotUpdate = {
      ...actions,
      ignore: onlyMajorIgnored,
      groups: {
        all: { patterns: ['*'], 'update-types': ['major', 'minor', 'patch'] },
        security: { 'applies-to': 'security-updates', patterns: ['*'] },
      },
    };
    assert.deepEqual(dependabotProblems({ version: 2, updates: [npm, badActions, docker] }), [
      'github-actions: security updates are off (they go to release), so no group is for them',
      'github-actions: one group must take exactly minor and patch updates',
      'github-actions: a major update gets its own pull request, never a group',
      'github-actions: no update type is ignored; majors come one by one',
    ]);
  });

  test('AC-FOUNDATION-10: Docker images that take minor updates, a missing ecosystem and a wrong directory are caught', () => {
    const badDocker: DependabotUpdate = {
      ...docker,
      ignore: onlyMajorIgnored,
      groups: { docker: { patterns: ['*'], 'update-types': ['minor', 'patch'] } },
    };
    assert.deepEqual(
      dependabotProblems({ version: 1, updates: [{ ...npm, directory: '/frontend' }, badDocker] }),
      [
        'version must be 2',
        'npm: directory must be /',
        'github-actions: needs exactly one entry',
        'docker-compose: one group must take exactly patch updates',
        'docker-compose: every image must ignore major and minor updates (Atlas and Render set them)',
      ],
    );
  });
});
