// The guards on Dependabot's config (docs/OPERATIONS.md §11 rule 1; D-461): monthly pull requests into
// prerelease after a 7-day cooldown; npm and GitHub Actions group minor and patch updates and leave
// each major on its own; Docker images take patch updates only.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { parse } from 'yaml';

import { ROOT } from './constants/paths.ts';

export const DEPENDABOT_FILE = join(ROOT, '.github', 'dependabot.yml');
export const COOLDOWN_DAYS = 7;

interface Group {
  patterns?: string[];
  'update-types'?: string[];
  'applies-to'?: string;
}

// One ecosystem's entry under `updates`.
export interface DependabotUpdate {
  'package-ecosystem'?: string;
  directory?: string;
  'target-branch'?: string;
  schedule?: { interval?: string };
  cooldown?: { 'default-days'?: number };
  'open-pull-requests-limit'?: number;
  ignore?: { 'dependency-name'?: string; 'update-types'?: string[] }[];
  groups?: Record<string, Group>;
}

// The fields of dependabot.yml that the guards read.
export interface DependabotConfig {
  version?: number;
  updates?: DependabotUpdate[];
}

// Each ecosystem, where its files are, and which update types it takes.
const ECOSYSTEMS = [
  { name: 'npm', directory: '/', takes: 'all' },
  { name: 'github-actions', directory: '/', takes: 'all' },
  { name: 'docker-compose', directory: '/infra', takes: 'patch' },
] as const;

const SKIPPED_BY_DOCKER = ['version-update:semver-major', 'version-update:semver-minor'];

export function readDependabot(file: string = DEPENDABOT_FILE): DependabotConfig {
  return parse(readFileSync(file, 'utf8')) as DependabotConfig;
}

const sameSet = (actual: string[] | undefined, expected: string[]) =>
  [...(actual ?? [])].sort().join() === [...expected].sort().join();

function updateProblems(update: DependabotUpdate, takes: 'all' | 'patch'): string[] {
  const name = update['package-ecosystem'] ?? '?';
  const problems: string[] = [];
  if (update['target-branch'] !== 'prerelease') {
    problems.push(`${name}: target-branch must be prerelease`);
  }
  if (update.schedule?.interval !== 'monthly') {
    problems.push(`${name}: schedule.interval must be monthly`);
  }
  if (update.cooldown?.['default-days'] !== COOLDOWN_DAYS) {
    problems.push(`${name}: cooldown.default-days must be ${String(COOLDOWN_DAYS)}`);
  }
  if (update['open-pull-requests-limit'] === 0) {
    problems.push(`${name}: open-pull-requests-limit 0 turns version updates off`);
  }

  const groups = Object.values(update.groups ?? {});
  if (groups.some((group) => group['applies-to'] === 'security-updates')) {
    problems.push(
      `${name}: security updates are off (they go to release), so no group is for them`,
    );
  }
  const grouped = takes === 'all' ? ['minor', 'patch'] : ['patch'];
  if (!groups.some((group) => sameSet(group['update-types'], grouped))) {
    problems.push(`${name}: one group must take exactly ${grouped.join(' and ')} updates`);
  }
  if (groups.some((group) => group['update-types']?.includes('major'))) {
    problems.push(`${name}: a major update gets its own pull request, never a group`);
  }

  const ignored = (update.ignore ?? []).flatMap((rule) => rule['update-types'] ?? []);
  if (takes === 'all' && ignored.length > 0) {
    problems.push(`${name}: no update type is ignored; majors come one by one`);
  }
  if (
    takes === 'patch' &&
    !(update.ignore ?? []).some(
      (rule) => rule['dependency-name'] === '*' && sameSet(rule['update-types'], SKIPPED_BY_DOCKER),
    )
  ) {
    problems.push(
      `${name}: every image must ignore major and minor updates (Atlas and Render set them)`,
    );
  }
  return problems;
}

export function dependabotProblems(config: DependabotConfig): string[] {
  const problems: string[] = [];
  if (config.version !== 2) problems.push('version must be 2');
  const updates = config.updates ?? [];
  for (const { name, directory, takes } of ECOSYSTEMS) {
    const matching = updates.filter((update) => update['package-ecosystem'] === name);
    const update = matching[0];
    if (matching.length !== 1 || !update) {
      problems.push(`${name}: needs exactly one entry`);
      continue;
    }
    if (update.directory !== directory) problems.push(`${name}: directory must be ${directory}`);
    problems.push(...updateProblems(update, takes));
  }
  return problems;
}
