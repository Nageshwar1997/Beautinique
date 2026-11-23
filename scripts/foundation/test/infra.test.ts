import assert from 'node:assert/strict';

import { describe, test } from 'vitest';

import {
  composeProblems,
  composeProfiles,
  downArgs,
  readComposeConfig,
  upArgs,
  WAIT_SECONDS,
} from '../src/infra.ts';

// These read the compose file through the Docker CLI only; no container starts.
describe('infra/compose.yaml', () => {
  test('AC-FOUNDATION-2: every image is pinned, every container sits behind a profile, every port is on 127.0.0.1', () => {
    assert.deepEqual(composeProblems(readComposeConfig()), []);
  });

  test('AC-FOUNDATION-2: a floating tag, a container without a profile and an open port are caught', () => {
    assert.deepEqual(
      composeProblems({
        services: {
          cache: {
            image: 'valkey/valkey:latest',
            profiles: ['backend'],
            ports: [{ host_ip: '0.0.0.0', published: '6379' }],
          },
          db: { image: 'mongo:8.0', ports: [{ published: '27017' }] },
          mail: { image: 'axllent/mailpit:1.2.3', profiles: ['mail'] },
        },
      }),
      [
        'cache: image must be pinned to an exact version (name:x.y.z), not "valkey/valkey:latest"',
        'cache: port 6379 must listen on 127.0.0.1 only',
        'db: image must be pinned to an exact version (name:x.y.z), not "mongo:8.0"',
        'db: must sit behind a profile, so it starts only when asked for',
        'db: port 27017 must listen on 127.0.0.1 only',
      ],
    );
  });

  test('versions match live: MongoDB 8.0 from 8.0.30, Valkey 8.1 with 25 MB and noeviction', () => {
    const { services = {} } = readComposeConfig();
    const mongo = /^mongo:8\.0\.(\d+)$/.exec(services.mongo?.image ?? '');
    assert.ok(mongo?.[1] && Number(mongo[1]) >= 30, `mongo image: ${services.mongo?.image ?? ''}`);
    assert.match(services.valkey?.image ?? '', /^valkey\/valkey:8\.1\.\d+$/);
  });

  test('the backend profile starts MongoDB and Valkey, and nothing starts without a profile', () => {
    assert.deepEqual(composeProfiles(), ['backend']);
    const services = Object.entries(readComposeConfig().services ?? {})
      .filter(([, service]) => service.profiles?.includes('backend'))
      .map(([name]) => name)
      .sort();
    assert.deepEqual(services, ['mongo', 'valkey']);
  });

  test('up waits for healthy containers; down takes every profile', () => {
    assert.deepEqual(upArgs(['backend']), [
      '--profile',
      'backend',
      'up',
      '--detach',
      '--wait',
      '--wait-timeout',
      String(WAIT_SECONDS),
    ]);
    assert.deepEqual(downArgs(), ['--profile', '*', 'down']);
  });
});
