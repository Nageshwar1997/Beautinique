// The containers on the secondary laptop (docs/OPERATIONS.md §1 rules 11 to 14). The primary drives
// the secondary's Docker through a Docker context over SSH. The ports stay on the secondary's
// 127.0.0.1 and reach the primary's 127.0.0.1 through one SSH tunnel, opened under its own ssh host
// alias, so Docker's own ssh connections never try to bind a port.
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createConnection } from 'node:net';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';

import type { ComposeConfig } from './infra.ts';

// The Docker context of the secondary laptop and the two ssh host aliases (~/.ssh/config).
export const INFRA_CONTEXT = 'bq-infra';
export const TUNNEL_HOST = 'bq-infra-tunnel';

// Where the open tunnel is remembered: outside the repository, in the user's own folder.
export const TUNNEL_STATE_FILE = join(homedir(), '.bq-infra', 'tunnel.json');

// How long `infra:up` waits for the tunnel's ports to open.
const TUNNEL_WAIT_MS = 15_000;

export interface TunnelState {
  pid: number;
  ports: number[];
}

// A Docker context whose endpoint starts with ssh:// is a machine other than this one.
export function isRemoteEndpoint(endpoint: string): boolean {
  return endpoint.startsWith('ssh://');
}

// The Docker endpoint of the current context: DOCKER_HOST wins, as it does for Docker itself.
export function dockerEndpoint(env: NodeJS.ProcessEnv = process.env): string {
  if (env.DOCKER_HOST) return env.DOCKER_HOST;
  const result = spawnSync(
    'docker',
    ['context', 'inspect', '--format', '{{.Endpoints.docker.Host}}'],
    {
      encoding: 'utf8',
      env,
    },
  );
  return result.status === 0 ? result.stdout.trim() : '';
}

// Every port the started containers publish, once each, from `docker compose config`.
export function publishedPorts(config: ComposeConfig): number[] {
  const ports = Object.values(config.services ?? {}).flatMap((service) =>
    (service.ports ?? []).map((port) => Number(port.published)),
  );
  return [...new Set(ports.filter((port) => Number.isInteger(port) && port > 0))].sort(
    (a, b) => a - b,
  );
}

// The ssh arguments of the tunnel: one forward per published port, 127.0.0.1 on both sides. BatchMode
// makes ssh fail at once instead of asking for a passphrase nobody can see; the key comes from the ssh agent.
export function tunnelArgs(ports: number[], host: string = TUNNEL_HOST): string[] {
  return [
    '-N',
    '-o',
    'BatchMode=yes',
    '-o',
    'ExitOnForwardFailure=yes',
    '-o',
    'ServerAliveInterval=30',
    ...ports.flatMap((port) => ['-L', `127.0.0.1:${String(port)}:127.0.0.1:${String(port)}`]),
    host,
  ];
}

// Whether something already answers on the primary's 127.0.0.1:port.
export function isListening(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = createConnection({ host: '127.0.0.1', port });
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
  });
}

export async function takenPorts(ports: number[]): Promise<number[]> {
  const states = await Promise.all(
    ports.map(async (port) => [port, await isListening(port)] as const),
  );
  return states.filter(([, listening]) => listening).map(([port]) => port);
}

export function readTunnel(stateFile: string = TUNNEL_STATE_FILE): TunnelState | undefined {
  try {
    return JSON.parse(readFileSync(stateFile, 'utf8')) as TunnelState;
  } catch {
    return undefined;
  }
}

// The error when a port is already taken: an earlier tunnel, or Docker running on this laptop.
export function portsTakenMessage(taken: number[], tunnel: TunnelState | undefined): string {
  const list = taken.join(', ');
  const cause = tunnel
    ? `An SSH tunnel is still open (process ${String(tunnel.pid)}): run npm run infra:down first.`
    : 'Docker on this laptop may be running its own containers: stop them (npm run infra:down on the local context) and try again.';
  return `Port ${list} on 127.0.0.1 is already taken, so the secondary's containers cannot be reached there. ${cause}`;
}

// The tunnel belongs to the secondary's containers, so only `down` on the secondary closes it. A `down`
// on this laptop's own Docker leaves it open and says so, because the secondary's containers keep running.
export function tunnelLeftOpenNotice(
  tunnel: TunnelState | undefined,
  open: boolean,
): string | undefined {
  if (!tunnel || !open) return undefined;
  return `An SSH tunnel to the secondary laptop (process ${String(tunnel.pid)}) is still open, and its containers keep running: run npm run infra:use -- secondary, then npm run infra:down.`;
}

async function waitForPorts(ports: number[], timeoutMs: number): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if ((await takenPorts(ports)).length === ports.length) return true;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return false;
}

// Opens the one tunnel for `ports`, remembers its process id, and returns once every port answers.
export async function openTunnel(
  ports: number[],
  stateFile: string = TUNNEL_STATE_FILE,
): Promise<void> {
  if (ports.length === 0) return;
  const taken = await takenPorts(ports);
  if (taken.length > 0) throw new Error(portsTakenMessage(taken, readTunnel(stateFile)));

  const child = spawn('ssh', tunnelArgs(ports), {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  });
  child.unref();
  if (child.pid === undefined) throw new Error('ssh did not start: is OpenSSH installed?');
  mkdirSync(dirname(stateFile), { recursive: true });
  writeFileSync(stateFile, JSON.stringify({ pid: child.pid, ports } satisfies TunnelState));

  if (!(await waitForPorts(ports, TUNNEL_WAIT_MS))) {
    await closeTunnel(stateFile);
    throw new Error(
      `The SSH tunnel (${TUNNEL_HOST}) did not open its ports. Check that ${TUNNEL_HOST} is in ~/.ssh/config, the secondary is on and the ssh agent holds the key.`,
    );
  }
}

// The program name of a running process, lower case and without .exe; empty when there is none.
export function processName(pid: number): string {
  const result =
    process.platform === 'win32'
      ? spawnSync('tasklist', ['/FI', `PID eq ${String(pid)}`, '/FO', 'CSV', '/NH'], {
          encoding: 'utf8',
          windowsHide: true,
        })
      : spawnSync('ps', ['-p', String(pid), '-o', 'comm='], { encoding: 'utf8' });
  if (result.status !== 0) return '';
  const first = result.stdout.trim().split(/\r?\n/)[0] ?? '';
  // tasklist: "ssh.exe","1234",...; with no such process it prints an INFO line, not a quoted name.
  const name = process.platform === 'win32' ? (/^"([^"]+)"/.exec(first)?.[1] ?? '') : first;
  return (
    name
      .toLowerCase()
      .replace(/\.exe$/, '')
      .split(/[\\/]/)
      .at(-1) ?? ''
  );
}

// Closes the tunnel the state file remembers. The process is only killed while its ports still
// answer and it is still ssh, so a process id that was reused (after a reboot, or after ssh exited
// when the network went) is never touched, even when another program now holds those ports. True
// if a tunnel was closed.
export async function closeTunnel(
  stateFile: string = TUNNEL_STATE_FILE,
  nameOf: (pid: number) => string = processName,
): Promise<boolean> {
  const tunnel = readTunnel(stateFile);
  if (!tunnel) return false;
  const alive = (await takenPorts(tunnel.ports)).length > 0 && nameOf(tunnel.pid) === 'ssh';
  if (alive) {
    try {
      process.kill(tunnel.pid);
    } catch {
      // Already gone.
    }
  }
  rmSync(stateFile, { force: true });
  return alive;
}
