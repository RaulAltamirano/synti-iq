# Store Creation and Subscription Plans

This document describes the relationship between subscription plans, store creation limits, and business logic.

**Pending implementation:** Plan–BusinessProfile association and max_stores enforcement (see Code References and Planned sections below).

---

## Subscription Plans Entity

Plans are defined in `src/subscription/entities/subscription-plan.entity.ts` with:

- **Plan limits** (JSONB): `max_stores`, `max_products_total`, `max_products_per_store`, `max_cashiers`, `max_sales_per_month`
- **Plan features** (JSONB): `advanced_reports`, `api_access`, `multi_currency`, `custom_branding`, `priority_support`

Seeds for Basic, Professional, and Enterprise plans live in `src/database/seeds/subscription-plans.seed.ts`.

### Stripe Price IDs

The seed reads Stripe Price IDs from environment variables for Basic and Pro plans:

- `STRIPE_PRICE_BASIC` — Stripe Price ID for Basic plan (fallback: `price_xxx` in dev)
- `STRIPE_PRICE_PRO` — Stripe Price ID for Professional plan (fallback: `price_yyy` in dev)

Set these in staging/production. See `.env.example` for documentation.

## Store Entity

Stores belong to a `BusinessProfile` and are defined in `src/store/entities/store.entity.ts`. Each store has:

- Location (optional)
- Schedules (StoreSchedule)
- Inventories, sales, cashiers, payment methods

## Plan–BusinessProfile Association (Planned)

**Current state**: `BusinessProfile` does not yet have a `subscriptionPlanId` column. Plans exist independently.

**Planned flow**:

1. Add `subscriptionPlanId` (nullable UUID, FK to `subscription_plans`) to `BusinessProfile`.
2. On business registration: assign default plan (e.g. Basic) via `subscriptionPlanId`.
3. Upgrade/downgrade: update `subscriptionPlanId` when the business changes plans (e.g. via Stripe webhook or admin).

## max_stores Enforcement (Planned)

**Current state**: `store.service.ts` does not validate `max_stores` when creating a store.

**Planned validation**:

1. On `StoreService.create()`: resolve the caller's `BusinessProfile` and its `subscriptionPlanId`.
2. Load the `SubscriptionPlan` and read `limits.max_stores` (use `-1` as unlimited).
3. Count existing stores for that `BusinessProfile`.
4. If `count >= max_stores` and `max_stores !== -1`, throw `ForbiddenException` or `UnprocessableEntityException`.

## Code References

- `src/subscription/` — Subscription plan entities and module
- `src/store/store.service.ts` — Store creation logic
- `src/business-profile/` — Business profile
