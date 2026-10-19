import DefaultLayout from '@/modules/shared/layouts/DefaultLayout/DefaultLayout.vue';
import { RouteRecordRaw } from 'vue-router';

export const locationRoutes: RouteRecordRaw[] = [
  {
    path: '/location',
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: ':locationId/edit',
        name: 'LocationEdit',
        meta: {
          requiresAuth: true,
          roles: ['admin', 'business_owner'],
          title: 'Editar dirección',
        },
        component: () =>
          import(/* webpackChunkName: "location-edit" */ '../pages/LocationEdit/LocationEdit.vue'),
      },
    ],
  },
];
