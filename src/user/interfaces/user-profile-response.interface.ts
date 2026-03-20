/**
 * Response shape for GET /user/me (getMyProfile).
 */
export interface UserProfileResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string | undefined;
  isActive: boolean;
  isApproved: boolean;
  approvedAt?: Date | null;
  approvedBy?: string | null;
  isOnline: boolean;
  createdAt: Date;
  lastLogin?: Date;
  lastActivityAt?: Date;
  profile: {
    id: string;
    profileType: string;
    profileId?: string;
    metadata?: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
  } | null;
}
