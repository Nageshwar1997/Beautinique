import assert from 'node:assert/strict';
import { basename, dirname } from 'node:path';

import { describe, test } from 'vitest';

import {
  BEFORE_COPY_FILE,
  copyProblems,
  devComposeArgs,
  dockerHostProblems,
  KEEP_SNAPSHOTS,
  latestSnapshot,
  mongoDumpArgs,
  mongoPort,
  mongoRestoreArgs,
  mongoStopArgs,
  mongoUpArgs,
  pickLocalContext,
  restoreProblems,
  snapshotName,
  SNAPSHOT_DIR,
  snapshotsToDelete,
} from '../src/dev-data.ts';

const SSH = 'ssh://bq@bq-infra';
const LOCAL = 'npipe:////./pipe/dockerDesktopLinuxEngine';

describe('AC-FOUNDATION-13: development data moves only towards the primary laptop', () => {
  test('a snapshot is named by its UTC time, so names sort by age', () => {
    assert.equal(
      snapshotName(new Date('2026-11-23T10:15:30.123Z')),
      'mongo-20261123T101530Z.archive.gz',
    );
    assert.ok(
      snapshotName(new Date('2026-11-24T00:00:00Z')) >
        snapshotName(new Date('2026-11-23T23:59:59Z')),
    );
  });

  test('only the newest three snapshots stay', () => {
    assert.equal(KEEP_SNAPSHOTS, 3);
    const names = [
      'mongo-20261121T100000Z.archive.gz',
      'mongo-20261124T100000Z.archive.gz',
      'mongo-20261122T100000Z.archive.gz',
      'mongo-20261123T100000Z.archive.gz',
      'mongo-20261125T100000Z.archive.gz',
    ];
    assert.deepEqual(snapshotsToDelete(names), [
      'mongo-20261121T100000Z.archive.gz',
      'mongo-20261122T100000Z.archive.gz',
    ]);
    // Wrong examples: three or fewer are all kept, and a file that is not a snapshot is never listed.
    assert.deepEqual(snapshotsToDelete(names.slice(0, 3)), []);
    assert.deepEqual(
      snapshotsToDelete([
        'notes.txt',
        'mongo-latest.archive.gz',
        'mongo-20261121T100000Z.archive.gz.partial',
      ]),
      [],
    );
  });

  test('the copy of this laptop saved before dev-data:copy is never restored as a snapshot nor rotated (QA-Q-5)', () => {
    const before = basename(BEFORE_COPY_FILE);
    assert.equal(dirname(BEFORE_COPY_FILE), SNAPSHOT_DIR);
    const names = [before, 'mongo-20261121T100000Z.archive.gz'];
    assert.equal(latestSnapshot(names), 'mongo-20261121T100000Z.archive.gz');
    assert.equal(latestSnapshot([before]), undefined);
    assert.deepEqual(snapshotsToDelete([before, ...names], 0), [
      'mongo-20261121T100000Z.archive.gz',
    ]);
  });

  test('the latest snapshot is the newest one, and none is found in an empty or foreign folder', () => {
    assert.equal(
      latestSnapshot([
        'mongo-20261122T100000Z.archive.gz',
        'mongo-20261124T100000Z.archive.gz',
        'x.txt',
      ]),
      'mongo-20261124T100000Z.archive.gz',
    );
    assert.equal(latestSnapshot([]), undefined);
    assert.equal(latestSnapshot(['x.txt', 'mongo-20261122T100000Z.archive.gz.partial']), undefined);
  });

  test('a copy from the secondary into this laptop, in the development project, may run', () => {
    assert.deepEqual(
      copyProblems({ project: 'beautinique', sourceEndpoint: SSH, targetEndpoint: LOCAL }),
      [],
    );
  });

  test('a copy towards the secondary is refused', () => {
    const problems = copyProblems({
      project: 'beautinique',
      sourceEndpoint: LOCAL,
      targetEndpoint: SSH,
    });
    assert.deepEqual(problems, [
      'The source must be the secondary laptop (an ssh:// Docker context).',
      "Never copy towards the secondary: the target must be this laptop's own Docker.",
    ]);
  });

  test("a copy of the restore drill's project, or any other project, is refused", () => {
    assert.deepEqual(
      copyProblems({ project: 'bq-restore-drill', sourceEndpoint: SSH, targetEndpoint: LOCAL }),
      ['Only the development project "beautinique" is copied, not "bq-restore-drill".'],
    );
  });

  test('a restore into the secondary, or into another project, is refused', () => {
    assert.deepEqual(restoreProblems(LOCAL, 'beautinique'), []);
    assert.deepEqual(restoreProblems(SSH, 'beautinique'), [
      "Never restore into the secondary: the target must be this laptop's own Docker.",
    ]);
    assert.deepEqual(restoreProblems(LOCAL, 'bq-restore-drill'), [
      'Only the development project "beautinique" is restored, not "bq-restore-drill".',
    ]);
  });

  test('DOCKER_HOST, which would override the chosen context, stops the data commands', () => {
    assert.deepEqual(dockerHostProblems({}), []);
    assert.equal(dockerHostProblems({ DOCKER_HOST: SSH }).length, 1);
  });

  test('the local context is the first one that is not ssh://, Docker Desktop first', () => {
    assert.equal(
      pickLocalContext([
        { name: 'bq-infra', endpoint: SSH },
        { name: 'default', endpoint: 'npipe:////./pipe/docker_engine' },
        { name: 'desktop-linux', endpoint: LOCAL },
      ]),
      'desktop-linux',
    );
    assert.equal(pickLocalContext([{ name: 'default', endpoint: LOCAL }]), 'default');
    // A wrong example: with only the secondary known, no context is picked.
    assert.equal(pickLocalContext([{ name: 'bq-infra', endpoint: SSH }]), undefined);
    assert.equal(pickLocalContext([]), undefined);
  });

  test('every docker call names the development project and the compose file, and the context when given', () => {
    const args = devComposeArgs('bq-infra', ['ps']);
    assert.deepEqual(args.slice(0, 2), ['--context', 'bq-infra']);
    assert.deepEqual(args.slice(-3), ['-p', 'beautinique', 'ps']);
    assert.equal(devComposeArgs(undefined, ['ps'])[0], 'compose');
  });

  test('the copy starts only MongoDB on the secondary and stops only MongoDB again, never touching the data', () => {
    const up = devComposeArgs('bq-infra', mongoUpArgs());
    assert.deepEqual(up.slice(0, 2), ['--context', 'bq-infra']);
    assert.deepEqual(up.slice(-8), [
      '--profile',
      'backend',
      'up',
      '--detach',
      '--wait',
      '--wait-timeout',
      '180',
      'mongo',
    ]);
    assert.ok(up.includes('-p') && up.includes('beautinique'));
    const stop = devComposeArgs('bq-infra', mongoStopArgs());
    assert.deepEqual(stop.slice(-4), ['--profile', 'backend', 'stop', 'mongo']);
    // Wrong examples: nothing that removes containers, networks or the data volume, and no other service.
    for (const arg of [...mongoUpArgs(), ...mongoStopArgs()]) {
      assert.ok(!['down', 'rm', '-v', '--volumes', 'valkey', 'mailpit'].includes(arg), arg);
    }
  });

  test('the dump streams to stdout, and the restore skips the server-state databases', () => {
    assert.ok(mongoDumpArgs(27017).includes('--archive'));
    assert.ok(!mongoDumpArgs(27017).some((arg) => arg.startsWith('--out')));
    const restore = mongoRestoreArgs(37017);
    assert.ok(restore.includes('--drop'));
    assert.deepEqual(restore.slice(restore.indexOf('--port'), restore.indexOf('--port') + 2), [
      '--port',
      '37017',
    ]);
    assert.ok(restore.includes('admin.*') && restore.includes('config.*'));
    assert.equal(mongoPort({ BQ_MONGO_PORT: '37017' }), 37017);
    assert.equal(mongoPort({}), 27017);
  });
});
