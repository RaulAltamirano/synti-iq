import { RouteRecordRaw } from 'vue-router';
import DefaultLayout from '../../shared/layouts/DefaultLayout/DefaultLayout.vue';

const mainRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: DefaultLayout,
    meta: { requiresAuth: true },
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        meta: {
          requiresAuth: true,
          title: 'Dashboard',
        },
        component: () => import(/* webpackChunkName: "home-module" */ '../../home/pages/Home.vue'),
      },
      {
        path: 'cart',
        name: 'Cart',
        component: () =>
          import(/* webpackChunkName: "cart-module" */ '../../products/components/Cart/Cart.vue'),
      },
      {
        path: 'wishlist',
        name: 'Wishlist',
        component: () =>
          import(/* webpackChunkName: "wishlist-module" */ '../../home/pages/Home.vue'),
      },
      {
        path: 'products',
        name: 'Products',
        component: () =>
          import(
            /* webpackChunkName: "products-module" */ '../../products/pages/Products/Products.vue'
          ),
      },
      {
        path: 'gallery',
        name: 'Gallery',
        meta: { title: 'Gallery' },
        component: () =>
          import(/* webpackChunkName: "gallery-module" */ '../../home/pages/Gallery/Gallery.vue'),
      },
    ],
  },
];

export default mainRoutes;
