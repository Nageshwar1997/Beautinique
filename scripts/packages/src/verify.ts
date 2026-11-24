import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { CliError } from './cli-error.ts';
import type { Exec } from './exec.ts';
import type { Logger } from './logger.ts';
import { packedPathProblems, packedPaths } from './pack.ts';
import { packageProblems, type Problem } from './rules.ts';
import { readJson } from './utils/read-json.ts';
import { buildOrder, discoverPackages, resolvePackage, type PackageInfo } from './workspace.ts';

export interface VerifyOptions {
  root: string;
  names: string[];
  log: Logger;
  exec: Exec;
}

function repositoryUrl(root: string): string {
  const manifest = readJson(join(root, 'package.json')) as { repository?: { url?: string } };
  return manifest.repository?.url ?? '';
}

// Every file `exports` points at must exist after the build, and the types too.
function exportProblems(pkg: PackageInfo): Problem[] {
  const problems: Problem[] = [];
  const walk = (value: unknown): string[] =>
    typeof value === 'string'
      ? [value]
      : typeof value === 'object' && value !== null
        ? Object.values(value).flatMap(walk)
        : [];
  for (const target of walk(pkg.manifest.exports)) {
    if (target.startsWith('./') && !existsSync(join(pkg.dir, target))) {
      problems.push({
        package: pkg.name,
        rule: 'exports',
        message: `exports points at ${target}, which does not exist after the build`,
      });
    }
  }
  return problems;
}

// `verify`: everything `publish` checks, without publishing. Dependencies are built first (by
// Turborepo), so it also works on a fresh clone and on CI.
export function verify({ root, names, log, exec }: VerifyOptions): number {
  const all = discoverPackages(root);
  if (all.length === 0) {
    log.info('No packages to verify yet.');
    return 0;
  }
  const selected = names.length > 0 ? names.map((name) => resolvePackage(all, name)) : all;
  buildOrder(all, selected);

  const context = { repositoryUrl: repositoryUrl(root), all };
  const problems = selected.flatMap((pkg) => packageProblems(pkg, context));

  // Build, typecheck, lint and tests of the chosen packages and what they need.
  const filters =
    names.length > 0
      ? selected.map((pkg) => `--filter=${pkg.name}...`)
      : ['--filter=./packages/*/*'];
  const turbo = exec('turbo', ['run', 'build', 'typecheck', 'lint', 'test', ...filters], {
    cwd: root,
    inherit: true,
  });
  if (turbo.status !== 0) {
    throw new CliError(
      'VERIFY_CHECKS_FAILED',
      `Build, typecheck, lint or tests failed (turbo exit code ${String(turbo.status)}).`,
      'Read the output above, fix what it names, then run verify again.',
    );
  }

  for (const pkg of selected) {
    problems.push(...exportProblems(pkg));
    const packed = packedPaths(pkg, exec);
    if (packed.error !== undefined) {
      problems.push({ package: pkg.name, rule: 'pack', message: packed.error });
    } else {
      problems.push(...packedPathProblems(pkg, packed.paths));
    }
  }

  if (problems.length > 0) {
    const lines = problems.map((p) => `  ${p.package} [${p.rule}] ${p.message}`);
    throw new CliError(
      'VERIFY_FAILED',
      `${String(problems.length)} problem(s):\n${lines.join('\n')}`,
      'Fix each problem above (the rule is in brackets: docs/RULES.md or docs/tasks/28-packages/TASK.md), then run verify again.',
    );
  }
  log.info(
    `Verified ${String(selected.length)} package(s): ${selected.map((p) => p.name).join(', ')}`,
  );
  return 0;
}

// Used by `create` and the tests: the static rules alone, with no build and no npm.
export function staticProblems(root: string, names: string[] = []): Problem[] {
  const all = discoverPackages(root);
  const selected = names.length > 0 ? names.map((name) => resolvePackage(all, name)) : all;
  const context = { repositoryUrl: repositoryUrl(root), all };
  return selected.flatMap((pkg) => packageProblems(pkg, context));
}
