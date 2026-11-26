import { workspaceTestConfig } from '../../../configs/vitest/workspace.ts';

// The config schema is a kernel part (docs/RULES.md RT-21): the whole package must reach 90% branch coverage.
export default workspaceTestConfig({ area: 'kernel' });
