// A test fixture, not code that ships: no-hardcoded-geo.test.ts names this file in geoDataFiles
// and expects no report here, though it holds the same kind of values as bad.ts (five reports),
// so the opt-out is proven to reach exactly the files it names. Real place data lives in the
// contracts states list and, later, the location data (T4.2).
export const LAUNCH_STATES = ['Maharashtra', 'Karnataka'] as const;

export const LAUNCH_PINCODES = ['411001', '410501'] as const;
