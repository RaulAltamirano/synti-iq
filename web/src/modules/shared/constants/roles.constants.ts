/**
 * Role constants aligned with API SystemRole enum.
 * Keep in sync with synti-iq-api/src/shared/enums/roles.enum.ts
 */

export const SYSTEM_ROLES = [
  'admin',
  'manager',
  'customer',
  'provider',
  'cashier',
  'delivery',
  'business_owner',
] as const;

export type SystemRole = (typeof SYSTEM_ROLES)[number];

/** Semantic color tone from the design system (@theme scales). */
export type RoleTone = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'gray';

export interface RoleConfig {
  label: string;
  /** FontAwesome solid icon name. */
  icon: string;
  /** Semantic accent tone — maps to design tokens, never raw hex. */
  tone: RoleTone;
}

const ROLE_CONFIGS: Record<string, RoleConfig> = {
  admin: {
    label: 'Admin',
    icon: 'user-shield',
    tone: 'warning',
  },
  manager: {
    label: 'Manager',
    icon: 'user-tie',
    tone: 'primary',
  },
  customer: {
    label: 'Customer',
    icon: 'user',
    tone: 'success',
  },
  provider: {
    label: 'Provider',
    icon: 'boxes-stacked',
    tone: 'info',
  },
  cashier: {
    label: 'Cashier',
    icon: 'cash-register',
    tone: 'warning',
  },
  delivery: {
    label: 'Delivery',
    icon: 'truck',
    tone: 'error',
  },
  business_owner: {
    label: 'Business Owner',
    icon: 'briefcase',
    tone: 'info',
  },
};

const DEFAULT_ROLE_CONFIG: RoleConfig = {
  label: 'Unknown',
  icon: 'circle-question',
  tone: 'gray',
};

export function getRoleConfig(role: string): RoleConfig {
  const normalizedRole = role?.toLowerCase().trim();
  if (!normalizedRole) {
    return DEFAULT_ROLE_CONFIG;
  }
  return ROLE_CONFIGS[normalizedRole] ?? DEFAULT_ROLE_CONFIG;
}

export function isSystemRole(role: string): role is SystemRole {
  return SYSTEM_ROLES.includes(role?.toLowerCase() as SystemRole);
}
