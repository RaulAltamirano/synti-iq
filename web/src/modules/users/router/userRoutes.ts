import DefaultLayout from '@/modules/shared/layouts/DefaultLayout/DefaultLayout.vue';
import { RouteRecordRaw } from 'vue-router';

export const userRoutes: RouteRecordRaw[] = [
  {
    path: '/users',
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '', // Ruta base para listar usuarios
        name: 'Users',
        meta: {
          requiresAuth: true,
          // roles: ['admin'],
          title: 'User List',
        },
        component: () => import(/* webpackChunkName: "users-list" */ '../../users/pages/Users.vue'),
      },
      {
        path: 'add',
        name: 'AddUser',
        meta: {
          requiresAuth: true,
          // roles: ['admin'],
          title: 'Add User',
        },
        component: () =>
          import(/* webpackChunkName: "user-add" */ '../pages/FormUser/FormUser.vue'),
      },
      {
        path: 'edit/:id',
        name: 'EditUser',
        meta: {
          requiresAuth: true,
          // roles: ['admin'],
          title: 'Edit User',
        },
        component: () =>
          import(/* webpackChunkName: "user-edit" */ '../pages/FormUser/FormUser.vue'),
      },
      {
        path: 'dashboard/:id',
        name: 'UserDashboard',
        meta: {
          requiresAuth: true,
          // roles: ['admin'],
          title: 'User Dashboard',
        },
        component: () =>
          import(
            /* webpackChunkName: "user-dashboard" */ '../pages/UserDashboard/UserDashboard.vue'
          ),
      },
    ],
  },
];
