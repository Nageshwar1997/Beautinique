// A deployable's env files (D-441, docs/OPERATIONS.md §1 rule 9). `.env.example` is the only one in
// git, in three sections, each starting with a marker line:
//
//   # [DEVELOPMENT]   the laptop's keys: public values as they are, every secret as <...>
//   # [TEST]          the tests' keys, with their real (fake) values
//   # [PRODUCTION]    live: names only, every value <...>
//
// Setup makes `.env.development` and `.env.test` from the first two. PRODUCTION never becomes a file
// here: `.env.production` lives outside the repository, and nothing in this module reads or writes it.
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

export const SECTIONS = ['DEVELOPMENT', 'TEST', 'PRODUCTION'] as const;
export type Section = (typeof SECTIONS)[number];

// The files setup makes, and the section each one comes from.
export const GENERATED = [
  { section: 'DEVELOPMENT', file: '.env.development' },
  { section: 'TEST', file: '.env.test' },
] as const;

export interface EnvExample {
  /** Each section's lines (keys and comments), in file order. */
  sections: Partial<Record<Section, string[]>>;
  problems: string[];
}

export interface EnvFileResult {
  file: string;
  status: 'created' | 'kept';
  /** Keys of a created file still holding a <...> placeholder, for the owner to fill in. */
  placeholders: string[];
}

const SECTION_LINE = /^#\s*\[(DEVELOPMENT|TEST|PRODUCTION)\]/;
const KEY_LINE = /^([A-Z][A-Z0-9_]*)=(.*)$/;
const PLACEHOLDER = /^<[^>]*>$/;

function keyValues(lines: string[] = []): [string, string][] {
  return lines.flatMap((line) => {
    const match = KEY_LINE.exec(line);
    return match?.[1] === undefined ? [] : [[match[1], match[2] ?? '']];
  });
}

export function parseEnvExample(text: string): EnvExample {
  const sections: Partial<Record<Section, string[]>> = {};
  const problems: string[] = [];
  let current: Section | undefined;

  text.split(/\r?\n/).forEach((line, index) => {
    const at = `line ${String(index + 1)}`;
    const header = SECTION_LINE.exec(line)?.[1] as Section | undefined;
    if (header) {
      if (sections[header]) problems.push(`${at}: the [${header}] section appears twice`);
      sections[header] = [];
      current = header;
      return;
    }
    const isNote = line.trim() === '' || line.trimStart().startsWith('#');
    if (!isNote && !KEY_LINE.test(line)) {
      // Never echo the line: it may hold a value.
      problems.push(`${at}: not a KEY=value line (keys are UPPER_SNAKE_CASE)`);
      return;
    }
    if (current) sections[current]?.push(line);
    else if (!isNote) problems.push(`${at}: a key before the first section`);
  });

  for (const section of SECTIONS) {
    if (!sections[section]) problems.push(`missing the [${section}] section`);
  }

  // One config schema per deployable, every key required everywhere (RULES CR-3): each section
  // names the same keys, once.
  const expected = new Set(keyValues(sections.DEVELOPMENT).map(([key]) => key));
  for (const section of SECTIONS) {
    const keys = keyValues(sections[section]).map(([key]) => key);
    const seen = new Set<string>();
    for (const key of keys) {
      if (seen.has(key)) problems.push(`[${section}] names ${key} twice`);
      seen.add(key);
      if (!expected.has(key)) problems.push(`[${section}] has ${key}, which [DEVELOPMENT] lacks`);
    }
    for (const key of expected) {
      if (sections[section] && !seen.has(key)) problems.push(`[${section}] lacks ${key}`);
    }
  }

  // A real production value must never reach git.
  for (const [key, value] of keyValues(sections.PRODUCTION)) {
    if (!PLACEHOLDER.test(value)) {
      problems.push(`[PRODUCTION] ${key} must be a placeholder like <...>, never a value`);
    }
  }
  return { sections, problems };
}

// Makes the deployable's `.env.development` and `.env.test` from its `.env.example`. A file that
// already exists is kept as it is, unread.
export function writeEnvFiles(dir: string): EnvFileResult[] {
  const examplePath = join(dir, '.env.example');
  const example = parseEnvExample(readFileSync(examplePath, 'utf8'));
  if (example.problems.length > 0) {
    throw new Error(`${examplePath}:\n  ${example.problems.join('\n  ')}`);
  }

  return GENERATED.map(({ section, file }) => {
    const lines = example.sections[section] ?? [];
    const header = `# Made by \`npm run setup\` from .env.example [${section}]. Fill in every <...> value.`;
    try {
      // `wx`: create only; an existing file is never opened.
      writeFileSync(join(dir, file), `${[header, ...lines].join('\n').trimEnd()}\n`, {
        flag: 'wx',
      });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'EEXIST') {
        return { file, status: 'kept', placeholders: [] };
      }
      throw error;
    }
    const placeholders = keyValues(lines)
      .filter(([, value]) => PLACEHOLDER.test(value))
      .map(([key]) => key);
    return { file, status: 'created', placeholders };
  });
}

// Deployables are frontend/<app> and backend/<service>; each one with env keys has `.env.example`.
export function deployablesWithEnvExample(root: string): string[] {
  return ['frontend', 'backend']
    .flatMap((area) => {
      const dir = join(root, area);
      if (!existsSync(dir)) return [];
      return readdirSync(dir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && existsSync(join(dir, entry.name, '.env.example')))
        .map((entry) => `${area}/${entry.name}`);
    })
    .sort();
}

// No env file but `.env.example` is ever tracked by git (AC-FOUNDATION-3).
export function trackedEnvFileProblems(trackedPaths: string[]): string[] {
  return trackedPaths
    .filter((path) => {
      const name = basename(path);
      return (name === '.env' || name.startsWith('.env.')) && name !== '.env.example';
    })
    .map((path) => `${path}: env files never go into git; only .env.example does`);
}

// Names git must ignore anywhere in the repository, and the one it must not.
export const ENV_NAMES_IGNORED = [
  '.env',
  '.env.development',
  '.env.test',
  '.env.production',
  '.env.local',
  'backend/identity/.env.test',
  'frontend/customer/.env.production',
];
export const ENV_NAMES_KEPT = ['.env.example', 'backend/identity/.env.example'];

export function envIgnoreProblems(repoDir: string): string[] {
  const ignored = (path: string) =>
    spawnSync('git', ['check-ignore', '--quiet', '--no-index', path], { cwd: repoDir }).status ===
    0;
  return [
    ...ENV_NAMES_IGNORED.filter((path) => !ignored(path)).map(
      (path) => `${path}: git must ignore it`,
    ),
    ...ENV_NAMES_KEPT.filter(ignored).map((path) => `${path}: git must not ignore it`),
  ];
}
