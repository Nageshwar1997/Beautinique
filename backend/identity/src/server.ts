import { createLogger } from '@beautinique/backend-server-kit';

import { readConfig, start } from './service.ts';

// Split mode: identity alone in its process (laptop Docker, paid Render). Stops on SIGTERM.
try {
  await start(readConfig());
} catch (error) {
  createLogger({ name: 'identity' }).fatal({ err: error }, 'identity failed to start');
  process.exitCode = 1;
}
