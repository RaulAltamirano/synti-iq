---
title: '[TASK] Cashier account creation + invitation email (PR3 → dev)'
labels:
  - enhancement
---

<!-- Created on GitHub: https://github.com/RaulAltamirano/synti-iq/issues/105 — use Closes #105 in the PR body. -->

## Overview

Implement **PR3**: cashier account creation (unassigned and store-scoped), React Email invitation template, mail routing (`resolve-mail-to` + tests), store/cashier DTOs, and Swagger for cashier-profile and account-invitation endpoints. **Target branch for the pull request: `dev`.**

## Scope

- `src/cashier-profile/**` (e.g. unassigned cashier account endpoint)
- Store DTOs: create/filter/remove cashier operations
- `src/mail/**`: constants, `cashier-invitation` template, interfaces, `resolve-mail-to` util + spec
- `src/docs/account-invitation.endpoints.ts`, `src/docs/cashier-profile.endpoints.ts`

## Acceptance criteria

- [ ] Pull request targets **`dev`**.
- [ ] `yarn build`, `yarn lint`, `yarn test`, and `yarn format:check` pass on the PR branch.
- [ ] Invitation mail and sandbox routing behavior covered by tests where specified in implementation.
- [ ] Swagger docs included for the new/changed endpoints.

## Out of scope

- Auth submodule decomposition (PR2).

## Dependency

- **Requires PR2 merged into `dev`** before opening or before merge (rebase PR3 onto latest `dev` after PR2 lands).
