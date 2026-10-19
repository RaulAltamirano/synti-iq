import { NavigationGuardNext, RouteLocationNormalized, Router } from 'vue-router';
import type { User } from '../interfaces/auth.types';
import { useAuthStore } from '../stores/authStore';
import { getPostAuthRedirect } from '../utils/post-auth-redirect.util';
import '../interfaces/auth.types';

function collectRouteMeta(to: RouteLocationNormalized): {
  requiresAuth: boolean;
  roles: string[];
  permissions: string[];
} {
  const result = {
    requiresAuth: false,
    roles: [] as string[],
    permissions: [] as string[],
  };

  for (const record of to.matched) {
    if (record.meta.requiresAuth) {
      result.requiresAuth = true;
    }
    if (record.meta.roles && Array.isArray(record.meta.roles)) {
      result.roles.push(...record.meta.roles);
    }
    if (record.meta.permissions && Array.isArray(record.meta.permissions)) {
      result.permissions.push(...record.meta.permissions);
    }
  }

  result.roles = [...new Set(result.roles)];
  result.permissions = [...new Set(result.permissions)];

  return result;
}

export const setupRouterGuards = (router: Router) => {
  router.beforeEach(
    async (
      to: RouteLocationNormalized,
      _from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      const authStore = useAuthStore();

      if (!authStore.isInitialized) {
        await authStore.initializeAuth();
      }

      const { requiresAuth, roles, permissions } = collectRouteMeta(to);

      if (!requiresAuth) {
        const isSetPassword = to.path === '/auth/set-password' || to.name === 'SetPassword';
        if (authStore.isAuthenticated && to.path.startsWith('/auth') && !isSetPassword) {
          const user = authStore.currentUser;
          return next(user ? getPostAuthRedirect(user as User) : { name: 'Home' });
        }
        return next();
      }

      if (!authStore.isAuthenticated) {
        return next({
          name: 'Login',
          query: { redirect: to.fullPath },
        });
      }

      if (to.name === 'Home' && authStore.currentUser?.role?.toLowerCase() === 'cashier') {
        return next(getPostAuthRedirect(authStore.currentUser as User));
      }

      if (roles.length > 0) {
        const hasRequiredRole = roles.some((role) => authStore.hasRole(role));
        if (!hasRequiredRole) {
          return next({ name: 'Forbidden' });
        }
      }

      if (permissions.length > 0) {
        const hasRequiredPermission = authStore.hasAnyPermission(permissions);
        if (!hasRequiredPermission) {
          return next({ name: 'Forbidden' });
        }
      }

      return next();
    }
  );
};
