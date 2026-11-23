// Which laptop runs the containers (docs/OPERATIONS.md §1 rules 11 and 12). The one source of truth is
// Docker's own current context, so `infra:up`, the tests and `dev-data:*` always use the same machine;
// `infra:use` only switches it under plain names, and `infra:status` and `infra:up` say which it is.
import { spawnSync } from 'node:child_process';

import { INFRA_CONTEXT, isRemoteEndpoint } from './remote-infra.ts';

// The Docker context of each laptop. On the primary, Docker Desktop's own context.
export const MACHINES = { secondary: INFRA_CONTEXT, primary: 'desktop-linux' } as const;

export type Machine = keyof typeof MACHINES;

export function isMachine(name: string | undefined): name is Machine {
  return name === 'secondary' || name === 'primary';
}

export function describeContext(context: string, endpoint: string): string {
  if (context === MACHINES.secondary) return `the secondary laptop (Docker context ${context})`;
  if (context === MACHINES.primary) return `this laptop (Docker context ${context})`;
  return isRemoteEndpoint(endpoint)
    ? `another machine (Docker context ${context}, ${endpoint})`
    : `this laptop (Docker context ${context})`;
}

// DOCKER_HOST and DOCKER_CONTEXT beat the chosen context, so a switch would change nothing.
export function envOverrideProblem(env: NodeJS.ProcessEnv): string | undefined {
  const set = ['DOCKER_HOST', 'DOCKER_CONTEXT'].filter((name) => env[name]);
  if (set.length === 0) return undefined;
  return `${set.join(' and ')} ${set.length > 1 ? 'are' : 'is'} set in this shell, so Docker follows it instead of the chosen laptop. Unset it and try again.`;
}

export interface SwitchState {
  /** The laptop the containers run on now, in words (describeContext). */
  current: string;
  /** Whether the SSH tunnel to the secondary still answers on its ports. */
  tunnelOpen: boolean;
  /** Running containers of the development project on the current laptop; undefined if it cannot be reached. */
  running: number | undefined;
}

// Switching while something still runs would leave containers or a tunnel nobody stops.
export function switchProblem({ current, tunnelOpen, running }: SwitchState): string | undefined {
  if (tunnelOpen) {
    return 'The SSH tunnel to the secondary laptop is still open: run npm run infra:down first.';
  }
  if (running !== undefined && running > 0) {
    return `${String(running)} container${running === 1 ? ' is' : 's are'} still running on ${current}: run npm run infra:down first.`;
  }
  return undefined;
}

export function currentContext(): string {
  const result = spawnSync('docker', ['context', 'show'], { encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim() : '';
}

export function contextExists(name: string): boolean {
  return spawnSync('docker', ['context', 'inspect', name], { stdio: 'ignore' }).status === 0;
}

export function useContext(name: string): boolean {
  return spawnSync('docker', ['context', 'use', name], { stdio: 'ignore' }).status === 0;
}
