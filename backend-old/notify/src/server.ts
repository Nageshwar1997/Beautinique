import { createLogger } from '@beautinique/backend-server-kit';

import { readConfig, start } from './service.ts';

// Split mode: notify alone in its process (laptop Docker, paid Render). Stops on SIGTERM.
try {
  await start(readConfig());
} catch (error) {
  createLogger({ name: 'notify' }).fatal({ err: error }, 'notify failed to start');
  process.exitCode = 1;
}
