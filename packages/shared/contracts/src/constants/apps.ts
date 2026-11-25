// The apps that call the routes: the audience (`aud`) of a token (docs/PROJECT_PLAN.md §3, the
// modules 16 to 26).
export const APPS = [
  'admin',
  'creator',
  'customer',
  'delivery',
  'finance',
  'growth-studio',
  'logistics-ops',
  'master',
  'seller',
  'super-admin',
  'support-desk',
] as const;

export type App = (typeof APPS)[number];
