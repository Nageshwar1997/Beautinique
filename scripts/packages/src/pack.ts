import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

import type { Exec } from './exec.ts';
import { ALLOWED_FILES, type Problem } from './rules.ts';
import type { PackageInfo } from './workspace.ts';

// What would go into the tarball, checked before anything is published (DD-7, SR-082). A file
// outside the allowlist, a file that looks like a secret or a test, or a secret in a packed file
// fails the check.
const SECRET_NAMES = [
  /^\.env(\..*)?$/i,
  /^\.npmrc$/i,
  /\.(pem|key|p12|pfx)$/i,
  /(^|[-_.])(secret|credentials)s?([-_.]|$)/i,
];
const TEST_NAMES = [/\.(test|spec)\.[cm]?[jt]sx?$/, /(^|\/)__tests__\//];
const SECRET_CONTENT = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /\bAKIA[0-9A-Z]{16}\b/,
  /\bnpm_[A-Za-z0-9]{36}\b/,
  /\bgh[pousr]_[A-Za-z0-9]{36,}\b/,
  // Razorpay key ids (live and test mode).
  /\brzp_(?:live|test)_[A-Za-z0-9]{14,}\b/,
];
// The connection URLs with a password that .gitleaks.toml's `url-with-password` rule finds in git
// (MongoDB, Valkey/Redis, Postgres, AMQP, Cloudinary): `dist/` never reaches git, so the same check
// runs here. A placeholder (`<password>`, `${VAR}`, `{{password}}`, `****`) is not a secret.
const URL_WITH_PASSWORD =
  /\b(?:mongodb(?:\+srv)?|rediss?|valkeys?|postgres(?:ql)?|amqps?|cloudinary):\/\/[^:/\s@'"`]+:([^@/\s'"`]+)@[^\s'"`]+/gi;
const PLACEHOLDER = /^(?:<[^>]*>|\$\{[^}]*\}|\{\{[^}]*\}\}|\*+)$/;
// An npm auth token line with a real value (not `${NPM_TOKEN}`).
const NPM_AUTH = /_authToken\s*=\s*(?!\$\{)\S+/;

export function containsSecret(text: string): boolean {
  if (SECRET_CONTENT.some((pattern) => pattern.test(text)) || NPM_AUTH.test(text)) return true;
  return [...text.matchAll(URL_WITH_PASSWORD)].some((match) => !PLACEHOLDER.test(match[1] ?? ''));
}

const ALWAYS_PACKED = new Set(['package.json']);

function isAllowed(path: string): boolean {
  if (ALWAYS_PACKED.has(path)) return true;
  return ALLOWED_FILES.some((entry) => path === entry || path.startsWith(`${entry}/`));
}

// A `.env` file anywhere in the package folder fails, even where `files` would keep it out of
// the tarball: it should not be there at all.
function folderEnvFiles(dir: string, base: string = dir): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules') continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...folderEnvFiles(path, base));
    else if (/^\.env(\..*)?$/i.test(entry.name) && entry.name.toLowerCase() !== '.env.example') {
      found.push(relative(base, path).replaceAll('\\', '/'));
    }
  }
  return found;
}

export function packedPathProblems(pkg: PackageInfo, paths: string[]): Problem[] {
  const problems: Problem[] = [];
  const add = (message: string) => problems.push({ package: pkg.name, rule: 'DD-7', message });
  for (const path of paths) {
    const name = path.split('/').at(-1) ?? path;
    if (!isAllowed(path)) add(`${path} is not in the files allowlist`);
    else if (SECRET_NAMES.some((pattern) => pattern.test(name))) add(`${path} looks like a secret`);
    else if (TEST_NAMES.some((pattern) => pattern.test(path))) add(`${path} is a test file`);
    else {
      const full = join(pkg.dir, path);
      if (existsSync(full) && containsSecret(readFileSync(full, 'utf8'))) {
        add(`${path} contains a secret`);
      }
    }
  }
  for (const file of folderEnvFiles(pkg.dir)) add(`${file} is an env file inside the package`);
  return problems;
}

// The files `npm pack` would put in the tarball, from a dry run (nothing is written).
export function packedPaths(pkg: PackageInfo, exec: Exec): { paths: string[]; error?: string } {
  const result = exec('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], { cwd: pkg.dir });
  if (result.status !== 0) return { paths: [], error: result.stderr.trim() || 'npm pack failed' };
  try {
    // npm 12 answers with an object keyed by package name inside a workspace, older npm with a list.
    const parsed = JSON.parse(result.stdout) as unknown;
    const [entry] = (Array.isArray(parsed) ? parsed : Object.values(parsed as object)) as {
      files: { path: string }[];
    }[];
    return { paths: (entry?.files ?? []).map((file) => file.path) };
  } catch {
    return { paths: [], error: 'npm pack gave no readable file list' };
  }
}
