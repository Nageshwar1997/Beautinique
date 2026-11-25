// Development data between the two laptops (docs/OPERATIONS.md §1 rule 14). Only the development
// compose project and only MongoDB (Valkey keeps nothing; PostgreSQL joins later with pg_dump). Data
// only ever moves towards the primary: never to the secondary, and never from or to the restore
// drill's containers, which live in a compose project of their own.
import { type ChildProcess, spawn, spawnSync } from 'node:child_process';
import {
  createReadStream,
  createWriteStream,
  mkdirSync,
  readdirSync,
  renameSync,
  rmSync,
} from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { pipeline } from 'node:stream/promises';

import { COMPOSE_FILE, DEV_PROJECT, WAIT_SECONDS } from './infra.ts';
import { INFRA_CONTEXT, isRemoteEndpoint } from './remote-infra.ts';

// Where the snapshots of `infra:down` on the secondary go: outside the repository.
export const SNAPSHOT_DIR = join(homedir(), 'bq-dev-data');
export const KEEP_SNAPSHOTS = 3;

const SNAPSHOT_NAME = /^mongo-\d{8}T\d{6}Z\.archive\.gz$/;

export function snapshotName(date: Date): string {
  const stamp = date
    .toISOString()
    .replace(/\.\d+Z$/, 'Z')
    .replace(/[-:]/g, '');
  return `mongo-${stamp}.archive.gz`;
}

// The snapshots to delete so only the newest `keep` stay. Other files in the folder are never listed.
export function snapshotsToDelete(names: string[], keep: number = KEEP_SNAPSHOTS): string[] {
  const snapshots = names.filter((name) => SNAPSHOT_NAME.test(name)).sort();
  return snapshots.slice(0, Math.max(0, snapshots.length - keep));
}

export function latestSnapshot(names: string[]): string | undefined {
  return names
    .filter((name) => SNAPSHOT_NAME.test(name))
    .sort()
    .at(-1);
}

export function mongoPort(env: NodeJS.ProcessEnv = process.env): number {
  return Number(env.BQ_MONGO_PORT ?? 27017);
}

// The dump goes to stdout as one gzip archive. The admin and config databases are left out when
// restoring: they hold the server's own state, not development data.
export function mongoDumpArgs(port: number): string[] {
  return ['exec', '-T', 'mongo', 'mongodump', '--port', String(port), '--archive', '--gzip'];
}

export function mongoRestoreArgs(port: number): string[] {
  return [
    'exec',
    '-T',
    'mongo',
    'mongorestore',
    '--port',
    String(port),
    '--archive',
    '--gzip',
    '--drop',
    '--nsExclude',
    'admin.*',
    '--nsExclude',
    'config.*',
  ];
}

// `docker [--context <name>] compose` on the development project's compose file, with the project
// named explicitly, so no environment variable can point it at another project.
export function devComposeArgs(context: string | undefined, args: string[]): string[] {
  return [
    ...(context ? ['--context', context] : []),
    'compose',
    '-f',
    COMPOSE_FILE,
    '-p',
    DEV_PROJECT,
    ...args,
  ];
}

// The development MongoDB alone, without the SSH tunnel that `infra:up` opens. The copy reaches both
// MongoDB servers with `docker exec`, so it needs no ports on this laptop; the tunnel would take the
// very ports (27017, 6379) that this laptop's own containers publish, and one of the two would not start.
const MONGO_SERVICE = 'mongo';
const MONGO_PROFILE = 'backend';

// Starts only MongoDB and returns once it is healthy. Data volumes are never touched.
export function mongoUpArgs(): string[] {
  return [
    '--profile',
    MONGO_PROFILE,
    'up',
    '--detach',
    '--wait',
    '--wait-timeout',
    String(WAIT_SECONDS),
    MONGO_SERVICE,
  ];
}

// Stops only MongoDB: the container and the data volume stay, so nothing is lost.
export function mongoStopArgs(): string[] {
  return ['--profile', MONGO_PROFILE, 'stop', MONGO_SERVICE];
}

export interface ContextRow {
  name: string;
  endpoint: string;
}

// The Docker context of this laptop's own Docker: not an ssh:// one; Docker Desktop's first.
export function pickLocalContext(rows: ContextRow[]): string | undefined {
  const local = rows.filter((row) => !isRemoteEndpoint(row.endpoint));
  return (
    local.find((row) => row.name === 'desktop-linux') ??
    local.find((row) => row.name === 'default') ??
    local[0]
  )?.name;
}

export interface CopyPlan {
  project: string;
  sourceEndpoint: string;
  targetEndpoint: string;
}

// Why a copy must not run; empty when it may.
export function copyProblems(plan: CopyPlan): string[] {
  const problems: string[] = [];
  if (plan.project !== DEV_PROJECT) {
    problems.push(
      `Only the development project "${DEV_PROJECT}" is copied, not "${plan.project}".`,
    );
  }
  if (!isRemoteEndpoint(plan.sourceEndpoint)) {
    problems.push('The source must be the secondary laptop (an ssh:// Docker context).');
  }
  if (isRemoteEndpoint(plan.targetEndpoint)) {
    problems.push("Never copy towards the secondary: the target must be this laptop's own Docker.");
  }
  return problems;
}

// Why a restore must not run: the snapshot goes into this laptop's containers only.
export function restoreProblems(targetEndpoint: string, project: string): string[] {
  const problems: string[] = [];
  if (project !== DEV_PROJECT) {
    problems.push(`Only the development project "${DEV_PROJECT}" is restored, not "${project}".`);
  }
  if (isRemoteEndpoint(targetEndpoint)) {
    problems.push("Never restore into the secondary: the target must be this laptop's own Docker.");
  }
  return problems;
}

// DOCKER_HOST would override the context chosen here, so the data commands do not run with it set.
export function dockerHostProblems(env: NodeJS.ProcessEnv = process.env): string[] {
  return env.DOCKER_HOST
    ? ['Unset DOCKER_HOST: it would override the Docker context these commands choose.']
    : [];
}

function exitCode(child: ChildProcess): Promise<number> {
  return new Promise((resolve) => {
    child.once('error', () => {
      resolve(1);
    });
    child.once('close', (code) => {
      resolve(code ?? 1);
    });
  });
}

function dockerOutput(args: string[]): string | undefined {
  const result = spawnSync('docker', args, { encoding: 'utf8' });
  return result.status === 0 ? result.stdout : undefined;
}

export function localContexts(): ContextRow[] {
  const output = dockerOutput(['context', 'ls', '--format', '{{.Name}}\t{{.DockerEndpoint}}']);
  return (output ?? '')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const [name = '', endpoint = ''] = line.split('\t');
      return { name, endpoint };
    });
}

export function contextEndpoint(context: string): string {
  return (
    dockerOutput(['context', 'inspect', context, '--format', '{{.Endpoints.docker.Host}}']) ?? ''
  ).trim();
}

// Whether the development project's MongoDB container is running in that Docker.
export function mongoIsRunning(context: string | undefined): boolean {
  const output = dockerOutput(devComposeArgs(context, ['ps', '--status', 'running', '--services']));
  return (output ?? '').split(/\r?\n/).includes('mongo');
}

// Starts the development MongoDB of `context` alone (see mongoUpArgs); false when it did not come up.
export function startMongo(context: string): boolean {
  return (
    spawnSync('docker', devComposeArgs(context, mongoUpArgs()), { stdio: 'inherit' }).status === 0
  );
}

// Stops the development MongoDB of `context` again (see mongoStopArgs); false when that failed.
export function stopMongo(context: string): boolean {
  return (
    spawnSync('docker', devComposeArgs(context, mongoStopArgs()), { stdio: 'inherit' }).status === 0
  );
}

// Saves a dump of the running development MongoDB into SNAPSHOT_DIR, and keeps the newest three.
// `context` undefined means the current Docker context. Returns the file's name.
export async function snapshotMongo(
  context: string | undefined,
  dir: string = SNAPSHOT_DIR,
  now: Date = new Date(),
): Promise<string> {
  if (!mongoIsRunning(context))
    throw new Error('MongoDB is not running, so there is nothing to save.');
  mkdirSync(dir, { recursive: true });
  const name = snapshotName(now);
  const partial = join(dir, `${name}.partial`);
  const dump = spawn('docker', devComposeArgs(context, mongoDumpArgs(mongoPort())), {
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  const code = exitCode(dump);
  try {
    await pipeline(dump.stdout, createWriteStream(partial));
    if ((await code) !== 0) throw new Error('mongodump failed.');
  } catch (error) {
    rmSync(partial, { force: true });
    throw error;
  }
  renameSync(partial, join(dir, name));
  for (const old of snapshotsToDelete(readdirSync(dir))) rmSync(join(dir, old), { force: true });
  return name;
}

// Restores one snapshot into the running development MongoDB of `context`.
export async function restoreSnapshot(context: string | undefined, file: string): Promise<void> {
  const restore = spawn('docker', devComposeArgs(context, mongoRestoreArgs(mongoPort())), {
    stdio: ['pipe', 'inherit', 'inherit'],
  });
  const code = exitCode(restore);
  await pipeline(createReadStream(file), restore.stdin);
  if ((await code) !== 0) throw new Error('mongorestore failed.');
}

// Dumps the secondary's development MongoDB and restores it straight into this laptop's, no file between.
export async function copyFromSecondary(targetContext: string): Promise<void> {
  const port = mongoPort();
  const dump = spawn('docker', devComposeArgs(INFRA_CONTEXT, mongoDumpArgs(port)), {
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  const restore = spawn('docker', devComposeArgs(targetContext, mongoRestoreArgs(port)), {
    stdio: ['pipe', 'inherit', 'inherit'],
  });
  const codes = Promise.all([exitCode(dump), exitCode(restore)]);
  await pipeline(dump.stdout, restore.stdin);
  const [dumped, restored] = await codes;
  if (dumped !== 0) throw new Error('mongodump on the secondary failed.');
  if (restored !== 0) throw new Error('mongorestore on this laptop failed.');
}
