import { workspaceTestConfig } from '../../../configs/vitest/workspace.ts';
import { IN_CI, mongoReachable } from './test/utils/mongo.ts';

// The transaction helper and the release step are kernel parts (docs/RULES.md RT-21), so the whole
// package must reach 90% branch coverage. Most of it runs only against the real MongoDB: on a
// laptop with no container up its integration tests are skipped, and then the limit is only
// reported. The CI has the containers, and there the limit always holds.
const integration = IN_CI || (await mongoReachable());
if (!integration) {
  console.warn(
    'MongoDB is not up: the 90% branch limit of backend-mongo is only reported (npm run infra:up -- backend).',
  );
}

export default workspaceTestConfig({ area: integration ? 'kernel' : 'standard' });
