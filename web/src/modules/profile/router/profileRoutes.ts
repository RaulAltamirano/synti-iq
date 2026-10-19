import DefaultLayout from '@/modules/shared/layouts/DefaultLayout/DefaultLayout.vue';
import { RouteRecordRaw } from 'vue-router';

export const profileRoutes: RouteRecordRaw[] = [
  {
    path: '/profile',
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Profile',
        meta: {
          requiresAuth: true,
          title: 'Perfil',
        },
        component: () =>
          import(/* webpackChunkName: "profile-page" */ '../page/Profile/Profile.vue'),
      },
      {
        path: 'subscription/renew',
        name: 'SubscriptionRenewal',
        meta: {
          requiresAuth: true,
          title: 'Renovar Suscripción',
        },
        component: () =>
          import(
            /* webpackChunkName: "subscription-renewal" */ '../page/SubscriptionRenewal/SubscriptionRenewal.vue'
          ),
      },
      {
        path: 'subscription/new',
        name: 'SubscriptionNew',
        meta: {
          requiresAuth: true,
          title: 'Contratar Suscripción',
        },
        component: () =>
          import(
            /* webpackChunkName: "subscription-renewal" */ '../page/SubscriptionRenewal/SubscriptionRenewal.vue'
          ),
      },
    ],
  },
];
