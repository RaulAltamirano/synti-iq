export class UserProfileResponseDto {
  id: string;
  email: string;
  fullName: string;
  role: {
    id: number;
    name: string;
  };
  isActive: boolean;
  isApproved: boolean;
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
