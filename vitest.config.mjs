// @ts-check
// Only for Vitest started at the repo root (`npx vitest run <path>`): it skips Claude Code's
// worktrees, other checkouts of this repo under .claude/worktrees (QA-TOOL-001). `npm test` runs
// scripts/vitest.config.ts and every workspace from its own folder; neither reads this file.
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: { exclude: [...configDefaults.exclude, '.claude/**'] },
});
