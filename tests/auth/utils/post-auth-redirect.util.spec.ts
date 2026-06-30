import { describe, expect, it } from 'vitest';

import { getPostAuthRedirect } from '@/modules/auth/utils/post-auth-redirect.util';

describe('getPostAuthRedirect', () => {
  it('returns cashier-dashboard for cashier role', () => {
    expect(
      getPostAuthRedirect({
        id: '1',
        email: 'c@example.com',
        role: 'cashier',
      })
    ).toEqual({ name: 'cashier-dashboard' });
  });

  it('treats role case-insensitively', () => {
    expect(
      getPostAuthRedirect({
        id: '1',
        email: 'c@example.com',
        role: 'CASHIER',
      })
    ).toEqual({ name: 'cashier-dashboard' });
  });

  it('returns Home for business_owner', () => {
    expect(
      getPostAuthRedirect({
        id: '1',
        email: 'o@example.com',
        role: 'business_owner',
      })
    ).toEqual({ name: 'Home' });
  });

  it('returns Home when role is missing', () => {
    expect(
      getPostAuthRedirect({
        id: '1',
        email: 'u@example.com',
      })
    ).toEqual({ name: 'Home' });
  });
});
