import assert from 'node:assert/strict';

import { describe, test } from 'vitest';

import {
  describeContext,
  envOverrideProblem,
  isMachine,
  MACHINES,
  switchProblem,
} from '../src/machine.ts';
import { INFRA_CONTEXT } from '../src/remote-infra.ts';

describe('which laptop runs the containers', () => {
  test('AC-FOUNDATION-15: the two laptops have plain names over their Docker contexts', () => {
    assert.deepEqual(MACHINES, { secondary: INFRA_CONTEXT, primary: 'desktop-linux' });
    assert.ok(isMachine('secondary'));
    assert.ok(isMachine('primary'));
    assert.ok(!isMachine('laptop3'));
    assert.ok(!isMachine(undefined));
  });

  test('AC-FOUNDATION-15: the chosen laptop is said in words, an unknown remote context too', () => {
    assert.equal(
      describeContext('bq-infra', 'ssh://bq-infra'),
      'the secondary laptop (Docker context bq-infra)',
    );
    assert.equal(
      describeContext('desktop-linux', 'npipe:////./pipe/dockerDesktopLinuxEngine'),
      'this laptop (Docker context desktop-linux)',
    );
    assert.equal(
      describeContext('lab', 'ssh://bq@10.0.0.9'),
      'another machine (Docker context lab, ssh://bq@10.0.0.9)',
    );
    assert.equal(
      describeContext('default', 'npipe:////./pipe/docker_engine'),
      'this laptop (Docker context default)',
    );
  });

  test('AC-FOUNDATION-15: a switch waits while the tunnel is open or containers still run', () => {
    const current = 'the secondary laptop (Docker context bq-infra)';
    assert.equal(
      switchProblem({ current, tunnelOpen: true, running: 0 }),
      'The SSH tunnel to the secondary laptop is still open: run npm run infra:down first.',
    );
    assert.equal(
      switchProblem({ current, tunnelOpen: false, running: 2 }),
      '2 containers are still running on the secondary laptop (Docker context bq-infra): run npm run infra:down first.',
    );
    assert.match(
      switchProblem({ current, tunnelOpen: false, running: 1 }) ?? '',
      /^1 container is/,
    );
  });

  test('AC-FOUNDATION-15: nothing running, or the old laptop gone (an emergency), lets the switch happen', () => {
    const current = 'the secondary laptop (Docker context bq-infra)';
    assert.equal(switchProblem({ current, tunnelOpen: false, running: 0 }), undefined);
    assert.equal(switchProblem({ current, tunnelOpen: false, running: undefined }), undefined);
  });

  test('AC-FOUNDATION-15: DOCKER_HOST or DOCKER_CONTEXT in the shell stops the switch, since Docker would ignore it', () => {
    assert.equal(envOverrideProblem({}), undefined);
    assert.equal(
      envOverrideProblem({ DOCKER_CONTEXT: 'default' }),
      'DOCKER_CONTEXT is set in this shell, so Docker follows it instead of the chosen laptop. Unset it and try again.',
    );
    assert.match(
      envOverrideProblem({ DOCKER_HOST: 'ssh://x', DOCKER_CONTEXT: 'y' }) ?? '',
      /^DOCKER_HOST and DOCKER_CONTEXT are set/,
    );
  });
});
