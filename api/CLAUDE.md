# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
yarn start:dev           # Watch mode
yarn start:debug         # Debug mode

# Quality (run all before considering a task complete)
yarn build               # TypeScript compilation — must pass
yarn lint                # ESLint + auto-fix
yarn lint:check          # ESLint without fixing
yarn format:check        # Prettier check
yarn test                # Unit tests (Jest, rootDir: src/)
yarn test:watch          # Watch mode
yarn test:cov            # Coverage report (70% threshold: statements/branches/functions/lines)
yarn test:e2e            # End-to-end tests

# Run a single test file
yarn test -- --testPathPattern="store.service"

# Postman
yarn postman:build       # Regenerate Synti-IQ-API.postman_collection.json from postman/collections/

# Database seeds
yarn seed:all            # Seed permissions, groups, roles, users, subscription plans
```

**Verification order after any change:** `yarn build` → `yarn lint` → `yarn test` → `yarn format:check`

## Architecture

### Module structure

Each feature module follows the controller → service → repository layering:

```
src/<module>/
├── __tests__/           # Use when ≥3 specs or shared fixtures exist
│   ├── fixtures/        # createXFixture(overrides?) exported from index.ts
│   ├── mocks/           # createMockObservabilityService(), etc.
│   └── services/        # specs mirroring src/services/
├── constants/           # <module>-span.constants.ts for OpenTelemetry
├── dto/                 # create-, update-, filter-, *-response- DTOs
├── entities/            # TypeORM @Entity classes
├── repositories/        # Custom repos when queries are complex
├── services/            # Split services (when >1 service)
├── <module>.controller.ts
├── <module>.service.ts
└── <module>.module.ts
```

`src/_template/` is the **canonical reference module** — copy it when creating new modules that involve pagination, observability, or multiple services. It is not registered in `AppModule`.

### Multi-tenant user-profile system

User creation follows a **strategy pattern** in `src/user-profile/`:

- `ProfileFactoryService` dispatches to role-specific strategies (CashierProfileStrategy, BusinessOwnerStrategy, etc.)
- `ProfileCreationContext` carries cross-cutting concerns like `actingBusinessProfileId` (required for CASHIER — prevents cross-business assignment)
- `UserProfile` is the polymorphic join table; `profileId` points to a role-specific table (e.g. `cashier_profiles`)

When creating a CASHIER user, the caller must supply `actingBusinessProfileId` scoped to the owning store's business profile.

### Authentication flow

- JWT RS256 (asymmetric). Keys generated via `./scripts/generate-keys.sh`, stored in `keys/` (gitignored).
- Access token in cookie `access_token`. Refresh via `POST /auth/refresh`.
- 2FA: TOTP-based, backup codes supported. Guarded by `TwoFactorGuard`.
- Cashier onboarding: `POST /store/:id/cashiers/accounts` creates user with `pendingPasswordSetup: true`, stores SHA-256 invitation token in `account_invitations`, sends React Email via Resend. Cashier completes setup via `POST /invitations/accept`.

### Database

- TypeORM 0.3 with `autoLoadEntities: true` and `synchronize: true` (schema auto-synced from entities — no migrations directory).
- Entities must be registered in their module's `TypeOrmModule.forFeature([...])` to be auto-loaded.
- Use transactions + pessimistic locking for multi-step writes (see `AccountInvitationService` as reference).

### Observability

Wrap critical service operations with `ObservabilityService.withSpan()`. Define span names in `constants/<module>-span.constants.ts` using the format `module.operationName`. See `src/_template/` and `src/store/constants/store-span.constants.ts`.

### Swagger / API docs

- Endpoint specs live in `src/docs/<module>.endpoints.ts` as `Record<string, EndpointDocSpec>`.
- Apply to controllers with the `@ApiDoc(docs, endpointId)` decorator.
- Swagger UI: `http://localhost:3000/api/docs`
- Postman collection is modular: edit `postman/collections/`, run `yarn postman:build`.

### Pagination

Use `BasePaginationParams` (`src/pagination/dtos/base-pagination-params.ts`) for query params and `PaginatedResponse<T>` (`src/pagination/interfaces/PaginatedResponse.ts`) for responses. Do not introduce ad-hoc pagination shapes.

### Mail

`MailModule.forRootAsync` is configured in `AppModule`. Templates are React Email components in `src/mail/templates/`. Sandbox delivery routing is handled by `src/mail/utils/resolve-mail-to.util.ts` — override target via `MAIL_FORCE_DELIVER_TO` env var.

## Key Conventions

- **Imports**: Use `src/` prefix for cross-module imports; relative (`./`, `../`) only within the same module.
- **No `any`** in production DTOs or services. Use `Record<string, unknown>` for dynamic objects.
- **Logging**: `private readonly logger = new Logger(ClassName.name)` — never `console.log`.
- **HTTP exceptions**: `NotFoundException` (404), `BadRequestException` (400), `ForbiddenException` (403), `ConflictException` (409), `UnprocessableEntityException` (422).
- **DTO mapped types**: Use `@nestjs/swagger`'s `PartialType`/`PickType`/`OmitType` for DTOs that appear in Swagger; `@nestjs/mapped-types` only for internal-only DTOs.
- **PATCH over PUT** for partial updates.
- **Response shape**: Return entity/DTO directly (no `{ data: T }` wrapper) unless an existing endpoint already uses it.
- **Tests**: Colocated `*.spec.ts` for single specs; migrate to `__tests__/` when adding 3+ specs or shared fixtures.

## When to stop and ask

- Database schema changes (new tables, column types, relations)
- New npm packages
- Ambiguous business rules or domain logic
- Circular dependency resolutions (prefer structural refactors over `forwardRef`)
- Changes to `BasePaginationParams` or `PaginatedResponse` (affect all paginated modules)
