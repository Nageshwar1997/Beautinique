// `npm run packages:<command> -- [package...] [flags]` (docs/tasks/28-packages/TASK.md §3).
import { resolve } from 'node:path';

import { main } from '../src/cli.ts';
import { askOnTerminal } from '../src/confirm.ts';
import { exec } from '../src/exec.ts';
import { createLogger } from '../src/logger.ts';
import { NPM_REGISTRY } from '../src/registry.ts';

const log = createLogger(
  (line) => {
    console.log(line);
  },
  (line) => {
    console.error(line);
  },
);

// `npm run` hands over the registry npm itself uses (its config), so the CLI asks the same one.
const registry = (process.env.npm_config_registry ?? NPM_REGISTRY).replace(/\/+$/, '');

process.exitCode = await main(process.argv.slice(2), {
  root: resolve(import.meta.dirname, '../../..'),
  log,
  ask: askOnTerminal,
  exec,
  registry,
  env: process.env,
  now: () => new Date(),
});
