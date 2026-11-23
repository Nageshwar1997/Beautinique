// `npm run packages:<command> -- [package...] [--dry-run]` (docs/tasks/28-packages/TASK.md §3).
import { resolve } from 'node:path';

import { main } from '../src/cli.ts';
import { askOnTerminal } from '../src/confirm.ts';
import { createLogger } from '../src/logger.ts';

const log = createLogger(
  (line) => {
    console.log(line);
  },
  (line) => {
    console.error(line);
  },
);

process.exitCode = main(process.argv.slice(2), {
  root: resolve(import.meta.dirname, '../../..'),
  log,
  ask: askOnTerminal,
});
