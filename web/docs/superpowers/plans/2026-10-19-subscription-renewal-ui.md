# Subscription renewal UI — implementation plan

> Spec: `docs/superpowers/specs/2026-10-19-subscription-renewal-ui-design.md`

**Goal:** 2-step renew/hire flow (Plan → Pago), no address, DS components, Stripe CTA stub.

## Files

| File | Action |
| --- | --- |
| `src/modules/profile/composables/useSubscriptionWizard.ts` | 2 steps; drop address |
| `src/modules/profile/page/SubscriptionRenewal/SubscriptionRenewal.vue` | Stepper + Button + InfoBanner |
| `src/modules/profile/components/SubscriptionRenewalModal/PlanSelectionStep.vue` | DS tokens + Badge |
| `src/modules/profile/components/SubscriptionRenewalModal/PaymentStep.vue` | Summary + InfoBanner only |
| `src/modules/profile/components/SubscriptionRenewalModal/AddressFormStep.vue` | Delete |
| `src/modules/profile/components/SubscriptionRenewalModal/SubscriptionRenewalModal.vue` | Align to 2 steps |

## Tasks

- [x] Task 1: Wizard composable → max step 2, remove address
- [x] Task 2: PlanSelectionStep DS restyle
- [x] Task 3: PaymentStep summary + Stripe banner
- [x] Task 4: Page + modal shell with Stepper/Button
- [x] Task 5: Delete AddressFormStep; smoke in browser

## Verify

`yarn --cwd web lint` on touched paths; open `/profile/subscription/renew`.
