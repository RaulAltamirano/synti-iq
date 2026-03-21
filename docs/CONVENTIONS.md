# Synti-IQ API — Technical Conventions

Technical conventions for developers and AI agents. Complements [AGENTS.md](../AGENTS.md).

---

## TypeScript

- **Strict mode**: `strict: true` in tsconfig. No `any` in production DTOs or services.
- **Return types**: Explicit return types on all public service methods.
- **Utility types**: Prefer `Partial<T>`, `Pick<T,K>`, `Omit<T,K>` for DTO derivation; use `Record<string, unknown>` for dynamic objects when no concrete type exists.
- **Generics**: Use for pagination (`PaginatedResponse<T>`), repositories, and reusable utilities.

---

## DTO Structure

### DTO Types

| Type | File Pattern | Purpose |
|------|--------------|---------|
| Create | `create-<entity>.dto.ts` | Required fields for creation |
| Update | `update-<entity>.dto.ts` | Optional fields; use `PartialType(CreateXDto)` |
| Filter | `filter-<entity>.dto.ts` | Query params for listings (pagination, sorting) |
| Response | `*-response.dto.ts` | Response payload shape |

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

---

## Error Handling

- Use Nest HTTP exceptions: `NotFoundException`, `BadRequestException`, `ForbiddenException`, `ConflictException`, `UnprocessableEntityException`
- Do not expose stack traces in production
- Validation errors are handled by `ValidationPipe` (400 Bad Request)

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

## TypeORM Entities

- File: `kebab-case.entity.ts` (e.g. `referral-code.entity.ts`)
- Class: PascalCase
- Table: `@Entity('snake_case_table')`
- Legacy: Some entities use snake_case filenames; new modules must use kebab-case.

### Relations

- Use `@OneToMany`, `@ManyToOne`, `@OneToOne`, `@ManyToMany` with explicit `@JoinColumn` on the owning side.
- Lazy loading: prefer `relations: ['relationName']` in `find*` options over `@OneToMany(() => Entity)` lazy default when querying in services.
- Avoid circular imports: use string form `() => Entity` for forward references.

### Indexes

- Add `@Index()` for columns used in WHERE or JOIN with high cardinality; avoid indexing low-cardinality enums unless filtered frequently.

---

## Guards, Pipes, Interceptors, Filters

| Type | File Pattern | Class Pattern |
|------|--------------|---------------|
| Guard | `kebab-case.guard.ts` | PascalCase + Guard |
| Pipe | `kebab-case.pipe.ts` | PascalCase + Pipe |
| Interceptor | `kebab-case.interceptor.ts` | PascalCase + Interceptor |
| Exception Filter | `kebab-case.filter.ts` | PascalCase + Filter |
| Decorator | `kebab-case.decorator.ts` | PascalCase (no suffix) |

Examples: `jwt-auth.guard.ts` → `JwtAuthGuard`, `parse-uuid.pipe.ts` → `ParseUuidPipe`.

---

## Repository Pattern

**When to use**:
- `@InjectRepository(Entity)`: simple CRUD, no custom query logic.
- Custom repository: complex queries, domain-specific finders, or abstractions over multiple entities.

**Custom repository**:
- Location: `repositories/` within the module (e.g. `src/user-session/user-session.repository.ts`, `src/cashier-schedule-assignment/repositories/`).
- Class extends or implements a repository interface.
- Register in module: `TypeOrmModule.forFeature([Entity])` plus explicit provider if using interface injection.
- Define interface in `interfaces/` when injecting by contract (e.g. `IInventoryRepository`).

**References**:
- `src/store/store.service.ts` — uses `@InjectRepository` and store repository
- `src/user-session/user-session.repository.ts` — custom repository
- `src/cashier-schedule-assignment/repositories/` — custom repository pattern
- `src/inventory/interfaces/inventory-repository.interface.ts` — repository interface

### Transactions

- Use `@InjectDataSource()` or `@InjectRepository().manager` when multiple writes must succeed or fail together
- Wrap in `dataSource.transaction(async (manager) => { ... })` for: creating related entities in one request, inventory updates + sale creation, any operation touching 2+ tables that must be atomic
- Do not use transactions for read-only operations or single-entity writes

---

## Factories

- Location: `factories/` within the module (e.g. `src/cashier-schedule-assignment/factories/assignment.factory.ts`).
- Purpose: creation of complex entities, domain object builders, or test fixtures.
- Use when entity construction involves multiple steps or conditional logic.

**Reference**: `src/cashier-schedule-assignment/factories/`

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

**Barrel files**: Use `index.ts` in `fixtures/`, `mocks/`, `constants/` to re-export. Do not barrel-export from `dto/` or `entities/` (avoid circular imports).

**Canonical template**: [src/_template/](../src/_template/) — Reference module with observability, pagination, DTOs, metrics service, `__tests__/` structure, and endpoint docs. Use when creating new modules with pagination, filtered queries, or observability.

---

## Architecture

**Layering**: Controller → Service → Repository. Controllers must remain thin; delegate all business logic to services. Controllers must NOT inject or call repositories directly. Services contain business logic and orchestrate repositories. No skipping layers. See AGENTS.md Anti-Patterns.

**Cross-module**: Use module exports. Service A in Module X can use Service B from Module Y only if Module Y exports Service B.

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
- Reference: [src/_template/constants/template-span.constants.ts](../src/_template/constants/template-span.constants.ts)

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

**Rule**: New modules with domain logic → start with colocated spec; migrate to `__tests__/` when adding 3+ specs or shared fixtures. Reference: [src/_template/__tests__/](../src/_template/__tests__/)

### Naming

| Context | Pattern | Example |
|---------|---------|---------|
| Colocated | `{source-basename}.spec.ts` | `cache.service.spec.ts`, `create-store.dto.spec.ts` |
| `__tests__/` | Same pattern, mirror path | `__tests__/referral.service.spec.ts`, `__tests__/utils/format-user-name.util.spec.ts` |
| e2e | `*.e2e-spec.ts` in `test/` | `test/auth.e2e-spec.ts` |

- `describe('ServiceName')`, `it('returns X when Y')`
- Fixtures: `createUserFixture({ email: 'test@example.com' })`
- Mocks: `createMockObservabilityService()`

### Coverage

- **Services**: Unit tests required for services with domain logic (queries, calculations, validation, orchestration). Controllers may be tested via e2e or by testing the service they delegate to.
- **DTOs**: Complex DTOs (custom validators, transform logic) — test with `plainToInstance` + `validate` from class-transformer/class-validator.
- **Utils**: Pure functions in `utils/` — unit tests required.
- In tests, `any` is allowed with `// eslint-disable-next-line @typescript-eslint/no-explicit-any` when needed for mocks; prefer typed mocks.

Reference: [src/_template/__tests__/](../src/_template/__tests__/)

---

## Logging

**Full reference**: [docs/LOGGING.md](LOGGING.md)

- Use NestJS `Logger` (`@nestjs/common`); never `console.log` / `console.error` / `console.warn`
- Services: `private readonly logger = new Logger(ServiceName.name)` (instance, not static)
- Levels: `error` (failures), `warn` (recoverable), `log` (info), `debug` (dev only)
- Error signature: `this.logger.error(message, stack?, context?)` — third param is context string (class name), not an object
- In catch blocks: log context and stack; never log sensitive data (PII: emails, names, tokens)
- Reference module: [src/_template/](../src/_template/)

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
- [src/_template/__tests__/README.md](../src/_template/__tests__/README.md) — Example test structure
