# Synti-IQ API — Definition of Done

Checklist for PR readiness. All items must be satisfied before a pull request is considered complete.

**References:** [AGENTS.md](AGENTS.md), [docs/CONVENTIONS.md](docs/CONVENTIONS.md), [.eslintrc.js](.eslintrc.js), [docs/QUALITY_METRICS.md](docs/QUALITY_METRICS.md)

---

## Code Quality

| Criterion | Source | Verification |
|-----------|--------|--------------|
| No `any` in production DTOs or services | AGENTS.md, CONVENTIONS.md | ESLint `no-explicit-any` |
| Explicit return types on public service methods | CONVENTIONS.md | Manual review |
| File length ≤ 400 lines (production), ≤ 300 (spec) | .eslintrc.js | ESLint `max-lines` |
| Cyclomatic complexity ≤ 10 | .eslintrc.js | ESLint `complexity` |
| No `console.log`, `console.error`, `console.warn` | AGENTS.md, docs/LOGGING.md | Manual review / grep |
| Error handling follows project pattern | AGENTS.md Error Handling | 404→NotFoundException, 400→BadRequestException, etc. |

---

## Architecture

| Criterion | Source | Verification |
|-----------|--------|--------------|
| No business logic in controllers | AGENTS.md Anti-Patterns | Controllers delegate to services |
| No direct DB access outside repository layer | CONVENTIONS.md Repository Pattern | Services use @InjectRepository or custom repo |
| Module structure matches [src/_template/](src/_template/) | docs/CONVENTIONS.md Project Structure | Same folders: dto/, entities/, constants/, services/, etc. |
| Barrel files present in fixtures/, mocks/, constants/ | docs/CONVENTIONS.md | index.ts exports |

---

## Testing

| Criterion | Source | Verification |
|-----------|--------|--------------|
| Unit tests for all business logic (services, utils) | AGENTS.md Quality Gates, CONVENTIONS.md Testing | `.spec.ts` files exist |
| Correct mocking strategy (ObservabilityService, metrics) | docs/CONVENTIONS.md Observability Tests | `createMockObservabilityService()` executes callback |
| Edge cases covered (null, empty, error paths) | docs/CONVENTIONS.md Testing | Manual review |
| Coverage meets minimum (see QUALITY_METRICS.md) | docs/QUALITY_METRICS.md | `yarn test:cov` |

---

## API & Documentation

| Criterion | Source | Verification |
|-----------|--------|--------------|
| Swagger decorators complete on all endpoints | docs/CONVENTIONS.md Swagger | `ApiDoc(docs, endpointId)` on each route |
| DTOs validated with class-validator | AGENTS.md, CONVENTIONS.md DTO Structure | All properties have decorators |
| Request/response types fully declared | CONVENTIONS.md TypeScript | No implicit any in API layer |

---

## Git & Process

| Criterion | Source | Verification |
|-----------|--------|--------------|
| Conventional commit messages | Plan recommendation | feat/fix/refactor/test/chore prefix |
| PR template filled completely | .github/pull_request_template.md | All sections addressed |
| No unresolved TODO comments | — | grep for TODO/FIXME |
| ADR created if architectural decision was made | docs/adr/000-index.md | Check docs/adr/ for new files |

---

## AI-Assisted Work

| Criterion | Source | Verification |
|-----------|--------|--------------|
| AI-generated code reviewed and understood by author | — | Author confirms understanding |
| Code passes `yarn quality` with zero warnings | AGENTS.md Verification Checklist | `yarn quality` exits 0 |
| _template patterns verified if new module created | AGENTS.md Codebase Awareness | Compare to src/_template/ |

---

## Quick Verification

Before submitting a PR, run:

```bash
yarn quality
```

This runs: `yarn build` → `yarn lint` → `yarn test` → `yarn format:check`
