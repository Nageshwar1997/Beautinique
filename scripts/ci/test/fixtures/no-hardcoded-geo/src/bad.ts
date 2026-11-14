// Each export breaks RULES §3.4 once: no-hardcoded-geo.test.ts counts five reports here.
export const launchState = 'Maharashtra';

export const pickupPincode = '411001';

export function isPune(district: string): boolean {
  return district === 'Pune';
}

export function hubLabel(hubId: string): string {
  switch (hubId) {
    case 'CHAKAN-01':
      return 'Chakan';
    default:
      return hubId;
  }
}

export const homeScope = { state: 'MH' };
