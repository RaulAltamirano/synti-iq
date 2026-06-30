import DefaultLayout from '@/modules/shared/layouts/DefaultLayout/DefaultLayout.vue';
import { RouteRecordRaw } from 'vue-router';

export const storeRoutes: RouteRecordRaw[] = [
  {
    path: '/store',
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '', // path vacío para usar como dashboard por defecto
        name: 'StoreDashboard',
        meta: {
          requiresAuth: true,
          roles: ['admin', 'business_owner'],
          title: 'Store Dashboard',
        },
        component: () =>
          import(
            /* webpackChunkName: "store-dashboard" */ '../pages/storeDashboard/storeDashboard.vue'
          ),
      },
      {
        path: 'add',
        name: 'AddStore',
        meta: {
          requiresAuth: true,
          roles: ['admin', 'business_owner'],
          title: 'Add Store',
        },
        component: () =>
          import(/* webpackChunkName: "add-store" */ '../pages/StoreForm/StoreForm.vue'),
      },
      {
        path: ':id/cashiers',
        name: 'StoreCashiers',
        meta: {
          requiresAuth: true,
          roles: ['admin', 'business_owner'],
          title: 'Store Cashiers',
        },
        component: () =>
          import(
            /* webpackChunkName: "store-cashiers" */ '../pages/StoreCashiers/StoreCashiers.vue'
          ),
      },
      {
        path: ':id',
        name: 'StoreDetails',
        meta: {
          requiresAuth: true,
          roles: ['admin', 'business_owner'],
          title: 'Store Details',
        },
        component: () =>
          import(/* webpackChunkName: "store-details" */ '../pages/StoreDetails/StoreDetails.vue'),
      },
    ],
  },
];
