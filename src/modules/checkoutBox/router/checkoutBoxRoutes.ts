import CheckoutBoxLayout from '@/modules/shared/layouts/CheckoutBoxLayout/CheckoutBoxLayout.vue';
import { RouteRecordRaw } from 'vue-router';

/**
 * Roles allowed to open the POS shell. Keep aligned with product policy; API enforces permissions.
 */
const CHECKOUT_BOX_ROLES = ['admin', 'cashier', 'business_owner', 'manager'] as const;

const BASE_PATH = '/cashier';

const salesViewRoutes: RouteRecordRaw[] = [
  {
    path: 'dashboard',
    name: 'cashier-dashboard',
    meta: {
      requiresAuth: true,
      roles: [...CHECKOUT_BOX_ROLES],
      title: 'CashierDashboard',
    },
    component: () =>
      import(/* webpackChunkName: "cashier-dashboard" */ '../page/CashierDashboard/CashierDashboard.vue'),
  },
  {
    path: 'sales',
    name: 'cashier-sales',
    meta: {
      requiresAuth: true,
      roles: [...CHECKOUT_BOX_ROLES],
      title: 'Sales',
    },
    component: () => import(/* webpackChunkName: "sales-view" */ '../page/SalesView/SalesView.vue'),
  },
  {
    path: 'returns',
    name: 'cashier-returns',
    meta: {
      requiresAuth: true,
      roles: [...CHECKOUT_BOX_ROLES],
      title: 'Returns',
    },
    component: () =>
      import(/* webpackChunkName: "returns-view" */ '../page/ReturnsView/ReturnsView.vue'),
  },
  {
    path: 'register',
    name: 'cashier-register',
    meta: {
      requiresAuth: true,
      roles: [...CHECKOUT_BOX_ROLES],
      title: 'CashRegister',
    },
    component: () =>
      import(/* webpackChunkName: "register-view" */ '../page/CashRegister/CashRegister.vue'),
  },
  {
    path: 'credits',
    name: 'cashier-credits',
    meta: {
      requiresAuth: true,
      roles: [...CHECKOUT_BOX_ROLES],
      title: 'Credits',
    },
    component: () =>
      import(/* webpackChunkName: "credits-view" */ '../page/CustomerCredit/CustomerCredit.vue'),
  },
  {
    path: 'history',
    name: 'cashier-history',
    meta: {
      requiresAuth: true,
      roles: [...CHECKOUT_BOX_ROLES],
      title: 'SalesHistory',
    },
    component: () =>
      import(/* webpackChunkName: "history-view" */ '../page/SalesHistory/SalesHistory.vue'),
  },
  {
    path: 'inventory',
    name: 'cashier-inventory',
    meta: {
      requiresAuth: true,
      roles: [...CHECKOUT_BOX_ROLES],
      title: 'InventoryManagement',
    },
    component: () =>
      import(
        /* webpackChunkName: "inventory-view" */ '../page/InventoryManagement/InventoryManagement.vue'
      ),
  },
  {
    path: 'reports',
    name: 'cashier-reports',
    meta: {
      requiresAuth: true,
      roles: [...CHECKOUT_BOX_ROLES],
      title: 'Reports',
    },
    component: () =>
      import(/* webpackChunkName: "reports-view" */ '../page/ReportsCheckout/ReportsCheckout.vue'),
  },
];

export const checkoutBoxRoutes: RouteRecordRaw[] = [
  {
    path: BASE_PATH,
    component: CheckoutBoxLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: { name: 'cashier-dashboard' } },
      ...salesViewRoutes,
    ],
  },
];
