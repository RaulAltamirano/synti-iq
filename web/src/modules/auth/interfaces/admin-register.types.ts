export interface AdminRegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  businessName: string;
  referralCode?: string;
}

export interface ReferralValidationResponse {
  isValid: boolean;
  referrerName?: string;
  referrerEmail?: string;
  benefits?: ReferralBenefits;
  errorMessage?: string;
}

export interface ReferralBenefits {
  trialDays?: number;
  discountPercentage?: number;
  description?: string;
}

export interface AdminInvitation {
  code: string;
  expiresAt?: Date;
  status: InvitationStatus;
  invitedEmail?: string;
  createdAt: Date;
}

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'cancelled';

export interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  pendingReferrals: number;
  totalBenefitsEarned?: ReferralBenefits;
}

export interface ReferralRecord {
  userId: string;
  firstName: string;
  lastName: string;
  email?: string;
  registeredAt: Date;
  status: 'active' | 'inactive';
}

export interface MyReferralsResponse {
  referrals: ReferralRecord[];
  totalCount: number;
  stats: ReferralStats;
}

export interface MyReferralCodeResponse {
  code: string;
  createdAt: Date;
  totalUsageCount: number;
}
