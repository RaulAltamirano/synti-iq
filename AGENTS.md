# Synti-IQ API — Agent & Developer Guide

Technical conventions and architectural context for AI coding agents (Cursor, Windsurf, Graviti) and developers.

---

## Agent Role

Act as a **Staff Software Engineer and Technical Architect** specialized in TypeScript and Nest.js. Plan before coding: research the codebase, identify dependencies, and define a clear implementation approach before writing code.

---

## Codebase Awareness

Before generating or modifying code in a module:

1. Read existing files in that module (service, controller, DTOs, entities).
2. For new modules similar to an existing one, use the reference module as template. **When is a module "similar"?** Use the canonical template if the new module has: pagination, filtered queries, observability spans, or multiple services. For simple CRUD without these, use `user-session` as a lighter reference.
3. Canonical reference: [src/\_template/](../src/_template/) — template module with observability, pagination, DTOs, metrics, tests, endpoint docs. The template is not registered in `AppModule`; it exists solely as a reference for copying.

**Required reads before modifying a module:**

- Changing controller → read: controller, service, DTOs used by affected endpoints
- Changing service → read: service, entities, repositories, DTOs
- Adding endpoint → read: controller, service, `src/docs/<module>.endpoints.ts`, existing DTOs
- New module → read: [src/\_template/](src/_template/) (canonical template) + [docs/CONVENTIONS.md](docs/CONVENTIONS.md) Project Structure

---

## Executable Commands (Run First)

| Command                 | Purpose                                                                          |
| ----------------------- | -------------------------------------------------------------------------------- |
| `yarn build`            | Verify compilation after changes                                                 |
| `yarn lint`             | Lint and auto-fix; run before commit                                             |
| `yarn test`             | Run unit tests                                                                   |
| `yarn format:check`     | Verify Prettier formatting                                                       |
| `yarn validate:commits` | Validate commits (CI)                                                            |
| `npm version patch`     | Manual release fallback — see [docs/RELEASE_PROCESS.md](docs/RELEASE_PROCESS.md) |

---

## Verification Checklist

After completing any task, run in order: `yarn build`, `yarn lint`, `yarn test`, `yarn format:check`. Do not consider a task complete until all pass.

---

## Quality Gates

- **Build**: Must compile with `yarn build` (no TypeScript errors)
- **Lint**: Must pass `yarn lint` (no ESLint errors)
- **Format**: Must pass `yarn format:check` (Prettier)
- **Tests**: Must pass `yarn test`; new service logic must have corresponding `.spec.ts`
- **Coverage**: Minimum 70% threshold for statements, branches, functions, and lines (`yarn test:cov`)

---

## Canonical Contracts

| Contract               | Path                                                              | Purpose                                                                   |
| ---------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `PaginatedResponse<T>` | `src/pagination/interfaces/PaginatedResponse.ts`                  | Paginated response shape                                                  |
| `PaginatedResponseDto` | `src/pagination/dtos/paginated-response.dto.ts`                   | OpenAPI schema for paginated responses                                    |
| `BasePaginationParams` | `src/pagination/dtos/base-pagination-params.ts`                   | Pagination query params                                                   |
| `EndpointDocSpec`      | `src/shared/decorators/interfaces/endpoint-doc-spec.interface.ts` | Swagger endpoint spec                                                     |
| `ApiDoc` decorator     | `src/shared/decorators/api-doc.decorator.ts`                      | Apply specs to controller methods                                         |
| Logging conventions    | [docs/LOGGING.md](docs/LOGGING.md)                                | NestJS Logger + Pino; reference module: [src/\_template/](src/_template/) |

---

## Three-Tier Boundaries

### Always

- Use **absolute imports** with `src/` prefix between modules: `import { X } from 'src/module/...'`
- Use **strict typing**: no `any` in production; explicit return types on public service methods (controllers may infer; repositories and utilities should also declare return types); use `Record<string, unknown>` for dynamic objects when no concrete type exists. Ensure `strict: true` in tsconfig.
- Use **class-validator** decorators on all DTOs (`@Body()`, `@Query()`, `@Param()`)
- Use **NestJS Logger**; never `console.log`, `console.error`, or `console.warn`
- Follow **file naming**: kebab-case (e.g. `create-store.dto.ts`)
- Follow **class naming**: PascalCase (e.g. `CreateStoreDto`)

### Ask First

- Database schema changes, new tables, or migrations
- New npm packages or breaking API changes — confirm with the user before adding dependencies
- Unclear business rules or domain logic
- Circular dependency resolutions (prefer structural refactors over `forwardRef`)
- Changes to `BasePaginationParams` or `PaginatedResponse` (affect multiple modules)
- Changes to subscription plans or store limits — see [docs/STORE_AND_SUBSCRIPTION_PLANS.md](docs/STORE_AND_SUBSCRIPTION_PLANS.md)

### Never

- Assume relationships, table names, or entity structures without verification
- Invent variable names or implementations; when unsure, search the codebase for existing usage (grep for `findBy`, `create*`, or similar patterns in `src/`) or ask. Prefer inferring from similar modules (e.g. \_template, user-session).
- Use `any` in DTOs or services without explicit justification
- Expose stack traces or sensitive data in production responses
- Modify canonical contract paths without updating AGENTS.md and docs/CONVENTIONS.md
- Use transactions for read-only or single-entity writes (unnecessary overhead; CONVENTIONS defines when transactions are required)

### Anti-Patterns (Do Not)

- Controllers with business logic (delegate to services)
- Services calling other services' repositories directly (use exported services)
- DTOs without class-validator decorators on every property (use `@IsOptional()` for optional fields; required fields need at least one constraint decorator)
- `any` without explicit `// eslint-disable-next-line` and justification
- `forwardRef()` without first trying structural refactor

---

## Tech Stack

| Component  | Version / Details                  |
| ---------- | ---------------------------------- |
| Framework  | NestJS v11                         |
| Language   | TypeScript 5.7+                    |
| ORM        | TypeORM 0.3.x                      |
| Database   | PostgreSQL (PostGIS)               |
| Cache      | Redis (ioredis)                    |
| Validation | class-validator, class-transformer |
| API Docs   | Swagger/OpenAPI (@nestjs/swagger)  |
| Auth       | JWT RS256, Passport                |
| Email      | Resend + React Email               |
| Tracing    | OpenTelemetry (OTLP)               |
| Logging    | nestjs-pino (structured)           |
| Testing    | Jest, Supertest                    |

**ValidationPipe** (global): `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`

**Throttler**: Global `ThrottlerGuard` in `src/core/app.module.ts` — `ttl: 60`, `limit: 10`

---

## Error Handling

- Use Nest HTTP exceptions: `NotFoundException`, `BadRequestException`, `ForbiddenException`, `ConflictException`, `UnprocessableEntityException`
- **404**: Resource not found → `NotFoundException`
- **400**: Invalid input (validation handles most) → `BadRequestException`
- **403**: Forbidden (auth passed, permission denied) → `ForbiddenException`
- **409**: Duplicate/conflict → `ConflictException`
- **422**: Semantic validation failed → `UnprocessableEntityException`
- Never expose stack traces or sensitive data in responses. Log internally with `Logger`.

---

## Project Structure

Full structure including `repositories/`, `factories/`, and `constants/`: see [docs/CONVENTIONS.md](docs/CONVENTIONS.md) — Project Structure.

---

## Naming Conventions

| Element           | Convention           | Example                                     |
| ----------------- | -------------------- | ------------------------------------------- |
| Modules & folders | kebab-case           | `store-schedule`, `user-session`            |
| DTO files         | kebab-case.dto.ts    | `create-store.dto.ts`, `filter-user.dto.ts` |
| DTO classes       | PascalCase + Dto     | `CreateStoreDto`, `FilterUserDto`           |
| DTO folder        | singular             | `dto/` (not `dtos/`)                        |
| Entity files      | kebab-case.entity.ts | `referral-code.entity.ts`                   |
| Entity classes    | PascalCase           | `ReferralCode`, `StoreSchedule`             |
| DB tables         | snake_case           | `@Entity('referral_codes')`                 |
| Enum files        | kebab-case.enum.ts   | `assignment-status.enum.ts`                 |

Note: Some legacy entities use snake_case file names; new modules must use kebab-case.

---

## Creation Order (New Modules)

1. Interfaces / types
2. DTOs (with class-validator)
3. Entities (TypeORM with `@Entity()`)
4. Repositories (if custom; else skip)
5. Factories (if entity construction is complex; else skip)
6. Services (business logic, `@Injectable()`)
7. Controllers (endpoints, `@Controller()`)
8. Module registration (imports, providers)

---

## Pagination, Observability, Testing

See [docs/CONVENTIONS.md](docs/CONVENTIONS.md) for full specs:

- **Pagination**: `BasePaginationParams`, `PaginatedResponse<T>`, filter DTOs
- **Observability**: `withSpan` signature, span constants, metrics, test mocks
- **Testing**: `__tests__/` structure, fixtures, mocks, coverage

---

## Reference Implementations

| Pattern                                                               | Path                                                                                                                        | Use When                                                                        |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Canonical template (observability, pagination, tests)                 | [src/\_template/](../src/_template/)                                                                                        | New feature modules                                                             |
| Custom repository                                                     | [src/user-session/user-session.repository.ts](../src/user-session/user-session.repository.ts)                               | Complex queries                                                                 |
| Repository interface                                                  | [src/inventory/interfaces/inventory-repository.interface.ts](../src/inventory/interfaces/inventory-repository.interface.ts) | Contract injection                                                              |
| Span constants                                                        | [src/\_template/constants/template-span.constants.ts](../src/_template/constants/template-span.constants.ts)                | Observability                                                                   |
| Error handling                                                        | [src/store/services/store-mutation.service.ts](../src/store/services/store-mutation.service.ts)                             | NotFoundException, validation patterns                                          |
| Facade + sub-services                                                 | [src/store/store.service.ts](../src/store/store.service.ts) + [src/store/services/](../src/store/services/)                 | Service has multiple responsibilities or exceeds ~250 lines                     |
| Module structure (imports, exports, providers)                        | [src/\_template/template.module.ts](../src/_template/template.module.ts)                                                    | Registering modules with multiple providers, exports                            |
| Domain sub-modules (nested `*Module` under one folder)                | [src/auth/auth.module.ts](../src/auth/auth.module.ts) + [docs/CONVENTIONS.md](docs/CONVENTIONS.md) — _Domain sub-modules_   | Multiple route prefixes in one bounded context; avoid sibling `*Module` imports |
| Auth domain (facade, sub-modules, internal services, shared password) | [src/auth/](../src/auth/) + [src/password/](../src/password/)                                                               | JWT/session/2FA/registration patterns; where to put new auth-related code       |

---

## Auth domain (`src/auth`) — layout and quality bar

Use this tree as the **reference** for how authentication is structured in this API. When adding auth-related behavior, pick the **smallest** structure that fits.

### Where code lives

| Location                               | Purpose                                                                                                                                                                                                                                                                                              |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/password/`                        | **Shared** `PasswordModule` (hashing, lockout strategies). Used by auth, user creation, seeds, invitations — **not** nested under `auth/`.                                                                                                                                                           |
| `src/auth/*.module.ts` (root)          | `AuthModule`: registers `AuthController`, internal `providers`, and **imports** feature sub-modules.                                                                                                                                                                                                 |
| `src/auth/<feature>/`                  | **Feature sub-module** with its own `*Module` (and often `*Controller`): e.g. `two-factor/`, `session/`, `account-invitation/`. Use when the feature has **its own HTTP surface** or a **clear DI boundary** to export.                                                                              |
| `src/auth/services/*.service.ts`       | **Internal collaborators** used only as `AuthModule` providers (no dedicated route prefix): e.g. `UserRegistrationService`, `AuthSessionManager`, `AuthMetadataService`. **Flat files** are OK; promote to a subfolder + `*Module` only when the feature grows routes or must be imported elsewhere. |
| `src/auth/dto/`, `src/auth/guards/`, … | Shared auth DTOs, guards, strategies, factory — as today.                                                                                                                                                                                                                                            |

### NestJS practices (non-negotiables here)

- **Controllers**: business logic stays in services; **no** `@InjectRepository` in controllers.
- **Session concerns**: prefer `SessionService` (auth session command API) over calling `UserSessionService` directly from `AuthService` when validating ownership / last-used semantics.
- **Guards / user id**: align with the rest of the API — `@Auth(...)` and `@GetUser('sub')` (JWT `sub`), not ad-hoc guard stacks unless documented.
- **Transactions**: multi-step writes use a single transaction; **post-commit** work (sessions, outbound email) runs **after** commit (see `UserRegistrationService`).
- **Observability**: sub-modules that use `ObservabilityService` must **import** `ObservabilityModule` in their `*Module`.

### Documentation and API surface

- New auth HTTP endpoints: add specs in `src/docs/<area>.endpoints.ts` and wire with `@ApiDoc`; update Postman via `yarn postman:build` when collections change.

---

## When Unsure

1. **Entity/table name?** — Check existing entities in `src/*/entities/` or ask
2. **Which DTO type?** — Create vs Update vs Filter: see [docs/CONVENTIONS.md](docs/CONVENTIONS.md) DTO Types table
3. **Guard/Pipe needed?** — Check existing in `src/**/*.guard.ts`, `src/**/*.pipe.ts`
4. **Transactions needed?** — Multiple related writes in one request → use `dataSource.transaction()`. See CONVENTIONS > Repository Pattern > Transactions.

### Choosing Between Valid Approaches

1. **Custom repo vs @InjectRepository?** → Simple CRUD: @InjectRepository. Complex queries, joins, or multi-entity logic: custom repository.
2. **Colocated spec vs **tests**/?** → 1–2 specs: colocated. 3+ specs or shared fixtures/mocks: `__tests__/`.
3. **New shared utility?** → If used by 2+ modules: `src/shared/`. If module-specific: `src/<module>/utils/`.
4. **Validation in service vs DTO?** → Format and presence: DTO with class-validator. Business rules (e.g. "store must be open"): service.
5. **Facade + sub-services vs domain sub-modules?** → One controller and one route prefix: use a single `XxxModule` with a facade and `services/`. Multiple prefixes, separate Swagger surfaces, or strict DI boundaries: use nested `*Module` folders under `src/<domain>/` with the parent module as the only composer—see [docs/CONVENTIONS.md](docs/CONVENTIONS.md) — _Domain sub-modules_.

---

## Architecture Decisions (ADRs)

Create an ADR when: (a) introducing new technology or dependency, (b) changing a documented pattern, (c) making a multi-module decision. Use [docs/prompts/adr-checklist.md](docs/prompts/adr-checklist.md) to decide. Template: [docs/adr/000-index.md](docs/adr/000-index.md).

---

## References

- **Development workflow**: [docs/DEVELOPMENT_WORKFLOW.md](docs/DEVELOPMENT_WORKFLOW.md) — Full flow from issue creation to merge
- **Detailed conventions**: [docs/CONVENTIONS.md](docs/CONVENTIONS.md)
- **Technical plan template**: [docs/PLAN_TEMPLATE.md](docs/PLAN_TEMPLATE.md) — Canonical format for feature/audit plans executed by AI agents
- **Cursor rules**: `.cursor/rules/` — Context-specific rules per file type. The `always-apply.mdc` rule reinforces AGENTS.md; keep both in sync when updating Golden Rule, TypeScript, or Verification.
- **Store & subscription plans**: [docs/STORE_AND_SUBSCRIPTION_PLANS.md](docs/STORE_AND_SUBSCRIPTION_PLANS.md)
