import { workspaceTestConfig } from '../../../configs/vitest/workspace.ts';

// The route manifest is a kernel part (docs/RULES.md RT-21), and the package is small, so the whole
// package must reach 90% branch coverage.
export default workspaceTestConfig({ area: 'kernel' });
