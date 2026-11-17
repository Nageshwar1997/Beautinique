import { createLogger } from '@beautinique/backend-server-kit';

import { grantMasterCli } from './grant-master-cli.ts';

// npm run db:grant-master (root): the first Master, without starting the servers (ARCHITECTURE §7.3)
process.exitCode = await grantMasterCli(process.argv.slice(2), {
  logger: createLogger({ name: 'db-grant-master', destination: process.stderr }),
  output: process.stdout,
  input: process.stdin,
});
