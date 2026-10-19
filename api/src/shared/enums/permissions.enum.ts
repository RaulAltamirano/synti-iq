export enum Permission {
  PROCESS_SALES = 'process_sales',
  VOID_TRANSACTIONS = 'void_transactions',
  PROCESS_REFUNDS = 'process_refunds',
  APPLY_DISCOUNTS = 'apply_discounts',
  VIEW_RECENT_RECEIPTS = 'view_recent_receipts',
  VIEW_PRODUCTS = 'view_products',
  CREATE_PRODUCTS = 'create_products',
  UPDATE_PRODUCTS = 'update_products',
  DELETE_PRODUCTS = 'delete_products',
  MANAGE_PRODUCTS = 'manage_products',
  MANAGE_PRODUCT_PRICES = 'manage_product_prices',
  MANAGE_INVENTORY = 'manage_inventory',
  VIEW_REPORTS = 'view_reports',
  VIEW_SALES_REPORTS = 'view_sales_reports',
  VIEW_INVENTORY_REPORTS = 'view_inventory_reports',
  VIEW_FINANCIAL_REPORTS = 'view_financial_reports',
  EXPORT_REPORTS = 'export_reports',
  MANAGE_USERS = 'manage_users',
  VIEW_USERS = 'view_users',
  MANAGE_ROLES = 'manage_roles',
}

export const ALL_PERMISSIONS = Object.values(Permission) as string[];

export function isPermission(permission: string): permission is Permission {
  return ALL_PERMISSIONS.includes(permission as Permission);
}

export interface PermissionMetadata {
  name: string;
  description: string;
  category: 'sales' | 'products' | 'inventory' | 'reports' | 'users';
  criticality: 'low' | 'medium' | 'high' | 'critical';
}

export const PERMISSION_METADATA: Record<string, PermissionMetadata> = {
  [Permission.PROCESS_SALES]: {
    name: Permission.PROCESS_SALES,
    description: 'Process sales transactions and complete purchases',
    category: 'sales',
    criticality: 'critical',
  },
  [Permission.VOID_TRANSACTIONS]: {
    name: Permission.VOID_TRANSACTIONS,
    description: 'Cancel or void sales transactions (typically manager-only)',
    category: 'sales',
    criticality: 'critical',
  },
  [Permission.PROCESS_REFUNDS]: {
    name: Permission.PROCESS_REFUNDS,
    description: 'Process refunds for completed transactions',
    category: 'sales',
    criticality: 'high',
  },
  [Permission.APPLY_DISCOUNTS]: {
    name: Permission.APPLY_DISCOUNTS,
    description: 'Apply discounts to sales items or transactions',
    category: 'sales',
    criticality: 'high',
  },
  [Permission.VIEW_RECENT_RECEIPTS]: {
    name: Permission.VIEW_RECENT_RECEIPTS,
    description: 'View recent transaction receipts (typically limited to last N receipts)',
    category: 'sales',
    criticality: 'medium',
  },
  [Permission.VIEW_PRODUCTS]: {
    name: Permission.VIEW_PRODUCTS,
    description: 'View product information and listings',
    category: 'products',
    criticality: 'low',
  },
  [Permission.CREATE_PRODUCTS]: {
    name: Permission.CREATE_PRODUCTS,
    description: 'Create new products in the system',
    category: 'products',
    criticality: 'high',
  },
  [Permission.UPDATE_PRODUCTS]: {
    name: Permission.UPDATE_PRODUCTS,
    description: 'Update existing product information',
    category: 'products',
    criticality: 'high',
  },
  [Permission.DELETE_PRODUCTS]: {
    name: Permission.DELETE_PRODUCTS,
    description: 'Permanently delete products from the system',
    category: 'products',
    criticality: 'critical',
  },
  [Permission.MANAGE_PRODUCTS]: {
    name: Permission.MANAGE_PRODUCTS,
    description:
      'Manage products (create, update, delete) - legacy permission for backward compatibility',
    category: 'products',
    criticality: 'high',
  },
  [Permission.MANAGE_PRODUCT_PRICES]: {
    name: Permission.MANAGE_PRODUCT_PRICES,
    description: 'Modify product pricing information',
    category: 'products',
    criticality: 'high',
  },
  [Permission.MANAGE_INVENTORY]: {
    name: Permission.MANAGE_INVENTORY,
    description: 'Manage inventory movements, stock adjustments, and inventory operations',
    category: 'inventory',
    criticality: 'high',
  },
  [Permission.VIEW_REPORTS]: {
    name: Permission.VIEW_REPORTS,
    description: 'View general reports (maintained for backward compatibility)',
    category: 'reports',
    criticality: 'medium',
  },
  [Permission.VIEW_SALES_REPORTS]: {
    name: Permission.VIEW_SALES_REPORTS,
    description: 'View sales-related reports and analytics',
    category: 'reports',
    criticality: 'medium',
  },
  [Permission.VIEW_INVENTORY_REPORTS]: {
    name: Permission.VIEW_INVENTORY_REPORTS,
    description: 'View inventory-related reports and stock analytics',
    category: 'reports',
    criticality: 'medium',
  },
  [Permission.VIEW_FINANCIAL_REPORTS]: {
    name: Permission.VIEW_FINANCIAL_REPORTS,
    description: 'View financial reports, revenue analytics, and sensitive financial data',
    category: 'reports',
    criticality: 'critical',
  },
  [Permission.EXPORT_REPORTS]: {
    name: Permission.EXPORT_REPORTS,
    description: 'Export reports to files (CSV, PDF, Excel, etc.)',
    category: 'reports',
    criticality: 'medium',
  },
  [Permission.MANAGE_USERS]: {
    name: Permission.MANAGE_USERS,
    description: 'Manage users, roles, and permissions in the system',
    category: 'users',
    criticality: 'critical',
  },
  [Permission.VIEW_USERS]: {
    name: Permission.VIEW_USERS,
    description: 'View user information without modification rights',
    category: 'users',
    criticality: 'low',
  },
  [Permission.MANAGE_ROLES]: {
    name: Permission.MANAGE_ROLES,
    description: 'Create, update, and delete roles and permission groups',
    category: 'users',
    criticality: 'critical',
  },
};
