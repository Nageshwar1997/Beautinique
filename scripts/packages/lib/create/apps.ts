import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { type AppId, APPS } from '../../../../packages/shared/contracts/src/platform.ts';
import type { Context } from '../context.ts';
import { CancelledError, CliError } from '../errors.ts';
import { loadWorkspace } from '../workspace.ts';
import {
  APP_KIND,
  APP_KIND_LABELS,
  APP_TITLES,
  appLibraries,
  type AppSpec,
  renderApp,
} from './app-templates.ts';
import { installAndCheck, resolveVersions, writeTree } from './scaffold.ts';

export interface CreateAppFlags {
  app?: string;
  /** write files only: no npm install and no checks (tests) */
  skipInstall?: boolean;
}

/** Dev ports: customer 3001 ... creator 3011, in the order of APPS. */
export const appPort = (app: AppId): number => 3001 + APPS.indexOf(app);

/**
 * Creates frontend/<app> for one of the 11 apps (APPS in shared-contracts). An app is not on the list
 * until the architecture says so: add it to APPS first.
 */
export async function createFrontendApp(ctx: Context, flags: CreateAppFlags): Promise<string> {
  const ws = loadWorkspace(ctx);
  const exists = (app: AppId) => existsSync(join(ctx.root, 'frontend', app)) || ws.byName.has(app);
  const open = APPS.filter((app) => !exists(app));

  ctx.log.heading('New frontend app');
  let app: AppId;
  if (flags.app !== undefined) {
    if (!(APPS as readonly string[]).includes(flags.app)) {
      throw new CliError(`--app must be one of: ${APPS.join(', ')}.`, {
        code: 'BAD_FLAGS',
        hint: 'A new app is added to APPS in packages/shared/contracts/src/platform.ts first.',
      });
    }
    app = flags.app as AppId;
    if (exists(app)) {
      throw new CliError(`frontend/${app} already exists.`, { code: 'EXISTS' });
    }
  } else {
    if (open.length === 0) {
      throw new CliError('All 11 apps already exist.', { code: 'NOTHING_TO_CREATE' });
    }
    app = await ctx.prompt.select<AppId>(
      'Which app?',
      APPS.map((a) => ({
        name: `${a.padEnd(11)} ${APP_KIND_LABELS[APP_KIND[a]]}`,
        value: a,
        disabled: exists(a) ? 'already exists' : false,
      })),
    );
  }

  const kind = APP_KIND[app];
  const libs = appLibraries(kind);
  const versions = await resolveVersions(ctx, ws, [...libs.dependencies, ...libs.devDependencies]);
  const spec: AppSpec = { app, kind, title: APP_TITLES[app], port: appPort(app), versions };
  const relDir = `frontend/${app}`;
  const files = renderApp(spec);

  ctx.log.heading('Summary');
  ctx.log.table(
    ['', ''],
    [
      ['App', `${app} (${spec.title})`],
      ['Folder', relDir],
      ['Kind', APP_KIND_LABELS[kind]],
      ['Dev server', `http://localhost:${String(spec.port)} (/api -> gateway)`],
      ['Files', [...files.keys()].join(', ')],
    ],
  );
  if (!(await ctx.prompt.confirm('Create it?', { default: true }))) {
    throw new CancelledError();
  }

  const target = await writeTree(ctx, relDir, files);
  if (flags.skipInstall) {
    return target;
  }
  await installAndCheck(ctx, target, relDir, app);

  ctx.log.heading('Next steps');
  ctx.log.info(`1. npm run dev --workspace ${app}  -> http://localhost:${String(spec.port)}`);
  ctx.log.info(
    `2. Add pages in ${relDir}/${kind === 'ssr' ? 'app/routes.ts' : 'src/routes.tsx'}; shared UI goes in packages.`,
  );
  ctx.log.info(`3. Commit it (Conventional Commits, e.g. "feat(${app}): ...").`);
  return target;
}
