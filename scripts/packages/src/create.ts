import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { CliError } from './cli-error.ts';
import { confirm, type Ask } from './confirm.ts';
import type { Exec } from './exec.ts';
import type { Logger } from './logger.ts';
import { fetchPackument } from './registry.ts';
import { packageFiles } from './template.ts';
import { bumpVersion, highestVersion } from './utils/semver.ts';
import { readJson } from './utils/read-json.ts';
import { verify } from './verify.ts';
import { CATEGORIES, SCOPE, type Category } from './workspace.ts';

export interface CreateOptions {
  root: string;
  registry: string;
  category: string | undefined;
  name: string | undefined;
  description: string | undefined;
  dryRun: boolean;
  ask: Ask;
  log: Logger;
  exec: Exec;
}

const NAME_FORMAT = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

async function valueOrAsk(value: string | undefined, ask: Ask, question: string): Promise<string> {
  return value ?? (await ask(question)).trim();
}

// `create`: a new package from the template. Everything is checked before anything is written; the
// plan is shown and "haan" asked; then the files are written, the workspace installed and the new
// package verified (docs/tasks/28-packages/TASK.md §3.1).
export async function create(options: CreateOptions): Promise<number> {
  const { root, registry, ask, log, exec } = options;
  const category = await valueOrAsk(options.category, ask, `Category (${CATEGORIES.join(', ')}): `);
  if (!isCategory(category)) {
    throw new CliError(
      'CREATE_CATEGORY_INVALID',
      `Category must be one of ${CATEGORIES.join(', ')}; got "${category}".`,
      'Pass --category shared, frontend or backend.',
    );
  }
  const name = await valueOrAsk(options.name, ask, 'Name (lowercase letters, digits and -): ');
  if (!NAME_FORMAT.test(name)) {
    throw new CliError(
      'CREATE_NAME_INVALID',
      `The name "${name}" must be lowercase letters, digits and single dashes.`,
      'Pass --name like money or date-format.',
    );
  }
  const description = await valueOrAsk(options.description, ask, 'What does it do (one line): ');
  if (description === '') {
    throw new CliError(
      'CREATE_DESCRIPTION_MISSING',
      'A package needs a one-line description of what it does.',
      'Pass --description "<one line>".',
    );
  }

  const dir = join(root, 'packages', category, name);
  if (existsSync(dir)) {
    throw new CliError(
      'CREATE_FOLDER_EXISTS',
      `packages/${category}/${name} already exists.`,
      'Pick another name, or work in the existing package.',
    );
  }

  // The scope is ours, so a name on npm already means earlier versions of ours: the new package
  // starts at the next major and never repeats a version.
  const packageName = `${SCOPE}${category}-${name}`;
  const packument = await fetchPackument(registry, packageName);
  const highest = packument ? highestVersion(packument.versions) : undefined;
  const version = highest ? bumpVersion(highest, 'major') : '1.0.0';

  const rootManifest = readJson(join(root, 'package.json')) as { engines?: { node?: string } };
  const files = packageFiles({
    category,
    name,
    packageName,
    description,
    version,
    node: rootManifest.engines?.node ?? '',
    license: readFileSync(join(root, 'LICENSE'), 'utf8'),
  });

  log.info(`Create ${packageName} ${version} in packages/${category}/${name}:`);
  for (const path of Object.keys(files)) log.info(`  ${path}`);
  if (highest)
    log.info(`The name already has versions on npm (up to ${highest}); starting at ${version}.`);
  if (options.dryRun) return 0;
  if (!(await confirm(ask, 'Write these files, then install and verify?'))) {
    log.info('Nothing was written.');
    return 0;
  }

  for (const [path, content] of Object.entries(files)) {
    const target = join(dir, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content, { flag: 'wx' });
  }
  const install = exec('npm', ['install', '--ignore-scripts'], { cwd: root, inherit: true });
  if (install.status !== 0) {
    throw new CliError(
      'CREATE_INSTALL_FAILED',
      `npm install failed (exit code ${String(install.status)}); the package files are written.`,
      `Fix the install, then run: npm run packages:verify -- ${packageName}`,
    );
  }
  return verify({ root, names: [packageName], log, exec });
}
