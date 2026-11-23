// Coverage limits by area (docs/RULES.md RT-23), measured with V8. Kernel packages and money, stock
// and permissions code stop the run below their limit; the rest only reports, and its limit is
// checked before a release.
export const COVERAGE_LIMITS = {
  kernel: { branches: 90 },
  critical: { branches: 85 },
  standard: { lines: 70 },
} as const;

export interface CoverageOptions {
  /** `kernel` for a kernel package (RULES RT-21): the whole package must meet the kernel limit. */
  area?: 'kernel' | 'standard';
  /** Globs (from the workspace folder) of money, stock and permissions code inside the workspace. */
  critical?: string[];
}

// Vitest's `coverage.thresholds` for a workspace: a global limit for a kernel package, and one
// limit per glob of money, stock and permissions code.
export function coverageThresholds({ area = 'standard', critical = [] }: CoverageOptions) {
  const thresholds: Record<string, { branches?: number; lines?: number }> = {};
  if (area === 'kernel') Object.assign(thresholds, COVERAGE_LIMITS.kernel);
  for (const glob of critical) thresholds[glob] = { ...COVERAGE_LIMITS.critical };
  return thresholds;
}
