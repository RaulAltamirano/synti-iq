import type { SubscriptionStatus } from '../enums/subscription-status.enum';

export class SubscriptionResponseDto {
  id: string;
  customerId: string;
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
  status: SubscriptionStatus;
  trialStart: Date | null;
  trialEnd: Date | null;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  planId: string | null;
  createdAt: Date;
  updatedAt: Date;
}
