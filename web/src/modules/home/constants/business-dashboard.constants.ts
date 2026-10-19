import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faBoxOpen,
  faBoxes,
  faCashRegister,
  faCreditCard,
  faFileLines,
  faHistory,
  faStore,
  faUndo,
  faUserGear,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';

export interface DashboardKpi {
  id: string;
  label: string;
  value: string;
  caption: string;
}

/** Placeholder metrics until a live analytics API is available. */
export const BUSINESS_DASHBOARD_KPIS: DashboardKpi[] = [
  {
    id: 'sales-today',
    label: "Today's sales",
    value: '—',
    caption: 'Sample — connect live data',
  },
  {
    id: 'orders-open',
    label: 'Open orders',
    value: '—',
    caption: 'Purchase orders in progress',
  },
  {
    id: 'stock-alerts',
    label: 'Low-stock SKUs',
    value: '—',
    caption: 'Below reorder threshold',
  },
  {
    id: 'stores-active',
    label: 'Active stores',
    value: '—',
    caption: 'Locations on your plan',
  },
];

export interface DashboardQuickAction {
  id: string;
  label: string;
  routeName: string;
  icon: string[];
}

export const BUSINESS_DASHBOARD_QUICK_ACTIONS: DashboardQuickAction[] = [
  { id: 'pos', label: 'Open POS', routeName: 'cashier-sales', icon: ['fas', 'cash-register'] },
  { id: 'stores', label: 'Stores', routeName: 'StoreDashboard', icon: ['fas', 'store'] },
  { id: 'products', label: 'Products', routeName: 'Products', icon: ['fas', 'box-open'] },
  { id: 'team', label: 'Team', routeName: 'Users', icon: ['fas', 'users'] },
];

export interface DashboardModuleCard {
  id: string;
  title: string;
  description: string;
  routeName: string;
  icon: IconDefinition;
}

export interface DashboardModuleGroup {
  id: string;
  sectionTitle: string;
  sectionSubtitle: string;
  sectionIcon: string[];
  sectionIconColor: 'blue' | 'purple' | 'green' | 'yellow' | 'red' | 'gray';
  cards: DashboardModuleCard[];
}

export const BUSINESS_DASHBOARD_MODULE_GROUPS: DashboardModuleGroup[] = [
  {
    id: 'operations',
    sectionTitle: 'Operations',
    sectionSubtitle: 'Sales floor, catalog, and locations',
    sectionIcon: ['fas', 'cash-register'],
    sectionIconColor: 'blue',
    cards: [
      {
        id: 'pos',
        title: 'Point of sale',
        description: 'Process sales and manage the active register session.',
        routeName: 'cashier-sales',
        icon: faCashRegister,
      },
      {
        id: 'products',
        title: 'Products',
        description: 'Manage the product catalog and merchandising details.',
        routeName: 'Products',
        icon: faBoxOpen,
      },
      {
        id: 'stores',
        title: 'Stores',
        description: 'Supervise and configure store locations.',
        routeName: 'StoreDashboard',
        icon: faStore,
      },
    ],
  },
  {
    id: 'checkout-suite',
    sectionTitle: 'Checkout & back office',
    sectionSubtitle: 'Returns, history, stock, and reporting in the cashier workspace',
    sectionIcon: ['fas', 'chart-line'],
    sectionIconColor: 'purple',
    cards: [
      {
        id: 'returns',
        title: 'Returns',
        description: 'Handle product returns and adjustments.',
        routeName: 'cashier-returns',
        icon: faUndo,
      },
      {
        id: 'history',
        title: 'Sales history',
        description: 'Review past transactions and receipts.',
        routeName: 'cashier-history',
        icon: faHistory,
      },
      {
        id: 'inventory',
        title: 'Inventory',
        description: 'Stock levels and movements from the cashier app.',
        routeName: 'cashier-inventory',
        icon: faBoxes,
      },
      {
        id: 'reports',
        title: 'Reports',
        description: 'Operational reports for the register.',
        routeName: 'cashier-reports',
        icon: faFileLines,
      },
      {
        id: 'credits',
        title: 'Customer credit',
        description: 'Manage customer credit and balances.',
        routeName: 'cashier-credits',
        icon: faCreditCard,
      },
    ],
  },
  {
    id: 'administration',
    sectionTitle: 'Administration',
    sectionSubtitle: 'People, access, and account settings',
    sectionIcon: ['fas', 'user-gear'],
    sectionIconColor: 'green',
    cards: [
      {
        id: 'users',
        title: 'Users',
        description: 'Manage accounts, roles, and permissions.',
        routeName: 'Users',
        icon: faUsers,
      },
      {
        id: 'profile',
        title: 'Profile & subscription',
        description: 'Your account, billing, and preferences.',
        routeName: 'Profile',
        icon: faUserGear,
      },
    ],
  },
];
