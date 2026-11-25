// What a permission applies to (docs/ARCHITECTURE.md §11 rule 4). Going inwards: `global` holds
// `national`, which holds `state`, `district`, `subDistrict` and `hub`; a warehouse is inside its
// district.
export const SCOPE_TYPES = [
  'self',
  'seller',
  'state',
  'district',
  'subDistrict',
  'hub',
  'warehouse',
  'national',
  'global',
] as const;

export type ScopeType = (typeof SCOPE_TYPES)[number];
