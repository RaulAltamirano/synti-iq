import { createRouter, createWebHistory } from 'vue-router';
import { RouteRecordRaw } from 'vue-router';

import mainRoutes from '../modules/home/router/mainRoutes';
import authRoutes from '../modules/auth/routes/authRoutes';
import NotFoundRoute from '../modules/shared/components/NotFoundRoute/NotFoundRoute.vue';
import NotPermissionRoute from '../modules/shared/components/NotPermissionRoute/NotPermissionRoute.vue';
import LoadingView from '../modules/shared/pages/LoadingView/LoadingView.vue';
import { setupRouterGuards } from '../modules/auth/guard/setupRouterGuards';
import { userRoutes } from '../modules/users/router/userRoutes';
import { checkoutBoxRoutes } from '@/modules/checkoutBox/router/checkoutBoxRoutes';
import { storeRoutes } from '@/modules/store/router/storeRoutes';
import { locationRoutes } from '@/modules/location/router/locationRoutes';
import { profileRoutes } from '@/modules/profile/router/profileRoutes';

const errorNotFoundRoute: RouteRecordRaw = {
  path: '/:catchAll(.*)*',
  name: 'NotFound',
  component: NotFoundRoute,
};
const errorNotPermissionRoute: RouteRecordRaw = {
  path: '/403',
  name: 'Forbidden',
  component: NotPermissionRoute,
  meta: { requiresAuth: false, title: 'Acceso restringido' },
};
const LoadingViewRoute: RouteRecordRaw = {
  path: '/loading',
  name: 'Loading',
  component: LoadingView,
};

const routes: RouteRecordRaw[] = [
  ...authRoutes,
  ...mainRoutes,
  ...userRoutes,
  ...storeRoutes,
  ...locationRoutes,
  ...checkoutBoxRoutes,
  ...profileRoutes,
  LoadingViewRoute,
  errorNotFoundRoute,
  errorNotPermissionRoute,
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

setupRouterGuards(router);

export default router;
