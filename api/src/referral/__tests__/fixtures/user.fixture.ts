/**
 * Fixtures de usuario y perfil para tests de referral.
 */
import { SystemRole } from 'src/shared/enums/roles.enum';

export interface UserFixtureOverrides {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export function createUserFixture(overrides: UserFixtureOverrides = {}): {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
} {
  return {
    id: 'user-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    ...overrides,
  };
}

export interface UserProfileFixtureOverrides {
  userId?: string;
  profileType?: SystemRole;
  profileId?: string | null;
}

export function createUserProfileFixture(overrides: UserProfileFixtureOverrides = {}): {
  userId: string;
  profileType: SystemRole;
  profileId: string | null;
} {
  return {
    userId: 'user-123',
    profileType: SystemRole.BUSINESS_OWNER,
    profileId: 'bp-id',
    ...overrides,
  };
}
