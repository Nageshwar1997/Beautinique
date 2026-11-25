import { workspaceTestConfig } from '../../../configs/vitest/workspace.ts';

// A kernel package (docs/RULES.md RT-21): the whole package must reach 90% branch coverage.
export default workspaceTestConfig({ area: 'kernel' });
