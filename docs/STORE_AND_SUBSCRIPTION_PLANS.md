# Store Creation and Subscription Plans

This document describes the relationship between subscription plans, store creation limits, and business logic.

## Subscription Plans Entity

Plans are defined in `src/subscription/entities/subscription-plan.entity.ts` with:

- **Plan limits** (JSONB): `max_stores`, `max_products_total`, `max_products_per_store`, `max_cashiers`, `max_sales_per_month`
- **Plan features** (JSONB): `advanced_reports`, `api_access`, `multi_currency`, `custom_branding`, `priority_support`

Seeds for Basic, Professional, and Enterprise plans live in `src/database/seeds/subscription-plans.seed.ts`.

## Store Entity

Stores belong to a `BusinessProfile` and are defined in `src/store/entities/store.entity.ts`. Each store has:

- Location (optional)
- Schedules (StoreSchedule)
- Inventories, sales, cashiers, payment methods

## Implementation Status

- **TODO**: Document full business subscription flow and enforcement of `max_stores` limits at store creation time.
- **TODO**: Document how plans are associated with BusinessProfile and how limits are validated.

For code references, see:

- `src/subscription/` — Subscription plan entities and module
- `src/store/store.service.ts` — Store creation logic
- `src/business-profile/` — Business profile and plan association
