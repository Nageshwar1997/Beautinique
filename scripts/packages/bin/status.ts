import { styleText } from 'node:util';

import { parseHelpOnly } from '../lib/args.ts';
import { CATEGORIES, createContext } from '../lib/context.ts';
import { whoami } from '../lib/npm.ts';
import { type PackageStatus, readRegistryState, statusOf } from '../lib/plan.ts';
import { highest } from '../lib/versions.ts';
import { loadWorkspace } from '../lib/workspace.ts';
import { main } from './_main.ts';

const LABEL: Record<PackageStatus | 'private', string> = {
  published: styleText('green', 'published'),
  pending: styleText('yellow', 'waiting to publish'),
  new: styleText('cyan', 'new (never published)'),
  behind: styleText('red', 'behind npm'),
  private: styleText('dim', 'private'),
};

const HELP = `npm run status

Lists every package with its local version, its newest version on npm and what a release would do
(published, waiting to publish, new, behind npm, private), plus the npm login state. Changes nothing.

  --help, -h    this help`;

await main(async () => {
  if (parseHelpOnly(process.argv.slice(2))) {
    console.log(HELP);
    return;
  }
  const ctx = createContext({ interactive: false });
  const ws = loadWorkspace(ctx);
  const [registry, auth] = await Promise.all([readRegistryState(ctx, ws), whoami(ctx)]);

  const packages = ws.packages
    .filter((p) => p.category !== null)
    .sort(
      (a, b) =>
        CATEGORIES.indexOf(a.category ?? 'shared') - CATEGORIES.indexOf(b.category ?? 'shared') ||
        a.folder.localeCompare(b.folder),
    );

  ctx.log.heading('Packages');
  const counts = new Map<string, number>();
  ctx.log.table(
    ['Category', 'Package', 'Local', 'npm', 'Status'],
    packages.map((pkg) => {
      const info = registry.get(pkg.name);
      const status = pkg.publishable ? statusOf(pkg, info) : 'private';
      counts.set(status, (counts.get(status) ?? 0) + 1);
      const npm = info ? (info.distTags.latest ?? highest(info.versions) ?? '-') : '-';
      return [pkg.category ?? '', pkg.name, pkg.version, pkg.publishable ? npm : '', LABEL[status]];
    }),
  );
  ctx.log.blank();
  ctx.log.info(
    `${String(packages.length)} package${packages.length === 1 ? '' : 's'}: ` +
      (['published', 'pending', 'new', 'behind', 'private'] as const)
        .filter((s) => counts.has(s))
        .map((s) => `${String(counts.get(s))} ${s}`)
        .join(', '),
  );
  const login = {
    'logged-in': auth.state === 'logged-in' ? `logged in as ${auth.user}` : '',
    'logged-out': 'not logged in (npm run login)',
    expired: 'session expired (npm run login)',
    offline: 'offline',
    error: 'unknown',
  }[auth.state];
  ctx.log.info(`npm: ${login}`);
});
