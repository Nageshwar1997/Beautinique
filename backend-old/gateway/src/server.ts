import { createLogger } from '@beautinique/backend-server-kit';

import { readConfig, start } from './service.ts';

// Split mode: gateway alone in its process (laptop Docker, paid Render). Stops on SIGTERM.
try {
  await start(readConfig());
} catch (error) {
  createLogger({ name: 'gateway' }).fatal({ err: error }, 'gateway failed to start');
  process.exitCode = 1;
}
