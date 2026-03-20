import { PlanFeatures, PlanLimits } from '../entities/subscription-plan.entity';

export class SubscriptionPlanResponseDto {
  id: string;
  name: string;
  slug: string;
  stripePriceId: string | null;
  priceMonthly: number;
  limits: PlanLimits;
  features: PlanFeatures;
  createdAt: Date;
  updatedAt: Date;
}
