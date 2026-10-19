import type { RouteLocationRaw } from 'vue-router';

import type { User } from '../interfaces/auth.types';

/**
 * Default route after successful login/register or when leaving guest auth routes.
 * Cashiers land on the POS home (panel); other roles use the main app home.
 */
export function getPostAuthRedirect(user: User): RouteLocationRaw {
  if (user.role?.toLowerCase() === 'cashier') {
    return { name: 'cashier-dashboard' };
  }
  return { name: 'Home' };
}
