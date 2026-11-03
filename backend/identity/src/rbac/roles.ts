import {
  type AppId,
  appSignIn,
  grantManage,
  grantRead,
  roleManage,
  type ScopeType,
  sessionRevoke,
  totpReset,
} from '@beautinique/shared-contracts';

/**
 * A role identity ships (ARCHITECTURE §7.3): the 79 roles of PRD §3.2 (11 main + 68 sub-roles)
 * and the two sign-up roles. Roles are data: the release step writes these into identity_roles,
 * and Master can add sub-roles there without a deploy. A module adds its permission keys to the
 * roles that use them, here, in the change that brings the keys.
 */
export interface RoleSeed {
  /** `<app>.<name>`, never changes */
  key: string;
  app: AppId;
  name: string;
  /** The app's main role (PRD §3.2, bold) */
  main: boolean;
  /** Scope types a grant of it may have */
  scopeTypes: readonly ScopeType[];
  /** Its permission keys; `iam.app.sign_in` is always one */
  permissions: readonly string[];
  /** Roles whose holders may give it (ARCHITECTURE §7.3); empty = only identity itself */
  appointedBy: readonly string[];
  /** Its holder must use an authenticator at every sign-in, in every app (ARCHITECTURE §7.1) */
  mfaRequired: boolean;
  /** Given by identity when the account signs up in the app: not one of the PRD's 79 */
  signUp: boolean;
  /** How many people may hold it at once; null = no limit */
  maxHolders: number | null;
}

const MASTER = 'master.master';
const STATE_ADMIN = 'admin.state_admin';
const SELLER_OWNER = 'seller.account_owner';
const OWN_BRAND_MANAGER = 'seller.own_brand_manager';
const LOGISTICS_HEAD = 'logistics.logistics_head';
const HUB_MANAGER = 'logistics.hub_manager';
const RIDER_ONBOARDING = 'logistics.rider_onboarding';
const CREATOR_MANAGER = 'growth.creator_partnerships';

/** Appointers keep a list of their people and change it. */
const APPOINTS = [grantRead.key, grantManage.key];

interface RoleOptions {
  main?: boolean;
  permissions?: readonly string[];
  appointedBy?: readonly string[];
  mfaRequired?: boolean;
  signUp?: boolean;
  maxHolders?: number;
}

function role(
  app: AppId,
  name: string,
  title: string,
  scopeTypes: readonly ScopeType[],
  options: RoleOptions = {},
): RoleSeed {
  return {
    key: `${app}.${name}`,
    app,
    name: title,
    main: options.main ?? false,
    scopeTypes,
    permissions: [appSignIn.key, ...(options.permissions ?? [])],
    appointedBy: options.appointedBy ?? [MASTER],
    mfaRequired: options.mfaRequired ?? false,
    signUp: options.signUp ?? false,
    maxHolders: options.maxHolders ?? null,
  };
}

const SELF = ['self'] as const;
const GLOBAL = ['global'] as const;
const ORG = ['sellerOrg'] as const;
/** A seller's staff: given by its Account Owner, in the house brand by the Own-Brand Manager. */
const SELLER_STAFF = { appointedBy: [SELLER_OWNER, OWN_BRAND_MANAGER] };
const BY_LOGISTICS_HEAD = { appointedBy: [MASTER, LOGISTICS_HEAD] };
const BY_HUB_MANAGER = { appointedBy: [MASTER, LOGISTICS_HEAD, HUB_MANAGER] };
const BY_CREATOR_MANAGER = { appointedBy: [CREATOR_MANAGER] };

export const ROLE_SEEDS: readonly RoleSeed[] = [
  // 1. Customer
  role('customer', 'customer', 'Customer', SELF, { main: true, signUp: true, appointedBy: [] }),
  role('customer', 'pro_buyer', 'Beauty Pro Buyer', SELF, { appointedBy: [STATE_ADMIN] }),

  // 2. Seller
  role('seller', 'account_owner', 'Seller Account Owner', ORG, {
    main: true,
    permissions: APPOINTS,
    appointedBy: [STATE_ADMIN],
    mfaRequired: true,
  }),
  role('seller', 'grievance_officer', 'Seller Grievance Officer', ORG, SELLER_STAFF),
  role('seller', 'own_brand_manager', 'Own-Brand Manager', ORG, { permissions: APPOINTS }),
  role('seller', 'own_brand_qa', 'Own-Brand QA & Batch Release', ORG, {
    appointedBy: [OWN_BRAND_MANAGER],
  }),
  role('seller', 'dispatch_inventory', 'Seller Dispatch & Inventory', ORG, SELLER_STAFF),
  role('seller', 'catalog_manager', 'Seller Catalog Manager', ORG, SELLER_STAFF),
  role('seller', 'finance', 'Seller Finance', ORG, { ...SELLER_STAFF, mfaRequired: true }),
  role('seller', 'compliance_quality', 'Seller Compliance & Quality', ORG, SELLER_STAFF),
  role('seller', 'marketing_promotions', 'Seller Marketing & Promotions', ORG, SELLER_STAFF),
  role('seller', 'api_integration', 'Seller API Integration', ORG, SELLER_STAFF),
  role('seller', 'applicant', 'Seller Applicant', SELF, { signUp: true, appointedBy: [] }),

  // 3. Admin
  role('admin', 'state_admin', 'State Admin', ['state'], { main: true, permissions: APPOINTS }),
  role('admin', 'catalog_qc', 'Catalog QC & Listing Approver', ['global', 'category']),
  role('admin', 'cosmetics_regulatory', 'Cosmetics Regulatory & Product Safety', GLOBAL),
  role('admin', 'tryon_shade', 'Try-on & Shade Specialist', ['global', 'category']),
  role('admin', 'brand_protection', 'Seller Integrity & Brand Protection', ['global', 'brand']),
  role('admin', 'seller_ops_lead', 'Seller Operations Lead', ['global', 'state']),
  role('admin', 'category_manager', 'Category Manager', ['category']),
  role('admin', 'brand_partnerships', 'Brand Partnerships / Key Account Manager', [
    'global',
    'brand',
  ]),
  role('admin', 'catalog_content', 'Catalog Content Executive', ['global', 'category', 'brand']),
  role('admin', 'fraud_risk', 'Fraud & Risk Analyst', GLOBAL),
  role('admin', 'trust_safety_lead', 'Trust & Safety Lead', GLOBAL),

  // 4. Super Admin
  role('superadmin', 'super_admin', 'Super Admin', GLOBAL, { main: true }),
  role('superadmin', 'ugc_moderator', 'Review & UGC Moderator', GLOBAL),

  // 5. Master
  role('master', 'master', 'Master', GLOBAL, {
    main: true,
    permissions: [...APPOINTS, roleManage.key],
    appointedBy: [],
    mfaRequired: true,
    maxHolders: 2,
  }),
  role('master', 'head_of_operations', 'Head of Operations', GLOBAL),
  role('master', 'legal_compliance', 'Legal & Compliance Officer (Nodal Person)', GLOBAL),
  role('master', 'fairness_analyst', 'Marketplace Fairness & Price-Integrity Analyst', GLOBAL),
  role('master', 'dpo', 'Data Protection Officer (DPDP contact)', GLOBAL),
  role('master', 'security_officer', 'Security Officer (CERT-In contact)', GLOBAL, {
    permissions: [grantRead.key, sessionRevoke.key, totpReset.key],
  }),
  role('master', 'internal_auditor', 'Internal Auditor', GLOBAL, { permissions: [grantRead.key] }),

  // 6. Support Desk
  role('support', 'l1_agent', 'Customer Support Agent (L1)', GLOBAL, { main: true }),
  role('support', 'grievance_officer', 'Grievance Officer', GLOBAL),
  role('support', 'l3_engineer', 'Production Support Engineer (L3)', GLOBAL),
  role('support', 'l2_specialist', 'Customer Support Specialist (L2)', GLOBAL),
  role('support', 'support_lead', 'Support Lead', GLOBAL),
  role('support', 'seller_support_agent', 'Seller Support Agent', GLOBAL),
  role('support', 'bpo_supervisor', 'BPO Supervisor', GLOBAL),
  role('support', 'beauty_advisor', 'Beauty Advisor', GLOBAL),
  role('support', 'skin_hair_expert', 'Skin & Hair Expert', GLOBAL),

  // 7. Finance
  role('finance', 'finance_manager', 'Finance Manager', GLOBAL, { main: true }),
  role('finance', 'tax_compliance', 'Tax & Statutory Compliance', GLOBAL),
  role('finance', 'procurement_ap', 'Procurement & Accounts Payable', GLOBAL),
  role('finance', 'payouts_executive', 'Payouts Executive', GLOBAL),
  role('finance', 'payments_reconciliation', 'Payments & Refund Reconciliation', GLOBAL),

  // 8. Logistics Ops
  role('logistics', 'logistics_head', 'Supply Chain & Logistics Head', GLOBAL, {
    main: true,
    permissions: APPOINTS,
  }),
  role('logistics', 'network_planner', 'Network & Serviceability Planner', ['global', 'state'], {
    ...BY_LOGISTICS_HEAD,
  }),
  role('logistics', 'warehouse_manager', 'Warehouse Manager', ['warehouse'], BY_LOGISTICS_HEAD),
  role('logistics', 'grn_executive', 'Inbound & GRN Executive', ['warehouse'], BY_LOGISTICS_HEAD),
  role('logistics', 'inventory_controller', 'Inventory Controller', ['warehouse'], {
    ...BY_LOGISTICS_HEAD,
  }),
  role('logistics', 'fulfilment_associate', 'Fulfilment Associate (Picker/Packer)', ['warehouse'], {
    ...BY_LOGISTICS_HEAD,
  }),
  role('logistics', 'hub_manager', 'Hub Manager', ['hub'], {
    ...BY_LOGISTICS_HEAD,
    permissions: APPOINTS,
  }),
  role('logistics', 'hub_ops', 'Hub Operations Executive', ['hub'], BY_HUB_MANAGER),
  role('logistics', 'returns_qc', 'Returns QC Inspector', ['warehouse'], BY_LOGISTICS_HEAD),
  role('logistics', 'rider_onboarding', 'Rider Onboarding & Compliance', ['city', 'hub'], {
    ...BY_HUB_MANAGER,
    permissions: APPOINTS,
  }),
  role(
    'logistics',
    'partner_support',
    'Delivery Partner Support & Grievance',
    ['global', 'state'],
    {
      ...BY_LOGISTICS_HEAD,
    },
  ),
  role('logistics', 'linehaul', 'Line-haul & Stock Transfer', GLOBAL, BY_LOGISTICS_HEAD),
  role('logistics', 'demand_planner', 'Demand & Inventory Planner', GLOBAL, BY_LOGISTICS_HEAD),
  role('logistics', 'returns_to_vendor', 'Returns-to-Vendor & Liquidation', ['warehouse'], {
    ...BY_LOGISTICS_HEAD,
  }),
  role('logistics', 'city_manager', 'City Logistics Manager', ['city'], BY_LOGISTICS_HEAD),
  role('logistics', 'control_tower', 'Logistics Control Tower', ['global', 'state', 'city'], {
    ...BY_LOGISTICS_HEAD,
  }),
  role('logistics', 'loss_prevention', 'Loss Prevention', ['global', 'state', 'warehouse', 'hub'], {
    ...BY_LOGISTICS_HEAD,
  }),
  role('logistics', 'regional_head', 'Regional Logistics Head', ['state'], BY_LOGISTICS_HEAD),

  // 9. Delivery
  role('delivery', 'partner', 'Delivery Partner', ['hub'], {
    main: true,
    appointedBy: [HUB_MANAGER, RIDER_ONBOARDING],
  }),
  role('delivery', 'team_lead', 'Rider Team Lead', ['hub'], { appointedBy: [HUB_MANAGER] }),

  // 10. Growth Studio
  role('growth', 'marketing_head', 'Marketing Head', GLOBAL, { main: true }),
  role('growth', 'merchandiser', 'Storefront Merchandiser', GLOBAL),
  role('growth', 'promotions_coupons', 'Promotions & Coupon Manager', GLOBAL),
  role('growth', 'crm_lifecycle', 'CRM & Lifecycle Manager', GLOBAL),
  role('growth', 'loyalty_rewards', 'Loyalty & Rewards Manager', GLOBAL),
  role('growth', 'content_editor', 'Content Editor', GLOBAL),
  role('growth', 'creator_partnerships', 'Creator & Affiliate Partnerships Manager', GLOBAL, {
    permissions: APPOINTS,
  }),
  role('growth', 'pro_b2b', 'Pro & B2B Programme Manager', GLOBAL),
  role('growth', 'retail_media', 'Retail Media Manager', GLOBAL),
  role('growth', 'city_growth', 'City Growth Manager', ['city']),

  // 11. Creator
  role('creator', 'creator', 'Creator / Influencer', SELF, { main: true, ...BY_CREATOR_MANAGER }),
  role('creator', 'affiliate', 'Affiliate Partner', SELF, BY_CREATOR_MANAGER),
  role('creator', 'agency_manager', 'Creator Agency Manager', ['creatorAgency'], {
    ...BY_CREATOR_MANAGER,
  }),
  role('creator', 'applicant', 'Creator Applicant', SELF, { signUp: true, appointedBy: [] }),
];

export const MASTER_ROLE = MASTER;

/** The role identity gives when an account signs up in an app (ARCHITECTURE §7.1). */
export const SIGN_UP_ROLES: Partial<Record<AppId, string>> = Object.fromEntries(
  ROLE_SEEDS.filter((seed) => seed.signUp).map((seed) => [seed.app, seed.key]),
);
