// Code that only looks like a role check: none of it is reported.
export const mayGive = (permissions: readonly string[]): boolean =>
  permissions.includes('iam.grant.manage');

export const isKycDocument = (purpose: string): boolean => purpose === 'seller.kyc_document';

export const noRoleChosen = (role: string): boolean => role === '';

export const sameRole = (a: { role: string }, b: { role: string }): boolean => a.role === b.role;

export const isCustomerApp = (app: string): boolean => app === 'customer';

export const LABELS = { role: 'Role' };
