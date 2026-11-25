import { spawnSync, type SpawnSyncOptions } from 'node:child_process';
import { join } from 'node:path';

import { ROOT } from './constants/paths.ts';
import { sshEnv } from './ssh.ts';

// The one compose file of the laptop's and CI's containers (docs/OPERATIONS.md §1 rules 2 to 4).
export const COMPOSE_FILE = join(ROOT, 'infra', 'compose.yaml');

// The override of the containers that tests and mutation runs start: MongoDB keeps its data in memory
// (tmpfs), because the secondary laptop has an HDD (docs/OPERATIONS.md §1 rule 12).
export const EPHEMERAL_FILE = join(ROOT, 'infra', 'compose.ephemeral.yaml');

// The one compose project of the development containers, whose data is worth keeping and copying.
export const DEV_PROJECT = 'beautinique';

// How long `infra:up` waits for every container to report healthy (a first run pulls the images).
export const WAIT_SECONDS = 180;

// The fields of `docker compose config --format json` that the checks read.
export interface ComposeConfig {
  services?: Record<
    string,
    {
      image?: string;
      profiles?: string[];
      ports?: { host_ip?: string; published?: string | number; target?: number }[];
    }
  >;
}

const EXACT_IMAGE = /^[a-z0-9][a-z0-9./_-]*:\d+\.\d+\.\d+$/;

// Every container is pinned to an exact version, starts only through a profile, and listens on
// 127.0.0.1 only, never on the laptop's network.
export function composeProblems(config: ComposeConfig): string[] {
  const problems: string[] = [];
  for (const [name, service] of Object.entries(config.services ?? {})) {
    const image = service.image ?? '';
    if (!EXACT_IMAGE.test(image)) {
      problems.push(
        `${name}: image must be pinned to an exact version (name:x.y.z), not "${image}"`,
      );
    }
    if (!service.profiles?.length) {
      problems.push(`${name}: must sit behind a profile, so it starts only when asked for`);
    }
    for (const port of service.ports ?? []) {
      if (port.host_ip !== '127.0.0.1') {
        problems.push(
          `${name}: port ${String(port.published ?? '?')} must listen on 127.0.0.1 only`,
        );
      }
    }
  }
  return problems;
}

// The compose project a command works on: COMPOSE_PROJECT_NAME when it is set (Compose lowers its
// case), else compose.yaml's own `name`, the development project.
export function composeProject(env: NodeJS.ProcessEnv = process.env): string {
  const name = env.COMPOSE_PROJECT_NAME ?? '';
  return name === '' ? DEV_PROJECT : name.toLowerCase();
}

// Whether `infra:down` saves a snapshot of the development MongoDB first: only on the secondary and
// only when it stops the development project itself. A test project's `down` (its own name, its
// data in memory) never dumps the development data nor rotates its snapshots out (QA-Q-11).
export function snapshotsOnDown(remote: boolean, env: NodeJS.ProcessEnv = process.env): boolean {
  return remote && composeProject(env) === DEV_PROJECT;
}

// The compose files of a run. `BQ_DATA_IN_MEMORY=true` adds the in-memory override, and only for a
// project of its own (COMPOSE_PROJECT_NAME): it would replace the development data volume.
export function composeFiles(env: NodeJS.ProcessEnv = process.env): string[] {
  if (env.BQ_DATA_IN_MEMORY !== 'true') return [COMPOSE_FILE];
  const project = env.COMPOSE_PROJECT_NAME ?? '';
  if (project === '' || project === DEV_PROJECT) {
    throw new Error(
      `BQ_DATA_IN_MEMORY=true needs its own COMPOSE_PROJECT_NAME, not the development project "${DEV_PROJECT}".`,
    );
  }
  return [COMPOSE_FILE, EPHEMERAL_FILE];
}

export function compose(args: string[], options: SpawnSyncOptions = {}) {
  const env = options.env ?? process.env;
  const files = composeFiles(env).flatMap((file) => ['-f', file]);
  return spawnSync('docker', ['compose', ...files, ...args], {
    encoding: 'utf8',
    ...options,
    env: sshEnv(env),
  });
}

// Reading the file needs the Docker CLI only, not a running Docker.
function composeOutput(args: string[]): string {
  const result = compose(args);
  if (result.status !== 0) {
    throw new Error(`docker compose ${args.join(' ')} failed:\n${String(result.stderr)}`);
  }
  return String(result.stdout);
}

// The file with the given profiles switched on (every profile by default), as Compose itself reads it.
export function readComposeConfig(profiles: string[] = ['*']): ComposeConfig {
  const switches = profiles.flatMap((profile) => ['--profile', profile]);
  return JSON.parse(composeOutput([...switches, 'config', '--format', 'json'])) as ComposeConfig;
}

export function composeProfiles(): string[] {
  return composeOutput(['config', '--profiles']).split(/\r?\n/).filter(Boolean).sort();
}

// `up` returns once every container of the profiles is healthy, or fails after WAIT_SECONDS.
export function upArgs(profiles: string[]): string[] {
  return [
    ...profiles.flatMap((profile) => ['--profile', profile]),
    'up',
    '--detach',
    '--wait',
    '--wait-timeout',
    String(WAIT_SECONDS),
  ];
}

// `down` takes every profile, so nothing started earlier keeps running. Data volumes stay.
export function downArgs(): string[] {
  return ['--profile', '*', 'down'];
}

export function dockerIsRunning(): boolean {
  return (
    spawnSync('docker', ['info', '--format', '{{.ServerVersion}}'], {
      stdio: 'ignore',
      env: sshEnv(),
    }).status === 0
  );
}
