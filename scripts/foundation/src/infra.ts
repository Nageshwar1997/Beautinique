import { spawnSync, type SpawnSyncOptions } from 'node:child_process';
import { resolve } from 'node:path';

// The one compose file of the laptop's and CI's containers (docs/OPERATIONS.md §1 rules 2 to 4).
export const COMPOSE_FILE = resolve(import.meta.dirname, '../../../infra/compose.yaml');

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

export function compose(args: string[], options: SpawnSyncOptions = {}) {
  return spawnSync('docker', ['compose', '-f', COMPOSE_FILE, ...args], {
    encoding: 'utf8',
    ...options,
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

// The whole file with every profile switched on, as Compose itself reads it.
export function readComposeConfig(): ComposeConfig {
  return JSON.parse(
    composeOutput(['--profile', '*', 'config', '--format', 'json']),
  ) as ComposeConfig;
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
    spawnSync('docker', ['info', '--format', '{{.ServerVersion}}'], { stdio: 'ignore' }).status ===
    0
  );
}
