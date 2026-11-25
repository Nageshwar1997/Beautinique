import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { CliError } from './cli-error.ts';
import { confirm, type Ask } from './confirm.ts';
import type { Exec } from './exec.ts';
import type { Logger } from './logger.ts';
import { satisfies } from './ranges.ts';
import { packageStatuses, repoVersion, type PackageStatus } from './status.ts';
import { verify } from './verify.ts';
import { buildOrder, discoverPackages, resolvePackage, type PackageInfo } from './workspace.ts';

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

/** The versions the workflow's tag job may tag, inside ARTIFACT_DIR (see TagEntry). */
export const TAGS_FILE = 'tags.json';

export interface PlanEntry {
  name: string;
  version: string;
  tarball: string;
  tag: string;
}

// A version for the tag job. One this run publishes (`thisRun`) is tagged at the release commit when
// npm has it and the repository has no such tag yet, also after a publish that failed midway. One
// npm already had is never tagged here: it may have gone out from the owner's laptop, whose tag
// belongs on the commit it was published from, so the job only warns that its tag is missing.
export interface TagEntry {
  name: string;
  version: string;
  tag: string;
  thisRun: boolean;
}

export const tagOf = (name: string, version: string) => `${name}@${version}`;

// The dependency fields a published package needs when it is installed; devDependencies are not.
const RUNTIME_FIELDS = ['dependencies', 'peerDependencies', 'optionalDependencies'] as const;

// The statuses of the chosen packages, plus every own package they need (also through another one)
// whose needed version npm does not have yet: it goes into the same plan, before the package that
// needs it, so nothing goes out that cannot be installed.
async function scopeStatuses(
  registry: string,
  all: PackageInfo[],
  selected: PackageInfo[],
): Promise<PackageStatus[]> {
  const byName = new Map(all.map((pkg) => [pkg.name, pkg]));
  const statuses = new Map<string, PackageStatus>();
  const statusOf = async (pkg: PackageInfo): Promise<PackageStatus> => {
    const known = statuses.get(pkg.name);
    if (known) return known;
    const [found] = await packageStatuses(registry, [pkg]);
    if (!found) throw new Error(`The registry gave no status for ${pkg.name}.`);
    statuses.set(pkg.name, found);
    return found;
  };

  const chosen = new Set(selected.map((pkg) => pkg.name));
  for (const pkg of selected) await statusOf(pkg);
  const queue = [...selected];
  while (queue.length > 0) {
    const pkg = queue.shift();
    if (!pkg) break;
    for (const field of RUNTIME_FIELDS) {
      const section = (pkg.manifest[field] ?? {}) as Record<string, string>;
      for (const [name, range] of Object.entries(section)) {
        const dep = byName.get(name);
        if (!dep || chosen.has(name)) continue;
        const status = await statusOf(dep);
        if (status.npmVersions.some((version) => satisfies(version, range))) continue;
        if (!satisfies(status.repoVersion, range)) {
          throw new CliError(
            'PUBLISH_DEPENDENCY_MISSING',
            `${pkg.name} needs ${name} ${range}, which neither npm nor the repository (${status.repoVersion}) has.`,
            `Fix the range of ${name} in ${pkg.name}, then run publish again.`,
          );
        }
        chosen.add(name);
        queue.push(dep);
      }
    }
  }
  return all.flatMap((pkg) => {
    const status = chosen.has(pkg.name) ? statuses.get(pkg.name) : undefined;
    return status ? [status] : [];
  });
}

// The versions that npm does not have yet, each after the packages it needs.
function toPublish(statuses: PackageStatus[], all: PackageInfo[]) {
  const pending = statuses.filter((row) => row.state !== 'published');
  const order = buildOrder(
    all,
    pending.map((row) => row.pkg),
  ).filter((pkg) => pending.some((row) => row.pkg.name === pkg.name));
  return order.flatMap((pkg) => pending.filter((row) => row.pkg.name === pkg.name));
}

// What verify checks: every package, or with names the chosen ones and the own packages that go out
// with them, so nothing is published unchecked.
function verifyNames(names: string[], statuses: PackageStatus[]): string[] {
  return names.length > 0 ? statuses.map((row) => row.pkg.name) : [];
}

function stdout(exec: Exec, command: string, args: string[], cwd: string): string {
  const result = exec(command, args, { cwd });
  return result.status === 0 ? result.stdout.trim() : '';
}

function hasTag(exec: Exec, root: string, tag: string): boolean {
  return (
    exec('git', ['rev-parse', '-q', '--verify', `refs/tags/${tag}`], { cwd: root }).status === 0
  );
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
// not have and write the plan for the publish job, and the versions the tag job may tag. A package
// npm has never seen is refused: its first publish comes from the owner's laptop (TASK §3.8 rule 5).
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
  const statuses = await scopeStatuses(registry, all, selected);
  const fresh = statuses.filter((row) => row.state === 'new');
  if (fresh.length > 0) {
    throw new CliError(
      'PUBLISH_NEW_PACKAGE',
      `Never published to npm: ${fresh.map((row) => row.pkg.name).join(', ')}.`,
      'Publish a new package the first time from the owner laptop (npm run packages:publish), then add its trusted publisher with npm trust.',
    );
  }
  verify({ root, names: verifyNames(names, statuses), log, exec });

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
  const tags: TagEntry[] = statuses.map((row) => ({
    name: row.pkg.name,
    version: row.repoVersion,
    tag: tagOf(row.pkg.name, row.repoVersion),
    thisRun: row.state !== 'published',
  }));
  writeFileSync(join(artifact, 'plan.json'), `${JSON.stringify(plan, null, 2)}\n`);
  writeFileSync(join(artifact, TAGS_FILE), `${JSON.stringify(tags, null, 2)}\n`);
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
  const statuses = await scopeStatuses(registry, all, selected);
  verify({ root, names: verifyNames(names, statuses), log, exec });

  // A version on npm with no tag here: tags not fetched, or a tag that was never made. Its tag belongs
  // on the commit it was published from, which only the owner knows, so it is reported, not made.
  const untagged = statuses
    .filter((row) => row.state === 'published')
    .map((row) => tagOf(row.pkg.name, row.repoVersion))
    .filter((tag) => !hasTag(exec, root, tag));
  if (untagged.length > 0) {
    log.warn(
      `On npm but without a tag here: ${untagged.join(', ')}. Run git fetch --tags; a tag still missing goes on the commit the version was published from: git tag <tag> <commit>, then git push origin refs/tags/<tag>.`,
    );
  }

  const queue = toPublish(statuses, all);
  if (queue.length === 0) {
    log.info('Nothing to publish: every version is already on npm.');
    return 0;
  }
  log.info('To publish, in this order:');
  for (const row of queue) {
    const chosen = selected.some((pkg) => pkg.name === row.pkg.name);
    const notes = [
      ...(row.state === 'new' ? ['new package'] : []),
      ...(chosen ? [] : ['needed by a chosen package']),
    ];
    log.info(
      `  ${tagOf(row.pkg.name, row.repoVersion)}${notes.length > 0 ? `  (${notes.join(', ')})` : ''}`,
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
      done.push(tag);
      if (!hasTag(exec, root, tag)) {
        const tagged = exec('git', ['tag', tag], { cwd: root });
        if (tagged.status !== 0) {
          log.warn(
            `${tag} is on npm, but git could not tag it: ${tagged.stderr.trim()}. Tag it yourself: git tag ${tag}`,
          );
        }
      }
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
