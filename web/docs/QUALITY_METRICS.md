# Synti-IQ Web — Quality Metrics

Target metrics for documentation, code quality, and automation alignment.

---

## Documentation System Score

- **Target:** 95/100 (based on Frontend Documentation Harmony Audit dimensions)
- **Dimensions:** Internal Consistency, Cross-File Harmony, Coverage, AI Readability, Automation Alignment, Lean & Non-Redundant

---

## Code Quality

| Metric | Target | Notes |
|--------|--------|------|
| `any` in production code | 0 | ESLint enforces `@typescript-eslint/no-explicit-any` as error |
| Coverage (new composables/stores) | 80% | Aim; no enforced minimum yet |
| TypeScript `strict` | true | `tsconfig.app.json` (strict: true) |
| Lint | 0 errors | `yarn lint` must pass |

---

## Verification Pipeline

All must pass before PR:

- `yarn build`
- `yarn lint`
- `yarn type-check`
- `yarn format:check`
- `yarn test`
- `yarn build-storybook`

Single command: `yarn quality` or `yarn pre-pr`

---

## References

- [AGENTS.md](../AGENTS.md) — Verification checklist, quality gates
- [docs/FRONTEND_CONVENTIONS.md](FRONTEND_CONVENTIONS.md) — Conventions
- [docs/PLAN_TEMPLATE_QUALITY.md](PLAN_TEMPLATE_QUALITY.md) — Quality plan template
