import { CliError } from './cli-error.ts';
import type { Exec } from './exec.ts';
import type { Logger } from './logger.ts';
import { buildOrder, discoverPackages, resolvePackage } from './workspace.ts';

export interface BuildOptions {
  root: string;
  names: string[];
  dryRun: boolean;
  log: Logger;
  exec: Exec;
}

// `build`: all packages, or the named ones, each after the packages it needs (devDependencies
// included). The order is checked here first, so a circle is named instead of left to Turborepo's
// message; Turborepo then builds, in parallel where the order allows and from cache where it can.
export function build({ root, names, dryRun, log, exec }: BuildOptions): number {
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
  const { status } = exec('turbo', ['run', 'build', ...filters], { cwd: root, inherit: true });
  if (status !== 0) {
    throw new CliError(
      'BUILD_FAILED',
      `The build failed (turbo exit code ${String(status)}).`,
      'Read the build output above, fix the package it names, then run the command again.',
    );
  }
  return 0;
}
