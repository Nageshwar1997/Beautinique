// Each export breaks RULES §3.5 once: no-role-comparison.test.ts counts five reports here.
const MASTER_ROLE = 'master.master';

export const isMaster = (role: string): boolean => role === 'MASTER';

export const holdsMaster = (keys: string[]): boolean => keys.includes('master.master');

export const isTheMaster = (key: string): boolean => key === MASTER_ROLE;

export function label(grant: { role: string }): string {
  switch (grant.role) {
    case 'admin.state_admin':
      return 'State Admin';
    default:
      return grant.role;
  }
}

export const isNightLead = (role: { key: string }): boolean =>
  role.key !== 'logistics.c_night_lead';
