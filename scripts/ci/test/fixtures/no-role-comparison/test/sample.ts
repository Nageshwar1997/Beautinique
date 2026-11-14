// Tests name roles on purpose (they give them): outside src/ and app/.
export const isMaster = (grant: { role: string }): boolean => grant.role === 'master.master';
