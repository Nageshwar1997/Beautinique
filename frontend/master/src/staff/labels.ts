import { type AppId, APPS, INDIAN_STATES, type ScopeType } from '@beautinique/shared-contracts';

/** What each app is called on the Staff pages. */
export const APP_NAMES: Readonly<Record<AppId, string>> = {
  customer: 'Customer',
  seller: 'Seller',
  admin: 'Admin',
  superadmin: 'Super Admin',
  master: 'Master',
  support: 'Support Desk',
  finance: 'Finance',
  logistics: 'Logistics Ops',
  delivery: 'Delivery',
  growth: 'Growth Studio',
  creator: 'Creator',
};

/** The apps as picker options, in the platform's order. */
export const APP_OPTIONS = APPS.map((app) => ({ value: app, label: APP_NAMES[app] }));

export const SCOPE_NAMES: Readonly<Record<ScopeType, string>> = {
  global: 'Everywhere',
  state: 'States',
  district: 'Districts',
  city: 'Cities',
  hub: 'Hubs',
  warehouse: 'Warehouses',
  brand: 'Brands',
  category: 'Categories',
  sellerOrg: 'Seller organisations',
  creatorAgency: 'Creator agencies',
  self: 'Their own account',
};

/**
 * Scope types whose places or records do not exist yet (owner, 2026-11-13, TASKS T3.7): shown, but
 * not chosen, with why. District, city, hub and warehouse come with the location master; brands,
 * categories, seller organisations and creator agencies with their modules.
 */
export const NOT_YET: Partial<Readonly<Record<ScopeType, string>>> = {
  district: 'Comes with the location master',
  city: 'Comes with the location master',
  hub: 'Comes with the location master',
  warehouse: 'Comes with the location master',
  brand: 'Comes with the catalogue',
  category: 'Comes with the catalogue',
  sellerOrg: 'Comes with seller onboarding',
  creatorAgency: 'Comes with creator onboarding',
};

/** Scope types a Staff page can give now: everywhere and states (the ids exist). */
export const GIVABLE_SCOPES: readonly ScopeType[] = ['global', 'state'];

const STATE_NAME = new Map<string, string>(INDIAN_STATES.map((state) => [state.id, state.name]));

/** A scope in words: "Everywhere", "Maharashtra, Gujarat", "3 hubs". */
export function scopeText(scope: { type: ScopeType; ids: readonly string[] }): string {
  if (scope.type === 'global') return 'Everywhere';
  if (scope.type === 'self') return 'Their own account';
  if (scope.type === 'state') return scope.ids.map((id) => STATE_NAME.get(id) ?? id).join(', ');
  return `${SCOPE_NAMES[scope.type]}: ${String(scope.ids.length)}`;
}

const DATE = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Asia/Kolkata',
});

/** An ISO time as an Indian date: "13 Nov 2026". */
export const dateText = (iso: string): string => DATE.format(new Date(iso));

/** A grant's or an invitation's validity in words. */
export function validityText(validFrom: string | null, validTo: string | null): string {
  if (validFrom === null && validTo === null) return 'No end';
  if (validFrom === null) return `Until ${dateText(validTo ?? '')}`;
  if (validTo === null) return `From ${dateText(validFrom)}`;
  return `${dateText(validFrom)} – ${dateText(validTo)}`;
}

/** How a grant came, in words. */
export const VIA_NAMES = {
  'sign-up': 'Sign-up',
  migration: 'Migration',
  bootstrap: 'First Master',
  appointed: 'Given',
  invitation: 'Invitation',
} as const;

/**
 * A date picked in India (YYYY-MM-DD) as the start of that day there, ISO: what the API's
 * validFrom and validTo take ("Ends" is not included, so a role given until the 14th ends as the
 * 14th starts).
 */
export const startOfIndianDay = (date: string): string =>
  new Date(`${date}T00:00:00+05:30`).toISOString();

/** The India day after a `YYYY-MM-DD` one: the earliest an "Ends" can be (it is not included). */
export function nextIndianDay(date: string): string {
  const next = new Date(new Date(`${date}T00:00:00+05:30`).getTime() + 86_400_000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(next);
}

/** Where a grant stands now: ended, not started yet, run out, or active. */
export function grantState(
  grant: { active: boolean; validFrom: string | null; validTo: string | null },
  now = Date.now(),
): 'ended' | 'scheduled' | 'lapsed' | 'active' {
  if (!grant.active) return 'ended';
  if (grant.validFrom !== null && Date.parse(grant.validFrom) > now) return 'scheduled';
  if (grant.validTo !== null && Date.parse(grant.validTo) <= now) return 'lapsed';
  return 'active';
}
