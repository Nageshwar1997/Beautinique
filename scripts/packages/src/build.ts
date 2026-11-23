import { spawnSync } from 'node:child_process';

import { CliError } from './cli-error.ts';
import type { Logger } from './logger.ts';
import { buildOrder, discoverPackages, resolvePackage } from './workspace.ts';

export type RunTurbo = (args: string[], cwd: string) => number;

// Turborepo runs from `npm run`, so `turbo` is on the PATH; on Windows it is a .cmd file.
export const runTurbo: RunTurbo = (args, cwd) => {
  const result = spawnSync('turbo', args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  return result.status ?? 1;
};

export interface BuildOptions {
  root: string;
  names: string[];
  dryRun: boolean;
  log: Logger;
  run?: RunTurbo | undefined;
}

// `build`: all packages, or the named ones, each after the packages it needs (devDependencies
// included). The order is checked here first, so a circle is named instead of left to Turborepo's
// message; Turborepo then builds, in parallel where the order allows and from cache where it can.
export function build({ root, names, dryRun, log, run = runTurbo }: BuildOptions): number {
  const all = discoverPackages(root);
  if (all.length === 0) {
    log.info('No packages to build yet.');
    return 0;
  }
  const selected = names.map((name) => resolvePackage(all, name));
  const order = buildOrder(all, selected.length > 0 ? selected : all);
  log.info(`Build order: ${order.map((pkg) => pkg.name).join(', ')}`);
  if (dryRun) return 0;

  const filters =
    selected.length > 0
      ? selected.map((pkg) => `--filter=${pkg.name}...`)
      : ['--filter=./packages/*/*'];
  const status = run(['run', 'build', ...filters], root);
  if (status !== 0) {
    throw new CliError(
      'BUILD_FAILED',
      `The build failed (turbo exit code ${String(status)}).`,
      'Read the build output above, fix the package it names, then run the command again.',
    );
  }
  return 0;
}
