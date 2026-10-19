---
title: '[TASK] Auth module decomposition + Password module (PR2 → dev)'
labels:
  - enhancement
---

<!-- Created on GitHub: https://github.com/RaulAltamirano/synti-iq/issues/104 — use Closes #104 in the PR body. -->

## Overview

Implement **PR2**: split `AuthModule` into `session`, `two-factor`, and `account-invitation` sub-modules; extract `PasswordService` to `src/password/`; add `UserRegistrationService`, tests, and Swagger specs for session and 2FA. **Target branch for the pull request: `dev`.**

## Scope

- Sub-modules with controller/service/module/spec: `auth/session/`, `auth/two-factor/`, `auth/account-invitation/`
- `src/password/**` (hashing, pepper, lockout strategies)
- `AccountInvitation` entity, auth cache constants, token-usage metadata interface
- Specs under `src/auth/__tests__/mocks/` and service specs listed in the internal MR plan
- `src/docs/session.endpoints.ts`, `src/docs/two-factor.endpoints.ts`
- `ProfileCreationContext` + `profile-creation.strategy.spec.ts`

**Note:** `src/auth/session/session.service.ts` may already exist on `dev`; include it in the PR only if this branch modifies it.

## Acceptance criteria

- [ ] Pull request targets **`dev`** (not `master`).
- [ ] `yarn build`, `yarn lint`, `yarn test`, and `yarn format:check` pass on the PR branch.
- [ ] Swagger updated for new/changed session and 2FA HTTP surface.
- [ ] No `any` in production code; service methods have explicit return types where required by project rules.

## Out of scope

- Cashier invitation endpoints, store cashier DTOs, mail template (PR3).

## Dependency

- **Must merge before PR3** (cashier flow depends on `AccountInvitationService` and related auth pieces).
