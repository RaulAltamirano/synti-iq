import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SubscriptionPlan,
  PlanLimits,
  PlanFeatures,
} from 'src/subscription/entities/subscription-plan.entity';

interface PlanSeedConfig {
  name: string;
  slug: string;
  stripePriceId: string | null;
  priceMonthly: number;
  limits: PlanLimits;
  features: PlanFeatures;
}

@Injectable()
export class SubscriptionPlansSeed {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private readonly planRepository: Repository<SubscriptionPlan>,
  ) {}

  private getPlansConfig(): PlanSeedConfig[] {
    return [
      {
        name: 'Basic',
        slug: 'basic',
        stripePriceId: 'price_xxx',
        priceMonthly: 29.99,
        limits: {
          max_stores: 1,
          max_products_total: 1000,
          max_products_per_store: 1000,
          max_cashiers: 3,
          max_sales_per_month: -1,
        },
        features: {
          advanced_reports: false,
          api_access: false,
          multi_currency: false,
        },
      },
      {
        name: 'Professional',
        slug: 'pro',
        stripePriceId: 'price_yyy',
        priceMonthly: 79.99,
        limits: {
          max_stores: 3,
          max_products_total: 10000,
          max_products_per_store: 5000,
          max_cashiers: 15,
          max_sales_per_month: -1,
        },
        features: {
          advanced_reports: true,
          api_access: true,
          multi_currency: false,
        },
      },
      {
        name: 'Enterprise',
        slug: 'enterprise',
        stripePriceId: null,
        priceMonthly: 199.99,
        limits: {
          max_stores: -1,
          max_products_total: -1,
          max_products_per_store: -1,
          max_cashiers: -1,
          max_sales_per_month: -1,
        },
        features: {
          advanced_reports: true,
          api_access: true,
          multi_currency: true,
          custom_branding: true,
          priority_support: true,
        },
      },
    ];
  }

  async seed(): Promise<void> {
    const plansConfig = this.getPlansConfig();
    let errorCount = 0;

    for (const config of plansConfig) {
      try {
        let plan = await this.planRepository.findOne({
          where: { slug: config.slug },
        });

        if (!plan) {
          plan = this.planRepository.create({
            name: config.name,
            slug: config.slug,
            stripePriceId: config.stripePriceId,
            priceMonthly: config.priceMonthly,
            limits: config.limits,
            features: config.features,
          });
        } else {
          plan.name = config.name;
          plan.stripePriceId = config.stripePriceId;
          plan.priceMonthly = config.priceMonthly;
          plan.limits = config.limits;
          plan.features = config.features;
        }

        await this.planRepository.save(plan);
      } catch {
        errorCount++;
      }
    }

    if (errorCount > 0) {
      throw new Error(`Failed to seed ${errorCount} plan(s)`);
    }
  }

  async validate(): Promise<{ valid: boolean; missing: string[] }> {
    const expectedSlugs = this.getPlansConfig().map(p => p.slug);
    const existing = await this.planRepository.find({
      select: ['slug'],
    });
    const existingSlugs = existing.map(p => p.slug);
    const missing = expectedSlugs.filter(slug => !existingSlugs.includes(slug));

    return {
      valid: missing.length === 0,
      missing,
    };
  }
}
