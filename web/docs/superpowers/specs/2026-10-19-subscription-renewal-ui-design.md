# Subscription renewal UI — design

**Date:** 2026-10-19  
**Route:** `/profile/subscription/renew` (and subscribe twin if shared)  
**Status:** Approved in conversation (2-step wizard + Stripe CTA placeholder)

## Problem

The renewal/hire flow is a 3-step wizard (Plan → Address → Payment) with ad-hoc purple/gradient styling, duplicated stepper markup, and a payment step that shows billing address + fake card fields. Address is not needed; Stripe Checkout will own payment capture later. UI should match the existing SyntiIQ design system (`@/modules/ui`).

## Goals

- Two-step flow: **1. Select plan → 2. Review + continue to Stripe**
- Remove address collection from the wizard entirely
- Payment step: order summary + security/redirect copy + primary CTA (no card form)
- Restyle page with design-system primitives (`Stepper`, `Button`, `Card`/`Section`, `InfoBanner`, `Badge`)
- Stripe integration remains a stub (toast/alert or disabled-ready handler); no Stripe SDK in this change

## Non-goals

- Real Stripe Checkout / Payment Element wiring
- Backend billing API changes
- Redesigning `SubscriptionRenewalModal` unless still used by the route (page is the source of truth for `/subscription/renew`)
- Changing plan catalog/pricing data source (keep current mock plans unless already API-backed)

## Flow

```text
[Profile] → /profile/subscription/renew
  Step 1: PlanSelectionStep  →  Next (requires selected plan)
  Step 2: PaymentStep        →  “Continuar a Stripe” (stub) | Back | Cancel → Profile
```

Stepper labels: **Plan** | **Pago**.

## UI structure

### Page shell (`SubscriptionRenewal.vue`)

- Back control + title (renew vs hire from route, as today)
- Optional `InfoBanner` for first-time hire copy (replace inline blue box)
- `Stepper` with `v-model` / `modelValue` bound to `currentStep` (read-only navigation preferred: do not allow clicking ahead without validation; back via footer is enough)
- Content panel for active step
- Footer: Cancel (`Button` secondary/outline), Anterior (if step > 1), Siguiente or Continuar a Stripe (`Button` primary)

### Step 1 — Plan selection

- Keep three plan cards; restyle with DS tokens (`primary`, `success`, borders from gray scale) — no bespoke purple gradients
- Selected state: `border-primary` + check affordance; popular plan uses `Badge`
- Emit/update `selectedPlan` as today

### Step 2 — Payment (placeholder)

- `Card` (or `Section`) with order summary: plan name, period, price, total
- `InfoBanner` (info): user will be redirected to Stripe’s secure checkout; card data is not entered here
- Primary CTA in footer (and optional duplicate in step): “Continuar a Stripe”
- Handler: stub only (e.g. existing alert or `Toast` if already wired) — **do not** capture card data
- Remove address summary block and card-field placeholders

## State (`useSubscriptionWizard`)

- `currentStep`: `1 | 2` only
- Keep `selectedPlan`
- Remove `addressData`, `AddressData`, `isStep2Valid` address rules
- `canProceed`: step 1 → plan selected; step 2 → always true (stub)
- `nextStep` / `previousStep` / `resetWizard` updated for max step 2
- Delete or stop importing `AddressFormStep.vue` from page (and modal if touched)

## Design system mapping

| Need | Component |
| --- | --- |
| Progress | `Stepper` |
| Actions | `Button` |
| Summary / plan cards container | `Card` and/or semantic surfaces with token classes |
| Callouts | `InfoBanner` |
| Popular tag | `Badge` |

Import from `@/modules/ui` (or `@/modules/ui/components` per barrel). Prefer semantic tokens (`primary`, `gray-*`, `success`) over hard-coded purple utilities.

## Accessibility

- Stepper already exposes progressbar semantics — keep labels in Spanish
- CTA disabled when no plan on step 1
- Focus order: header back → step content → footer actions

## Testing / verification

- Manual: open renew route, select plan, advance, see summary without address, stub CTA
- `yarn --cwd web lint` / type-check on touched files as practical
- No Storybook required unless extracting a new shared UI primitive (prefer not)

## Success criteria

- [ ] Address step gone from page + wizard composable
- [ ] Exactly two stepper steps
- [ ] Payment UI is summary + Stripe redirect messaging + CTA stub
- [ ] Page uses DS components/tokens; no purple gradient CTAs
- [ ] No Stripe SDK / no real checkout redirect in this change
