import { workspaceTestConfig } from '../../../configs/vitest/workspace.ts';

// backend-crypto is a kernel package (docs/RULES.md RT-21): the whole of it must reach 90% branch
// coverage. Its unit tests reach every line without a container (the held copies' writer with a
// session in memory), so the limit holds on a laptop too; the integration tests add the real
// MongoDB.
export default workspaceTestConfig({ area: 'kernel' });
