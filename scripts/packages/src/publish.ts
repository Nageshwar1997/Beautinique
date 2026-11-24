import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { CliError } from './cli-error.ts';
import { confirm, type Ask } from './confirm.ts';
import type { Exec } from './exec.ts';
import type { Logger } from './logger.ts';
import { packageStatuses, repoVersion, type PackageStatus } from './status.ts';
import { verify } from './verify.ts';
import { buildOrder, discoverPackages, resolvePackage } from './workspace.ts';

export interface PublishOptions {
  root: string;
  registry: string;
  names: string[];
  dryRun: boolean;
  /** The workflow's mode: pack tarballs for the publish job, publish nothing. */
  ci: boolean;
  env: Record<string, string | undefined>;
  ask: Ask;
  log: Logger;
  exec: Exec;
}

/** Where the workflow's first job leaves the tarballs and the plan, from the repo root. */
export const ARTIFACT_DIR = 'publish-artifact';

export interface PlanEntry {
  name: string;
  version: string;
  tarball: string;
  tag: string;
}

export const tagOf = (name: string, version: string) => `${name}@${version}`;

// The versions that npm does not have yet, each after the packages it needs.
function toPublish(statuses: PackageStatus[], all: ReturnType<typeof discoverPackages>) {
  const pending = statuses.filter((row) => row.state !== 'published');
  const order = buildOrder(
    all,
    pending.map((row) => row.pkg),
  ).filter((pkg) => pending.some((row) => row.pkg.name === pkg.name));
  return order.flatMap((pkg) => pending.filter((row) => row.pkg.name === pkg.name));
}

function stdout(exec: Exec, command: string, args: string[], cwd: string): string {
  const result = exec(command, args, { cwd });
  return result.status === 0 ? result.stdout.trim() : '';
}

// The reasons a laptop publish must not start (OPERATIONS §11 rule 7); all of them at once, so the
// owner fixes everything in one go.
function laptopProblems(options: PublishOptions): string[] {
  const { root, exec, registry } = options;
  const problems: string[] = [];
  const branch = stdout(exec, 'git', ['branch', '--show-current'], root);
  if (branch !== 'release') {
    problems.push(`The branch is "${branch}", not release: publish runs from release only.`);
  }
  if (stdout(exec, 'git', ['status', '--porcelain'], root) !== '') {
    problems.push('The working tree is not clean: commit or remove the changes first.');
  }
  const hasIdentity =
    stdout(exec, 'git', ['config', 'user.name'], root) !== '' &&
    stdout(exec, 'git', ['config', 'user.email'], root) !== '';
  if (!hasIdentity) problems.push('No git identity: user.name and user.email must be set.');
  const whoami = exec('npm', ['whoami', '--registry', registry], { cwd: root });
  if (whoami.status !== 0 || whoami.stdout.trim() === '') {
    problems.push('Not logged in to npm: run npm login yourself, then publish again.');
  }
  return problems;
}

// `publish --ci` in the workflow's first job: verify, pack the tarballs of the versions npm does
// not have and write the plan for the publish job. A package npm has never seen is refused: its
// first publish comes from the owner's laptop (TASK §3.8 rule 5).
async function publishCi(options: PublishOptions): Promise<number> {
  const { root, registry, names, env, log, exec } = options;
  if (env.GITHUB_ACTIONS !== 'true') {
    throw new CliError(
      'PUBLISH_CI_OUTSIDE_ACTIONS',
      'publish --ci runs only inside GitHub Actions.',
      'From a laptop, run publish without --ci.',
    );
  }
  if (env.GITHUB_REF_NAME !== 'release') {
    throw new CliError(
      'PUBLISH_NOT_RELEASE',
      `The workflow runs on "${env.GITHUB_REF_NAME ?? ''}", not release.`,
      'Run the workflow from the release branch.',
    );
  }
  const all = discoverPackages(root);
  const selected = names.length > 0 ? names.map((name) => resolvePackage(all, name)) : all;
  const statuses = await packageStatuses(registry, selected);
  const fresh = statuses.filter((row) => row.state === 'new');
  if (fresh.length > 0) {
    throw new CliError(
      'PUBLISH_NEW_PACKAGE',
      `Never published to npm: ${fresh.map((row) => row.pkg.name).join(', ')}.`,
      'Publish a new package the first time from the owner laptop (npm run packages:publish), then add its trusted publisher with npm trust.',
    );
  }
  verify({ root, names, log, exec });

  const plan: PlanEntry[] = [];
  const artifact = join(root, ARTIFACT_DIR);
  rmSync(artifact, { recursive: true, force: true });
  mkdirSync(artifact, { recursive: true });
  for (const row of toPublish(statuses, all)) {
    const packed = exec('npm', ['pack', '--pack-destination', artifact, '--ignore-scripts'], {
      cwd: row.pkg.dir,
    });
    const tarball = packed.stdout.trim().split(/\r?\n/).at(-1) ?? '';
    if (packed.status !== 0 || tarball === '') {
      throw new CliError(
        'PUBLISH_PACK_FAILED',
        `npm pack failed for ${row.pkg.name}: ${packed.stderr.trim()}`,
        'Fix the package, then run the workflow again.',
      );
    }
    plan.push({
      name: row.pkg.name,
      version: row.repoVersion,
      tarball,
      tag: tagOf(row.pkg.name, row.repoVersion),
    });
  }
  writeFileSync(join(artifact, 'plan.json'), `${JSON.stringify(plan, null, 2)}\n`);
  log.info(
    plan.length > 0
      ? `Packed ${String(plan.length)} tarball(s): ${plan.map((entry) => entry.tag).join(', ')}`
      : 'Nothing to publish: every version is already on npm.',
  );
  return 0;
}

// `publish` from the owner's laptop: only the versions npm does not have, in dependency order, after
// the plan and a "haan". The owner types the npm one-time code. A second run after a failure
// publishes what is left; a tag is made only for a version that went out.
export async function publish(options: PublishOptions): Promise<number> {
  if (options.ci) return publishCi(options);
  const { root, registry, names, dryRun, ask, log, exec } = options;

  const problems = laptopProblems(options);
  if (problems.length > 0) {
    throw new CliError(
      'PUBLISH_NOT_READY',
      `Nothing was published:\n${problems.map((problem) => `  - ${problem}`).join('\n')}`,
      'Fix each point above, then run publish again.',
    );
  }
  const all = discoverPackages(root);
  const selected = names.length > 0 ? names.map((name) => resolvePackage(all, name)) : all;
  verify({ root, names, log, exec });
  const queue = toPublish(await packageStatuses(registry, selected), all);
  if (queue.length === 0) {
    log.info('Nothing to publish: every version is already on npm.');
    return 0;
  }
  log.info('To publish, in this order:');
  for (const row of queue) {
    log.info(
      `  ${tagOf(row.pkg.name, row.repoVersion)}${row.state === 'new' ? '  (new package)' : ''}`,
    );
  }
  if (
    !dryRun &&
    !(await confirm(ask, `Publish ${String(queue.length)} version(s) to ${registry}?`))
  ) {
    log.info('Nothing was published.');
    return 0;
  }

  const done: string[] = [];
  for (const row of queue) {
    // A laptop has no OIDC identity, so provenance is switched off here; the workflow adds it.
    const args = ['publish', '--access', 'public', '--provenance=false', '--registry', registry];
    const result = exec('npm', dryRun ? [...args, '--dry-run'] : args, {
      cwd: row.pkg.dir,
      inherit: true,
    });
    if (result.status !== 0) {
      throw new CliError(
        'PUBLISH_FAILED',
        `npm publish failed for ${tagOf(row.pkg.name, repoVersion(row.pkg))}. Published so far: ${done.join(', ') || 'nothing'}.`,
        'Run publish again: versions already on npm are skipped.',
      );
    }
    if (!dryRun) {
      const tag = tagOf(row.pkg.name, row.repoVersion);
      if (
        exec('git', ['rev-parse', '-q', '--verify', `refs/tags/${tag}`], { cwd: root }).status !== 0
      ) {
        exec('git', ['tag', tag], { cwd: root });
      }
      done.push(tag);
    }
  }
  if (dryRun) return 0;

  log.info(`Published ${String(done.length)} version(s): ${done.join(', ')}`);
  log.info('Next, yourself:');
  log.info('  - Push the tags when you are ready: git push origin <tag>');
  log.info('  - Back-merge release into prerelease with a PR (OPERATIONS §2).');
  for (const row of queue.filter((entry) => entry.state === 'new')) {
    log.info(`  - Add the trusted publisher for the new package: npm trust (${row.pkg.name}).`);
  }
  return 0;
}
