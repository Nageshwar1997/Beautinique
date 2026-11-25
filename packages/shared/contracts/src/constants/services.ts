// The services that own routes, events, permissions and settings (docs/ARCHITECTURE.md §2.1).
// The name is the first part of a route id, a permission, an event type and a settings key.
export const SERVICES = [
  'audit',
  'catalog',
  'commerce',
  'finance',
  'gateway',
  'identity',
  'logistics',
  'logs',
  'media',
  'notify',
  'payments',
  'support',
] as const;

export type Service = (typeof SERVICES)[number];
