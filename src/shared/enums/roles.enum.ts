export enum SystemRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  CUSTOMER = 'customer',
  PROVIDER = 'provider',
  CASHIER = 'cashier',
  DELIVERY = 'delivery',
}

export const SYSTEM_ROLES = Object.values(SystemRole) as string[];

export function isSystemRole(role: string): role is SystemRole {
  return SYSTEM_ROLES.includes(role);
}
