import { createLogger } from '@beautinique/backend-server-kit';

import { readConfig, start } from './service.ts';

// Split mode: core alone in its process (laptop Docker, paid Render). Stops on SIGTERM.
try {
  await start(readConfig());
} catch (error) {
  createLogger({ name: 'core' }).fatal({ err: error }, 'core failed to start');
  process.exitCode = 1;
}
