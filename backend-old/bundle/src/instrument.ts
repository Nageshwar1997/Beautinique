// Loaded before everything else (node --import, package.json): Sentry starts once for the whole
// process, before Express, MongoDB and Redis load, so it can trace them (ARCHITECTURE §11.1, §14).
// Only Sentry is imported here; the rest of the server kit would load Express too early.
import { initMonitoring } from '@beautinique/backend-server-kit/monitoring';

import { monitoringOptions } from './monitoring.ts';

initMonitoring(monitoringOptions(process.env));
