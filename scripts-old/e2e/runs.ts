// Each E2E run's backend and databases (QA-TOOL-002). Playwright runs the globalTeardown before it
// stops its web servers, and then stops them by force (taskkill /F on Windows, SIGKILL elsewhere):
// the backend never hears a signal, and while it lives its leases and watchdog write again into the
// databases the teardown just dropped (59 such databases piled up on one laptop). So the backend
// says where it runs (a pid file), and the teardown stops it, waits until it is gone, then drops.
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { Mongo } from '@beautinique/backend-server-mongo';

export interface RunOptions {
  /** Where the runs' pid files live (default the OS temp folder). */
  dir?: string;
  /** The runs' database prefix (default `bq_e2e_`; a test uses its own). */
  prefix?: string;
}

const pidFile = (runId: string, dir = tmpdir()) => join(dir, `bq-e2e-${runId}.pid`);

/** The backend's mark that it runs, for the teardown (scripts/e2e/backend.ts, once it listens). */
export function markRunning(runId: string, { dir }: RunOptions = {}): void {
  writeFileSync(pidFile(runId, dir), String(process.pid));
}

/** The backend's own clean stop takes its mark away. */
export function unmarkRunning(runId: string, { dir }: RunOptions = {}): void {
  rmSync(pidFile(runId, dir), { force: true });
}

function pidOf(runId: string, dir?: string): number | null {
  try {
    const pid = Number(readFileSync(pidFile(runId, dir), 'utf8'));
    return Number.isInteger(pid) && pid > 0 ? pid : null;
  } catch {
    return null;
  }
}

/** Whether a process lives (one that is not ours to signal still counts). */
function alive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === 'EPERM';
  }
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Stops the run's backend if it still runs (a clean stop where signals work), and waits for it. */
async function stopBackend(runId: string, dir?: string): Promise<void> {
  const pid = pidOf(runId, dir);
  if (pid !== null && alive(pid)) {
    process.kill(pid);
    for (let tries = 0; alive(pid) && tries < 150; tries += 1) await wait(100);
    if (alive(pid)) process.kill(pid, 'SIGKILL');
    for (let tries = 0; alive(pid) && tries < 50; tries += 1) await wait(100);
  }
  unmarkRunning(runId, { dir });
}

/**
 * After a run (Playwright's globalTeardown): its backend stops first, then every run's databases
 * whose backend is not running go: this run's, and those a stopped or broken run left. A run still
 * going (its backend alive) keeps its own. Answers the databases dropped.
 */
export async function cleanUpRun(
  mongo: Mongo,
  runId: string | undefined,
  { dir, prefix = 'bq_e2e_' }: RunOptions = {},
): Promise<string[]> {
  if (runId !== undefined && runId !== '') await stopBackend(runId, dir);
  const { databases } = await mongo.client.db('admin').admin().listDatabases({ nameOnly: true });
  const dropped: string[] = [];
  for (const { name } of databases) {
    if (!name.startsWith(prefix)) continue;
    // <prefix><run>_<deployable>
    const run = name.slice(prefix.length).split('_')[0] ?? '';
    const pid = pidOf(run, dir);
    if (pid !== null && alive(pid)) continue;
    await mongo.client.db(name).dropDatabase();
    unmarkRunning(run, { dir });
    dropped.push(name);
  }
  return dropped;
}
