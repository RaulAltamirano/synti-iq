# Prompt: Code Review Against Project Standards

Use this prompt to review any file or module against all project standards.

---

## Context (Read First)

Before proceeding, read and internalize:

- [AGENTS.md](../../AGENTS.md) — Agent guide, anti-patterns, error handling
- [docs/CONVENTIONS.md](../CONVENTIONS.md) — DTOs, REST, Swagger, pagination, observability, testing
- [DEFINITION_OF_DONE.md](../../DEFINITION_OF_DONE.md) — PR readiness checklist
- [src/_template/](../../src/_template/) — Canonical implementation reference

---

## Task

Review the following file(s) or module against project standards. Report findings in these categories.

### 1. Architecture

- [ ] No business logic in controllers (delegate to services)
- [ ] No direct DB access outside repository layer
- [ ] Services use @InjectRepository or custom repository
- [ ] No services calling other modules' repositories directly
- [ ] Module structure matches _template (dto/, entities/, constants/, etc.)

### 2. TypeScript Quality

- [ ] No `any` in production code (except justified in .spec.ts)
- [ ] Explicit return types on public service methods
- [ ] Use `Record<string, unknown>` for dynamic objects when no concrete type exists
- [ ] DTOs use concrete types, not any

### 3. DTOs & Validation

- [ ] All DTO properties have class-validator decorators
- [ ] Optional fields use @IsOptional()
- [ ] Update DTOs use PartialType from @nestjs/swagger when in Swagger
- [ ] Filter DTOs extend BasePaginationParams when paginated

### 4. Error Handling

- [ ] 404 → NotFoundException
- [ ] 400 → BadRequestException (or ValidationPipe)
- [ ] 403 → ForbiddenException
- [ ] 409 → ConflictException
- [ ] 422 → UnprocessableEntityException
- [ ] No stack traces or sensitive data in responses

### 5. Logging & Observability

- [ ] NestJS Logger used; no console.log/error/warn
- [ ] Critical operations wrapped with withSpan
- [ ] Span constants in constants/<module>-span.constants.ts
- [ ] Metrics service if domain metrics needed

### 6. Testing

- [ ] Unit tests for services with business logic
- [ ] createMockObservabilityService() executes callback
- [ ] Fixtures via create*Fixture(overrides?)
- [ ] Edge cases: null, empty, error paths

### 7. API & Documentation

- [ ] ApiDoc(docs, endpointId) on all controller methods
- [ ] src/docs/<module>.endpoints.ts exists and complete
- [ ] Request/response types declared

### 8. Conventions

- [ ] File naming: kebab-case
- [ ] Class naming: PascalCase
- [ ] Absolute imports for cross-module: `src/`
- [ ] Barrel files in fixtures/, mocks/, constants/

### Output Format

For each finding:

- **PASS** / **FAIL** / **N/A**
- **Location:** file:line or section
- **Detail:** What is wrong or missing
- **Reference:** AGENTS.md / CONVENTIONS.md / DEFINITION_OF_DONE.md

Summarize: X passed, Y failed, Z need attention.
