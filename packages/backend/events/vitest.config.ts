import { workspaceTestConfig } from '../../../configs/vitest/workspace.ts';
import { IN_CI, MONGO_PORT, reachable, VALKEY_PORT } from './test/utils/mongo.ts';

// The whole package is a kernel part (docs/RULES.md RT-21), so it must reach 90% branch coverage.
// Most of it runs only against the real MongoDB and Valkey: on a laptop with no container up its
// integration tests are skipped, and then the limit is only reported. The CI has the containers,
// and there the limit always holds.
const integration = IN_CI || ((await reachable(MONGO_PORT)) && (await reachable(VALKEY_PORT)));
if (!integration) {
  console.warn(
    'MongoDB or Valkey is not up: the 90% branch limit of backend-events is only reported (npm run infra:up -- backend).',
  );
}

export default workspaceTestConfig({ area: integration ? 'kernel' : 'standard' });
