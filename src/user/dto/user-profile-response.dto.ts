export class UserProfileResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: {
    id: number;
    name: string;
  };
  isActive: boolean;
  isApproved: boolean;
  approvedAt?: Date | null;
  approvedBy?: string | null;
  isOnline: boolean;
  createdAt: Date;
  lastLogin?: Date;
  lastActivityAt?: Date;
  profile?: {
    id: string;
    profileType: string;
    profileId?: string;
    metadata?: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
  };
}
