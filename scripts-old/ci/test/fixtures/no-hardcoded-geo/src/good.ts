// Code that only looks like places: none of it is reported.
export const INDIA_TIME_ZONE = 'Asia/Kolkata';

export function isIdle(state: string): boolean {
  return state === 'idle';
}

export function isDistrictScope(scopeType: string): boolean {
  return scopeType === 'district';
}

export function hasDistrict(district: string): boolean {
  return district !== '';
}

export function isGitHub(provider: string): boolean {
  return provider === 'github';
}

export const SCOPE_NAMES = { state: 'State', district: 'District', hub: 'Hub' };

export const TIMEOUT_MS = 300000;
