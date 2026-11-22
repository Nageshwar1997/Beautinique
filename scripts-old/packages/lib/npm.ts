import type { Context } from './context.ts';
import { CliError } from './errors.ts';
import type { WorkspacePackage } from './workspace.ts';

const NETWORK_CODES = [
  'ENOTFOUND',
  'ETIMEDOUT',
  'ECONNRESET',
  'ECONNREFUSED',
  'EAI_AGAIN',
  'ENETUNREACH',
];

export type AuthState =
  | { state: 'logged-in'; user: string }
  | { state: 'logged-out' }
  | { state: 'expired' }
  | { state: 'offline'; detail: string }
  | { state: 'error'; detail: string };

/**
 * The useful line of npm's error output: from the "npm error" lines, skip "code E..." and log-file
 * lines and take the first real message (e.g. "409 Conflict - ..."). Warnings are ignored.
 */
export function firstErrorLine(stderr: string): string {
  const errors = stderr
    .split(/\r?\n/)
    .filter((l) => /^npm (error|ERR!)/.test(l))
    .map((l) => l.replace(/^npm (error|ERR!)\s*/, '').trim())
    .filter(
      (l) => l !== '' && !/^code \S+$/.test(l) && !/complete log of this run|^\S+\.log$/i.test(l),
    );
  return (
    errors[0] ??
    stderr
      .split(/\r?\n/)
      .map((l) => l.trim())
      .find((l) => l !== '') ??
    'unknown error'
  );
}

/** `npm whoami`, told apart: logged out, session expired (2-hour npm sessions), offline. */
export async function whoami(ctx: Context): Promise<AuthState> {
  const res = await ctx.run('npm', ['whoami', '--registry', ctx.registry], { cwd: ctx.root });
  if (res.code === 0 && res.stdout.trim() !== '') {
    return { state: 'logged-in', user: res.stdout.trim() };
  }
  const err = res.stderr;
  if (NETWORK_CODES.some((c) => err.includes(c))) {
    return { state: 'offline', detail: firstErrorLine(err) };
  }
  if (err.includes('ENEEDAUTH')) {
    return { state: 'logged-out' };
  }
  if (err.includes('E401')) {
    return { state: 'expired' };
  }
  return { state: 'error', detail: firstErrorLine(err) };
}

/** Throws a helpful CliError unless logged in; returns the npm user name. */
export async function requireLogin(ctx: Context): Promise<string> {
  const auth = await whoami(ctx);
  switch (auth.state) {
    case 'logged-in':
      return auth.user;
    case 'logged-out':
      throw new CliError('You are not logged in to npm.', {
        code: 'NOT_LOGGED_IN',
        hint: 'Run: npm run login',
      });
    case 'expired':
      throw new CliError('Your npm session has expired (npm sessions last 2 hours).', {
        code: 'SESSION_EXPIRED',
        hint: 'Run: npm run login',
      });
    case 'offline':
      throw new CliError(`Cannot reach npm: ${auth.detail}`, {
        code: 'OFFLINE',
        hint: 'Check the internet connection and try again.',
      });
    case 'error':
      throw new CliError(`npm whoami failed: ${auth.detail}`, { code: 'WHOAMI_FAILED' });
  }
}

export async function login(ctx: Context): Promise<void> {
  const res = await ctx.run('npm', ['login', '--registry', ctx.registry], {
    cwd: ctx.root,
    stdio: 'inherit',
  });
  if (res.code !== 0) {
    throw new CliError('npm login did not finish.', { code: 'LOGIN_FAILED' });
  }
}

export async function logout(ctx: Context): Promise<void> {
  const res = await ctx.run('npm', ['logout', '--registry', ctx.registry], {
    cwd: ctx.root,
    stdio: 'inherit',
  });
  if (res.code !== 0) {
    throw new CliError('npm logout failed.', { code: 'LOGOUT_FAILED' });
  }
}

/** Root `npm install`, shown to the user. Keeps package-lock.json and the workspace links current. */
export async function install(ctx: Context): Promise<void> {
  const res = await ctx.run('npm', ['install', '--no-audit', '--no-fund'], {
    cwd: ctx.root,
    stdio: 'inherit',
  });
  if (res.code !== 0) {
    throw new CliError('npm install failed.', { code: 'INSTALL_FAILED' });
  }
}

export interface ScriptResult {
  ran: boolean;
  ok: boolean;
  output: string;
}

/** Runs a package.json script if the package has it. Output is captured and only shown on failure. */
export async function runScript(
  ctx: Context,
  pkg: WorkspacePackage,
  script: string,
): Promise<ScriptResult> {
  if (!pkg.manifest.scripts?.[script]) {
    return { ran: false, ok: true, output: '' };
  }
  const res = await ctx.run('npm', ['run', script, '--workspace', pkg.name], {
    cwd: ctx.root,
    env: { FORCE_COLOR: '0' },
  });
  return { ran: true, ok: res.code === 0, output: `${res.stdout}${res.stderr}`.trim() };
}

export interface PackedFile {
  path: string;
  size: number;
}

export interface PackResult {
  files: PackedFile[];
  size: number;
  unpackedSize: number;
}

/** `npm pack --dry-run --json`: exactly what would go into the tarball (npm 11 array / npm 12 object). */
export async function packDryRun(ctx: Context, pkg: WorkspacePackage): Promise<PackResult> {
  const res = await ctx.run(
    'npm',
    ['pack', '--dry-run', '--json', '--ignore-scripts', '--workspace', pkg.name],
    { cwd: ctx.root },
  );
  if (res.code !== 0) {
    throw new CliError(`npm pack failed for ${pkg.name}: ${firstErrorLine(res.stderr)}`, {
      code: 'PACK_FAILED',
    });
  }
  const parsed = JSON.parse(res.stdout) as unknown;
  const entry = (
    Array.isArray(parsed)
      ? parsed[0]
      : ((parsed as Record<string, unknown>)[pkg.name] ?? Object.values(parsed as object)[0])
  ) as { files?: PackedFile[]; size?: number; unpackedSize?: number } | undefined;
  if (!entry?.files) {
    throw new CliError(`Could not read npm pack output for ${pkg.name}.`, { code: 'PACK_FAILED' });
  }
  return { files: entry.files, size: entry.size ?? 0, unpackedSize: entry.unpackedSize ?? 0 };
}

export type PublishFailure = 'otp' | 'auth' | 'forbidden' | 'exists' | 'network' | 'other';

export interface PublishResult {
  ok: boolean;
  failure?: PublishFailure;
  message?: string;
}

export function classifyPublishError(stderr: string): { failure: PublishFailure; message: string } {
  const message = firstErrorLine(stderr);
  if (/EOTP|one-time pass/i.test(stderr)) {
    return {
      failure: 'otp',
      message: '2FA was not completed (one-time password missing or expired).',
    };
  }
  if (/cannot publish over|previously published versions|EPUBLISHCONFLICT/i.test(stderr)) {
    return { failure: 'exists', message: 'This version is already on npm.' };
  }
  if (/E401|ENEEDAUTH/.test(stderr)) {
    return {
      failure: 'auth',
      message: 'Not logged in, or the npm session expired. Run: npm run login',
    };
  }
  if (stderr.includes('E403')) {
    return { failure: 'forbidden', message: `npm refused the publish: ${message}` };
  }
  if (NETWORK_CODES.some((c) => stderr.includes(c))) {
    return { failure: 'network', message: `Network problem: ${message}` };
  }
  return { failure: 'other', message };
}

/**
 * Publishes one workspace. stdin/stdout stay on the terminal so npm's own 2FA (browser link or OTP prompt)
 * works; stderr is also captured to explain failures.
 */
export async function publish(
  ctx: Context,
  pkg: WorkspacePackage,
  options: { tag: string; dryRun: boolean },
): Promise<PublishResult> {
  const args = [
    'publish',
    '--workspace',
    pkg.name,
    '--registry',
    ctx.registry,
    '--access',
    'public',
    '--tag',
    options.tag,
  ];
  if (options.dryRun) {
    args.push('--dry-run');
  }
  const res = await ctx.run('npm', args, { cwd: ctx.root, stdio: 'tee' });
  if (res.code === 0) {
    return { ok: true };
  }
  return { ok: false, ...classifyPublishError(res.stderr) };
}

export interface TrustConfig {
  id?: string;
  type?: string;
  file?: string;
  repository?: string;
  environment?: string;
  permissions?: string[];
}

/** `npm pack` into `dir`; returns the tarball file name. */
export async function packTo(ctx: Context, pkg: WorkspacePackage, dir: string): Promise<string> {
  const res = await ctx.run(
    'npm',
    ['pack', '--json', '--ignore-scripts', '--pack-destination', dir, '--workspace', pkg.name],
    { cwd: ctx.root },
  );
  if (res.code !== 0) {
    throw new CliError(`npm pack failed for ${pkg.name}: ${firstErrorLine(res.stderr)}`, {
      code: 'PACK_FAILED',
    });
  }
  const parsed = JSON.parse(res.stdout) as unknown;
  const entry = (
    Array.isArray(parsed)
      ? parsed[0]
      : ((parsed as Record<string, unknown>)[pkg.name] ?? Object.values(parsed as object)[0])
  ) as { filename?: string } | undefined;
  if (!entry?.filename) {
    throw new CliError(`Could not read npm pack output for ${pkg.name}.`, { code: 'PACK_FAILED' });
  }
  return entry.filename;
}

/** Trusted-publishing configs of a package (needs login). Returns [] when there are none. */
export async function trustList(ctx: Context, name: string): Promise<TrustConfig[]> {
  const res = await ctx.run('npm', ['trust', 'list', name, '--json', '--registry', ctx.registry], {
    cwd: ctx.root,
  });
  if (res.code !== 0) {
    throw new CliError(
      `Could not read trusted publishing for ${name}: ${firstErrorLine(res.stderr)}`,
      {
        code: 'TRUST_FAILED',
      },
    );
  }
  const text = res.stdout.trim();
  if (text === '') {
    return [];
  }
  const parsed = JSON.parse(text) as unknown;
  return Array.isArray(parsed) ? (parsed as TrustConfig[]) : [parsed as TrustConfig];
}

/** Lets the GitHub release workflow publish this package through OIDC (asks for 2FA). */
export async function trustGithub(
  ctx: Context,
  name: string,
  options: { workflow: string; environment: string },
): Promise<void> {
  const res = await ctx.run(
    'npm',
    [
      'trust',
      'github',
      name,
      '--file',
      options.workflow,
      '--repo',
      ctx.repository.slug,
      '--env',
      options.environment,
      '--allow-publish',
      '--yes',
      '--registry',
      ctx.registry,
    ],
    { cwd: ctx.root, stdio: 'tee' },
  );
  if (res.code !== 0) {
    throw new CliError(
      `Could not set up trusted publishing for ${name}: ${firstErrorLine(res.stderr)}`,
      {
        code: 'TRUST_FAILED',
      },
    );
  }
}
