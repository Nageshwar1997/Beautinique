import { mergeConfig } from 'vitest/config';

import { workspaceTestConfig } from '../../configs/vitest/workspace.ts';

export default mergeConfig(workspaceTestConfig(), {
  test: { setupFiles: ['./test/setup.ts'] },
});
