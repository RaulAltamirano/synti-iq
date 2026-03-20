# Synti-IQ API — Quality Metrics

Thresholds, measurement commands, and review triggers for code quality.

**References:** [AGENTS.md](../AGENTS.md), [DEFINITION_OF_DONE.md](../DEFINITION_OF_DONE.md), [.eslintrc.js](../.eslintrc.js)

---

## Thresholds Table

| Metric | Minimum | Target | Measurement |
|--------|---------|--------|-------------|
| Test coverage (statements) | 70% | 80% | `yarn test:cov` |
| `any` in production code | 0 | 0 | ESLint, manual review |
| ESLint errors | 0 | 0 | `yarn lint` |
| ESLint warnings | 0 | 0 | `yarn lint` (target: upgrade key rules to error) |
| File length (production) | ≤ 400 | ≤ 300 | ESLint `max-lines` |
| File length (spec) | ≤ 300 | ≤ 200 | ESLint `max-lines` override |
| Cyclomatic complexity | ≤ 10 | ≤ 8 | ESLint `complexity` |
| Build time | — | < 60s | `yarn build` |
| Test run time | — | < 120s | `yarn test` |

---

## Measurement Commands

| Command | Purpose |
|---------|---------|
| `yarn build` | TypeScript compilation; fails on type errors |
| `yarn lint` | ESLint; reports errors and warnings |
| `yarn lint:check` | ESLint without --fix |
| `yarn test` | Jest unit tests |
| `yarn test:cov` | Jest with coverage report (coverage/ folder) |
| `yarn format:check` | Prettier; fails if files need formatting |
| `yarn quality` | build + lint + test + format:check |

---

## Quality Review Triggers

A quality review is triggered when:

1. **CI fails** — build, lint, or test fails
2. **Coverage drops** — below minimum threshold for new/modified code
3. **ESLint warnings increase** — new warnings introduced in a PR
4. **File exceeds limits** — new file > 400 lines or complexity > 10
5. **Manual request** — reviewer flags quality concerns

---

## Quarterly Review Process

1. **Run metrics** — `yarn test:cov`, `yarn lint`, collect build/test times
2. **Compare to thresholds** — Identify regressions or improvements
3. **Adjust thresholds** — Update this document if team agrees to change
4. **Update ESLint** — Consider upgrading warn → error for key rules
5. **Document** — Note changes in team docs or ADR

---

## Coverage Configuration

Jest coverage is configured in `package.json` under `jest.collectCoverageFrom`:

- Pattern: `**/*.(t|j)s` (excludes .spec.ts by default in many setups)
- Output: `coverage/` directory
- View: Open `coverage/lcov-report/index.html` after `yarn test:cov`

---

## References

- [AGENTS.md](../AGENTS.md) — Verification checklist
- [DEFINITION_OF_DONE.md](../DEFINITION_OF_DONE.md) — PR readiness
- [.eslintrc.js](../.eslintrc.js) — Lint rules
