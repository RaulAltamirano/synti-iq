TITLE: [TASK] MR1 — Decompose StoreService into focused sub-services (merge to master)
LABELS: refactor, documentation

---

## Overview

Track the first merge request in the [MR organization plan](../superpowers/plans/2026-04-09-mr-organization.md): refactor the store module by splitting `StoreService` into `StoreQueryService`, `StoreMutationService`, and `StoreCashierService`, with `StoreService` as a thin facade; remove dead cashier-schedule assignment code; apply related fixes (cache TTL, TypeORM `In()`, Sale module registration, docs).

## Scope (from plan)

- **Target branch for merge:** `master`
- **Delivery branch:** `refactor/mr1-store-service-decomposition` (or `dev` if aligned with team workflow)
- **Core commit range (store refactor batch):** `209c23e` → `9094b5a` (see plan table for messages)

## Acceptance criteria

- [ ] Pull request opened toward `master` with title aligned to conventional commits (e.g. `refactor(store): decompose StoreService into focused sub-services`).
- [ ] CI passes: `yarn build`, `yarn lint`, `yarn test`, `yarn format:check`.
- [ ] Reviewers can verify facade delegation and that cashier/store DTO boundaries remain coherent.

## Technical context

- **Affected paths:** `src/store/**`, `src/sale/sale.module.ts`, `AGENTS.md`, `CONVENTIONS.md`, `.gitignore` (per plan).
- **Note:** Current `dev` may include additional commits after the store batch (e.g. session/auth cleanup). If the team needs an MR that contains **only** the store decomposition, create a branch from `master` and cherry-pick the plan’s commit list instead of merging all of `dev`.

## Out of scope

- Auth sub-module extraction (MR2), cashier invitation feature (MR3), tooling/docs-only MR4 — see the organization plan.

## Resources

- [MR organization plan](../superpowers/plans/2026-04-09-mr-organization.md)
- GitHub issue: https://github.com/RaulAltamirano/synti-iq/issues/103
- Pull request: https://github.com/RaulAltamirano/synti-iq/pull/102
