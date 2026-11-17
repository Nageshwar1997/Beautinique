import { createLogger } from '@beautinique/backend-server-kit';

import { releaseCli } from './release-cli.ts';

// npm run db:release (root): the release steps without starting the servers (ARCHITECTURE §11.1)
process.exitCode = await releaseCli(process.argv.slice(2), {
  logger: createLogger({ name: 'db-release', destination: process.stderr }),
  output: process.stdout,
  input: process.stdin,
});
