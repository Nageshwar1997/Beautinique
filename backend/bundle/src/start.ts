import { createLogger, flushMonitoring, reportError } from '@beautinique/backend-server-kit';

import { startBundle } from './bundle.ts';
import { readBundleConfig } from './config.ts';

const logger = createLogger({ name: 'bundle' });

try {
  const bundle = await startBundle(readBundleConfig());
  logger.info({ port: bundle.port, deployables: bundle.names }, 'bundle running');
  const stop = (signal: NodeJS.Signals) => {
    logger.info({ signal }, 'stopping');
    // errors still on their way to Sentry go out before the process ends
    bundle
      .stop()
      .then(() => flushMonitoring())
      .then(
        () => process.exit(0),
        (error: unknown) => {
          logger.error({ err: error }, 'stop failed');
          process.exit(1);
        },
      );
  };
  process.once('SIGTERM', stop);
  process.once('SIGINT', stop);
} catch (error) {
  logger.fatal({ err: error }, 'bundle failed to start');
  process.exitCode = 1;
  reportError(error);
  await flushMonitoring();
}
