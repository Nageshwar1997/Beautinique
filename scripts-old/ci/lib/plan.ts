/**
 * What a CI job has to do (RULES §2, "CI"). Every job of .github/workflows/ci.yml asks this first and
 * skips its steps when the answer is nothing, so it still ends green.
 *
 * - Same code, already passed: a run that tested everything and passed leaves a marker artifact named
 *   after the git tree it tested (`ci-pass-<tree>`). The tree is the code itself, not the commit, so
 *   the merge commit of that pull request, the release pull request and the pushes to release and
 *   main find it and run nothing heavy. Any changed file (this one and ci.yml too) is another tree.
 * - Affected only: a pull request into prerelease (a feature branch) tests only the workspaces its
 *   change reaches, the workspace itself and every workspace that uses it. Everything else tests
 *   everything: every push (the push to prerelease after a merge runs in the background and catches
 *   what an affected-only run missed), pull requests into release and main, and any change outside
 *   the workspaces and the docs (scripts/, configs/, infra/, .github/, the root package.json, the lock
 *   file ...). When in doubt, everything.
 *
 * Runs before `npm ci`, so it uses Node's own modules only (not the package CLI's workspace loader,
 * which needs semver).
 */
import { posix } from 'node:path';

/** The CI jobs that ask (ci.yml); `guard` and `check` run every time and do not ask. */
export const JOBS = [
  'static',
  'test-scripts',
  'test-backend',
  'test-frontend',
  'e2e',
  'verify',
] as const;
export type Job = (typeof JOBS)[number];

/** The marker artifact a passing full run leaves: `ci-pass-<tree>`. */
export const MARKER_PREFIX = 'ci-pass-';

/** The workflow whose markers count. */
export const CI_WORKFLOW = '.github/workflows/ci.yml';

/** A workspace (an npm workspace: package, app or backend deployable) as CI sees it. */
export interface WorkspaceInfo {
  /** posix path from the repo root, e.g. packages/shared/utils */
  dir: string;
  name: string;
  scripts: string[];
  /** dirs of the workspaces it uses: package.json dependencies and relative imports into them */
  uses: string[];
}

/**
 * Files that nothing builds, lints or tests (only Prettier reads them, and the format check runs on
 * every run). A file inside a workspace is never one of these, its README included: a test may read
 * it (frontend-icons reads its LICENSES.md).
 */
const DOCS = [
  /^docs\//,
  /^linkedin-posts\//,
  /^\.claude\//,
  /^\.vscode\//,
  /^[^/]+\.md$/,
  /^LICENSE$/,
];

const SOURCE_FILE = /\.(?:[cm]?[jt]sx?|css)$/;
// import x from '../a', export * from '../a', import '../a', import('../a'), require('../a'),
// and the CSS ones: @import, @source, @plugin, @config, @reference
const RELATIVE_SPECIFIER =
  /(?:\bfrom|\bimport|\brequire|@import|@source|@plugin|@config|@reference)\s*\(?\s*['"](\.\.?\/[^'"\n]+)['"]/g;
const DEPENDENCY_FIELDS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
] as const;

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** The workspace folders: each one matches a root `workspaces` pattern and has a tracked package.json. */
export function workspaceDirs(patterns: readonly string[], files: readonly string[]): string[] {
  const matchers = patterns.map(
    (pattern) =>
      new RegExp(
        `^${pattern
          .split('/')
          .map((part) => (part === '*' ? '[^/]+' : escapeRegExp(part)))
          .join('/')}$`,
      ),
  );
  return files
    .filter((file) => file.endsWith('/package.json'))
    .map((file) => file.slice(0, -'/package.json'.length))
    .filter((dir) => matchers.some((matcher) => matcher.test(dir)))
    .sort();
}

/** The workspace a path lies in, if any. */
function ownerOf(path: string, dirs: readonly string[]): string | undefined {
  return dirs.find((dir) => path === dir || path.startsWith(`${dir}/`));
}

interface Manifest {
  name?: unknown;
  scripts?: Record<string, unknown>;
  dependencies?: Record<string, unknown>;
  devDependencies?: Record<string, unknown>;
  peerDependencies?: Record<string, unknown>;
  optionalDependencies?: Record<string, unknown>;
}

/**
 * Every workspace with what it uses. Two kinds of use: a dependency in its package.json on another
 * workspace (by name), and a relative import that leaves its folder into another workspace (a test
 * fixture of core imports identity's source). An import that leaves into scripts/ or configs/ adds
 * nothing: a change there runs everything anyway.
 */
export function loadWorkspaces(options: {
  patterns: readonly string[];
  /** every file git tracks, posix paths from the repo root */
  files: readonly string[];
  read: (path: string) => string;
}): WorkspaceInfo[] {
  const { patterns, files, read } = options;
  const dirs = workspaceDirs(patterns, files);
  const manifests = new Map<string, Manifest>(
    dirs.map((dir) => [dir, JSON.parse(read(`${dir}/package.json`)) as Manifest]),
  );
  const dirByName = new Map<string, string>();
  for (const [dir, manifest] of manifests) {
    if (typeof manifest.name !== 'string' || manifest.name === '') {
      throw new Error(`${dir}/package.json has no name.`);
    }
    dirByName.set(manifest.name, dir);
  }

  const filesByDir = new Map<string, string[]>(dirs.map((dir) => [dir, []]));
  for (const file of files) {
    const dir = ownerOf(file, dirs);
    if (dir !== undefined && SOURCE_FILE.test(file)) filesByDir.get(dir)?.push(file);
  }

  return dirs.map((dir) => {
    const manifest = manifests.get(dir) ?? {};
    const uses = new Set<string>();
    for (const field of DEPENDENCY_FIELDS) {
      for (const name of Object.keys(manifest[field] ?? {})) {
        const used = dirByName.get(name);
        if (used !== undefined && used !== dir) uses.add(used);
      }
    }
    for (const file of filesByDir.get(dir) ?? []) {
      for (const match of read(file).matchAll(RELATIVE_SPECIFIER)) {
        const target = posix.normalize(posix.join(posix.dirname(file), match[1] ?? ''));
        const used = ownerOf(target, dirs);
        if (used !== undefined && used !== dir) uses.add(used);
      }
    }
    return {
      dir,
      name: manifest.name as string,
      scripts: Object.keys(manifest.scripts ?? {}).sort(),
      uses: [...uses].sort(),
    };
  });
}

/** The changed files, sorted by what they touch. */
export interface Changes {
  /** outside the workspaces and the docs: these run everything */
  global: string[];
  docs: string[];
  /** the workspaces with a changed file */
  workspaces: string[];
}

export function classify(changed: readonly string[], dirs: readonly string[]): Changes {
  const changes: Changes = { global: [], docs: [], workspaces: [] };
  const touched = new Set<string>();
  for (const file of changed) {
    const dir = ownerOf(file, dirs);
    if (dir !== undefined) touched.add(dir);
    else if (DOCS.some((docs) => docs.test(file))) changes.docs.push(file);
    else changes.global.push(file);
  }
  changes.workspaces = [...touched].sort();
  return changes;
}

/** The changed workspaces and every workspace that uses one of them, directly or through others. */
export function affected(
  changed: readonly string[],
  workspaces: readonly WorkspaceInfo[],
): string[] {
  const usedBy = new Map<string, string[]>();
  for (const workspace of workspaces) {
    for (const used of workspace.uses) {
      usedBy.set(used, [...(usedBy.get(used) ?? []), workspace.dir]);
    }
  }
  const seen = new Set(changed);
  const queue = [...changed];
  for (let dir = queue.shift(); dir !== undefined; dir = queue.shift()) {
    for (const user of usedBy.get(dir) ?? []) {
      if (!seen.has(user)) {
        seen.add(user);
        queue.push(user);
      }
    }
  }
  return [...seen].sort();
}

/** Which workspaces each test job runs: backend + shared need the services, frontend does not. */
const TEST_GROUPS: Record<'test-backend' | 'test-frontend', readonly string[]> = {
  'test-backend': ['packages/backend/', 'packages/shared/', 'backend/'],
  'test-frontend': ['packages/frontend/', 'frontend/'],
};

export interface PlanInput {
  job: Job;
  /** the app of an e2e job (its folder under frontend/) */
  app?: string;
  /** test everything: not a pull request into a work branch */
  full: boolean;
  /** the run that already passed this tree, if any */
  passedRun?: number;
  /** the files the pull request changes; null when they could not be found (everything runs) */
  changed: readonly string[] | null;
  workspaces: readonly WorkspaceInfo[];
}

export interface Plan {
  /** does the job run its steps */
  run: boolean;
  /** one line for the log: why */
  reason: string;
  /** this run tests everything, so a pass may leave the marker */
  everything: boolean;
  /** static: build, lint and typecheck too, not only the format check */
  code: boolean;
  /** test-backend, test-frontend, verify: the arguments for npm */
  args: string;
  /**
   * The filters for `turbo run build` (T0.5, T0.6): empty builds every workspace; `--filter=a...`
   * builds a and every workspace it needs (turbo.json: `^build`). A test job builds what it tests, an
   * E2E job its app and the bundle; test-scripts everything. (static builds everything with the
   * package CLI, `npm run build`, never from the cache.)
   */
  build: string;
}

const SAFE_ARG = /^[@\w./-]+$/;
const safe = (values: readonly string[]) => {
  for (const value of values) {
    if (!SAFE_ARG.test(value)) throw new Error(`Unexpected workspace name: ${value}`);
  }
  return values;
};

const list = (values: readonly string[]) =>
  values.length > 4
    ? `${values.slice(0, 4).join(', ')} and ${String(values.length - 4)} more`
    : values.join(', ');

export function planJob(input: PlanInput): Plan {
  const { job, app, full, passedRun, changed, workspaces } = input;
  const none = { everything: false, code: false, args: '', build: '' };
  const e2eApp = workspaces.find((w) => w.dir === `frontend/${app ?? ''}`);
  if (job === 'e2e' && !e2eApp?.scripts.includes('e2e')) {
    throw new Error(`No app frontend/${app ?? ''} with an e2e script.`);
  }
  const buildFor = (names: readonly string[]) =>
    safe(names)
      .map((name) => `--filter=${name}...`)
      .join(' ');
  if (passedRun !== undefined) {
    return {
      ...none,
      run: false,
      reason: `this code already passed every check in run ${String(passedRun)}`,
    };
  }

  const dirs = workspaces.map((w) => w.dir);
  const changes = changed === null ? null : classify(changed, dirs);
  const everything = full || changes === null || changes.global.length > 0;
  // (when not everything, the changes are known: TypeScript narrows them through `everything`)
  const code = everything || changes.workspaces.length > 0;
  const reach = everything ? dirs : affected(changes.workspaces, workspaces);
  const why = full
    ? 'a push or a pull request into release or main tests everything'
    : changes === null
      ? 'the changed files could not be found, so everything runs'
      : changes.global.length > 0
        ? `${list(changes.global)} changed outside the workspaces, so everything runs`
        : code
          ? `affected: ${list(reach)}`
          : 'only docs changed';
  // static (lint, typecheck) and test-scripts (they read every workspace) build everything
  const base = { everything, code, build: '' };

  switch (job) {
    case 'static':
      return {
        ...base,
        run: true,
        args: '',
        reason: code ? why : `${why}: the format check only`,
      };
    case 'test-scripts':
      return { ...base, run: code, args: '', reason: code ? why : `${why}: nothing to test` };
    case 'test-backend':
    case 'test-frontend': {
      const groups = TEST_GROUPS[job];
      const targets = workspaces
        .filter((w) => reach.includes(w.dir) && w.scripts.includes('test'))
        .filter((w) => groups.some((group) => w.dir.startsWith(group)));
      const dirs = targets.map((w) => w.dir);
      return {
        ...base,
        run: targets.length > 0,
        args: safe(dirs)
          .map((dir) => `--workspace=${dir}`)
          .join(' '),
        build: buildFor(targets.map((w) => w.name)),
        reason: targets.length > 0 ? `${why}; tests ${list(dirs)}` : `${why}: none of these here`,
      };
    }
    case 'e2e': {
      // the E2E runs the app on the whole backend (scripts/e2e/backend.ts): a deployable that changes
      // runs every app's E2E
      const backend = reach.some((dir) => dir.startsWith('backend/'));
      const run = everything || backend || reach.includes(`frontend/${app ?? ''}`);
      // the app and the bundle (every deployable) with what they need; no bundle known: everything
      const bundle = workspaces.find((w) => w.dir === 'backend/bundle');
      return {
        ...base,
        run,
        args: '',
        build:
          bundle === undefined || e2eApp === undefined ? '' : buildFor([e2eApp.name, bundle.name]),
        reason: run ? why : `${why}: not frontend/${app ?? ''}`,
      };
    }
    case 'verify': {
      const names = workspaces
        .filter((w) => w.dir.startsWith('packages/') && reach.includes(w.dir))
        .map((w) => w.name);
      const run = everything || names.length > 0;
      return {
        ...base,
        run,
        args: everything ? '--all' : `--packages ${safe(names).join(',')}`,
        reason: run ? why : `${why}: no package`,
      };
    }
  }
}

/** One artifact of `GET /repos/{repo}/actions/artifacts?name=...` as far as this reads it. */
interface Artifact {
  expired?: unknown;
  workflow_run?: { id?: unknown; repository_id?: unknown; head_repository_id?: unknown } | null;
}

/** One run of `GET /repos/{repo}/actions/runs/{id}` as far as this reads it. */
interface Run {
  path?: unknown;
  conclusion?: unknown;
}

/**
 * The run that left a valid marker for this tree: not expired, from a branch of this repository (a
 * fork's pull request can upload artifacts too), from ci.yml, and finished green. `api` is
 * `gh api <path>` parsed; a failed call counts as no marker, so everything runs.
 */
export function findPassedRun(
  tree: string,
  repo: string,
  api: (path: string) => unknown,
): number | undefined {
  if (!/^[0-9a-f]{40}(?:[0-9a-f]{24})?$/.test(tree) || !/^[\w.-]+\/[\w.-]+$/.test(repo)) {
    return undefined;
  }
  let artifacts: Artifact[];
  try {
    const page = api(
      `repos/${repo}/actions/artifacts?name=${MARKER_PREFIX}${tree}&per_page=20`,
    ) as { artifacts?: unknown };
    artifacts = Array.isArray(page.artifacts) ? (page.artifacts as Artifact[]) : [];
  } catch {
    return undefined;
  }
  for (const artifact of artifacts) {
    const run = artifact.workflow_run;
    if (artifact.expired !== false || run === null || run === undefined) continue;
    if (typeof run.id !== 'number' || typeof run.repository_id !== 'number') continue;
    if (run.head_repository_id !== run.repository_id) continue;
    try {
      const details = api(`repos/${repo}/actions/runs/${String(run.id)}`) as Run;
      const path = typeof details.path === 'string' ? details.path : '';
      const fromCi = path === CI_WORKFLOW || path.startsWith(`${CI_WORKFLOW}@`);
      if (fromCi && details.conclusion === 'success') return run.id;
    } catch {
      continue;
    }
  }
  return undefined;
}
