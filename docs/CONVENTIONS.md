# Synti-IQ API — Technical Conventions

Technical conventions for developers and AI agents. Complements [AGENTS.md](../AGENTS.md).

**Summary:** TypeScript strict mode, class-validator DTOs, REST + Swagger, pagination via `PaginatedResponse<T>`, caching with two TTL-distinct systems, typed catch blocks, NestJS Logger, observability with `withSpan`, module structure per [src/\_template/](../src/_template/).

---

## TypeScript

- **Strict mode**: `strict: true` in tsconfig. No `any` in production DTOs or services.
- **Return types**: Explicit return types on all public service methods. Private methods in services and repositories must also declare an explicit return type when the inference is non-obvious (business logic, query builders, helpers returning entities or DTOs).
- **Utility types**: Prefer `Partial<T>`, `Pick<T,K>`, `Omit<T,K>` for DTO derivation; use `Record<string, unknown>` for dynamic objects when no concrete type exists.
- **Generics**: Use for pagination (`PaginatedResponse<T>`), repositories, and reusable utilities.

---

## DTO Structure

### DTO Types

| Type     | File Pattern             | Purpose                                         |
| -------- | ------------------------ | ----------------------------------------------- |
| Create   | `create-<entity>.dto.ts` | Required fields for creation                    |
| Update   | `update-<entity>.dto.ts` | Optional fields; use `PartialType(CreateXDto)`  |
| Filter   | `filter-<entity>.dto.ts` | Query params for listings (pagination, sorting) |
| Response | `*-response.dto.ts`      | Response payload shape                          |

### Mapped Types

- Use **`@nestjs/swagger`** (`PartialType`, `PickType`, etc.) for Create, Update, and Response DTOs that appear in Swagger. This keeps the OpenAPI schema in sync.
- Use **`@nestjs/mapped-types`** only for internal DTOs (e.g. filter params, internal pipeline types) that do not appear in API docs.
- For a given entity: use one source for its Create/Update/Response family. Do not mix `@nestjs/swagger` and `@nestjs/mapped-types` for the same DTO hierarchy.

```typescript
import { PartialType } from '@nestjs/swagger';

export class UpdateStoreDto extends PartialType(CreateStoreDto) {}
```

Also: `PickType()`, `OmitType()`, `IntersectionType()`.

### Validation

- Decorators: `@IsString()`, `@IsNumber()`, `@IsUUID()`, `@IsEmail()`, `@IsEnum()`, `@IsOptional()`
- Constraints: `@Min()`, `@Max()`, `@MinLength()`
- Nested objects: `@Type(() => NestedDto)` and `@ValidateNested()`
- Avoid `any`; use `Record<string, unknown>` for dynamic structures
- Optional properties: always use `@IsOptional()`; combine with type decorators (e.g. `@IsOptional() @IsString()`)

---

## Enums

- **File**: `kebab-case.enum.ts` inside an `enums/` folder within the module (e.g. `src/store/enums/store-status.enum.ts`).
- **Naming**: TypeScript `enum` with PascalCase name and SCREAMING_SNAKE_CASE values:
  ```typescript
  export enum StoreStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
  }
  ```
- **String enums** are preferred over numeric so values are readable in the database and API responses.
- Use `@IsEnum(MyEnum)` in DTOs that accept enum values.
- Export from the module's `constants/index.ts` barrel only if widely used; otherwise import directly from the enum file.

---

## Constants

- **File**: `kebab-case.constants.ts` inside a `constants/` folder within the module (e.g. `src/store/constants/store-cache.constants.ts`).
- **Naming**: `SCREAMING_SNAKE_CASE` for all exported constants.
- **Barrel**: Re-export from `constants/index.ts` so consumers can `import { X } from 'src/module/constants'`.
- **Do not inline** magic numbers or strings in services; extract to a constants file with a descriptive name.

```typescript
// src/store/constants/store-cache.constants.ts
export const STORE_LIST_CACHE_TTL_MS = 300_000; // 5 min — cache-manager v5 (ms)
```

---

## REST Conventions

- **Routes**: kebab-case for multi-word resources (e.g. `/user-sessions`, `/cashier-schedules`)
- **HTTP verbs**: `GET` (read), `POST` (create), `PATCH` (partial update), `DELETE` (remove). Prefer `PATCH` over `PUT` for partial updates.
- **Status codes**: 200 (OK), 201 (Created), 204 (No Content), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 409 (Conflict), 422 (Unprocessable Entity)

### Response Envelope

- **Success (single resource)**: Return entity/DTO directly (no wrapper). Use `@ApiResponse` with the DTO type.
- **Success (collection, paginated)**: Use `PaginatedResponse<T>` from `src/pagination/interfaces/PaginatedResponse.ts` — properties: `items`, `total`, `page`, `totalPages`, `limit`.
- **Success (list, non-paginated)**: Return array of DTOs directly when pagination is not used.
- **Error**: Nest HTTP exceptions; no custom wrapper. Validation errors → 400 with ValidationPipe default shape.
- Do not wrap successful responses in `{ data: T }` unless an existing endpoint already uses it; prefer direct return.

---

## Swagger

### Tags

- PascalCase: `Store`, `UserSession`, `CashierSchedule`
- Each tag needs a description in `DocumentBuilder.addTag()`

### Endpoint Documentation

- Interface: `EndpointDocSpec` in `src/shared/decorators/interfaces/endpoint-doc-spec.interface.ts`
- Properties: `summary`, `responses`, `body`, `params`, `query`, `cookieAuth`
- Spec files: `src/docs/<module>.endpoints.ts` with `Record<string, EndpointDocSpec>`
- Apply via `ApiDoc(docs, endpointId)` on controller methods
- **List endpoints (query params)**: `query` uses a manual array of `ParamSpec` (`name`, `description`, `type`). The Filter DTO is used at runtime by the controller; the spec documents each query param explicitly. Reference: [src/docs/template.endpoints.ts](../src/docs/template.endpoints.ts) `list` endpoint.

```typescript
export const storeEndpoints: Record<string, EndpointDocSpec> = {
  create: {
    summary: 'Create a new store',
    body: CreateStoreDto,
    cookieAuth: true,
    responses: [
      { status: 201, description: 'Store created', type: StoreResponseDto },
      { status: 400, description: 'Invalid input' },
    ],
  },
};
```

### DTO Properties in Swagger

- Decorate **every** DTO property that appears in the Swagger schema with `@ApiProperty()` or `@ApiPropertyOptional()`.
- `@ApiProperty()` — required field. Include `description`, `type`, and `example` where helpful.
- `@ApiPropertyOptional()` — optional field (equivalent to `@ApiProperty({ required: false })`).
- Use `enum` option for enum types: `@ApiProperty({ enum: StoreStatus })`.

```typescript
@ApiProperty({ description: 'Store display name', example: 'Downtown Branch' })
@IsString()
name: string;

@ApiPropertyOptional({ description: 'Max concurrent cashiers', example: 5 })
@IsOptional()
@IsNumber()
maxCashiers?: number;
```

---

## Error Handling

- Use Nest HTTP exceptions: `NotFoundException`, `BadRequestException`, `ForbiddenException`, `ConflictException`, `UnprocessableEntityException`
- Do not expose stack traces in production
- Validation errors are handled by `ValidationPipe` (400 Bad Request)

### Catch blocks (TypeScript strict mode)

Always type the caught value as `unknown` and narrow before use:

```typescript
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const stack   = error instanceof Error ? error.stack   : undefined;
  this.logger.error('Description of the operation', stack);
  if (error instanceof HttpException) throw error; // never wrap an HttpException
  throw new InternalServerErrorException(message);
}
```

- **Never** wrap an `HttpException` in another exception — rethrow it directly so the original status code is preserved.
- If a `catch` block has no recovery logic (no fallback, no retry), omit it entirely and let the exception propagate naturally.

---

## Security

- **Rate limiting**: Global `ThrottlerGuard` configured in `src/core/app.module.ts` (`ttl: 60`, `limit: 10`).
- **Auth**: JWT RS256, cookie `access_token` for protected endpoints. Document with `ApiCookieAuth('access_token')` in endpoint specs.
- Do not expose stack traces in production. Do not log sensitive data (passwords, tokens, PII).

---

## Pagination

**Canonical class**: `BasePaginationParams` in `src/pagination/dtos/base-pagination-params.ts`

- Defaults: `page=1`, `limit=10`, `sortBy='createdAt'`, `sortOrder='DESC'`
- `limit` max: 100
- Filter DTOs extend this class when they support pagination
- Validate `sortBy` against allowed domain fields with `@IsIn([...])` in filter DTOs

**Response contract**: `PaginatedResponse<T>` in `src/pagination/interfaces/PaginatedResponse.ts`

- Properties: `items`, `total`, `page`, `totalPages`, `limit`, `hasNextPage?`, `hasPreviousPage?`

---

## Caching

The project uses **two cache systems** with different TTL semantics. Mixing them up is a source of silent bugs.

| System                                        | Inject                   | TTL unit         | When to use                                                       |
| --------------------------------------------- | ------------------------ | ---------------- | ----------------------------------------------------------------- |
| `cache-manager` v5+ (`@nestjs/cache-manager`) | `@Inject(CACHE_MANAGER)` | **milliseconds** | HTTP-layer data: paginated lists, permissions, role lookups       |
| `RedisService` (ioredis, uses `EX` flag)      | constructor injection    | **seconds**      | Auth sessions, tokens, short-lived keys with direct Redis control |

### TTL constants

Always extract TTLs to named constants in `constants/<module>-cache.constants.ts`. Never inline magic numbers:

```typescript
// src/permission/constants/permission-cache.constants.ts
export const USER_PERMISSIONS_CACHE_TTL_MS = 300_000; // 5 min — cache-manager (ms)
export const USER_SESSION_TTL_S = 3_600; // 1h   — RedisService (seconds)
```

**Canonical reference**: `src/permission/constants/permission-cache.constants.ts`

### Key naming

Pattern: `{domain}:{entity}:{id}` in lowercase, colon-separated:

```
user:role:{userId}
user:permissions:{userId}
store:{version}:{hash}
user:{userId}
```

### Invalidation

- Invalidate **after mutations** (`assignRole`, `updateRole`, `save`). Never query the DB to verify freshness on every cache hit — trust the TTL.
- Expose an `invalidate*Cache(id)` method from the owning service when other services may trigger invalidation (see `PermissionService.invalidateUserPermissionsCache`).

---

## TypeORM Entities

- File: `kebab-case.entity.ts` (e.g. `referral-code.entity.ts`)
- Class: PascalCase
- Table: `@Entity('snake_case_table')`
- Legacy: Some entities use snake_case filenames; new modules must use kebab-case.

### Primary Keys

- **UUID** (`@PrimaryGeneratedColumn('uuid')`): domain entities that are multi-tenant or exposed as route params in the REST API (e.g. `users`, `stores`, `cashier_profiles`, `business_profiles`).
- **Integer** (`@PrimaryGeneratedColumn()`): configuration catalogs not directly exposed as route params (e.g. `roles`, `permissions`, `permission_groups`).
- Rule of thumb: if the ID appears as `:id` in a REST endpoint, use UUID.

### Column naming (PostgreSQL)

- **Database column names**: `snake_case` (e.g. `user_id`, `created_at`, `is_approved`, `last_activity_at`). Aligns with SQL, raw queries, and typical PostgreSQL tooling.
- **TypeScript property names**: `camelCase` (e.g. `userId`, `createdAt`, `isApproved`, `lastActivityAt`).
- **Mapping**: use `@Column({ name: 'snake_case_column' })` (or equivalent options on `@CreateDateColumn`, `@JoinColumn`, etc.) so the property name and the physical column name stay explicit.
- **Boolean columns**: prefix `is_` in the database (`is_approved`, `is_active`, `is_online`); camelCase `is` prefix in TypeScript (`isApproved`, `isActive`, `isOnline`).
- **Shared blocks**: when multiple profile tables expose the same approval/activity fields, extend `ProfileApprovalLifecycleColumns` from `src/shared/entities/profile-approval-lifecycle.columns.ts` (e.g. cashier, delivery, provider profiles) instead of duplicating decorators.

### Soft delete

- Use `@DeleteDateColumn({ name: 'deleted_at' })` on domain entities that require audit trails (users, stores, profiles).
- **Always** filter with `deletedAt: IsNull()` in domain queries. Never omit this filter accidentally.
- Use `.withDeleted()` or `{ withDeleted: true }` only when explicitly accessing deleted records (admin, audit endpoints).
- Use hard delete (no `@DeleteDateColumn`) for configuration catalogs (`roles`, `permissions`) and join tables.

### Relations

- Use `@OneToMany`, `@ManyToOne`, `@OneToOne`, `@ManyToMany` with explicit `@JoinColumn` on the owning side.
- Lazy loading: prefer `relations: ['relationName']` in `find*` options over `@OneToMany(() => Entity)` lazy default when querying in services.
- Avoid circular imports: use string form `() => Entity` for forward references.

### Indexes

- Add `@Index()` for columns used in WHERE or JOIN with high cardinality; avoid indexing low-cardinality enums unless filtered frequently.

---

## Database lifecycle

- **`synchronize: true`**: development and test environments only. Never against a production database — it can drop columns or tables on entity changes.
- **Production**: set `synchronize: false`. Generate migrations with `typeorm migration:generate`, apply with `typeorm migration:run`.
- Reference: `src/database/database.config.ts` for the current configuration.

---

## Guards, Pipes, Interceptors, Filters

| Type             | File Pattern                | Class Pattern            |
| ---------------- | --------------------------- | ------------------------ |
| Guard            | `kebab-case.guard.ts`       | PascalCase + Guard       |
| Pipe             | `kebab-case.pipe.ts`        | PascalCase + Pipe        |
| Interceptor      | `kebab-case.interceptor.ts` | PascalCase + Interceptor |
| Exception Filter | `kebab-case.filter.ts`      | PascalCase + Filter      |
| Decorator        | `kebab-case.decorator.ts`   | PascalCase (no suffix)   |

Examples: `jwt-auth.guard.ts` → `JwtAuthGuard`, `parse-uuid.pipe.ts` → `ParseUuidPipe`.

---

## Repository Pattern

**When to use**:

- `@InjectRepository(Entity)`: simple CRUD, no custom query logic.
- Custom repository: complex queries, domain-specific finders, or abstractions over multiple entities.

**Custom repository**:

- Location: `repositories/` within the module (e.g. `src/user-session/user-session.repository.ts`).
- Class extends or implements a repository interface.
- Register in module: `TypeOrmModule.forFeature([Entity])` plus explicit provider if using interface injection.
- Define interface in `interfaces/` when injecting by contract (e.g. `IInventoryRepository`).

**References**:

- `src/store/services/store-query.service.ts` — uses `@InjectRepository` with query builder
- `src/user-session/user-session.repository.ts` — custom repository
- `src/inventory/interfaces/inventory-repository.interface.ts` — repository interface

### Transactions

- Use `@InjectDataSource()` or `@InjectRepository().manager` when multiple writes must succeed or fail together
- Wrap in `dataSource.transaction(async (manager) => { ... })` for: creating related entities in one request, inventory updates + sale creation, any operation touching 2+ tables that must be atomic
- Do not use transactions for read-only operations or single-entity writes

---

## Factories

- Location: `factories/` within the module (e.g. `src/user-profile/factories/profile.factory.ts`).
- Purpose: creation of complex entities, domain object builders, or test fixtures.
- Use when entity construction involves multiple steps or conditional logic.

**Reference**: `src/user-profile/` — `ProfileFactoryService` dispatches to role-specific strategies.

---

## Project Structure

```
src/<module-name>/
├── dto/                  # Create, Update, Filter, Response DTOs
├── entities/             # TypeORM entities
├── interfaces/           # Types and repository contracts (optional)
├── enums/                # Module enums (optional)
├── constants/            # Span/attribute constants (optional)
├── repositories/        # Custom repositories (optional)
├── factories/            # Entity/domain builders (optional)
├── services/             # Additional services (optional)
├── <module-name>.controller.ts
├── <module-name>.service.ts
├── <module-name>.module.ts
└── *.spec.ts            # Colocated or __tests__/ for complex modules
```

Shared utilities: `src/shared/` (pagination, logger, decorators, interceptors, observability)

**Barrel files**: Use `index.ts` in `fixtures/`, `mocks/`, `constants/` to re-export. Do not barrel-export from `dto/` or `entities/` (avoid circular imports). Do not barrel-export from `services/` — import each sub-service by its full path and register it explicitly in `providers` in the module.

**Large domains**: For multiple route prefixes under one folder, see **Domain sub-modules** under [Architecture](#architecture) below (`src/auth/` is the reference).

**Canonical template**: [src/\_template/](../src/_template/) — Reference module with observability, pagination, DTOs, metrics service, `__tests__/` structure, and endpoint docs. Use when creating new modules with pagination, filtered queries, or observability.

**Template checklist** (when using or updating the template):

- `findById` — throw `NotFoundException` when resource not found (404); never return `null`
- `:id` params — use `ParseUUIDPipe` for validation (`@Param('id', ParseUUIDPipe)`)
- DTOs in Swagger — add `@ApiProperty` / `@ApiPropertyOptional` for schema documentation

---

## Architecture

**Layering**: Controller → Service → Repository. Controllers must remain thin; delegate all business logic to services. Controllers must NOT inject or call repositories directly. Services contain business logic and orchestrate repositories. No skipping layers. See AGENTS.md Anti-Patterns.

**Cross-module**: Use module exports. Service A in Module X can use Service B from Module Y only if Module Y exports Service B.

### Async parallelism

Use `Promise.all([...])` when multiple async operations are **data-independent** (no result from one is needed by another):

```typescript
// Bad — unnecessarily sequential
const profile = await this.getUserProfile(userId);
const approvalStatus = await this.getApprovalStatus(userId, role);
const isOnline = await this.getOnlineStatus(userId, role);

// Good — parallel
const [profile, approvalStatus, isOnline] = await Promise.all([
  this.getUserProfile(userId),
  this.getApprovalStatus(userId, role),
  this.getOnlineStatus(userId, role),
]);
```

Do not use `Promise.all` when one result feeds into the next call.

### Service size and splitting

Split a service into sub-services when it has **more than one primary responsibility** or exceeds ~250 lines of business logic (excluding imports and constructor).

Recommended pattern: **facade + sub-services** under `services/`:

- The main service (`user.service.ts`) delegates to sub-services (`user-filters.service.ts`, `user-creation.service.ts`, `user-role-mutation.service.ts`).
- The facade preserves the public contract so consumers (guards, other modules) do not change.
- Each sub-service handles one cohesive responsibility and can be tested in isolation.

**References**: `src/user/` and `src/store/` — applied examples of facade + sub-services.

### Domain sub-modules (nested `*Module` within one folder)

Use this pattern when one bounded context (e.g. authentication) needs **multiple HTTP route prefixes** (different `@Controller()` roots), **separate Swagger tags**, or a **hard boundary** to avoid circular dependencies—while still shipping as a single feature area under `src/<domain>/`.

**Contrast with facade + sub-services** (previous subsection):

| Approach             | Nest modules                            | Controllers        | Typical use                                 |
| -------------------- | --------------------------------------- | ------------------ | ------------------------------------------- |
| Facade + `services/` | One `XxxModule`                         | Usually one        | Split implementation; single API surface    |
| Domain sub-modules   | Several `*Module` under `src/<domain>/` | One per sub-module | Split **public routes** and imports/exports |

**Layout** (example; names vary by domain):

```
src/auth/
├── auth.module.ts              # Parent: imports sub-modules, registers shared providers
├── auth.controller.ts          # Core routes only (e.g. login, signup)
├── auth.service.ts             # Facade for orchestration consumed by guards/strategies
├── two-factor/
│   ├── two-factor.module.ts
│   ├── two-factor.controller.ts
│   └── two-factor.service.ts
├── session/
│   └── ...
├── account-invitation/
│   └── ...
├── services/                   # Internal providers not exported (optional)
└── dto/, entities/, guards/, ...
```

**Rules**

1. **No imports between sibling sub-modules** — only the parent `*Module` imports them. Prevents circular dependency graphs.
2. **Shared internals** — helpers used exclusively inside the domain live under `services/` (or similar), are registered in the parent module, and are **not** exported unless another top-level module must inject them (then prefer a dedicated exported service or rethink boundaries).
3. **DTO ownership** — DTOs belong in the sub-module that owns the route (`<sub-module>/dto/`). Share types via `src/<domain>/dto/` or `interfaces/` only when two sub-modules need the same contract.
4. **Exports** — Re-export sub-modules from the parent when consumers need injected services (`exports: [SubModuleA, SubServiceB]`). Keep exports minimal.
5. **API docs** — Use `src/docs/<area>.endpoints.ts` (or split files per prefix) and `@ApiDoc` on each controller method.

**When not to use** — A single route prefix and one controller: use one module + facade + sub-services under `services/` instead.

**Reference**: `src/auth/` — `AuthModule` composes `TwoFactorModule`, `SessionModule`, and `AccountInvitationModule`; JWT strategies and shared session/token helpers stay in `auth/services/` and sibling folders.

### Anti-Patterns (Do Not)

- Controllers with business logic
- Services calling other modules' repositories directly (use exported services)
- DTOs without class-validator on every property
- `forwardRef()` without first attempting structural refactor
- Exposing stack traces or PII in API responses

---

## Observability (OpenTelemetry)

Service: `src/shared/observability/observability.service.ts`

### Tracing

`withSpan` signature:

```typescript
withSpan<T>(
  name: string,
  fn: (span: Span) => Promise<T>,
  options?: SpanContextOptions
): Promise<T>
```

- `options.attributes`: optional initial attributes for the span.
- Use inside critical operations:

```typescript
return this.observabilityService.withSpan(SPAN_NAMES.OPERATION, async span => {
  span.setAttribute(ATTR_NAMES.USER_ID, userId);
  return await this.computeResult();
});
```

- Define span and attribute names in `constants/<module>-span.constants.ts`
- Follow OpenTelemetry semconv: `module.operationName`, `module.attribute_name`
- Reference: [src/\_template/constants/template-span.constants.ts](../src/_template/constants/template-span.constants.ts)

### Metrics

- Domain-specific `*MetricsService`: inject `ObservabilityService`, register counters/histograms in `onModuleInit`
- Prometheus naming: `referral_validations_total`, `http_request_duration_seconds`

### Tests

- Mock with `createMockObservabilityService()`; `withSpan` must run the callback: `withSpan: jest.fn((_name, fn) => fn(mockSpan))`

---

## Testing

### Structure

**Colocated** (`*.spec.ts` next to source): Single spec per module, no shared fixtures or mocks (e.g. `cache.service.spec.ts`, `create-store.dto.spec.ts`).

**`__tests__/` folder**: Use when the module has 3+ specs, shared fixtures, shared mocks, or specs that mirror subfolders (`services/`, `utils/`). Structure:

```
src/<module>/
├── __tests__/
│   ├── fixtures/       # create*Fixture(overrides?) — export from index.ts
│   ├── mocks/          # createMockObservabilityService(), etc.
│   ├── services/       # specs mirroring src/services/
│   ├── utils/          # specs mirroring src/utils/
│   └── README.md
├── services/
└── utils/
```

**Rule**: New modules with domain logic → start with colocated spec; migrate to `__tests__/` when adding 3+ specs or shared fixtures. Reference: [src/\_template/**tests**/](../src/_template/__tests__/)

### Naming

| Context      | Pattern                     | Example                                                                               |
| ------------ | --------------------------- | ------------------------------------------------------------------------------------- |
| Colocated    | `{source-basename}.spec.ts` | `cache.service.spec.ts`, `create-store.dto.spec.ts`                                   |
| `__tests__/` | Same pattern, mirror path   | `__tests__/referral.service.spec.ts`, `__tests__/utils/format-user-name.util.spec.ts` |
| e2e          | `*.e2e-spec.ts` in `test/`  | `test/auth.e2e-spec.ts`                                                               |

- `describe('ServiceName')`, `it('returns X when Y')`
- Fixtures: `createUserFixture({ email: 'test@example.com' })`
- Mocks: `createMockObservabilityService()`

### Coverage

- **Services**: Unit tests required for services with domain logic (queries, calculations, validation, orchestration). Controllers may be tested via e2e or by testing the service they delegate to.
- **DTOs**: Complex DTOs (custom validators, transform logic) — test with `plainToInstance` + `validate` from class-transformer/class-validator.
- **Utils**: Pure functions in `utils/` — unit tests required.
- **Coverage threshold**: 70% minimum for statements, branches, functions, and lines. Run `yarn test:cov` to verify. CI enforces this threshold.
- In tests, `any` is allowed with `// eslint-disable-next-line @typescript-eslint/no-explicit-any` when needed for mocks; prefer typed mocks.

Reference: [src/\_template/**tests**/](../src/_template/__tests__/)

---

## Logging

**Full reference**: [docs/LOGGING.md](LOGGING.md)

- Use NestJS `Logger` (`@nestjs/common`); never `console.log` / `console.error` / `console.warn`
- Services: `private readonly logger = new Logger(ServiceName.name)` (instance, not static)
- Levels: `error` (failures), `warn` (recoverable), `log` (info), `debug` (dev only)
- Error signature: `this.logger.error(message, stack?, context?)` — third param is context string (class name), not an object
- In catch blocks: log context and stack; never log sensitive data (PII: emails, names, tokens)
- **Canonical reference**: [src/\_template/template.service.ts](../src/_template/template.service.ts); [src/referral/referral.service.ts](../src/referral/referral.service.ts) for advanced patterns (debug, ForbiddenException)

---

## Technical Plan Creation

Plans are executed by AI coding agents (Cursor, Windsurf, Graviti). They require deterministic paths and contracts.

**Canonical template**: [docs/PLAN_TEMPLATE.md](PLAN_TEMPLATE.md)

- **Plan location**: `.cursor/plans/` (Cursor) or project root; naming: `kebab-case.plan.md`
- **Frontmatter** (Cursor plans): `name`, `overview`, `todos`, `isProject`
- **Golden Rule**: Stop and ask before assuming DB relations, entity names, or third-party behavior

**Structure**: `Technical Understanding` | `Blocking Questions` | `Assumptions and Contracts` | `Implementation Plan` (file-oriented) | `Testing Plan` | `Technical Debt Prevention`

**Order of implementation**: Interfaces/DTOs → Entities → Services → Controllers → Module registration (avoids compilation errors).

**File paths**: Absolute from repo root (e.g. `src/module/dto/create-entity.dto.ts`).

---

## References

- [AGENTS.md](../AGENTS.md) — Quick reference for agents
- [PLAN_TEMPLATE.md](PLAN_TEMPLATE.md) — Technical plan creation template
- [STORE_AND_SUBSCRIPTION_PLANS.md](STORE_AND_SUBSCRIPTION_PLANS.md) — Subscription limits and store behavior
- [src/\_template/**tests**/README.md](../src/_template/__tests__/README.md) — Example test structure
