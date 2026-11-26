import { workspaceTestConfig } from '../../../configs/vitest/workspace.ts';

// The logger holds the redaction that nothing may get around (docs/RULES.md CR-22): the whole package must reach 90% branch coverage.
export default workspaceTestConfig({ area: 'kernel' });
