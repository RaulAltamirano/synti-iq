import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export interface PlanLimits {
  max_stores: number;
  max_products_total: number;
  max_products_per_store: number;
  max_cashiers: number;
  max_sales_per_month: number;
}

export interface PlanFeatures {
  advanced_reports?: boolean;
  api_access?: boolean;
  multi_currency?: boolean;
  custom_branding?: boolean;
  priority_support?: boolean;
}

@Entity('subscription_plans')
export class SubscriptionPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50, unique: true })
  slug: string;

  @Column({ name: 'stripe_price_id', length: 255, nullable: true })
  stripePriceId: string | null;

  @Column({ name: 'price_monthly', type: 'decimal', precision: 10, scale: 2 })
  priceMonthly: number;

  @Column({ type: 'jsonb', default: {} })
  limits: PlanLimits;

  @Column({ type: 'jsonb', default: {} })
  features: PlanFeatures;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
