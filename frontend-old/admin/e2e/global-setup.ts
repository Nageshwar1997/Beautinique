import type { FullConfig } from '@playwright/test';

import { warmUp } from '../../../scripts/e2e/warm-up';

/**
 * Before the tests: every open page loaded once, so the dev server has bundled its dependencies (a
 * first visit can find new ones and reload the page, "Outdated Optimize Dep") before a test looks.
 */
export default async function globalSetup(config: FullConfig): Promise<void> {
  await warmUp(config.projects[0]?.use.baseURL ?? '', [
    '/sign-in',
    '/invitation',
    '/forgot-password',
    '/credits',
  ]);
}
