import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { SCOPE, type PackageInfo } from './workspace.ts';

// The package rules `verify` checks from the files alone (docs/tasks/28-packages/TASK.md §3.3
// steps 4 and 5; docs/RULES.md CR-33 to CR-36). Each problem names its rule.
export interface Problem {
  package: string;
  rule: string;
  message: string;
}

// What a published package may hold: the build, the docs and the licence (§3.1), plus the
// Tailwind file of a frontend package (CR-33).
export const ALLOWED_FILES = ['dist', 'README.md', 'CHANGELOG.md', 'LICENSE', 'tailwind.css'];

function record(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}

function read(path: string): string | undefined {
  return existsSync(path) ? readFileSync(path, 'utf8') : undefined;
}

export interface RuleContext {
  /** `repository.url` of the root package.json. */
  repositoryUrl: string;
  /** Every package of the repo, to find the frontend packages one depends on. */
  all: PackageInfo[];
}

export function packageProblems(pkg: PackageInfo, context: RuleContext): Problem[] {
  const problems: Problem[] = [];
  const add = (rule: string, message: string) =>
    problems.push({ package: pkg.name, rule, message });
  const { manifest } = pkg;
  const frontend = pkg.category === 'frontend';

  // CR-34: name and folder, ESM only, a README, and a playground for a frontend package.
  const expectedName = `${SCOPE}${pkg.category}-${pkg.folder}`;
  if (pkg.name !== expectedName) add('CR-34', `the name must be ${expectedName}`);
  if (manifest.type !== 'module') add('CR-34', 'the package must be ESM ("type": "module")');
  const readme = read(join(pkg.dir, 'README.md'));
  if (readme === undefined) add('CR-34', 'README.md is missing');
  if (frontend && !existsSync(join(pkg.dir, 'playground'))) {
    add('CR-34', 'a frontend package needs a playground/ folder');
  }

  // CR-36: public like every package, and a README that says whether it should really be public.
  if (manifest.private === true) add('CR-36', 'the package must not be "private": true');
  if (readme !== undefined && !/^#{2,3}\s+Visibility\s*$/m.test(readme)) {
    add('CR-36', 'README.md needs a "Visibility" section');
  }

  // CR-33: the Tailwind file of a frontend package, and its import where it is shown.
  if (frontend) {
    const files = Array.isArray(manifest.files) ? manifest.files : [];
    const exported = record(manifest.exports)['./tailwind.css'];
    if (!files.includes('tailwind.css') || exported === undefined) {
      add('CR-33', 'tailwind.css must be in "files" and in "exports"');
    }
    const styles = read(join(pkg.dir, 'playground', 'styles.css'));
    if (styles === undefined || !/@import\s+['"]tailwindcss['"]/.test(styles)) {
      add('CR-33', "playground/styles.css must import 'tailwindcss'");
    } else if (!/@source\s+['"]\.\.\/src['"]/.test(styles)) {
      add('CR-33', "playground/styles.css must have @source '../src'");
    }
    for (const dep of pkg.internalDeps) {
      const other = context.all.find((candidate) => candidate.name === dep);
      if (other?.category === 'frontend' && !styles?.includes(`${dep}/tailwind.css`)) {
        add('CR-33', `playground/styles.css must import ${dep}/tailwind.css`);
      }
    }
  }

  // CR-35: a peer dependency has the very same range in devDependencies.
  const dev = record(manifest.devDependencies);
  for (const [name, range] of Object.entries(record(manifest.peerDependencies))) {
    if (dev[name] !== range) {
      add(
        'CR-35',
        `${name} is a peer dependency (${String(range)}) but devDependencies has ${String(dev[name])}`,
      );
    }
  }

  // The files allowlist, the exports, publishConfig and repository.
  const files = Array.isArray(manifest.files) ? manifest.files : [];
  if (files.length === 0) add('files', '"files" must list what is published');
  for (const entry of files) {
    if (typeof entry !== 'string' || !ALLOWED_FILES.includes(entry)) {
      add('files', `"files" may only hold ${ALLOWED_FILES.join(', ')}; found ${String(entry)}`);
    }
  }
  const main = record(record(manifest.exports)['.']);
  if (typeof main.types !== 'string' || typeof main.import !== 'string') {
    add('exports', 'exports["."] needs "types" and "import"');
  }
  const publish = record(manifest.publishConfig);
  if (publish.access !== 'public' || publish.provenance !== true) {
    add('publishConfig', 'publishConfig must be { "access": "public", "provenance": true }');
  }
  const repository = record(manifest.repository);
  const directory = `packages/${pkg.category}/${pkg.folder}`;
  if (repository.url !== context.repositoryUrl || repository.directory !== directory) {
    add('repository', `repository must be ${context.repositoryUrl} with directory ${directory}`);
  }
  return problems;
}
